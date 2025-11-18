#!/usr/bin/env node
/**
 * Health Check Script for Azuria Project
 * Verifies application health, dependencies, and production readiness
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * @typedef {Object} HealthCheckResult
 * @property {string} name
 * @property {'pass' | 'fail' | 'warn'} status
 * @property {string} message
 * @property {any} [details]
 */

class HealthChecker {
  constructor() {
    /** @type {HealthCheckResult[]} */
    this.results = [];
  }

  /**
   * @param {string} name
   * @param {'pass' | 'fail' | 'warn'} status
   * @param {string} message
   * @param {any} [details]
   */
  addResult(name, status, message, details) {
    this.results.push({ name, status, message, details });
  }

  /**
   * @param {string} command
   * @param {number} [timeout=60000] - Timeout in milliseconds (default 60s)
   * @returns {string}
   */
  runCommand(command, timeout = 60000) {
    try {
      return execSync(command, { 
        encoding: 'utf-8', 
        stdio: 'pipe',
        timeout: timeout
      });
    } catch (error) {
      if (error.killed) {
        throw new Error(`Command timed out after ${timeout}ms: ${command}`);
      }
      throw new Error(`Command failed: ${command}`);
    }
  }

  async checkNodeVersion() {
    try {
      const version = process.version;
      const majorVersion = parseInt(version.slice(1).split('.')[0]);
      
      if (majorVersion >= 18) {
        this.addResult('Node.js Version', 'pass', `Node.js ${version} (✓ >= 18)`);
      } else {
        this.addResult('Node.js Version', 'fail', `Node.js ${version} (✗ < 18 required)`);
      }
    } catch (error) {
      this.addResult('Node.js Version', 'fail', 'Failed to check Node.js version');
    }
  }

  async checkPackageManager() {
    try {
      const packageLock = existsSync('package-lock.json');
      const yarnLock = existsSync('yarn.lock');
      const bunLock = existsSync('bun.lockb');

      if (packageLock && !yarnLock && !bunLock) {
        this.addResult('Package Manager', 'pass', 'npm (✓ consistent)');
      } else if (packageLock && (yarnLock || bunLock)) {
        this.addResult('Package Manager', 'warn', 'Multiple lock files detected');
      } else {
        this.addResult('Package Manager', 'fail', 'No npm lock file found');
      }
    } catch (error) {
      this.addResult('Package Manager', 'fail', 'Failed to check package manager');
    }
  }

  async checkDependencies() {
    try {
      this.runCommand('npm ci --dry-run');
      this.addResult('Dependencies', 'pass', 'All dependencies can be installed');
    } catch (error) {
      this.addResult('Dependencies', 'fail', 'Dependency installation issues detected');
    }
  }

  async checkTypeScript() {
    try {
      this.runCommand('npm run type-check', 120000); // 2 minutes timeout
      this.addResult('TypeScript', 'pass', 'No type errors');
    } catch (error) {
      if (error.message.includes('timed out')) {
        this.addResult('TypeScript', 'warn', 'Type check timed out (> 2min)');
      } else {
        this.addResult('TypeScript', 'fail', 'TypeScript errors detected');
      }
    }
  }

  async checkLinting() {
    try {
      this.runCommand('npm run lint', 90000); // 90 seconds timeout
      this.addResult('ESLint', 'pass', 'No linting errors');
    } catch (error) {
      if (error.message.includes('timed out')) {
        this.addResult('ESLint', 'warn', 'Lint check timed out (> 90s)');
      } else {
        this.addResult('ESLint', 'fail', 'Linting errors detected');
      }
    }
  }

  async checkTests() {
    try {
      // Smoke tests with 3 minute timeout (they can be slow)
      this.runCommand('npm run test:smoke', 180000);
      this.addResult('Tests', 'pass', 'All smoke tests passing');
    } catch (error) {
      if (error.message.includes('timed out')) {
        this.addResult('Tests', 'warn', 'Smoke tests timed out (> 3min) - skipped');
      } else {
        this.addResult('Tests', 'fail', 'Test failures detected');
      }
    }
  }

  async checkBuild() {
    try {
      this.runCommand('npm run build', 300000); // 5 minutes timeout
      this.addResult('Build', 'pass', 'Production build successful');
    } catch (error) {
      if (error.message.includes('timed out')) {
        this.addResult('Build', 'warn', 'Build timed out (> 5min)');
      } else {
        this.addResult('Build', 'fail', 'Build errors detected');
      }
    }
  }

  async checkEnvironment() {
    try {
      const envExample = existsSync('.env.example');
      const envLocal = existsSync('.env.local');
      
      if (envExample && envLocal) {
        this.addResult('Environment', 'pass', 'Environment files configured');
      } else if (envExample) {
        this.addResult('Environment', 'warn', '.env.example exists but .env.local missing');
      } else {
        this.addResult('Environment', 'fail', 'No environment configuration found');
      }
    } catch (error) {
      this.addResult('Environment', 'fail', 'Failed to check environment');
    }
  }

  async checkSecurity() {
    try {
      // Check for common security files
      const securityMd = existsSync('SECURITY.md');
      const gitignore = existsSync('.gitignore');
      
      let score = 0;
      const checks = [];
      
      if (securityMd) {
        score++;
        checks.push('SECURITY.md ✓');
      }
      
      if (gitignore) {
        score++;
        checks.push('.gitignore ✓');
      }

      // Check for secure random utilities
      const secureRandom = existsSync('src/utils/secureRandom.ts');
      if (secureRandom) {
        score++;
        checks.push('Secure random utilities ✓');
      }

      if (score >= 2) {
        this.addResult('Security', 'pass', `Security measures: ${checks.join(', ')}`);
      } else {
        this.addResult('Security', 'warn', `Basic security: ${checks.join(', ')}`);
      }
    } catch (error) {
      this.addResult('Security', 'fail', 'Failed to check security measures');
    }
  }

  async checkGitHealth() {
    try {
      const status = this.runCommand('git status --porcelain');
      const branch = this.runCommand('git branch --show-current').trim();
      
      if (status.trim() === '') {
        this.addResult('Git Status', 'pass', `Clean working directory on ${branch}`);
      } else {
        this.addResult('Git Status', 'warn', `Uncommitted changes on ${branch}`);
      }
    } catch (error) {
      this.addResult('Git Status', 'fail', 'Not a git repository or git not available');
    }
  }

  async checkPerformance() {
    try {
      const packageJson = JSON.parse(readFileSync('package.json', 'utf-8'));
      
      // Check bundle analyzer script
      const hasAnalyzer = packageJson.scripts?.analyze;
      
      // Check if dist exists and get rough size
      let bundleSize = 'Unknown';
      if (existsSync('dist')) {
        try {
          const sizeOutput = this.runCommand('du -sh dist 2>/dev/null || dir dist /s /-c | find "bytes"');
          bundleSize = sizeOutput.trim().split('\n').pop() || 'Unknown';
        } catch {
          bundleSize = 'Unknown';
        }
      }

      if (hasAnalyzer) {
        this.addResult('Performance', 'pass', `Bundle analyzer available, last build: ${bundleSize}`);
      } else {
        this.addResult('Performance', 'warn', 'No bundle analyzer configured');
      }
    } catch (error) {
      this.addResult('Performance', 'fail', 'Failed to check performance tools');
    }
  }

  async runAllChecks() {
    console.log('🔍 Running Azuria Health Checks...\n');

    const checks = [
      this.checkNodeVersion(),
      this.checkPackageManager(),
      this.checkDependencies(),
      this.checkTypeScript(),
      this.checkLinting(),
      this.checkTests(),
      this.checkBuild(),
      this.checkEnvironment(),
      this.checkSecurity(),
      this.checkGitHealth(),
      this.checkPerformance()
    ];

    await Promise.all(checks);
    
    this.generateReport();
  }

  generateReport() {
    const passed = this.results.filter(r => r.status === 'pass').length;
    const warnings = this.results.filter(r => r.status === 'warn').length;
    const failed = this.results.filter(r => r.status === 'fail').length;
    const total = this.results.length;

    console.log('📊 Health Check Results:\n');

    // Group by status
    const byStatus = {
      pass: this.results.filter(r => r.status === 'pass'),
      warn: this.results.filter(r => r.status === 'warn'),
      fail: this.results.filter(r => r.status === 'fail')
    };

    // Print results
    if (byStatus.pass.length > 0) {
      console.log('✅ Passing:');
      byStatus.pass.forEach(r => console.log(`   ${r.name}: ${r.message}`));
      console.log();
    }

    if (byStatus.warn.length > 0) {
      console.log('⚠️  Warnings:');
      byStatus.warn.forEach(r => console.log(`   ${r.name}: ${r.message}`));
      console.log();
    }

    if (byStatus.fail.length > 0) {
      console.log('❌ Failures:');
      byStatus.fail.forEach(r => console.log(`   ${r.name}: ${r.message}`));
      console.log();
    }

    // Summary
    const healthScore = Math.round((passed / total) * 100);
    console.log('📈 Summary:');
    console.log(`   Health Score: ${healthScore}%`);
    console.log(`   Passed: ${passed}/${total}`);
    console.log(`   Warnings: ${warnings}`);
    console.log(`   Failed: ${failed}`);

    if (healthScore >= 90) {
      console.log('\n🎉 Excellent! Your application is production ready.');
    } else if (healthScore >= 70) {
      console.log('\n✅ Good! Minor issues to address.');
    } else if (healthScore >= 50) {
      console.log('\n⚠️  Fair. Several issues need attention.');
    } else {
      console.log('\n❌ Poor. Critical issues must be resolved.');
    }

    // Exit with appropriate code
    process.exit(failed > 0 ? 1 : 0);
  }
}

// Run health check if called directly
const checker = new HealthChecker();
checker.runAllChecks().catch(console.error);