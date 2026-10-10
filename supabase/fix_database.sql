-- ==============================================================================
-- FIX DATABASE & RECURSION SCRIPT (CHẠY SCRIPT NÀY ĐỂ FIX LỖI SCHEMA & ĐĂNG NHẬP)
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/mgduhtgaatkubwjewhjv/sql
-- ==============================================================================

-- 1. Bật extension cần thiết
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 2. Đảm bảo bảng profiles tồn tại và đầy đủ cấu trúc
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  email text,
  role text not null default 'USER' check (role in ('ADMIN', 'USER')),
  status text not null default 'ACTIVE' check (status in ('ACTIVE', 'INACTIVE')),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Hàm is_admin() KHÔNG ĐỆ QUY (Security Definer)
create or replace function public.is_admin()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text;
begin
  select role into v_role
  from public.profiles
  where id = auth.uid()
    and status = 'ACTIVE';

  return coalesce(v_role = 'ADMIN', false);
end;
$$;

-- 4. Trigger tạo Profile an toàn tuyệt đối (bọc EXCEPTION để không làm lỗi Auth)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  raw_user_name text;
  clean_user_name text;
begin
  raw_user_name := coalesce(
    new.raw_user_meta_data->>'username',
    split_part(new.email, '@', 1)
  );

  clean_user_name := regexp_replace(raw_user_name, '[^a-zA-Z0-9_-]', '', 'g');
  if clean_user_name is null or length(clean_user_name) < 2 then
    clean_user_name := 'user_' || substr(new.id::text, 1, 8);
  end if;

  begin
    insert into public.profiles (id, username, email, role, status)
    values (new.id, clean_user_name, new.email, 'USER', 'ACTIVE')
    on conflict (id) do update
    set email = excluded.email;
  exception when others then
    insert into public.profiles (id, username, email, role, status)
    values (new.id, 'user_' || substr(new.id::text, 1, 12), new.email, 'USER', 'ACTIVE')
    on conflict (id) do nothing;
  end;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

-- 5. XÓA TẤT CẢ POLICY CŨ CỦA PROFILES ĐỂ TRÁNH LỖI ĐỆ QUY
alter table public.profiles enable row level security;
drop policy if exists "Users can read their own profile or Admin can read all" on public.profiles;
drop policy if exists "Users can read own profile" on public.profiles;
drop policy if exists "Authenticated users can read profiles" on public.profiles;
drop policy if exists "Users can update their own profile info" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Admin full update access to profiles" on public.profiles;
drop policy if exists "Admin delete access to profiles" on public.profiles;

-- Policy Select: Cho phép người dùng đã đăng nhập đọc danh sách profiles (tránh đệ quy)
create policy "Authenticated users can read profiles"
on public.profiles for select
to authenticated, anon
using (true);

-- Policy Update: User sửa profile của mình, Admin sửa được tất cả
create policy "Users update own profile"
on public.profiles for update
to authenticated
using (auth.uid() = id or public.is_admin())
with check (auth.uid() = id or public.is_admin());

create policy "Admin delete profiles"
on public.profiles for delete
to authenticated
using (public.is_admin());

-- 6. TẠO HOẶC CẬP NHẬT TÀI KHOẢN MẪU ADMIN & USER
do $$
declare
  admin_uid uuid := gen_random_uuid();
  user_uid uuid := gen_random_uuid();
begin
  -- 6.1 Tạo admin1@gmail.com / 123456
  if not exists (select 1 from auth.users where email = 'admin1@gmail.com') then
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    )
    values (
      '00000000-0000-0000-0000-000000000000', admin_uid, 'authenticated', 'authenticated',
      'admin1@gmail.com', crypt('123456', gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}', '{"username":"admin1"}', now(), now()
    );

    insert into public.profiles (id, username, email, role, status)
    values (admin_uid, 'admin1', 'admin1@gmail.com', 'ADMIN', 'ACTIVE')
    on conflict (id) do update set role = 'ADMIN', status = 'ACTIVE';
  else
    update auth.users
    set encrypted_password = crypt('123456', gen_salt('bf')),
        email_confirmed_at = coalesce(email_confirmed_at, now())
    where email = 'admin1@gmail.com';

    update public.profiles
    set role = 'ADMIN', status = 'ACTIVE'
    where email = 'admin1@gmail.com';
  end if;

  -- 6.2 Tạo user1@gmail.com / 123456
  if not exists (select 1 from auth.users where email = 'user1@gmail.com') then
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    )
    values (
      '00000000-0000-0000-0000-000000000000', user_uid, 'authenticated', 'authenticated',
      'user1@gmail.com', crypt('123456', gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}', '{"username":"user1"}', now(), now()
    );

    insert into public.profiles (id, username, email, role, status)
    values (user_uid, 'user1', 'user1@gmail.com', 'USER', 'ACTIVE')
    on conflict (id) do update set role = 'USER', status = 'ACTIVE';
  else
    update auth.users
    set encrypted_password = crypt('123456', gen_salt('bf')),
        email_confirmed_at = coalesce(email_confirmed_at, now())
    where email = 'user1@gmail.com';
  end if;
end $$;

-- 7. Cấp quyền truy cập cho role authenticated và anon
grant usage on schema public to anon, authenticated;
grant all on all tables in schema public to anon, authenticated;
grant all on all sequences in schema public to anon, authenticated;
grant all on all routines in schema public to anon, authenticated;
