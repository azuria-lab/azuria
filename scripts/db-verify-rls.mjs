#!/usr/bin/env node
/**
 * Verification script for RLS policies on billing tables.
 * Checks that expected policies exist (and no unexpected ones) for invoices & transactions.
 * Exits with code 1 if any expected policy is missing or unexpected extras are found.
 */
import { Client } from 'pg';

const TABLES = [
  { schema: 'public', table: 'invoices' },
  { schema: 'public', table: 'transactions' }
];

// Expected policies keyed by table: [policy_name]
const EXPECTED = {
  'public.invoices': [
    'invoices_select_same_tenant',
    'invoices_insert_same_tenant',
    'invoices_update_same_tenant',
    'invoices_delete_same_tenant'
  ],
  'public.transactions': [
    'transactions_select_same_tenant',
    'transactions_insert_same_tenant',
    'transactions_update_same_tenant',
    'transactions_delete_same_tenant'
  ]
};

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
  const report = { policies: {}, missing: {}, extra: {}, ok: true };

  for (const { schema, table } of TABLES) {
    const fq = `${schema}.${table}`;
    // fetch policies
    const res = await client.query(
      `SELECT polname, array_to_string(polroles, ',') AS roles, polcmd, polpermissive
       FROM pg_policy p
       JOIN pg_class c ON p.polrelid = c.oid
       JOIN pg_namespace n ON c.relnamespace = n.oid
       WHERE n.nspname = $1 AND c.relname = $2
       ORDER BY polname`,
      [schema, table]
    );
    const actual = res.rows.map(r => r.polname);
    report.policies[fq] = actual;
    const expected = EXPECTED[fq] || [];
    const missing = expected.filter(e => !actual.includes(e));
    const extra = actual.filter(a => !expected.includes(a));
    if (missing.length) { report.missing[fq] = missing; report.ok = false; }
    if (extra.length) { report.extra[fq] = extra; report.ok = false; }
  }

  console.log(JSON.stringify(report, null, 2));
  await client.end();
  if (!report.ok) process.exitCode = 1;
}

main().catch(err => { console.error(err); process.exit(1); });
