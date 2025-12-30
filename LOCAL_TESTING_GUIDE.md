# Local Testing Guide - Brand Alignment Fix

## Quick Start

### 1. Start Backend Server

```bash
cd backend

# Install dependencies (if not already done)
npm install

# Install Playwright browsers (if not already done)
npm run install-playwright

# Check environment variables
# Make sure backend/.env has:
# - GEMINI_API_KEY=your_key_here
# - PORT=3001 (default)

# Start backend server
npm run dev
```

Backend will run on: **http://localhost:3001**

### 2. Start Frontend (Optional - for full UI testing)

```bash
# In root directory
npm install

# Check environment variables
# Make sure .env has:
# - VITE_API_URL=http://localhost:3001

# Start frontend
npm run dev
```

Frontend will run on: **http://localhost:5173**

---

## Testing Brand Alignment Fix

### Test Case 1: script.tv (Video Platform)

**Expected:** Should generate video/content platform content, NOT crypto content

1. **Start a scan:**
   ```bash
   curl -X POST http://localhost:3001/api/scan/start \
     -H "Content-Type: application/json" \
     -d '{
       "username": "script.tv",
       "platforms": ["twitter", "youtube", "linkedin"],
       "scanType": "standard"
     }'
   ```

2. **Check the response for scanId:**
   ```json
   {
     "success": true,
     "scanId": "scan_1234567890_abc123",
     "message": "Scan started successfully"
   }
   ```

3. **Monitor scan status:**
   ```bash
   curl http://localhost:3001/api/scan/{scanId}/status
   ```

4. **Check backend logs for brandIdentity usage:**
   Look for these log messages:
   - `[IDENTITY] ✅ Brand identified: script.tv - video platform`
   - `[CONTENT] Using brand identity niche: "..." (from LLM-first layer)`
   - `[VALIDATION] Filtered content idea "..." - references wrong industry or confuses brand name`

5. **Get final results:**
   ```bash
   curl http://localhost:3001/api/scan/{scanId}/results
   ```

6. **Verify content ideas:**
   - Check `contentIdeas` array in results
   - Should NOT contain: "script token", "crypto", "blockchain", "token launch"
   - Should contain: video platform, content creation, streaming related content

### Test Case 2: Check Logs for Brand Identity

**Watch backend console for these log messages:**

```
[IDENTITY] ✅ Brand identified: {name} - {industry}
[IDENTITY] Description: {description}
[IDENTITY] Niche: {niche}
[CONTENT] Using brand identity niche: "{niche}" (from LLM-first layer)
```

**If brandIdentity is NOT available, you'll see:**
```
[CONTENT] Using extracted niche: "{niche}" (fallback - brandIdentity not available)
```

### Test Case 3: Validation Filtering

**Check logs for validation messages:**
- `[VALIDATION] Filtered content idea "..." - references wrong industry or confuses brand name`
- `[VALIDATION] Filtered content idea "..." - too generic, no brand reference`

These indicate the validation is working correctly.

---

## What to Look For

### ✅ Success Indicators

1. **Brand Identity Logged:**
   ```
   [IDENTITY] ✅ Brand identified: script.tv - video platform
   [CONTENT] Using brand identity niche: "video streaming" (from LLM-first layer)
   ```

2. **Content Ideas Match Industry:**
   - Video platform → video/streaming/content creation ideas
   - SaaS tool → software/productivity/tech ideas
   - E-commerce → product/shopping/retail ideas

3. **Wrong Industry Content Filtered:**
   ```
   [VALIDATION] Filtered content idea "Script Token Launch" - references wrong industry or confuses brand name
   ```

4. **Retry Logic Works (if needed):**
   ```
   [WARNING] Only 3 brand-specific content ideas after filtering - retrying with stronger prompt
   [SUCCESS] Retry successful - 8 brand-specific ideas generated
   ```

### ❌ Failure Indicators

1. **No Brand Identity:**
   ```
   [CONTENT] Using extracted niche: "..." (fallback - brandIdentity not available)
   ```
   → Check if `identifyBrandWithLLM` is working

2. **Wrong Industry Content Generated:**
   - Video platform getting crypto content
   - SaaS getting e-commerce content
   → Check validation logic and prompts

3. **Generic Content:**
   - Content ideas don't mention brand name
   - Content could work for any company
   → Check brand reference validation

---

## Debugging

### Check Backend Logs

The backend will output detailed logs. Look for:

1. **Brand Identity Section:**
   ```
   [IDENTITY] ✅ Brand identified: ...
   ```

2. **Content Generation Section:**
   ```
   [CONTENT] Starting content ideas generation...
   [CONTENT] Using brand identity niche: ...
   ```

3. **Validation Section:**
   ```
   [VALIDATION] Filtered content idea ...
   ```

4. **Retry Section (if triggered):**
   ```
   [WARNING] Only X brand-specific content ideas after filtering - retrying...
   ```

### Common Issues

**Issue: Brand Identity not found**
- Check `GEMINI_API_KEY` is set correctly
- Check API quota/limits
- Check network connectivity

**Issue: Content still wrong industry**
- Check logs for `[VALIDATION]` messages
- Verify brandIdentity.industry is correct
- Check if validation keywords need updating

**Issue: Too many ideas filtered**
- Check if validation is too strict
- Verify brandIdentity data is accurate
- Check retry logic is working

---

## Test Script

Save this as `test-brand-alignment.sh`:

```bash
#!/bin/bash

# Test script.tv (video platform - should NOT get crypto content)
echo "Testing script.tv (video platform)..."
SCAN_RESPONSE=$(curl -s -X POST http://localhost:3001/api/scan/start \
  -H "Content-Type: application/json" \
  -d '{
    "username": "script.tv",
    "platforms": ["twitter", "youtube"],
    "scanType": "standard"
  }')

SCAN_ID=$(echo $SCAN_RESPONSE | jq -r '.scanId')
echo "Scan ID: $SCAN_ID"

# Wait for scan to complete (check status every 5 seconds)
echo "Waiting for scan to complete..."
while true; do
  STATUS=$(curl -s http://localhost:3001/api/scan/$SCAN_ID/status | jq -r '.status')
  echo "Status: $STATUS"
  
  if [ "$STATUS" == "completed" ]; then
    break
  elif [ "$STATUS" == "error" ]; then
    echo "Scan failed!"
    exit 1
  fi
  
  sleep 5
done

# Get results
echo "Getting results..."
RESULTS=$(curl -s http://localhost:3001/api/scan/$SCAN_ID/results)

# Check content ideas
echo "Content Ideas:"
echo $RESULTS | jq -r '.data.contentIdeas[] | "\(.title) - \(.description)"'

# Check for wrong industry keywords
echo ""
echo "Checking for wrong industry content..."
WRONG_KEYWORDS=("crypto token" "blockchain" "token launch" "script launch")
for keyword in "${WRONG_KEYWORDS[@]}"; do
  if echo "$RESULTS" | grep -qi "$keyword"; then
    echo "❌ FOUND WRONG INDUSTRY: $keyword"
  fi
done

echo "✅ Test complete!"
```

Make it executable:
```bash
chmod +x test-brand-alignment.sh
./test-brand-alignment.sh
```

---

## Manual Testing via Frontend

1. **Start both backend and frontend**
2. **Open:** http://localhost:5173
3. **Navigate to:** Audit/Scan page
4. **Enter username:** `script.tv`
5. **Select platforms:** Twitter, YouTube, LinkedIn
6. **Click:** "Start Scan"
7. **Watch logs in:**
   - Browser console (F12)
   - Backend terminal
8. **Check Content Hub section** after scan completes
9. **Verify content ideas** match video platform industry

---

## Expected Results

### For script.tv (Video Platform):

**✅ Good Content Ideas:**
- "How script.tv is changing video content creation"
- "Behind the scenes: Building a video platform"
- "Why creators are switching to script.tv"
- "Video streaming trends in 2024"

**❌ Bad Content Ideas (should be filtered):**
- "Script token launch announcement"
- "Script blockchain integration"
- "Crypto token: Script"
- "Script token sale"

---

## Next Steps After Testing

1. **If tests pass:** ✅ Implementation successful
2. **If issues found:**
   - Check logs for specific error messages
   - Verify brandIdentity is being generated correctly
   - Check validation keywords match your test cases
   - Review prompt structure

---

## Quick Commands Reference

```bash
# Start backend
cd backend && npm run dev

# Start frontend (new terminal)
npm run dev

# Test scan API
curl -X POST http://localhost:3001/api/scan/start \
  -H "Content-Type: application/json" \
  -d '{"username": "script.tv", "platforms": ["twitter"], "scanType": "standard"}'

# Check scan status
curl http://localhost:3001/api/scan/{scanId}/status

# Get results
curl http://localhost:3001/api/scan/{scanId}/results
```




