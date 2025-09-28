#!/usr/bin/env node
/**
 * Gera sugestões de índices para invoices e transactions.
 * Estratégia:
 * 1. Usa pg_stat_statements (se disponível) para capturar padrões.
 * 2. Heurísticas fixas se extensão não estiver ativa.
 */
import { Client } from 'pg';
import { RLS_TABLES } from './lib/rls-constants.mjs';

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

const CANDIDATE_RULES = [
  {
    table: 'public.transactions',
    columns: ['tenant_id', 'occurred_at DESC'],
    reason: 'Filtragem/ordenacao temporal recorrente por tenant em dashboards',
    detect: (norm) => /from public\.transactions/i.test(norm) && /occurred_at/i.test(norm)
  },
  {
    table: 'public.invoices',
    columns: ['tenant_id', 'status', 'issued_at DESC'],
    reason: 'Listagens por status e ordenacao recente',
    detect: (norm) => /from public\.invoices/i.test(norm) && /status/i.test(norm) && /issued_at/i.test(norm)
  }
];

async function getStatStatements(client) {
  try {
    const res = await client.query(`SELECT 1 FROM pg_extension WHERE extname='pg_stat_statements'`);
    if (!res.rowCount) return { enabled: false, rows: [] };
    const q = await client.query(`
      SELECT query, calls, total_exec_time
      FROM pg_stat_statements
      WHERE query ILIKE '%public.invoices%' OR query ILIKE '%public.transactions%'
      ORDER BY calls DESC
      LIMIT 50
    `);
    return { enabled: true, rows: q.rows };
  } catch (e) {
    return { enabled: false, rows: [], error: e.message };
  }
}

async function existingIndexes(client) {
  const map = {};
  for (const full of RLS_TABLES) {
    const [schema, table] = full.split('.');
    const idx = await client.query(
      `SELECT indexname, indexdef FROM pg_indexes WHERE schemaname=$1 AND tablename=$2`,
      [schema, table]
    );
    map[full] = idx.rows.map(r => r.indexdef);
  }
  return map;
}

function candidateFromRule(rule, indexMap) {
  const defLike = rule.columns
    .map(c => c.replace(/ DESC$/i,'').replace(/ ASC$/i,''))
    .join(', ');
  const existing = (indexMap[rule.table] || []).some(def => {
    return def.includes(defLike) && rule.columns.every(c => def.includes(c.split(' ')[0]));
  });
  return existing ? null : rule;
}

async function main() {
  const client = new Client(cfg());
  await client.connect();
  const stats = await getStatStatements(client);
  const idxMap = await existingIndexes(client);

  const normalized = stats.rows.map(r => r.query.replace(/\s+/g,' ').trim());
  const triggered = new Set();
  for (const q of normalized) {
    for (const rule of CANDIDATE_RULES) {
      if (rule.detect(q)) triggered.add(rule);
    }
  }
  const candidates = Array.from(triggered)
    .map(r => candidateFromRule(r, idxMap))
    .filter(Boolean);

  // Se extensão não ativa, sugerir baseline manual
  if (!stats.enabled) {
    for (const rule of CANDIDATE_RULES) {
      const c = candidateFromRule(rule, idxMap);
      if (c) candidates.push(c);
    }
  }

  const output = {
    pg_stat_statements_enabled: stats.enabled,
    error: stats.error || null,
    inspected_queries: stats.rows.length,
    existing_indexes: Object.fromEntries(Object.entries(idxMap).map(([t, defs]) => [t, defs.length])),
    candidates: candidates.map(c => ({ table: c.table, columns: c.columns, reason: c.reason }))
  };

  console.log(JSON.stringify(output, null, 2));
  await client.end();
  if (candidates.length === 0) process.exitCode = 0; // não é erro
}

main().catch(e => { console.error(e); process.exit(1); });
