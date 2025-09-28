#!/usr/bin/env node
/**
 * Lists existing user tables in schema public (excluding Supabase internal). Ordered alphabetically.
 */
import { Client } from 'pg';
import { inspect } from 'node:util';

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
  const client = new Client(buildConfig());
  await client.connect();
  const q = `SELECT table_name
            FROM information_schema.tables
            WHERE table_schema='public'
              AND table_type='BASE TABLE'
            ORDER BY table_name`;
  const { rows } = await client.query(q);
  console.log(rows.map(r => r.table_name).join('\n'));
  await client.end();
}

main().catch(e => { console.error(e); process.exit(1); });