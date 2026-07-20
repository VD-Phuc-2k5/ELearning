# DEPLOYMENT GUIDELINE — LearningHub

## Quick Reference

```bash
# Test
pnpm nx run-many --target=test --projects=api,LearningHub,AdminPage
pnpm test:e2e                              # needs app running at localhost:3002

# Lint
pnpm nx run-many --target=lint --projects=api,LearningHub,AdminPage --parallel=3

# Build
pnpm nx run-many --target=build --projects=api,LearningHub,AdminPage --parallel=3

# Docker
docker compose up -d                        # start everything
docker compose ps                           # check status
docker compose logs -f api                  # watch API logs
docker compose down -v                      # stop + remove volumes
```

---

## Docker Architecture

```
Browser → nginx:8080 (LearningHub) / nginx:8081 (AdminPage)
  ├── /api/*          → api:8080
  ├── /socket.io/*    → api:8080 (WebSocket)
  ├── /_next/*        → learninghub:3002
  └── /               → learninghub:3002

Internal: learninghub:3002 → api:8080 (via NEST_API_URL)
          adminpage:3001   → api:8080 (via NEST_API_URL)
```

| Service     | Port (host) | Port (internal) | Replicas | Health               |
| ----------- | ----------- | --------------- | -------- | -------------------- |
| nginx       | 8080, 8081  | 80, 81          | 1        | —                    |
| api         | —           | 8080            | 1        | `/health` (DB+Redis) |
| postgres    | 5432        | 5432            | 1        | `pg_isready`         |
| redis       | 6379        | 6379            | 1        | `redis-cli ping`     |
| learninghub | —           | 3002            | 2        | `/` (HTTP 200)       |
| adminpage   | —           | 3001            | 2        | `/` (HTTP 200)       |
| jenkins     | 8088        | 8080            | 1        | —                    |
| grafana     | 3003        | 3000            | 1        | —                    |
| loki        | 3100        | 3100            | 1        | —                    |

### Resource Limits

| Service     | CPU Limit | Memory Limit | CPU Reservation |
| ----------- | --------- | ------------ | --------------- |
| api         | 1.0       | 512M         | 0.25            |
| learninghub | 0.5       | 512M         | 0.1             |
| adminpage   | 0.5       | 512M         | 0.1             |

### Secrets (required, mounted at /run/secrets/)

```
secrets/
├── jwt_secret.txt
├── cloudinary_api_secret.txt
├── postgres_password.txt
└── pgadmin_password.txt
```

Create before first deploy: `mkdir -p secrets && echo "your-secret" > secrets/jwt_secret.txt`

### Environment Variables

| Variable                   | Service                | Example                 | Note                                |
| -------------------------- | ---------------------- | ----------------------- | ----------------------------------- |
| `POSTGRES_USER`            | compose                | `learninghub`           | `.env` file                         |
| `POSTGRES_DB`              | compose                | `dev_learning_hub`      | `.env` file                         |
| `PGADMIN_DEFAULT_EMAIL`    | compose                | `admin@admin.com`       | `.env` file                         |
| `NEST_API_URL`             | learninghub, adminpage | `http://api:8080`       | Internal Docker DNS                 |
| `NEXT_PUBLIC_NEST_API_URL` | learninghub, adminpage | `http://localhost:8080` | Baked at build time, browser-facing |

---

## Jenkins CI Pipeline

```
[Install] → [Lint] → [Test API] → [Test Frontend] → [Build] → ─┐
                                                                   │
  (main branch only)                                               │
  [Docker Build & Deploy] → [E2E Tests] ←─────────────────────────┘
```

| Stage                 | Command                                              | Projects  |
| --------------------- | ---------------------------------------------------- | --------- |
| Install               | `pnpm install --frozen-lockfile`                     | All       |
| Lint                  | `pnpm nx lint --projects=api,LearningHub,AdminPage`  | All 3     |
| Test (API)            | `pnpm nx test --projects=api`                        | API only  |
| Test (Frontend)       | `pnpm nx test --projects=LearningHub,AdminPage`      | Frontend  |
| Build                 | `pnpm nx build --projects=api,LearningHub,AdminPage` | All 3     |
| Docker Build & Deploy | `docker build` + `compose up -d --scale api=3`       | main only |
| E2E Tests             | `pnpm test:e2e`                                      | main only |

### Jenkins Dockerfile

Jenkins runs in Docker with Docker socket mount (`/var/run/docker.sock`). Builds pnpm + Node.js 22 inside `apps/jenkins/Dockerfile`.

---

## Docker Builds

### Multi-stage pattern (all 3 apps)

```
Stage 1: node:22-alpine AS build
  → pnpm install (with cache mount)
  → nx build
  → pnpm prune --prod

Stage 2: node:22-alpine (runtime)
  → non-root user (uid:gid 1001)
  → copy only production artifacts
  → healthcheck
```

### Build Commands

```bash
docker build -f apps/api/Dockerfile         -t learninghub-api:latest .
docker build -f apps/LearningHub/Dockerfile -t learninghub-web:latest .
docker build -f apps/AdminPage/Dockerfile   -t learninghub-admin:latest .
```

### Build-time ARGs

```bash
# Override API URL baked into client JS (browser-facing)
docker build -f apps/LearningHub/Dockerfile \
  --build-arg NEXT_PUBLIC_NEST_API_URL=https://api.example.com \
  -t learninghub-web:latest .
```

---

## Sandbox Images

9 language-specific Docker images for code execution. Built separately from `apps/api/src/modules/sandbox/images/`.

| Language   | Base Image                                |
| ---------- | ----------------------------------------- |
| Python     | `python:3.12-alpine`                      |
| JavaScript | `node:22-alpine`                          |
| TypeScript | `denoland/deno:alpine`                    |
| Java       | `eclipse-temurin:17-alpine`               |
| C/C++      | `alpine:3.20` + gcc/g++                   |
| Go         | `golang:1.22-alpine`                      |
| Rust       | `rust:1.80-alpine`                        |
| C#         | `mcr.microsoft.com/dotnet/sdk:8.0-alpine` |
| Swift      | `swift:5.10`                              |

---

## Database Migrations

Migrations run automatically on API startup (`migrationsRun: true`). No manual step needed. TypeORM tracks executed migrations.

```bash
# Generate new migration
pnpm migration:generate

# Run manually (optional)
pnpm migration:run

# Revert last
pnpm migration:revert
```

---

## Monitoring

| Tool        | URL                             | Purpose                                        |
| ----------- | ------------------------------- | ---------------------------------------------- |
| API metrics | `http://localhost:8080/metrics` | Prometheus scrape                              |
| API health  | `http://localhost:8080/health`  | `{"status":"ok","postgres":true,"redis":true}` |
| Grafana     | `http://localhost:3003`         | Dashboards (admin/admin)                       |
| Prometheus  | `http://localhost:9090`         | Metrics explorer                               |
| pgAdmin     | `http://localhost:5050`         | DB management                                  |

---

## Deployment Checklist

- [ ] Secrets files exist in `./secrets/`
- [ ] `.env` file with `POSTGRES_USER`, `POSTGRES_DB`, `PGADMIN_DEFAULT_EMAIL`
- [ ] Sandbox images built (`docker compose build` in sandbox images dir)
- [ ] `docker compose up -d` succeeds
- [ ] `docker compose ps` shows all services healthy
- [ ] `curl http://localhost:8080/health` returns `"status":"ok"`
- [ ] `pnpm test:e2e` passes (wait for services to be healthy first)
