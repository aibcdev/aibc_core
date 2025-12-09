/**
 * Debug script to check dashboard data flow
 * Run this in browser console after a scan completes
 */

console.log('=== DASHBOARD DATA DEBUG ===');

// Check localStorage
const cached = localStorage.getItem('lastScanResults');
if (cached) {
  try {
    const data = JSON.parse(cached);
    console.log('✅ localStorage has scan results');
    console.log('Data structure:', Object.keys(data));
    console.log('\n--- Strategic Insights ---');
    console.log('Has insights:', !!data.strategicInsights);
    console.log('Insights count:', data.strategicInsights?.length || 0);
    console.log('Insights data:', data.strategicInsights);
    
    console.log('\n--- Brand DNA ---');
    console.log('Has brandDNA:', !!data.brandDNA);
    console.log('Brand DNA keys:', data.brandDNA ? Object.keys(data.brandDNA) : []);
    console.log('Brand DNA data:', data.brandDNA);
    
    console.log('\n--- Competitor Intelligence ---');
    console.log('Has competitors:', !!data.competitorIntelligence);
    console.log('Competitors count:', data.competitorIntelligence?.length || 0);
    console.log('Competitors data:', data.competitorIntelligence);
    
    console.log('\n--- Market Share ---');
    console.log('Has marketShare:', !!data.marketShare);
    console.log('Market Share data:', data.marketShare);
    
    console.log('\n--- Extracted Content ---');
    console.log('Has extractedContent:', !!data.extractedContent);
    console.log('Content themes:', data.extractedContent?.content_themes?.length || 0);
    console.log('Posts count:', data.extractedContent?.posts?.length || 0);
    
  } catch (e) {
    console.error('❌ Error parsing cache:', e);
  }
} else {
  console.log('❌ No cached scan results in localStorage');
}

// Check username
const username = localStorage.getItem('lastScannedUsername');
console.log('\n--- Username ---');
console.log('Scanned username:', username);

// Test API endpoint
if (username) {
  console.log('\n--- Testing API ---');
  const API_BASE_URL = import.meta.env?.VITE_API_URL || 'http://localhost:3001';
  fetch(`${API_BASE_URL}/api/scan/user/${encodeURIComponent(username)}/latest`)
    .then(res => res.json())
    .then(data => {
      console.log('API Response:', data);
      if (data.success && data.data) {
        console.log('✅ API returned data');
        console.log('API data keys:', Object.keys(data.data));
        console.log('API insights:', data.data.strategicInsights?.length || 0);
        console.log('API brandDNA:', !!data.data.brandDNA);
        console.log('API competitors:', data.data.competitorIntelligence?.length || 0);
      } else {
        console.log('❌ API returned no data or error');
      }
    })
    .catch(err => {
      console.error('❌ API Error:', err);
    });
}

