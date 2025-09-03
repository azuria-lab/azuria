# Supabase Cloud Setup (Azuria)

This folder contains SQL to create the database schema, functions (RPCs), and Row-Level Security (RLS) policies for running Azuria against Supabase Cloud (not local).

Follow these steps to provision your Supabase project, apply the schema, and configure the frontend environment.

## 1) Create a Supabase project
- Go to https://supabase.com/dashboard and create a new project.
- Choose a strong database password and a region close to your users.

## 2) Apply the database schema and functions
- In your Supabase project, open SQL Editor.
- Run the contents of these files in order:
  1. `schema.sql` (types, tables, indexes, FKs)
  2. `functions.sql` (RPCs and helper functions)
  3. `policies.sql` (RLS enablement + policies)
  4. (optional) `seed.sql` (dados públicos de templates para testes)

Tip: You can paste each file in full and execute. If re-running, consider wrapping with `CREATE IF NOT EXISTS` checks.

## 3) Configure storage (optional)
If you need file storage (e.g., avatars), create buckets in Supabase Storage via Dashboard → Storage. Set public/private and policies as needed.

## 4) Set frontend environment variables
In your Vite app, configure the environment with your Supabase project URL and anon key. Update `.env` (or your hosting provider env vars) with:

- `VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co`
- `VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY`

If you prefer using `VITE_SUPABASE_PROJECT_ID` and `VITE_SUPABASE_PUBLISHABLE_KEY` instead, the client supports those as fallbacks.

## 5) Test in development
- Start your frontend locally and sign up/sign in using Supabase Auth. The app reads/writes rows under your account and respects RLS policies.

Quick checks after apply:
- Auth trigger created: in SQL editor, run `select proname from pg_proc where proname = 'handle_new_user'` → should return one row.
- RLS enabled: `select relname, relrowsecurity from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname in ('calculation_history','user_profiles');`

## Notes
- The maintenance RPCs (cleanup, optimize, etc.) are guarded and require admin privileges by design. The default implementation only allows execution by admin (currently returns false), so client calls may be no-ops. Adjust the `is_admin_user` function to your needs (e.g., based on email domain, a dedicated `admin_users` table, or Supabase Auth metadata) to enable them.
- Policies are conservative: most tables scope access to the row owner (`user_id = auth.uid()`). Some collaborative entities (organizations/teams) allow access if membership functions return true. Tune to your requirements.
- Functions that consult `auth.uid()` require RLS to be enabled and appropriate JWT configuration (default for Supabase).

## Troubleshooting
- If inserts fail with RLS denied, verify that your JWT is present (user is authenticated), and that policies include a `USING` and `WITH CHECK` clause matching your insert.
- If RPCs return permission denied, confirm the function `SECURITY DEFINER` and the guard logic in the function permits your user.
- Error "Database error saving new user" when signing up:
  - Cause: commonly happens when there is a trigger that writes to tables with RLS and the trigger function is not `SECURITY DEFINER`, or when there is no trigger to create the initial profile and app code expects it. We include a `public.handle_new_user` trigger (in `functions.sql`) that runs on `auth.users` insert and creates `user_profiles` and default `business_settings` for the new user.
  - Fix: Re-run `functions.sql` to create/replace the trigger and function. Then retry sign-up. Also ensure Authentication → URL Configuration includes your local URL (e.g., `http://localhost:8081`) in Site URL and Redirect URLs, and your password meets the app policy in `src/config/security.ts` (default requires 8+ chars, upper/lower/number/special).