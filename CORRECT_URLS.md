# ✅ Correct URLs to Use

## Your Setup:

- **Backend API:** http://localhost:3001
- **Frontend App:** http://localhost:3003

## 🎯 Open This in Your Browser:

```
http://localhost:3003
```

**NOT** http://localhost:5173 (that port is in use)

---

## Why Port 3003?

Vite automatically chose port 3003 because:
- Port 5173 was already in use
- Port 3000 might be in use
- Port 3001 is your backend
- So it picked 3003

This is **completely normal** and **works perfectly**!

---

## Both Servers:

✅ **Backend Terminal:**
- Shows: `🚀 Server running on port 3001`
- API available at: http://localhost:3001

✅ **Frontend Terminal:**
- Shows: `Local: http://localhost:3003/`
- App available at: http://localhost:3003

---

## Test It:

1. Open browser
2. Go to: **http://localhost:3003**
3. You should see the AIBC landing page
4. Click "Get Started"
5. Test the scan feature

---

## If Frontend Shows Errors:

Check browser console (F12) for:
- CORS errors → Backend needs restart
- Connection errors → Backend not running
- 404 errors → Wrong URL

---

## Quick Check:

Test backend:
```bash
curl http://localhost:3001/health
```

Test frontend:
```bash
curl http://localhost:3003
```

Both should work!

---

## Summary:

**Use:** http://localhost:3003 (not 5173)

Everything is working correctly! 🎉

