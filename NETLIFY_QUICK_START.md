# Netlify Deployment - Quick Start Guide

## 🚀 Deploy Frontend to Netlify (5 minutes)

### Step 1: Sign Up / Login to Netlify

1. Go to: https://app.netlify.com
2. Sign up or log in (you can use your GitHub account)

### Step 2: Connect Your Repository

1. Click **"Add new site"** → **"Import an existing project"**
2. Click **"Deploy with GitHub"**
3. Authorize Netlify to access your GitHub account
4. Select repository: **`aibcdev/aibc_core`**

### Step 3: Configure Build Settings

Netlify should auto-detect these, but verify:

- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Node version:** 18 (or latest)

### Step 4: Add Environment Variables

1. Go to **Site settings** → **Environment variables**
2. Click **"Add variable"**
3. Add:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://api.aibcmedia.com` (or `http://localhost:3001` for testing)
   - Click **"Save"**

### Step 5: Deploy

1. Click **"Deploy site"**
2. Wait 2-3 minutes for build to complete
3. Your site will be live at: `https://random-name-123.netlify.app`

### Step 6: Add Custom Domain

1. Go to **Site settings** → **Domain management**
2. Click **"Add custom domain"**
3. Enter: `aibcmedia.com`
4. Follow DNS instructions:
   - Netlify will show you a CNAME record
   - Go to your domain registrar
   - Add the CNAME record pointing to Netlify
   - Wait 5-60 minutes for DNS propagation

### Step 7: SSL Certificate

- Netlify automatically provisions SSL via Let's Encrypt
- Takes 5-10 minutes after DNS is configured
- You'll see a green lock icon when ready

---

## ✅ Verification Checklist

After deployment:
- [ ] Site loads at Netlify URL
- [ ] Environment variable `VITE_API_URL` is set
- [ ] Custom domain `aibcmedia.com` is added
- [ ] DNS CNAME record is configured
- [ ] SSL certificate is active (green lock)
- [ ] Site loads at `https://aibcmedia.com`

---

## 🔧 Troubleshooting

### Build fails
- Check build logs in Netlify dashboard
- Ensure `package.json` has `build` script
- Check Node version (should be 18+)

### API calls fail
- Verify `VITE_API_URL` environment variable is set
- Check browser console for CORS errors
- Ensure backend CORS allows `https://aibcmedia.com`

### Domain not working
- Wait 24-48 hours for DNS propagation
- Verify DNS CNAME record is correct
- Check domain is verified in Netlify

---

## 📝 Next Steps

After frontend is deployed:
1. Deploy backend to VPS (see `DEPLOY_VPS.md`)
2. Update `VITE_API_URL` in Netlify to point to backend
3. Test full flow end-to-end

---

## 💰 Cost

- **Free tier:** $0/month (100GB bandwidth, 300 build minutes)
- **Pro tier:** $19/month (if you need more bandwidth)
- **Custom domain:** Free (SSL included)

