-- ==============================================================================
-- DATABASE FUNCTIONS & TRIGGERS
-- ==============================================================================

-- 1. Helper function: check if current user is ADMIN
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

-- 2. Trigger function to automatically update `updated_at` timestamps
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Apply updated_at triggers
drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.handle_updated_at();

drop trigger if exists set_categories_updated_at on public.video_categories;
create trigger set_categories_updated_at
before update on public.video_categories
for each row
execute function public.handle_updated_at();

drop trigger if exists set_videos_updated_at on public.videos;
create trigger set_videos_updated_at
before update on public.videos
for each row
execute function public.handle_updated_at();


-- 3. Trigger: Automatically create a profile row when a user signs up via Supabase Auth
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
  -- Try to get username from user_metadata, otherwise fallback to email prefix
  raw_user_name := coalesce(
    new.raw_user_meta_data->>'username',
    split_part(new.email, '@', 1)
  );

  -- Sanitize username
  clean_user_name := regexp_replace(raw_user_name, '[^a-zA-Z0-9_-]', '', 'g');
  if clean_user_name is null or length(clean_user_name) < 2 then
    clean_user_name := 'user_' || substr(new.id::text, 1, 8);
  end if;

  -- Ensure uniqueness
  if exists (select 1 from public.profiles where username = clean_user_name) then
    clean_user_name := clean_user_name || '_' || substr(new.id::text, 1, 4);
  end if;

  -- Default role is ALWAYS 'USER' for security (cannot be spoofed from client)
  insert into public.profiles (id, username, email, role, status)
  values (
    new.id,
    clean_user_name,
    new.email,
    'USER',
    'ACTIVE'
  )
  on conflict (id) do update
  set email = excluded.email;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();


-- 4. Function: Securely record video view and increment count
create or replace function public.record_video_view(p_video_id bigint, p_viewer_id uuid default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- 1. Insert into video_views
  insert into public.video_views (video_id, viewer_id, viewed_at)
  values (p_video_id, coalesce(p_viewer_id, auth.uid()), now());

  -- 2. Increment view count on videos table
  update public.videos
  set views = views + 1
  where id = p_video_id;
end;
$$;


-- 5. Function: Get dashboard analytics / metrics
create or replace function public.get_dashboard_summary()
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_total_videos bigint;
  v_total_views bigint;
  v_total_storage bigint;
  result json;
begin
  select count(*), coalesce(sum(views), 0), coalesce(sum(file_size), 0)
  into v_total_videos, v_total_views, v_total_storage
  from public.videos
  where status = 'ACTIVE';

  result := json_build_object(
    'total_videos', v_total_videos,
    'total_views', v_total_views,
    'total_storage_bytes', v_total_storage
  );

  return result;
end;
$$;
