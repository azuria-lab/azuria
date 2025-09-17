#!/usr/bin/env node
/**
 * Verifica cabeçalhos de segurança mínimos em uma URL alvo.
 * Uso: node scripts/check-security-headers.mjs [url]
 * Se não informado, usa process.env.SECURITY_CHECK_URL ou http://localhost:4173
 */
import https from 'https';
import http from 'http';
import { URL } from 'url';

const target = process.argv[2] || process.env.SECURITY_CHECK_URL || 'http://localhost:4173';
const required = {
  'x-content-type-options': /nosniff/i,
  'x-frame-options': /deny|sameorigin/i,
  'referrer-policy': /strict-origin-when-cross-origin/i,
};

const optional = {
  'strict-transport-security': /max-age=/i,
  'content-security-policy': /default-src/i,
  'content-security-policy-report-only': /default-src/i,
};

function request(urlStr) {
  return new Promise((resolve, reject) => {
    const u = new URL(urlStr);
    const lib = u.protocol === 'https:' ? https : http;
    const req = lib.request({ method: 'GET', hostname: u.hostname, port: u.port, path: u.pathname || '/', timeout: 10000 }, res => {
      resolve(res.headers);
    });
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy(new Error('Timeout'));
    });
    req.end();
  });
}

function normalize(h) {
  const out = {};
  for (const k of Object.keys(h)) out[k.toLowerCase()] = h[k];
  return out;
}

function check(headers, spec, mandatory) {
  const results = [];
  for (const [name, pattern] of Object.entries(spec)) {
    const value = headers[name];
    if (!value) {
      results.push({ name, ok: false, reason: 'ausente', mandatory });
      continue;
    }
    if (!pattern.test(String(value))) {
      results.push({ name, ok: false, reason: `valor inesperado: ${value}`, mandatory });
    } else {
      results.push({ name, ok: true });
    }
  }
  return results;
}

(async () => {
  try {
    const headers = normalize(await request(target));
    const requiredResults = check(headers, required, true);
    const optionalResults = check(headers, optional, false);
    const all = [...requiredResults, ...optionalResults];

    let failed = all.filter(r => r.mandatory && !r.ok);

    console.log(`# Security Headers Check: ${target}`);
    for (const r of all) {
      const status = r.ok ? 'OK' : (r.mandatory ? 'FAIL' : 'WARN');
      const extra = r.ok ? '' : ` - ${r.reason}`;
      console.log(`${status.padEnd(5)} ${r.name}${extra}`);
    }

    if (failed.length) {
      console.error(`\nFalha: ${failed.length} cabeçalho(s) obrigatórios ausentes/incorretos.`);
      process.exit(1);
    } else {
      console.log('\nTodos cabeçalhos obrigatórios presentes.');
    }
  } catch (e) {
    console.error('Erro ao verificar cabeçalhos:', e.message);
    process.exit(2);
  }
})();
