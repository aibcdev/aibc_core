# Complete Test Plan: OpenManus Footprint Scan

## Prerequisites ✅
- [x] OpenManus API server running (port 8000)
- [x] Backend server running (port 3001)
- [x] Feature flags configured

## Test Flow

### 1. Verify Services Are Running

```bash
# Check OpenManus
curl http://localhost:8000/health
# Expected: {"status":"limited" or "healthy","version":"1.0.0"}

# Check Backend
curl http://localhost:3001/health
# Expected: {"status":"ok"} or similar
```

### 2. Test OpenManus Integration Directly

```bash
# Test OpenManus task endpoint
curl -X POST http://localhost:8000/task \
  -H "Content-Type: application/json" \
  -d '{
    "task": "Scan digital footprint for testuser",
    "context": {
      "username": "testuser",
      "platforms": ["twitter", "instagram"]
    }
  }'
```

### 3. Test Backend Scan Route with OpenManus

```bash
# Start a scan via backend
curl -X POST http://localhost:3001/api/scan/start \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "platforms": ["twitter", "instagram"],
    "scanType": "standard"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "scanId": "...",
  "message": "Scan started successfully"
}
```

### 4. Monitor Both Services

**Terminal 1 - OpenManus Logs:**
```bash
tail -f /tmp/openmanus.log
# Look for: "Executing task: Scan digital footprint..."
```

**Terminal 2 - Backend Logs:**
```bash
# Watch backend terminal
# Look for: "[Scan Route] Using OpenManus for scan"
# Look for: "[OpenManus Service] Executing task"
```

### 5. Check Scan Results

```bash
# Get scan status (replace {scanId} with actual ID)
curl http://localhost:3001/api/scan/status/{scanId}
```

### 6. Test Frontend Integration

1. Open frontend: `http://localhost:5173`
2. Navigate to Ingestion page
3. Enter username (e.g., "testuser")
4. Click "Scan Digital Footprint"
5. Watch for:
   - Scan progress updates
   - OpenManus processing indicators
   - Results display

## Success Criteria

✅ OpenManus API receives scan requests  
✅ Backend routes to OpenManus when feature flag enabled  
✅ OpenManus processes scan task  
✅ Results returned to frontend  
✅ Scan completes successfully  

## Debugging Commands

```bash
# Check OpenManus process
ps aux | grep "python api_server"

# Check backend process
ps aux | grep "node.*backend"

# Check ports
lsof -i :8000  # OpenManus
lsof -i :3001  # Backend

# View OpenManus logs
cat /tmp/openmanus.log | tail -50

# Test OpenManus health from backend
curl http://localhost:3001/api/scan/health 2>/dev/null
```
