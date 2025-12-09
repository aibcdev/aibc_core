// Copy and paste this entire script into the browser console
// It will check what data exists and why competitors aren't showing

console.log('=== DASHBOARD DATA DIAGNOSTIC ===\n');

// Check 1: localStorage
console.log('1. CHECKING LOCALSTORAGE:');
const cached = localStorage.getItem('lastScanResults');
if (cached) {
  try {
    const data = JSON.parse(cached);
    console.log('✅ Cache exists');
    console.log('   Keys:', Object.keys(data));
    console.log('   Strategic Insights:', data.strategicInsights?.length || 0);
    console.log('   Brand DNA:', !!data.brandDNA);
    console.log('   Competitor Intelligence:', data.competitorIntelligence?.length || 0);
    console.log('   Market Share:', !!data.marketShare);
    
    if (data.competitorIntelligence && data.competitorIntelligence.length > 0) {
      console.log('   ✅ Competitors exist in cache:', data.competitorIntelligence);
    } else {
      console.log('   ❌ No competitors in cache');
    }
  } catch (e) {
    console.error('   ❌ Error parsing cache:', e);
  }
} else {
  console.log('❌ No cache found');
}

// Check 2: Username
console.log('\n2. CHECKING USERNAME:');
const username = localStorage.getItem('lastScannedUsername');
console.log('   Username:', username || 'NOT FOUND');

// Check 3: API Response
console.log('\n3. CHECKING API:');
if (username) {
  fetch(`http://localhost:3001/api/scan/user/${encodeURIComponent(username)}/latest`)
    .then(r => r.json())
    .then(d => {
      console.log('   API Success:', d.success);
      console.log('   API Has Data:', !!d.data);
      if (d.data) {
        console.log('   API Data Keys:', Object.keys(d.data));
        console.log('   API Competitors:', d.data.competitorIntelligence?.length || 0);
        if (d.data.competitorIntelligence && d.data.competitorIntelligence.length > 0) {
          console.log('   ✅ API returned competitors:', d.data.competitorIntelligence);
        } else {
          console.log('   ❌ API returned no competitors');
        }
      } else {
        console.log('   ⚠️ API returned null (no completed scans)');
      }
    })
    .catch(err => {
      console.error('   ❌ API Error:', err);
      console.log('   Is backend running on port 3001?');
    });
} else {
  console.log('   ⚠️ No username - cannot check API');
}

// Check 4: React State (if we can access it)
console.log('\n4. CHECKING REACT STATE:');
console.log('   (Look for "=== DASHBOARD DATA STATE ===" in console logs above)');
console.log('   (This shows what React component state has)');

console.log('\n=== DIAGNOSTIC COMPLETE ===');
console.log('\nWhat to look for:');
console.log('- If cache has competitors but UI shows none → State update bug');
console.log('- If API returns null → No scan completed yet');
console.log('- If API returns no competitors → Scan didn\'t generate competitors');
console.log('- If cache has no competitors → Data wasn\'t saved');

