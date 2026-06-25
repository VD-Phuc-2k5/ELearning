# LearningHub

E-learning platform — NestJS API backend + Next.js frontend.

## Prerequisites

- Node.js >= 20
- pnpm (`npm install -g pnpm`)
- Docker + Docker Compose

## Installation

### 1. Clone & install dependencies
```sh
git clone <repo-url>
cd LearningHub
pnpm install
```

### 2. Configure environment
```sh
cp apps/api/.env.example apps/api/.env
```

Edit `apps/api/.env` nếu cần (mặc định đã sẵn sàng cho local):

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres123
POSTGRES_DB=dev_learning_hub
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

JWT_SECRET=<your-secret>

ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Admin123@
```

### 3. Start database
```sh
cd apps/api
docker compose up -d
```

- PostgreSQL: `localhost:5432`
- pgAdmin: `http://localhost:5050` (email: `admin@example.com` / pass: `admin123`)

### 4. Run migrations
```sh
npx nx run api:migration:run
```

### 5. Run development server
```sh
# API (NestJS) — http://localhost:8080
npx nx serve api

# Frontend (Next.js) — http://localhost:3000
npx nx dev LearningHub
```

Swagger UI: `http://localhost:8080/api/docs`

---

## Default Admin Account

> Tài khoản được tạo tự động bởi migration `SeedAdminUser`.

| Field    | Value               |
|----------|---------------------|
| Email    | `admin@example.com` |
| Password | `Admin123@`         |
| Role     | `OWNER`             |

Đăng nhập admin:
```sh
POST http://localhost:8080/auth/admin/login
Content-Type: application/json

{ "email": "admin@example.com", "password": "Admin123@" }
```

Để thay đổi credentials trước khi chạy migration, cập nhật `ADMIN_EMAIL` và `ADMIN_PASSWORD` trong `.env`.

---

## Build

```sh
npx nx build LearningHub
npx nx build api
```

## Test

```sh
npx nx test LearningHub
npx nx test api
```