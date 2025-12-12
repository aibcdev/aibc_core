# DNS Fix Guide for aibcmedia.com

## Problem
`www.aibcmedia.com` is showing "DNS address could not be found" error.

## Quick Fix Steps

### Step 1: Check Netlify Site Status
1. Go to https://app.netlify.com
2. Find your site
3. Check if it's deployed (should show "Published")
4. Note your Netlify subdomain (e.g., `your-site-123.netlify.app`)

### Step 2: Test Netlify Subdomain
Try accessing: `https://your-site-123.netlify.app`
- If this works → Site is deployed, issue is only with custom domain
- If this doesn't work → Site deployment issue

### Step 3: Verify Custom Domain in Netlify
1. In Netlify Dashboard → Your Site → **Domain settings**
2. Check if `aibcmedia.com` and `www.aibcmedia.com` are listed
3. If missing:
   - Click "Add custom domain"
   - Enter `aibcmedia.com`
   - Enter `www.aibcmedia.com`
   - Netlify will show you the DNS records to add

### Step 4: Configure DNS Records
Go to your domain registrar (where you bought `aibcmedia.com`):

**Option A: Use Netlify DNS (Recommended)**
1. In Netlify → Domain settings → Click "Set up Netlify DNS"
2. Follow instructions to update nameservers at your registrar
3. Netlify will handle all DNS automatically

**Option B: Manual DNS Configuration**
Add these records at your domain registrar:

For `aibcmedia.com`:
- Type: `A` or `ALIAS`
- Name: `@` or `aibcmedia.com`
- Value: (Netlify will provide - usually an IP or CNAME target)

For `www.aibcmedia.com`:
- Type: `CNAME`
- Name: `www`
- Value: `your-site-123.netlify.app` (your Netlify subdomain)

### Step 5: Wait for DNS Propagation
- DNS changes can take 24-48 hours to propagate
- Usually works within 1-2 hours
- Check status: https://dnschecker.org

### Step 6: Verify DNS is Working
Run these commands:
```bash
# Check if DNS is resolving
dig aibcmedia.com +short
dig www.aibcmedia.com +short

# Should return IP addresses or CNAME targets
```

## Common Issues

### Issue: Domain not added in Netlify
**Solution:** Add custom domain in Netlify Dashboard → Domain settings

### Issue: DNS records not configured
**Solution:** Add DNS records at your domain registrar (see Step 4)

### Issue: Wrong nameservers
**Solution:** If using Netlify DNS, update nameservers at registrar to Netlify's nameservers

### Issue: DNS propagation delay
**Solution:** Wait 1-24 hours for DNS to propagate globally

## Quick Test
1. Check Netlify subdomain works: `https://your-site.netlify.app`
2. Check custom domain in Netlify: Dashboard → Domain settings
3. Check DNS records: Use `dig` command or https://dnschecker.org
4. Wait for propagation if DNS was just changed

## Need Help?
- Netlify Support: https://www.netlify.com/support/
- Check Netlify Status: https://www.netlifystatus.com/
- DNS Checker: https://dnschecker.org
