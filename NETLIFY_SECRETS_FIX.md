# Netlify Secrets Scanner Fix

## Problem

Netlify's secrets scanner is detecting Supabase anon keys in the build output and blocking deployment. The Supabase anon key is actually **meant to be public** (it's a client-side key), but Netlify's scanner flags it as a secret.

## Solution

You need to configure Netlify to ignore the Supabase anon key. There are two ways to do this:

### Option 1: Add Environment Variable in Netlify Dashboard (Recommended)

1. Go to your Netlify site dashboard: https://app.netlify.com
2. Navigate to: **Site settings** → **Environment variables**
3. Add a new environment variable:
   - **Key**: `SECRETS_SCAN_SMART_DETECTION_OMIT_VALUES`
   - **Value**: Your Supabase anon key (the full `eyJ...` value)
4. Click **Save**
5. Trigger a new deploy

### Option 2: Disable Secrets Scanning (Not Recommended)

If you want to completely disable secrets scanning (not recommended for security):

1. Go to **Site settings** → **Environment variables**
2. Add:
   - **Key**: `SECRETS_SCAN_SMART_DETECTION_ENABLED`
   - **Value**: `false`
3. Click **Save**
4. Trigger a new deploy

## Why This Happens

- Supabase anon keys are JWT tokens that start with `eyJ`
- Netlify's scanner detects JWT-like patterns as potential secrets
- However, Supabase anon keys are **intentionally public** and safe to expose in client-side code
- They're designed to be used in frontend applications

## Important Notes

- ✅ **Supabase anon keys are safe to expose** - they're meant for client-side use
- ✅ **They have Row Level Security (RLS)** - your database rules protect your data
- ❌ **Never expose Supabase service role keys** - those are server-side only
- ❌ **Never expose API keys** like Gemini, OpenAI, etc. - those should stay in environment variables

## After Fixing

Once you've added the environment variable in Netlify:
1. The build should pass
2. The site should deploy successfully
3. The blank screen issue should be resolved

---

**Next Step**: Add `SECRETS_SCAN_SMART_DETECTION_OMIT_VALUES` in Netlify dashboard with your Supabase anon key value.

