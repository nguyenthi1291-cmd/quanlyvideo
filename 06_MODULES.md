# MODULES.md — Functional Modules

## Module 01 — Admin Layout

Files:

```text
dashboard.html
css/admin.css
js/layout.js
```

Responsibilities:
- Sidebar
- Topbar
- Navigation
- User menu
- Logout
- Responsive menu

## Module 02 — Authentication

Files:

```text
login.html
register.html
forgot-password.html
reset-password.html
js/auth.js
```

## Module 03 — Dashboard

Files:

```text
dashboard.html
js/dashboard.js
```

Responsibilities:
- Total videos
- Total views
- Storage
- Top 10 chart
- Views trend chart

## Module 04 — Video List

Files:

```text
videos.html
js/videos.js
```

Features:
- Search
- Filter
- Pagination
- Sort
- Edit
- Delete

## Module 05 — Video Form

Files:

```text
video-form.html
js/video-form.js
```

Modes:
- Create
- Edit

## Module 06 — Video Upload

Responsibilities:
- Validate file
- Upload video
- Upload thumbnail
- Save storage path
- Save metadata
- Handle failed upload
- Cleanup orphan files when appropriate

## Module 07 — Categories

Files:

```text
categories.html
js/categories.js
```

## Module 08 — Users

Files:

```text
users.html
js/users.js
```

Only ADMIN.

## Module 09 — Account

Files:

```text
account.html
js/account.js
```

Features:
- Username
- Email
- Role
- Password change/reset flow
- Logout

## Module 10 — Shared UI

Files:

```text
js/ui.js
js/utils.js
```

Functions:
- toast()
- showLoading()
- hideLoading()
- confirmDialog()
- formatNumber()
- formatBytes()
- formatDate()
- escapeHTML()
- slugify()
