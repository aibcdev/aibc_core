/**
 * Check Content Scheduler Status
 * 
 * Verifies that the scheduler is properly configured
 */

import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config({ path: '.env' });
dotenv.config({ path: 'backend/.env' });

console.log('🔍 Checking Content Scheduler Configuration\n');

const checks = {
  'node-cron installed': false,
  'GEMINI_API_KEY configured': false,
  'Scheduler enabled': true, // Default is true unless explicitly false
  'Content generation time': '09:00 (default)',
  'Timezone': 'America/New_York (default)',
};

// Check if node-cron is installed
try {
  require.resolve('node-cron');
  checks['node-cron installed'] = true;
} catch (e) {
  checks['node-cron installed'] = false;
}

// Check GEMINI_API_KEY
if (process.env.GEMINI_API_KEY) {
  checks['GEMINI_API_KEY configured'] = true;
}

// Check scheduler enabled
if (process.env.ENABLE_CONTENT_SCHEDULER === 'false') {
  checks['Scheduler enabled'] = false;
}

// Check custom time
if (process.env.CONTENT_GENERATION_TIME) {
  checks['Content generation time'] = process.env.CONTENT_GENERATION_TIME;
}

// Check timezone
if (process.env.TIMEZONE) {
  checks['Timezone'] = process.env.TIMEZONE;
}

console.log('Configuration Status:');
console.log('='.repeat(50));
Object.entries(checks).forEach(([key, value]) => {
  const status = typeof value === 'boolean' 
    ? (value ? '✅' : '❌')
    : 'ℹ️';
  console.log(`${status} ${key}: ${value}`);
});

console.log('\n' + '='.repeat(50));

const allGood = checks['node-cron installed'] && checks['GEMINI_API_KEY configured'] && checks['Scheduler enabled'];

if (allGood) {
  console.log('\n✅ Scheduler is properly configured!');
  console.log('\n📝 How it works:');
  console.log('   - Content generates automatically at 9 AM daily');
  console.log('   - Server must be running continuously for this to work');
  console.log('   - 1-2 posts will be generated and published daily');
  console.log('\n🚀 To start the server:');
  console.log('   cd backend && npm run dev  (for development)');
  console.log('   cd backend && npm start    (for production)');
} else {
  console.log('\n⚠️  Some configuration issues detected:');
  if (!checks['node-cron installed']) {
    console.log('   - Install node-cron: cd backend && npm install');
  }
  if (!checks['GEMINI_API_KEY configured']) {
    console.log('   - Add GEMINI_API_KEY to backend/.env');
  }
  if (!checks['Scheduler enabled']) {
    console.log('   - Set ENABLE_CONTENT_SCHEDULER=true in backend/.env');
  }
}

console.log('\n💡 Production Deployment:');
console.log('   For 24/7 operation, deploy to:');
console.log('   - Google Cloud Run');
console.log('   - Heroku');
console.log('   - Railway');
console.log('   - AWS Elastic Beanstalk');
console.log('   - Any service that keeps the server running');








