# Connecting Multiple Repositories to Netlify

## ✅ You Don't Need a New Team!

If you already have a GitHub account connected to Netlify, you can simply **add a new site** from a different repository. No new team needed!

---

## How to Add a New Repository

### Option 1: Add New Site (Recommended)

1. **Go to Netlify Dashboard:**
   - Visit: https://app.netlify.com
   - You'll see your existing sites

2. **Add New Site:**
   - Click **"Add new site"** button (top right)
   - Select **"Import an existing project"**
   - Choose **"Deploy with GitHub"**

3. **Select Repository:**
   - Netlify will show all your GitHub repositories
   - Find and select: **`aibcdev/aibc_core`**
   - Click **"Connect"**

4. **Configure Build Settings:**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Click **"Deploy site"**

5. **Done!** Your new site is now connected alongside your existing sites.

---

### Option 2: Reconnect GitHub (If Needed)

If you need to reconnect GitHub or add permissions:

1. **Go to User Settings:**
   - Click your profile icon (top right)
   - Select **"User settings"**

2. **Connected accounts:**
   - Go to **"Connected accounts"** tab
   - You'll see your GitHub connection
   - Click **"Connect"** or **"Reconnect"** if needed

3. **Authorize:**
   - GitHub will ask for permissions
   - Grant access to repositories
   - You can choose **"All repositories"** or **"Only select repositories"**

---

## Multiple Sites on One Account

**You can have unlimited sites on one Netlify account:**
- Each site can be from a different repository
- Each site gets its own URL (e.g., `site1.netlify.app`, `site2.netlify.app`)
- Each site can have its own custom domain
- All sites share the same team/account limits

---

## Free Tier Limits

- **100 sites** per account (free tier)
- **100GB bandwidth** total (shared across all sites)
- **300 build minutes** per month (shared across all sites)

For most use cases, this is plenty!

---

## Managing Multiple Sites

### View All Sites:
- Dashboard shows all your sites in a grid
- Each site has its own card with status, URL, etc.

### Site-Specific Settings:
- Each site has its own:
  - Environment variables
  - Build settings
  - Custom domains
  - Deploy logs
  - Analytics

### Team Collaboration:
- You can invite team members to specific sites
- Or add them to your entire team

---

## Quick Checklist

- [ ] Go to Netlify dashboard
- [ ] Click "Add new site"
- [ ] Select "Import an existing project"
- [ ] Choose "Deploy with GitHub"
- [ ] Select `aibcdev/aibc_core` repository
- [ ] Configure build settings
- [ ] Deploy!

---

## Troubleshooting

### "Repository not showing up"
- Make sure the repository is in your GitHub account
- Check that you've granted Netlify access to that repository
- Try reconnecting GitHub in User Settings

### "Permission denied"
- Go to User Settings → Connected accounts
- Reconnect GitHub
- Grant access to the repository

### "Already connected"
- If you see this, the repository is already connected
- Just select it from the list when adding a new site

---

## Summary

**No new team needed!** Just:
1. Click "Add new site"
2. Select your repository
3. Deploy!

All your sites will be in the same Netlify account/team.

