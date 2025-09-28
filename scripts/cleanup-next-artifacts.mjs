#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const APP_DIR = path.join(ROOT, 'app');
const TARGETS = ['page','layout','route'];
let removed = 0;

function walk(dir){
  for (const entry of fs.readdirSync(dir,{withFileTypes:true})){
    if(entry.isDirectory()) walk(path.join(dir, entry.name));
    else if(entry.isFile()){
      const ext = path.extname(entry.name);
      const stem = entry.name.replace(ext,'');
      if(ext==='.js' && TARGETS.includes(stem)){
        const tsxPeer = path.join(dir, stem + '.tsx');
        if(fs.existsSync(tsxPeer)){
          const full = path.join(dir, entry.name);
          const raw = fs.readFileSync(full,'utf8').trim();
          if(/^export\s+\{\s*default\s*\}\s+from\s+'\.\/(page|layout|route)';?$/.test(raw)){
            fs.unlinkSync(full); removed++; console.log('[cleanup-next-artifacts] removed', path.relative(ROOT, full));
          }
        }
      }
    }
  }
}

if(fs.existsSync(APP_DIR)) walk(APP_DIR);
console.log(`[cleanup-next-artifacts] Done. Removed ${removed} file(s).`);