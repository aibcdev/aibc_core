# Deploy Blog Routes to Production - Quick Guide

## 🔍 Current Issue
Production backend at `https://aibc-backend-409115133182.us-central1.run.app` returns:
```
Cannot GET /api/blog
```

**Root Cause**: Backend deployment is outdated and missing blog routes.

## ✅ Solution: Redeploy Backend

### Step 1: Get Your Google Cloud Project ID

```bash
# Check current project
gcloud config get-value project

# Or list all projects
gcloud projects list
```

### Step 2: Deploy Backend

**Option A: Using Cloud Build (Recommended)**

```bash
cd /Users/akeemojuko/Documents/aibc_core-1

# Make sure you're authenticated
gcloud auth login

# Set your project ID (replace YOUR_PROJECT_ID with actual ID)
export PROJECT_ID=$(gcloud config get-value project)
echo "Using project: $PROJECT_ID"

# Deploy using cloudbuild.yaml
gcloud builds submit --config backend/cloudbuild.yaml
```

**Option B: Manual Deploy**

```bash
cd /Users/akeemojuko/Documents/aibc_core-1/backend

# Get project ID
export PROJECT_ID=$(gcloud config get-value project)

# Build and push image
gcloud builds submit --tag gcr.io/$PROJECT_ID/aibc-backend

# Deploy to Cloud Run
gcloud run deploy aibc-backend \
  --image gcr.io/$PROJECT_ID/aibc-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2 \
  --timeout 300 \
  --max-instances 10 \
  --set-env-vars="SUPABASE_URL=$SUPABASE_URL,SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY"
```

### Step 3: Verify Deployment

After deployment completes, test:

```bash
curl "https://aibc-backend-409115133182.us-central1.run.app/api/blog?status=published&page=1&limit=12"
```

**Expected Response:**
```json
{
  "posts": [...],
  "total": 5,
  "page": 1,
  "limit": 12,
  "totalPages": 1
}
```

### Step 4: Test Frontend

Visit: https://www.aibcmedia.com/blog

Should now show 5 published blog posts.

## 📋 What Gets Deployed

✅ Blog routes (`/api/blog`)
✅ Blog scheduler routes (`/api/blog/publish-scheduled`)
✅ All existing backend functionality

## ⚠️ Important Notes

- Make sure `SUPABASE_URL` and `SUPABASE_ANON_KEY` are set in Cloud Run environment variables
- Deployment takes 2-5 minutes
- The backend URL will remain the same: `https://aibc-backend-409115133182.us-central1.run.app`








