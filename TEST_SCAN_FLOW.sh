#!/bin/bash

echo "🔍 Testing Digital Footprint Scanner Flow"
echo "=========================================="
echo ""

# Check if backend is running
echo "1. Checking backend health..."
BACKEND_STATUS=$(curl -s http://localhost:3001/health 2>&1)
if [[ $BACKEND_STATUS == *"ok"* ]]; then
    echo "✅ Backend is running"
else
    echo "❌ Backend is NOT running"
    echo "   Start it with: cd backend && npm run dev"
    exit 1
fi

# Test scan endpoint
echo ""
echo "2. Testing scan endpoint..."
SCAN_RESPONSE=$(curl -s -X POST http://localhost:3001/api/scan/start \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","platforms":["twitter"],"scanType":"standard"}' 2>&1)

if [[ $SCAN_RESPONSE == *"scanId"* ]]; then
    echo "✅ Scan endpoint working"
    SCAN_ID=$(echo $SCAN_RESPONSE | grep -o '"scanId":"[^"]*"' | cut -d'"' -f4)
    echo "   Scan ID: $SCAN_ID"
    
    # Wait a bit and check status
    echo ""
    echo "3. Checking scan status..."
    sleep 2
    STATUS_RESPONSE=$(curl -s http://localhost:3001/api/scan/$SCAN_ID/status 2>&1)
    if [[ $STATUS_RESPONSE == *"success"* ]]; then
        echo "✅ Status endpoint working"
        echo "   Response: $STATUS_RESPONSE"
    else
        echo "⚠️  Status endpoint issue: $STATUS_RESPONSE"
    fi
else
    echo "❌ Scan endpoint failed: $SCAN_RESPONSE"
fi

echo ""
echo "=========================================="
echo "✅ Basic tests complete"
echo ""
echo "Next steps:"
echo "1. Open http://localhost:3003 (or 5173)"
echo "2. Navigate to Ingestion page"
echo "3. Enter a username"
echo "4. Watch the AuditView for scan progress"

