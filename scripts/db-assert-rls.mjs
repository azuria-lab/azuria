#!/usr/bin/env node
/**
 * Validação rígida de RLS para CI.
 * Fails (exit code 1) se:
 *  - RLS não habilitado ou não FORCED
 *  - Policies faltantes ou extras
 */
import { Client } from 'pg';
import { RLS_TABLES, RLS_EXPECTED_POLICIES } from './lib/rls-constants.mjs';

function cfg() {
  if (process.env.DATABASE_URL) return { connectionString: process.env.DATABASE_URL };
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
  const client = new Client(cfg());
  await client.connect();
  const report = { tables: {}, ok: true };

  for (const full of RLS_TABLES) {
    const [schema, table] = full.split('.');
    const rel = await client.query(`
      SELECT c.relrowsecurity, c.relforcerowsecurity
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname=$1 AND c.relname=$2
    `, [schema, table]);
    const r = rel.rows[0] || { relrowsecurity: false, relforcerowsecurity: false };

    const pol = await client.query(`
      SELECT p.polname
      FROM pg_policy p
      JOIN pg_class c ON p.polrelid = c.oid
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname=$1 AND c.relname=$2
      ORDER BY p.polname
    `, [schema, table]);
    const actual = pol.rows.map(rp => rp.polname);
    const expected = RLS_EXPECTED_POLICIES[full] || [];
    const missing = expected.filter(e => !actual.includes(e));
    const extra = actual.filter(a => !expected.includes(a));

    const tableReport = {
      rls_enabled: r.relrowsecurity,
      rls_forced: r.relforcerowsecurity,
      policies: actual,
      missing,
      extra
    };
    if (!r.relrowsecurity || !r.relforcerowsecurity || missing.length || extra.length) {
      report.ok = false;
    }
    report.tables[full] = tableReport;
  }

  console.log(JSON.stringify(report, null, 2));
  await client.end();
  if (!report.ok) process.exit(1);
}

main().catch(e => { console.error(e); process.exit(1); });
