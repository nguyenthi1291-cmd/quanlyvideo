# DATA_FLOW.md

## Login

```text
Browser
  ↓
Supabase Auth
  ↓
Session
  ↓
profiles
  ↓
Role
  ↓
Dashboard
```

## Add video

```text
Form
 ↓
Validation
 ↓
Supabase Storage
 ├── videos bucket
 └── thumbnails bucket
 ↓
videos table
 ↓
Video List
```

## Video view

```text
Video playback
 ↓
view event
 ↓
video_views
 ↓
trusted increment logic
 ↓
videos.views
 ↓
Dashboard
```

## Dashboard

```text
videos ──────────────┐
                     ├── KPI
video_views ─────────┤
                     ├── Line chart
videos ──────────────┘
      ↓
Top 10
      ↓
Bar chart
```

## Permission

```text
Browser
  ↓
Supabase session
  ↓
auth.uid()
  ↓
profiles.role
  ↓
RLS policy
  ↓
Allow / Deny
```
