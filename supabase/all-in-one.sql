-- Azuria Supabase: One-shot setup
-- Order: extensions/schema -> functions/trigger -> policies -> optional seed
-- Safe to rerun; uses IF EXISTS/IF NOT EXISTS and idempotent inserts

begin;

-- 1) Extensions and schema
\echo 'Applying schema...'
-- Enable useful extensions
create extension if not exists pgcrypto;
create extension if not exists pg_stat_statements;

-- Enums
create type if not exists template_status as enum ('draft', 'published', 'archived');
create type if not exists template_category as enum (
  'ecommerce','restaurante','servicos','artesanal','saas','varejo','industria','consultoria','outros'
);

-- Tables (subset abbreviated here defers to schema.sql content)
-- For canonical definitions, see schema.sql
-- Begin schema copy
-- user_profiles
create table if not exists user_profiles (
  id uuid primary key,
  email text,
  name text,
  avatar_url text,
  is_pro boolean,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
-- business_settings
create table if not exists business_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  default_card_fee numeric,
  default_margin numeric,
  default_shipping numeric,
  default_tax numeric,
  include_shipping_default boolean,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);
-- business_kpis
create table if not exists business_kpis (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  kpi_name text not null,
  kpi_type text not null,
  current_value numeric,
  target_value numeric,
  unit text,
  color text,
  icon text,
  is_active boolean,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
-- calculation_history
create table if not exists calculation_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  date timestamptz not null default now(),
  result jsonb not null,
  margin numeric not null,
  cost text not null,
  shipping text,
  tax text,
  card_fee text,
  other_costs text,
  include_shipping boolean,
  updated_at timestamptz
);
-- calculation_comments
create table if not exists calculation_comments (
  id uuid primary key default gen_random_uuid(),
  calculation_id uuid references calculation_history(id) on delete cascade,
  user_id uuid,
  content text not null,
  parent_id uuid references calculation_comments(id) on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz
);
-- calculation_approvals
create table if not exists calculation_approvals (
  id uuid primary key default gen_random_uuid(),
  calculation_id uuid references calculation_history(id) on delete cascade,
  requested_by uuid,
  approver_id uuid,
  status text,
  comment text,
  created_at timestamptz default now(),
  approved_at timestamptz
);
-- calculation_shares
create table if not exists calculation_shares (
  id uuid primary key default gen_random_uuid(),
  calculation_id uuid references calculation_history(id) on delete cascade,
  shared_by uuid,
  shared_with uuid,
  permission_level text,
  created_at timestamptz default now(),
  expires_at timestamptz
);
-- calculation_templates
create table if not exists calculation_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  image_url text,
  is_public boolean,
  is_premium boolean,
  price numeric,
  rating numeric,
  downloads_count int,
  category template_category not null,
  sector_specific_config jsonb not null default '{}'::jsonb,
  custom_formulas jsonb,
  default_values jsonb not null default '{}'::jsonb,
  status template_status,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
-- template_favorites
create table if not exists template_favorites (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references calculation_templates(id) on delete cascade,
  user_id uuid not null,
  created_at timestamptz not null default now()
);
-- template_reviews
create table if not exists template_reviews (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references calculation_templates(id) on delete cascade,
  user_id uuid not null,
  rating int not null,
  comment text,
  created_at timestamptz not null default now()
);
-- template_purchases
create table if not exists template_purchases (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references calculation_templates(id) on delete cascade,
  user_id uuid not null,
  purchase_price numeric not null,
  purchased_at timestamptz not null default now()
);
-- analytics_events
create table if not exists analytics_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  event_name text not null,
  event_data jsonb,
  session_id text,
  page_url text,
  user_agent text,
  ip_address inet,
  created_at timestamptz not null default now()
);
-- analytics_metrics
create table if not exists analytics_metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  metric_type text not null,
  metric_value numeric not null,
  date date not null default current_date,
  hour int not null default extract(hour from now()),
  metadata jsonb,
  created_at timestamptz not null default now()
);
-- business_metrics
create table if not exists business_metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  metric_type text not null,
  metric_value numeric not null,
  period_date date not null,
  period_type text not null,
  metadata jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
-- audit_logs
create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  session_id text,
  user_agent text,
  ip_address inet,
  action text not null,
  category text not null,
  risk_level text not null default 'low',
  success boolean not null default true,
  error_message text,
  details jsonb,
  created_at timestamptz default now()
);
-- security_sessions
create table if not exists security_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  session_token text not null,
  is_active boolean,
  user_agent text,
  ip_address inet,
  last_activity timestamptz,
  expires_at timestamptz not null,
  created_at timestamptz default now()
);
-- ai_cache
create table if not exists ai_cache (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  model text not null,
  prompt_hash text not null,
  response text not null,
  usage_count int,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);
-- organizations
create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  domain text,
  plan text not null default 'free',
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
-- organization_members
create table if not exists organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null,
  role text not null default 'member',
  permissions text[],
  stores_access text[],
  is_active boolean not null default true,
  invited_by uuid,
  invited_at timestamptz not null default now(),
  joined_at timestamptz
);
-- teams
create table if not exists teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null,
  plan text not null default 'free',
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
-- team_members
create table if not exists team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references teams(id) on delete cascade,
  user_id uuid not null,
  email text not null,
  name text not null,
  role text not null default 'member',
  permissions text[],
  avatar text,
  joined_at timestamptz not null default now(),
  last_active timestamptz
);
-- stores
create table if not exists stores (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  slug text not null,
  is_active boolean not null default true,
  address jsonb,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
-- automation_rules
create table if not exists automation_rules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null,
  description text,
  rule_type text not null,
  priority int not null default 0,
  is_active boolean not null default true,
  conditions jsonb not null default '{}'::jsonb,
  actions jsonb not null default '{}'::jsonb,
  schedule jsonb,
  tags text[],
  version int not null default 1,
  execution_count int not null default 0,
  last_executed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
-- automation_executions
create table if not exists automation_executions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  rule_id uuid not null references automation_rules(id) on delete cascade,
  status text not null,
  input_data jsonb,
  output_data jsonb,
  metadata jsonb,
  execution_time_ms int,
  error_message text,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);
-- automation_workflows
create table if not exists automation_workflows (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null,
  description text,
  trigger_type text not null,
  trigger_config jsonb not null,
  steps jsonb not null,
  approval_required boolean not null default false,
  approval_users uuid[],
  tags text[],
  run_count int not null default 0,
  last_run_at timestamptz,
  next_run_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
-- automation_templates
create table if not exists automation_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  category text not null,
  template_data jsonb not null,
  tags text[],
  rating numeric,
  is_public boolean not null default false,
  usage_count int not null default 0,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
-- workflow_approvals
create table if not exists workflow_approvals (
  id uuid primary key default gen_random_uuid(),
  workflow_id uuid references automation_workflows(id) on delete cascade,
  execution_id uuid,
  requested_by uuid not null,
  approver_id uuid,
  status text not null default 'pending',
  request_data jsonb,
  comment text,
  requested_at timestamptz not null default now(),
  responded_at timestamptz,
  expires_at timestamptz not null
);
-- automation_alerts
create table if not exists automation_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  rule_id uuid references automation_rules(id) on delete set null,
  title text not null,
  message text not null,
  alert_type text not null,
  severity text not null,
  notification_channels text[],
  is_read boolean not null default false,
  is_resolved boolean not null default false,
  resolved_at timestamptz,
  data jsonb,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);
-- dashboard_configurations
create table if not exists dashboard_configurations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  dashboard_name text not null default 'default',
  widget_layout jsonb not null default '{}'::jsonb,
  sharing_settings jsonb,
  template_type text,
  is_default boolean,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
-- product_performance
create table if not exists product_performance (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  product_name text not null,
  product_sku text,
  period_start date not null,
  period_end date not null,
  total_sales numeric,
  units_sold numeric,
  total_revenue numeric,
  conversion_rate numeric,
  clicks numeric,
  views numeric,
  avg_margin numeric,
  performance_status text,
  channel_breakdown jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
-- sales_data
create table if not exists sales_data (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  sale_date date not null,
  channel_name text not null,
  sale_value numeric not null,
  cost_value numeric,
  shipping_cost numeric,
  commission_fee numeric,
  advertising_cost numeric,
  product_id text,
  product_name text,
  profit_margin numeric,
  metadata jsonb,
  created_at timestamptz not null default now()
);
-- subscribers
create table if not exists subscribers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  email text not null,
  stripe_customer_id text,
  subscribed boolean not null default true,
  subscription_tier text,
  subscription_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
-- collaboration_notifications
create table if not exists collaboration_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  type text not null,
  title text not null,
  message text not null,
  related_id uuid,
  is_read boolean,
  created_at timestamptz default now()
);
-- two_factor_auth
create table if not exists two_factor_auth (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  secret text not null,
  backup_codes text[],
  is_enabled boolean,
  last_used_at timestamptz,
  created_at timestamptz default now()
);

-- Indexes
create index if not exists idx_calc_hist_user on calculation_history(user_id);
create index if not exists idx_analytics_events_user on analytics_events(user_id);
create index if not exists idx_audit_logs_user on audit_logs(user_id);
create index if not exists idx_org_members_org on organization_members(organization_id);
create index if not exists idx_team_members_team on team_members(team_id);
create index if not exists idx_rules_user on automation_rules(user_id);
create index if not exists idx_exec_rule on automation_executions(rule_id);

\echo 'Applying functions and triggers...'
-- 2) Functions & trigger for new auth user
create or replace function get_current_user_id()
returns uuid
language sql stable
as $$ select auth.uid(); $$;

create or replace function is_admin_user()
returns boolean
language plpgsql stable
as $$
declare u_email text; begin
  select email into u_email from auth.users where id = auth.uid();
  if u_email is null then return false; end if;
  return u_email like '%@yourcompany.com';
end; $$;

create or replace function is_admin_or_owner(_user_id uuid default auth.uid())
returns boolean language sql stable as $$ select is_admin_user() or _user_id = auth.uid(); $$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into user_profiles (id, email, name, created_at, updated_at)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name',''), now(), now())
  on conflict (id) do update set email = excluded.email, updated_at = now();
  insert into business_settings (user_id, created_at) values (new.id, now()) on conflict do nothing;
  return new;
end; $$;

-- Drop and recreate trigger safely
do $$ begin
  if exists (select 1 from pg_trigger t join pg_class c on t.tgrelid=c.oid join pg_namespace n on n.oid=c.relnamespace where t.tgname='on_auth_user_created' and n.nspname='auth' and c.relname='users') then
    execute 'drop trigger on_auth_user_created on auth.users';
  end if;
end $$;

create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

\echo 'Enabling RLS and applying policies...'
-- 3) RLS enable + policies (subset mirrors policies.sql)
alter table user_profiles enable row level security;
alter table business_settings enable row level security;
alter table business_kpis enable row level security;
alter table calculation_history enable row level security;
alter table calculation_comments enable row level security;
alter table calculation_approvals enable row level security;
alter table calculation_shares enable row level security;
alter table calculation_templates enable row level security;
alter table template_favorites enable row level security;
alter table template_reviews enable row level security;
alter table template_purchases enable row level security;
alter table analytics_events enable row level security;
alter table analytics_metrics enable row level security;
alter table audit_logs enable row level security;
alter table security_sessions enable row level security;
alter table ai_cache enable row level security;
alter table organizations enable row level security;
alter table organization_members enable row level security;
alter table teams enable row level security;
alter table team_members enable row level security;
alter table stores enable row level security;
alter table automation_rules enable row level security;
alter table automation_executions enable row level security;
alter table automation_workflows enable row level security;
alter table workflow_approvals enable row level security;
alter table automation_alerts enable row level security;
alter table dashboard_configurations enable row level security;
alter table product_performance enable row level security;
alter table sales_data enable row level security;
alter table subscribers enable row level security;
alter table collaboration_notifications enable row level security;
alter table two_factor_auth enable row level security;

-- Example owner/self policies
create policy if not exists self_select on user_profiles for select using (id = auth.uid());
create policy if not exists self_insert on user_profiles for insert with check (id = auth.uid());
create policy if not exists self_update on user_profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy if not exists self_delete on user_profiles for delete using (id = auth.uid());

create policy if not exists owner_select on business_settings for select using (user_id = auth.uid());
create policy if not exists owner_ins on business_settings for insert with check (user_id = auth.uid());
create policy if not exists owner_upd on business_settings for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy if not exists owner_del on business_settings for delete using (user_id = auth.uid());

create policy if not exists owner_select on calculation_history for select using (coalesce(user_id, auth.uid()) = auth.uid());
create policy if not exists owner_cud on calculation_history for all using (coalesce(user_id, auth.uid()) = auth.uid()) with check (coalesce(user_id, auth.uid()) = auth.uid());

create policy if not exists public_read_templates on calculation_templates for select using (true);
create policy if not exists creator_write_templates on calculation_templates for all using (coalesce(created_by, auth.uid()) = auth.uid() or is_admin_user()) with check (coalesce(created_by, auth.uid()) = auth.uid() or is_admin_user());

\echo 'Seeding public templates (optional)...'
-- 4) Optional seed
insert into calculation_templates (id, name, description, image_url, is_public, is_premium, price, rating, downloads_count, category, sector_specific_config, custom_formulas, default_values, status, created_by)
values (gen_random_uuid(),'Produto Físico Básico','Template para produtos físicos com impostos e taxa de cartão.',null,true,false,0,4.7,125,'varejo','{}'::jsonb,null,jsonb_build_object('defaultMargin',30,'defaultTax',10,'defaultCardFee',3.5,'includeShippingDefault',false),'published',null)
on conflict do nothing;

insert into calculation_templates (id, name, description, image_url, is_public, is_premium, price, rating, downloads_count, category, sector_specific_config, custom_formulas, default_values, status, created_by)
values (gen_random_uuid(),'Serviço Avançado','Template para serviços com foco em margem e hora técnica.',null,true,false,0,4.5,86,'servicos','{}'::jsonb,null,jsonb_build_object('defaultMargin',40,'defaultTax',0,'defaultCardFee',0,'includeShippingDefault',false),'published',null)
on conflict do nothing;

commit;

\echo 'Done.'
