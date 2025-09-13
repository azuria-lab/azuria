#!/usr/bin/env node
/**
 * Gera inventário de licenças de dependências (THIRD_PARTY_LICENSES.md)
 * Uso: node scripts/generate-licenses.mjs
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';

const require = createRequire(import.meta.url);
const PKG = JSON.parse(readFileSync('package.json', 'utf8'));

// Direct dependencies (prod + dev) — optionally, we could expand recursively
const deps = {
  ...(PKG.dependencies || {}),
  ...(PKG.devDependencies || {}),
};

function getRepositoryUrl(pkgJson) {
  if (typeof pkgJson.repository === 'string') {
    return pkgJson.repository;
  } else if (pkgJson.repository && typeof pkgJson.repository.url === 'string') {
    return pkgJson.repository.url;
  }
  return '';
}

function loadPackageMeta(name) {
  try {
    const pkgPath = require.resolve(`${name}/package.json`, { paths: [process.cwd()] });
    const pkgJson = JSON.parse(readFileSync(pkgPath, 'utf8'));
    return {
      name,
      version: pkgJson.version,
      license: pkgJson.license || 'UNKNOWN',
      homepage: pkgJson.homepage || '',
      repository: getRepositoryUrl(pkgJson)
    };
  } catch (e) {
    console.error(`Erro ao carregar metadados do pacote "${name}":`, e && e.message ? e.message : String(e));
    return { name, version: 'UNKNOWN', license: 'UNKNOWN', homepage: '', repository: '' };
  }
}

const records = Object.keys(deps).sort().map(loadPackageMeta);

// Agrupar licenças para sumário
const byLicense = records.reduce((acc, r) => {
  acc[r.license] = (acc[r.license] || 0) + 1;
  return acc;
}, {});

const now = new Date().toISOString();

let out = '';
out += '# Inventário de Licenças de Terceiros\n\n';
out += `Gerado em: ${now} (script: scripts/generate-licenses.mjs)\n\n`;
out += 'Este arquivo lista as dependências diretas e suas licenças declaradas. Dependências transitivas podem possuir outras licenças; para um SBOM completo utilize ferramentas especializadas (ex: syft, license-checker, osv-scanner).\n\n';

out += '## Resumo por Licença\n\n';
Object.entries(byLicense).sort((a,b)=>a[0].localeCompare(b[0])).forEach(([lic, count]) => {
  out += `- ${lic}: ${count}\n`;
});

out += '\n## Detalhes das Dependências\n\n';
out += '| Pacote | Versão | Licença | Origem |\n|--------|--------|---------|--------|\n';
records.forEach(r => {
  const source = r.homepage || r.repository || '';
  out += `| ${r.name} | ${r.version} | ${r.license} | ${source} |\n`;
});

writeFileSync('THIRD_PARTY_LICENSES.md', out, 'utf8');
console.log('THIRD_PARTY_LICENSES.md gerado com', records.length, 'dependências.');
