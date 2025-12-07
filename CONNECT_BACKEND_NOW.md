# 🔗 Connect Frontend to Backend - Quick Guide

## ✅ Backend Status
- **Backend URL:** `https://aibc-backend-ohyv2qu4da-uc.a.run.app`
- **Status:** ✅ Deployed and running
- **Region:** us-central1

---

## 🎯 Step 1: Update Netlify Environment Variable

### Option A: Via Netlify Dashboard (Recommended)

1. **Go to Netlify Dashboard:**
   - Visit: https://app.netlify.com
   - Select your site (`aibcmedia.com`)

2. **Navigate to Environment Variables:**
   - Go to: **Site settings** → **Environment variables**

3. **Add/Update Variable:**
   - **Key:** `VITE_API_URL`
   - **Value:** `https://aibc-backend-ohyv2qu4da-uc.a.run.app`
   - Click **Save**

4. **Trigger New Deploy:**
   - Go to **Deploys** tab
   - Click **Trigger deploy** → **Deploy site**
   - Wait for deployment to complete (1-2 minutes)

---

### Option B: Via Netlify CLI

```bash
# Install Netlify CLI (if not installed)
npm install -g netlify-cli

# Login
netlify login

# Set environment variable
netlify env:set VITE_API_URL https://aibc-backend-ohyv2qu4da-uc.a.run.app

# Trigger redeploy
netlify deploy --prod
```

---

## 🧪 Step 2: Test Backend Connection

### Test 1: Health Check
```bash
curl https://aibc-backend-ohyv2qu4da-uc.a.run.app/health
```

**Expected Response:**
```json
{"status":"ok","message":"Backend is running"}
```

### Test 2: Test from Browser Console
1. Open `https://aibcmedia.com`
2. Open browser console (F12)
3. Run:
```javascript
fetch('https://aibc-backend-ohyv2qu4da-uc.a.run.app/health')
  .then(r => r.json())
  .then(console.log)
```

**Expected:** `{status: "ok", message: "Backend is running"}`

---

## ✅ Step 3: Verify Frontend is Using Backend

After Netlify redeploys:

1. **Hard refresh** your browser (Cmd+Shift+R / Ctrl+Shift+R)
2. **Open browser console** (F12)
3. **Check Network tab:**
   - Try signing up or starting a scan
   - Look for requests to `aibc-backend-ohyv2qu4da-uc.a.run.app`
   - Requests should return `200 OK` (not `404` or `CORS error`)

---

## 🔍 Troubleshooting

### Issue: CORS Error
**Symptom:** Browser console shows "CORS policy" error

**Fix:** Backend CORS is already configured for `aibcmedia.com`. If you see this:
- Check that backend `FRONTEND_URL` includes `https://aibcmedia.com`
- Verify backend is running: `curl https://aibc-backend-ohyv2qu4da-uc.a.run.app/health`

### Issue: 404 Not Found
**Symptom:** API calls return 404

**Fix:** 
- Verify `VITE_API_URL` is set correctly in Netlify
- Check that the environment variable name is exactly `VITE_API_URL` (case-sensitive)
- Ensure you've triggered a new deploy after setting the variable

### Issue: Environment Variable Not Working
**Symptom:** Frontend still uses `localhost:3001`

**Fix:**
1. In Netlify, go to **Deploys** → **Trigger deploy** → **Deploy site**
2. Wait for build to complete
3. Hard refresh browser (Cmd+Shift+R)
4. Check browser console for `import.meta.env.VITE_API_URL` value

---

## 📋 Quick Checklist

- [ ] Backend is deployed: `https://aibc-backend-ohyv2qu4da-uc.a.run.app`
- [ ] `VITE_API_URL` set in Netlify environment variables
- [ ] New Netlify deployment triggered
- [ ] Backend health check passes
- [ ] Frontend can connect to backend (check browser console)
- [ ] Digital footprint scan works end-to-end

---

## 🚀 Next Steps After Connection

Once connected, you can:
1. ✅ Test digital footprint scanning
2. ✅ Test content generation
3. ✅ Test analytics dashboard
4. ✅ Test competitor analysis
5. ✅ Monitor backend logs in GCP Console

---

## 📞 Need Help?

**Backend Logs:**
```bash
gcloud run services logs read aibc-backend --region us-central1 --limit 50
```

**Backend Status:**
```bash
gcloud run services describe aibc-backend --region us-central1
```

**Netlify Deploy Logs:**
- Go to Netlify Dashboard → Your Site → Deploys → Click on latest deploy → View logs

