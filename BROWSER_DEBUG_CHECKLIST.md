# Browser Console Debug Checklist

## Step 1: Open Browser Console

1. **Open Developer Tools**:
   - Chrome/Edge: Press `F12` or `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows)
   - Firefox: Press `F12` or `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows)
   - Safari: Press `Cmd+Option+I` (Mac)

2. **Go to Console Tab** (should be default)

## Step 2: Navigate to Dashboard

1. Log in to your account
2. Navigate to the Dashboard page
3. Wait for the page to fully load

## Step 3: What to Look For in Console

### ✅ GOOD Signs (Data is Loading):

Look for these log messages in order:

1. **`=== LOADING FROM CACHE ===`**
   - Should show: `Cached data keys: [...]`
   - Should show: `Strategic insights: X` (where X > 0 if data exists)
   - Should show: `Brand DNA: true` (if data exists)
   - Should show: `Competitor intelligence: X` (where X > 0 if data exists)

2. **`Setting strategic insights: X`**
   - X should be > 0 if you have insights

3. **`Setting brand DNA`**
   - Should appear if brand DNA exists

4. **`Setting competitors: X`**
   - X should be > 0 if you have competitors

5. **`=== DASHBOARD DATA STATE ===`**
   - Should show current state with actual numbers

6. **`Analytics updated from cache:`**
   - Should show analytics object with real values

### ❌ BAD Signs (Problems Found):

Look for these error/warning messages:

1. **`⚠️ API returned null - no completed scans found`**
   - Means: No scan has completed yet
   - Action: Run a scan first

2. **`❌ API returned error:`**
   - Means: API call failed
   - Action: Check backend is running

3. **`⚠️ DATA MISMATCH: localStorage has insights but state is empty!`**
   - Means: Data exists in cache but React state didn't update
   - Action: This is a bug - screenshot this!

4. **`No strategic insights in cache`**
   - Means: No insights saved
   - Action: Run a scan

5. **`No competitor intelligence in cache`**
   - Means: No competitors saved
   - Action: Run a scan

6. **`Error parsing cached results:`**
   - Means: localStorage data is corrupted
   - Action: Clear localStorage and run scan again

## Step 4: What to Screenshot

### Screenshot 1: Console Logs (Full View)
- **What**: Entire console output from when dashboard loads
- **How**: Scroll to top of console, take full-page screenshot
- **Look for**: All the log messages mentioned above

### Screenshot 2: Console Errors (If Any)
- **What**: Any red error messages
- **How**: Screenshot just the error section
- **Look for**: Red text with error messages

### Screenshot 3: Dashboard UI
- **What**: The actual dashboard page
- **How**: Full page screenshot of dashboard
- **Look for**: 
  - Are sections showing "No data" messages?
  - Are sections completely blank?
  - Are there any cards/items showing?

### Screenshot 4: Network Tab (If Needed)
- **What**: Network requests when dashboard loads
- **How**: 
  1. Go to Network tab in DevTools
  2. Refresh dashboard page
  3. Look for API calls to `/api/scan/user/.../latest`
  4. Click on that request
  5. Screenshot the Response tab
- **Look for**: What the API actually returned

## Step 5: Check localStorage (Optional)

In the console, type this and press Enter:

```javascript
const cached = localStorage.getItem('lastScanResults');
if (cached) {
  const data = JSON.parse(cached);
  console.log('Keys:', Object.keys(data));
  console.log('Insights:', data.strategicInsights?.length || 0);
  console.log('Brand DNA:', !!data.brandDNA);
  console.log('Competitors:', data.competitorIntelligence?.length || 0);
  console.log('Full data:', data);
} else {
  console.log('No cached data');
}
```

**Screenshot the output** of this command.

## Step 6: Check API Response (Optional)

In the console, type this (replace `YOUR_USERNAME` with your actual username):

```javascript
const username = localStorage.getItem('lastScannedUsername') || 'YOUR_USERNAME';
fetch(`http://localhost:3001/api/scan/user/${username}/latest`)
  .then(r => r.json())
  .then(d => {
    console.log('API Response:', d);
    console.log('Has data?', !!d.data);
    console.log('Data keys:', d.data ? Object.keys(d.data) : 'null');
  });
```

**Screenshot the output** of this command.

## Quick Reference: What Each Log Means

| Log Message | What It Means | Is It Good? |
|------------|---------------|-------------|
| `=== LOADING FROM CACHE ===` | Dashboard is trying to load cached data | ✅ Good - loading process started |
| `Strategic insights: 3` | Found 3 insights in cache | ✅ Good - data exists |
| `Strategic insights: 0` | No insights in cache | ❌ Bad - no data |
| `Setting strategic insights: 3` | React state is being updated with 3 insights | ✅ Good - state updating |
| `⚠️ API returned null` | No completed scans found | ⚠️ Need to run scan |
| `❌ API returned error` | API call failed | ❌ Bad - backend issue |
| `⚠️ DATA MISMATCH` | Cache has data but state doesn't | ❌ Bad - bug found! |
| `=== DASHBOARD DATA STATE ===` | Shows current React state | ✅ Good - check the numbers |

## What to Send Me

Please send me:

1. **Screenshot of console logs** (full scrollable view)
2. **Screenshot of dashboard UI** (what you actually see)
3. **Any error messages** (red text in console)
4. **Output of localStorage check** (if you ran it)
5. **Output of API check** (if you ran it)

This will help me see exactly what's happening!

