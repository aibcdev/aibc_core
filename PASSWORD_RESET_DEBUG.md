# Password Reset Debugging Guide

## Current Issue
Password reset "acts like it's accepted but no email comes through"

## What to Check

### 1. Browser Console (Most Important)
1. Open your site → Press **F12** → **Console** tab
2. Click "Forgot password?" → Enter email → Submit
3. Look for these logs:
   - `🔐 Requesting password reset via Supabase for: [email]`
   - `🔐 Redirect URL: [url]`
   - `🔐 Supabase password reset response: ...`
   - `✅ Password reset email sent successfully` OR `❌ Error: ...`

**What to look for:**
- If you see `✅` → Supabase accepted the request, check email/spam
- If you see `❌` → There's an error, check the error message
- If you see `rate limit` → Wait 10-15 minutes and try again
- If you see `not confirmed` → User needs to confirm email first

### 2. Supabase Dashboard - Auth Logs
1. Go to **Supabase Dashboard** → **Logs** → **Auth Logs**
2. Look for password reset requests
3. Check for errors like:
   - `user_recovery_denied`
   - `email_rate_limit_exceeded`
   - `email_not_confirmed`

### 3. Supabase Email Template
1. Go to **Authentication** → **Email Templates**
2. Click **"Reset password"**
3. Make sure:
   - Template is **enabled/active**
   - Template has `{{ .ConfirmationURL }}` in it
   - Template looks correct

### 4. Supabase URL Configuration
1. Go to **Authentication** → **URL Configuration**
2. **Site URL:** Should be `https://aibcmedia.com`
3. **Redirect URLs** must include:
   ```
   https://aibcmedia.com
   https://www.aibcmedia.com
   https://aibcmedia.com#reset-password
   ```

### 5. Check Email
- Check **spam/junk folder**
- Wait **2-3 minutes** (emails can be delayed)
- Try a **different email address** (Gmail, Outlook, etc.)
- Check if email domain is blocked

### 6. Supabase Email Service Status
1. Go to **Authentication** → **Email** → **SMTP Settings**
2. Check if built-in service is working
3. If you see "Set up custom SMTP" warning, that's OK - built-in still works
4. Built-in service has rate limits (free tier)

## Common Errors & Fixes

### Error: "rate limit exceeded"
**Fix:** Wait 10-15 minutes, then try again

### Error: "email not confirmed"
**Fix:** User needs to confirm their email first (check sign-up email)

### Error: "user not found"
**Fix:** Email doesn't exist in Supabase. User needs to sign up first.

### No error, but no email
**Possible causes:**
1. **Rate limiting** - Wait 15 minutes
2. **Email in spam** - Check spam folder
3. **Email template disabled** - Enable in Supabase
4. **Redirect URL mismatch** - Check Supabase URL config
5. **Built-in email service issue** - Set up custom SMTP

## Quick Test

1. **Open browser console (F12)**
2. **Request password reset**
3. **Check console for logs:**
   ```javascript
   // Should see:
   🔐 Requesting password reset via Supabase for: [email]
   🔐 Redirect URL: https://aibcmedia.com#reset-password
   🔐 Supabase password reset response: { hasData: true, error: null }
   ✅ Password reset email sent successfully via Supabase
   ```

4. **If you see errors:**
   - Copy the error message
   - Check Supabase Auth Logs
   - Check email template settings

## Next Steps

After checking all the above:
1. **Share the browser console logs** (what you see when requesting reset)
2. **Share Supabase Auth Logs** (any errors there)
3. **Check if email template is enabled**
4. **Verify redirect URLs are set correctly**

The new logging will show exactly what's happening!


## Current Issue
Password reset "acts like it's accepted but no email comes through"

## What to Check

### 1. Browser Console (Most Important)
1. Open your site → Press **F12** → **Console** tab
2. Click "Forgot password?" → Enter email → Submit
3. Look for these logs:
   - `🔐 Requesting password reset via Supabase for: [email]`
   - `🔐 Redirect URL: [url]`
   - `🔐 Supabase password reset response: ...`
   - `✅ Password reset email sent successfully` OR `❌ Error: ...`

**What to look for:**
- If you see `✅` → Supabase accepted the request, check email/spam
- If you see `❌` → There's an error, check the error message
- If you see `rate limit` → Wait 10-15 minutes and try again
- If you see `not confirmed` → User needs to confirm email first

### 2. Supabase Dashboard - Auth Logs
1. Go to **Supabase Dashboard** → **Logs** → **Auth Logs**
2. Look for password reset requests
3. Check for errors like:
   - `user_recovery_denied`
   - `email_rate_limit_exceeded`
   - `email_not_confirmed`

### 3. Supabase Email Template
1. Go to **Authentication** → **Email Templates**
2. Click **"Reset password"**
3. Make sure:
   - Template is **enabled/active**
   - Template has `{{ .ConfirmationURL }}` in it
   - Template looks correct

### 4. Supabase URL Configuration
1. Go to **Authentication** → **URL Configuration**
2. **Site URL:** Should be `https://aibcmedia.com`
3. **Redirect URLs** must include:
   ```
   https://aibcmedia.com
   https://www.aibcmedia.com
   https://aibcmedia.com#reset-password
   ```

### 5. Check Email
- Check **spam/junk folder**
- Wait **2-3 minutes** (emails can be delayed)
- Try a **different email address** (Gmail, Outlook, etc.)
- Check if email domain is blocked

### 6. Supabase Email Service Status
1. Go to **Authentication** → **Email** → **SMTP Settings**
2. Check if built-in service is working
3. If you see "Set up custom SMTP" warning, that's OK - built-in still works
4. Built-in service has rate limits (free tier)

## Common Errors & Fixes

### Error: "rate limit exceeded"
**Fix:** Wait 10-15 minutes, then try again

### Error: "email not confirmed"
**Fix:** User needs to confirm their email first (check sign-up email)

### Error: "user not found"
**Fix:** Email doesn't exist in Supabase. User needs to sign up first.

### No error, but no email
**Possible causes:**
1. **Rate limiting** - Wait 15 minutes
2. **Email in spam** - Check spam folder
3. **Email template disabled** - Enable in Supabase
4. **Redirect URL mismatch** - Check Supabase URL config
5. **Built-in email service issue** - Set up custom SMTP

## Quick Test

1. **Open browser console (F12)**
2. **Request password reset**
3. **Check console for logs:**
   ```javascript
   // Should see:
   🔐 Requesting password reset via Supabase for: [email]
   🔐 Redirect URL: https://aibcmedia.com#reset-password
   🔐 Supabase password reset response: { hasData: true, error: null }
   ✅ Password reset email sent successfully via Supabase
   ```

4. **If you see errors:**
   - Copy the error message
   - Check Supabase Auth Logs
   - Check email template settings

## Next Steps

After checking all the above:
1. **Share the browser console logs** (what you see when requesting reset)
2. **Share Supabase Auth Logs** (any errors there)
3. **Check if email template is enabled**
4. **Verify redirect URLs are set correctly**

The new logging will show exactly what's happening!



