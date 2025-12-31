# How to Find Your Supabase URL and API Key

## Step-by-Step Guide

### 1. Log in to Supabase
- Go to [https://supabase.com](https://supabase.com)
- Click **Sign In** (or **Log In**)
- Enter your credentials

### 2. Select Your Project
- After logging in, you'll see your projects dashboard
- Click on the project you want to use

### 3. Go to Settings → API
- In your project dashboard, click on the **Settings** icon (gear icon) in the left sidebar
- Click on **API** from the settings menu

### 4. Find Your Credentials
You'll see several sections. Here's what you need:

#### **Project URL** (Your SUPABASE_URL)
- Look for the **Project URL** section
- Copy the URL (looks like: `https://xxxxxxxxxxxxx.supabase.co`)
- This is your `SUPABASE_URL`

#### **Project API keys** (Your SUPABASE_ANON_KEY)
- Look for the **Project API keys** section
- Find the **anon public** key (it's the first one, labeled "public" or "anon")
- Click the **Copy** button or select and copy the key
- This is your `SUPABASE_ANON_KEY`

### What Each Key Is Used For:

- **anon/public key**: Use this for client-side and server-side operations (safe to expose in client code)
- **service_role key**: More powerful, only use server-side and keep it secret (not needed for basic setup)

## Quick Visual Guide

```
Supabase Dashboard
├── Settings (gear icon)
    └── API
        ├── Project URL: https://xxxxx.supabase.co  ← Copy this
        └── Project API keys
            ├── anon public: eyJhbGc...  ← Copy this one
            └── service_role: eyJhbGc... (don't use unless needed)
```

## Alternative: Check Your Existing Code

If you've used Supabase before in this project, you might already have the keys somewhere:

1. Check other `.env` files in your project
2. Check your Supabase project settings
3. If you have other projects using Supabase, check their configuration

## Add to Your .env File

Once you have both values, add them to `backend/.env`:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Important:** 
- Replace the actual values with your real URL and key
- Don't commit the `.env` file to git (it should already be in `.gitignore`)
- Keep your keys secure!








