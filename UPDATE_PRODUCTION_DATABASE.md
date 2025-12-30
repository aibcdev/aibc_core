# Update Production Database with Blog Posts

## Problem
Production API is returning empty blog posts array: `{"posts":[],"total":0}`
This causes the frontend to show "Content coming soon" message.

## Root Cause
The production Supabase database doesn't have any blog posts yet.

## Solution: Update Production Database

### Step 1: Get Production Supabase Credentials

You need the production Supabase URL and anon key. These should be:
- The same Supabase project used by production backend
- Or a separate production Supabase instance

### Step 2: Check Cloud Run Environment Variables

Check if Supabase is configured in Cloud Run:
```bash
gcloud run services describe aibc-backend --region=us-central1 --format="yaml(spec.template.spec.containers[0].env)" --project=ake-gcp-prod01
```

If `SUPABASE_URL` and `SUPABASE_ANON_KEY` are not set, you need to add them.

### Step 3: Update Production Database

**Option A: Using environment variables**
```bash
cd backend
export SUPABASE_URL=https://your-production-supabase-url.supabase.co
export SUPABASE_ANON_KEY=your-production-supabase-anon-key
npx ts-node scripts/updateBlogPosts.ts
```

**Option B: Create .env.production file**
```bash
cd backend
cat > .env.production << EOF
SUPABASE_URL=https://your-production-supabase-url.supabase.co
SUPABASE_ANON_KEY=your-production-supabase-anon-key
EOF

# Modify updateBlogPosts.ts to load .env.production first, or:
SUPABASE_URL=$(grep SUPABASE_URL .env.production | cut -d '=' -f2) \
SUPABASE_ANON_KEY=$(grep SUPABASE_ANON_KEY .env.production | cut -d '=' -f2) \
npx ts-node scripts/updateBlogPosts.ts
```

### Step 4: Verify

After running the update script, verify:
```bash
curl "https://aibc-backend-409115133182.us-central1.run.app/api/blog?limit=5&status=published"
```

Should return posts array with 5 items.

### Step 5: Check Production Site

Visit `https://aibcmedia.com/blog` and verify posts appear.

## Important Notes

- Make sure you're using PRODUCTION Supabase credentials, not local ones
- The production backend must have Supabase environment variables configured
- If Cloud Run doesn't have Supabase env vars, add them:
  ```bash
  gcloud run services update aibc-backend \
    --region=us-central1 \
    --set-env-vars SUPABASE_URL=https://your-supabase-url.supabase.co \
    --set-secrets SUPABASE_ANON_KEY=supabase-anon-key:latest \
    --project=ake-gcp-prod01
  ```







