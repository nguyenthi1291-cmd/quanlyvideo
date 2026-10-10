# DESIGN.md — UI/UX Specification

## 1. Design Direction

Style:
- Modern Admin Dashboard
- Light mode
- White background
- Clean
- Professional
- Minimal visual noise

Primary background:
- #FFFFFF

Secondary background:
- #F8FAFC

Text:
- Dark neutral

Borders:
- Light gray

Accent:
- Blue / indigo

Success:
- Green

Warning:
- Amber

Danger:
- Red

Do not overuse gradients.

## 2. Layout

Desktop:

```text
┌──────────────────────────────────────────────────────────────┐
│ Sidebar       │ Topbar                                      │
│               ├──────────────────────────────────────────────┤
│ Dashboard     │                                              │
│ Videos        │ Page content                                 │
│ Categories    │                                              │
│ Users         │                                              │
│ Account       │                                              │
│               │                                              │
│ Logout        │                                              │
└──────────────────────────────────────────────────────────────┘
```

Mobile:
- Sidebar collapses.
- Hamburger button opens navigation.
- Content becomes single column.
- Tables become horizontally scrollable or card-based.

## 3. Dashboard

Header:
- Page title: Dashboard
- User account area

KPI cards:
- Total Videos
- Total Views
- Storage Used

Charts:
- Top 10 Videos — Bar Chart
- Views Over Time — Line Chart

Use Chart.js via CDN unless the project later replaces it with a custom canvas implementation.

## 4. Video Table

Desktop table:

| ID | Thumbnail | Title | Views | Category | Status | Actions |
|---|---|---|---:|---|---|---|

Actions:
- Edit
- Delete

Delete should use confirmation modal.

## 5. Auth pages

Centered authentication card.

```text
Logo
Title
Email / Username
Password
Primary button
Secondary links
```

Login:
- Email
- Password
- Remember/session handled by Supabase

Register:
- Username
- Email
- Password
- Confirm password

Forgot:
- Email
- Send reset link

## 6. Visual components

Create reusable classes/components:
- `.sidebar`
- `.topbar`
- `.page-header`
- `.card`
- `.stat-card`
- `.table`
- `.btn`
- `.btn-primary`
- `.btn-danger`
- `.badge`
- `.modal`
- `.toast`
- `.form-group`
- `.empty-state`
- `.loading-state`

## 7. UX rules

Every async action must have:
1. Loading state
2. Success state
3. Error state

Delete:
- Never delete immediately on first click.
- Show confirmation.

Upload:
- Show progress where possible.
- Show filename and size.
- Validate before upload.
