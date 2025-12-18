/**
 * Diagnostic script to check why dashboard shows no data
 * Run this in browser console on the dashboard page
 */

console.log('=== DASHBOARD DATA DIAGNOSTIC ===\n');

// Check localStorage
console.log('1. LOCALSTORAGE CHECK:');
const lastScanResults = localStorage.getItem('lastScanResults');
const lastScannedUsername = localStorage.getItem('lastScannedUsername');
const lastScanId = localStorage.getItem('lastScanId');
const lastScanTimestamp = localStorage.getItem('lastScanTimestamp');

console.log('  - lastScannedUsername:', lastScannedUsername);
console.log('  - lastScanId:', lastScanId);
console.log('  - lastScanTimestamp:', lastScanTimestamp ? new Date(parseInt(lastScanTimestamp)).toISOString() : 'null');
console.log('  - lastScanResults:', lastScanResults ? 'EXISTS' : 'MISSING');

if (lastScanResults) {
  try {
    const parsed = JSON.parse(lastScanResults);
    console.log('  - Parsed data keys:', Object.keys(parsed));
    console.log('  - Has brandDNA:', !!parsed.brandDNA);
    console.log('  - Has strategicInsights:', !!parsed.strategicInsights, 'Count:', parsed.strategicInsights?.length || 0);
    console.log('  - Has competitorIntelligence:', !!parsed.competitorIntelligence, 'Count:', parsed.competitorIntelligence?.length || 0);
    console.log('  - Has extractedContent:', !!parsed.extractedContent);
    console.log('  - Has marketShare:', !!parsed.marketShare);
    console.log('  - scanUsername in cache:', parsed.scanUsername || parsed.username);
    console.log('  - Username match:', (parsed.scanUsername || parsed.username) === lastScannedUsername);
    
    if (parsed.brandDNA) {
      console.log('  - Brand DNA keys:', Object.keys(parsed.brandDNA));
    }
    if (parsed.extractedContent) {
      console.log('  - Extracted content posts:', parsed.extractedContent.posts?.length || 0);
      console.log('  - Content themes:', parsed.extractedContent.content_themes?.length || 0);
    }
  } catch (e) {
    console.error('  - ERROR parsing lastScanResults:', e);
  }
}

// Check API
console.log('\n2. API CHECK:');
if (lastScannedUsername) {
  const API_URL = window.location.hostname.includes('localhost') 
    ? 'http://localhost:3001' 
    : 'https://aibc-backend-409115133182.us-central1.run.app';
  
  fetch(`${API_URL}/api/scan/user/${encodeURIComponent(lastScannedUsername)}/latest`)
    .then(res => res.json())
    .then(data => {
      console.log('  - API Response:', data);
      console.log('  - API success:', data.success);
      console.log('  - API has data:', !!data.data);
      if (data.data) {
        console.log('  - API data keys:', Object.keys(data.data));
        console.log('  - API brandDNA:', !!data.data.brandDNA);
        console.log('  - API strategicInsights:', !!data.data.strategicInsights, 'Count:', data.data.strategicInsights?.length || 0);
        console.log('  - API competitorIntelligence:', !!data.data.competitorIntelligence, 'Count:', data.data.competitorIntelligence?.length || 0);
        console.log('  - API scanUsername:', data.data.scanUsername || data.data.username);
      } else {
        console.log('  - ⚠️ API returned null data - no completed scans found in backend');
        console.log('  - This means the backend lost scan data (server restart) or scan never completed');
      }
    })
    .catch(err => {
      console.error('  - API Error:', err);
    });
} else {
  console.log('  - No username found - cannot check API');
}

// Check React state (if accessible)
console.log('\n3. REACT STATE CHECK:');
console.log('  - Check browser React DevTools to see DashboardView component state');
console.log('  - Look for: strategicInsights, brandDNA, competitorIntelligence, scanUsername');

// Recommendations
console.log('\n4. RECOMMENDATIONS:');
if (!lastScanResults && !lastScannedUsername) {
  console.log('  ❌ No scan data found - need to run a scan first');
} else if (lastScanResults && !lastScannedUsername) {
  console.log('  ⚠️ Has scan results but no username - data may be invalid');
} else if (lastScannedUsername && !lastScanResults) {
  console.log('  ⚠️ Has username but no scan results - scan may not have completed');
  console.log('  → Try refreshing the page or running a new scan');
} else {
  console.log('  ✅ localStorage has data');
  console.log('  → If dashboard still shows empty, check:');
  console.log('    1. Browser console for errors');
  console.log('    2. React DevTools for component state');
  console.log('    3. Network tab for API responses');
}

console.log('\n=== END DIAGNOSTIC ===');
