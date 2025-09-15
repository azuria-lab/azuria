-- Azuria Supabase schema
-- Run this first in Supabase SQL Editor

-- Enable useful extensions
create extension if not exists pgcrypto;
create extension if not exists pg_stat_statements;

-- Enums
create type template_status as enum ('draft', 'published', 'archived');
create type template_category as enum (
  'ecommerce','restaurante','servicos','artesanal','saas','varejo','industria','consultoria','outros'
);

-- Tables
create table if not exists user_profiles (
  id uuid primary key,
  email text,
  name text,
  avatar_url text,
  is_pro boolean,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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

create table if not exists calculation_comments (
  id uuid primary key default gen_random_uuid(),
  calculation_id uuid references calculation_history(id) on delete cascade,
  user_id uuid,
  content text not null,
  parent_id uuid references calculation_comments(id) on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz
);

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

create table if not exists calculation_shares (
  id uuid primary key default gen_random_uuid(),
  calculation_id uuid references calculation_history(id) on delete cascade,
  shared_by uuid,
  shared_with uuid,
  permission_level text,
  created_at timestamptz default now(),
  expires_at timestamptz
);

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

create table if not exists template_favorites (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references calculation_templates(id) on delete cascade,
  user_id uuid not null,
  created_at timestamptz not null default now()
);

create table if not exists template_reviews (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references calculation_templates(id) on delete cascade,
  user_id uuid not null,
  rating int not null,
  comment text,
  created_at timestamptz not null default now()
);

create table if not exists template_purchases (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references calculation_templates(id) on delete cascade,
  user_id uuid not null,
  purchase_price numeric not null,
  purchased_at timestamptz not null default now()
);

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

create table if not exists teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null,
  plan text not null default 'free',
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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

create table if not exists two_factor_auth (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  secret text not null,
  backup_codes text[],
  is_enabled boolean,
  last_used_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists idx_calc_hist_user on calculation_history(user_id);
create index if not exists idx_analytics_events_user on analytics_events(user_id);
create index if not exists idx_audit_logs_user on audit_logs(user_id);
create index if not exists idx_org_members_org on organization_members(organization_id);
create index if not exists idx_team_members_team on team_members(team_id);
create index if not exists idx_rules_user on automation_rules(user_id);
create index if not exists idx_exec_rule on automation_executions(rule_id);
