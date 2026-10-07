const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');

const REQUIRED_FILES = [
  'apps/web/next.config.ts', // Next.js 15+ typically uses ts or js/mjs
  'apps/customer/app.json',
  'apps/partner/app.json',
  'supabase/migrations/001_mobile_schema_and_rpcs.sql'
];

const PACKAGES = [
  '@pehchan-wale/shared-types',
  '@pehchan-wale/shared-constants',
  '@pehchan-wale/shared-validation',
  '@pehchan-wale/shared-api'
];

function checkFileExists(relPath) {
  // If we're looking for next.config.ts, try .js or .mjs as fallbacks
  let target = path.join(ROOT_DIR, relPath);
  
  if (relPath.includes('next.config')) {
      const ext = path.extname(relPath);
      const base = relPath.substring(0, relPath.length - ext.length);
      const possible = ['.ts', '.js', '.mjs', '.cjs'];
      
      let found = false;
      for (const pExt of possible) {
          if (fs.existsSync(path.join(ROOT_DIR, base + pExt))) {
              found = true;
              break;
          }
      }
      if (found) {
          console.log(`[PASS] Found ${base}.*`);
          return true;
      } else {
          console.error(`[FAIL] Missing ${relPath}`);
          return false;
      }
  }

  if (fs.existsSync(target)) {
    console.log(`[PASS] Found ${relPath}`);
    return true;
  }
  console.error(`[FAIL] Missing ${relPath}`);
  return false;
}

function checkPackage(pkgName) {
  try {
    const pkgPath = path.join(ROOT_DIR, 'node_modules', pkgName);
    const altPkgPath = path.join(ROOT_DIR, 'packages', pkgName.replace('@pehchan-wale/', ''));
    if (fs.existsSync(pkgPath) || fs.existsSync(altPkgPath)) {
        console.log(`[PASS] Resolves package: ${pkgName}`);
        return true;
    } else {
        console.error(`[FAIL] Cannot resolve package: ${pkgName}`);
        return false;
    }
  } catch (err) {
    console.error(`[FAIL] Cannot resolve package: ${pkgName}`, err);
    return false;
  }
}

console.log('--- Pehchan Wale Monorepo Verification ---\n');

let allPassed = true;

console.log('Checking required config files...');
for (const file of REQUIRED_FILES) {
  if (!checkFileExists(file)) allPassed = false;
}

console.log('\nChecking workspace packages...');
for (const pkg of PACKAGES) {
  if (!checkPackage(pkg)) allPassed = false;
}

console.log('\n------------------------------------------');
if (allPassed) {
  console.log('✅ ALL CHECKS PASSED: Monorepo is healthy and integrated.');
  process.exit(0);
} else {
  console.error('❌ VERIFICATION FAILED: Missing essential workspace components.');
  process.exit(1);
}
