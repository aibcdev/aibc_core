# Fixing "Page Not Found" on Netlify

## Issue
Netlify is showing "Page not found" for routes other than the homepage.

## Root Cause
Netlify needs to be configured to redirect all routes to `index.html` for React SPA routing.

## Solutions

### Solution 1: Use netlify.toml (Already Configured)

The `netlify.toml` file already has redirects configured:
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**If this isn't working, check:**
1. File is in repository root (✅ it is)
2. File is committed to Git (✅ it is)
3. Netlify is reading it (might need to redeploy)

### Solution 2: Use _redirects File (Backup)

The `public/_redirects` file should be copied to `dist/` during build:
```
/*    /index.html   200
```

**To ensure it's included:**
1. File is in `public/` folder (✅ it is)
2. Vite copies it during build (should be automatic)
3. File appears in `dist/` after build

### Solution 3: Manual Fix in Netlify Dashboard

1. **Go to Netlify Dashboard:**
   - Site settings → **Build & deploy** → **Post processing**

2. **Add redirect rule:**
   - Click **"Add redirect rule"**
   - **From:** `/*`
   - **To:** `/index.html`
   - **Status:** `200`
   - **Force:** No

3. **Save and redeploy**

### Solution 4: Check Build Output

Verify the redirects are working:

1. **Check build logs in Netlify:**
   - Look for any errors about redirects
   - Check if `netlify.toml` is being read

2. **Check deployed files:**
   - In Netlify, go to **Deploys** → Click on latest deploy
   - Check **"Deploy log"** → Look for redirects being processed

3. **Test the redirect:**
   - Visit: `https://your-site.netlify.app/dashboard`
   - Should redirect to `index.html` and show dashboard

---

## Quick Fix Steps

### Step 1: Verify netlify.toml is correct
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Step 2: Ensure _redirects is in public/
```
public/_redirects should contain:
/*    /index.html   200
```

### Step 3: Rebuild and redeploy
1. Commit any changes
2. Push to GitHub
3. Netlify will auto-deploy
4. Or manually trigger deploy in Netlify

### Step 4: Test
- Visit: `https://your-site.netlify.app`
- Visit: `https://your-site.netlify.app/dashboard`
- Both should work

---

## Troubleshooting

### "netlify.toml not found"
- Ensure file is in repository root
- Check it's committed to Git
- Verify it's in the branch Netlify is deploying

### "Redirects not working"
- Check Netlify build logs
- Verify redirect syntax is correct
- Try manual redirect in Netlify dashboard

### "Still getting 404"
- Clear Netlify cache
- Check browser cache (hard refresh: Cmd+Shift+R)
- Verify the route exists in your React app

---

## Current Status

✅ `netlify.toml` configured with redirects
✅ `public/_redirects` file created
⏭️ Need to verify it's being deployed correctly

**Next step:** Check Netlify build logs to see if redirects are being processed.

