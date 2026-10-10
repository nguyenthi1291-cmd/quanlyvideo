# SUPABASE_SETUP.md

## 1. Create project

Create a Supabase project.

Record:
- Project URL
- anon/public key

Never expose:
- service_role key

## 2. Database

Run SQL in this approximate order:

1. Extensions/functions if required
2. Tables
3. Indexes
4. Trigger/profile creation
5. RLS enable
6. Policies
7. Seed categories
8. Create development Auth users

## 3. Auth settings

Enable:
- Email/password

Configure Site URL and Redirect URLs.

For local development, use the URL of the local static server.

Do not rely on `file://` if browser behavior causes Auth redirect issues. Prefer a local static server.

## 4. Storage

Create:
- `videos`
- `thumbnails`

Set policies carefully.

## 5. Development accounts

Create through Supabase Auth:

```text
admin1@gmail.com
user1@gmail.com
```

Development password requested by the project:

```text
123456
```

Immediately replace these passwords for any shared/public environment.

After Auth users exist:
- identify their UUID
- create/update matching `profiles` records
- assign ADMIN only to the intended admin user

## 6. Frontend config

Example:

```javascript
window.APP_CONFIG = {
  SUPABASE_URL: "https://YOUR_PROJECT.supabase.co",
  SUPABASE_ANON_KEY: "YOUR_ANON_KEY"
};
```

Use only anon/public key.

## 7. Local run

Use any static server.

Examples:

```bash
python -m http.server 5500
```

or VS Code Live Server.

Open:

```text
http://localhost:5500/
```

Do not use the service role key in local frontend code.
