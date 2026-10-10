# AUTH.md — Authentication Flow

## 1. Supabase client

Create:

```text
js/
  supabase.js
```

It initializes:

```javascript
const supabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);
```

Use a config file for local development, but never put private service credentials there.

## 2. Login

Flow:

```text
Login form
   ↓
supabase.auth.signInWithPassword()
   ↓
getSession()
   ↓
load profile
   ↓
check role
   ↓
redirect Dashboard
```

## 3. Register

Flow:

```text
Register form
   ↓
validate username/email/password
   ↓
supabase.auth.signUp()
   ↓
profile created with USER role
   ↓
show email verification message if enabled
```

The browser must never be able to register itself as ADMIN.

## 4. Forgot Password

```text
Email
 ↓
supabase.auth.resetPasswordForEmail()
 ↓
email reset link
 ↓
Reset Password page
 ↓
supabase.auth.updateUser({ password })
```

## 5. Route protection

Every protected page must call a shared authentication guard.

Example:

```javascript
async function requireAuth() {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    window.location.href = "login.html";
    return null;
  }

  return session;
}
```

Admin pages additionally require profile role ADMIN.

## 6. Logout

Use:

```javascript
await supabase.auth.signOut();
window.location.href = "login.html";
```

## 7. Session listener

Use:

```javascript
supabase.auth.onAuthStateChange((event, session) => {
  // update UI / redirect when necessary
});
```
