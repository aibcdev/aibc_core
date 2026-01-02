# 🚀 Start Local Testing - Quick Guide

## ✅ All Services Running

- **Backend:** http://localhost:3001 ✅
- **OpenManus:** http://localhost:8000 ✅  
- **Frontend:** http://localhost:5174 ✅

## 🧪 Test Now

### Step 1: Open Frontend
```
http://localhost:5174
```

### Step 2: Navigate to Scan Page
```
http://localhost:5174/scan
```

### Step 3: Start a Scan
1. Enter username: `testuser`
2. Select platform: `Twitter`
3. Click "Scan Digital Footprint"
4. Watch for progress

### Step 4: Monitor Integration

**Backend Terminal:**
Look for: `[Scan Route] Using OpenManus for scan`

**OpenManus Terminal:**
Look for: `POST /task HTTP/1.1`

**Browser Console (F12):**
- Network tab: Check `/api/scan/start` request
- Console tab: Check for errors

## ✅ Expected Results

1. ✅ Scan starts successfully
2. ✅ Backend routes to OpenManus
3. ✅ OpenManus receives request
4. ✅ Progress updates in UI
5. ✅ Results displayed (or error if limited mode)

## 🔍 Quick Commands

```bash
# Monitor backend logs
tail -f /tmp/backend.log | grep -i openmanus

# Monitor OpenManus logs
tail -f /tmp/openmanus.log

# Check service health
curl http://localhost:3001/health
curl http://localhost:8000/health
```

## 📝 Test Checklist

- [ ] Frontend loads at http://localhost:5174
- [ ] Scan page accessible
- [ ] Can enter username and select platform
- [ ] Scan starts when clicking button
- [ ] Backend logs show OpenManus routing
- [ ] OpenManus receives request
- [ ] UI shows progress/status

---

**Ready to test!** Open http://localhost:5174 and start scanning.
