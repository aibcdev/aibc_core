# ⚡ Quick Fix - What Was Wrong

## Issues Found:
1. ❌ Backend `.env` file was missing
2. ❌ Frontend `.env` file was missing
3. ✅ Fixed port (changed to 3001 for local)

## ✅ Fixed!

I've created the `.env` files for you. Now you need to:

### Step 1: Add Your Gemini API Key

Edit `backend/.env` and replace `your_gemini_api_key_here` with your actual key:

```bash
# Get your key from: https://makersuite.google.com/app/apikey
# Then edit backend/.env:
GEMINI_API_KEY=your_actual_key_here
```

### Step 2: Start Backend

```bash
cd backend
npm run dev
```

You should see:
```
🚀 Server running on port 3001
📡 Health check: http://localhost:3001/health
```

### Step 3: Start Frontend (New Terminal)

```bash
# In root directory (not in backend/)
npm run dev
```

You should see:
```
  ➜  Local:   http://localhost:5173/
```

### Step 4: Test It

1. Open http://localhost:5173
2. Click "Get Started"
3. Enter a username
4. Click "Scan Digital Footprint"

---

## If It Still Doesn't Work

**Check these:**

1. **Backend running?**
   ```bash
   curl http://localhost:3001/health
   # Should return: {"status":"ok",...}
   ```

2. **Frontend running?**
   - Check terminal shows: "Local: http://localhost:5173"

3. **API key correct?**
   - Check backend/.env has real key (not "your_gemini_api_key_here")

4. **Browser console errors?**
   - Press F12 → Console tab
   - Look for red errors

5. **Backend terminal errors?**
   - Check the terminal where you ran `npm run dev` in backend/
   - Look for error messages

---

## Common Issues

**"Cannot connect to backend"**
→ Make sure backend is running on port 3001

**"GEMINI_API_KEY not found"**
→ Edit backend/.env and add your real key

**"Port already in use"**
→ Kill the process: `lsof -ti:3001 | xargs kill -9`

**"Module not found"**
→ Run: `npm install` in backend/

---

## Still Stuck?

Tell me:
1. What error message you see
2. What shows in backend terminal
3. What shows in frontend terminal
4. What shows in browser console (F12)

