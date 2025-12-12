# Google OAuth Test Checklist

## Pre-Test Verification

Before testing, verify these are set up:

### ✅ Supabase Configuration
- [ ] `VITE_SUPABASE_URL` is set in Netlify environment variables
- [ ] `VITE_SUPABASE_ANON_KEY` is set in Netlify environment variables
- [ ] Supabase project is active and not paused

### ✅ Google OAuth Configuration
- [ ] Google OAuth Client ID created in Google Cloud Console
- [ ] Google OAuth Client Secret created in Google Cloud Console
- [ ] OAuth consent screen configured (External, with email/profile scopes)
- [ ] Authorized redirect URIs include:
  - `https://aibcmedia.com`
  - `https://www.aibcmedia.com`
  - `https://[your-supabase-project].supabase.co/auth/v1/callback`

### ✅ Supabase Provider Setup
- [ ] Go to Supabase Dashboard → Authentication → Providers
- [ ] Google provider is **enabled**
- [ ] Client ID (for OAuth) is entered
- [ ] Client Secret (for OAuth) is entered
- [ ] Clicked **Save**

### ✅ Supabase URL Configuration
- [ ] Go to Supabase Dashboard → Authentication → URL Configuration
- [ ] Site URL: `https://aibcmedia.com`
- [ ] Redirect URLs include:
  - `https://aibcmedia.com`
  - `https://www.aibcmedia.com`
  - `https://[your-supabase-project].supabase.co/auth/v1/callback`

## Test Steps

### Test 1: Sign Up with Google

1. **Go to:** `https://aibcmedia.com` (or your deployed site)
2. **Click:** "Get Started" or "Sign Up"
3. **Click:** "Continue with Google" button
4. **Expected:** 
   - Button shows "Signing in..." briefly
   - Redirects to Google sign-in page
   - After signing in, redirects back to your site
   - User is logged in and sees dashboard/ingestion page

**If it fails:**
- Check browser console (F12) for errors
- Verify Supabase credentials are set in Netlify
- Check Supabase Auth Logs for errors
- Verify redirect URIs match exactly

### Test 2: Sign In with Google (Existing User)

1. **Go to:** Sign-in page
2. **Click:** "Continue with Google" button
3. **Expected:**
   - Redirects to Google
   - After signing in, redirects back
   - User is logged in

**If it fails:**
- Same checks as Test 1
- Verify user exists in Supabase (Authentication → Users)

### Test 3: Check Browser Console

1. **Open:** Browser Developer Tools (F12)
2. **Go to:** Console tab
3. **Click:** "Continue with Google"
4. **Look for:**
   - "Signing in with Google via Supabase" (should appear)
   - Any error messages
   - Redirect happening

### Test 4: Check Supabase Logs

1. **Go to:** Supabase Dashboard → Logs → Auth Logs
2. **Click:** "Continue with Google" on your site
3. **Look for:**
   - OAuth request entries
   - Any error messages
   - Successful authentication entries

## Common Issues & Fixes

### Issue: "redirect_uri_mismatch"
**Fix:**
- Check Google Cloud Console → OAuth 2.0 Client → Authorized redirect URIs
- Must include: `https://[your-project].supabase.co/auth/v1/callback`
- URIs must match exactly (including https://)

### Issue: "Invalid client"
**Fix:**
- Verify Client ID and Secret in Supabase match Google Cloud Console
- Check for extra spaces when copying
- Make sure you're using the correct credentials

### Issue: Button doesn't redirect
**Fix:**
- Check browser console for errors
- Verify Supabase is configured (check environment variables)
- Make sure Google provider is enabled in Supabase

### Issue: Redirects but doesn't log in
**Fix:**
- Check App.tsx OAuth callback handling
- Verify Supabase session is being set
- Check browser console for errors after redirect

### Issue: "OAuth consent screen" error
**Fix:**
- Go to Google Cloud Console → OAuth consent screen
- Make sure it's configured (External user type)
- Add test users if in testing mode
- Publish the app if ready for production

## Success Criteria

✅ **Test passes if:**
- Clicking "Continue with Google" redirects to Google
- After Google sign-in, redirects back to your site
- User is logged in (sees dashboard/ingestion, not sign-in page)
- User data is stored in localStorage
- User appears in Supabase Authentication → Users

## Debug Commands

### Check Environment Variables (in browser console)
```javascript
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Supabase Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Missing');
```

### Check Supabase Connection
```javascript
// In browser console
import { supabase, isSupabaseConfigured } from './services/supabaseClient';
console.log('Supabase configured:', isSupabaseConfigured());
console.log('Supabase client:', supabase);
```

### Test OAuth Flow Manually
```javascript
// In browser console (on your site)
const { supabase } = await import('./services/supabaseClient');
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: window.location.origin,
  },
});
console.log('OAuth URL:', data.url);
console.log('Error:', error);
```

## Next Steps After Testing

If all tests pass:
- ✅ Google OAuth is working!
- ✅ Users can sign up/sign in with Google
- ✅ Authentication is handled by Supabase

If tests fail:
- Check the error messages
- Verify all configuration steps
- Check Supabase and Google Cloud Console logs
- Review browser console for detailed errors


## Pre-Test Verification

Before testing, verify these are set up:

### ✅ Supabase Configuration
- [ ] `VITE_SUPABASE_URL` is set in Netlify environment variables
- [ ] `VITE_SUPABASE_ANON_KEY` is set in Netlify environment variables
- [ ] Supabase project is active and not paused

### ✅ Google OAuth Configuration
- [ ] Google OAuth Client ID created in Google Cloud Console
- [ ] Google OAuth Client Secret created in Google Cloud Console
- [ ] OAuth consent screen configured (External, with email/profile scopes)
- [ ] Authorized redirect URIs include:
  - `https://aibcmedia.com`
  - `https://www.aibcmedia.com`
  - `https://[your-supabase-project].supabase.co/auth/v1/callback`

### ✅ Supabase Provider Setup
- [ ] Go to Supabase Dashboard → Authentication → Providers
- [ ] Google provider is **enabled**
- [ ] Client ID (for OAuth) is entered
- [ ] Client Secret (for OAuth) is entered
- [ ] Clicked **Save**

### ✅ Supabase URL Configuration
- [ ] Go to Supabase Dashboard → Authentication → URL Configuration
- [ ] Site URL: `https://aibcmedia.com`
- [ ] Redirect URLs include:
  - `https://aibcmedia.com`
  - `https://www.aibcmedia.com`
  - `https://[your-supabase-project].supabase.co/auth/v1/callback`

## Test Steps

### Test 1: Sign Up with Google

1. **Go to:** `https://aibcmedia.com` (or your deployed site)
2. **Click:** "Get Started" or "Sign Up"
3. **Click:** "Continue with Google" button
4. **Expected:** 
   - Button shows "Signing in..." briefly
   - Redirects to Google sign-in page
   - After signing in, redirects back to your site
   - User is logged in and sees dashboard/ingestion page

**If it fails:**
- Check browser console (F12) for errors
- Verify Supabase credentials are set in Netlify
- Check Supabase Auth Logs for errors
- Verify redirect URIs match exactly

### Test 2: Sign In with Google (Existing User)

1. **Go to:** Sign-in page
2. **Click:** "Continue with Google" button
3. **Expected:**
   - Redirects to Google
   - After signing in, redirects back
   - User is logged in

**If it fails:**
- Same checks as Test 1
- Verify user exists in Supabase (Authentication → Users)

### Test 3: Check Browser Console

1. **Open:** Browser Developer Tools (F12)
2. **Go to:** Console tab
3. **Click:** "Continue with Google"
4. **Look for:**
   - "Signing in with Google via Supabase" (should appear)
   - Any error messages
   - Redirect happening

### Test 4: Check Supabase Logs

1. **Go to:** Supabase Dashboard → Logs → Auth Logs
2. **Click:** "Continue with Google" on your site
3. **Look for:**
   - OAuth request entries
   - Any error messages
   - Successful authentication entries

## Common Issues & Fixes

### Issue: "redirect_uri_mismatch"
**Fix:**
- Check Google Cloud Console → OAuth 2.0 Client → Authorized redirect URIs
- Must include: `https://[your-project].supabase.co/auth/v1/callback`
- URIs must match exactly (including https://)

### Issue: "Invalid client"
**Fix:**
- Verify Client ID and Secret in Supabase match Google Cloud Console
- Check for extra spaces when copying
- Make sure you're using the correct credentials

### Issue: Button doesn't redirect
**Fix:**
- Check browser console for errors
- Verify Supabase is configured (check environment variables)
- Make sure Google provider is enabled in Supabase

### Issue: Redirects but doesn't log in
**Fix:**
- Check App.tsx OAuth callback handling
- Verify Supabase session is being set
- Check browser console for errors after redirect

### Issue: "OAuth consent screen" error
**Fix:**
- Go to Google Cloud Console → OAuth consent screen
- Make sure it's configured (External user type)
- Add test users if in testing mode
- Publish the app if ready for production

## Success Criteria

✅ **Test passes if:**
- Clicking "Continue with Google" redirects to Google
- After Google sign-in, redirects back to your site
- User is logged in (sees dashboard/ingestion, not sign-in page)
- User data is stored in localStorage
- User appears in Supabase Authentication → Users

## Debug Commands

### Check Environment Variables (in browser console)
```javascript
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Supabase Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Missing');
```

### Check Supabase Connection
```javascript
// In browser console
import { supabase, isSupabaseConfigured } from './services/supabaseClient';
console.log('Supabase configured:', isSupabaseConfigured());
console.log('Supabase client:', supabase);
```

### Test OAuth Flow Manually
```javascript
// In browser console (on your site)
const { supabase } = await import('./services/supabaseClient');
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: window.location.origin,
  },
});
console.log('OAuth URL:', data.url);
console.log('Error:', error);
```

## Next Steps After Testing

If all tests pass:
- ✅ Google OAuth is working!
- ✅ Users can sign up/sign in with Google
- ✅ Authentication is handled by Supabase

If tests fail:
- Check the error messages
- Verify all configuration steps
- Check Supabase and Google Cloud Console logs
- Review browser console for detailed errors




