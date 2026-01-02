# Testing OpenManus Footprint Scan Integration

## Step 1: Start OpenManus API Server
```bash
cd openmanus-service
./start.sh
```

## Step 2: Verify OpenManus is Running
```bash
curl http://localhost:8000/health
# Expected: {"status":"limited" or "healthy","version":"1.0.0"}
```

## Step 3: Configure Backend to Use OpenManus

Add to `backend/.env`:
```bash
OPENMANUS_ENABLED=true
OPENMANUS_API_URL=http://localhost:8000
USE_OPENMANUS_SCAN=true
```

## Step 4: Start Backend Server
```bash
cd backend
npm run dev
```

## Step 5: Test Scan Endpoint

### Via curl:
```bash
curl -X POST http://localhost:3001/api/scan/start \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "platforms": ["twitter", "instagram"],
    "scanType": "standard"
  }'
```

### Via Frontend:
1. Navigate to ingestion page
2. Enter username
3. Click "Scan Digital Footprint"
4. Watch for OpenManus integration logs

## Step 6: Check Logs

### OpenManus Logs:
```bash
tail -f /tmp/openmanus.log
# or if running in foreground, check terminal output
```

### Backend Logs:
Look for:
- `[Scan Route] Using OpenManus for scan`
- `[OpenManus Service] Executing task`
- `[OpenManus Service] Task completed`

## Expected Behavior

1. **Scan Request** → Backend receives request
2. **Feature Flag Check** → `useOpenManusScan()` returns true
3. **OpenManus Call** → Backend calls OpenManus API
4. **Task Execution** → OpenManus processes the scan
5. **Response** → Results returned to frontend

## Troubleshooting

### OpenManus Not Responding
- Check if service is running: `curl http://localhost:8000/health`
- Check logs: `tail -f /tmp/openmanus.log`
- Restart service: `cd openmanus-service && ./start.sh`

### Backend Not Using OpenManus
- Check `.env` has `USE_OPENMANUS_SCAN=true`
- Check feature flag: `console.log(useOpenManusScan())`
- Check backend logs for "Using OpenManus" message

### Scan Fails
- Check OpenManus health status
- Verify all dependencies installed
- Check error messages in both logs
