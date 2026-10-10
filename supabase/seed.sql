-- ==============================================================================
-- SEED DATA
-- ==============================================================================

-- 1. Categories Seed
insert into public.video_categories (name, slug, description, status)
values
  ('Technology', 'technology', 'Coding, hardware, AI, cloud computing, and tech tutorials', 'ACTIVE'),
  ('Education', 'education', 'Academic lectures, learning guides, and skill development', 'ACTIVE'),
  ('Entertainment', 'entertainment', 'Music, comedy, short films, and vlogs', 'ACTIVE'),
  ('Business', 'business', 'Entrepreneurship, marketing, financial growth, and case studies', 'ACTIVE'),
  ('Design & Creative', 'design-creative', 'UI/UX design, motion graphics, video editing, and 3D modeling', 'ACTIVE')
on conflict (slug) do nothing;

-- 2. Sample Videos Seed (High quality sample data for demonstration)
insert into public.videos (title, slug, description, category_id, video_url, thumbnail_url, views, file_size, duration_seconds, status)
select
  'Building Fullstack Apps with Vanilla JS and Supabase',
  'building-fullstack-apps-vanilla-js-supabase',
  'A complete guide to building production-ready web apps without frontend frameworks.',
  id,
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=640&auto=format&fit=crop&q=80',
  14200,
  52428800, -- 50 MB
  600,
  'ACTIVE'
from public.video_categories where slug = 'technology'
on conflict (slug) do nothing;

insert into public.videos (title, slug, description, category_id, video_url, thumbnail_url, views, file_size, duration_seconds, status)
select
  'PostgreSQL Database Indexing & Performance Tuning Masterclass',
  'postgresql-database-indexing-masterclass',
  'Learn how B-tree indexes, execution plans, and query optimizations work in PostgreSQL.',
  id,
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=640&auto=format&fit=crop&q=80',
  8950,
  83886080, -- 80 MB
  1200,
  'ACTIVE'
from public.video_categories where slug = 'education'
on conflict (slug) do nothing;

insert into public.videos (title, slug, description, category_id, video_url, thumbnail_url, views, file_size, duration_seconds, status)
select
  'UI/UX Design Systems: From Figma to Clean CSS',
  'ui-ux-design-systems-figma-to-css',
  'Step by step process to build responsive, accessible, and scalable design systems.',
  id,
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=640&auto=format&fit=crop&q=80',
  11320,
  41943040, -- 40 MB
  450,
  'ACTIVE'
from public.video_categories where slug = 'design-creative'
on conflict (slug) do nothing;

insert into public.videos (title, slug, description, category_id, video_url, thumbnail_url, views, file_size, duration_seconds, status)
select
  'SaaS Growth Strategy: Scaling from 0 to 10k Users',
  'saas-growth-strategy-scaling-10k-users',
  'Actionable marketing, product-led growth, and retention tactics for founders.',
  id,
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=640&auto=format&fit=crop&q=80',
  6420,
  62914560, -- 60 MB
  720,
  'ACTIVE'
from public.video_categories where slug = 'business'
on conflict (slug) do nothing;

insert into public.videos (title, slug, description, category_id, video_url, thumbnail_url, views, file_size, duration_seconds, status)
select
  'Cinematic Video Lighting & Composition Breakdown',
  'cinematic-video-lighting-composition-breakdown',
  'Three-point lighting, color grading, and lens choices for indie filmmakers.',
  id,
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
  'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=640&auto=format&fit=crop&q=80',
  4810,
  104857600, -- 100 MB
  900,
  'ACTIVE'
from public.video_categories where slug = 'entertainment'
on conflict (slug) do nothing;

-- 3. Seed video views across recent dates for the line chart
do $$
declare
  v_vid bigint;
  i int;
  d int;
begin
  for v_vid in (select id from public.videos limit 5) loop
    for d in 0..14 loop
      for i in 1..(5 + (v_vid * 3 + d * 7) % 25) loop
        insert into public.video_views (video_id, viewed_at)
        values (v_vid, now() - (d || ' days')::interval - ((i * 13) || ' minutes')::interval);
      end loop;
    end loop;
  end loop;
end $$;
