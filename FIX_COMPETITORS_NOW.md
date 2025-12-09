# Fix Competitors - Step by Step

## The Problem
- Strategic Insights: ✅ Showing (2 cards)
- Brand DNA: ✅ Showing  
- Competitors: ❌ NOT showing (empty array in cache)

## Why This Happened
The old scan ran with the **invalid API key**, so it saved `competitorIntelligence: []` (empty array) to cache. Even though we fixed the API key, the **old cached data still has empty competitors**.

## Solution: Clear Cache + Run New Scan

### Step 1: Clear Old Cache
Open browser console (F12) and run:
```javascript
localStorage.removeItem('lastScanResults');
localStorage.removeItem('lastScannedUsername');
console.log('✅ Cache cleared');
```

### Step 2: Run a NEW Scan
1. Go to the scan/audit page
2. Enter a username (e.g., "script.tv" or "lululemon.com")
3. Click "Scan Digital Footprint"
4. **Wait for scan to complete** (this takes a few minutes)

### Step 3: Check Backend Logs
While scan is running, check your backend terminal for:
- `[SUCCESS] Competitor intelligence analyzed - X competitors identified`
- If you see `[ERROR] CRITICAL: No competitors generated` → API key issue
- If you see `[SUCCESS]` with a number > 0 → It's working!

### Step 4: Verify Data After Scan
After scan completes, in browser console run:
```javascript
const cached = localStorage.getItem('lastScanResults');
if (cached) {
  const data = JSON.parse(cached);
  console.log('Competitors:', data.competitorIntelligence?.length || 0);
  if (data.competitorIntelligence && data.competitorIntelligence.length > 0) {
    console.log('✅ Competitors exist!', data.competitorIntelligence);
  } else {
    console.log('❌ Still no competitors - check backend logs');
  }
}
```

## If Competitors Still Don't Show

### Check 1: API Key is Valid
```bash
cd backend
cat .env | grep GEMINI_API_KEY
```
Should show your new key (not the old leaked one).

### Check 2: Backend is Running
```bash
curl http://localhost:3001/api/scan/user/test/latest
```
Should return JSON (not connection error).

### Check 3: Scan Actually Completed
Look for in backend terminal:
- `[SUCCESS] Scan completed`
- `[SUCCESS] Competitor intelligence analyzed - X competitors`

### Check 4: Check Console for Errors
Look for:
- `⚠️ API returned null` → No completed scans
- `❌ API returned error` → Backend issue
- `⚠️ DATA MISMATCH` → State update bug

## Most Likely Issue
You haven't run a **NEW scan** yet. The old cached data has empty competitors. You MUST:
1. Clear cache
2. Run a new scan
3. Wait for it to complete

The new scan will use the valid API key and should generate competitors.

