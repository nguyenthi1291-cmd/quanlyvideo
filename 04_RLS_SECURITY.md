# RLS_SECURITY.md — Supabase Security

## 1. Principle

Frontend JavaScript is not a security boundary.

All authorization must be enforced by Supabase RLS.

## 2. Helper function

Create a security-definer function to determine whether the current user is ADMIN.

Conceptually:

```sql
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'ADMIN'
      and status = 'ACTIVE'
  );
$$;
```

Review carefully before production deployment.

## 3. Policies

Expected policy model:

### Profiles

- Authenticated users can read their own profile.
- ADMIN can read user profiles.
- ADMIN can update role/status.
- Normal USER cannot promote itself.

### Videos

- Authenticated users can read active videos as required by product.
- ADMIN can insert/update/delete.
- USER cannot perform admin CRUD.

### Categories

- Authenticated users can read active categories.
- ADMIN can create/update/delete.

### Video views

- Appropriate authenticated/anonymous insert policy depending on product.
- Users must not be allowed to arbitrarily edit view counts.

## 4. View count integrity

Prefer recording a view event:

```text
video_views INSERT
        ↓
trusted database logic
        ↓
videos.views increment
```

Do not expose an unrestricted client-side:

```sql
update videos set views = views + 100000
```

to ordinary users.

## 5. Frontend keys

Allowed in frontend:
- Supabase project URL
- Supabase anon/public key

Never put in frontend:
- service_role key
- database password
- private server secrets
