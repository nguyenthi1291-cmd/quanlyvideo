# SQL_SEED.md

## Sample categories

```sql
insert into public.video_categories (name, slug, description)
values
  ('Technology', 'technology', 'Technology videos'),
  ('Education', 'education', 'Educational videos'),
  ('Entertainment', 'entertainment', 'Entertainment videos'),
  ('Business', 'business', 'Business videos')
on conflict (slug) do nothing;
```

## Important

Do not seed passwords into a public SQL table.

Create Auth users through Supabase Auth.

After creating Auth users, use their UUIDs to populate/update profiles.

Example concept:

```sql
insert into public.profiles (id, username, email, role)
values
  ('AUTH_USER_UUID', 'admin1', 'admin1@gmail.com', 'ADMIN');
```

Replace `AUTH_USER_UUID` with the actual UUID.

For `user1`, use role `USER`.

Never put real production passwords into Git, SQL migrations, screenshots or documentation.
