#!/usr/bin/env node
/**
 * Node-based pruning script (alternative to raw SQL) for environments
 * where direct psql access or Postgres interval syntax linting is problematic.
 *
 * Usage (requires SUPABASE_SERVICE_ROLE_KEY or anon key with delete rights):
 *   node scripts/retention-prune.mjs --days 90
 */
import fetch from 'node-fetch';

const DAYS = parseInt(process.argv.includes('--days') ? process.argv[process.argv.indexOf('--days') + 1] : '90', 10);
if (!Number.isFinite(DAYS) || DAYS <= 0) {
  console.error('[retention] Invalid --days value');
  process.exit(1);
}

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
if (!url || !serviceKey) {
  console.error('[retention] Missing SUPABASE_URL or key env');
  process.exit(1);
}

const cutoff = new Date(Date.now() - DAYS * 86400_000).toISOString();

(async () => {
  // Uses PostgREST delete filter syntax
  const endpoint = `${url}/rest/v1/performance_reports?received_at=lt.${cutoff}`;
  const res = await fetch(endpoint, {
    method: 'DELETE',
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`
    }
  });
  if (!res.ok) {
    console.error('[retention] Delete failed', res.status, await res.text());
    process.exit(1);
  }
  const remaining = await fetch(`${url}/rest/v1/performance_reports?select=count`, {
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` }
  });
  console.log('[retention] prune complete status', res.status, 'remaining count meta maybe', await remaining.text());
})();
