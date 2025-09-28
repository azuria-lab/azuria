#!/usr/bin/env node
/**
 * Simple DB health check: prints current timestamp from PostgreSQL (SELECT now()).
 * Usage: npm run db:health
 *
 * Connection resolution order:
 * 1. DATABASE_URL (postgres://...)
 * 2. Individual PG* env vars (PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD, PGSSLMODE)
 *
 * Exits with code 1 if connection fails.
 */
import { Client } from 'pg';

function buildConfig() {
  if (process.env.DATABASE_URL) {
    return { connectionString: process.env.DATABASE_URL };
  }
  const { PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD, PGSSLMODE } = process.env;
  return {
    host: PGHOST,
    port: PGPORT ? Number(PGPORT) : undefined,
    database: PGDATABASE,
    user: PGUSER,
    password: PGPASSWORD,
    ssl: PGSSLMODE === 'require' ? { rejectUnauthorized: false } : undefined
  };
}

async function main() {
  const config = buildConfig();
  const client = new Client(config);
  const started = Date.now();
  try {
    await client.connect();
    const res = await client.query('SELECT now() AS now, version() AS version');
    const ms = Date.now() - started;
    console.log(JSON.stringify({ ok: true, latency_ms: ms, now: res.rows[0].now, version: res.rows[0].version }, null, 2));
  } catch (err) {
    console.error(JSON.stringify({ ok: false, error: err.message }, null, 2));
    process.exitCode = 1;
  } finally {
    try { await client.end(); } catch {}
  }
}

main();