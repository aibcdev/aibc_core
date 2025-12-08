# How to Get Google OAuth Client ID and Secret

## Step-by-Step Guide

### Step 1: Go to Google Cloud Console

1. Open https://console.cloud.google.com/
2. Sign in with your Google account
3. Select your project (or create a new one)

### Step 2: Enable Google+ API (if needed)

1. Go to **APIs & Services** → **Library**
2. Search for "Google+ API" or "People API"
3. Click **Enable** (if not already enabled)

### Step 3: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** at the top
3. Select **OAuth client ID**

### Step 4: Configure OAuth Consent Screen (First Time Only)

If this is your first time, you'll be asked to configure the consent screen:

1. **User Type:** Select **External** (for public use)
2. Click **Create**
3. Fill in the required fields:
   - **App name:** AIBC
   - **User support email:** Your email
   - **Developer contact information:** Your email
4. Click **Save and Continue**
5. **Scopes:** Click **Add or Remove Scopes**
   - Select: `email`, `profile`, `openid`
   - Click **Update**
   - Click **Save and Continue**
6. **Test users:** (Optional for development)
   - Add your email if testing
   - Click **Save and Continue**
7. **Summary:** Click **Back to Dashboard**

### Step 5: Create OAuth Client ID

1. **Application type:** Select **Web application**
2. **Name:** Enter "AIBC Web Client" (or any name)
3. **Authorized JavaScript origins:**
   ```
   https://aibcmedia.com
   https://www.aibcmedia.com
   http://localhost:5173
   https://[your-supabase-project].supabase.co
   ```
   (Add each URL on a new line or click + to add multiple)

4. **Authorized redirect URIs:**
   ```
   https://aibcmedia.com
   https://www.aibcmedia.com
   http://localhost:5173
   https://[your-supabase-project].supabase.co/
   
   ```
   (The Supabase callback URL is important!)

5. Click **Create**

### Step 6: Copy Your Credentials

After creating, you'll see a popup with:
- **Your Client ID** (looks like: `123456789-abc123def456.apps.googleusercontent.com`)
- **Your Client Secret** (looks like: `GOCSPX-abc123def456...`)

**IMPORTANT:** Copy both immediately - you won't be able to see the secret again!

### Step 7: Add to Supabase

1. Go to **Supabase Dashboard**
2. Navigate to **Authentication** → **Providers**
3. Find **Google** in the list
4. Click to enable/configure it
5. Enter:
   - **Client ID (for OAuth):** Paste your Google Client ID
   - **Client Secret (for OAuth):** Paste your Google Client Secret
6. Click **Save**

### Step 8: Update Supabase Redirect URLs

1. In Supabase, go to **Authentication** → **URL Configuration**
2. Make sure **Redirect URLs** includes:
   ```
   https://aibcmedia.com
   https://www.aibcmedia.com
   https://[your-supabase-project].supabase.co/auth/v1/callback
   ```

## Quick Reference

### Where to Find Your Credentials Later

If you need to see them again:
1. Google Cloud Console → **APIs & Services** → **Credentials**
2. Click on your OAuth 2.0 Client ID
3. You'll see the **Client ID** (but not the secret)
4. To see the secret again, you'll need to create a new one or reset it

### Important Notes

- **Client ID:** Public - safe to expose in frontend code
- **Client Secret:** Private - only use in Supabase (backend)
- **Redirect URIs:** Must match exactly (including `https://` vs `http://`)
- **Supabase Callback:** Must include `https://[project].supabase.co/auth/v1/callback`

## Troubleshooting

### "redirect_uri_mismatch" Error
- Check that redirect URIs in Google Console match exactly
- Make sure Supabase callback URL is included

### "Invalid client" Error
- Verify Client ID and Secret are correct in Supabase
- Check for extra spaces when copying

### Google Sign-In Not Working
- Verify Google provider is enabled in Supabase
- Check that OAuth consent screen is published (or add test users)
- Make sure redirect URLs are set correctly

## Security Best Practices

✅ **DO:**
- Keep Client Secret in Supabase (never in frontend code)
- Use different credentials for development and production
- Regularly rotate secrets

❌ **DON'T:**
- Commit Client Secret to git
- Share Client Secret publicly
- Use production credentials in development

