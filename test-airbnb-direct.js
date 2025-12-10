/**
 * Direct test of scanService for Airbnb.com
 * Bypasses API to test the core scanning logic directly
 */

import { storage } from './backend/src/services/storage.js';
import { startScan } from './backend/src/services/scanService.js';

async function testAirbnbDirect() {
  console.log('='.repeat(80));
  console.log('CRITICAL TEST: Airbnb.com Social Media Scraping (Direct)');
  console.log('='.repeat(80));
  
  const scanId = `test_airbnb_${Date.now()}`;
  const username = 'airbnb.com';
  const platforms = ['twitter', 'instagram', 'linkedin', 'youtube', 'tiktok', 'facebook'];
  
  // Initialize scan
  storage.saveScan({
    id: scanId,
    username,
    platforms,
    scanType: 'standard',
    status: 'starting',
    progress: 0,
    logs: [],
    results: null,
    error: null,
    createdAt: new Date().toISOString()
  });
  
  console.log(`\n🚀 Starting scan for: ${username}`);
  console.log(`📱 Platforms: ${platforms.join(', ')}`);
  console.log(`📝 Scan ID: ${scanId}\n`);
  
  // Start scan
  await startScan(scanId, username, platforms, 'standard');
  
  // Poll for results
  let attempts = 0;
  const maxAttempts = 120; // 10 minutes max
  
  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
    
    const scan = storage.getScan(scanId);
    
    if (!scan) {
      console.log('❌ Scan not found!');
      break;
    }
    
    // Show latest log
    if (scan.logs && scan.logs.length > 0) {
      const latestLog = scan.logs[scan.logs.length - 1];
      console.log(`[${scan.progress}%] ${latestLog}`);
    }
    
    if (scan.status === 'complete') {
      console.log('\n✅ Scan completed!');
      break;
    }
    
    if (scan.status === 'error') {
      console.log(`\n❌ Scan failed: ${scan.error}`);
      break;
    }
    
    attempts++;
  }
  
  // Get final results
  const finalScan = storage.getScan(scanId);
  
  if (!finalScan) {
    console.log('❌ Scan not found in storage');
    return;
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('🔍 CRITICAL REVIEW - Results');
  console.log('='.repeat(80));
  
  if (finalScan.results) {
    const results = finalScan.results;
    
    // Check social links
    console.log('\n1️⃣ SOCIAL LINKS DISCOVERED:');
    if (results.socialLinks) {
      const foundLinks = Object.keys(results.socialLinks);
      console.log(`   ✅ Found ${foundLinks.length} social links: ${foundLinks.join(', ')}`);
      Object.entries(results.socialLinks).forEach(([platform, url]) => {
        console.log(`      ${platform}: ${url}`);
      });
    } else {
      console.log('   ❌ CRITICAL: No social links discovered!');
    }
    
    // Check content
    console.log('\n2️⃣ CONTENT EXTRACTION:');
    if (results.extractedContent) {
      const content = results.extractedContent;
      console.log(`   Posts: ${content.posts?.length || 0}`);
      console.log(`   Themes: ${content.content_themes?.length || 0}`);
      console.log(`   Bio: ${content.profile?.bio?.length || 0} chars`);
    }
  } else {
    console.log('❌ No results available');
  }
  
  // Show all logs
  console.log('\n3️⃣ SCAN LOGS (Last 20):');
  if (finalScan.logs && finalScan.logs.length > 0) {
    finalScan.logs.slice(-20).forEach(log => {
      console.log(`   ${log}`);
    });
  }
}

testAirbnbDirect().catch(console.error);

