# Complete Testing Guide - n8n Workflow

## 🎯 Three Testing Methods

### Method 1: API Test (Quick)
### Method 2: Real Scan Test (Full Flow)
### Method 3: Debug Logging (Troubleshooting)

---

## Method 1: API Test (Quick Verification)

### Step 1: Start Backend

```bash
cd backend
npm run dev
```

Wait for: `🚀 Server running on port 3001`

### Step 2: Run Test Script

```bash
cd /Users/akeemojuko/Documents/aibc_core-1
./test-n8n-workflow.sh
```

### Step 3: Check Results

**Expected Logs:**
```
[Master CMO] ========================================
[Master CMO] Starting workflow: scan-complete
[Master CMO] ┌─ Executing: research → enhance-competitor-intelligence
[Research Agent] Executing task: enhance-competitor-intelligence
[Master CMO] └─ Completed: research → enhance-competitor-intelligence (Xms, success: true)
[Master CMO] ┌─ Executing: think → analyze-strategy
[Think Agent] Executing task: analyze-strategy
[Master CMO] └─ Completed: think → analyze-strategy (Xms, success: true)
[Master CMO] ┌─ Executing: media → generate-content-assets
[Media Agent] Executing task: generate-content-assets
[Master CMO] └─ Completed: media → generate-content-assets (Xms, success: true)
[Master CMO] ┌─ Executing: review → review-content-quality
[Review Agent] ========================================
[Review Agent] reviewContentQuality called
[Review Agent] Quality Score: XX/100
[Review Agent] Approved: true/false
[Master CMO] └─ Completed: review → review-content-quality (Xms, success: true)
[Master CMO] ┌─ Executing: helper → send-to-content-hub
[Helper Agent] ========================================
[Helper Agent] sendToContentHub called
[Helper Agent] ✅ Successfully wrote X items to Content Hub file
[Master CMO] └─ Completed: helper → send-to-content-hub (Xms, success: true)
[Master CMO] ✅ Helper Agent created X content hub items
[Master CMO] Workflow completed in Xms
```

**Check Content Hub:**
```bash
curl http://localhost:3001/api/content-hub/reviewed | jq '.'
```

**Check File:**
```bash
cat backend/.content-hub-reviewed.json | jq '.'
```

---

## Method 2: Real Scan Test (Full Flow)

### Step 1: Start Backend

```bash
cd backend
npm run dev
```

### Step 2: Start Frontend

```bash
# In root directory
npm run dev
```

Frontend should start on port 5174 (or another available port)

### Step 3: Run a Scan

1. Open browser: `http://localhost:5174`
2. Navigate to scan page (or `/scan`)
3. Enter a website: e.g., `company.com` or `twitter.com/username`
4. Click "Start Scan"
5. Wait for scan to complete (watch AuditView)

### Step 4: Watch for n8n Workflow

**Backend Logs Should Show:**
```
[N8N] Triggering Master CMO workflow...
[Master CMO] Starting workflow: scan-complete
... (all agent logs)
[Master CMO] Workflow completed
```

### Step 5: Check Content Hub

1. Navigate to Content Hub in frontend (`/contenthub`)
2. Should see reviewed content with "suggested" status
3. Content appears within 30 seconds (polling interval)

### Step 6: Verify Content

- Content should have quality score
- Content should be brand-specific
- Content should be platform-optimized
- Status should be "suggested" (ready for review)

---

## Method 3: Debug Logging (Troubleshooting)

### Enable Detailed Logs

All agents now have detailed logging. Check backend console for:

#### Master CMO Logs
```
[Master CMO] ========================================
[Master CMO] Starting workflow: scan-complete
[Master CMO] Username: test.com
[Master CMO] Has Brand DNA: true
[Master CMO] Has Content: true
[Master CMO] Competitors: 2
[Master CMO] ========================================
```

#### Research Agent Logs
```
[Research Agent] Executing task: enhance-competitor-intelligence
[Research Agent] Analyzing competitor: Competitor A
[Research Agent] Top performers: 1
[Research Agent] Low performers: 1
```

#### Review Agent Logs
```
[Review Agent] ========================================
[Review Agent] reviewContentQuality called
[Review Agent] Has content: true
[Review Agent] Has brandDNA: true
[Review Agent] Competitors: 2
[Review Agent] Quality Score: 85/100
[Review Agent] Issues: 0
[Review Agent] Approved: true
[Review Agent] ========================================
```

#### Helper Agent Logs
```
[Helper Agent] ========================================
[Helper Agent] sendToContentHub called
[Helper Agent] Has reviewedContent: true
[Helper Agent] Type: object
[Helper Agent] Content Hub path: /path/to/.content-hub-reviewed.json
[Helper Agent] Creating 1 content item(s)
[Helper Agent] Existing items: 0
[Helper Agent] ✅ Successfully wrote 1 items to Content Hub file
[Helper Agent] File exists: true
[Helper Agent] ✅ Sent 1 reviewed content items to Content Hub
[Helper Agent] ========================================
```

### Common Issues & Solutions

#### Issue 1: Content Not Appearing in Content Hub

**Check:**
1. File exists: `ls -la backend/.content-hub-reviewed.json`
2. File has content: `cat backend/.content-hub-reviewed.json | jq '.items | length'`
3. API returns data: `curl http://localhost:3001/api/content-hub/reviewed`
4. Frontend polling: Check browser console for errors

**Solution:**
- Verify Helper Agent completed successfully
- Check file permissions
- Verify API endpoint is accessible

#### Issue 2: Review Agent Failing

**Check:**
1. LLM API key configured: `GEMINI_API_KEY` in `.env`
2. Review Agent logs show errors
3. Quality score calculation

**Solution:**
- Set `GEMINI_API_KEY` in `backend/.env`
- Check Review Agent logs for specific errors
- May need to adjust quality thresholds

#### Issue 3: Workflow Not Completing

**Check:**
1. All agents executing: Look for all agent logs
2. Dependencies met: Check dependency logs
3. Errors in any agent: Look for ERROR messages

**Solution:**
- Check each agent's logs
- Verify all dependencies are met
- Fix any failing agents

---

## 📊 Expected Results

### Successful Workflow

1. ✅ All agents execute successfully
2. ✅ Research Agent filters low engagement
3. ✅ Review Agent approves content (quality ≥70)
4. ✅ Helper Agent creates Content Hub file
5. ✅ Content appears in Content Hub API
6. ✅ Frontend displays reviewed content

### Content Quality

- Quality Score: ≥70/100
- Issues: <3
- Brand Alignment: ✅
- Platform Optimization: ✅
- No placeholder text: ✅

---

## 🔍 Quick Debug Commands

```bash
# Check backend is running
curl http://localhost:3001/health

# Check Content Hub API
curl http://localhost:3001/api/content-hub/reviewed | jq '.'

# Check Content Hub file
cat backend/.content-hub-reviewed.json | jq '.'

# Watch backend logs
tail -f /tmp/backend-test.log

# Test workflow directly
curl -X POST http://localhost:3001/api/n8n/workflow/orchestrate \
  -H "Content-Type: application/json" \
  -d '{"workflowType":"scan-complete","username":"test.com","brandDNA":{},"extractedContent":{"contentIdeas":[{"title":"Test"}]},"competitorIntelligence":[],"strategicInsights":[]}'
```

---

## ✅ Success Checklist

- [ ] Backend running on port 3001
- [ ] Frontend running (for real scan test)
- [ ] Workflow triggers successfully
- [ ] Research Agent filters engagement
- [ ] Review Agent approves content
- [ ] Helper Agent creates Content Hub file
- [ ] Content Hub API returns items
- [ ] Frontend displays reviewed content
- [ ] Content has quality score
- [ ] Content is brand-specific

---

## 🚀 Ready to Test!

1. **Quick Test**: Run `./test-n8n-workflow.sh`
2. **Full Test**: Run a real scan through frontend
3. **Debug**: Check logs for detailed execution trace

All logging is now in place to trace every step of the workflow!






