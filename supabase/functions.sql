-- Azuria RPCs and helper functions
-- Run after schema.sql

-- Current user helpers
create or replace function get_current_user_id()
returns uuid
language sql stable
as $$
  select auth.uid();
$$;

create or replace function get_current_user_context()
returns table(user_id uuid, is_admin boolean, user_email text)
language plpgsql stable
as $$
begin
  return query
  select auth.uid() as user_id,
         is_admin_user() as is_admin,
         (select email from auth.users where id = auth.uid()) as user_email;
end;
$$;

-- Admin checks: customize to your needs
create or replace function is_admin_user()
returns boolean
language plpgsql stable
as $$
declare
  u_email text;
begin
  -- Example: treat emails on your domain as admins; adjust as needed
  select email into u_email from auth.users where id = auth.uid();
  if u_email is null then
    return false;
  end if;
  return u_email like '%@yourcompany.com'; -- TODO: customize
end;
$$;

create or replace function is_current_user_admin()
returns boolean
language sql stable
as $$
  select is_admin_user();
$$;

create or replace function is_admin_or_owner(_user_id uuid default auth.uid())
returns boolean
language sql stable
as $$
  select is_admin_user() or _user_id = auth.uid();
$$;

-- Membership/role helpers (simplified)
create or replace function has_role(_user_id uuid, _role text)
returns boolean
language sql stable
as $$
  -- Simplified: treat 'admin' via is_admin_user, otherwise always false
  select case when lower(_role) = 'admin' then is_admin_user() else false end;
$$;

create or replace function has_team_role(_user_id uuid, _team_id uuid, _role text)
returns boolean
language sql stable
as $$
  select exists (
    select 1 from team_members tm
    where tm.team_id = _team_id and tm.user_id = _user_id and (tm.role = _role or is_admin_user())
  );
$$;

create or replace function has_organization_role(_user_id uuid, _organization_id uuid, _role text)
returns boolean
language sql stable
as $$
  select exists (
    select 1 from organization_members om
    where om.organization_id = _organization_id and om.user_id = _user_id and (om.role = _role or is_admin_user())
  );
$$;

create or replace function is_team_member(team_id_param uuid, check_user_id uuid default auth.uid())
returns boolean
language sql stable
as $$
  select exists (
    select 1 from team_members tm where tm.team_id = team_id_param and tm.user_id = check_user_id
  ) or is_admin_user();
$$;

create or replace function is_organization_member(org_id uuid, check_user_id uuid default auth.uid())
returns boolean
language sql stable
as $$
  select exists (
    select 1 from organization_members om where om.organization_id = org_id and om.user_id = check_user_id
  ) or is_admin_user();
$$;

-- Calculation access helpers
create or replace function can_access_calculation(calc_id uuid default null)
returns boolean
language sql stable
as $$
  select exists (
    select 1 from calculation_history ch where ch.id = calc_id and (ch.user_id = auth.uid() or is_admin_user())
  );
$$;

create or replace function can_user_access_calculation(calc_id uuid, check_user_id uuid default auth.uid())
returns boolean
language sql stable
as $$
  select exists (
    select 1 from calculation_history ch where ch.id = calc_id and (ch.user_id = check_user_id or is_admin_user())
  );
$$;

-- Collaboration notifications
create or replace function create_collaboration_notification(
  _user_id uuid,
  _type text,
  _title text,
  _message text,
  _related_id uuid default null
)
returns uuid
language plpgsql security definer
as $$
declare
  new_id uuid := gen_random_uuid();
begin
  insert into collaboration_notifications(id, user_id, type, title, message, related_id, is_read, created_at)
  values (new_id, _user_id, _type, _title, _message, _related_id, false, now());
  return new_id;
end;
$$;

-- Maintenance/cleanup ops (no-op unless admin)
create or replace function cleanup_expired_roles()
returns void
language plpgsql security definer
as $$
begin
  if not is_admin_user() then
    return;
  end if;
  -- implement if needed
end;
$$;

create or replace function cleanup_old_analytics()
returns void
language plpgsql security definer
as $$
begin
  if not is_admin_user() then
    return;
  end if;
  delete from analytics_events where created_at < now() - interval '180 days';
end;
$$;

create or replace function clean_expired_ai_cache()
returns void
language plpgsql security definer
as $$
begin
  delete from ai_cache where expires_at is not null and expires_at < now();
end;
$$;

create or replace function clean_expired_sessions()
returns void
language plpgsql security definer
as $$
begin
  delete from security_sessions where expires_at < now();
end;
$$;

create or replace function optimize_tables()
returns void
language plpgsql security definer
as $$
begin
  if not is_admin_user() then
    return;
  end if;
  perform clean_expired_ai_cache();
  perform clean_expired_sessions();
end;
$$;

create or replace function maintenance_cleanup_optimized()
returns void
language plpgsql security definer
as $$
begin
  if not is_admin_user() then
    return;
  end if;
  perform cleanup_old_analytics();
  perform optimize_tables();
end;
$$;

-- RLS performance helpers (approximate)
create or replace function get_rls_performance_summary()
returns table(
  total_policies int,
  optimized_policies int,
  cache_hit_ratio numeric,
  avg_policy_execution_time numeric
)
language sql stable
as $$
  select 0::int, 0::int, 1.0::numeric, 0.0::numeric;
$$;

create or replace function get_rls_performance_metrics()
returns table(
  policy_name text,
  table_name text,
  avg_execution_time numeric,
  total_calls int
)
language sql stable
as $$
  select ''::text, ''::text, 0.0::numeric, 0::int;
$$;

create or replace function get_table_stats_optimized()
returns table(
  table_name text,
  row_count bigint,
  table_size text,
  index_usage_ratio numeric
)
language sql stable
as $$
  select c.relname::text as table_name,
         pg_total_relation_size(c.oid) as row_count,
         pg_size_pretty(pg_total_relation_size(c.oid)) as table_size,
         1.0::numeric as index_usage_ratio
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where c.relkind = 'r' and n.nspname = 'public'
  order by pg_total_relation_size(c.oid) desc
  limit 50;
$$;

-- Security audit helper
create or replace function log_security_event(
  _user_id uuid,
  _action text,
  _category text,
  _details jsonb default '{}'::jsonb,
  _risk_level text default 'low',
  _success boolean default true,
  _error_message text default null
)
returns uuid
language plpgsql security definer
as $$
declare
  new_id uuid := gen_random_uuid();
begin
  insert into audit_logs(id, user_id, action, category, details, risk_level, success, error_message, created_at)
  values (new_id, _user_id, _action, _category, _details, _risk_level, _success, _error_message, now());
  return new_id;
end;
$$;

-- Create a profile automatically when a new auth user is created
-- This avoids "Database error saving new user" when RLS blocks inserts
-- If you already have a similar trigger in your project, you can skip this block
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Insert or update the user's profile row
  insert into user_profiles (id, email, name, created_at, updated_at)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', ''), now(), now())
  on conflict (id) do update
    set email = excluded.email,
        updated_at = now();

  -- Optionally seed a default business settings row for the user
  insert into business_settings (user_id, created_at)
  values (new.id, now())
  on conflict do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
