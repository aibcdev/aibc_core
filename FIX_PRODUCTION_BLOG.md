# Fix Production Blog - "Content Coming Soon" Issue

## Problem Identified

Production API returns: `{"posts":[],"total":0}` 
This causes frontend to show "Content coming soon" message.

## Root Cause

**Cloud Run service is missing Supabase environment variables:**
- `SUPABASE_URL` - Not configured
- `SUPABASE_ANON_KEY` - Not configured

Current Cloud Run env vars:
- ✅ FRONTEND_URL
- ✅ NODE_ENV  
- ✅ GEMINI_API_KEY (from Secret Manager)
- ❌ SUPABASE_URL (MISSING)
- ❌ SUPABASE_ANON_KEY (MISSING)

## Solution

### Step 1: Store Supabase Credentials in Secret Manager

```bash
# Store Supabase URL as environment variable (or secret)
# Store Supabase Anon Key as secret
echo -n "your-production-supabase-anon-key" | \
  gcloud secrets create supabase-anon-key \
    --data-file=- \
    --replication-policy="automatic" \
    --project=ake-gcp-prod01
```

### Step 2: Update Cloud Run Service with Supabase Variables

```bash
gcloud run services update aibc-backend \
  --region=us-central1 \
  --set-env-vars SUPABASE_URL=https://your-supabase-project.supabase.co \
  --set-secrets SUPABASE_ANON_KEY=supabase-anon-key:latest \
  --project=ake-gcp-prod01
```

### Step 3: Update Production Database

After Cloud Run is updated, run the blog post update script:

```bash
cd backend
export SUPABASE_URL=https://your-production-supabase-url.supabase.co
export SUPABASE_ANON_KEY=your-production-supabase-anon-key
npx ts-node scripts/updateBlogPosts.ts
```

### Step 4: Verify

1. Check API returns posts:
```bash
curl "https://aibc-backend-409115133182.us-central1.run.app/api/blog?limit=5&status=published"
```

2. Visit production site:
https://aibcmedia.com/blog

## Quick Fix Command

Replace `YOUR_SUPABASE_URL` and create secret first, then:

```bash
# Create secret (if not exists)
echo -n "YOUR_SUPABASE_ANON_KEY" | \
  gcloud secrets create supabase-anon-key \
    --data-file=- \
    --replication-policy="automatic" \
    --project=ake-gcp-prod01 2>&1 | grep -v "already exists" || true

# Update Cloud Run
gcloud run services update aibc-backend \
  --region=us-central1 \
  --set-env-vars SUPABASE_URL=YOUR_SUPABASE_URL \
  --set-secrets SUPABASE_ANON_KEY=supabase-anon-key:latest \
  --project=ake-gcp-prod01
```



