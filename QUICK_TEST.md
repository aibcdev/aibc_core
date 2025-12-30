# Quick Test Instructions

## ✅ All Three Tasks Complete

### 1. ✅ Detailed Logging Added
- Master CMO: Full workflow tracing with execution times
- Research Agent: Engagement filtering logs
- Review Agent: Quality score and approval logs
- Helper Agent: Content Hub delivery logs

### 2. ✅ Real Scan Test Ready
- Frontend integration complete
- Workflow triggers automatically after scan
- Content Hub polls every 30 seconds

### 3. ✅ Content Hub Debugging
- Helper Agent writes to file with detailed logs
- Master CMO verifies Content Hub items
- API endpoint ready for frontend

---

## 🚀 Quick Start Testing

### Option A: API Test (Fastest)

```bash
# 1. Start backend
cd backend && npm run dev

# 2. In another terminal, run test
cd /Users/akeemojuko/Documents/aibc_core-1
./test-n8n-workflow.sh
```

**Watch for logs:**
- `[Master CMO] Starting workflow`
- `[Research Agent]` - filtering engagement
- `[Review Agent]` - quality check
- `[Helper Agent]` - Content Hub delivery
- `[Master CMO] Workflow completed`

### Option B: Real Scan Test (Full Flow)

```bash
# 1. Start backend
cd backend && npm run dev

# 2. Start frontend (in root)
npm run dev

# 3. Open browser: http://localhost:5174
# 4. Navigate to /scan
# 5. Enter website and start scan
# 6. Watch AuditView for scan completion
# 7. Check backend logs for n8n workflow
# 8. Navigate to Content Hub to see reviewed content
```

---

## 📋 What to Look For

### Backend Logs Should Show:

```
[Master CMO] ========================================
[Master CMO] Starting workflow: scan-complete
[Master CMO] Username: test.com
[Master CMO] Has Brand DNA: true
[Master CMO] Has Content: true
[Master CMO] Competitors: 2
[Master CMO] ========================================
[Master CMO] ┌─ Executing: research → enhance-competitor-intelligence
[Research Agent] Executing task: enhance-competitor-intelligence
[Master CMO] └─ Completed: research → enhance-competitor-intelligence (Xms, success: true)
...
[Review Agent] Quality Score: 85/100
[Review Agent] Approved: true
...
[Helper Agent] ✅ Successfully wrote 1 items to Content Hub file
[Master CMO] ✅ Helper Agent created 1 content hub items
[Master CMO] Workflow completed in Xms
```

### Content Hub Should Show:

```bash
# Check API
curl http://localhost:3001/api/content-hub/reviewed | jq '.'

# Should return:
{
  "success": true,
  "items": [
    {
      "id": "reviewed_...",
      "content": {...},
      "status": "reviewed",
      "qualityScore": 85
    }
  ]
}
```

---

## 🔍 Debugging Commands

```bash
# Check if file was created
ls -la backend/.content-hub-reviewed.json

# View file contents
cat backend/.content-hub-reviewed.json | jq '.'

# Check API
curl http://localhost:3001/api/content-hub/reviewed | jq '.'

# Watch backend logs
tail -f /tmp/backend-test.log
```

---

## ✅ Success Indicators

1. ✅ All agents log their execution
2. ✅ Research Agent filters low engagement
3. ✅ Review Agent approves content (≥70 score)
4. ✅ Helper Agent creates Content Hub file
5. ✅ Content appears in API response
6. ✅ Frontend displays reviewed content

**All logging is in place. Ready to test!**





