/**
 * CEO Review Test: Full Scan for 3 Companies
 * Tests: goodphats.com, lululemon.com, airbnb.com
 * 
 * Comprehensive CEO-level review of ALL dashboard sections
 */

const API_BASE_URL = process.env.API_URL || 'http://localhost:3001';

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
    throw new Error(`Failed to start scan: ${response.status} - ${errorText}`);
  }
  
  return response.json();
}

async function getScanStatus(scanId) {
  const response = await fetch(`${API_BASE_URL}/api/scan/${scanId}/status`);
  if (!response.ok) throw new Error(`Failed to get status: ${response.statusText}`);
  return response.json();
}

async function getScanResults(scanId) {
  const response = await fetch(`${API_BASE_URL}/api/scan/${scanId}/results`);
  if (!response.ok) throw new Error(`Failed to get results: ${response.statusText}`);
  return response.json();
}

async function waitForScan(scanId, companyName, maxWait = 600000) {
  const startTime = Date.now();
  let lastProgress = 0;
  
  while (Date.now() - startTime < maxWait) {
    const status = await getScanStatus(scanId);
    
    if (status.scan.status === 'complete') {
      console.log(`   ✅ ${companyName} scan complete!`);
      return true;
    }
    
    if (status.scan.status === 'error') {
      throw new Error(`Scan failed: ${status.scan.error}`);
    }
    
    if (status.scan.progress !== lastProgress) {
      lastProgress = status.scan.progress;
      const latestLog = status.scan.logs?.slice(-1)[0] || 'Processing...';
      console.log(`   [${status.scan.progress}%] ${latestLog.substring(0, 80)}`);
    }
    
    await sleep(5000);
  }
  
  throw new Error(`Scan timeout after ${maxWait/60000} minutes`);
}

// CEO Review function - grades each section
function ceoReview(results, companyName) {
  console.log('\n' + '═'.repeat(80));
  console.log(`🎯 CEO REVIEW: ${companyName.toUpperCase()}`);
  console.log('═'.repeat(80));
  
  const grades = {};
  const issues = [];
  const successes = [];
  
  // 1. BRAND DNA
  console.log('\n📊 1. BRAND DNA:');
  if (results.brandDNA) {
    const dna = results.brandDNA;
    let score = 0;
    
    if (dna.archetype) { score += 20; console.log(`   ✅ Archetype: ${dna.archetype}`); }
    else { issues.push('Missing brand archetype'); console.log('   ❌ Missing archetype'); }
    
    if (dna.voice?.tone) { score += 20; console.log(`   ✅ Voice tone: ${dna.voice.tone}`); }
    else { issues.push('Missing voice tone'); console.log('   ❌ Missing voice tone'); }
    
    if (dna.corePillars?.length >= 3) { 
      score += 30; 
      console.log(`   ✅ Core pillars (${dna.corePillars.length}): ${dna.corePillars.slice(0,3).join(', ')}`);
    } else { 
      issues.push('Insufficient core pillars'); 
      console.log(`   ⚠️ Only ${dna.corePillars?.length || 0} core pillars (need 3+)`);
    }
    
    if (dna.targetAudience) { score += 15; console.log(`   ✅ Target audience defined`); }
    if (dna.differentiator) { score += 15; console.log(`   ✅ Differentiator: ${dna.differentiator.substring(0,60)}...`); }
    
    grades['Brand DNA'] = score;
  } else {
    grades['Brand DNA'] = 0;
    issues.push('CRITICAL: No Brand DNA extracted');
    console.log('   ❌ CRITICAL: Brand DNA completely missing!');
  }
  
  // 2. STRATEGIC INSIGHTS
  console.log('\n📊 2. STRATEGIC INSIGHTS:');
  if (results.strategicInsights?.length > 0) {
    const insights = results.strategicInsights;
    console.log(`   ✅ ${insights.length} strategic insights generated`);
    
    insights.slice(0, 3).forEach((insight, i) => {
      console.log(`   ${i+1}. ${insight.title || 'Untitled'} [${insight.impact || 'N/A'}]`);
    });
    
    const highImpact = insights.filter(i => i.impact?.toUpperCase().includes('HIGH')).length;
    if (highImpact >= 2) {
      grades['Strategic Insights'] = 90;
      successes.push(`${highImpact} high-impact insights identified`);
    } else {
      grades['Strategic Insights'] = 60;
      issues.push('Too few high-impact insights');
    }
  } else {
    grades['Strategic Insights'] = 0;
    issues.push('CRITICAL: No strategic insights');
    console.log('   ❌ CRITICAL: No strategic insights!');
  }
  
  // 3. CONTENT THEMES
  console.log('\n📊 3. CONTENT THEMES:');
  const themes = results.extractedContent?.content_themes || results.contentThemes || [];
  if (themes.length >= 3) {
    console.log(`   ✅ ${themes.length} themes: ${themes.join(', ')}`);
    
    // Check if themes are generic
    const genericTerms = ['content', 'marketing', 'brand', 'social media', 'digital'];
    const genericCount = themes.filter(t => 
      genericTerms.some(g => t.toLowerCase().includes(g))
    ).length;
    
    if (genericCount > themes.length / 2) {
      grades['Content Themes'] = 50;
      issues.push('Themes are too generic');
      console.log('   ⚠️ Themes appear too generic');
    } else {
      grades['Content Themes'] = 85;
      successes.push('Specific, niche-relevant themes');
    }
  } else {
    grades['Content Themes'] = themes.length > 0 ? 40 : 0;
    issues.push(`Only ${themes.length} themes (need 3+)`);
    console.log(`   ❌ Only ${themes.length} themes found`);
  }
  
  // 4. COMPETITOR INTELLIGENCE
  console.log('\n📊 4. COMPETITOR INTELLIGENCE:');
  if (results.competitorIntelligence?.length > 0) {
    const competitors = results.competitorIntelligence;
    console.log(`   ✅ ${competitors.length} competitors analyzed`);
    
    competitors.slice(0, 3).forEach((comp, i) => {
      console.log(`   ${i+1}. ${comp.name || comp.handle || 'Unknown'} - ${comp.threatLevel || 'N/A'} threat`);
    });
    
    const hasVectors = competitors.some(c => c.primaryVector || c.contentStrategy);
    if (hasVectors && competitors.length >= 2) {
      grades['Competitor Intel'] = 90;
      successes.push('Detailed competitor analysis with strategies');
    } else {
      grades['Competitor Intel'] = 65;
      issues.push('Competitor analysis lacks depth');
    }
  } else {
    grades['Competitor Intel'] = 0;
    issues.push('CRITICAL: No competitor intelligence');
    console.log('   ❌ CRITICAL: No competitor intelligence!');
  }
  
  // 5. CONTENT IDEAS
  console.log('\n📊 5. CONTENT IDEAS (Viral Focus):');
  if (results.contentIdeas?.length > 0) {
    const ideas = results.contentIdeas;
    console.log(`   ✅ ${ideas.length} content ideas generated`);
    
    // Check for virality indicators
    let viralIndicators = 0;
    ideas.slice(0, 5).forEach((idea, i) => {
      const title = idea.title || 'Untitled';
      const hasHook = /\?|secret|never|always|why|how|truth|reveal/i.test(title);
      const isSpecific = title.length > 20 && !title.includes('generic');
      
      if (hasHook) viralIndicators++;
      console.log(`   ${i+1}. ${title.substring(0, 60)}${title.length > 60 ? '...' : ''} ${hasHook ? '🔥' : ''}`);
    });
    
    if (viralIndicators >= 2 && ideas.length >= 5) {
      grades['Content Ideas'] = 85;
      successes.push(`${viralIndicators} ideas with viral hooks`);
    } else if (ideas.length >= 3) {
      grades['Content Ideas'] = 60;
      issues.push('Content ideas lack viral hooks/engagement triggers');
    } else {
      grades['Content Ideas'] = 40;
      issues.push('Insufficient content ideas');
    }
  } else {
    grades['Content Ideas'] = 0;
    issues.push('CRITICAL: No content ideas');
    console.log('   ❌ CRITICAL: No content ideas generated!');
  }
  
  // 6. MARKET SHARE
  console.log('\n📊 6. MARKET POSITION:');
  if (results.marketShare) {
    const ms = results.marketShare;
    console.log(`   ✅ Market share: ${ms.percentage}% of ${ms.industry}`);
    console.log(`   ✅ Rank: #${ms.yourRank || 'N/A'} of ${ms.totalCreatorsInSpace || 'N/A'}`);
    grades['Market Position'] = 80;
  } else {
    grades['Market Position'] = 30;
    console.log('   ⚠️ Market position not calculated');
  }
  
  // 7. SOCIAL LINKS
  console.log('\n📊 7. SOCIAL LINKS DISCOVERY:');
  if (results.socialLinks && Object.keys(results.socialLinks).length > 0) {
    const links = results.socialLinks;
    console.log(`   ✅ ${Object.keys(links).length} platforms found:`);
    Object.entries(links).forEach(([platform, url]) => {
      console.log(`      • ${platform}: ${url}`);
    });
    
    grades['Social Discovery'] = Object.keys(links).length >= 3 ? 90 : 60;
  } else {
    grades['Social Discovery'] = 0;
    issues.push('CRITICAL: No social links discovered');
    console.log('   ❌ CRITICAL: No social links found!');
  }
  
  // 8. POSTS EXTRACTED
  console.log('\n📊 8. CONTENT EXTRACTION:');
  const posts = results.extractedContent?.posts || [];
  if (posts.length > 0) {
    console.log(`   ✅ ${posts.length} posts extracted`);
    posts.slice(0, 2).forEach((post, i) => {
      const content = post.content || 'No content';
      console.log(`   ${i+1}. "${content.substring(0, 60)}..."`);
    });
    grades['Content Extraction'] = posts.length >= 5 ? 90 : 60;
  } else {
    grades['Content Extraction'] = 0;
    issues.push('No posts extracted');
    console.log('   ❌ No posts extracted!');
  }
  
  // OVERALL GRADE
  console.log('\n' + '─'.repeat(80));
  console.log('📊 SECTION GRADES:');
  console.log('─'.repeat(80));
  
  let totalScore = 0;
  let count = 0;
  Object.entries(grades).forEach(([section, score]) => {
    const emoji = score >= 80 ? '🟢' : score >= 50 ? '🟡' : '🔴';
    console.log(`   ${emoji} ${section}: ${score}/100`);
    totalScore += score;
    count++;
  });
  
  const overallGrade = Math.round(totalScore / count);
  
  console.log('\n' + '═'.repeat(80));
  console.log(`📊 OVERALL CEO GRADE: ${overallGrade}/100`);
  
  let verdict;
  if (overallGrade >= 80) {
    verdict = '✅ EXCELLENT - Ready for production';
    console.log(`   ${verdict}`);
  } else if (overallGrade >= 60) {
    verdict = '⚠️ ACCEPTABLE - Needs improvement';
    console.log(`   ${verdict}`);
  } else {
    verdict = '❌ UNACCEPTABLE - Critical fixes required';
    console.log(`   ${verdict}`);
  }
  
  if (successes.length > 0) {
    console.log('\n✅ STRENGTHS:');
    successes.forEach(s => console.log(`   • ${s}`));
  }
  
  if (issues.length > 0) {
    console.log('\n❌ ISSUES:');
    issues.forEach(i => console.log(`   • ${i}`));
  }
  
  console.log('═'.repeat(80));
  
  return { grades, overallGrade, issues, successes, verdict };
}

async function runComprehensiveTest() {
  console.log('═'.repeat(80));
  console.log('🎯 CEO COMPREHENSIVE TEST - 3 COMPANIES');
  console.log('═'.repeat(80));
  console.log('Testing: goodphats.com, lululemon.com, airbnb.com');
  console.log('Platforms: twitter, instagram, linkedin, youtube, tiktok, facebook');
  console.log('');
  
  const companies = [
    'goodphats.com',
    'lululemon.com', 
    'airbnb.com'
  ];
  
  const platforms = ['twitter', 'instagram', 'linkedin', 'youtube', 'tiktok', 'facebook'];
  const allResults = {};
  
  for (const company of companies) {
    console.log('\n' + '─'.repeat(80));
    console.log(`🚀 Starting scan: ${company}`);
    console.log('─'.repeat(80));
    
    try {
      const startResponse = await startScan(company, platforms, 'standard');
      const scanId = startResponse.scanId;
      console.log(`   📝 Scan ID: ${scanId}`);
      
      await waitForScan(scanId, company);
      
      console.log(`   📥 Fetching results...`);
      const resultsResponse = await getScanResults(scanId);
      const results = resultsResponse.data;
      
      // Run CEO review
      const review = ceoReview(results, company);
      
      allResults[company] = {
        scanId,
        results,
        review,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error(`\n❌ FAILED: ${company} - ${error.message}`);
      allResults[company] = {
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
    
    // Brief pause between scans
    if (company !== companies[companies.length - 1]) {
      console.log('\n⏳ Waiting 5 seconds before next scan...');
      await sleep(5000);
    }
  }
  
  // FINAL SUMMARY
  console.log('\n\n' + '═'.repeat(80));
  console.log('📊 FINAL CEO SUMMARY - ALL COMPANIES');
  console.log('═'.repeat(80));
  
  companies.forEach(company => {
    const result = allResults[company];
    if (result.error) {
      console.log(`\n❌ ${company}: FAILED - ${result.error}`);
    } else {
      console.log(`\n${result.review.verdict.includes('EXCELLENT') ? '✅' : result.review.verdict.includes('ACCEPTABLE') ? '⚠️' : '❌'} ${company}: ${result.review.overallGrade}/100`);
      if (result.review.issues.length > 0) {
        console.log(`   Issues: ${result.review.issues.slice(0, 3).join('; ')}`);
      }
    }
  });
  
  // Save results
  const fs = await import('fs/promises');
  await fs.writeFile(
    'ceo-3companies-results.json',
    JSON.stringify(allResults, null, 2)
  );
  console.log('\n💾 Results saved to ceo-3companies-results.json');
  
  // Calculate overall platform grade
  const successfulScans = Object.values(allResults).filter(r => !r.error);
  if (successfulScans.length > 0) {
    const avgGrade = Math.round(
      successfulScans.reduce((sum, r) => sum + r.review.overallGrade, 0) / successfulScans.length
    );
    console.log(`\n📊 PLATFORM AVERAGE: ${avgGrade}/100`);
    
    if (avgGrade >= 80) {
      console.log('🎉 PLATFORM STATUS: PRODUCTION READY');
    } else if (avgGrade >= 60) {
      console.log('⚠️ PLATFORM STATUS: NEEDS IMPROVEMENT');
    } else {
      console.log('❌ PLATFORM STATUS: CRITICAL FIXES REQUIRED');
    }
  }
  
  console.log('\n' + '═'.repeat(80));
}

// Run
(async () => {
  try {
    // Quick backend check
    const response = await fetch(`${API_BASE_URL}/api/scan/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'test', platforms: ['twitter'] }),
    }).catch(() => null);
    
    if (!response) {
      console.error('❌ Backend is not running! Start it with: cd backend && npm run dev');
      process.exit(1);
    }
    
    await runComprehensiveTest();
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
})();
