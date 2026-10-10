-- ==============================================================================
-- SCRIPT TẠO TÀI KHOẢN MẪU TRỰC TIẾP TRÊN SUPABASE SQL EDITOR
-- Chạy script này tại: https://supabase.com/dashboard/project/mgduhtgaatkubwjewhjv/sql
-- ==============================================================================

-- 1. Bật extension pgcrypto để mã hóa mật khẩu
create extension if not exists "pgcrypto";

-- 2. Tạo tài khoản admin1@gmail.com (Password: 123456)
do $$
declare
  admin_uid uuid := gen_random_uuid();
  user_uid uuid := gen_random_uuid();
begin
  -- Tạo Auth user cho admin1
  if not exists (select 1 from auth.users where email = 'admin1@gmail.com') then
    insert into auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    )
    values (
      '00000000-0000-0000-0000-000000000000',
      admin_uid,
      'authenticated',
      'authenticated',
      'admin1@gmail.com',
      crypt('123456', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"username":"admin1"}',
      now(),
      now()
    );

    -- Cập nhật hoặc tạo profile với quyền ADMIN
    insert into public.profiles (id, username, email, role, status)
    values (admin_uid, 'admin1', 'admin1@gmail.com', 'ADMIN', 'ACTIVE')
    on conflict (id) do update set role = 'ADMIN', status = 'ACTIVE';
  else
    -- Nếu đã tồn tại thì cập nhật lại mật khẩu và quyền ADMIN
    update auth.users
    set encrypted_password = crypt('123456', gen_salt('bf')),
        email_confirmed_at = coalesce(email_confirmed_at, now())
    where email = 'admin1@gmail.com';

    update public.profiles
    set role = 'ADMIN', status = 'ACTIVE'
    where email = 'admin1@gmail.com';
  end if;

  -- Tạo Auth user cho user1@gmail.com (Password: 123456)
  if not exists (select 1 from auth.users where email = 'user1@gmail.com') then
    insert into auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    )
    values (
      '00000000-0000-0000-0000-000000000000',
      user_uid,
      'authenticated',
      'authenticated',
      'user1@gmail.com',
      crypt('123456', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"username":"user1"}',
      now(),
      now()
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
