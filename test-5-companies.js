/**
 * System Test: 5 Diverse Companies
 * Tests cache clearing, competitor analysis, and brand-specific insights
 * 
 * Companies:
 * 1. Tech: Tesla (tesla.com)
 * 2. Construction: Caterpillar (cat.com)
 * 3. Marketing: HubSpot (hubspot.com)
 * 4. Sports: Nike (nike.com)
 * 5. Fashion: Zara (zara.com)
 */

const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:3001';

const companies = [
  { name: 'Tesla', url: 'tesla.com', industry: 'Tech - Electric Vehicles' },
  { name: 'Caterpillar', url: 'cat.com', industry: 'Construction - Heavy Machinery' },
  { name: 'HubSpot', url: 'hubspot.com', industry: 'Marketing - CRM Software' },
  { name: 'Nike', url: 'nike.com', industry: 'Sports - Athletic Apparel' },
  { name: 'Zara', url: 'zara.com', industry: 'Fashion - Fast Fashion Retail' }
];

async function testCompany(company, index) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`TEST ${index + 1}/5: ${company.name} (${company.url})`);
  console.log(`Industry: ${company.industry}`);
  console.log(`${'='.repeat(80)}\n`);

  try {
    // Step 1: Start scan
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
      throw new Error(`Failed to start scan: ${scanResponse.status} ${scanResponse.statusText}`);
    }

    const { scanId } = await scanResponse.json();
    console.log(`[${company.name}] Scan started: ${scanId}`);

    // Step 2: Poll for completion
    console.log(`[${company.name}] Polling for results...`);
    let attempts = 0;
    const maxAttempts = 120; // 10 minutes max
    let results = null;

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds

      const statusResponse = await fetch(`${API_BASE_URL}/api/scan/${scanId}/status`);
      if (!statusResponse.ok) {
        throw new Error(`Failed to get status: ${statusResponse.status}`);
      }

      const statusData = await statusResponse.json();
      const scan = statusData.scan || statusData;
      console.log(`[${company.name}] Progress: ${scan.progress}% - Status: ${scan.status}`);

      if (scan.status === 'complete' || scan.status === 'completed') {
        // Get results from the scan object or fetch separately
        if (scan.results) {
          results = scan.results;
        } else {
          // Try to get results from results endpoint
          const resultsResponse = await fetch(`${API_BASE_URL}/api/scan/${scanId}/results`);
          if (resultsResponse.ok) {
            const resultsData = await resultsResponse.json();
            results = resultsData.data || resultsData;
          } else {
            results = scan.results || null;
          }
        }
        break;
      } else if (scan.status === 'error') {
        throw new Error(`Scan failed: ${scan.error || 'Unknown error'}`);
      }

      attempts++;
    }

    if (!results) {
      throw new Error('Scan timed out');
    }

    // Step 3: Validate results
    console.log(`\n[${company.name}] ✅ Scan completed! Validating results...\n`);

    const validations = {
      hasBrandDNA: !!results.brandDNA,
      hasCompetitors: results.competitorIntelligence && results.competitorIntelligence.length > 0,
      hasInsights: results.strategicInsights && results.strategicInsights.length > 0,
      hasContentIdeas: results.contentIdeas && results.contentIdeas.length > 0,
      competitorCount: results.competitorIntelligence?.length || 0,
      insightCount: results.strategicInsights?.length || 0,
      contentIdeaCount: results.contentIdeas?.length || 0
    };

    console.log(`[${company.name}] Validation Results:`);
    console.log(`  - Brand DNA: ${validations.hasBrandDNA ? '✅' : '❌'}`);
    console.log(`  - Competitors: ${validations.hasCompetitors ? '✅' : '❌'} (${validations.competitorCount} found)`);
    console.log(`  - Strategic Insights: ${validations.hasInsights ? '✅' : '❌'} (${validations.insightCount} found)`);
    console.log(`  - Content Ideas: ${validations.hasContentIdeas ? '✅' : '❌'} (${validations.contentIdeaCount} found)`);

    // Step 4: Check competitor relevance
    if (validations.hasCompetitors) {
      console.log(`\n[${company.name}] Competitor Analysis:`);
      results.competitorIntelligence.slice(0, 3).forEach((comp, i) => {
        console.log(`  ${i + 1}. ${comp.name} (${comp.threatLevel || 'MEDIUM'})`);
        console.log(`     Advantage: ${comp.theirAdvantage || 'N/A'}`);
      });
    }

    // Step 5: Check insights specificity
    if (validations.hasInsights) {
      console.log(`\n[${company.name}] Strategic Insights:`);
      results.strategicInsights.slice(0, 2).forEach((insight, i) => {
        console.log(`  ${i + 1}. ${insight.title || 'N/A'}`);
        console.log(`     ${insight.description?.substring(0, 100) || 'N/A'}...`);
      });
    }

    return {
      company: company.name,
      url: company.url,
      success: true,
      validations,
      scanId
    };

  } catch (error) {
    console.error(`\n[${company.name}] ❌ ERROR:`, error.message);
    return {
      company: company.name,
      url: company.url,
      success: false,
      error: error.message
    };
  }
}

async function runTests() {
  console.log('\n🚀 Starting System Test: 5 Diverse Companies');
  console.log('Testing: Cache clearing, Competitor analysis, Brand-specific insights\n');

  const results = [];

  for (let i = 0; i < companies.length; i++) {
    const result = await testCompany(companies[i], i);
    results.push(result);

    // Wait between tests to avoid rate limiting
    if (i < companies.length - 1) {
      console.log(`\n⏳ Waiting 10 seconds before next test...\n`);
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  }

  // Summary
  console.log(`\n${'='.repeat(80)}`);
  console.log('TEST SUMMARY');
  console.log(`${'='.repeat(80)}\n`);

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log(`Total Tests: ${results.length}`);
  console.log(`✅ Successful: ${successful}`);
  console.log(`❌ Failed: ${failed}\n`);

  results.forEach((result, i) => {
    if (result.success) {
      console.log(`${i + 1}. ${result.company} (${result.url}): ✅`);
      console.log(`   - Competitors: ${result.validations.competitorCount}`);
      console.log(`   - Insights: ${result.validations.insightCount}`);
      console.log(`   - Content Ideas: ${result.validations.contentIdeaCount}`);
    } else {
      console.log(`${i + 1}. ${result.company} (${result.url}): ❌ ${result.error}`);
    }
  });

  console.log(`\n${'='.repeat(80)}\n`);
}

// Run tests
runTests().catch(console.error);

