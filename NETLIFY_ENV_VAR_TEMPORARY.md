# VITE_API_URL - Temporary Setup (Before Backend is Deployed)

## ⚠️ Important: Backend Not Deployed Yet

Since your backend isn't deployed yet, we need to handle this gracefully.

## Option 1: Set Future Backend URL (Recommended)

### In Netlify Environment Variables:

**Key:** `VITE_API_URL`

**Value:** `https://api.aibcmedia.com` (even though it doesn't exist yet)

**Why this works:**
- ✅ App will load and display correctly
- ✅ API calls will fail gracefully (handled by error catching)
- ✅ App won't crash - it will show "Backend unavailable" messages
- ✅ Once backend is deployed, it will work automatically
- ✅ No need to change env var later

### The App Will:
- ✅ Load and show all UI
- ✅ Allow navigation between pages
- ✅ Show error messages for API calls (expected until backend is ready)
- ✅ Work fully once backend is deployed

---

## Option 2: Use a Mock/Placeholder Backend

If you want the app to work fully before backend is ready:

**Value:** `https://jsonplaceholder.typicode.com` (public test API)

**Note:** This won't work with your actual endpoints, but prevents connection errors.

---

## Option 3: Leave It Unset (For Now)

**Don't set VITE_API_URL yet:**
- App will use fallback: `http://localhost:3001`
- API calls will fail (expected)
- App should still load
- Set it later when backend is deployed

---

## Recommended Approach

### For Now (Testing Frontend):
1. **Set VITE_API_URL** to: `https://api.aibcmedia.com`
2. **Redeploy**
3. **App will load** (even though API calls fail)
4. **Test the UI** and navigation
5. **Once backend is deployed**, it will work automatically

### After Backend is Deployed:
1. **Deploy backend** to VPS (see `DEPLOY_VPS.md`)
2. **Get backend URL** (e.g., `https://api.aibcmedia.com`)
3. **Update VITE_API_URL** in Netlify (if different)
4. **Redeploy** (or it will auto-update)

---

## What Happens with Failed API Calls

The app is designed to handle API failures gracefully:
- ✅ Shows error messages
- ✅ Falls back to cached data
- ✅ Still allows navigation
- ✅ Doesn't crash the app

So even if backend isn't ready, the frontend should still work for testing!

---

## Quick Setup

1. **Netlify** → Site settings → Environment variables
2. **Add:** `VITE_API_URL` = `https://api.aibcmedia.com`
3. **Save**
4. **Redeploy**
5. **Test** - App should load (API calls will fail, but that's OK)

Once backend is deployed, everything will work! 🚀

