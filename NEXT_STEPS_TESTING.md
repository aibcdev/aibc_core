# Next Steps: Testing OpenManus Footprint Scan

## ✅ Completed Steps 1 & 2
- ✅ OpenManus API server started (PID: 74526)
- ✅ Health check verified: `{"status":"limited","version":"1.0.0"}`
- ✅ Backend .env configured with OpenManus settings

## 🔄 Step 3: Restart Backend (Required)

**IMPORTANT**: The backend needs to be restarted to load the new `.env` settings.

### Option A: If backend is running in a terminal
1. Stop it (Ctrl+C)
2. Restart: `cd backend && npm run dev`

### Option B: If backend is running via process manager
```bash
# Find and restart backend
pkill -f "nodemon.*backend"
cd backend
npm run dev
```

## 🧪 Step 4: Run Test Script

I've created a test script for you:

```bash
./test_openmanus_scan.sh
```

This will:
1. ✅ Check OpenManus is running
2. ✅ Check Backend is running
3. ✅ Verify .env configuration
4. ✅ Test scan endpoint
5. ✅ Check scan status

## 🧪 Step 5: Manual Testing

### Test 1: Verify Services
```bash
# OpenManus
curl http://localhost:8000/health

# Backend (after restart)
curl http://localhost:3001/health
```

### Test 2: Start a Scan
```bash
curl -X POST http://localhost:3001/api/scan/start \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "platforms": ["twitter", "instagram"],
    "scanType": "standard"
  }'
```

### Test 3: Monitor Logs

**Terminal 1 - Backend Logs:**
Look for:
- `[Scan Route] Using OpenManus for scan {scanId}`
- `[OpenManus Service] Executing task`
- `[OpenManus Service] Task completed`

**Terminal 2 - OpenManus Logs:**
```bash
tail -f /tmp/openmanus.log
```

Look for:
- `Executing task: Perform a comprehensive digital footprint scan...`
- Task processing messages

## ✅ Expected Behavior

1. **Request sent** → `POST /api/scan/start`
2. **Feature flag check** → `useOpenManusScan()` returns `true`
3. **OpenManus call** → Backend calls `http://localhost:8000/task`
4. **OpenManus processes** → Agent executes footprint scanning
5. **Results returned** → Scan results saved and available

## 🔍 Verification Checklist

After restarting backend:

- [ ] Backend responds to health check
- [ ] Scan endpoint accepts requests
- [ ] Backend logs show "Using OpenManus for scan"
- [ ] OpenManus receives task request
- [ ] Scan status shows progress
- [ ] Results are returned

## 🐛 Troubleshooting

### Backend Not Using OpenManus
- ✅ Check `.env` has `USE_OPENMANUS_SCAN=true`
- ✅ Restart backend after .env changes
- ✅ Check backend logs for feature flag status

### OpenManus Not Receiving Requests
- ✅ Check OpenManus is running: `curl http://localhost:8000/health`
- ✅ Check network connectivity
- ✅ Check OpenManus logs for errors

### Scan Fails
- ✅ Check both service logs
- ✅ Verify all dependencies installed
- ✅ Check error messages in responses

## 📝 Quick Test Commands

```bash
# 1. Check services
curl http://localhost:8000/health && echo ""
curl http://localhost:3001/health && echo ""

# 2. Start scan
SCAN=$(curl -s -X POST http://localhost:3001/api/scan/start \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","platforms":["twitter"],"scanType":"standard"}')
echo $SCAN

# 3. Get scan ID and check status
SCAN_ID=$(echo $SCAN | grep -o '"scanId":"[^"]*"' | cut -d'"' -f4)
sleep 2
curl "http://localhost:3001/api/scan/$SCAN_ID/status"
```
