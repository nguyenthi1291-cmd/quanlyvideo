# PRD — Video Admin Management

## 1. Product Overview

Video Admin Management là hệ thống quản trị video cho phép ADMIN quản lý video, category, người dùng và theo dõi các chỉ số video.

Frontend chỉ sử dụng HTML/CSS/Vanilla JavaScript. Supabase cung cấp Auth, Database và Storage.

## 2. Roles

### ADMIN

Có quyền:
- Xem Dashboard
- Xem video
- Thêm video
- Sửa video
- Xóa video
- Quản lý category
- Xem/quản lý users
- Xem account

### USER

Có thể:
- Đăng nhập
- Xem các nội dung được cấp quyền
- Không được truy cập chức năng quản trị nếu RLS không cho phép.

## 3. Dashboard

Hiển thị 3 KPI cards:

### Tổng số video
Đếm video active.

### Tổng lượt xem
SUM views của video.

### Dung lượng storage
Tổng dung lượng file video đã upload.

### Bar chart

Top 10 video có lượt xem cao nhất.

X-axis:
- Title

Y-axis:
- Views

### Line chart

Views theo thời gian.

Có filter:
- 7 ngày
- 30 ngày
- 90 ngày
- Theo tháng

Nguồn dữ liệu: bảng `video_views`.

## 4. List Video

Columns:

| Field | Description |
|---|---|
| ID | Video ID |
| Title | Video title |
| Thumbnail | Thumbnail |
| Views | Total views |
| Category | Category |
| Status | active/inactive |
| Created At | Creation date |
| Action | Edit/Delete |

Features:
- Search
- Filter category
- Filter status
- Sort
- Pagination
- Add Video
- Edit
- Delete

## 5. Add/Edit Video

Fields:
- Title
- Description
- Category
- Video file
- Thumbnail
- Status

Validation:
- Title required
- Category required
- Video file type allowed
- File size limit
- Thumbnail type allowed

## 6. Users

Columns:
- ID
- Username
- Email
- Role
- Status
- Created At
- Actions

ADMIN can:
- View users
- Change role
- Activate/deactivate user

Không cho phép frontend tự quyết định quyền.

## 7. Categories

CRUD:
- Create
- Read
- Update
- Delete

Fields:
- name
- slug
- description
- status

Không cho delete category nếu đang được video sử dụng, hoặc phải có chiến lược xử lý FK rõ ràng.

## 8. Authentication

Pages:
- Login
- Register
- Forgot Password
- Reset Password

Authentication provider:
Supabase Auth / Email + Password.

## 9. Non-functional requirements

- Responsive
- Accessible labels
- Keyboard friendly
- Fast loading
- No exposed service_role key
- Supabase RLS enabled
- Clear error messages
- No password stored in plaintext
