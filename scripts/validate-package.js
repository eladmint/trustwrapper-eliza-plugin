#!/usr/bin/env node

/**
 * Package validation script
 * Ensures the package is ready for npm publication
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating package for npm publication...\n');

// Check required files
const requiredFiles = [
  'package.json',
  'README.md',
  'LICENSE',
  'CHANGELOG.md',
  'src/index.ts',
  'tsconfig.json'
];

let hasErrors = false;

console.log('📋 Checking required files:');
requiredFiles.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, '..', file));
  console.log(`   ${exists ? '✅' : '❌'} ${file}`);
  if (!exists) hasErrors = true;
});

// Validate package.json
console.log('\n📦 Validating package.json:');
try {
  const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
  
  const requiredFields = ['name', 'version', 'description', 'main', 'types', 'license', 'repository'];
  requiredFields.forEach(field => {
    const exists = pkg[field] !== undefined;
    console.log(`   ${exists ? '✅' : '❌'} ${field}: ${exists ? (typeof pkg[field] === 'object' ? 'defined' : pkg[field]) : 'missing'}`);
    if (!exists) hasErrors = true;
  });
  
  // Check npm scope
  if (pkg.name && !pkg.name.startsWith('@trustwrapper/')) {
    console.log(`   ⚠️  Package name should use @trustwrapper scope`);
  }
} catch (error) {
  console.log('   ❌ Failed to parse package.json');
  hasErrors = true;
}

// Check source files
console.log('\n🔧 Checking source structure:');
const srcFiles = [
  'src/index.ts',
  'src/types/index.ts',
  'src/actions/verifyTradingDecision.ts',
  'src/actions/verifyPerformance.ts',
  'src/actions/generateComplianceReport.ts',
  'src/providers/trustWrapperProvider.ts',
  'src/evaluators/trustWrapperEvaluator.ts',
  'src/services/trustWrapperService.ts',
  'src/config/index.ts'
];

srcFiles.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, '..', file));
  console.log(`   ${exists ? '✅' : '❌'} ${file}`);
  if (!exists) hasErrors = true;
});

// Summary
console.log('\n' + '='.repeat(50));
if (hasErrors) {
  console.log('❌ Package validation FAILED - Please fix the issues above');
  process.exit(1);
} else {
  console.log('✅ Package validation PASSED - Ready for npm publication!');
  console.log('\nNext steps:');
  console.log('1. npm install (to generate package-lock.json)');
  console.log('2. npm run build');
  console.log('3. npm publish --access public');
}