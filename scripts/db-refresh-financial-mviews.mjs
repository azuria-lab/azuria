#!/usr/bin/env node
/**
 * Script para atualizar materialized views financeiras.
 * Se --init for passado, faz primeiro REFRESH sem CONCURRENTLY para popular dados (caso criadas WITH NO DATA).
 */
import { Client } from 'pg';

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
  const init = process.argv.includes('--init');
  const client = new Client(cfg());
  await client.connect();
  const start = Date.now();
  try {
    if (init) {
      console.log('Inicializando materialized views (primeiro load)...');
      await client.query('REFRESH MATERIALIZED VIEW public.mv_invoice_monthly_totals');
      await client.query('REFRESH MATERIALIZED VIEW public.mv_invoice_aging');
    } else {
      console.log('Atualizando materialized views (CONCURRENTLY)...');
      await client.query('REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_invoice_monthly_totals');
      await client.query('REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_invoice_aging');
    }
    const ms = Date.now() - start;
    console.log(JSON.stringify({ ok: true, init, elapsed_ms: ms }, null, 2));
  } catch (e) {
    console.error(e);
    console.log(JSON.stringify({ ok: false, error: e.message }, null, 2));
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

main();
