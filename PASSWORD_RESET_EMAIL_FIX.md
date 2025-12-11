# Password Reset Email Not Coming Through - Fix Guide

## What We Know

✅ **Supabase is receiving requests** - Logs show `/recover | request completed`  
✅ **URL Configuration is correct** - Redirect URLs are set  
✅ **Code is working** - Password reset function is being called  

## Why Emails Might Not Be Sent

### 1. Email Template Issue
**Check:** Supabase Dashboard → Authentication → Email Templates → "Reset password"
- Make sure the template is **enabled/active**
- Click on it to see the template editor
- The template should have `{{ .ConfirmationURL }}` in it

### 2. Built-in Email Service Rate Limits
Supabase's built-in email service has **strict rate limits**:
- Free tier: Very limited emails per hour
- If you've sent multiple password resets, you might be rate-limited
- **Solution:** Wait 10-15 minutes and try again

### 3. Email Going to Spam
- Check spam/junk folder
- Built-in service emails often go to spam
- Try a different email address (Gmail, Outlook, etc.)

### 4. Email Address Not in Supabase
- The email must exist in Supabase Auth
- If user signed up via email, they should exist
- Check: Supabase Dashboard → Authentication → Users

### 5. SMTP Not Configured (Optional)
- Built-in service works but has limits
- For production, set up custom SMTP (SendGrid recommended)
- Go to: Authentication → Email → SMTP Settings

## Debug Steps

### Step 1: Check Supabase Auth Logs
1. Go to Supabase Dashboard → **Logs → Auth Logs**
2. Look for your password reset request
3. Check for any error messages
4. Look for `user_recovery_denied` or similar errors

### Step 2: Check Browser Console
1. Open your site → Press F12 → Console tab
2. Request password reset
3. Look for:
   - "Requesting password reset via Supabase for: [email]"
   - "Supabase password reset response: ..."
   - Any error messages

### Step 3: Verify Email Template
1. Supabase Dashboard → Authentication → Email Templates
2. Click "Reset password"
3. Make sure template is visible and has content
4. Check that `{{ .ConfirmationURL }}` is in the template

### Step 4: Test with Different Email
- Try a Gmail address
- Try an Outlook address
- Check both inbox and spam

### Step 5: Check Rate Limits
- Wait 15 minutes
- Try password reset again
- Check if email arrives

## Quick Fix: Set Up Custom SMTP (Recommended)

If built-in service isn't working, set up SendGrid:

1. **Create SendGrid account** (free tier: 100 emails/day)
2. **Create API key** in SendGrid
3. **In Supabase:**
   - Authentication → Email → SMTP Settings
   - Host: `smtp.sendgrid.net`
   - Port: `587`
   - Username: `apikey`
   - Password: `[Your SendGrid API Key]`
4. **Save** and test password reset

## What to Check Right Now

1. ✅ **Supabase Auth Logs** - See if there are errors
2. ✅ **Email Template** - Make sure "Reset password" is enabled
3. ✅ **Browser Console** - Check for any errors
4. ✅ **Spam Folder** - Check if email went there
5. ✅ **Wait 15 minutes** - In case of rate limiting

The fact that logs show `/recover | request completed` means Supabase is receiving the request. The issue is likely email delivery (rate limits, spam, or template configuration).


## What We Know

✅ **Supabase is receiving requests** - Logs show `/recover | request completed`  
✅ **URL Configuration is correct** - Redirect URLs are set  
✅ **Code is working** - Password reset function is being called  

## Why Emails Might Not Be Sent

### 1. Email Template Issue
**Check:** Supabase Dashboard → Authentication → Email Templates → "Reset password"
- Make sure the template is **enabled/active**
- Click on it to see the template editor
- The template should have `{{ .ConfirmationURL }}` in it

### 2. Built-in Email Service Rate Limits
Supabase's built-in email service has **strict rate limits**:
- Free tier: Very limited emails per hour
- If you've sent multiple password resets, you might be rate-limited
- **Solution:** Wait 10-15 minutes and try again

### 3. Email Going to Spam
- Check spam/junk folder
- Built-in service emails often go to spam
- Try a different email address (Gmail, Outlook, etc.)

### 4. Email Address Not in Supabase
- The email must exist in Supabase Auth
- If user signed up via email, they should exist
- Check: Supabase Dashboard → Authentication → Users

### 5. SMTP Not Configured (Optional)
- Built-in service works but has limits
- For production, set up custom SMTP (SendGrid recommended)
- Go to: Authentication → Email → SMTP Settings

## Debug Steps

### Step 1: Check Supabase Auth Logs
1. Go to Supabase Dashboard → **Logs → Auth Logs**
2. Look for your password reset request
3. Check for any error messages
4. Look for `user_recovery_denied` or similar errors

### Step 2: Check Browser Console
1. Open your site → Press F12 → Console tab
2. Request password reset
3. Look for:
   - "Requesting password reset via Supabase for: [email]"
   - "Supabase password reset response: ..."
   - Any error messages

### Step 3: Verify Email Template
1. Supabase Dashboard → Authentication → Email Templates
2. Click "Reset password"
3. Make sure template is visible and has content
4. Check that `{{ .ConfirmationURL }}` is in the template

### Step 4: Test with Different Email
- Try a Gmail address
- Try an Outlook address
- Check both inbox and spam

### Step 5: Check Rate Limits
- Wait 15 minutes
- Try password reset again
- Check if email arrives

## Quick Fix: Set Up Custom SMTP (Recommended)

If built-in service isn't working, set up SendGrid:

1. **Create SendGrid account** (free tier: 100 emails/day)
2. **Create API key** in SendGrid
3. **In Supabase:**
   - Authentication → Email → SMTP Settings
   - Host: `smtp.sendgrid.net`
   - Port: `587`
   - Username: `apikey`
   - Password: `[Your SendGrid API Key]`
4. **Save** and test password reset

## What to Check Right Now

1. ✅ **Supabase Auth Logs** - See if there are errors
2. ✅ **Email Template** - Make sure "Reset password" is enabled
3. ✅ **Browser Console** - Check for any errors
4. ✅ **Spam Folder** - Check if email went there
5. ✅ **Wait 15 minutes** - In case of rate limiting

The fact that logs show `/recover | request completed` means Supabase is receiving the request. The issue is likely email delivery (rate limits, spam, or template configuration).



