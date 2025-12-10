/**
 * Critical Test: Nike.com Social Media Scraping
 * Tests if the scanner finds and scrapes all available social links
 */

const API_BASE_URL = process.env.API_URL || 'http://localhost:3002';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function startScan(username, platforms, scanType = 'standard') {
  const response = await fetch(`${API_BASE_URL}/api/scan/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, platforms, scanType }),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to start scan: ${response.status} ${response.statusText} - ${errorText}`);
  }
  
  return response.json();
}

async function getScanStatus(scanId) {
  const response = await fetch(`${API_BASE_URL}/api/scan/${scanId}/status`);
  
  if (!response.ok) {
    throw new Error(`Failed to get scan status: ${response.statusText}`);
  }
  
  return response.json();
}

async function getScanResults(scanId) {
  const response = await fetch(`${API_BASE_URL}/api/scan/${scanId}/results`);
  
  if (!response.ok) {
    throw new Error(`Failed to get scan results: ${response.statusText}`);
  }
  
  return response.json();
}

async function waitForScanCompletion(scanId, maxWait = 300000) {
  const startTime = Date.now();
  let lastProgress = 0;
  
  console.log('\n📊 Scan Progress:');
  console.log('='.repeat(80));
  
  while (Date.now() - startTime < maxWait) {
    const status = await getScanStatus(scanId);
    
    if (status.scan.status === 'complete') {
      console.log('✅ Scan completed!');
      return true;
    }
    
    if (status.scan.status === 'error') {
      throw new Error(`Scan failed: ${status.scan.error}`);
    }
    
    // Show progress updates
    if (status.scan.progress !== lastProgress) {
      lastProgress = status.scan.progress;
      const latestLog = status.scan.logs.slice(-1)[0] || 'Processing...';
      console.log(`[${status.scan.progress}%] ${latestLog}`);
    }
    
    await sleep(3000);
  }
  
  throw new Error('Scan timeout after 5 minutes');
}

async function testNike() {
  console.log('='.repeat(80));
  console.log('CRITICAL TEST: Nike.com Social Media Scraping');
  console.log('='.repeat(80));
  console.log('\n🎯 Test Objective:');
  console.log('   Verify that the scanner finds ALL social media links from nike.com');
  console.log('   and scrapes each platform independently without skipping any.');
  console.log('\n📋 Expected Social Links on Nike.com:');
  console.log('   - Twitter/X: @Nike');
  console.log('   - Instagram: @nike');
  console.log('   - LinkedIn: /company/nike');
  console.log('   - Facebook: /nike');
  console.log('   - YouTube: @Nike or channel');
  console.log('   - TikTok: @nike');
  console.log('\n🚀 Starting scan...\n');
  
  try {
    // Start scan with all major platforms
    const platforms = ['twitter', 'instagram', 'linkedin', 'youtube', 'tiktok', 'facebook'];
    const startResponse = await startScan('nike.com', platforms, 'standard');
    const scanId = startResponse.scanId;
    
    console.log(`📝 Scan ID: ${scanId}`);
    console.log(`🎯 Target: nike.com`);
    console.log(`📱 Platforms: ${platforms.join(', ')}`);
    
    // Wait for completion
    await waitForScanCompletion(scanId);
    
    // Get results
    console.log('\n📥 Fetching results...');
    const resultsResponse = await getScanResults(scanId);
    const results = resultsResponse.data;
    
    console.log('\n' + '='.repeat(80));
    console.log('🔍 CRITICAL REVIEW - Nike.com Scan Results');
    console.log('='.repeat(80));
    
    // Check discovered social links
    console.log('\n1️⃣ SOCIAL LINKS DISCOVERY:');
    if (results.socialLinks) {
      const foundLinks = Object.keys(results.socialLinks);
      console.log(`   ✅ Found ${foundLinks.length} social links: ${foundLinks.join(', ')}`);
      
      // Check each expected platform
      const expectedPlatforms = ['twitter', 'instagram', 'linkedin', 'youtube', 'facebook'];
      const missingPlatforms = expectedPlatforms.filter(p => !foundLinks.includes(p));
      
      if (missingPlatforms.length > 0) {
        console.log(`   ⚠️  MISSING: ${missingPlatforms.join(', ')}`);
        if (missingPlatforms.length >= 3) {
          console.log(`   ❌ CRITICAL: Expected to find these platforms but they were not discovered!`);
        } else {
          console.log(`   ⚠️  Some platforms not found (may not be prominently displayed)`);
        }
      } else {
        console.log(`   ✅ All expected platforms found!`);
      }
      
      // Show actual URLs found
      console.log('\n   📍 Discovered URLs:');
      Object.entries(results.socialLinks).forEach(([platform, url]) => {
        console.log(`      ${platform}: ${url}`);
      });
    } else {
      console.log('   ❌ CRITICAL: No social links discovered at all!');
      console.log('   This means the LLM extraction failed to find links that clearly exist.');
    }
    
    // Check extracted content
    console.log('\n2️⃣ CONTENT EXTRACTION:');
    if (results.extractedContent) {
      const content = results.extractedContent;
      
      // Profile
      if (content.profile && content.profile.bio) {
        console.log(`   ✅ Profile bio: ${content.profile.bio.length} chars`);
        console.log(`      "${content.profile.bio.substring(0, 100)}..."`);
      } else {
        console.log('   ❌ MISSING: Profile bio');
      }
      
      // Posts
      if (content.posts && content.posts.length > 0) {
        console.log(`   ✅ Posts: ${content.posts.length} found`);
        console.log(`   📝 Sample posts:`);
        content.posts.slice(0, 3).forEach((post, i) => {
          const preview = post.content ? post.content.substring(0, 80) : 'No content';
          console.log(`      ${i + 1}. ${preview}...`);
        });
      } else {
        console.log('   ❌ MISSING: No posts extracted');
      }
      
      // Themes
      if (content.content_themes && content.content_themes.length > 0) {
        console.log(`   ✅ Themes: ${content.content_themes.join(', ')}`);
      } else {
        console.log('   ⚠️  MISSING: Content themes');
      }
    } else {
      console.log('   ❌ CRITICAL: No extracted content at all!');
    }
    
    // Check brand DNA
    console.log('\n3️⃣ BRAND DNA:');
    if (results.brandDNA) {
      console.log(`   ✅ Brand DNA extracted`);
      if (results.brandDNA.voice) {
        console.log(`      Voice: ${JSON.stringify(results.brandDNA.voice)}`);
      }
      if (results.brandDNA.corePillars) {
        console.log(`      Core Pillars: ${results.brandDNA.corePillars.join(', ')}`);
      }
    } else {
      console.log('   ⚠️  MISSING: Brand DNA');
    }
    
    // Critical Assessment
    console.log('\n' + '='.repeat(80));
    console.log('🎯 CRITICAL ASSESSMENT');
    console.log('='.repeat(80));
    
    const issues = [];
    const successes = [];
    
    // Check social links discovery
    if (!results.socialLinks || Object.keys(results.socialLinks).length === 0) {
      issues.push('❌ CRITICAL: No social links discovered - LLM extraction completely failed');
    } else {
      const foundCount = Object.keys(results.socialLinks).length;
      if (foundCount < 3) {
        issues.push(`⚠️  WEAK: Only ${foundCount} social links found (expected 5+)`);
      } else if (foundCount < 5) {
        issues.push(`⚠️  PARTIAL: ${foundCount} social links found (expected 5-6)`);
      } else {
        successes.push(`✅ Found ${foundCount} social links`);
      }
    }
    
    // Check content extraction
    if (!results.extractedContent) {
      issues.push('❌ CRITICAL: No content extracted');
    } else {
      if (!results.extractedContent.posts || results.extractedContent.posts.length === 0) {
        issues.push('❌ CRITICAL: No posts extracted from social platforms');
      } else {
        successes.push(`✅ Extracted ${results.extractedContent.posts.length} posts`);
      }
      
      if (!results.extractedContent.profile || !results.extractedContent.profile.bio) {
        issues.push('⚠️  WEAK: No profile bio extracted');
      } else {
        successes.push(`✅ Profile bio extracted (${results.extractedContent.profile.bio.length} chars)`);
      }
    }
    
    // Print assessment
    if (successes.length > 0) {
      console.log('\n✅ SUCCESSES:');
      successes.forEach(s => console.log(`   ${s}`));
    }
    
    if (issues.length > 0) {
      console.log('\n❌ ISSUES FOUND:');
      issues.forEach(i => console.log(`   ${i}`));
    }
    
    // Final verdict
    console.log('\n' + '='.repeat(80));
    console.log('📊 FINAL VERDICT');
    console.log('='.repeat(80));
    
    if (issues.some(i => i.includes('CRITICAL'))) {
      console.log('❌ UNACCEPTABLE: Critical issues found - scanner is not working as expected');
      console.log('   The scanner should find social links that are clearly visible on nike.com');
    } else if (issues.length > 0) {
      console.log('⚠️  NEEDS IMPROVEMENT: Some issues found but core functionality works');
    } else {
      console.log('✅ PASS: Scanner successfully found and extracted social media content');
    }
    
    // Save detailed results
    const fs = await import('fs/promises');
    await fs.writeFile(
      'nike-test-results.json',
      JSON.stringify({
        scanId,
        timestamp: new Date().toISOString(),
        results,
        assessment: { successes, issues }
      }, null, 2)
    );
    console.log('\n💾 Detailed results saved to nike-test-results.json');
    
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Check if backend is running
async function checkBackend() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (response.ok) {
      return true;
    }
  } catch (error) {
    console.error('\n❌ Backend is not running!');
    console.error('   Please start the backend server first:');
    console.error('   cd backend && npm run dev');
    process.exit(1);
  }
}

// Run test
(async () => {
  await checkBackend();
  await testNike();
})();

