# Connecting GoDaddy Domain to Netlify

## ✅ Current Status

- ✅ GitHub connected to Netlify
- ✅ Environment variable added
- ⏭️ Deploy site (can do now)
- ⏭️ Connect GoDaddy domain (can do after deployment)

---

## Order of Operations

### 1. Deploy First (Do This Now)
- Deploy your site to Netlify
- Get your Netlify URL (e.g., `https://random-name-123.netlify.app`)
- Site will work on this URL immediately
- **Domain connection can wait**

### 2. Connect Domain Later
- Add custom domain in Netlify
- Configure DNS in GoDaddy
- Wait for DNS propagation
- SSL will auto-provision

---

## Step-by-Step: Connect GoDaddy Domain

### Step 1: Add Domain in Netlify

1. **In Netlify Dashboard:**
   - Go to your site
   - Click **Site settings** → **Domain management**
   - Click **"Add custom domain"**
   - Enter: `aibcmedia.com`
   - Click **"Verify"**

2. **Netlify will show DNS instructions:**
   - You'll see something like:
     - **Type:** CNAME
     - **Name:** @ (or www)
     - **Value:** `your-site-name.netlify.app`

---

### Step 2: Configure DNS in GoDaddy

1. **Log into GoDaddy:**
   - Go to: https://dcc.godaddy.com
   - Sign in to your account

2. **Find your domain:**
   - Click **"My Products"**
   - Find `aibcmedia.com`
   - Click **"DNS"** button (or "Manage DNS")

3. **Add CNAME Record:**
   - Scroll to **"Records"** section
   - Click **"Add"** button
   - Select **"CNAME"** from dropdown
   - **Name/Host:** `@` (or leave blank for root domain)
   - **Value/Points to:** `your-site-name.netlify.app` (from Netlify)
   - **TTL:** 600 (or default)
   - Click **"Save"**

4. **Add www subdomain (optional but recommended):**
   - Click **"Add"** again
   - Select **"CNAME"**
   - **Name/Host:** `www`
   - **Value/Points to:** `your-site-name.netlify.app`
   - **TTL:** 600
   - Click **"Save"**

---

### Step 3: Wait for DNS Propagation

- **Time:** 5 minutes to 48 hours (usually 15-60 minutes)
- **Check status:** Netlify will show "DNS configuration detected" when ready
- **Verify:** Go to Netlify → Domain management → Check status

---

### Step 4: SSL Certificate (Automatic)

- Netlify automatically provisions SSL via Let's Encrypt
- **Time:** 5-10 minutes after DNS is configured
- **Status:** You'll see green lock icon when ready
- **No action needed** - happens automatically

---

## GoDaddy DNS Configuration Example

### Records to Add:

```
Type: CNAME
Name: @
Value: your-site-name.netlify.app
TTL: 600

Type: CNAME
Name: www
Value: your-site-name.netlify.app
TTL: 600
```

### Important Notes:

- **@** means root domain (aibcmedia.com)
- **www** means www.aibcmedia.com
- Both should point to your Netlify site
- Remove any existing A records for @ if they conflict

---

## Troubleshooting

### "DNS not configured" in Netlify

**Check:**
- DNS records are saved in GoDaddy
- CNAME value matches Netlify site URL exactly
- Wait longer (DNS can take up to 48 hours)
- Check DNS propagation: https://www.whatsmydns.net

### "Domain already in use"

**Possible causes:**
- Domain is connected to another Netlify site
- Domain is connected to another service
- Check GoDaddy DNS for other records

**Fix:**
- Remove conflicting DNS records
- Or transfer domain to this Netlify site

### SSL Certificate Not Provisioning

**Wait:**
- Can take 5-10 minutes after DNS is configured
- Check domain status in Netlify
- Ensure DNS is fully propagated

**If still not working:**
- Go to Site settings → Domain management
- Click "Verify DNS configuration"
- Check for any errors

---

## Current Status Checklist

- [x] GitHub connected to Netlify
- [x] Environment variable added
- [ ] Deploy site (do this now)
- [ ] Add custom domain in Netlify
- [ ] Configure DNS in GoDaddy
- [ ] Wait for DNS propagation
- [ ] SSL certificate active

---

## Recommendation

**Deploy now, connect domain later:**
1. ✅ Deploy your site (get it working first)
2. ✅ Test everything on Netlify URL
3. ✅ Then connect GoDaddy domain
4. ✅ Site will work on both URLs

This way you can:
- Test the site immediately
- Fix any issues before domain goes live
- Connect domain when ready

---

## Quick Reference

**Netlify:**
- Site settings → Domain management → Add custom domain

**GoDaddy:**
- My Products → aibcmedia.com → DNS → Add CNAME

**DNS Records:**
- @ → your-site.netlify.app
- www → your-site.netlify.app

**Wait time:**
- DNS: 15-60 minutes (up to 48 hours)
- SSL: 5-10 minutes after DNS

---

You're all set! Deploy first, then we'll connect the domain. 🚀

