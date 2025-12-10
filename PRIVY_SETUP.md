# Privy Setup Instructions

## Step 1: Create a Privy Account

1. Go to https://dashboard.privy.io
2. Click "Sign Up" or "Get Started"
3. Sign up with your email or Google account

## Step 2: Create a New App

1. Once logged in, click "Create App" or "New App"
2. Enter your app name (e.g., "AIBC")
3. Select your environment (Development or Production)

## Step 3: Get Your App ID

1. After creating the app, you'll be taken to the app dashboard
2. Look for "App ID" or "Application ID" in the dashboard
3. Copy the App ID (it will look like: `clxxxxxxxxxxxxxxxxxxxxx`)

## Step 4: Configure Login Methods

1. In your Privy dashboard, go to "Settings" or "Configuration"
2. Under "Login Methods", enable:
   - ✅ Email/Password
   - ✅ Google OAuth
3. For Google OAuth, you may need to:
   - Add your Google OAuth credentials (Client ID and Client Secret)
   - Set up redirect URLs

## Step 5: Add App ID to Your Project

1. Create or edit `.env` file in the root of your project
2. Add the following line:
   ```
   VITE_PRIVY_APP_ID=your_app_id_here
   ```
3. Replace `your_app_id_here` with the App ID you copied in Step 3

## Step 6: Configure Redirect URLs

1. In Privy dashboard, go to "Settings" → "Redirect URLs"
2. Add your app URLs:
   - Development: `http://localhost:5173`
   - Production: `https://yourdomain.com`
   - For password reset: `https://yourdomain.com#reset-password`

## Step 7: Test the Integration

1. Start your development server: `npm run dev`
2. Try signing up with email
3. Try signing in with Google
4. Try the forgot password flow

## Troubleshooting

- **Functions not available**: Make sure `VITE_PRIVY_APP_ID` is set in your `.env` file
- **Google sign-in not working**: Check that Google OAuth is enabled in Privy dashboard
- **Password reset emails not sending**: Verify email settings in Privy dashboard and check spam folder
- **Build errors**: Make sure the App ID is correctly set in your environment variables

## Additional Resources

- Privy Documentation: https://docs.privy.io
- Privy Dashboard: https://dashboard.privy.io
- Support: https://help.privy.com

