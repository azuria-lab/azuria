# Observability & Telemetry

This document summarizes the observability implementation: runtime environment validation,
telemetry ingestion, persistence, aggregation, and feature flags.

## Goals

* Capture core Web Vitals & custom performance metrics
* Support incremental rollout (feature flag + dev disable)
* Preserve backward compatibility with legacy batch payload format
* Provide a lightweight summary aggregation endpoint
* Enforce strict input validation (Zod) and truncate oversized meta payloads

## Architecture Overview

Flow (high level):

`Client (web vitals) -> POST /api/telemetry -> validate + (flag) persist -> Supabase (performance_reports) -> GET /api/telemetry/summary`

```text
+-------------+      batched JSON       +------------------+   async insert   +------------------------------+
| Browser     |  -------------------->  | /api/telemetry   |  --------------> | Supabase performance_reports |
| (web vitals)|                          |  (validate +     |                  |  (storage & indexing)        |
|             |                          |   flag-check)    |                  +------------------------------+
+-------------+                          +---------+--------+
                                                   |
                                                   | p50/p75/p95/p99 (JS compute)
                                                   v
                                          +-----------------------+
                                          | /api/telemetry/summary|
                                          +-----------------------+
```

## Environment & Flag

* `ENABLE_TELEMETRY_PERSIST`: When `'false'` persistence is disabled (`persisted: false`).
* Persistence automatically disabled in `development` regardless of flag.
* Flag read dynamically each request; Supabase credentials resolved via `src/lib/runtimeEnv.ts` coalescing.

## Validation

* `TelemetryMetricSchema` enforces required shape (`name`, `value`) + optional fields.
* Legacy batch payloads converted then re-validated per metric.
* Invalid JSON => `400 { error: 'invalid-json' }`.
* Zero valid metrics => `400 { error: 'no-valid-metrics' }`.

## Persistence

Implemented in `src/services/telemetry/persistPerformance.ts`:

* Truncates oversize `meta` (> 4000 chars JSON) to `{ truncated: true }`.
* Derives `path` from `url` if absent.
* Inserts batch; warnings logged but route never throws on insert error.

Supabase table (`supabase/performance_reports.sql`):

* Indexed by `received_at`, `metric_name`, `(session_id, metric_name)`, `(path, metric_name)`.
* `rating` constrained to `good | needs-improvement | poor`.

## Summary Endpoint

`GET /api/telemetry/summary?days=7`

* Optional `days` (1–90, default 7).
* In-process percentiles (p50, p75, p95, p99) + min/max/avg per metric.
* 15s in-memory cache reduces DB load.
* Response example:

```json
{
  "ok": true,
  "days": 7,
  "cached": false,
  "metrics": [
    {
      "metric": "LCP",
      "count": 123,
      "min": 1200,
      "max": 3800,
      "avg": 2100.5,
      "p50": 2050,
      "p75": 2600,
      "p95": 3400,
      "p99": 3700
    }
  ]
}
```

## Security & Governance

* Security headers + CSP set in `middleware.ts` (CSP, HSTS, Referrer-Policy, Permissions-Policy, etc.).
* Current CSP temporarily allows `'unsafe-inline'` & `'unsafe-eval'` (dev / hydration). Plan: remove via nonces or hashed scripts.
* Middleware also performs heuristic auth gating; not a substitute for server-side authorization/RLS.

## Testing

* `telemetryRoute.test.ts` covers ingestion variants and flag disable path.
* `telemetryPersistence.test.ts` covers path derivation & meta truncation.
* `telemetrySummary.test.ts` validates aggregation, cache, invalid `days`.

## Future Enhancements

* Server-side percentile calculation (SQL ordered-set aggregates).
* Sampling / user opt-out.
* Release/version tagging.
* Retention policy job (e.g. prune > 90 days).
* Dashboard visualization.
* Additional metrics (long tasks, INP).

## Troubleshooting

* Unexpected persistence locally: ensure `NODE_ENV=development` or flag `'false'`.
* Look for `[telemetry]` console logs (counts / insert warnings).
* Credential misconfig: runtime will throw when creating Supabase client.

## Conventions

* Conventional commits: `feat(observability): ...`, `perf:`, `chore(security):`.
* Namespace: `/api/telemetry/*` for all related endpoints.

## Retention & Pruning

Two supported paths:

1. Raw SQL (Postgres) – files:

* `supabase/retention_prune_performance_reports.sql`
* `supabase/retention_prune_performance_reports.psql`

Run via Supabase dashboard (SQL editor) or schedule with `pg_cron`:

```sql
SELECT cron.schedule(
  'telemetry_prune_daily',
  '0 2 * * *',
  $$DELETE FROM public.performance_reports
   WHERE received_at < now() - INTERVAL '90 day';$$
);
```

(Adjust retention window as needed.)

1. Node script (REST PostgREST delete):

* `scripts/retention-prune.mjs`
* NPM script: `npm run telemetry:prune`

Requires `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` in env (service role recommended for delete).

Why both? Some linters or pipelines mis-parse Postgres `INTERVAL` syntax; Node variant avoids dialect friction.

### Choosing an Approach

* High trust internal infra -> prefer SQL (atomic, minimal network hops).
* External CI without psql -> use Node script.
* Need custom logic (e.g. archive before delete) -> fork Node script.

### Observability of Prunes

Currently silent. Consider adding an audit table or logging row count deleted per run if governance requires.

---

Last updated: (auto-generated)
