# Auth Module — Frontend Integration Guide

Yêu cầu cần tuân theo khi triển khai giao diện **AdminPage** và **LearningHub**.

---

## 1. Endpoint & Phân vùng app

| Endpoint | Method | Public | Dùng ở |
|---|---|---|---|
| `/auth/register` | POST | ✓ | LearningHub |
| `/auth/login` | POST | ✓ | LearningHub |
| `/auth/admin/login` | POST | ✓ | AdminPage |
| `/auth/admin/register` | POST | — | AdminPage (cần JWT) |
| `/auth/refresh` | POST | ✓ | Cả hai |
| `/auth/logout` | POST | ✓ | Cả hai |
| `/admin/users` | GET | — | AdminPage |
| `/admin/users/:id/roles` | GET / POST / DELETE | — | AdminPage |
| `/admin/users/:id/permissions` | GET / POST / DELETE | — | AdminPage |
| `/admin/roles` | GET / POST / PATCH / DELETE | — | AdminPage |
| `/admin/roles/:id/permissions` | GET / POST / DELETE | — | AdminPage |
| `/admin/permissions` | GET / POST / DELETE | — | AdminPage |
| `/admin/permissions/resources` | GET | — | AdminPage |

> **AdminPage** chỉ gọi `/auth/admin/login` — không dùng `/auth/login` thông thường.

---

## 2. Request / Response

### Đăng ký (LearningHub)
```
POST /auth/register
{ email, password, username }
→ { user: UserResponse }
```

Password phải có ≥ 8 ký tự, ít nhất 1 chữ hoa, 1 chữ thường, 1 ký tự đặc biệt.

### Đăng nhập
```
POST /auth/login          (LearningHub)
POST /auth/admin/login    (AdminPage)
{ email, password }
→ { accessToken, refreshToken }
```

### Refresh token
```
POST /auth/refresh
{ refreshToken }
→ { accessToken, refreshToken }
```

### Logout
```
POST /auth/logout
{ refreshToken }
→ {}
```

---

## 3. Lưu token

| Token | Lưu ở | Lý do |
|---|---|---|
| `accessToken` | memory (biến JS / Zustand / Context) | Không lộ qua XSS |
| `refreshToken` | `localStorage` hoặc `httpOnly cookie` | Cần persist qua reload |

- Không lưu `accessToken` vào `localStorage` hoặc cookie thường.
- `accessToken` hết hạn sau **15 phút**; `refreshToken` sau **7 ngày**.

---

## 4. Tự động refresh token

Khi API trả về `401`:

1. Gọi `POST /auth/refresh` với `refreshToken` hiện tại.
2. Nếu thành công → cập nhật `accessToken` trong memory, thử lại request gốc.
3. Nếu thất bại → xóa token, redirect về trang login.

Dùng **axios interceptor** hoặc **fetch wrapper** để xử lý tập trung, không viết logic này rải trong từng component.

---

## 5. Bảo vệ route (Next.js)

### LearningHub
- Route yêu cầu đăng nhập: kiểm tra `accessToken` tồn tại trong memory.
- Không có token → redirect `/login`.
- Dùng Next.js **middleware** (`middleware.ts`) hoặc layout wrapper, không kiểm tra trong từng page component.

### AdminPage
- **Toàn bộ** route (trừ `/login`) đều yêu cầu JWT hợp lệ và role `ADMIN` hoặc `OWNER`.
- Sau khi login thành công, decode JWT để xác nhận role trước khi vào dashboard.
- Không có role phù hợp → redirect `/login` với thông báo lỗi.

---

## 6. Kiểm tra permission trong UI

Backend dùng mô hình `resource:action`:

| HTTP Method | Action |
|---|---|
| GET | `get` |
| POST | `create` |
| PUT / PATCH | `update` |
| DELETE | `delete` |

Ví dụ: `users:get`, `roles:create`, `permissions:delete`.

- Permission `*` nghĩa là toàn quyền.
- Để ẩn/hiện nút trong UI theo quyền: fetch danh sách permission hiệu lực của user từ `/admin/users/:id/permissions`, cache lại trong session, không gọi lại mỗi lần render.

---

## 7. Lỗi thường gặp

| HTTP Status | Ý nghĩa | Xử lý |
|---|---|---|
| 401 | Token hết hạn hoặc sai | Refresh hoặc logout |
| 403 | Không đủ quyền | Hiện thông báo, không redirect |
| 409 | Email đã tồn tại | Hiện lỗi trên form |
| 400 | Dữ liệu không hợp lệ | Hiện lỗi từ `message` trong response |
