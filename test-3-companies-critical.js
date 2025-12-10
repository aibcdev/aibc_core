/**
 * Critical 3-Company Agent Test
 * Tests Nike, Airbnb, Gymshark with CEO-level quality expectations
 */

const BACKEND_URL = process.env.BACKEND_URL || 'https://aibc-backend-409115133182.us-central1.run.app';

const testCompanies = [
  { name: 'Nike', url: 'nike.com' },
  { name: 'Airbnb', url: 'airbnb.com' },
  { name: 'Gymshark', url: 'gymshark.com' }
];

async function startScan(company) {
  console.log(`\n🚀 Starting scan for ${company.name} (${company.url})...`);
  
  const response = await fetch(`${BACKEND_URL}/api/scan/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: company.url,
      platforms: ['twitter', 'instagram', 'youtube', 'linkedin'],
      scanType: 'basic'
    })
  });
  
  if (!response.ok) {
    throw new Error(`Failed to start scan: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.scanId;
}

async function getScanStatus(scanId) {
  const response = await fetch(`${BACKEND_URL}/api/scan/${scanId}/status`);
  if (!response.ok) {
    throw new Error(`Failed to get status: ${response.statusText}`);
  }
  return await response.json();
}

async function getScanResults(scanId) {
  const response = await fetch(`${BACKEND_URL}/api/scan/${scanId}/results`);
  if (!response.ok) {
    throw new Error(`Failed to get results: ${response.statusText}`);
  }
  return await response.json();
}

async function waitForCompletion(scanId, companyName, maxWait = 600000) {
  const startTime = Date.now();
  let lastProgress = 0;
  
  while (Date.now() - startTime < maxWait) {
    const status = await getScanStatus(scanId);
    const scan = status.scan;
    
    if (scan.progress !== lastProgress) {
      console.log(`  [${companyName}] Progress: ${scan.progress}% - ${scan.status}`);
      lastProgress = scan.progress;
    }
    
    if (scan.status === 'completed' || scan.status === 'complete') {
      console.log(`  ✅ [${companyName}] Scan completed!`);
      return true;
    }
    
    if (scan.status === 'error') {
      console.error(`  ❌ [${companyName}] Scan failed: ${scan.error}`);
      return false;
    }
    
    await new Promise(resolve => setTimeout(resolve, 10000)); // Check every 10s
  }
  
  console.error(`  ⏱️  [${companyName}] Scan timed out after ${maxWait/1000}s`);
  return false;
}

function evaluateResults(results, company) {
  const issues = [];
  const successes = [];
  
  console.log(`\n📊 Evaluating results for ${company.name}...`);
  
  // Results are nested under data
  const data = results.data || results;
  const extractedContent = data.extractedContent || {};
  const profile = extractedContent.profile || {};
  
  // Check profile data
  if (!profile.bio || profile.bio.length < 50) {
    issues.push('❌ Profile bio is missing or too short');
  } else {
    successes.push(`✅ Profile bio: ${profile.bio.substring(0, 100)}...`);
  }
  
  // Check social links
  const socialLinks = data.socialLinks || {};
  const foundSocialLinks = Object.keys(socialLinks).filter(k => socialLinks[k]);
  
  if (foundSocialLinks.length === 0) {
    issues.push('❌ NO social links found - CRITICAL FAILURE');
  } else {
    successes.push(`✅ Found ${foundSocialLinks.length} social links: ${foundSocialLinks.join(', ')}`);
    foundSocialLinks.forEach(platform => {
      console.log(`   - ${platform}: ${socialLinks[platform]}`);
    });
  }
  
  // Check posts
  const posts = extractedContent.posts || [];
  if (posts.length === 0) {
    issues.push('❌ No posts/content extracted');
  } else {
    successes.push(`✅ Extracted ${posts.length} posts`);
  }
  
  // Check themes
  const themes = extractedContent.content_themes || extractedContent.themes || [];
  if (themes.length === 0) {
    issues.push('❌ No content themes identified');
  } else {
    successes.push(`✅ Identified ${themes.length} themes: ${themes.slice(0, 3).join(', ')}`);
  }
  
  // Check brand DNA
  const brandDNA = data.brandDNA || {};
  if (!brandDNA.voice) {
    issues.push('❌ Brand DNA missing');
  } else {
    successes.push(`✅ Brand DNA extracted`);
  }
  
  // Check competitors
  const competitorIntelligence = data.competitorIntelligence || [];
  const competitors = Array.isArray(competitorIntelligence) ? competitorIntelligence : [];
  const competitorNames = competitors.map(c => (c.name || c.url || c).toLowerCase());
  
  // Check for self-competition
  const companyDomain = company.url.replace(/^https?:\/\//, '').replace(/^www\./, '').toLowerCase();
  const selfCompetition = competitorNames.some(name => 
    name.includes(companyDomain) || companyDomain.includes(name) ||
    name === company.name.toLowerCase() || name === companyDomain.split('.')[0]
  );
  
  if (selfCompetition) {
    issues.push(`❌ CRITICAL: Company appears as its own competitor!`);
  }
  
  if (competitors.length === 0) {
    issues.push('❌ No competitors identified');
  } else {
    successes.push(`✅ Found ${competitors.length} competitors`);
    console.log(`   Competitors: ${competitors.slice(0, 5).map(c => c.name || c.url || c).join(', ')}`);
    
    if (selfCompetition) {
      console.log(`   ⚠️  WARNING: Self-competition detected in list above`);
    }
  }
  
  // Check insights
  const insights = data.strategicInsights || data.insights || [];
  if (insights.length === 0) {
    issues.push('❌ No insights generated');
  } else {
    successes.push(`✅ Generated ${insights.length} insights`);
  }
  
  // Check content ideas
  const contentIdeas = data.contentIdeas || [];
  if (contentIdeas.length === 0) {
    issues.push('❌ No content ideas generated');
  } else {
    successes.push(`✅ Generated ${contentIdeas.length} content ideas`);
  }
  
  return { issues, successes, passed: issues.length === 0 };
}

async function runTest() {
  console.log('🎯 CRITICAL 3-COMPANY AGENT TEST');
  console.log('================================');
  console.log('Testing: Nike, Airbnb, Gymshark');
  console.log('Expectations: CEO-level quality results\n');
  
  const results = {};
  
  for (const company of testCompanies) {
    try {
      // Start scan
      const scanId = await startScan(company);
      console.log(`  Scan ID: ${scanId}`);
      
      // Wait for completion
      const completed = await waitForCompletion(scanId, company.name);
      
      if (!completed) {
        results[company.name] = {
          status: 'failed',
          error: 'Scan did not complete'
        };
        continue;
      }
      
      // Get results
      const scanResults = await getScanResults(scanId);
      const evaluation = evaluateResults(scanResults, company);
      
      results[company.name] = {
        status: evaluation.passed ? 'passed' : 'failed',
        issues: evaluation.issues,
        successes: evaluation.successes,
        data: scanResults
      };
      
    } catch (error) {
      console.error(`  ❌ Error testing ${company.name}:`, error.message);
      results[company.name] = {
        status: 'error',
        error: error.message
      };
    }
  }
  
  // Final report
  console.log('\n\n📋 FINAL REPORT');
  console.log('===============\n');
  
  let totalPassed = 0;
  let totalFailed = 0;
  
  for (const [company, result] of Object.entries(results)) {
    console.log(`${company}:`);
    if (result.status === 'passed') {
      console.log('  ✅ PASSED');
      totalPassed++;
    } else {
      console.log(`  ❌ ${result.status.toUpperCase()}`);
      totalFailed++;
      if (result.issues) {
        result.issues.forEach(issue => console.log(`    ${issue}`));
      }
      if (result.error) {
        console.log(`    Error: ${result.error}`);
      }
    }
    if (result.successes) {
      result.successes.forEach(success => console.log(`    ${success}`));
    }
    console.log('');
  }
  
  console.log(`\n📊 SUMMARY: ${totalPassed}/${testCompanies.length} companies passed`);
  
  if (totalFailed > 0) {
    console.log('\n❌ TEST FAILED - Some companies did not meet CEO-level quality standards');
    process.exit(1);
  } else {
    console.log('\n✅ ALL TESTS PASSED - Results meet CEO-level quality standards');
  }
}

runTest().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

