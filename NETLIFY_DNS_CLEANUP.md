# Netlify DNS Configuration - Cleanup Guide

## Recommended Setup (What You Should Have)

### For Apex Domain (`aibcmedia.com`)
**One of these:**
- ✅ **ALIAS** record pointing to `apex-loadbalancer.netlify.com` (Recommended)
- ✅ **ANAME** record pointing to `apex-loadbalancer.netlify.com` (Recommended)
- ✅ **Flattened CNAME** record pointing to `apex-loadbalancer.netlify.com` (Recommended)
- ⚠️ **A record** pointing to Netlify IPs (Fallback - less resilient)

### For WWW Subdomain (`www.aibcmedia.com`)
- ✅ **CNAME** record pointing to `your-site-name.netlify.app` or `apex-loadbalancer.netlify.com`

## What to Remove

### ❌ Remove These (If They Exist):
1. **Old CNAME records** for `aibcmedia.com` (apex domain)
   - CNAME records don't work on apex domains (root domain)
   - If you have `aibcmedia.com CNAME something.netlify.app` → **Remove it**

2. **Conflicting A records** (if using ALIAS/ANAME)
   - If you're using ALIAS/ANAME, you shouldn't also have A records pointing to IPs
   - Keep only ONE: either ALIAS/ANAME OR A records

3. **Old/duplicate records**
   - Any CNAME records pointing to old services
   - Any A records pointing to old IPs
   - Any records you don't recognize

## GoDaddy Specific Instructions

### Step 1: Check Current Records
1. Log into GoDaddy
2. Go to **DNS Management** for `aibcmedia.com`
3. Look at all DNS records

### Step 2: Remove Old Records
Remove any of these if they exist:
- ❌ `aibcmedia.com` CNAME → (anything)
- ❌ `aibcmedia.com` A → (old IPs)
- ❌ Any other conflicting records

### Step 3: Add Recommended Record
Add ONE of these:

**Option A: ALIAS (If GoDaddy supports it)**
```
Type: ALIAS
Name: @ (or leave blank)
Value: apex-loadbalancer.netlify.com
TTL: 600 (or default)
```

**Option B: A Record (Fallback)**
```
Type: A
Name: @ (or leave blank)
Value: 75.2.60.5 (Netlify IP - check Netlify dashboard for current IPs)
TTL: 600
```

**Note:** GoDaddy may not support ALIAS/ANAME. If not, use A records with Netlify's IP addresses.

### Step 4: Add WWW Subdomain (Optional)
```
Type: CNAME
Name: www
Value: your-site-name.netlify.app (or apex-loadbalancer.netlify.com)
TTL: 600
```

## Final DNS Setup Should Look Like:

```
aibcmedia.com          ALIAS/ANAME → apex-loadbalancer.netlify.com
www.aibcmedia.com      CNAME → your-site-name.netlify.app
```

OR (if ALIAS not supported):

```
aibcmedia.com          A → 75.2.60.5 (Netlify IP)
www.aibcmedia.com      CNAME → your-site-name.netlify.app
```

## Important Notes

1. **Only ONE record type** for apex domain:
   - Either ALIAS/ANAME OR A records
   - NOT both

2. **CNAME on apex domain** = ❌ **Doesn't work**
   - CNAME records cannot be used on root domains
   - Must use ALIAS/ANAME or A records

3. **Check Netlify Dashboard:**
   - Netlify will show you the exact DNS records needed
   - Go to: **Site settings** → **Domain management** → **DNS configuration**

## After Making Changes

1. **Save** DNS changes in GoDaddy
2. **Wait 5-60 minutes** for DNS propagation
3. **Check in Netlify:** Domain should show as "Active" (green checkmark)
4. **Test:** Visit `https://aibcmedia.com` - should load your site

## Troubleshooting

**If domain doesn't work:**
- Check Netlify dashboard for DNS errors
- Verify DNS records match exactly what Netlify shows
- Wait longer for DNS propagation (can take up to 48 hours)
- Use `dig aibcmedia.com` or `nslookup aibcmedia.com` to check DNS

