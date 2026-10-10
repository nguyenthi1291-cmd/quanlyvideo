# USERS_CATEGORIES.md

## Users

ADMIN-only page.

Columns:

```text
ID
Username
Email
Role
Status
Created At
Actions
```

Actions:
- Change role
- Activate/deactivate
- View details

Do not provide a frontend control that directly changes the user's Supabase Auth password.

Password changes should use Supabase Auth flows.

## Role change

Allowed:
- USER → ADMIN
- ADMIN → USER

But prevent accidental removal of the last ADMIN if the product requires at least one administrator.

## Categories

Fields:

```text
id
name
slug
description
status
created_at
updated_at
```

Features:
- Search
- Add
- Edit
- Delete
- Activate/deactivate

## Category delete

If videos reference a category:
- Prefer blocking delete and asking admin to reassign videos.
- Do not silently delete/reassign production data.
