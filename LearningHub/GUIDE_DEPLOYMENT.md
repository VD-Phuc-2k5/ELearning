# Hướng Dẫn Triển Khai — LearningHub

Hướng dẫn từng bước cài đặt và chạy toàn bộ hệ thống LearningHub trên môi trường production.

---

## 1. Kiến Trúc Tổng Quan

```
GitHub push
    │
    ▼
Jenkins (port 8088)
    │  lint → test → build → docker build
    ▼
docker compose up --scale api=N
    │
    ├─ nginx       :8080, :8081      ← reverse proxy + load balancer
    ├─ api         :8080    ×N       ← NestJS backend
    ├─ learninghub :3002    ×2       ← Next.js learner frontend
    ├─ adminpage   :3001    ×2       ← Next.js admin frontend
    ├─ postgres    :5432             ← database
    ├─ redis       :6379             ← cache + pub/sub
    ├─ pgadmin     :5050             ← quản trị DB
    ├─ grafana     :3003             ← dashboard monitoring
    ├─ prometheus  :9090             ← metrics
    ├─ loki        :3100             ← log aggregation
    └─ promtail                        ← log collector
```

WebSocket (forum) sử dụng Redis pub/sub adapter — tự động broadcast qua tất cả API instances.

---

## 2. Yêu Cầu Hệ Thống

| Thành phần            | Phiên bản tối thiểu   |
| --------------------- | --------------------- |
| Docker                | 24+                   |
| Docker Buildx         | built-in (Docker 24+) |
| Docker Compose        | 2.35+                 |
| Node.js (dev machine) | 22+                   |
| pnpm                  | 9+                    |
| Git                   | 2+                    |

**Cài đặt Docker + Buildx:**

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y docker.io docker-buildx-plugin docker-compose-v2

# Thêm user vào group docker
sudo usermod -aG docker $USER
newgrp docker
```

**Cài đặt Node.js + pnpm:**

```bash
# Dùng nvm (khuyên dùng)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
nvm install 22
nvm use 22

# Cài pnpm
corepack enable
corepack prepare pnpm@latest --activate
```

---

## 3. Bước 1: Clone Repository

```bash
git clone <repo-url> LearningHub
cd LearningHub
```

Cấu trúc thư mục monorepo:

```
LearningHub/
├── apps/
│   ├── api/              ← NestJS backend
│   ├── LearningHub/      ← Next.js learner frontend
│   ├── AdminPage/        ← Next.js admin frontend
│   └── jenkins/          ← Jenkins Dockerfile
├── packages/
│   └── data/             ← shared types, API client
├── docker-compose.yml    ← toàn bộ stack
├── Jenkinsfile           ← pipeline CI/CD
├── .env                  ← biến môi trường root
└── GUIDE_DEPLOYMENT.md   ← file này
```

---

## 4. Bước 2: Cấu Hình Biến Môi Trường

### 4.1. File `.env` tại root

Tạo file `.env` cùng cấp với `docker-compose.yml`:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=<mật-khẩu-mạnh>
POSTGRES_DB=learninghub
PGADMIN_DEFAULT_EMAIL=admin@example.com
PGADMIN_DEFAULT_PASSWORD=<mật-khẩu-mạnh>
COMPOSE_BAKE=true
```

> `COMPOSE_BAKE=true` là bắt buộc với Docker Compose v2.35+. Bật Buildx Bake backend thay cho internal builder đã deprecated.

### 4.2. File `apps/api/.env`

Tạo file `apps/api/.env` (tham khảo `apps/api/.env.example`):

```env
# Node
NODE_ENV=production
PORT=8080
CORS_ORIGIN=http://localhost:8080

# Postgres
POSTGRES_USER=postgres
POSTGRES_PASSWORD=<mật-khẩu-mạnh>
POSTGRES_DB=learninghub
POSTGRES_HOST=postgres
POSTGRES_PORT=5432

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# JWT
JWT_SECRET=<chuỗi-bí-mật-ngẫu-nhiên>
JWT_EXPIRES_IN=7d

# Cloudinary (upload ảnh)
CLOUDINARY_CLOUD_NAME=<your-cloud-name>
CLOUDINARY_API_KEY=<your-api-key>
CLOUDINARY_API_SECRET=<your-api-secret>

# Report cleanup
REPORT_CLEANUP_DELAY_MINUTES=60

# Admin account (tạo khi migrate)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=<mật-khẩu-mạnh>

# pgAdmin (trùng với root .env)
PGADMIN_DEFAULT_EMAIL=admin@example.com
PGADMIN_DEFAULT_PASSWORD=<mật-khẩu-mạnh>
```

### 4.3. File `packages/data/src/.env`

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

> Giá trị `NEXT_PUBLIC_API_URL` được bake vào frontend lúc build Docker image. Nếu triển khai trên server thật, đổi thành domain hoặc IP thực tế trước khi build.

---

## 5. Bước 3: Build và Chạy

### 5.1. Build images và khởi động toàn bộ stack

```bash
# Từ thư mục gốc LearningHub/
docker compose up --build -d
```

Quá trình build sẽ:

1. Build image `api` (NestJS — 2-stage, prune devDeps)
2. Build image `learninghub` (Next.js — standalone mode)
3. Build image `adminpage` (Next.js — standalone mode)
4. Build image `jenkins` (Jenkins + Node.js + pnpm)
5. Pull các image có sẵn: `nginx:alpine`, `postgres:17`, `redis:8-alpine`, `grafana/loki`, `prom/prometheus`, v.v.
6. Khởi động tất cả container

### 5.2. Kiểm tra trạng thái

```bash
# Xem tất cả container đang chạy
docker compose ps

# Output mong đợi: tất cả service có State = Up
```

### 5.3. Lấy Jenkins admin password

```bash
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

---

## 6. Bước 4: Kiểm Tra Các Service

| Service     | URL                            | Ghi chú           |
| ----------- | ------------------------------ | ----------------- |
| Learner App | http://localhost:8080          | Frontend học viên |
| Admin App   | http://localhost:8081          | Frontend quản trị |
| API Swagger | http://localhost:8080/api/docs | Tài liệu REST API |
| Jenkins     | http://localhost:8088          | CI/CD             |
| Grafana     | http://localhost:3003          | admin / admin     |
| Prometheus  | http://localhost:9090          | Metrics           |
| pgAdmin     | http://localhost:5050          | Quản trị database |

---

## 7. Bước 5: Cấu Hình Jenkins (CI/CD)

### 7.1. Setup wizard

Truy cập `http://localhost:8088`, nhập admin password từ bước 5.3, sau đó:

1. **Install suggested plugins** (hoặc chọn thủ công: Git, Pipeline, GitHub Integration)
2. Tạo admin user mới

### 7.2. Tạo Pipeline job

1. **New Item** → chọn **Pipeline** → đặt tên (VD: `LearningHub-CI`) → OK
2. Tab **Pipeline**:
   - Definition: **Pipeline script from SCM**
   - SCM: **Git**
   - Repository URL: `<url-repo-github>`
   - Branch Specifier: `*/main`
   - Script Path: `Jenkinsfile`
3. **Save**

### 7.3. Cấu hình GitHub Webhook

**Trong Jenkins:**

- Manage Jenkins → System → GitHub → Add GitHub Server
- Credentials: Personal Access Token (scope: `repo`, `admin:repo_hook`)

**Trong GitHub repo:**

- Settings → Webhooks → Add webhook
- Payload URL: `http://<server-ip>:8088/github-webhook/`
- Content type: `application/json`
- Events: **Just the push event**

**Trong Jenkins job:**

- Configure → Build Triggers → check **GitHub hook trigger for GITScm polling**

> Khi phát triển local, dùng `ngrok http 8088` để lấy public URL cho webhook.

### 7.4. Pipeline stages

| Stage                 | Lệnh                                            | Chạy khi         |
| --------------------- | ----------------------------------------------- | ---------------- |
| Install               | `pnpm install --frozen-lockfile`                | mọi push         |
| Lint                  | `pnpm nx run-many --target=lint`                | mọi push         |
| Test                  | `pnpm nx run-many --target=test --projects=api` | mọi push         |
| Build                 | `pnpm nx run-many --target=build`               | mọi push         |
| Docker Build & Deploy | `docker compose up --build -d`                  | chỉ nhánh `main` |

---

## 8. Bước 6: Scale API

```bash
# Scale lên 3 API instances
docker compose up -d --scale api=3

# Tương tự cho số lượng khác
docker compose up -d --scale api=5
```

Nginx sử dụng `least_conn` để phân phối request đều qua các API instances. Redis adapter đảm bảo WebSocket events được broadcast đồng bộ.

---

## 9. Các Lệnh Thường Dùng

```bash
# Xem logs real-time của một service
docker compose logs -f api
docker compose logs -f jenkins
docker compose logs -f nginx

# Xem logs tất cả service
docker compose logs -f

# Restart một service
docker compose restart api

# Build lại một service sau khi sửa code
docker compose up -d --build api

# Dừng toàn bộ stack
docker compose down

# Dừng và xóa toàn bộ dữ liệu (reset DB, Redis, volumes)
docker compose down -v

# Kiểm tra cấu hình compose có hợp lệ không
docker compose config --no-interpolate

# Xem tài nguyên đang dùng
docker stats
```

---

## 10. Cấu Trúc Docker Image

### api — 2-stage build

```
Stage 1: build (node:22-alpine)
  corepack enable
  pnpm install (tất cả dependencies)
  pnpm nx build api
  pnpm prune --prod          ← xóa devDependencies

Stage 2: runtime (node:22-alpine)
  COPY node_modules/         ← chỉ production deps
  COPY packages/             ← workspace shared code
  COPY dist/apps/api/        ← code đã build
  Không chứa pnpm, lockfiles, package.json
```

### LearningHub & AdminPage — 2-stage build (standalone)

```
Stage 1: build (node:22-alpine)
  corepack enable
  COPY package.json files    ← tận dụng Docker layer cache
  pnpm install
  COPY . .
  pnpm nx build <App>

Stage 2: runtime (node:22-alpine)
  COPY .next/standalone/     ← Next.js standalone (không cần node_modules)
  COPY .next/static/
  COPY public/
```

---

## 11. Monitoring

| Công cụ     | URL                            | Mục đích                 |
| ----------- | ------------------------------ | ------------------------ |
| Grafana     | http://localhost:3003          | Dashboard logs + metrics |
| Prometheus  | http://localhost:9090          | Thu thập metrics API     |
| Loki        | http://localhost:3100          | Log aggregation          |
| pgAdmin     | http://localhost:5050          | Quản lý PostgreSQL       |
| API Swagger | http://localhost:8080/api/docs | Tài liệu REST API        |

### Thiết lập Grafana Dashboard

1. Đăng nhập `http://localhost:3003` (admin / admin)
2. Data sources đã được cấu hình sẵn: **Loki** (logs) và **Prometheus** (metrics)
3. Import dashboard hoặc tạo mới từ 2 data source trên

---

## 12. Danh Sách File Quan Trọng

```
docker-compose.yml              ← Toàn bộ stack infra + ứng dụng
.env                            ← Biến môi trường root (Docker Compose)
Jenkinsfile                     ← Pipeline CI/CD
apps/api/.env                   ← Biến môi trường NestJS
apps/api/Dockerfile             ← Docker image cho NestJS
apps/LearningHub/Dockerfile     ← Docker image cho learner frontend
apps/AdminPage/Dockerfile       ← Docker image cho admin frontend
apps/jenkins/Dockerfile         ← Docker image cho Jenkins
apps/api/src/redis-io.adapter.ts ← Socket.IO Redis adapter
packages/data/src/.env          ← API URL cho frontend
```

---

## 13. Khắc Phục Sự Cố

### Container không khởi động

```bash
# Xem logs chi tiết
docker compose logs <tên-service>

# Kiểm tra cổng đã bị chiếm chưa
sudo lsof -i :8080
sudo lsof -i :5432
```

### Không kết nối được database

Kiểm tra `POSTGRES_*` trong `apps/api/.env` khớp với biến trong `.env` root và `docker-compose.yml`.

### Frontend không gọi được API

Giá trị `NEXT_PUBLIC_NEST_API_URL` được bake lúc build image. Nếu đổi domain/IP server, cần rebuild frontend images:

```bash
docker compose up -d --build learninghub adminpage
```

### Build chậm hoặc cache không hoạt động

```bash
# Xóa cache build cũ
docker builder prune -a

# Build lại từ đầu
docker compose build --no-cache
```
