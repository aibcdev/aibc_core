/**
 * Agent Test Script - Digital Footprint Scanner
 * Tests 3 companies with real website URLs
 */

const API_BASE_URL = process.env.API_URL || 'http://localhost:3001';

// Test with actual website domains - this tests the full scraping pipeline
const testCompanies = [
  { username: 'nike.com', platforms: ['twitter', 'instagram', 'youtube'], name: 'Nike' },
  { username: 'spotify.com', platforms: ['twitter', 'instagram', 'youtube'], name: 'Spotify' },
  { username: 'airbnb.com', platforms: ['twitter', 'instagram', 'linkedin'], name: 'Airbnb' },
];

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function startScan(username, platforms, scanType = 'basic') {
  console.log(`  → Starting scan for ${username}...`);
  const response = await fetch(`${API_BASE_URL}/api/scan/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, platforms, scanType }),
  });
  
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to start scan: ${response.status} ${response.statusText} - ${text}`);
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
  let lastLog = '';
  
  while (Date.now() - startTime < maxWait) {
    const status = await getScanStatus(scanId);
    
    // Get latest log
    const logs = status.scan.logs || [];
    const currentLog = logs.slice(-1)[0] || '';
    if (currentLog !== lastLog) {
      console.log(`  📋 ${currentLog}`);
      lastLog = currentLog;
    }
    
    if (status.scan.status === 'complete') {
      return { success: true, logs };
    }
    
    if (status.scan.status === 'error') {
      return { success: false, error: status.scan.error, logs };
    }
    
    await sleep(3000);
  }
  
  return { success: false, error: 'Scan timeout', logs: [] };
}

function evaluateScanResults(data, companyName) {
  const report = {
    company: companyName,
    scores: {},
    issues: [],
    socialLinksFound: [],
    competitorsFound: [],
    contentThemes: [],
  };
  
  // Check social links discovered
  if (data.extractedContent?.profile?.platform_presence) {
    report.socialLinksFound = data.extractedContent.profile.platform_presence;
  }
  
  // Check profile/bio
  if (!data.extractedContent?.profile?.bio) {
    report.issues.push('❌ Missing profile bio');
    report.scores.profile = 0;
  } else if (data.extractedContent.profile.bio.length < 30) {
    report.issues.push(`⚠️ Profile bio too short (${data.extractedContent.profile.bio.length} chars)`);
    report.scores.profile = 50;
  } else {
    report.scores.profile = 100;
  }
  
  // Check posts
  const postsCount = data.extractedContent?.posts?.length || 0;
  if (postsCount === 0) {
    report.issues.push('❌ No posts extracted');
    report.scores.posts = 0;
  } else if (postsCount < 5) {
    report.issues.push(`⚠️ Only ${postsCount} posts (expected 5+)`);
    report.scores.posts = (postsCount / 5) * 100;
  } else {
    report.scores.posts = 100;
  }
  
  // Check content themes
  const themesCount = data.extractedContent?.content_themes?.length || 0;
  report.contentThemes = data.extractedContent?.content_themes || [];
  if (themesCount === 0) {
    report.issues.push('❌ No content themes identified');
    report.scores.themes = 0;
  } else if (themesCount < 3) {
    report.issues.push(`⚠️ Only ${themesCount} themes (expected 3+)`);
    report.scores.themes = (themesCount / 3) * 100;
  } else {
    report.scores.themes = 100;
  }
  
  // Check brand DNA
  if (!data.brandDNA?.archetype) {
    report.issues.push('❌ Missing brand archetype');
    report.scores.brandDNA = 0;
  } else if (!data.brandDNA?.voice?.tone) {
    report.issues.push('⚠️ Missing brand voice/tone');
    report.scores.brandDNA = 50;
  } else {
    report.scores.brandDNA = 100;
  }
  
  // Check competitors
  const competitors = data.competitorIntelligence || [];
  report.competitorsFound = competitors.map(c => c.name);
  if (competitors.length === 0) {
    report.issues.push('❌ No competitors identified');
    report.scores.competitors = 0;
  } else if (competitors.length < 3) {
    report.issues.push(`⚠️ Only ${competitors.length} competitors (expected 3+)`);
    report.scores.competitors = (competitors.length / 3) * 100;
  } else {
    report.scores.competitors = 100;
  }
  
  // Check strategic insights
  const insightsCount = data.strategicInsights?.length || 0;
  if (insightsCount === 0) {
    report.issues.push('❌ No strategic insights');
    report.scores.insights = 0;
  } else if (insightsCount < 2) {
    report.issues.push(`⚠️ Only ${insightsCount} insight (expected 2+)`);
    report.scores.insights = (insightsCount / 2) * 100;
  } else {
    report.scores.insights = 100;
  }
  
  // Calculate overall score
  const scoreValues = Object.values(report.scores);
  report.overallScore = Math.round(scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length);
  
  return report;
}

async function runAgentTest() {
  console.log('\n' + '═'.repeat(80));
  console.log('🤖 AGENT TEST: DIGITAL FOOTPRINT SCANNER');
  console.log('═'.repeat(80));
  console.log(`\n📍 Testing against: ${API_BASE_URL}`);
  console.log(`📋 Companies to test: ${testCompanies.map(c => c.name).join(', ')}`);
  console.log(`⏱️  Started at: ${new Date().toISOString()}\n`);

  const reports = [];
  
  // First check if API is reachable
  try {
    const healthCheck = await fetch(`${API_BASE_URL}/api/health`);
    if (healthCheck.ok) {
      console.log('✅ API is reachable\n');
    } else {
      console.log('⚠️ API health check returned non-OK status\n');
    }
  } catch (e) {
    console.log('❌ Cannot reach API at ' + API_BASE_URL);
    console.log('   Make sure the backend server is running.\n');
    process.exit(1);
  }

  for (let i = 0; i < testCompanies.length; i++) {
    const company = testCompanies[i];
    console.log('─'.repeat(80));
    console.log(`\n[${i + 1}/${testCompanies.length}] 🔍 Scanning: ${company.name} (${company.username})`);
    console.log(`    Platforms: ${company.platforms.join(', ')}`);
    
    try {
      // Start scan
      const startResponse = await startScan(company.username, company.platforms, 'basic');
      
      if (!startResponse.success || !startResponse.scanId) {
        throw new Error(startResponse.error || 'Failed to start scan - no scanId returned');
      }
      
      const scanId = startResponse.scanId;
      console.log(`    Scan ID: ${scanId}\n`);
      
      // Wait for completion
      const scanResult = await waitForScanCompletion(scanId);
      
      if (!scanResult.success) {
        throw new Error(scanResult.error);
      }
      
      // Get results
      const resultsResponse = await getScanResults(scanId);
      
      if (!resultsResponse.success || !resultsResponse.data) {
        throw new Error('No scan data returned');
      }
      
      // Evaluate results
      const report = evaluateScanResults(resultsResponse.data, company.name);
      report.scanId = scanId;
      report.logs = scanResult.logs;
      reports.push(report);
      
      console.log(`\n    ✅ Scan completed - Score: ${report.overallScore}%`);
      
    } catch (error) {
      console.log(`\n    ❌ Scan failed: ${error.message}`);
      reports.push({
        company: company.name,
        overallScore: 0,
        issues: [`Fatal error: ${error.message}`],
        socialLinksFound: [],
        competitorsFound: [],
        contentThemes: [],
      });
    }
    
    // Wait between scans
    if (i < testCompanies.length - 1) {
      console.log('\n    ⏳ Waiting 5 seconds before next scan...');
      await sleep(5000);
    }
  }

  // Generate final report
  console.log('\n\n' + '═'.repeat(80));
  console.log('📊 AGENT TEST REPORT');
  console.log('═'.repeat(80));
  
  reports.forEach((report, i) => {
    console.log(`\n┌─ ${report.company} ─────────────────────────────────────────────────`);
    console.log(`│ Overall Score: ${report.overallScore}%`);
    console.log(`│`);
    
    if (report.socialLinksFound.length > 0) {
      console.log(`│ 🔗 Social Links Found: ${report.socialLinksFound.join(', ')}`);
    } else {
      console.log(`│ 🔗 Social Links Found: NONE`);
    }
    
    if (report.competitorsFound.length > 0) {
      console.log(`│ 🎯 Competitors: ${report.competitorsFound.slice(0, 5).join(', ')}`);
    } else {
      console.log(`│ 🎯 Competitors: NONE`);
    }
    
    if (report.contentThemes.length > 0) {
      console.log(`│ 📝 Themes: ${report.contentThemes.slice(0, 5).join(', ')}`);
    } else {
      console.log(`│ 📝 Themes: NONE`);
    }
    
    if (report.issues.length > 0) {
      console.log(`│`);
      console.log(`│ Issues:`);
      report.issues.forEach(issue => {
        console.log(`│   ${issue}`);
      });
    }
    
    if (report.scores) {
      console.log(`│`);
      console.log(`│ Component Scores:`);
      Object.entries(report.scores).forEach(([key, value]) => {
        const bar = '█'.repeat(Math.floor(value / 10)) + '░'.repeat(10 - Math.floor(value / 10));
        console.log(`│   ${key.padEnd(12)}: ${bar} ${value}%`);
      });
    }
    
    console.log(`└${'─'.repeat(60)}`);
  });
  
  // Overall verdict
  const avgScore = Math.round(reports.reduce((sum, r) => sum + r.overallScore, 0) / reports.length);
  const allPassed = reports.every(r => r.overallScore >= 60);
  const socialLinksWorking = reports.some(r => r.socialLinksFound.length > 0);
  const competitorsWorking = reports.some(r => r.competitorsFound.length > 0);
  
  console.log('\n' + '═'.repeat(80));
  console.log('🏆 FINAL VERDICT');
  console.log('═'.repeat(80));
  console.log(`\n   Average Score: ${avgScore}%`);
  console.log(`   Social Link Extraction: ${socialLinksWorking ? '✅ WORKING' : '❌ NOT WORKING'}`);
  console.log(`   Competitor Detection: ${competitorsWorking ? '✅ WORKING' : '❌ NOT WORKING'}`);
  console.log(`   Overall Status: ${allPassed ? '✅ PASSING' : '❌ NEEDS WORK'}`);
  
  if (!allPassed) {
    console.log('\n   ⚠️ ISSUES TO FIX:');
    const allIssues = new Set();
    reports.forEach(r => r.issues.forEach(i => allIssues.add(i)));
    allIssues.forEach(issue => console.log(`      ${issue}`));
  }
  
  console.log('\n' + '═'.repeat(80));
  console.log(`⏱️  Completed at: ${new Date().toISOString()}`);
  
  // Save detailed results
  try {
    const fs = await import('fs/promises');
    await fs.writeFile(
      'agent-test-results.json',
      JSON.stringify(reports, null, 2)
    );
    console.log('\n📁 Detailed results saved to agent-test-results.json');
  } catch (e) {
    // Ignore file save errors
  }
  
  // Return exit code based on results
  process.exit(allPassed ? 0 : 1);
}

// Run the test
runAgentTest().catch(error => {
  console.error('\n❌ Agent test crashed:', error.message);
  process.exit(1);
});

