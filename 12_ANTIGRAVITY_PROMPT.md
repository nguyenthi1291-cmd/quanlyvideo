# ANTIGRAVITY_PROMPT.md

You are a senior frontend engineer and Supabase engineer.

Build a production-quality Video Admin Management web application from the specification files in this folder.

## Technology constraints

MUST use:
- HTML5
- CSS3
- Vanilla JavaScript
- Supabase
- Chart.js via CDN if needed

MUST NOT use:
- React
- Vue
- Angular
- Node backend
- Express
- PHP
- Python backend
- Firebase

## Source of truth

Read all `.md` files before coding.

Priority:
1. PRD
2. DESIGN
3. DATABASE
4. RLS_SECURITY
5. AUTH
6. MODULES
7. VIDEO_CRUD
8. TESTING

## Implementation rules

1. Do not invent requirements that conflict with the MD files.
2. Build reusable UI components using Vanilla JS.
3. Keep CSS organized.
4. Keep Supabase access separate from UI rendering.
5. Use Supabase Auth for authentication.
6. Use PostgreSQL tables defined in DATABASE.md.
7. Enforce permissions using Supabase RLS.
8. Never put service_role in frontend.
9. Never store plaintext passwords in public tables.
10. Never hard-code dashboard statistics.
11. Add loading, empty, error and success states.
12. Escape user-generated HTML.
13. Validate all form inputs.
14. Use confirmation before destructive operations.
15. Make all pages responsive.

## Build order

### Step 1
Create project structure.

### Step 2
Create CSS foundation and admin shell.

### Step 3
Implement Supabase client.

### Step 4
Implement authentication.

### Step 5
Implement route/role guards.

### Step 6
Implement Categories CRUD.

### Step 7
Implement Video CRUD.

### Step 8
Implement Storage upload.

### Step 9
Implement Dashboard.

### Step 10
Implement Users.

### Step 11
Implement Account.

### Step 12
Run acceptance tests from TESTING.md.

## Important Vibe Coding behavior

Before modifying an existing file:
- Inspect it.
- Preserve working functionality.
- Do not rewrite unrelated modules.
- Do not create duplicate files/functions.

When an implementation is complete:
- Check browser console for errors.
- Check Supabase errors.
- Check mobile layout.
- Check authorization.
- Check RLS assumptions.

If a requirement is technically impossible using only browser + Supabase, explain the limitation and choose the safest Supabase-native approach.

## Deliverable

Return a complete working project, not a mockup.

All buttons must perform their intended action or explicitly show a not-yet-implemented state.

Do not leave fake data in production UI.
