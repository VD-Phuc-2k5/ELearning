# Database Schema: RBAC (Role-Based Access Control)

## 1. Users
Bảng lưu thông tin người dùng.

| Column      | Type      | Constraint     |
|-------------|-----------|----------------|
| id          | uuid      | Primary Key    |
| email       | string    | Unique         |
| password    | string    |                |
| username    | string    |                |
| avatar_url  | text      |                |
| is_active   | bool      |                |
| created_at  | timestamp |                |
| updated_at  | timestamp |                |
| locked_at   | timestamp |                |

## 2. Roles
Bảng lưu các vai trò trong hệ thống.

| Column      | Type      | Constraint     |
|-------------|-----------|----------------|
| id          | int       | Primary Key    |
| code        | string    | Unique         |
| name        | string    |                |
| description | string    |                |
| created_at  | timestamp |                |
| updated_at  | timestamp |                |

## 3. Permissions
Bảng lưu các quyền trong hệ thống.

| Column      | Type      | Constraint     |
|-------------|-----------|----------------|
| id          | int       | Primary Key    |
| code        | string    | Unique         |
| name        | string    |                |
| description | string    |                |
| created_at  | timestamp |                |
| updated_at  | timestamp |                |

## 4. User_Roles
Bảng trung gian gán Role cho User (many-to-many).

| Column      | Type      | Constraint                  |
|-------------|-----------|------------------------------|
| id          | int       | Primary Key                  |
| user_id     | uuid      | Foreign Key → Users.id       |
| role_id     | int       | Foreign Key → Roles.id       |
| assigned_by | uuid      | Foreign Key → Users.id       |
| assigned_at | timestamp |                              |

## 5. User_Permissions
Bảng trung gian gán Permission trực tiếp cho User (many-to-many), override ngoài quyền theo Role.

| Column        | Type      | Constraint                     |
|---------------|-----------|----------------------------------|
| id            | int       | Primary Key                      |
| user_id       | uuid      | Foreign Key → Users.id           |
| permission_id | int       | Foreign Key → Permissions.id     |
| is_granted    | bool      | true = cấp quyền, false = từ chối|
| granted_by    | uuid      | Foreign Key → Users.id           |
| granted_at    | timestamp |                                  |

## 6. Role_Permissions
Bảng trung gian gán Permission cho Role (many-to-many).

| Column        | Type      | Constraint                    |
|---------------|-----------|--------------------------------|
| id            | int       | Primary Key                    |
| role_id       | int       | Foreign Key → Roles.id         |
| permission_id | int       | Foreign Key → Permissions.id   |
| created_at    | timestamp |                                |

## 7. Refresh_Tokens
Bảng lưu refresh token (dạng hash) để xác thực và thu hồi.

| Column      | Type      | Constraint              |
|-------------|-----------|--------------------------|
| id          | uuid      | Primary Key              |
| token_hash  | string    | Unique                   |
| user_id     | uuid      | Foreign Key → Users.id   |
| expires_at  | timestamp |                          |
| created_at  | timestamp |                          |
| revoked_at  | timestamp | Nullable                 |

---

## Relationships
- **Users → User_Roles**: 1-n
- **Roles → User_Roles**: 1-n
- **Users → User_Permissions**: 1-n
- **Permissions → User_Permissions**: 1-n
- **Roles → Role_Permissions**: 1-n
- **Permissions → Role_Permissions**: 1-n
- **Users → Refresh_Tokens**: 1-n