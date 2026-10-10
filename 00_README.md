# Video Admin Management — Vibe Coding Specification

## 1. Mục tiêu

Xây dựng website Admin quản lý video bằng:

- HTML5
- CSS3
- Vanilla JavaScript
- Supabase làm Backend-as-a-Service
  - Supabase Auth
  - Supabase PostgreSQL
  - Supabase Storage
  - Supabase Row Level Security (RLS)

Không sử dụng:

- React
- Vue
- Angular
- Node.js backend
- Express
- PHP
- Python backend
- Firebase

## 2. Nguyên tắc

- Light mode, nền trắng.
- Responsive desktop/tablet/mobile.
- UI quản trị hiện đại, rõ ràng.
- Tách HTML / CSS / JS.
- Không hard-code dữ liệu video trong giao diện.
- Dữ liệu lấy từ Supabase.
- Authentication dùng Supabase Auth.
- Không lưu password dạng plain text trong bảng users.
- Role phải được kiểm soát bằng database/RLS, không chỉ bằng JavaScript.
- Tất cả thao tác CRUD phải có loading, success/error state.
- Có empty state và confirmation trước Delete.

## 3. Các trang

1. Dashboard
2. List Video
3. Add Video
4. Edit Video
5. Login
6. Register
7. Forgot Password
8. Reset Password
9. Users
10. Categories
11. Account/Profile
12. 404 / Error state

## 4. Thứ tự triển khai

Phase 1:
- Supabase setup
- Auth
- Layout/admin shell
- Login/Register/Forgot Password

Phase 2:
- Database schema
- Categories
- Video CRUD
- Video Storage

Phase 3:
- Dashboard metrics
- Top 10 videos chart
- Views over time chart

Phase 4:
- Users management
- Account
- Permission/RLS
- Validation
- Error handling
- Responsive polish

## 5. Important

Thông tin tài khoản mẫu trong specification chỉ dùng cho seed/development. Trong production phải đổi password ngay và không commit secret/service_role key vào frontend.
