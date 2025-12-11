/**
 * CEO Quality Assurance Test Script
 * Runs 5 scans and evaluates results critically
 */

const API_BASE_URL = process.env.API_URL || 'http://localhost:3001';

const testSubjects = [
  { username: 'goodphats', platforms: ['twitter', 'instagram'], name: 'GoodPhats' },
  { username: 'nike', platforms: ['twitter', 'instagram', 'youtube'], name: 'Nike' },
  { username: 'lululemon', platforms: ['twitter', 'instagram', 'linkedin'], name: 'LuluLemon' },
  { username: 'dipsea', platforms: ['twitter', 'instagram'], name: 'Dipsea' },
  { username: 'kobobooks', platforms: ['twitter', 'linkedin'], name: 'Kobo Books' },
];

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function startScan(username, platforms, scanType = 'basic') {
  const response = await fetch(`${API_BASE_URL}/api/scan/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, platforms, scanType }),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to start scan: ${response.statusText}`);
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
  
  while (Date.now() - startTime < maxWait) {
    const status = await getScanStatus(scanId);
    
    if (status.scan.status === 'complete') {
      return true;
    }
    
    if (status.scan.status === 'error') {
      throw new Error(`Scan failed: ${status.scan.error}`);
    }
    
    console.log(`  Progress: ${status.scan.progress}% - ${status.scan.logs.slice(-1)[0] || 'Processing...'}`);
    await sleep(5000);
  }
  
  throw new Error('Scan timeout');
}

async function runTest() {
  console.log('='.repeat(80));
  console.log('CEO QUALITY ASSURANCE TEST - 5 SCANS');
  console.log('='.repeat(80));
  console.log('');

  const results = [];

  for (let i = 0; i < testSubjects.length; i++) {
    const subject = testSubjects[i];
    console.log(`\n[${i + 1}/5] Scanning: ${subject.name} (@${subject.username})`);
    console.log(`Platforms: ${subject.platforms.join(', ')}`);
    
    try {
      // Start scan
      const startResponse = await startScan(subject.username, subject.platforms, 'basic');
      const scanId = startResponse.scanId;
      console.log(`Scan ID: ${scanId}`);
      
      // Wait for completion
      await waitForScanCompletion(scanId);
      
      // Get results
      const resultsResponse = await getScanResults(scanId);
      
      results.push({
        subject: subject.name,
        username: subject.username,
        scanId,
        results: resultsResponse.data,
        success: true,
      });
      
      console.log(`✓ Scan completed successfully`);
    } catch (error) {
      console.error(`✗ Scan failed: ${error.message}`);
      results.push({
        subject: subject.name,
        username: subject.username,
        error: error.message,
        success: false,
      });
    }
    
    // Wait between scans
    if (i < testSubjects.length - 1) {
      console.log('Waiting 10 seconds before next scan...');
      await sleep(10000);
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('TEST RESULTS SUMMARY');
  console.log('='.repeat(80));
  
  // Critical CEO Evaluation
  console.log('\n🔍 CRITICAL EVALUATION (Skeptical CEO Perspective):\n');
  
  const successfulScans = results.filter(r => r.success);
  const failedScans = results.filter(r => !r.success);
  
  console.log(`Total Scans: ${results.length}`);
  console.log(`Successful: ${successfulScans.length}`);
  console.log(`Failed: ${failedScans.length}`);
  
  if (failedScans.length > 0) {
    console.log('\n❌ CRITICAL ISSUE: Some scans failed!');
    failedScans.forEach(scan => {
      console.log(`  - ${scan.subject}: ${scan.error}`);
    });
  }
  
  // Evaluate each successful scan
  successfulScans.forEach((scan, index) => {
    console.log(`\n--- Scan ${index + 1}: ${scan.subject} ---`);
    const data = scan.results;
    
    // Check extracted content
    if (!data.extractedContent) {
      console.log('❌ MISSING: extractedContent');
    } else {
      const content = data.extractedContent;
      
      // Check profile
      if (!content.profile || !content.profile.bio) {
        console.log('❌ MISSING: Profile bio');
      } else if (content.profile.bio.length < 20) {
        console.log(`⚠️  WEAK: Profile bio too short (${content.profile.bio.length} chars)`);
      } else {
        console.log(`✓ Profile bio: ${content.profile.bio.substring(0, 50)}...`);
      }
      
      // Check posts
      if (!content.posts || content.posts.length === 0) {
        console.log('❌ MISSING: Posts array');
      } else if (content.posts.length < 3) {
        console.log(`⚠️  WEAK: Only ${content.posts.length} posts (expected 5-8)`);
      } else {
        console.log(`✓ Posts: ${content.posts.length} found`);
      }
      
      // Check themes
      if (!content.content_themes || content.content_themes.length === 0) {
        console.log('❌ MISSING: Content themes');
      } else if (content.content_themes.length < 3) {
        console.log(`⚠️  WEAK: Only ${content.content_themes.length} themes (expected 3-5)`);
      } else {
        console.log(`✓ Themes: ${content.content_themes.join(', ')}`);
      }
    }
    
    // Check brand DNA
    if (!data.brandDNA) {
      console.log('❌ MISSING: brandDNA');
    } else {
      const dna = data.brandDNA;
      
      if (!dna.voice || !dna.voice.tone) {
        console.log('❌ MISSING: Brand voice/tone');
      } else {
        console.log(`✓ Voice: ${dna.voice.tone} (${dna.voice.style || 'N/A'})`);
      }
      
      if (!dna.corePillars || dna.corePillars.length === 0) {
        console.log('❌ MISSING: Core pillars');
      } else {
        console.log(`✓ Core Pillars: ${dna.corePillars.length} found`);
      }
    }
    
    // Check strategic insights
    if (!data.strategicInsights || data.strategicInsights.length === 0) {
      console.log('❌ MISSING: Strategic insights');
    } else if (data.strategicInsights.length < 2) {
      console.log(`⚠️  WEAK: Only ${data.strategicInsights.length} insights (expected 2-3)`);
    } else {
      console.log(`✓ Strategic Insights: ${data.strategicInsights.length} found`);
      data.strategicInsights.forEach((insight, i) => {
        if (!insight.title || !insight.description) {
          console.log(`  ⚠️  Insight ${i + 1} missing title or description`);
        }
      });
    }
    
    // Check competitor intelligence
    if (!data.competitorIntelligence) {
      console.log('⚠️  MISSING: Competitor intelligence (optional but valuable)');
    } else {
      const comp = data.competitorIntelligence;
      if (!comp.competitors || comp.competitors.length === 0) {
        console.log('⚠️  WEAK: No competitors identified');
      } else {
        console.log(`✓ Competitors: ${comp.competitors.length} found`);
      }
    }
  });
  
  // Overall assessment
  console.log('\n' + '='.repeat(80));
  console.log('CEO VERDICT:');
  console.log('='.repeat(80));
  
  const allHaveContent = successfulScans.every(s => 
    s.results?.extractedContent?.profile?.bio &&
    s.results?.extractedContent?.posts?.length > 0 &&
    s.results?.brandDNA?.voice
  );
  
  const allHaveInsights = successfulScans.every(s => 
    s.results?.strategicInsights?.length > 0
  );
  
  if (failedScans.length > 0) {
    console.log('❌ UNACCEPTABLE: Some scans failed completely');
  } else if (!allHaveContent) {
    console.log('⚠️  CONCERNING: Not all scans have complete content');
  } else if (!allHaveInsights) {
    console.log('⚠️  NEEDS IMPROVEMENT: Missing strategic insights in some scans');
  } else {
    console.log('✓ ACCEPTABLE: All scans completed with core data');
  }
  
  // Save results to file (using Node.js fs)
  try {
    const fs = await import('fs/promises');
    await fs.writeFile(
      'scan-test-results.json',
      JSON.stringify(results, null, 2)
    );
    console.log('\nResults saved to scan-test-results.json');
  } catch (e) {
    console.log('\nCould not save results file (not critical)');
  }
}

// Run the test
runTest().catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});
