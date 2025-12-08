/**
 * CEO Review Script - Tests scans with critical CEO evaluation
 * Tests: GoodPhats, Nike, LuluLemon, Dipsea, Kobo Books
 */

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

const testSubjects = [
  { username: 'goodphats', name: 'GoodPhats', type: 'small_brand' },
  { username: 'nike', name: 'Nike', type: 'large_brand' },
  { username: 'lululemon', name: 'LuluLemon', type: 'large_brand' },
  { username: 'dipsea', name: 'Dipsea', type: 'small_brand' },
  { username: 'kobobooks', name: 'Kobo Books', type: 'medium_brand' }
];

const platforms = ['twitter', 'youtube', 'linkedin', 'instagram'];

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function startScan(username, scanType = 'standard') {
  try {
    const response = await fetch(`${API_BASE_URL}/api/scan/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        platforms,
        scanType
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to start scan');
    }

    const data = await response.json();
    return data.scanId;
  } catch (error) {
    console.error(`Failed to start scan for ${username}:`, error.message);
    throw error;
  }
}

async function getScanStatus(scanId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/scan/${scanId}/status`);
    if (!response.ok) {
      throw new Error('Failed to get scan status');
    }
    return await response.json();
  } catch (error) {
    console.error(`Failed to get status for ${scanId}:`, error.message);
    return null;
  }
}

async function getScanResults(scanId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/scan/${scanId}/results`);
    if (!response.ok) {
      throw new Error('Failed to get scan results');
    }
    return await response.json();
  } catch (error) {
    console.error(`Failed to get results for ${scanId}:`, error.message);
    return null;
  }
}

async function waitForScanCompletion(scanId, maxWait = 600000) { // 10 minutes max
  const startTime = Date.now();
  let lastProgress = 0;

  while (Date.now() - startTime < maxWait) {
    const status = await getScanStatus(scanId);
    
    if (!status || !status.scan) {
      console.log(`  ⚠️  Status check failed, retrying...`);
      await sleep(5000);
      continue;
    }

    const { status: scanStatus, progress, logs } = status.scan;

    // Show progress updates
    if (progress !== lastProgress) {
      console.log(`  📊 Progress: ${progress}%`);
      lastProgress = progress;
    }

    if (scanStatus === 'complete') {
      console.log(`  ✅ Scan completed!`);
      return true;
    }

    if (scanStatus === 'error') {
      console.log(`  ❌ Scan failed`);
      if (logs && logs.length > 0) {
        console.log(`  Last log: ${logs[logs.length - 1]}`);
      }
      return false;
    }

    await sleep(5000); // Check every 5 seconds
  }

  console.log(`  ⏱️  Timeout after ${maxWait / 1000}s`);
  return false;
}

function evaluateScanResults(results, subject) {
  const evaluation = {
    subject: subject.name,
    username: subject.username,
    passed: false,
    issues: [],
    strengths: [],
    score: 0,
    details: {}
  };

  if (!results || !results.data) {
    evaluation.issues.push('No results returned');
    return evaluation;
  }

  const { extractedContent, brandDNA, strategicInsights, competitorIntelligence } = results.data;

  // Check posts
  const posts = extractedContent?.posts || [];
  evaluation.details.posts = posts.length;
  if (posts.length < 5) {
    evaluation.issues.push(`Only ${posts.length} posts found (minimum 5 required)`);
  } else {
    evaluation.strengths.push(`${posts.length} posts extracted`);
  }

  // Check bio
  const bio = extractedContent?.profile?.bio || '';
  evaluation.details.bioLength = bio.length;
  if (bio.length < 50) {
    evaluation.issues.push(`Bio too short: ${bio.length} chars (minimum 50 required)`);
  } else {
    evaluation.strengths.push(`Bio extracted: ${bio.length} chars`);
  }

  // Check themes
  const themes = extractedContent?.content_themes || [];
  evaluation.details.themes = themes.length;
  if (themes.length < 3) {
    evaluation.issues.push(`Only ${themes.length} themes found (minimum 3 required)`);
  } else {
    evaluation.strengths.push(`${themes.length} themes identified`);
  }

  // Check brand DNA
  if (!brandDNA || !brandDNA.voice) {
    evaluation.issues.push('Brand DNA not extracted');
  } else {
    evaluation.strengths.push('Brand DNA extracted');
  }

  // Check strategic insights
  const insights = strategicInsights || [];
  evaluation.details.insights = insights.length;
  if (insights.length < 3) {
    evaluation.issues.push(`Only ${insights.length} strategic insights (minimum 3 required)`);
  } else {
    evaluation.strengths.push(`${insights.length} strategic insights generated`);
  }

  // Check competitors
  const competitors = competitorIntelligence || [];
  evaluation.details.competitors = competitors.length;
  if (competitors.length < 3) {
    evaluation.issues.push(`Only ${competitors.length} competitors found (minimum 3 required)`);
  } else {
    evaluation.strengths.push(`${competitors.length} competitors identified`);
  }

  // Calculate score
  const checks = [
    posts.length >= 5,
    bio.length >= 50,
    themes.length >= 3,
    !!brandDNA,
    insights.length >= 3,
    competitors.length >= 3
  ];
  
  evaluation.score = (checks.filter(Boolean).length / checks.length) * 100;
  evaluation.passed = evaluation.score >= 80 && evaluation.issues.length === 0;

  return evaluation;
}

async function runCEOReview() {
  console.log('🎯 CEO CRITICAL REVIEW - Round 3 (After All Fixes)\n');
  console.log('='.repeat(60));
  console.log(`Testing: ${testSubjects.map(s => s.name).join(', ')}\n`);

  const evaluations = [];

  for (const subject of testSubjects) {
    console.log(`\n📊 Testing: ${subject.name} (@${subject.username})`);
    console.log(`   Type: ${subject.type}`);
    console.log(`   Platforms: ${platforms.join(', ')}`);

    try {
      // Start scan
      console.log(`   🚀 Starting scan...`);
      const scanId = await startScan(subject.username, 'standard');
      console.log(`   📝 Scan ID: ${scanId}`);

      // Wait for completion
      const completed = await waitForScanCompletion(scanId);
      
      if (!completed) {
        evaluations.push({
          subject: subject.name,
          username: subject.username,
          passed: false,
          issues: ['Scan failed or timed out'],
          strengths: [],
          score: 0,
          details: {}
        });
        continue;
      }

      // Get results
      console.log(`   📥 Fetching results...`);
      const results = await getScanResults(scanId);
      
      if (!results || !results.success) {
        evaluations.push({
          subject: subject.name,
          username: subject.username,
          passed: false,
          issues: ['Failed to get results'],
          strengths: [],
          score: 0,
          details: {}
        });
        continue;
      }

      // Evaluate
      const evaluation = evaluateScanResults(results, subject);
      evaluations.push(evaluation);

      // Print summary
      console.log(`   ${evaluation.passed ? '✅' : '❌'} ${evaluation.passed ? 'PASSED' : 'FAILED'} (Score: ${evaluation.score.toFixed(0)}%)`);
      if (evaluation.strengths.length > 0) {
        console.log(`   ✅ Strengths: ${evaluation.strengths.join(', ')}`);
      }
      if (evaluation.issues.length > 0) {
        console.log(`   ❌ Issues: ${evaluation.issues.join(', ')}`);
      }

      // Wait before next scan
      await sleep(2000);

    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
      evaluations.push({
        subject: subject.name,
        username: subject.username,
        passed: false,
        issues: [error.message],
        strengths: [],
        score: 0,
        details: {}
      });
    }
  }

  // Final Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 CEO REVIEW SUMMARY\n');

  const passed = evaluations.filter(e => e.passed).length;
  const total = evaluations.length;
  const successRate = (passed / total) * 100;
  const avgScore = evaluations.reduce((sum, e) => sum + e.score, 0) / total;

  console.log(`✅ Passed: ${passed}/${total} (${successRate.toFixed(0)}%)`);
  console.log(`📈 Average Score: ${avgScore.toFixed(0)}%`);
  console.log(`\n🎯 Target: 95% success rate\n`);

  console.log('Detailed Results:');
  evaluations.forEach(e => {
    console.log(`\n${e.passed ? '✅' : '❌'} ${e.subject} (${e.score.toFixed(0)}%)`);
    console.log(`   Posts: ${e.details.posts || 0}, Bio: ${e.details.bioLength || 0} chars, Themes: ${e.details.themes || 0}`);
    console.log(`   Insights: ${e.details.insights || 0}, Competitors: ${e.details.competitors || 0}`);
    if (e.issues.length > 0) {
      console.log(`   Issues: ${e.issues.join('; ')}`);
    }
  });

  // CEO Verdict
  console.log('\n' + '='.repeat(60));
  console.log('💼 CEO VERDICT\n');

  if (successRate >= 95) {
    console.log('✅ PRODUCTION READY');
    console.log('   All critical metrics met. Ready to ship.');
  } else if (successRate >= 80) {
    console.log('⚠️  CLOSE BUT NOT READY');
    console.log(`   ${successRate.toFixed(0)}% success rate. Need ${(95 - successRate).toFixed(0)}% more.`);
    console.log('   Address remaining issues before production.');
  } else {
    console.log('❌ NOT PRODUCTION READY');
    console.log(`   Only ${successRate.toFixed(0)}% success rate.`);
    console.log('   Critical issues must be resolved.');
  }

  // Identify common issues
  const allIssues = evaluations.flatMap(e => e.issues);
  const issueCounts = {};
  allIssues.forEach(issue => {
    issueCounts[issue] = (issueCounts[issue] || 0) + 1;
  });

  if (Object.keys(issueCounts).length > 0) {
    console.log('\n🔍 Common Issues:');
    Object.entries(issueCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([issue, count]) => {
        console.log(`   - ${issue} (${count} times)`);
      });
  }

  return { evaluations, successRate, avgScore };
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runCEOReview().catch(console.error);
}

export { runCEOReview, evaluateScanResults };

