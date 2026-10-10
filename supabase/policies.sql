-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- 1. Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.video_categories enable row level security;
alter table public.videos enable row level security;
alter table public.video_views enable row level security;

-- ==============================================================================
-- 2. PROFILES POLICIES
-- ==============================================================================

-- Authenticated users can view all profiles (prevents RLS recursion when checking is_admin())
create policy "Authenticated users can read profiles"
on public.profiles for select
to authenticated, anon
using (true);

-- Users can update their own profile info or Admin can update any profile
create policy "Users update own profile"
on public.profiles for update
to authenticated
using (auth.uid() = id or public.is_admin())
with check (auth.uid() = id or public.is_admin());

-- Admin can delete profiles
create policy "Admin delete access to profiles"
on public.profiles for delete
to authenticated
using (public.is_admin());



-- ==============================================================================
-- 3. VIDEO CATEGORIES POLICIES
-- ==============================================================================

drop policy if exists "Anyone authenticated can view active categories" on public.video_categories;
drop policy if exists "Admin can view all categories" on public.video_categories;
drop policy if exists "Admin can insert categories" on public.video_categories;
drop policy if exists "Admin can update categories" on public.video_categories;
drop policy if exists "Admin can delete categories" on public.video_categories;

-- Anyone authenticated can view active categories; ADMIN can view all
create policy "View categories policy"
on public.video_categories for select
to authenticated, anon
using (
  status = 'ACTIVE' or public.is_admin()
);

-- Admin CRUD on categories
create policy "Admin can insert categories"
on public.video_categories for insert
to authenticated
with check (public.is_admin());

create policy "Admin can update categories"
on public.video_categories for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Admin can delete categories"
on public.video_categories for delete
to authenticated
using (public.is_admin());


-- ==============================================================================
-- 4. VIDEOS POLICIES
-- ==============================================================================

drop policy if exists "View videos policy" on public.videos;
drop policy if exists "Admin can insert videos" on public.videos;
drop policy if exists "Admin can update videos" on public.videos;
drop policy if exists "Admin can delete videos" on public.videos;

-- Authenticated/anon can view active videos; ADMIN can view all (including draft/inactive)
create policy "View videos policy"
on public.videos for select
to authenticated, anon
using (
  status = 'ACTIVE' or public.is_admin()
);

-- Admin full management
create policy "Admin can insert videos"
on public.videos for insert
to authenticated
with check (public.is_admin());

create policy "Admin can update videos"
on public.videos for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Admin can delete videos"
on public.videos for delete
to authenticated
using (public.is_admin());


-- ==============================================================================
-- 5. VIDEO VIEWS POLICIES
-- ==============================================================================

drop policy if exists "Insert video views" on public.video_views;
drop policy if exists "Admin can view all video views" on public.video_views;

-- Anyone can log views (either authenticated or anonymous)
create policy "Insert video views"
on public.video_views for insert
to authenticated, anon
with check (true);

-- Admin can read view metrics
create policy "Admin can view all video views"
on public.video_views for select
to authenticated
using (public.is_admin());


-- ==============================================================================
-- 6. STORAGE BUCKETS & POLICIES (Supabase Storage)
-- ==============================================================================

-- Create buckets if they do not exist
insert into storage.buckets (id, name, public)
values ('videos', 'videos', true)
on conflict (id) do update set public = true;

insert into storage.buckets (id, name, public)
values ('thumbnails', 'thumbnails', true)
on conflict (id) do update set public = true;

-- Storage RLS: Public read access
create policy "Public Access to Thumbnails"
on storage.objects for select
to public
using (bucket_id = 'thumbnails');

create policy "Public Access to Videos"
on storage.objects for select
to public
using (bucket_id = 'videos');

-- Storage RLS: Admin upload/update/delete access
create policy "Admin Upload to Thumbnails"
on storage.objects for insert
to authenticated
with check (bucket_id = 'thumbnails' and public.is_admin());

create policy "Admin Update Thumbnails"
on storage.objects for update
to authenticated
using (bucket_id = 'thumbnails' and public.is_admin());

create policy "Admin Delete Thumbnails"
on storage.objects for delete
to authenticated
using (bucket_id = 'thumbnails' and public.is_admin());

create policy "Admin Upload to Videos"
on storage.objects for insert
to authenticated
with check (bucket_id = 'videos' and public.is_admin());

create policy "Admin Update Videos"
on storage.objects for update
to authenticated
using (bucket_id = 'videos' and public.is_admin());

create policy "Admin Delete Videos"
on storage.objects for delete
to authenticated
using (bucket_id = 'videos' and public.is_admin());
