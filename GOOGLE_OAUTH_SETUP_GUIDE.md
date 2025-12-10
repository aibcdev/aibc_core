# Google OAuth Setup Guide

## Current Status Check

To verify if Google sign-in is set up correctly, you need:

### ✅ Frontend Configuration
**Environment Variable:** `VITE_GOOGLE_CLIENT_ID`

**Where to set:**
- **Local development:** Add to `.env` file in root directory
- **Netlify (Production):** 
  1. Go to Netlify Dashboard → Your Site → Site Settings → Environment Variables
  2. Add: `VITE_GOOGLE_CLIENT_ID` = `your_client_id_here`
  3. Redeploy site

### ✅ Backend Configuration
**Environment Variable:** `GOOGLE_CLIENT_ID`

**Where to set:**
- **Local development:** Add to `backend/.env` file
- **Google Cloud Run (Production):**
  1. Go to Cloud Run Console → Your Service → Edit & Deploy New Revision
  2. Go to "Variables & Secrets" tab
  3. Add environment variable: `GOOGLE_CLIENT_ID` = `your_client_id_here`
  4. Deploy

## How to Get Google Client ID

### Step 1: Create OAuth 2.0 Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create a new one)
3. Navigate to **APIs & Services** → **Credentials**
4. Click **+ CREATE CREDENTIALS** → **OAuth client ID**

### Step 2: Configure OAuth Consent Screen (First Time Only)

1. If prompted, configure the OAuth consent screen:
   - User Type: **External** (for public use)
   - App name: **AIBC**
   - User support email: Your email
   - Developer contact: Your email
   - Click **Save and Continue**
   - Add scopes: `email`, `profile`, `openid`
   - Add test users (optional for development)
   - Click **Save and Continue**

### Step 3: Create OAuth Client ID

1. Application type: **Web application**
2. Name: **AIBC Web Client**
3. **Authorized JavaScript origins:**
   ```
   http://localhost:5173
   https://aibcmedia.com
   https://www.aibcmedia.com
   ```
4. **Authorized redirect URIs:**
   ```
   http://localhost:5173
   https://aibcmedia.com
   https://www.aibcmedia.com
   ```
5. Click **Create**
6. **Copy the Client ID** (you'll need this)

### Step 4: Set Environment Variables

**Frontend (.env or Netlify):**
```env
VITE_GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
```

**Backend (backend/.env or Cloud Run):**
```env
GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
```

**Important:** Use the SAME Client ID for both frontend and backend!

## Verification

### Check Frontend
1. Open browser console on your site
2. Look for: `VITE_GOOGLE_CLIENT_ID not set` warning
3. If you see it, the variable is not set correctly

### Check Backend
1. Check backend logs when Google sign-in is attempted
2. Look for: `Google OAuth not configured` error
3. If you see it, the backend variable is not set

### Test Google Sign-In
1. Go to login/signup page
2. Click "Continue with Google"
3. Should open Google sign-in popup
4. After signing in, should redirect to dashboard

## Troubleshooting

### Error: "Please configure VITE_GOOGLE_CLIENT_ID"
- **Solution:** Set `VITE_GOOGLE_CLIENT_ID` in Netlify environment variables and redeploy

### Error: "Google OAuth not configured"
- **Solution:** Set `GOOGLE_CLIENT_ID` in Cloud Run environment variables

### Error: "redirect_uri_mismatch"
- **Solution:** Add your exact domain to "Authorized redirect URIs" in Google Console

### Google Button Not Appearing
- Check browser console for errors
- Verify Google script is loading: `https://accounts.google.com/gsi/client`
- Check if `VITE_GOOGLE_CLIENT_ID` is set correctly

## Quick Setup Checklist

- [ ] Created Google Cloud Project
- [ ] Configured OAuth Consent Screen
- [ ] Created OAuth 2.0 Client ID (Web application)
- [ ] Added authorized origins (localhost + production domain)
- [ ] Added authorized redirect URIs
- [ ] Set `VITE_GOOGLE_CLIENT_ID` in Netlify
- [ ] Set `GOOGLE_CLIENT_ID` in Cloud Run
- [ ] Redeployed frontend (Netlify)
- [ ] Redeployed backend (Cloud Run)
- [ ] Tested Google sign-in

## Security Notes

- ✅ Never commit `.env` files to git
- ✅ Use the same Client ID for frontend and backend
- ✅ Only add trusted domains to authorized origins
- ✅ Keep your Client ID secret (don't expose in client-side code comments)


## Current Status Check

To verify if Google sign-in is set up correctly, you need:

### ✅ Frontend Configuration
**Environment Variable:** `VITE_GOOGLE_CLIENT_ID`

**Where to set:**
- **Local development:** Add to `.env` file in root directory
- **Netlify (Production):** 
  1. Go to Netlify Dashboard → Your Site → Site Settings → Environment Variables
  2. Add: `VITE_GOOGLE_CLIENT_ID` = `your_client_id_here`
  3. Redeploy site

### ✅ Backend Configuration
**Environment Variable:** `GOOGLE_CLIENT_ID`

**Where to set:**
- **Local development:** Add to `backend/.env` file
- **Google Cloud Run (Production):**
  1. Go to Cloud Run Console → Your Service → Edit & Deploy New Revision
  2. Go to "Variables & Secrets" tab
  3. Add environment variable: `GOOGLE_CLIENT_ID` = `your_client_id_here`
  4. Deploy

## How to Get Google Client ID

### Step 1: Create OAuth 2.0 Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create a new one)
3. Navigate to **APIs & Services** → **Credentials**
4. Click **+ CREATE CREDENTIALS** → **OAuth client ID**

### Step 2: Configure OAuth Consent Screen (First Time Only)

1. If prompted, configure the OAuth consent screen:
   - User Type: **External** (for public use)
   - App name: **AIBC**
   - User support email: Your email
   - Developer contact: Your email
   - Click **Save and Continue**
   - Add scopes: `email`, `profile`, `openid`
   - Add test users (optional for development)
   - Click **Save and Continue**

### Step 3: Create OAuth Client ID

1. Application type: **Web application**
2. Name: **AIBC Web Client**
3. **Authorized JavaScript origins:**
   ```
   http://localhost:5173
   https://aibcmedia.com
   https://www.aibcmedia.com
   ```
4. **Authorized redirect URIs:**
   ```
   http://localhost:5173
   https://aibcmedia.com
   https://www.aibcmedia.com
   ```
5. Click **Create**
6. **Copy the Client ID** (you'll need this)

### Step 4: Set Environment Variables

**Frontend (.env or Netlify):**
```env
VITE_GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
```

**Backend (backend/.env or Cloud Run):**
```env
GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
```

**Important:** Use the SAME Client ID for both frontend and backend!

## Verification

### Check Frontend
1. Open browser console on your site
2. Look for: `VITE_GOOGLE_CLIENT_ID not set` warning
3. If you see it, the variable is not set correctly

### Check Backend
1. Check backend logs when Google sign-in is attempted
2. Look for: `Google OAuth not configured` error
3. If you see it, the backend variable is not set

### Test Google Sign-In
1. Go to login/signup page
2. Click "Continue with Google"
3. Should open Google sign-in popup
4. After signing in, should redirect to dashboard

## Troubleshooting

### Error: "Please configure VITE_GOOGLE_CLIENT_ID"
- **Solution:** Set `VITE_GOOGLE_CLIENT_ID` in Netlify environment variables and redeploy

### Error: "Google OAuth not configured"
- **Solution:** Set `GOOGLE_CLIENT_ID` in Cloud Run environment variables

### Error: "redirect_uri_mismatch"
- **Solution:** Add your exact domain to "Authorized redirect URIs" in Google Console

### Google Button Not Appearing
- Check browser console for errors
- Verify Google script is loading: `https://accounts.google.com/gsi/client`
- Check if `VITE_GOOGLE_CLIENT_ID` is set correctly

## Quick Setup Checklist

- [ ] Created Google Cloud Project
- [ ] Configured OAuth Consent Screen
- [ ] Created OAuth 2.0 Client ID (Web application)
- [ ] Added authorized origins (localhost + production domain)
- [ ] Added authorized redirect URIs
- [ ] Set `VITE_GOOGLE_CLIENT_ID` in Netlify
- [ ] Set `GOOGLE_CLIENT_ID` in Cloud Run
- [ ] Redeployed frontend (Netlify)
- [ ] Redeployed backend (Cloud Run)
- [ ] Tested Google sign-in

## Security Notes

- ✅ Never commit `.env` files to git
- ✅ Use the same Client ID for frontend and backend
- ✅ Only add trusted domains to authorized origins
- ✅ Keep your Client ID secret (don't expose in client-side code comments)


