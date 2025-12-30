# Testing n8n Workflow - Step by Step

## Prerequisites

1. Backend server running on port 3001
2. Frontend running (optional, for Content Hub viewing)
3. Environment variables configured (optional for full testing)

## Test Steps

### 1. Start Backend Server

```bash
cd backend
npm run dev
```

Backend should start on `http://localhost:3001`

### 2. Test Workflow Trigger (Manual)

The workflow is automatically triggered after a scan completes. To test manually:

#### Option A: Trigger via API

```bash
curl -X POST http://localhost:3001/api/n8n/workflow/orchestrate \
  -H "Content-Type: application/json" \
  -d '{
    "workflowType": "scan-complete",
    "username": "test-company.com",
    "brandDNA": {
      "industry": "Technology",
      "voice": {
        "tones": ["professional", "engaging"]
      },
      "corePillars": ["innovation", "community"]
    },
    "extractedContent": {
      "contentIdeas": [
        {
          "title": "Test Content Idea",
          "description": "This is a test content idea",
          "platform": "twitter",
          "type": "post"
        }
      ]
    },
    "competitorIntelligence": [
      {
        "name": "Competitor A",
        "topViralContent": [
          {
            "title": "Viral Post",
            "estimatedEngagement": 10000,
            "likes": 5000,
            "shares": 2000,
            "comments": 1000
          }
        ]
      }
    ],
    "strategicInsights": []
  }'
```

#### Option B: Run a Real Scan

1. Start frontend: `npm run dev` (in root directory)
2. Navigate to scan page
3. Enter a website (e.g., "company.com")
4. Start scan
5. Wait for scan to complete
6. Workflow will automatically trigger

### 3. Check Workflow Execution

#### Check Backend Logs

Look for these log messages:
```
[Master CMO] Starting workflow: scan-complete
[Research Agent] Executing task: enhance-competitor-intelligence
[Think Agent] Executing task: analyze-strategy
[Media Agent] Executing task: generate-content-assets
[Review Agent] Executing task: review-content-quality
[Review Agent] Executing task: final-quality-check
[Helper Agent] Executing task: send-to-content-hub
[Helper Agent] Sent X reviewed content items to Content Hub
[Master CMO] Workflow completed in Xms
```

#### Check Content Hub API

```bash
curl http://localhost:3001/api/content-hub/reviewed
```

Should return:
```json
{
  "success": true,
  "items": [
    {
      "id": "reviewed_...",
      "content": {...},
      "status": "reviewed",
      "qualityScore": 85,
      "reviewedAt": "..."
    }
  ]
}
```

### 4. Verify Content Hub (Frontend)

1. Navigate to Content Hub in frontend
2. Should see reviewed content with "suggested" status
3. Content should appear within 30 seconds (polling interval)

### 5. Test Strategy Modification

```bash
curl -X POST http://localhost:3001/api/strategy/process \
  -H "Content-Type: application/json" \
  -d '{
    "message": "aim for more comedy style content similar to Competitor A",
    "username": "test-company.com",
    "scanUsername": "test-company.com",
    "brandDNA": {...},
    "competitorIntelligence": [...]
  }'
```

## Expected Results

### Research Agent
- ✅ Filters out low engagement content (bottom 30%)
- ✅ Identifies high-performing content (top 20%)
- ✅ Extracts success factors

### Review Agent
- ✅ Text quality check passes
- ✅ Image/media validation passes
- ✅ Quality score ≥70/100
- ✅ <3 issues found

### Helper Agent
- ✅ Content stored in `.content-hub-reviewed.json`
- ✅ Content available via API
- ✅ NO email/Slack sent

### Content Hub
- ✅ Reviewed content appears
- ✅ Status: "suggested"
- ✅ Quality score visible
- ✅ Can approve/reject

## Troubleshooting

### Workflow Not Triggering
- Check backend logs for errors
- Verify scan completed successfully
- Check `scanService.ts` has n8n trigger code

### Content Not Appearing in Content Hub
- Check `.content-hub-reviewed.json` file exists
- Verify API endpoint returns data
- Check frontend polling is working
- Look for CORS errors in browser console

### Review Agent Failing
- Check LLM API keys configured (GEMINI_API_KEY)
- Verify content structure matches expected format
- Check quality thresholds (may need adjustment)

### Research Agent Not Filtering
- Verify competitor data has engagement metrics
- Check engagement calculation logic
- Ensure topViralContent or similar fields exist

## Quick Test Script

Save as `test-workflow.sh`:

```bash
#!/bin/bash

echo "Testing n8n Workflow..."

# Test workflow orchestration
echo "1. Testing workflow trigger..."
curl -X POST http://localhost:3001/api/n8n/workflow/orchestrate \
  -H "Content-Type: application/json" \
  -d '{
    "workflowType": "scan-complete",
    "username": "test.com",
    "brandDNA": {"industry": "Tech"},
    "extractedContent": {"contentIdeas": [{"title": "Test"}]},
    "competitorIntelligence": [],
    "strategicInsights": []
  }' | jq '.'

# Wait a moment
sleep 2

# Check Content Hub
echo "2. Checking Content Hub..."
curl http://localhost:3001/api/content-hub/reviewed | jq '.'

echo "Test complete!"
```

Run: `chmod +x test-workflow.sh && ./test-workflow.sh`





