# Local Testing Checklist - OpenManus Integration

## ✅ Pre-Test Checklist

- [ ] Backend running on http://localhost:3001
- [ ] OpenManus running on http://localhost:8000
- [ ] Frontend running on http://localhost:5173
- [ ] .env configured with `USE_OPENMANUS_SCAN=true`

## 🧪 Test Scenarios

### Test 1: Basic Footprint Scan
**Steps:**
1. Open http://localhost:5173/scan
2. Enter username: "testuser"
3. Select platform: Twitter
4. Click "Scan Digital Footprint"
5. Wait for scan to complete

**Expected:**
- ✅ Scan starts successfully
- ✅ Backend logs show: "[Scan Route] Using OpenManus for scan"
- ✅ OpenManus receives request (check logs)
- ✅ Scan status updates in UI

**Verify:**
- Browser console: Network request to `/api/scan/start`
- Backend terminal: OpenManus routing message
- OpenManus terminal: Task received message

---

### Test 2: Multi-Platform Scan
**Steps:**
1. Open http://localhost:5173/scan
2. Enter username: "testuser"
3. Select platforms: Twitter, Instagram, LinkedIn
4. Click "Scan Digital Footprint"
5. Monitor progress

**Expected:**
- ✅ All platforms processed
- ✅ OpenManus handles multi-platform request
- ✅ Results aggregated correctly

---

### Test 3: Strategy Hub with OpenManus
**Steps:**
1. Complete a scan first
2. Navigate to http://localhost:5173/strategy
3. Review generated suggestions
4. Test strategy modification

**Expected:**
- ✅ Strategy suggestions generated
- ✅ OpenManus used if `USE_OPENMANUS_STRATEGY=true`
- ✅ Suggestions are relevant and actionable

---

### Test 4: Content Generation
**Steps:**
1. Complete a scan first
2. Navigate to http://localhost:5173/content
3. Generate content (blog post or social post)
4. Review generated content

**Expected:**
- ✅ Content matches brand voice
- ✅ Content is relevant to brand DNA
- ✅ Quality is production-ready

---

## 📊 Monitoring During Tests

### Browser DevTools (F12)
**Network Tab:**
- Watch for requests to `/api/scan/start`
- Check response status codes
- Review response data

**Console Tab:**
- Check for errors
- Look for OpenManus-related messages
- Monitor scan progress updates

### Backend Terminal
**Watch for:**
```
[Scan Route] Using OpenManus for scan {scanId}
[OpenManus Service] Executing task
[OpenManus Service] Task completed
```

### OpenManus Terminal
**Watch for:**
```
Executing task: Perform a comprehensive digital footprint scan...
POST /task HTTP/1.1 200 OK
```

---

## 🔍 Verification Points

### Integration Working ✅
- Backend routes to OpenManus
- OpenManus receives requests
- Responses returned correctly
- Error handling works

### UI Working ✅
- Scan page loads
- Form submission works
- Progress updates display
- Results show correctly

### Data Flow ✅
- Scan request → Backend
- Backend → OpenManus
- OpenManus → Backend
- Backend → Frontend
- Frontend displays results

---

## 🐛 Troubleshooting

### Scan Not Starting
- Check browser console for errors
- Verify backend is running
- Check network tab for failed requests

### OpenManus Not Being Used
- Check .env has `USE_OPENMANUS_SCAN=true`
- Restart backend after .env changes
- Check backend logs for feature flag status

### Scan Fails
- Check OpenManus logs for errors
- Check backend logs for error details
- Verify all services are running

### Frontend Not Loading
- Check if frontend process is running
- Check port 5173 is available
- Review frontend logs for errors

---

## 📝 Test Results Template

**Test Date:** ___________

**Test Scenario:** ___________

**Results:**
- [ ] Scan started successfully
- [ ] OpenManus routing confirmed
- [ ] Results displayed correctly
- [ ] No errors in console
- [ ] Performance acceptable

**Issues Found:**
- 

**Notes:**
- 

---

## 🎯 Success Criteria

✅ **Integration Test Passes If:**
1. Backend successfully routes to OpenManus
2. OpenManus receives and processes requests
3. Results are returned to frontend
4. UI displays results correctly
5. No critical errors in logs

✅ **Full Functionality Test Passes If:**
1. All above criteria met
2. OpenManus agent executes tasks successfully
3. Scan results are complete and accurate
4. Content generation works with brand DNA
5. Strategy suggestions are relevant
