# Next Steps: Testing OpenManus Footprint Scan

## ✅ Step 1 & 2 Complete
- OpenManus API server started
- Health check verified

## 🧪 Step 3: Configure Backend

### Option A: Create/Update `.env` file
```bash
cd backend
cat >> .env << 'ENVEOF'
# OpenManus Configuration
OPENMANUS_ENABLED=true
OPENMANUS_API_URL=http://localhost:8000
USE_OPENMANUS_SCAN=true
ENVEOF
```

### Option B: Set Environment Variables
```bash
export OPENMANUS_ENABLED=true
export OPENMANUS_API_URL=http://localhost:8000
export USE_OPENMANUS_SCAN=true
```

## 🚀 Step 4: Start Backend (if not running)
```bash
cd backend
npm run dev
```

## 🧪 Step 5: Test Scan Integration

### Test 1: Health Check Integration
```bash
# Test OpenManus health from backend
curl http://localhost:3001/api/scan/health 2>/dev/null || \
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

### Test 3: Check Scan Status
```bash
# Replace {scanId} with ID from previous response
curl http://localhost:3001/api/scan/status/{scanId}
```

## 📊 Step 6: Monitor Logs

### Terminal 1: OpenManus Logs
```bash
tail -f /tmp/openmanus.log
# or if running in foreground, watch terminal
```

### Terminal 2: Backend Logs
Watch for:
- `[Scan Route] Using OpenManus for scan`
- `[OpenManus Service] Executing task`
- `[OpenManus Service] Task completed`

## ✅ Expected Results

1. **Backend receives scan request**
2. **Feature flag check passes** → `useOpenManusScan() === true`
3. **OpenManus API called** → Request sent to `http://localhost:8000/task`
4. **OpenManus processes scan** → Agent executes footprint scanning
5. **Results returned** → Scan results sent back to frontend

## 🔍 Verification Checklist

- [ ] OpenManus API running on port 8000
- [ ] Backend can reach OpenManus (health check works)
- [ ] Feature flags configured correctly
- [ ] Scan request triggers OpenManus call
- [ ] OpenManus receives and processes request
- [ ] Results returned to frontend

## 🐛 Troubleshooting

### OpenManus Not Responding
```bash
# Check if running
curl http://localhost:8000/health

# Restart if needed
cd openmanus-service
./start.sh
```

### Backend Not Using OpenManus
- Check `.env` file has correct settings
- Verify feature flag: `console.log(useOpenManusScan())`
- Check backend logs for "Using OpenManus" message

### Scan Returns Error
- Check OpenManus logs for errors
- Verify all dependencies installed
- Check network connectivity between services
