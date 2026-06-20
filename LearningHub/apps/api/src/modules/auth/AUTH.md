# Auth Module — Schema & API Reference

## Database Schema

### 1. users
| Column     | Type      | Constraint   |
|------------|-----------|--------------|
| id         | uuid      | PK           |
| email      | varchar   | Unique       |
| password   | varchar   | bcrypt hash  |
| username   | varchar   |              |
| avatar_url | varchar   | nullable     |
| is_active  | bool      | default true |
| created_at | timestamp |              |
| updated_at | timestamp |              |
| locked_at  | timestamp | nullable     |

### 2. roles
| Column      | Type      | Constraint |
|-------------|-----------|------------|
| id          | int       | PK         |
| code        | varchar   | Unique     |
| name        | varchar   |            |
| description | varchar   |            |
| created_at  | timestamp |            |
| updated_at  | timestamp |            |

Seeded roles: `ADMIN`, `INSTRUCTOR`, `STUDENT`

### 3. permissions
| Column      | Type      | Constraint                                      |
|-------------|-----------|-------------------------------------------------|
| id          | int       | PK                                              |
| code        | varchar   | Unique — auto-generated: `resource:action`      |
| name        | varchar   |                                                 |
| description | varchar   | nullable                                        |
| resource    | varchar   | DB table name (validated via ResourceRegistry)  |
| action      | varchar   | one of: `create`, `get`, `update`, `delete`     |
| created_at  | timestamp |                                                 |
| updated_at  | timestamp |                                                 |

### 4. user_roles
| Column      | Type      | Constraint              |
|-------------|-----------|-------------------------|
| id          | int       | PK                      |
| user_id     | uuid      | FK → users.id           |
| role_id     | int       | FK → roles.id           |
| assigned_by | uuid      | FK → users.id, nullable |
| assigned_at | timestamp |                         |

### 5. role_permissions
| Column        | Type      | Constraint           |
|---------------|-----------|----------------------|
| id            | int       | PK                   |
| role_id       | int       | FK → roles.id        |
| permission_id | int       | FK → permissions.id  |
| created_at    | timestamp |                      |

### 6. user_permissions
| Column        | Type      | Constraint                         |
|---------------|-----------|------------------------------------|
| id            | int       | PK                                 |
| user_id       | uuid      | FK → users.id                      |
| permission_id | int       | FK → permissions.id                |
| is_granted    | bool      | true = cấp thêm, false = thu hồi  |
| granted_by    | uuid      | FK → users.id, nullable            |
| granted_at    | timestamp |                                    |

### 7. refresh_tokens
| Column     | Type      | Constraint      |
|------------|-----------|-----------------|
| id         | uuid      | PK              |
| token_hash | varchar   | Unique (hashed) |
| user_id    | uuid      | FK → users.id   |
| expires_at | timestamp |                 |
| created_at | timestamp |                 |
| revoked_at | timestamp | nullable        |

---

## API Endpoints

### Public (không cần auth)
| Method | Path               | Mô tả                                                    |
|--------|--------------------|----------------------------------------------------------|
| POST   | /auth/register     | Đăng ký user thường                                      |
| POST   | /auth/login        | Đăng nhập user                                           |
| POST   | /auth/admin/login  | Đăng nhập admin (403 nếu user không có role ADMIN)       |
| POST   | /auth/refresh      | Làm mới access token                                     |
| POST   | /auth/logout       | Đăng xuất                                                |

### Admin only (JWT + permission `admin:write`)
| Method | Path                 | Mô tả                   |
|--------|----------------------|-------------------------|
| POST   | /auth/admin/register | Tạo tài khoản admin mới |

### Permissions (JWT + `admin:read` / `admin:write`)
| Method | Path                         | Mô tả                         |
|--------|------------------------------|-------------------------------|
| GET    | /admin/permissions/resources | Danh sách DB tables khả dụng  |
| GET    | /admin/permissions           | Danh sách tất cả permissions  |
| POST   | /admin/permissions           | Tạo permission mới            |
| DELETE | /admin/permissions/:id       | Xóa permission                |

---

## Permission System

### ResourceActionGuard (global)
Guard toàn cục tự map `HTTP method + path` → `resource:action`:

| Method      | action |
|-------------|--------|
| GET         | get    |
| POST        | create |
| PUT / PATCH | update |
| DELETE      | delete |

- Path `/admin/roles` → resource = `roles`
- Path `/courses/123` → resource = `courses`
- Route có `@Public()` → bỏ qua hoàn toàn
- Route có `@RequirePermissions(...)` → PermissionGuard xử lý, ResourceActionGuard bỏ qua

### Tạo permission động
```json
POST /admin/permissions
{
  "resource": "roles",
  "action": "create",
  "name": "Tạo role mới"
}
```
Validation:
- `resource` phải là tên bảng thực tế trong DB (từ `ResourceRegistryService`)
- `action` phải là: `create` | `get` | `update` | `delete`
- `code` tự sinh: `roles:create`

### Cache
`PermissionResolverService` cache effective permissions mỗi user với TTL 5 phút (in-memory).
