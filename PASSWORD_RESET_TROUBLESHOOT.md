# Password Reset Troubleshooting Guide

## If Password Reset Emails Aren't Coming Through

### Step 1: Verify Supabase Configuration

1. **Check Environment Variables in Netlify:**
   - Go to Netlify Dashboard → Your Site → Site Settings → Environment Variables
   - Verify both are set:
     - `VITE_SUPABASE_URL` = `https://xxxxx.supabase.co`
     - `VITE_SUPABASE_ANON_KEY` = `eyJhbGci...`

2. **Check Browser Console:**
   - Open your site → Press F12 → Console tab
   - Look for: "Supabase credentials not configured" warning
   - If you see it, environment variables aren't set correctly

### Step 2: Verify Supabase Email Settings

1. **Go to Supabase Dashboard:**
   - Authentication → Email Templates
   - Make sure "Reset password" is enabled (click on it to see template)

2. **Check Email Service:**
   - Supabase has a **built-in email service** that works without SMTP setup
   - Go to Authentication → Email → SMTP Settings
   - If you see "Set up custom SMTP" warning, that's OK - built-in service still works
   - Built-in service has rate limits but works for testing/production
   - Custom SMTP (SendGrid) is optional for higher volume

### Step 3: Check Supabase Logs

1. **Go to Supabase Dashboard:**
   - Logs → Auth Logs
   - Look for password reset requests
   - Check for any errors

### Step 4: Verify Redirect URL

1. **In Supabase Dashboard:**
   - Authentication → URL Configuration
   - **Redirect URLs** must include:
     ```
     https://aibcmedia.com
     https://www.aibcmedia.com
     ```
   - **Site URL** should be: `https://aibcmedia.com`

### Step 5: Test Password Reset

1. **Open Browser Console (F12)**
2. **Go to sign-in page → Click "Forgot password?"**
3. **Enter your email**
4. **Check console for:**
   - "Requesting password reset via Supabase for: [email]"
   - "Password reset email sent successfully via Supabase"
   - Any error messages

### Common Issues

#### Issue: "Supabase credentials not configured"
**Solution:** Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Netlify and redeploy

#### Issue: Email not received
**Possible causes:**
- SMTP not configured in Supabase
- Email in spam folder
- Rate limiting (too many requests)
- Email address doesn't exist in Supabase

**Solutions:**
1. Check spam folder
2. Verify SMTP settings in Supabase
3. Wait 5 minutes and try again
4. Check Supabase Auth logs for errors

#### Issue: "Invalid redirect URL"
**Solution:** Add your domain to Supabase Redirect URLs:
- Go to Authentication → URL Configuration
- Add: `https://aibcmedia.com` and `https://www.aibcmedia.com`

#### Issue: Reset link doesn't work
**Solution:** 
- Links expire after 1 hour
- Request a new password reset
- Make sure redirect URL is set correctly in Supabase

### Debug Steps

1. **Check if Supabase is configured:**
   ```javascript
   // In browser console on your site
   console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
   console.log('Supabase Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Missing');
   ```

2. **Check Supabase Auth logs:**
   - Supabase Dashboard → Logs → Auth
   - Look for password reset requests
   - Check timestamps and errors

3. **Test SMTP directly:**
   - Supabase Dashboard → Authentication → Email
   - Try sending a test email if available

### Still Not Working?

1. **Verify SMTP credentials are correct** (SendGrid API key, etc.)
2. **Check Supabase project status** (not paused/suspended)
3. **Verify email domain** is not blocked
4. **Check rate limits** - Supabase has limits on free tier
5. **Contact Supabase support** if all else fails

