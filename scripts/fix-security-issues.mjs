#!/usr/bin/env node
/**
 * Script to fix CodeQL security issues by replacing insecure Math.random() usage
 * with cryptographically secure alternatives
 */

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';
import { join } from 'path';

const sourceFiles = glob.sync('src/**/*.{ts,tsx}', { 
  ignore: ['src/**/*.test.{ts,tsx}', 'src/**/*.spec.{ts,tsx}'] 
});

const replacements = [
  // Session IDs
  {
    pattern: /`session_\$\{Date\.now\(\)\}_\$\{Math\.random\(\)\.toString\(36\)\.substr\(2, 9\)\}`/g,
    replacement: 'generateSecureSessionId()'
  },
  {
    pattern: /`session_\$\{Date\.now\(\)\}_\$\{Math\.random\(\)\.toString\(36\)\.slice\(2\)\}`/g,
    replacement: 'generateSecureSessionId()'
  },
  
  // Message IDs
  {
    pattern: /`msg_\$\{Date\.now\(\)\}_\$\{Math\.random\(\)\.toString\(36\)\.substr\(2, 9\)\}`/g,
    replacement: 'generateSecureMessageId()'
  },
  
  // Alert IDs
  {
    pattern: /`alert_\$\{Date\.now\(\)\}_\$\{Math\.random\(\)\.toString\(36\)\.substr\(2, 9\)\}`/g,
    replacement: 'generateSecureAlertId()'
  },
  
  // Rule IDs
  {
    pattern: /`rule_\$\{Date\.now\(\)\}_\$\{Math\.random\(\)\.toString\(36\)\.substr\(2, 9\)\}`/g,
    replacement: 'generateSecureRuleId()'
  },
  
  // Promotion IDs
  {
    pattern: /`promo_\$\{Date\.now\(\)\}_\$\{Math\.random\(\)\.toString\(36\)\.substr\(2, 9\)\}`/g,
    replacement: 'generateSecurePromotionId()'
  },
  
  // Backup IDs
  {
    pattern: /`backup_\$\{Date\.now\(\)\}_\$\{Math\.random\(\)\.toString\(36\)\.substr\(2, 9\)\}`/g,
    replacement: 'generateSecureBackupId()'
  },
  
  // Anonymous IDs
  {
    pattern: /'anon_' \+ Math\.random\(\)\.toString\(36\)\.substr\(2, 9\)/g,
    replacement: 'generateSecureAnonymousId()'
  },
  
  // Generic secure ID generation
  {
    pattern: /Math\.random\(\)\.toString\(36\)\.substr\(2, 9\)/g,
    replacement: 'generateSecureId()'
  },
  {
    pattern: /Math\.random\(\)\.toString\(36\)\.slice\(2\)/g,
    replacement: 'generateSecureId()'
  },
  
  // Random numbers for A/B testing and similar
  {
    pattern: /Math\.floor\(Math\.random\(\) \* 100\)/g,
    replacement: 'generateSecureRandomPercentage()'
  }
];

const importsToAdd = `import { 
  generateSecureId,
  generateSecureSessionId,
  generateSecureMessageId,
  generateSecureAlertId,
  generateSecureRuleId,
  generateSecurePromotionId,
  generateSecureBackupId,
  generateSecureAnonymousId,
  generateSecureRandomPercentage
} from '../utils/secureRandom';`;

function needsSecureRandomImport(content: string): boolean {
  return replacements.some(({ replacement }) => content.includes(replacement));
}

function addImportIfNeeded(content: string, filePath: string): string {
  if (!needsSecureRandomImport(content)) {
    return content;
  }

  // Check if import already exists
  if (content.includes('from \'../utils/secureRandom\'') || 
      content.includes('from \'../../utils/secureRandom\'') ||
      content.includes('from \'../../../utils/secureRandom\'')) {
    return content;
  }

  // Determine correct relative path
  const depth = filePath.split('/').length - 2;
  const relativePath = '../'.repeat(depth) + 'utils/secureRandom';
  
  const importStatement = importsToAdd.replace('../utils/secureRandom', relativePath);

  // Add import after existing imports
  const lines = content.split('\n');
  let insertIndex = 0;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('import ') || lines[i].startsWith('export ')) {
      insertIndex = i + 1;
    } else if (lines[i].trim() === '' && insertIndex > 0) {
      insertIndex = i;
      break;
    }
  }

  lines.splice(insertIndex, 0, importStatement, '');
  return lines.join('\n');
}

console.log('🔧 Fixing CodeQL security issues...\n');

let filesModified = 0;
let totalReplacements = 0;

for (const file of sourceFiles) {
  try {
    let content = readFileSync(file, 'utf8');
    let fileChanged = false;
    let fileReplacements = 0;

    // Apply replacements
    for (const { pattern, replacement } of replacements) {
      const matches = content.match(pattern);
      if (matches) {
        content = content.replace(pattern, replacement);
        fileReplacements += matches.length;
        fileChanged = true;
      }
    }

    // Add imports if needed
    if (fileChanged) {
      content = addImportIfNeeded(content, file);
      writeFileSync(file, content);
      filesModified++;
      totalReplacements += fileReplacements;
      console.log(`✅ ${file}: ${fileReplacements} replacements`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error.message);
  }
}

console.log(`\n🎉 Fixed ${totalReplacements} security issues in ${filesModified} files`);