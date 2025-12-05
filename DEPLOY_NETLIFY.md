# Deploy Frontend to Netlify

## Quick Setup (5 minutes)

### Option 1: Connect GitHub Repository (Recommended)

1. **Push code to GitHub:**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Connect to Netlify:**
   - Go to [netlify.com](https://netlify.com)
   - Sign up/login
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub repository
   - Select your repository

3. **Configure build settings:**
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - **Node version:** 18 (or latest)

4. **Add environment variables:**
   - Go to Site settings → Environment variables
   - Add: `VITE_API_URL=https://api.aibcmedia.com` (or your backend URL)

5. **Deploy:**
   - Click "Deploy site"
   - Wait for build to complete (~2-3 minutes)

6. **Custom domain:**
   - Go to Site settings → Domain management
   - Add custom domain: `aibcmedia.com`
   - Follow DNS instructions (add CNAME record)

---

### Option 2: Deploy via Netlify CLI

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login:**
   ```bash
   netlify login
   ```

3. **Initialize site:**
   ```bash
   netlify init
   ```
   - Choose "Create & configure a new site"
   - Choose team
   - Site name: `aibcmedia` (or your choice)

4. **Build and deploy:**
   ```bash
   npm run build
   netlify deploy --prod
   ```

5. **Add custom domain:**
   ```bash
   netlify domains:add aibcmedia.com
   ```

---

## Environment Variables

Add these in Netlify dashboard (Site settings → Environment variables):

```
VITE_API_URL=https://api.aibcmedia.com
```

Or if using a different backend URL:
```
VITE_API_URL=https://your-backend-domain.com
```

---

## Custom Domain Setup

1. **In Netlify dashboard:**
   - Go to Site settings → Domain management
   - Click "Add custom domain"
   - Enter: `aibcmedia.com`

2. **DNS Configuration:**
   - Netlify will show you DNS records to add
   - Go to your domain registrar (where you bought aibcmedia.com)
   - Add the CNAME or A record as shown by Netlify
   - Wait for DNS propagation (5 minutes to 48 hours)

3. **SSL Certificate:**
   - Netlify automatically provisions SSL via Let's Encrypt
   - Takes 5-10 minutes after DNS is configured
   - You'll see a green lock icon when ready

---

## Post-Deployment Checklist

- [ ] Site loads at `https://aibcmedia.com`
- [ ] SSL certificate is active (green lock)
- [ ] API calls work (check browser console)
- [ ] All pages load correctly
- [ ] Images and assets load
- [ ] Forms work (if any)

---

## Troubleshooting

### Build fails
- Check build logs in Netlify dashboard
- Ensure `package.json` has correct build script
- Check Node version (should be 18+)

### API calls fail
- Check `VITE_API_URL` environment variable
- Ensure backend CORS allows `https://aibcmedia.com`
- Check browser console for CORS errors

### Domain not working
- Wait 24-48 hours for DNS propagation
- Check DNS records are correct
- Verify domain is verified in Netlify

---

## Cost

- **Free tier:** $0/month (100GB bandwidth, 300 build minutes)
- **Pro tier:** $19/month (if you need more bandwidth)
- **Custom domain:** Free (SSL included)

---

## Next Steps

After frontend is deployed:
1. Deploy backend to VPS (see `DEPLOY_VPS.md`)
2. Update `VITE_API_URL` in Netlify to point to backend
3. Test full flow end-to-end

