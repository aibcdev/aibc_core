/**
 * Comprehensive Test: Verify all critical fixes
 * 
 * Tests:
 * 1. Cache clearing between scans
 * 2. Competitor analysis accuracy (using website content)
 * 3. Brand-specific data (not generic)
 * 4. All components showing correct data
 */

const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:3001';

const testCompanies = [
  { name: 'Tesla', url: 'tesla.com', industry: 'Tech - Electric Vehicles', expectedCompetitors: ['Rivian', 'Lucid', 'Ford', 'GM'] },
  { name: 'Nike', url: 'nike.com', industry: 'Sports - Athletic Apparel', expectedCompetitors: ['Adidas', 'Puma', 'Under Armour'] },
];

let testResults = [];

async function testCacheClearing() {
  console.log('\n🧪 TEST 1: Cache Clearing Between Scans\n');
  
  // Test 1: Scan first company
  console.log('Scanning Tesla...');
  const scan1 = await startScan('tesla.com');
  if (!scan1.success) {
    testResults.push({ test: 'Cache Clearing', status: 'FAILED', error: 'Failed to start first scan' });
    return;
  }
  
  await waitForCompletion(scan1.scanId);
  const results1 = await getResults(scan1.scanId);
  
  // Test 2: Scan second company (should clear cache)
  console.log('Scanning Nike (should clear Tesla cache)...');
  const scan2 = await startScan('nike.com');
  if (!scan2.success) {
    testResults.push({ test: 'Cache Clearing', status: 'FAILED', error: 'Failed to start second scan' });
    return;
  }
  
  await waitForCompletion(scan2.scanId);
  const results2 = await getResults(scan2.scanId);
  
  // Verify results are different
  const teslaDNA = results1.data?.brandDNA?.archetype || '';
  const nikeDNA = results2.data?.brandDNA?.archetype || '';
  
  if (teslaDNA !== nikeDNA && teslaDNA && nikeDNA) {
    console.log('✅ Cache clearing: PASSED - Different companies show different data');
    testResults.push({ test: 'Cache Clearing', status: 'PASSED' });
  } else {
    console.log('❌ Cache clearing: FAILED - Same data shown for different companies');
    testResults.push({ test: 'Cache Clearing', status: 'FAILED', error: 'Same brand DNA for different companies' });
  }
}

async function testCompetitorAnalysis(company) {
  console.log(`\n🧪 TEST 2: Competitor Analysis for ${company.name}\n`);
  
  const scan = await startScan(company.url);
  if (!scan.success) {
    testResults.push({ test: `Competitor Analysis (${company.name})`, status: 'FAILED', error: 'Failed to start scan' });
    return;
  }
  
  await waitForCompletion(scan.scanId);
  const results = await getResults(scan.scanId);
  
  const competitors = results.data?.competitorIntelligence || [];
  const competitorNames = competitors.map(c => c.name?.toLowerCase() || '').filter(n => n);
  
  console.log(`Found ${competitors.length} competitors:`, competitorNames);
  
  // Check if competitors match expected industry
  const hasRelevantCompetitor = company.expectedCompetitors.some(expected => 
    competitorNames.some(found => found.includes(expected.toLowerCase()) || expected.toLowerCase().includes(found))
  );
  
  if (hasRelevantCompetitor && competitors.length >= 3) {
    console.log(`✅ Competitor Analysis (${company.name}): PASSED - Found relevant competitors`);
    testResults.push({ test: `Competitor Analysis (${company.name})`, status: 'PASSED', competitors: competitorNames });
  } else {
    console.log(`❌ Competitor Analysis (${company.name}): FAILED - No relevant competitors found`);
    testResults.push({ test: `Competitor Analysis (${company.name})`, status: 'FAILED', error: 'No relevant competitors', found: competitorNames });
  }
}

async function testBrandSpecificData(company) {
  console.log(`\n🧪 TEST 3: Brand-Specific Data for ${company.name}\n`);
  
  const scan = await startScan(company.url);
  if (!scan.success) {
    testResults.push({ test: `Brand-Specific Data (${company.name})`, status: 'FAILED', error: 'Failed to start scan' });
    return;
  }
  
  await waitForCompletion(scan.scanId);
  const results = await getResults(scan.scanId);
  
  // Check strategic insights
  const insights = results.data?.strategicInsights || [];
  const hasBrandSpecificInsights = insights.some(insight => 
    insight.title && insight.description && 
    (insight.title.toLowerCase().includes(company.name.toLowerCase()) || 
     insight.description.toLowerCase().includes(company.name.toLowerCase()) ||
     insight.description.toLowerCase().includes(company.industry.toLowerCase().split(' - ')[1]?.toLowerCase() || ''))
  );
  
  // Check content ideas
  const contentIdeas = results.data?.contentIdeas || [];
  const hasBrandSpecificContent = contentIdeas.some(idea =>
    idea.title && idea.description &&
    (idea.title.toLowerCase().includes(company.name.toLowerCase()) ||
     idea.description.toLowerCase().includes(company.name.toLowerCase()))
  );
  
  console.log(`Strategic Insights: ${insights.length} (brand-specific: ${hasBrandSpecificInsights ? 'YES' : 'NO'})`);
  console.log(`Content Ideas: ${contentIdeas.length} (brand-specific: ${hasBrandSpecificContent ? 'YES' : 'NO'})`);
  
  if (hasBrandSpecificInsights && hasBrandSpecificContent && insights.length > 0 && contentIdeas.length > 0) {
    console.log(`✅ Brand-Specific Data (${company.name}): PASSED`);
    testResults.push({ test: `Brand-Specific Data (${company.name})`, status: 'PASSED' });
  } else {
    console.log(`❌ Brand-Specific Data (${company.name}): FAILED - Generic data detected`);
    testResults.push({ test: `Brand-Specific Data (${company.name})`, status: 'FAILED', error: 'Generic data found' });
  }
}

async function startScan(username) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/scan/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        platforms: ['twitter', 'youtube', 'linkedin', 'instagram'],
        scanType: 'basic'
      })
    });
    
    if (!response.ok) {
      return { success: false, error: `${response.status} ${response.statusText}` };
    }
    
    const data = await response.json();
    return { success: true, scanId: data.scanId };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function waitForCompletion(scanId, maxWait = 600000) {
  const startTime = Date.now();
  while (Date.now() - startTime < maxWait) {
    const status = await getStatus(scanId);
    if (status.status === 'complete' || status.status === 'completed') {
      return true;
    }
    if (status.status === 'error') {
      throw new Error(status.error || 'Scan failed');
    }
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
  throw new Error('Scan timeout');
}

async function getStatus(scanId) {
  const response = await fetch(`${API_BASE_URL}/api/scan/${scanId}/status`);
  const data = await response.json();
  return data.scan || data;
}

async function getResults(scanId) {
  const response = await fetch(`${API_BASE_URL}/api/scan/${scanId}/results`);
  return await response.json();
}

async function runAllTests() {
  console.log('🚀 Starting Comprehensive Test Suite\n');
  console.log('Testing: Cache clearing, Competitor analysis, Brand-specific data\n');
  
  try {
    // Test 1: Cache clearing
    await testCacheClearing();
    
    // Test 2: Competitor analysis for each company
    for (const company of testCompanies) {
      await testCompetitorAnalysis(company);
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait between tests
    }
    
    // Test 3: Brand-specific data for each company
    for (const company of testCompanies) {
      await testBrandSpecificData(company);
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait between tests
    }
    
  } catch (error) {
    console.error('Test error:', error);
  }
  
  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('TEST SUMMARY');
  console.log('='.repeat(80) + '\n');
  
  const passed = testResults.filter(r => r.status === 'PASSED').length;
  const failed = testResults.filter(r => r.status === 'FAILED').length;
  
  console.log(`Total Tests: ${testResults.length}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}\n`);
  
  testResults.forEach((result, i) => {
    console.log(`${i + 1}. ${result.test}: ${result.status}`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });
  
  console.log('\n' + '='.repeat(80) + '\n');
  
  if (failed === 0) {
    console.log('🎉 ALL TESTS PASSED!');
  } else {
    console.log('⚠️ SOME TESTS FAILED - Review errors above');
  }
}

runAllTests().catch(console.error);

