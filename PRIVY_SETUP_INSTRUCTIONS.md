# Privy Setup Instructions

## Step 1: Create a Privy Account

1. Go to https://dashboard.privy.io
2. Click "Sign Up" or "Get Started"
3. Sign up with your email or Google account

## Step 2: Create a New App

1. Once logged in, click "Create App" or "New App"
2. Fill in the app details:
   - **App Name**: AIBC (or your preferred name)
   - **Environment**: Development (you can add Production later)
3. Click "Create"

## Step 3: Get Your App ID

1. After creating the app, you'll be taken to the app dashboard
2. Look for "App ID" or "Application ID" - it will look something like: `clxxxxxxxxxxxxxxxxxxxxx`
3. Copy this App ID

## Step 4: Configure Login Methods

1. In your Privy dashboard, go to **Settings** → **Login Methods**
2. Enable the following login methods:
   - ✅ **Email** (Email/Password)
   - ✅ **Google** (OAuth)
   - ✅ **Apple** (optional)
   - ✅ **Twitter** (optional)
   - ✅ **Discord** (optional)
   - ✅ **GitHub** (optional)

## Step 5: Configure Google OAuth (Required for Google Sign-In)

1. In Privy dashboard, go to **Settings** → **OAuth Providers**
2. Click on **Google**
3. You'll need to:
   - Create a Google Cloud Project (if you don't have one)
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URIs from Privy
4. Follow Privy's step-by-step guide for Google OAuth setup
5. Copy the **Client ID** and **Client Secret** into Privy

## Step 6: Add Environment Variable

1. In your project root, create or edit `.env` file
2. Add your Privy App ID:
   ```
   VITE_PRIVY_APP_ID=clxxxxxxxxxxxxxxxxxxxxx
   ```
   (Replace with your actual App ID from Step 3)

## Step 7: Configure Redirect URLs

1. In Privy dashboard, go to **Settings** → **Redirect URLs**
2. Add your app URLs:
   - Development: `http://localhost:5173`
   - Production: `https://yourdomain.com`
   - Password Reset: `https://yourdomain.com#reset-password`

## Step 8: Test the Integration

1. Start your development server: `npm run dev`
2. Navigate to the sign-up page
3. Try:
   - Email sign-up
   - Google sign-in
   - Forgot password

## Troubleshooting

### Google Sign-In Not Working
- Make sure Google OAuth is properly configured in Privy
- Check that redirect URIs match exactly
- Verify Google Cloud credentials are correct

### Email Not Sending
- Check Privy dashboard → Settings → Email Configuration
- Verify your email domain is verified (if required)
- Check spam folder

### App ID Not Found
- Make sure `VITE_PRIVY_APP_ID` is in your `.env` file
- Restart your dev server after adding the env variable
- Check that the App ID is correct (starts with `cl`)

## Additional Resources

- Privy Documentation: https://docs.privy.io
- Privy Dashboard: https://dashboard.privy.io
- Support: https://help.privy.com

