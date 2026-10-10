# FILE_STRUCTURE.md

Recommended project:

```text
video-admin/
│
├── index.html
├── dashboard.html
├── login.html
├── register.html
├── forgot-password.html
├── reset-password.html
├── videos.html
├── video-form.html
├── categories.html
├── users.html
├── account.html
├── 404.html
│
├── css/
│   ├── reset.css
│   ├── variables.css
│   ├── global.css
│   ├── admin.css
│   ├── auth.css
│   ├── components.css
│   └── responsive.css
│
├── js/
│   ├── config.js
│   ├── supabase.js
│   ├── auth.js
│   ├── guard.js
│   ├── layout.js
│   ├── ui.js
│   ├── utils.js
│   ├── dashboard.js
│   ├── videos.js
│   ├── video-form.js
│   ├── categories.js
│   ├── users.js
│   └── account.js
│
├── assets/
│   ├── logo.svg
│   └── icons/
│
├── supabase/
│   ├── schema.sql
│   ├── functions.sql
│   ├── policies.sql
│   └── seed.sql
│
└── docs/
    └── ...
```

## Rule

Keep business logic out of HTML inline scripts where possible.

Use semantic HTML and external JS files.
