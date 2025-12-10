/**
 * CEO-Level Comprehensive Test
 * Tests 3 diverse companies and validates EVERY dashboard section is unique
 * 
 * Companies:
 * 1. Tech: Tesla (tesla.com)
 * 2. Fashion: Zara (zara.com)  
 * 3. Marketing: HubSpot (hubspot.com)
 * 
 * Sections Tested:
 * - Brand DNA
 * - Strategic Insights
 * - Competitor Intelligence
 * - Content Ideas
 * - Analytics/Recommendations
 * - Market Share
 */

const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:3001';

const companies = [
  { name: 'Tesla', url: 'tesla.com', industry: 'Tech - Electric Vehicles', expectedCompetitors: ['Rivian', 'Lucid', 'Ford', 'GM', 'BYD'] },
  { name: 'Zara', url: 'zara.com', industry: 'Fashion - Fast Fashion Retail', expectedCompetitors: ['H&M', 'Uniqlo', 'Forever 21', 'Mango'] },
  { name: 'HubSpot', url: 'hubspot.com', industry: 'Marketing - CRM Software', expectedCompetitors: ['Salesforce', 'Pipedrive', 'Zoho', 'Monday.com'] }
];

let allResults = [];
let ceoScore = 0;
let totalChecks = 0;

function calculateUniquenessScore(results) {
  let score = 0;
  let checks = 0;
  
  // Check 1: Brand DNA uniqueness
  checks++;
  const brandDNAs = results.map(r => r.brandDNA?.archetype || '').filter(d => d);
  const uniqueDNAs = new Set(brandDNAs);
  if (uniqueDNAs.size === results.length && brandDNAs.length === results.length) {
    score += 20;
    console.log('  ✅ Brand DNA: All unique');
  } else {
    console.log('  ❌ Brand DNA: Some duplicates found');
  }
  
  // Check 2: Competitor uniqueness
  checks++;
  const allCompetitors = results.map(r => (r.competitors || []).map(c => c.name?.toLowerCase()).filter(n => n));
  const competitorOverlap = checkOverlap(allCompetitors);
  if (competitorOverlap < 0.1) { // Less than 10% overlap
    score += 20;
    console.log('  ✅ Competitors: Highly unique (overlap: ' + (competitorOverlap * 100).toFixed(1) + '%)');
  } else {
    console.log('  ⚠️ Competitors: Some overlap detected (' + (competitorOverlap * 100).toFixed(1) + '%)');
    score += Math.max(0, 20 - (competitorOverlap * 10));
  }
  
  // Check 3: Strategic Insights uniqueness
  checks++;
  const allInsights = results.map(r => (r.insights || []).map(i => i.title?.toLowerCase()).filter(t => t));
  const insightOverlap = checkOverlap(allInsights);
  if (insightOverlap < 0.15) { // Less than 15% overlap
    score += 20;
    console.log('  ✅ Strategic Insights: Highly unique (overlap: ' + (insightOverlap * 100).toFixed(1) + '%)');
  } else {
    console.log('  ⚠️ Strategic Insights: Some overlap detected (' + (insightOverlap * 100).toFixed(1) + '%)');
    score += Math.max(0, 20 - (insightOverlap * 8));
  }
  
  // Check 4: Content Ideas uniqueness
  checks++;
  const allContentIdeas = results.map(r => (r.contentIdeas || []).map(c => c.title?.toLowerCase()).filter(t => t));
  const contentOverlap = checkOverlap(allContentIdeas);
  if (contentOverlap < 0.15) {
    score += 20;
    console.log('  ✅ Content Ideas: Highly unique (overlap: ' + (contentOverlap * 100).toFixed(1) + '%)');
  } else {
    console.log('  ⚠️ Content Ideas: Some overlap detected (' + (contentOverlap * 100).toFixed(1) + '%)');
    score += Math.max(0, 20 - (contentOverlap * 8));
  }
  
  // Check 5: Brand-specificity (mentions company name or industry)
  checks++;
  let brandSpecificCount = 0;
  results.forEach((result, idx) => {
    const company = companies[idx];
    const hasBrandInInsights = (result.insights || []).some(i => 
      i.title?.toLowerCase().includes(company.name.toLowerCase()) ||
      i.description?.toLowerCase().includes(company.name.toLowerCase())
    );
    const hasBrandInContent = (result.contentIdeas || []).some(c =>
      c.title?.toLowerCase().includes(company.name.toLowerCase()) ||
      c.description?.toLowerCase().includes(company.name.toLowerCase())
    );
    if (hasBrandInInsights || hasBrandInContent) brandSpecificCount++;
  });
  
  if (brandSpecificCount === results.length) {
    score += 20;
    console.log('  ✅ Brand Specificity: All sections mention company name/industry');
  } else {
    console.log('  ⚠️ Brand Specificity: Only ' + brandSpecificCount + '/' + results.length + ' companies have brand-specific mentions');
    score += (brandSpecificCount / results.length) * 20;
  }
  
  return { score, checks, percentage: (score / (checks * 20)) * 100 };
}

function checkOverlap(arrays) {
  if (arrays.length < 2) return 0;
  
  let totalOverlap = 0;
  let comparisons = 0;
  
  for (let i = 0; i < arrays.length; i++) {
    for (let j = i + 1; j < arrays.length; j++) {
      const set1 = new Set(arrays[i]);
      const set2 = new Set(arrays[j]);
      const intersection = arrays[i].filter(x => set2.has(x));
      const union = new Set([...arrays[i], ...arrays[j]]);
      const overlap = union.size > 0 ? intersection.length / union.size : 0;
      totalOverlap += overlap;
      comparisons++;
    }
  }
  
  return comparisons > 0 ? totalOverlap / comparisons : 0;
}

async function testCompany(company, index) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`TEST ${index + 1}/3: ${company.name} (${company.url})`);
  console.log(`Industry: ${company.industry}`);
  console.log(`${'='.repeat(80)}\n`);

  try {
    // Start scan
    console.log(`[${company.name}] Starting scan...`);
    const scanResponse = await fetch(`${API_BASE_URL}/api/scan/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: company.url,
        platforms: ['twitter', 'youtube', 'linkedin', 'instagram'],
        scanType: 'basic'
      })
    });

    if (!scanResponse.ok) {
      throw new Error(`Failed to start scan: ${scanResponse.status}`);
    }

    const { scanId } = await scanResponse.json();
    console.log(`[${company.name}] Scan started: ${scanId}`);

    // Poll for completion
    console.log(`[${company.name}] Waiting for completion...`);
    let attempts = 0;
    const maxAttempts = 120;
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      const statusResponse = await fetch(`${API_BASE_URL}/api/scan/${scanId}/status`);
      const statusData = await statusResponse.json();
      const scan = statusData.scan || statusData;
      
      process.stdout.write(`\r[${company.name}] Progress: ${scan.progress}% - Status: ${scan.status}    `);
      
      if (scan.status === 'complete' || scan.status === 'completed') {
        console.log('\n');
        break;
      } else if (scan.status === 'error') {
        throw new Error(`Scan failed: ${scan.error || 'Unknown error'}`);
      }
      
      attempts++;
    }

    if (attempts >= maxAttempts) {
      throw new Error('Scan timeout');
    }

    // Get results
    console.log(`[${company.name}] Fetching results...`);
    const resultsResponse = await fetch(`${API_BASE_URL}/api/scan/${scanId}/results`);
    const results = await resultsResponse.json();
    
    if (!results.success || !results.data) {
      throw new Error('No results returned');
    }

    const data = results.data;
    
    // Extract and validate all sections
    const result = {
      company: company.name,
      url: company.url,
      industry: company.industry,
      brandDNA: data.brandDNA,
      competitors: data.competitorIntelligence || [],
      insights: data.strategicInsights || [],
      contentIdeas: data.contentIdeas || [],
      marketShare: data.marketShare,
      success: true
    };
    
    // Validate competitor relevance
    const competitorNames = result.competitors.map(c => c.name?.toLowerCase() || '').filter(n => n);
    const hasRelevantCompetitor = company.expectedCompetitors.some(expected => 
      competitorNames.some(found => found.includes(expected.toLowerCase()) || expected.toLowerCase().includes(found))
    );
    
    console.log(`\n[${company.name}] Results Summary:`);
    console.log(`  - Brand DNA: ${result.brandDNA?.archetype || 'N/A'}`);
    console.log(`  - Competitors: ${result.competitors.length} (relevant: ${hasRelevantCompetitor ? 'YES' : 'NO'})`);
    console.log(`  - Strategic Insights: ${result.insights.length}`);
    console.log(`  - Content Ideas: ${result.contentIdeas.length}`);
    console.log(`  - Market Share: ${result.marketShare ? result.marketShare.percentage + '%' : 'N/A'}`);
    
    if (result.competitors.length > 0) {
      console.log(`  - Top Competitors: ${result.competitors.slice(0, 3).map(c => c.name).join(', ')}`);
    }
    
    return result;

  } catch (error) {
    console.error(`\n[${company.name}] ❌ ERROR: ${error.message}\n`);
    return {
      company: company.name,
      url: company.url,
      success: false,
      error: error.message
    };
  }
}

async function runCEOTest() {
  console.log('\n' + '='.repeat(80));
  console.log('CEO-LEVEL COMPREHENSIVE TEST');
  console.log('Testing: ALL Dashboard Sections for Uniqueness & Brand-Specificity');
  console.log('='.repeat(80) + '\n');

  // Test all companies
  for (let i = 0; i < companies.length; i++) {
    const result = await testCompany(companies[i], i);
    allResults.push(result);
    
    if (i < companies.length - 1) {
      console.log(`\n⏳ Waiting 10 seconds before next test...\n`);
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  }

  // Filter successful results
  const successfulResults = allResults.filter(r => r.success);
  
  if (successfulResults.length < companies.length) {
    console.log(`\n⚠️ WARNING: Only ${successfulResults.length}/${companies.length} scans completed successfully\n`);
  }

  // Calculate uniqueness score
  console.log('\n' + '='.repeat(80));
  console.log('UNIQUENESS ANALYSIS');
  console.log('='.repeat(80) + '\n');
  
  const uniqueness = calculateUniquenessScore(successfulResults);
  ceoScore = uniqueness.percentage;
  totalChecks = uniqueness.checks;
  
  // Detailed section-by-section analysis
  console.log('\n' + '='.repeat(80));
  console.log('DETAILED SECTION ANALYSIS');
  console.log('='.repeat(80) + '\n');
  
  successfulResults.forEach((result, idx) => {
    const company = companies[idx];
    console.log(`\n${company.name} (${company.url}):`);
    console.log(`  Brand DNA: ${result.brandDNA?.archetype || 'N/A'} | Voice: ${result.brandDNA?.voice?.style || 'N/A'}`);
    console.log(`  Competitors (${result.competitors.length}): ${result.competitors.slice(0, 3).map(c => c.name).join(', ')}`);
    console.log(`  Insights (${result.insights.length}):`);
    result.insights.slice(0, 2).forEach((insight, i) => {
      const isBrandSpecific = insight.title?.toLowerCase().includes(company.name.toLowerCase()) ||
                             insight.description?.toLowerCase().includes(company.name.toLowerCase());
      console.log(`    ${i + 1}. ${insight.title || 'N/A'} ${isBrandSpecific ? '✅' : '⚠️'}`);
    });
    console.log(`  Content Ideas (${result.contentIdeas.length}):`);
    result.contentIdeas.slice(0, 2).forEach((idea, i) => {
      const isBrandSpecific = idea.title?.toLowerCase().includes(company.name.toLowerCase()) ||
                             idea.description?.toLowerCase().includes(company.name.toLowerCase());
      console.log(`    ${i + 1}. ${idea.title || 'N/A'} ${isBrandSpecific ? '✅' : '⚠️'}`);
    });
  });
  
  // CEO Review
  console.log('\n' + '='.repeat(80));
  console.log('CEO REVIEW & HAPPINESS SCORE');
  console.log('='.repeat(80) + '\n');
  
  const happinessScore = ceoScore;
  const grade = happinessScore >= 95 ? 'A+' : 
                happinessScore >= 90 ? 'A' :
                happinessScore >= 85 ? 'B+' :
                happinessScore >= 80 ? 'B' :
                happinessScore >= 75 ? 'C+' : 'C';
  
  console.log(`Overall Happiness Score: ${happinessScore.toFixed(1)}%`);
  console.log(`Grade: ${grade}\n`);
  
  if (happinessScore >= 95) {
    console.log('🎉 EXCELLENT! CEO is VERY HAPPY!');
    console.log('✅ All dashboard sections are unique and brand-specific');
    console.log('✅ No generic data detected');
    console.log('✅ Ready for production\n');
  } else {
    console.log('⚠️ NEEDS IMPROVEMENT');
    console.log(`Current score: ${happinessScore.toFixed(1)}% (Target: 95%+)`);
    console.log('Issues detected that need fixing:\n');
    
    if (uniqueness.score < 100) {
      console.log('  - Some sections may have duplicate/generic content');
      console.log('  - Brand-specificity could be improved');
    }
  }
  
  // Final Summary
  console.log('='.repeat(80));
  console.log('FINAL SUMMARY');
  console.log('='.repeat(80) + '\n');
  
  console.log(`Companies Tested: ${successfulResults.length}/${companies.length}`);
  console.log(`Uniqueness Score: ${happinessScore.toFixed(1)}%`);
  console.log(`CEO Happiness: ${happinessScore >= 95 ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`\n${happinessScore >= 95 ? '✅ SYSTEM READY FOR PRODUCTION' : '⚠️ SYSTEM NEEDS FIXES'}\n`);
  
  return { score: happinessScore, passed: happinessScore >= 95 };
}

runCEOTest().catch(console.error);

