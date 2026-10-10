# VIDEO_CRUD.md

## Create

1. Validate form.
2. Upload video.
3. Upload thumbnail.
4. Insert metadata.
5. Refresh list.
6. Show success.

If metadata insertion fails after upload:
- attempt cleanup of uploaded objects.

## Read

Query:

```text
videos
left join video_categories
```

Select:
- id
- title
- thumbnail_url
- views
- category
- status
- created_at

## Update

Allow:
- title
- description
- category
- thumbnail
- status
- optionally replace video file

When replacing a file:
1. Upload new file.
2. Update DB.
3. Delete old file after successful DB update.

## Delete

Recommended:
1. Fetch storage paths.
2. Delete DB record.
3. Delete storage objects if safe.

Alternative transaction-safe architecture may use database/webhook/backend automation.

## Search

Search title with `ilike`.

## Pagination

Use Supabase range queries:

```javascript
const from = page * pageSize;
const to = from + pageSize - 1;
```

## Empty state

When no video exists:

```text
No videos found.
Create your first video.
```

## Delete confirmation

```text
Delete this video?

This action cannot be undone.
[Cancel] [Delete]
```
