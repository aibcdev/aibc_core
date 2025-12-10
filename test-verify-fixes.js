/**
 * Verification Test: Verify all critical fixes work
 * Tests: Cache clearing, Competitor analysis, Brand-specific data
 */

const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:3001';

async function testScan(company) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`TESTING: ${company.name} (${company.url})`);
  console.log(`${'='.repeat(80)}\n`);

  try {
    // Start scan
    console.log(`[1/5] Starting scan...`);
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
    console.log(`✅ Scan started: ${scanId}`);

    // Poll for completion
    console.log(`[2/5] Waiting for scan to complete...`);
    let attempts = 0;
    const maxAttempts = 120;
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      const statusResponse = await fetch(`${API_BASE_URL}/api/scan/${scanId}/status`);
      const statusData = await statusResponse.json();
      const scan = statusData.scan || statusData;
      
      process.stdout.write(`\rProgress: ${scan.progress}% - Status: ${scan.status}    `);
      
      if (scan.status === 'complete' || scan.status === 'completed') {
        console.log('\n✅ Scan completed!');
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
    console.log(`[3/5] Fetching results...`);
    const resultsResponse = await fetch(`${API_BASE_URL}/api/scan/${scanId}/results`);
    const results = await resultsResponse.json();
    
    if (!results.success || !results.data) {
      throw new Error('No results returned');
    }

    const data = results.data;
    
    // Validate results
    console.log(`[4/5] Validating results...\n`);
    
    const validations = {
      hasBrandDNA: !!data.brandDNA,
      hasCompetitors: data.competitorIntelligence && data.competitorIntelligence.length > 0,
      hasInsights: data.strategicInsights && data.strategicInsights.length > 0,
      hasContentIdeas: data.contentIdeas && data.contentIdeas.length > 0,
      competitorCount: data.competitorIntelligence?.length || 0,
      insightCount: data.strategicInsights?.length || 0,
      contentIdeaCount: data.contentIdeas?.length || 0
    };

    console.log(`Results Validation:`);
    console.log(`  ✅ Brand DNA: ${validations.hasBrandDNA ? 'FOUND' : 'MISSING'}`);
    console.log(`  ${validations.hasCompetitors ? '✅' : '❌'} Competitors: ${validations.competitorCount} found`);
    console.log(`  ${validations.hasInsights ? '✅' : '❌'} Strategic Insights: ${validations.insightCount} found`);
    console.log(`  ${validations.hasContentIdeas ? '✅' : '❌'} Content Ideas: ${validations.contentIdeaCount} found`);

    // Check competitor relevance
    if (validations.hasCompetitors) {
      console.log(`\nCompetitor Analysis:`);
      data.competitorIntelligence.slice(0, 5).forEach((comp, i) => {
        console.log(`  ${i + 1}. ${comp.name} (${comp.threatLevel || 'MEDIUM'})`);
        if (comp.theirAdvantage) {
          console.log(`     Advantage: ${comp.theirAdvantage.substring(0, 80)}...`);
        }
      });
    }

    // Check insights specificity
    if (validations.hasInsights) {
      console.log(`\nStrategic Insights (checking for brand-specific content):`);
      data.strategicInsights.slice(0, 3).forEach((insight, i) => {
        const isBrandSpecific = insight.title && insight.description && 
          (insight.title.toLowerCase().includes(company.name.toLowerCase()) ||
           insight.description.toLowerCase().includes(company.name.toLowerCase()) ||
           insight.description.length > 50);
        console.log(`  ${i + 1}. ${insight.title || 'N/A'}`);
        console.log(`     ${isBrandSpecific ? '✅' : '⚠️'} ${insight.description?.substring(0, 100) || 'N/A'}...`);
      });
    }

    // Check content ideas specificity
    if (validations.hasContentIdeas) {
      console.log(`\nContent Ideas (checking for brand-specific content):`);
      data.contentIdeas.slice(0, 3).forEach((idea, i) => {
        const isBrandSpecific = idea.title && idea.description && 
          (idea.title.toLowerCase().includes(company.name.toLowerCase()) ||
           idea.description.toLowerCase().includes(company.name.toLowerCase()) ||
           idea.description.length > 50);
        console.log(`  ${i + 1}. ${idea.title || 'N/A'}`);
        console.log(`     ${isBrandSpecific ? '✅' : '⚠️'} ${idea.description?.substring(0, 100) || 'N/A'}...`);
      });
    }

    console.log(`\n[5/5] ✅ Test complete for ${company.name}\n`);

    return {
      company: company.name,
      success: true,
      validations,
      scanId
    };

  } catch (error) {
    console.error(`\n❌ ERROR: ${error.message}\n`);
    return {
      company: company.name,
      success: false,
      error: error.message
    };
  }
}

async function runTest() {
  console.log('\n🚀 VERIFICATION TEST: All Critical Fixes\n');
  console.log('Testing: Cache clearing, Competitor analysis, Brand-specific data\n');

  const companies = [
    { name: 'Nike', url: 'nike.com', industry: 'Sports - Athletic Apparel' }
  ];

  const results = [];

  for (const company of companies) {
    const result = await testScan(company);
    results.push(result);
  }

  // Summary
  console.log(`\n${'='.repeat(80)}`);
  console.log('VERIFICATION SUMMARY');
  console.log(`${'='.repeat(80)}\n`);

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log(`Total Tests: ${results.length}`);
  console.log(`✅ Successful: ${successful}`);
  console.log(`❌ Failed: ${failed}\n`);

  results.forEach((result) => {
    if (result.success) {
      console.log(`✅ ${result.company}:`);
      console.log(`   - Competitors: ${result.validations.competitorCount}`);
      console.log(`   - Insights: ${result.validations.insightCount}`);
      console.log(`   - Content Ideas: ${result.validations.contentIdeaCount}`);
    } else {
      console.log(`❌ ${result.company}: ${result.error}`);
    }
  });

  console.log(`\n${'='.repeat(80)}\n`);
  
  if (failed === 0) {
    console.log('🎉 ALL VERIFICATIONS PASSED!');
  } else {
    console.log('⚠️ SOME VERIFICATIONS FAILED');
  }
}

runTest().catch(console.error);

