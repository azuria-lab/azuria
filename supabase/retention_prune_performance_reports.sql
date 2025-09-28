-- Retention pruning for performance_reports table
-- sql-lint-disable
-- Deletes rows older than 90 days.
-- Schedule via Supabase cron (pg_cron) or external job runner.
-- Idempotent: safe to run periodically.

-- Postgres DELETE retains only last 90 days of telemetry
DELETE FROM public.performance_reports
WHERE received_at < now() - INTERVAL '90 day'; -- Postgres syntax
