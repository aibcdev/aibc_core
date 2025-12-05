# Netlify Setup - Step by Step

## ✅ GitHub Connected - Now Configure Build

### Step 1: Configure Build Settings

In Netlify, you should see build configuration. Set these:

**Build command:**
```
npm run build
```

**Publish directory:**
```
dist
```

**Node version:**
```
18
```
(or select "Latest" from dropdown)

---

### Step 2: Add Environment Variables

**Before deploying, add this environment variable:**

1. In Netlify, go to **Site settings** → **Environment variables**
2. Click **"Add variable"**
3. Add:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://api.aibcmedia.com` (or `http://localhost:3001` for testing)
4. Click **"Save"**

**Important:** Add this BEFORE clicking "Deploy site" so it's available during build.

---

### Step 3: Deploy

1. Click **"Deploy site"** button
2. Wait 2-3 minutes for build to complete
3. You'll see build logs in real-time
4. When done, you'll get a URL like: `https://random-name-123.netlify.app`

---

### Step 4: Verify Deployment

1. Click on your site URL
2. Site should load (might show blank if backend isn't ready - that's OK)
3. Check browser console for any errors
4. Verify the build succeeded (green checkmark)

---

### Step 5: Add Custom Domain (Optional - Can Do Later)

1. Go to **Site settings** → **Domain management**
2. Click **"Add custom domain"**
3. Enter: `aibcmedia.com`
4. Netlify will show DNS instructions:
   - **Type:** CNAME
   - **Name:** @ (or leave blank)
   - **Value:** Your Netlify site URL (e.g., `random-name-123.netlify.app`)

5. **Add DNS record:**
   - Go to your domain registrar (where you bought aibcmedia.com)
   - Add the CNAME record as shown
   - Wait 5-60 minutes for DNS propagation

6. **SSL Certificate:**
   - Netlify automatically provisions SSL
   - Takes 5-10 minutes after DNS is configured
   - You'll see green lock when ready

---

## Quick Checklist

- [ ] Build command set to: `npm run build`
- [ ] Publish directory set to: `dist`
- [ ] Node version: 18 or Latest
- [ ] Environment variable `VITE_API_URL` added
- [ ] Clicked "Deploy site"
- [ ] Build completed successfully
- [ ] Site loads at Netlify URL
- [ ] (Optional) Custom domain added
- [ ] (Optional) DNS configured
- [ ] (Optional) SSL certificate active

---

## Troubleshooting

### Build Fails

**Check:**
- Build logs in Netlify dashboard
- Ensure `package.json` has `build` script
- Check Node version (should be 18+)
- Verify all dependencies are in `package.json`

**Common fixes:**
- Clear build cache: Site settings → Build & deploy → Clear cache
- Rebuild: Deploys → Trigger deploy → Clear cache and deploy site

### Environment Variable Not Working

- Make sure variable is added BEFORE deploying
- Variable name must be exactly: `VITE_API_URL`
- Rebuild after adding variable

### Site Loads But Blank

- Check browser console for errors
- Verify `VITE_API_URL` is set correctly
- Backend might not be ready yet (that's OK for now)

---

## Next Steps After Deployment

1. ✅ Frontend deployed to Netlify
2. ⏭️ Deploy backend to VPS (see `DEPLOY_VPS.md`)
3. ⏭️ Update `VITE_API_URL` to point to backend
4. ⏭️ Test full flow end-to-end

---

## Current Status

- ✅ GitHub connected
- ⏭️ Configure build settings
- ⏭️ Add environment variable
- ⏭️ Deploy
- ⏭️ Add custom domain (optional)

Let's proceed! 🚀

