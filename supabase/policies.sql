-- Azuria RLS Policies
-- Run after schema.sql and functions.sql

-- Enable RLS
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

-- Helpers: coalesce auth.uid() for anon safety
create or replace function _current_uid()
returns uuid language sql stable as $$ select auth.uid() $$;

-- Generic owner policies (user_id = auth.uid())
do $$ begin
  perform 1;
exception when others then
  -- ignore
end $$;

-- User profiles: user can access only their own row
create policy if not exists self_select on user_profiles
  for select using (id = auth.uid());
create policy if not exists self_insert on user_profiles
  for insert with check (id = auth.uid());
create policy if not exists self_update on user_profiles
  for update using (id = auth.uid()) with check (id = auth.uid());
create policy if not exists self_delete on user_profiles
  for delete using (id = auth.uid());

create policy if not exists owner_select on business_settings
  for select using (user_id = auth.uid());
create policy if not exists owner_ins on business_settings
  for insert with check (user_id = auth.uid());
create policy if not exists owner_upd on business_settings
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy if not exists owner_del on business_settings
  for delete using (user_id = auth.uid());

create policy if not exists owner_select on business_kpis
  for select using (coalesce(user_id, auth.uid()) = auth.uid());
create policy if not exists owner_cud on business_kpis
  for all using (coalesce(user_id, auth.uid()) = auth.uid()) with check (coalesce(user_id, auth.uid()) = auth.uid());

create policy if not exists owner_select on calculation_history
  for select using (coalesce(user_id, auth.uid()) = auth.uid() or exists (
    select 1 from calculation_shares cs where cs.calculation_id = id and (cs.shared_with = auth.uid() or cs.shared_by = auth.uid())
  ));
create policy if not exists owner_cud on calculation_history
  for all using (coalesce(user_id, auth.uid()) = auth.uid()) with check (coalesce(user_id, auth.uid()) = auth.uid());

create policy if not exists owner_select on ai_cache
  for select using (coalesce(user_id, auth.uid()) = auth.uid());
create policy if not exists owner_cud on ai_cache
  for all using (coalesce(user_id, auth.uid()) = auth.uid()) with check (coalesce(user_id, auth.uid()) = auth.uid());

create policy if not exists owner_select on analytics_events
  for select using (coalesce(user_id, auth.uid()) = auth.uid());
create policy if not exists owner_ins on analytics_events
  for insert with check (coalesce(user_id, auth.uid()) = auth.uid());

create policy if not exists owner_select on analytics_metrics
  for select using (coalesce(user_id, auth.uid()) = auth.uid());
create policy if not exists owner_cud on analytics_metrics
  for all using (coalesce(user_id, auth.uid()) = auth.uid()) with check (coalesce(user_id, auth.uid()) = auth.uid());

create policy if not exists owner_select on security_sessions
  for select using (user_id = auth.uid());
create policy if not exists owner_cud on security_sessions
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy if not exists owner_select on dashboard_configurations
  for select using (user_id = auth.uid());
create policy if not exists owner_cud on dashboard_configurations
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy if not exists owner_select on product_performance
  for select using (user_id = auth.uid());
create policy if not exists owner_cud on product_performance
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy if not exists owner_select on sales_data
  for select using (user_id = auth.uid());
create policy if not exists owner_ins on sales_data
  for insert with check (user_id = auth.uid());

create policy if not exists owner_select on subscribers
  for select using (coalesce(user_id, auth.uid()) = auth.uid());
create policy if not exists owner_cud on subscribers
  for all using (coalesce(user_id, auth.uid()) = auth.uid()) with check (coalesce(user_id, auth.uid()) = auth.uid());

create policy if not exists owner_select on collaboration_notifications
  for select using (coalesce(user_id, auth.uid()) = auth.uid());
create policy if not exists owner_cud on collaboration_notifications
  for all using (coalesce(user_id, auth.uid()) = auth.uid()) with check (coalesce(user_id, auth.uid()) = auth.uid());

create policy if not exists owner_select on two_factor_auth
  for select using (user_id = auth.uid());
create policy if not exists owner_cud on two_factor_auth
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Templates: allow read for public, write by creator/admin
create policy if not exists public_read_templates on calculation_templates
  for select using (true);
create policy if not exists creator_write_templates on calculation_templates
  for all using (coalesce(created_by, auth.uid()) = auth.uid() or is_admin_user()) with check (coalesce(created_by, auth.uid()) = auth.uid() or is_admin_user());

-- Organizations/Teams: read if member, write if member or admin
create policy if not exists member_read_organizations on organizations
  for select using (
    is_admin_user() or exists (select 1 from organization_members om where om.organization_id = id and om.user_id = auth.uid())
  );
create policy if not exists admin_write_organizations on organizations
  for all using (is_admin_user()) with check (is_admin_user());

create policy if not exists member_read_organization_members on organization_members
  for select using (
    is_admin_user() or exists (select 1 from organization_members om where om.organization_id = organization_members.organization_id and om.user_id = auth.uid())
  );
create policy if not exists admin_write_organization_members on organization_members
  for all using (is_admin_user()) with check (is_admin_user());

create policy if not exists member_read_teams on teams
  for select using (
    is_admin_user() or exists (select 1 from team_members tm where tm.team_id = id and tm.user_id = auth.uid())
  );
create policy if not exists admin_write_teams on teams
  for all using (is_admin_user()) with check (is_admin_user());

create policy if not exists member_read_team_members on team_members
  for select using (
    is_admin_user() or exists (select 1 from team_members tm where tm.team_id = team_members.team_id and tm.user_id = auth.uid())
  );
create policy if not exists admin_write_team_members on team_members
  for all using (is_admin_user()) with check (is_admin_user());

create policy if not exists member_read_stores on stores
  for select using (
    is_admin_user() or exists (
      select 1 from organization_members om where om.organization_id = stores.organization_id and om.user_id = auth.uid()
    )
  );
create policy if not exists admin_write_stores on stores
  for all using (is_admin_user()) with check (is_admin_user());

-- Automation tables are user-owned
create policy if not exists owner_cud on automation_rules for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy if not exists owner_cud on automation_executions for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy if not exists owner_cud on automation_workflows for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy if not exists owner_cud on workflow_approvals for all using (requested_by = auth.uid() or approver_id = auth.uid()) with check (requested_by = auth.uid() or approver_id = auth.uid());
create policy if not exists owner_cud on automation_alerts for all using (user_id = auth.uid()) with check (user_id = auth.uid());
