# TESTING.md — Acceptance Checklist

## Authentication

- [ ] Login valid account
- [ ] Login invalid password
- [ ] Register new USER
- [ ] Register cannot become ADMIN
- [ ] Forgot password sends email
- [ ] Reset password works
- [ ] Logout works
- [ ] Unauthenticated user cannot access dashboard
- [ ] USER cannot access ADMIN-only functions

## Dashboard

- [ ] Total video count correct
- [ ] Total views correct
- [ ] Storage correct
- [ ] Top 10 chart correct
- [ ] Line chart correct
- [ ] Date filter works
- [ ] Empty dataset works
- [ ] Query error handled

## Videos

- [ ] List loads
- [ ] Search works
- [ ] Category filter works
- [ ] Pagination works
- [ ] Create works
- [ ] Edit works
- [ ] Delete confirmation works
- [ ] Delete removes/cleans storage correctly
- [ ] Thumbnail displays
- [ ] Invalid file rejected
- [ ] Oversized file rejected

## Users

- [ ] ADMIN can see users
- [ ] USER cannot manage users
- [ ] Role change respects RLS
- [ ] Status change respects RLS

## Security

- [ ] RLS enabled
- [ ] No service_role key in frontend
- [ ] No plaintext password table
- [ ] HTML output escaped
- [ ] Delete requires confirmation
- [ ] Storage policies tested

## Responsive

- [ ] Desktop
- [ ] Tablet
- [ ] Mobile
- [ ] Sidebar collapse
- [ ] Table horizontal scrolling
- [ ] Charts fit viewport
