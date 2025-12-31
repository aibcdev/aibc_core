#!/bin/bash

# Test n8n Workflow
# Make sure backend is running on port 3001

echo "🧪 Testing n8n Workflow..."
echo ""

# Check if backend is running
if ! curl -s http://localhost:3001/api/scan/health > /dev/null 2>&1; then
  echo "❌ Backend not running on port 3001"
  echo "   Start it with: cd backend && npm run dev"
  exit 1
fi

echo "✅ Backend is running"
echo ""

# Test workflow orchestration
echo "1️⃣  Testing workflow trigger..."
RESPONSE=$(curl -s -X POST http://localhost:3001/api/n8n/workflow/orchestrate \
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
          "description": "This is a test content idea for testing the workflow",
          "platform": "twitter",
          "type": "post",
          "text": "Test content text here"
        }
      ]
    },
    "competitorIntelligence": [
      {
        "name": "Competitor A",
        "topViralContent": [
          {
            "title": "Viral Post Example",
            "estimatedEngagement": 10000,
            "likes": 5000,
            "shares": 2000,
            "comments": 1000,
            "views": 50000
          },
          {
            "title": "Low Engagement Post",
            "estimatedEngagement": 50,
            "likes": 20,
            "shares": 5,
            "comments": 3,
            "views": 1000
          }
        ]
      }
    ],
    "strategicInsights": [
      {
        "title": "Test Insight",
        "description": "Test strategic insight"
      }
    ]
  }')

echo "Response:"
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
echo ""

# Wait a moment for processing
echo "⏳ Waiting 3 seconds for processing..."
sleep 3

# Check Content Hub
echo ""
echo "2️⃣  Checking Content Hub for reviewed content..."
CONTENT_HUB=$(curl -s http://localhost:3001/api/content-hub/reviewed)

echo "Content Hub Response:"
echo "$CONTENT_HUB" | jq '.' 2>/dev/null || echo "$CONTENT_HUB"
echo ""

# Check if content was created
ITEM_COUNT=$(echo "$CONTENT_HUB" | jq '.items | length' 2>/dev/null || echo "0")

if [ "$ITEM_COUNT" -gt "0" ]; then
  echo "✅ SUCCESS: Found $ITEM_COUNT reviewed content item(s) in Content Hub!"
else
  echo "⚠️  No content found in Content Hub yet (may need more time or check logs)"
fi

echo ""
echo "📋 Test complete!"
echo ""
echo "Next steps:"
echo "  - Check backend logs for workflow execution"
echo "  - Check .content-hub-reviewed.json file in backend directory"
echo "  - View Content Hub in frontend to see reviewed content"






