# Set VITE_API_URL in Netlify - Critical Fix

## ⚠️ This is Likely Causing "Page Not Found"

The app is trying to connect to `http://localhost:3001` which doesn't exist on Netlify, causing errors.

## ✅ Fix: Add Environment Variable

### Step 1: Go to Environment Variables

1. **Netlify Dashboard** → Your site
2. **Site settings** (gear icon)
3. **Environment variables** (in left sidebar)
4. Click **"Add variable"**

### Step 2: Add VITE_API_URL

**Key:** `VITE_API_URL`

**Value:** 
- For now (testing): `http://localhost:3001` (won't work but won't crash)
- Later (production): `https://api.aibcmedia.com` (after backend is deployed)

**Scopes:** Check all:
- ✅ Production
- ✅ Deploy previews  
- ✅ Branch deploys

Click **"Save"**

### Step 3: Redeploy

1. **Deploys** → **Trigger deploy** → **Clear cache and deploy site**
2. Wait 2-3 minutes
3. Test the site

---

## Why This Fixes It

**Before (missing env var):**
- App tries: `http://localhost:3001/api/...`
- Fails immediately
- App might crash or show errors
- Could cause "page not found"

**After (env var set):**
- App uses: `https://api.aibcmedia.com/api/...` (or whatever you set)
- API calls work (or fail gracefully)
- App loads correctly
- Routing works

---

## Temporary Value (For Testing)

Until backend is deployed, you can set:
```
VITE_API_URL=http://localhost:3001
```

The app will still try to connect, but it won't crash. Once backend is deployed, change it to your backend URL.

---

## After Backend is Deployed

Change `VITE_API_URL` to:
```
VITE_API_URL=https://api.aibcmedia.com
```

Then redeploy.

---

## Quick Checklist

- [ ] Go to Site settings → Environment variables
- [ ] Add `VITE_API_URL` with a value
- [ ] Save
- [ ] Trigger new deploy (clear cache)
- [ ] Test site
- [ ] Check browser console for errors

This should fix the "page not found" issue! 🚀

