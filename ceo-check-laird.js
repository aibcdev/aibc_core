/**
 * CEO Check for Laird Superfood
 */

const API_BASE_URL = 'http://localhost:3001';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function startScan(username, platforms, scanType = 'standard') {
  const response = await fetch(`${API_BASE_URL}/api/scan/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, platforms, scanType })
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

async function waitForCompletion(scanId, maxWait = 600000) {
  const startTime = Date.now();
  let lastProgress = 0;

  while (Date.now() - startTime < maxWait) {
    const status = await getScanStatus(scanId);
    
    if (!status || !status.scan) {
      await sleep(5000);
      continue;
    }

    const { status: scanStatus, progress, logs } = status.scan;

    if (progress !== lastProgress) {
      console.log(`  📊 Progress: ${progress}%`);
      if (logs && logs.length > 0) {
        console.log(`  📝 ${logs[logs.length - 1]}`);
      }
      lastProgress = progress;
    }

    if (scanStatus === 'complete') {
      console.log(`  ✅ Scan completed!`);
      return true;
    }

    if (scanStatus === 'error') {
      console.log(`  ❌ Scan failed`);
      if (logs && logs.length > 0) {
        console.log(`  Error: ${logs[logs.length - 1]}`);
      }
      return false;
    }

    await sleep(5000);
  }

  console.log(`  ⏱️  Timeout`);
  return false;
}

function ceoEvaluate(results) {
  console.log('\n' + '='.repeat(80));
  console.log('💼 CEO CRITICAL EVALUATION - Laird Superfood');
  console.log('='.repeat(80) + '\n');

  if (!results || !results.data) {
    console.log('❌ CRITICAL FAILURE: No results returned');
    return { passed: false, score: 0, issues: ['No results returned'] };
  }

  const { extractedContent, brandDNA, strategicInsights, competitorIntelligence } = results.data;
  const issues = [];
  const strengths = [];
  let score = 0;

  // 1. PROFILE/BIO CHECK
  console.log('1️⃣  PROFILE & BIO');
  console.log('─'.repeat(80));
  const bio = extractedContent?.profile?.bio || '';
  const bioLength = bio.length;
  console.log(`   Bio Length: ${bioLength} chars`);
  console.log(`   Bio Preview: ${bio.substring(0, 100)}${bio.length > 100 ? '...' : ''}`);
  
  if (bioLength < 50) {
    issues.push(`Bio too short: ${bioLength} chars (minimum 50 required)`);
    console.log(`   ❌ FAIL: Bio too short`);
  } else {
    strengths.push(`Bio: ${bioLength} chars ✓`);
    score += 15;
    console.log(`   ✅ PASS: Bio meets minimum length`);
  }
  console.log('');

  // 2. POSTS CHECK
  console.log('2️⃣  POSTS & CONTENT');
  console.log('─'.repeat(80));
  const posts = extractedContent?.posts || [];
  const postCount = posts.length;
  console.log(`   Posts Found: ${postCount}`);
  
  if (postCount > 0) {
    console.log(`   Sample Posts:`);
    posts.slice(0, 3).forEach((post, i) => {
      const content = post.content || 'No content';
      console.log(`     ${i + 1}. ${content.substring(0, 80)}${content.length > 80 ? '...' : ''}`);
    });
  }
  
  if (postCount < 5) {
    issues.push(`Only ${postCount} posts found (minimum 5 required)`);
    console.log(`   ❌ FAIL: Insufficient posts`);
  } else {
    strengths.push(`Posts: ${postCount} extracted ✓`);
    score += 20;
    console.log(`   ✅ PASS: Sufficient posts extracted`);
  }
  console.log('');

  // 3. THEMES CHECK
  console.log('3️⃣  CONTENT THEMES');
  console.log('─'.repeat(80));
  const themes = extractedContent?.content_themes || [];
  const themeCount = themes.length;
  console.log(`   Themes Found: ${themeCount}`);
  if (themeCount > 0) {
    console.log(`   Themes: ${themes.join(', ')}`);
  }
  
  if (themeCount < 3) {
    issues.push(`Only ${themeCount} themes found (minimum 3 required)`);
    console.log(`   ❌ FAIL: Insufficient themes`);
  } else {
    strengths.push(`Themes: ${themeCount} identified ✓`);
    score += 15;
    console.log(`   ✅ PASS: Sufficient themes identified`);
  }
  console.log('');

  // 4. BRAND DNA CHECK
  console.log('4️⃣  BRAND DNA');
  console.log('─'.repeat(80));
  if (!brandDNA) {
    issues.push('Brand DNA not extracted');
    console.log(`   ❌ FAIL: Brand DNA missing`);
  } else {
    const voice = brandDNA.voice || {};
    const pillars = brandDNA.corePillars || [];
    console.log(`   Archetype: ${brandDNA.archetype || 'N/A'}`);
    console.log(`   Voice Tone: ${voice.tone || 'N/A'}`);
    console.log(`   Core Pillars: ${pillars.length}`);
    if (pillars.length > 0) {
      console.log(`   ${pillars.slice(0, 3).join(', ')}`);
    }
    
    if (!voice.tone || pillars.length < 3) {
      issues.push('Brand DNA incomplete');
      console.log(`   ⚠️  WARNING: Brand DNA incomplete`);
    } else {
      strengths.push('Brand DNA extracted ✓');
      score += 15;
      console.log(`   ✅ PASS: Brand DNA complete`);
    }
  }
  console.log('');

  // 5. STRATEGIC INSIGHTS CHECK
  console.log('5️⃣  STRATEGIC INSIGHTS');
  console.log('─'.repeat(80));
  const insights = strategicInsights || [];
  const insightCount = insights.length;
  console.log(`   Insights Found: ${insightCount}`);
  
  if (insightCount > 0) {
    insights.slice(0, 3).forEach((insight, i) => {
      console.log(`   ${i + 1}. ${insight.title || 'Untitled'}`);
      console.log(`      ${insight.description?.substring(0, 80) || 'No description'}...`);
      console.log(`      Impact: ${insight.impact || 'N/A'}`);
    });
  }
  
  if (insightCount < 3) {
    issues.push(`Only ${insightCount} strategic insights (minimum 3 required)`);
    console.log(`   ❌ FAIL: Insufficient insights`);
  } else {
    strengths.push(`Insights: ${insightCount} generated ✓`);
    score += 20;
    console.log(`   ✅ PASS: Sufficient strategic insights`);
  }
  console.log('');

  // 6. COMPETITOR INTELLIGENCE CHECK
  console.log('6️⃣  COMPETITOR INTELLIGENCE');
  console.log('─'.repeat(80));
  const competitors = competitorIntelligence || [];
  const competitorCount = competitors.length;
  console.log(`   Competitors Found: ${competitorCount}`);
  
  if (competitorCount > 0) {
    competitors.slice(0, 3).forEach((comp, i) => {
      console.log(`   ${i + 1}. ${comp.name || 'Unnamed'}`);
      console.log(`      Threat: ${comp.threatLevel || 'N/A'}`);
      console.log(`      Vector: ${comp.primaryVector || 'N/A'}`);
    });
  }
  
  if (competitorCount < 3) {
    issues.push(`Only ${competitorCount} competitors found (minimum 3 required)`);
    console.log(`   ❌ FAIL: Insufficient competitors`);
  } else {
    strengths.push(`Competitors: ${competitorCount} identified ✓`);
    score += 15;
    console.log(`   ✅ PASS: Sufficient competitors identified`);
  }
  console.log('');

  // FINAL VERDICT
  console.log('='.repeat(80));
  console.log('💼 CEO VERDICT');
  console.log('='.repeat(80));
  console.log(`\n📊 Score: ${score}/100`);
  console.log(`✅ Strengths: ${strengths.length}`);
  console.log(`❌ Issues: ${issues.length}\n`);

  if (strengths.length > 0) {
    console.log('✅ STRENGTHS:');
    strengths.forEach(s => console.log(`   • ${s}`));
    console.log('');
  }

  if (issues.length > 0) {
    console.log('❌ CRITICAL ISSUES:');
    issues.forEach(i => console.log(`   • ${i}`));
    console.log('');
  }

  const passed = score >= 80 && issues.length === 0;
  
  if (passed) {
    console.log('✅ PRODUCTION READY');
    console.log('   All critical metrics met. Ready to ship.');
  } else if (score >= 60) {
    console.log('⚠️  CLOSE BUT NOT READY');
    console.log(`   ${score}% score. Need to address ${issues.length} issue(s) before production.`);
  } else {
    console.log('❌ NOT PRODUCTION READY');
    console.log(`   Only ${score}% score. Critical issues must be resolved.`);
  }

  return { passed, score, issues, strengths };
}

async function runCEOCheck() {
  console.log('🎯 CEO CHECK - Laird Superfood (lairdsuperfood.com)');
  console.log('='.repeat(80));
  console.log('');

  try {
    // Start scan
    console.log('🚀 Starting scan...');
    const startResponse = await startScan('lairdsuperfood', ['twitter', 'youtube', 'linkedin', 'instagram'], 'standard');
    const scanId = startResponse.scanId;
    console.log(`📝 Scan ID: ${scanId}\n`);

    // Wait for completion
    console.log('⏳ Waiting for scan to complete...');
    const completed = await waitForCompletion(scanId);

    if (!completed) {
      console.log('\n❌ Scan failed or timed out');
      return;
    }

    // Get results
    console.log('\n📥 Fetching results...');
    const results = await getScanResults(scanId);

    // CEO Evaluation
    const evaluation = ceoEvaluate(results);

    // Save results
    try {
      const fs = await import('fs/promises');
      await fs.writeFile(
        'laird-superfood-ceo-check.json',
        JSON.stringify({ scanId, results, evaluation }, null, 2)
      );
      console.log('\n💾 Results saved to laird-superfood-ceo-check.json');
    } catch (e) {
      // Ignore file save errors
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

runCEOCheck().catch(console.error);

