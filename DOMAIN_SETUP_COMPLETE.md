# Domain Setup Complete: aibcmedia.com

## ✅ What's Been Updated

All domain references have been changed from `aibc.com` to `aibcmedia.com`:

### Files Updated:
- ✅ `index.html` - Meta tags, Open Graph, Twitter Cards, structured data
- ✅ `public/sitemap.xml` - All URLs updated
- ✅ `public/robots.txt` - Sitemap URL updated
- ✅ `components/SEOHead.tsx` - Default URLs and structured data
- ✅ `components/LandingView.tsx` - Footer links and email addresses
- ✅ `components/HelpCenterView.tsx` - Support email and docs link

### Email Addresses Updated:
- `support@aibcmedia.com` (was support@aibc.com)
- `hello@aibcmedia.com` (was hello@aibc.com)
- `careers@aibcmedia.com` (was careers@aibc.com)
- `legal@aibcmedia.com` (was legal@aibc.com)

### Documentation URLs:
- `https://docs.aibcmedia.com` (was docs.aibc.com)

---

## 🚀 Deployment Recommendation

**Recommended: Hybrid Approach**
- **Frontend:** Netlify (free tier for MVP)
- **Backend:** VPS (DigitalOcean/Linode - $12/month)

**Why:**
- ✅ Netlify is perfect for static frontend (React/Vite build)
- ✅ VPS needed for long-running backend processes (scans take 5-10 mins)
- ✅ Total cost: ~$12-13/month for MVP
- ✅ Easy to scale as you grow

---

## 📋 Next Steps

### 1. Deploy Frontend to Netlify
See: `DEPLOY_NETLIFY.md`
- Connect GitHub repo
- Set build command: `npm run build`
- Add environment variable: `VITE_API_URL=https://api.aibcmedia.com`
- Add custom domain: `aibcmedia.com`

### 2. Deploy Backend to VPS
See: `DEPLOY_VPS.md`
- Create VPS instance (DigitalOcean/Linode)
- Set up Node.js, PM2, Nginx
- Deploy backend code
- Configure SSL with Let's Encrypt
- Point `api.aibcmedia.com` to VPS

### 3. Configure DNS
- **Frontend:** Point `aibcmedia.com` to Netlify (CNAME)
- **Backend:** Point `api.aibcmedia.com` to VPS (A record)

---

## 💰 Cost Breakdown

### Option 1: Netlify Free + VPS (Recommended)
- Netlify: $0/month (free tier)
- VPS: $12/month (DigitalOcean basic)
- Domain: $12/year (~$1/month)
- **Total: ~$13/month**

### Option 2: Netlify Pro + VPS
- Netlify: $19/month (Pro tier)
- VPS: $12/month
- Domain: $12/year (~$1/month)
- **Total: ~$32/month**

### Option 3: Self-Hosted Everything
- VPS: $12-24/month
- Domain: $12/year (~$1/month)
- CDN (Cloudflare): $0/month (free tier)
- **Total: ~$13-25/month**
- **More setup work required**

---

## 🔧 Environment Variables Needed

### Frontend (Netlify)
```
VITE_API_URL=https://api.aibcmedia.com
```

### Backend (VPS)
```
PORT=3001
FRONTEND_URL=https://aibcmedia.com
GEMINI_API_KEY=your_key_here
NODE_ENV=production
```

---

## 📚 Documentation Files Created

1. **DEPLOYMENT_COMPARISON.md** - Detailed comparison of Netlify vs VPS
2. **DEPLOY_NETLIFY.md** - Step-by-step Netlify deployment guide
3. **DEPLOY_VPS.md** - Step-by-step VPS deployment guide
4. **netlify.toml** - Netlify configuration file

---

## ✅ Pre-Deployment Checklist

- [x] All domain references updated to aibcmedia.com
- [x] Email addresses updated
- [x] SEO meta tags updated
- [x] Sitemap updated
- [x] Robots.txt updated
- [x] Netlify config created
- [x] Deployment guides created
- [ ] Domain DNS configured
- [ ] Frontend deployed to Netlify
- [ ] Backend deployed to VPS
- [ ] SSL certificates active
- [ ] Environment variables set
- [ ] End-to-end testing complete

---

## 🎯 Quick Start Commands

### Test locally first:
```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (new terminal)
npm install
npm run dev
```

### Deploy to production:
1. Push code to GitHub
2. Connect to Netlify (see DEPLOY_NETLIFY.md)
3. Deploy backend to VPS (see DEPLOY_VPS.md)
4. Configure DNS
5. Test!

---

## 🆘 Need Help?

- **Netlify issues:** Check `DEPLOY_NETLIFY.md`
- **VPS issues:** Check `DEPLOY_VPS.md`
- **Comparison:** See `DEPLOYMENT_COMPARISON.md`

---

## 📝 Notes

- Netlify free tier is perfect for MVP/testing
- Upgrade to Pro ($19/month) when you need more bandwidth
- VPS can be upgraded as traffic grows
- Both can scale independently

