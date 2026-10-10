-- ==============================================================================
-- TỰ ĐỘNG XÁC NHẬN EMAIL (AUTO-CONFIRM EMAIL) CHO TẤT CẢ TÀI KHOẢN
-- Chạy script này tại: https://supabase.com/dashboard/project/mgduhtgaatkubwjewhjv/sql
-- ==============================================================================

-- 1. Xác nhận ngay tất cả tài khoản đã đăng ký trong auth.users
update auth.users
set email_confirmed_at = coalesce(email_confirmed_at, now())
where email_confirmed_at is null;

-- 2. Tạo trigger tự động xác nhận email cho bất kỳ tài khoản mới nào đăng ký sau này
create or replace function public.auto_confirm_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  new.email_confirmed_at := coalesce(new.email_confirmed_at, now());
  return new;
end;
$$;

drop trigger if exists tr_auto_confirm_new_user on auth.users;
create trigger tr_auto_confirm_new_user
before insert on auth.users
for each row
execute function public.auto_confirm_new_user();

-- 3. Đảm bảo tất cả user đều có profile tương ứng
insert into public.profiles (id, username, email, role, status)
select 
  u.id,
  coalesce(u.raw_user_meta_data->>'username', split_part(u.email, '@', 1)),
  u.email,
  'USER',
  'ACTIVE'
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null
on conflict (id) do nothing;
