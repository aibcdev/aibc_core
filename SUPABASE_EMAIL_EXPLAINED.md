# Supabase Email Service - Explained

## How Supabase Sends Emails

Supabase has **TWO options** for sending emails:

### Option 1: Built-in Email Service (Default) ✅
- **Works automatically** - No setup needed!
- Supabase sends emails using their own infrastructure
- **Rate limits:** 
  - Free tier: Limited emails per hour
  - Pro tier: Higher limits
- **Good for:** Testing, small apps, getting started
- **No SMTP configuration needed**

### Option 2: Custom SMTP (Optional) 🔧
- Use your own email provider (SendGrid, AWS SES, etc.)
- **No rate limits** (depends on your provider)
- **Better deliverability** for production
- **Requires setup:** Configure SMTP credentials
- **Good for:** High-volume production apps

## Which One Are You Using?

**If you see this warning in Supabase:**
> "Set up custom SMTP - You're using the built-in email service"

**This means:**
- ✅ You're using the **built-in service** (which works!)
- ⚠️ The warning is just suggesting you upgrade to custom SMTP
- ✅ **You can ignore it** - built-in service works fine

## Why Password Reset Might Not Work

If emails aren't coming through, it's **NOT** because you need SMTP. Check these instead:

### 1. Email Template Not Enabled
- Go to: **Authentication → Email Templates**
- Click on **"Reset password"**
- Make sure it's active/enabled
- The template should be visible (not grayed out)

### 2. Redirect URL Not Set
- Go to: **Authentication → URL Configuration**
- **Redirect URLs** must include:
  ```
  https://aibcmedia.com
  https://www.aibcmedia.com
  ```
- **Site URL** should be: `https://aibcmedia.com`

### 3. Rate Limiting
- Built-in service has rate limits
- If you've sent many emails recently, wait 5-10 minutes
- Check Supabase logs for rate limit errors

### 4. Email in Spam
- Check spam/junk folder
- Built-in service emails sometimes go to spam
- Try a different email address

### 5. Check Supabase Logs
- Go to: **Logs → Auth Logs**
- Look for password reset requests
- Check for any error messages

## Quick Test

1. **Go to Supabase Dashboard**
2. **Authentication → Email Templates**
3. **Click "Reset password"** - Should open template editor
4. **Check if it's enabled** - Should see the email template
5. **Try password reset** - Check browser console for logs
6. **Check Supabase Auth Logs** - See if request was received

## Summary

✅ **You DON'T need SMTP** - Supabase built-in service works  
✅ **Built-in service is fine** for production (with rate limits)  
✅ **Custom SMTP is optional** - Only needed for high volume  
⚠️ **Check email template, redirect URL, and logs** instead

The issue is likely one of the 5 points above, not SMTP configuration!

