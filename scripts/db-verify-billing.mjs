#!/usr/bin/env node
/**
 * Verification script for billing core tables (invoices, transactions).
 * Performs existence checks and runs lightweight sample queries.
 */
import { Client } from 'pg';

const TABLES = [
  'public.invoices',
  'public.transactions'
];

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
  const report = { tables: {}, constraints: {}, indexes: {}, ok: true };
  for (const full of TABLES) {
    const [schema, table] = full.split('.');
    const exists = await client.query(
      `SELECT 1 FROM information_schema.tables WHERE table_schema=$1 AND table_name=$2`,
      [schema, table]
    );
    report.tables[full] = !!exists.rowCount;
    if (!exists.rowCount) { report.ok = false; continue; }
    const sample = await client.query(`SELECT * FROM ${full} LIMIT 1`);
    report.tables[full + '_columns'] = sample.fields.map(f => f.name);
    // indexes
    const idx = await client.query(
      `SELECT indexname, indexdef FROM pg_indexes WHERE schemaname=$1 AND tablename=$2 ORDER BY indexname`,
      [schema, table]
    );
    report.indexes[full] = idx.rows.map(r => r.indexname);
  }
  console.log(JSON.stringify(report, null, 2));
  await client.end();
  if (!report.ok) process.exitCode = 1;
}

main().catch(e => { console.error(e); process.exit(1); });