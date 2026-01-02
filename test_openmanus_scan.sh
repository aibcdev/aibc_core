#!/bin/bash

echo "=== OpenManus Footprint Scan Integration Test ==="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check OpenManus
echo "Step 1: Checking OpenManus API..."
OPENMANUS_HEALTH=$(curl -s http://localhost:8000/health 2>/dev/null)
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ OpenManus is running${NC}"
    echo "   Response: $OPENMANUS_HEALTH"
else
    echo -e "${RED}❌ OpenManus is not responding${NC}"
    echo "   Start it with: cd openmanus-service && ./start.sh"
    exit 1
fi
echo ""

# Step 2: Check Backend
echo "Step 2: Checking Backend API..."
BACKEND_HEALTH=$(curl -s http://localhost:3001/health 2>/dev/null)
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backend is running${NC}"
    echo "   Response: $BACKEND_HEALTH"
else
    echo -e "${YELLOW}⚠️  Backend is not responding${NC}"
    echo "   Make sure backend is running: cd backend && npm run dev"
    echo "   Note: Backend needs to be restarted after .env changes"
    exit 1
fi
echo ""

# Step 3: Check .env configuration
echo "Step 3: Checking .env configuration..."
if [ -f "backend/.env" ]; then
    if grep -q "OPENMANUS_ENABLED=true" backend/.env && \
       grep -q "USE_OPENMANUS_SCAN=true" backend/.env; then
        echo -e "${GREEN}✅ OpenManus settings found in .env${NC}"
    else
        echo -e "${YELLOW}⚠️  OpenManus settings missing or disabled${NC}"
        echo "   Add to backend/.env:"
        echo "   OPENMANUS_ENABLED=true"
        echo "   OPENMANUS_API_URL=http://localhost:8000"
        echo "   USE_OPENMANUS_SCAN=true"
    fi
else
    echo -e "${RED}❌ .env file not found${NC}"
    exit 1
fi
echo ""

# Step 4: Test scan endpoint
echo "Step 4: Testing scan endpoint..."
SCAN_RESPONSE=$(curl -s -X POST http://localhost:3001/api/scan/start \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "platforms": ["twitter"],
    "scanType": "standard"
  }')

if echo "$SCAN_RESPONSE" | grep -q "success.*true"; then
    echo -e "${GREEN}✅ Scan request accepted${NC}"
    SCAN_ID=$(echo "$SCAN_RESPONSE" | grep -o '"scanId":"[^"]*"' | cut -d'"' -f4)
    echo "   Scan ID: $SCAN_ID"
    echo ""
    echo "   Response: $SCAN_RESPONSE"
    echo ""
    
    # Step 5: Check scan status
    echo "Step 5: Checking scan status (waiting 3 seconds)..."
    sleep 3
    STATUS_RESPONSE=$(curl -s "http://localhost:3001/api/scan/$SCAN_ID/status")
    echo "   Status: $STATUS_RESPONSE"
    
    if echo "$STATUS_RESPONSE" | grep -q "Using OpenManus\|openmanus"; then
        echo -e "${GREEN}✅ OpenManus integration is working!${NC}"
    else
        echo -e "${YELLOW}⚠️  Check if OpenManus is being used${NC}"
        echo "   Look for '[Scan Route] Using OpenManus for scan' in backend logs"
    fi
else
    echo -e "${RED}❌ Scan request failed${NC}"
    echo "   Response: $SCAN_RESPONSE"
    exit 1
fi

echo ""
echo "=== Test Complete ==="
echo ""
echo "Next steps:"
echo "1. Monitor backend logs for: '[Scan Route] Using OpenManus for scan'"
echo "2. Monitor OpenManus logs: tail -f /tmp/openmanus.log"
echo "3. Check scan results: curl http://localhost:3001/api/scan/$SCAN_ID/results"
