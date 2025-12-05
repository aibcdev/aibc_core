# Testing Footprint Data Flow

## Quick Test Steps:

1. **Check Browser Console:**
   - Open DevTools (F12)
   - Go to Console tab
   - Look for logs:
     - "Loading cached scan results:"
     - "API scan results:"
     - "Dashboard state updated:"

2. **Check localStorage:**
   - In Console, type: `localStorage.getItem('lastScanResults')`
   - Should return JSON string with scan data
   - Type: `localStorage.getItem('lastScannedUsername')`
   - Should return the username

3. **Check API:**
   - In Console, type: `fetch('http://localhost:3001/api/scan/user/joelbeya/latest').then(r => r.json()).then(console.log)`
   - Should return scan results

4. **Manual Refresh:**
   - Click "Refresh Data" button in dashboard header
   - Check console for logs

## Expected Data Structure:
```json
{
  "strategicInsights": [...],
  "brandDNA": {
    "archetype": "...",
    "voice": {...},
    "corePillars": [...]
  },
  "competitorIntelligence": [...]
}
```

## If Data Not Showing:
1. Check if scan completed (look at AuditView logs)
2. Check if data is in localStorage
3. Check browser console for errors
4. Try clicking "Refresh Data" button
5. Check network tab for API calls

