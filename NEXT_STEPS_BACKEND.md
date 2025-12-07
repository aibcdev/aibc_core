# 🚀 Next Steps - Backend Connection

## ✅ Current Status
- ✅ Backend deployed: `https://aibc-backend-ohyv2qu4da-uc.a.run.app`
- ✅ Environment variable set in Netlify: `VITE_API_URL`
- ⏳ **Next: Trigger new deployment**

---

## 📋 Step-by-Step Next Actions

### Step 1: Trigger New Netlify Deployment (REQUIRED)

**Why:** Environment variables only take effect on NEW deployments.

1. Go to Netlify Dashboard: https://app.netlify.com
2. Select your site (`aibcmedia.com`)
3. Go to **Deploys** tab
4. Click **Trigger deploy** → **Deploy site**
5. Wait for deployment to complete (~1-2 minutes)
6. ✅ Verify deployment succeeded (green checkmark)

---

### Step 2: Test Backend Connection

**After deployment completes:**

1. **Hard refresh browser:**
   - Mac: `Cmd + Shift + R`
   - Windows: `Ctrl + Shift + R`

2. **Open browser console (F12)**

3. **Test backend health:**
   ```javascript
   fetch('https://aibc-backend-ohyv2qu4da-uc.a.run.app/health')
     .then(r => r.json())
     .then(console.log)
   ```
   **Expected:** `{status: "ok", timestamp: "..."}`

4. **Check environment variable:**
   ```javascript
   console.log(import.meta.env.VITE_API_URL)
   ```
   **Expected:** `https://aibc-backend-ohyv2qu4da-uc.a.run.app`

---

### Step 3: Test Full Flow

**Test Digital Footprint Scan:**

1. Go to: `https://aibcmedia.com`
2. Click **"GET STARTED"** or **"LOG IN"**
3. Sign up or sign in
4. Enter a username (e.g., `nike` or `@nike`)
5. Click **"Scan Digital Footprint"**
6. **Watch for:**
   - ✅ Scan progress updates in real-time
   - ✅ No "Backend unavailable" errors
   - ✅ Results appear when scan completes

**Check Network Tab:**
- Open DevTools → Network tab
- Look for requests to `aibc-backend-ohyv2qu4da-uc.a.run.app`
- Requests should return `200 OK` (not `404` or `CORS error`)

---

### Step 4: Test Other Features

**After scan works, test:**

1. **Content Generation:**
   - Go to Production Room
   - Try generating content for different platforms
   - Verify content matches brand voice

2. **Analytics Dashboard:**
   - Check dashboard loads with real data
   - Verify competitor analysis appears
   - Check market share estimates

3. **Authentication:**
   - Test Google sign-in (if configured)
   - Test email sign-up/sign-in
   - Verify user data persists

---

## 🔍 Troubleshooting

### Issue: Still seeing "Backend unavailable"
**Fix:**
- Verify new deployment completed
- Hard refresh browser (Cmd+Shift+R)
- Check `VITE_API_URL` in browser console
- Verify backend is running: `curl https://aibc-backend-ohyv2qu4da-uc.a.run.app/health`

### Issue: CORS Error
**Fix:**
- Backend CORS should already be configured
- If error persists, check backend logs:
  ```bash
  gcloud run services logs read aibc-backend --region us-central1 --limit 20
  ```

### Issue: 404 on API calls
**Fix:**
- Verify environment variable is exactly `VITE_API_URL` (case-sensitive)
- Check that deployment included the env var
- Look at Netlify build logs for any errors

---

## 📊 Backend Endpoints Available

Your backend has these endpoints:

- `GET /health` - Health check
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `POST /api/auth/google` - Google OAuth
- `POST /api/scan/start` - Start digital footprint scan
- `GET /api/scan/:id/status` - Get scan status
- `GET /api/scan/:id/results` - Get scan results
- `POST /api/generate-content` - Generate brand-voice content
- `POST /api/generate-image` - Generate AI images
- `GET /api/analytics/dashboard` - Get dashboard analytics
- `POST /api/competitors/discover-fast` - Fast competitor discovery
- `GET /api/credits/balance` - Get user credits
- `POST /api/credits/deduct` - Deduct credits
- `GET /api/admin/users` - Admin: Get users
- `GET /api/admin/requests` - Admin: Get video/audio requests

---

## ✅ Success Checklist

- [ ] New Netlify deployment triggered
- [ ] Deployment completed successfully
- [ ] Browser hard refreshed
- [ ] Backend health check passes
- [ ] `VITE_API_URL` shows correct backend URL in console
- [ ] Digital footprint scan works end-to-end
- [ ] No "Backend unavailable" errors
- [ ] Network tab shows successful API calls

---

## 🎯 Once Everything Works

After confirming the connection works:

1. **Monitor backend logs:**
   ```bash
   gcloud run services logs tail aibc-backend --region us-central1
   ```

2. **Set up monitoring/alerts** (optional):
   - GCP Cloud Monitoring
   - Uptime checks
   - Error alerting

3. **Optimize performance:**
   - Review scan times
   - Check API response times
   - Monitor credit usage

---

**Ready?** Go trigger that Netlify deployment! 🚀

