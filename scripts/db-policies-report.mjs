#!/usr/bin/env node
/**
 * Lista políticas RLS e se FORCE RLS está ativo para as tabelas alvo.
 * Saída: { tables: { <schema.table>: { rls_enabled, rls_forced, policies: [names] } } }
 */
import { Client } from 'pg';

const TARGET = ['public.invoices', 'public.transactions'];

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
  const report = { tables: {} };

  for (const full of TARGET) {
    const [schema, table] = full.split('.');
    const rel = await client.query(`
      SELECT c.relrowsecurity AS rls_enabled, c.relforcerowsecurity AS rls_forced
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = $1 AND c.relname = $2
    `, [schema, table]);
    const rls = rel.rows[0] || { rls_enabled: false, rls_forced: false };

    const pol = await client.query(`
      SELECT p.polname
      FROM pg_policy p
      JOIN pg_class c ON p.polrelid = c.oid
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = $1 AND c.relname = $2
      ORDER BY p.polname
    `, [schema, table]);

    report.tables[full] = {
      rls_enabled: rls.rls_enabled,
      rls_forced: rls.rls_forced,
      policies: pol.rows.map(r => r.polname)
    };
  }

  console.log(JSON.stringify(report, null, 2));
  await client.end();
}

main().catch(e => { console.error(e); process.exit(1); });
