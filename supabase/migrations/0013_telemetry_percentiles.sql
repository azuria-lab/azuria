-- sql-lint-disable
-- 0013_telemetry_percentiles.sql
-- Adds SQL function to compute percentiles over performance_reports table
-- for the last N days using ordered-set aggregates (percentile_cont) for
-- more accurate results vs JS approximation. Safe to run multiple times
-- (CREATE OR REPLACE) and read-only for anon role via existing RLS.

CREATE OR REPLACE FUNCTION public.telemetry_percentiles(
  days_window integer DEFAULT 7
)
RETURNS TABLE (
    metric text,
    count bigint,
    min numeric,
    max numeric,
    avg numeric,
    p50 numeric,
    p75 numeric,
    p95 numeric,
    p99 numeric
) AS $$
  SELECT
    metric_name AS metric,
    COUNT(*)::bigint AS count,
    MIN(value)::numeric AS min,
    MAX(value)::numeric AS max,
    AVG(value)::numeric AS avg,
    percentile_cont(0.50) WITHIN GROUP (ORDER BY value)::numeric AS p50,
    percentile_cont(0.75) WITHIN GROUP (ORDER BY value)::numeric AS p75,
    percentile_cont(0.95) WITHIN GROUP (ORDER BY value)::numeric AS p95,
    percentile_cont(0.99) WITHIN GROUP (ORDER BY value)::numeric AS p99
  FROM performance_reports
  WHERE received_at >= (NOW() - make_interval(days => days_window))
  GROUP BY metric_name
  ORDER BY COUNT(*) DESC;
$$ LANGUAGE sql STABLE;

COMMENT ON FUNCTION public.telemetry_percentiles(integer)
IS 'Returns percentile stats for telemetry metrics over the last N days';
