# Supabase Database Setup Guide

This guide will help you set up Supabase for persistent storage of blog posts, keywords, and analytics.

## Prerequisites

1. **Supabase Account**: Sign up at [supabase.com](https://supabase.com)
2. **Create a Project**: Create a new project in your Supabase dashboard

## Step 1: Create Database Tables

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `backend/database/schema.sql`
4. Click **Run** to execute the SQL script

This will create:
- `seo_blog_posts` - Blog posts table
- `seo_keywords` - Keywords tracking table
- `seo_content_performance` - Analytics/performance table
- All necessary indexes and triggers

## Step 2: Get API Keys

1. In your Supabase project, go to **Settings** → **API**
2. Copy:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (under "Project API keys")

## Step 3: Configure Environment Variables

Add these to your `backend/.env` file:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

Or for production (Cloud Run), use the service role key for more permissions:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

## Step 4: Test the Setup

After configuring, restart your backend server. The services will automatically:
- Use Supabase if configured
- Fall back to in-memory storage if not configured

You can verify it's working by checking the logs - you should see:
- ✅ No warnings about Supabase not being configured
- Content persists after server restarts

## Verification

1. Generate a blog post
2. Restart your backend server
3. Check that the post still exists (it should!)

## Row Level Security (Optional)

By default, the tables are accessible with the anon key. For production, consider setting up Row Level Security (RLS) policies in Supabase:

1. Go to **Authentication** → **Policies**
2. Enable RLS on each table
3. Create policies based on your access requirements

## Troubleshooting

**Issue: "Supabase not configured" warning**
- Make sure `SUPABASE_URL` and `SUPABASE_ANON_KEY` are set in your `.env` file
- Restart the backend server after adding environment variables

**Issue: "Failed to create post" error**
- Check that the database tables were created successfully
- Verify your API keys are correct
- Check the Supabase dashboard logs for detailed error messages

**Issue: Content still not persisting**
- Verify the environment variables are loaded correctly
- Check backend logs for any Supabase connection errors
- Ensure the database schema was created correctly

## Production Deployment

For Cloud Run deployment, add the environment variables:

```bash
gcloud run services update aibc-backend \
  --set-env-vars SUPABASE_URL=https://your-project-id.supabase.co \
  --set-secrets SUPABASE_ANON_KEY=supabase-anon-key:latest
```

Or use Secret Manager:

```bash
echo -n "your-anon-key" | gcloud secrets create supabase-anon-key --data-file=-
gcloud run services update aibc-backend \
  --set-env-vars SUPABASE_URL=https://your-project-id.supabase.co \
  --set-secrets SUPABASE_ANON_KEY=supabase-anon-key:latest
```








