# 🔧 Troubleshooting Guide

## Quick Fixes

### Backend Not Starting

**Issue: Port already in use**
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9
# Or change port in backend/src/server.ts
```

**Issue: Missing .env file**
```bash
cd backend
cp .env.example .env
# Edit .env and add: GEMINI_API_KEY=your_key_here
```

**Issue: Playwright not installed**
```bash
cd backend
npm run install-playwright
```

**Issue: Dependencies not installed**
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

### Frontend Not Starting

**Issue: Port already in use**
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

**Issue: Missing .env file**
```bash
# In root directory
echo "VITE_API_URL=http://localhost:3001" > .env
```

**Issue: Can't connect to backend**
- Check backend is running: `curl http://localhost:3001/health`
- Check CORS in backend/src/server.ts
- Check browser console for errors

### Scan Not Working

**Issue: "Failed to start scan"**
- Check backend logs for errors
- Verify GEMINI_API_KEY is correct
- Check backend is running

**Issue: "Connection refused"**
- Backend not running - start it!
- Wrong URL in frontend .env
- Check firewall/network

**Issue: Scan hangs or fails**
- Check backend terminal for errors
- Some platforms block scraping (normal)
- Try different username

## Common Error Messages

**"Cannot find module '@google/genai'"**
→ Run: `npm install` in backend

**"Playwright browser not found"**
→ Run: `npm run install-playwright` in backend

**"ECONNREFUSED"**
→ Backend not running - start it!

**"CORS error"**
→ Check FRONTEND_URL in backend .env

**"401 Unauthorized"**
→ Check GEMINI_API_KEY is correct

## Step-by-Step Debug

1. **Check Backend:**
   ```bash
   cd backend
   npm run dev
   # Should see: "🚀 Server running on port 3001"
   ```

2. **Test Backend:**
   ```bash
   curl http://localhost:3001/health
   # Should return: {"status":"ok",...}
   ```

3. **Check Frontend:**
   ```bash
   npm run dev
   # Should see: "Local: http://localhost:5173"
   ```

4. **Check Browser Console:**
   - Open DevTools (F12)
   - Look for red errors
   - Check Network tab for failed requests

## Still Not Working?

Share:
1. What error message you see
2. Backend terminal output
3. Frontend terminal output
4. Browser console errors

