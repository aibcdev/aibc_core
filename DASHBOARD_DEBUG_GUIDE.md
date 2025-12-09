# Dashboard Data Debug Guide

## Changes Made

### 1. ✅ Replaced Hardcoded Metrics with Real Data
- **Before**: Hardcoded values (4.2h, 248, 85.4, 99.9%)
- **After**: Real data from scan results:
  - **CONTENT CREATED**: Calculated from scan themes/pillars
  - **PUBLISHED**: From analytics (0 until content is published)
  - **SCHEDULED**: From analytics (0 until content is scheduled)
  - **BRAND VOICE MATCH**: From scan extraction confidence

### 2. ✅ Enhanced Data Loading with Comprehensive Logging
- Added detailed console logs at every step:
  - When loading from cache
  - When loading from API
  - When setting state
  - When data mismatches occur

### 3. ✅ Fixed Data Persistence
- Manual competitors now save to localStorage
- Manual competitors merge with scan competitors
- Analytics recalculates when scan data loads

### 4. ✅ Added Data Validation
- Checks if data exists but state is empty
- Validates array structures
- Handles null/undefined gracefully

## How to Debug

### Step 1: Check Browser Console
Open browser console (F12) and look for:

1. **`=== DASHBOARD DATA STATE ===`**
   - Shows current React state
   - Check if data exists in state

2. **`=== LOADING FROM CACHE ===`**
   - Shows what's in localStorage
   - Check if data exists in cache

3. **`=== API SCAN RESULTS ===`**
   - Shows what API returns
   - Check if API has data

4. **`⚠️ DATA MISMATCH`** warnings
   - Indicates data exists but isn't in state
   - This means there's a loading issue

### Step 2: Check localStorage Directly
Run in browser console:
```javascript
const cached = localStorage.getItem('lastScanResults');
if (cached) {
  const data = JSON.parse(cached);
  console.log('Keys:', Object.keys(data));
  console.log('Insights:', data.strategicInsights?.length);
  console.log('Brand DNA:', !!data.brandDNA);
  console.log('Competitors:', data.competitorIntelligence?.length);
}
```

### Step 3: Check API Response
Run in browser console:
```javascript
const username = localStorage.getItem('lastScannedUsername');
const API_BASE_URL = import.meta.env?.VITE_API_URL || 'http://localhost:3001';
fetch(`${API_BASE_URL}/api/scan/user/${username}/latest`)
  .then(r => r.json())
  .then(d => console.log('API Response:', d));
```

### Step 4: Verify Scan Completed
Check backend logs for:
- `[SUCCESS] Strategic insights generated: X insights`
- `[SUCCESS] Competitor intelligence analyzed - X competitors identified`
- `[SUCCESS] Brand DNA extracted successfully`

## Common Issues & Solutions

### Issue 1: Data exists in localStorage but not showing
**Symptoms**: Console shows data in cache but sections are blank
**Solution**: Check for `⚠️ DATA MISMATCH` warnings - state isn't being set

### Issue 2: API returns null/empty
**Symptoms**: `scanResults.data` is null or empty
**Solution**: 
- Check if scan actually completed
- Check backend logs for errors
- Verify scan status is 'complete'

### Issue 3: Strategic Insights not showing
**Symptoms**: Insights exist but section shows "No insights available"
**Solution**:
- Check if `strategicInsights` is an array
- Check if insights have `title` property
- Look for console warnings about invalid insights

### Issue 4: Competitors not showing
**Symptoms**: Competitors exist but section shows "No competitors identified"
**Solution**:
- Check if `competitorIntelligence` is an array
- Check console for merge logic errors
- Verify competitors have required fields (name, threatLevel)

## Expected Data Structure

### Strategic Insights
```javascript
[
  {
    title: "Make longer videos",
    description: "Your videos are 4 mins avg...",
    impact: "HIGH IMPACT",
    effort: "Takes time"
  }
]
```

### Brand DNA
```javascript
{
  archetype: "The Architect",
  voice: {
    tones: ["Systematic", "Transparent", "Dense"]
  },
  corePillars: ["Automated Content Scale", ...]
}
```

### Competitor Intelligence
```javascript
[
  {
    name: "Nike",
    threatLevel: "MEDIUM",
    primaryVector: "Twitter / X (Low (Corporate pacing))",
    theirAdvantage: "Dominates market cap...",
    yourOpportunity: "Exploit their weak..."
  }
]
```

## Next Steps

1. **Run a scan** and watch console logs
2. **Check each log section** to see where data is lost
3. **Compare localStorage vs state** to find mismatches
4. **Check backend logs** to verify data generation
5. **Report findings** - which section shows data, which doesn't

