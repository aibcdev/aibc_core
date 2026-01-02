#!/bin/bash

echo "=== OpenManus Local Test Commands ==="
echo ""

echo "1. Test Backend Health:"
echo "   curl http://localhost:3001/health"
echo ""

echo "2. Test OpenManus Health:"
echo "   curl http://localhost:8000/health"
echo ""

echo "3. Test Scan Endpoint:"
echo "   curl -X POST http://localhost:3001/api/scan/start \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"username\":\"testuser\",\"platforms\":[\"twitter\"],\"scanType\":\"standard\"}'"
echo ""

echo "4. Open Frontend:"
echo "   open http://localhost:5173"
echo ""

echo "5. Monitor Logs:"
echo "   # Backend"
echo "   tail -f /tmp/backend.log | grep -i openmanus"
echo ""
echo "   # OpenManus"
echo "   tail -f /tmp/openmanus.log"
echo ""
echo "   # Frontend"
echo "   tail -f /tmp/frontend.log"
