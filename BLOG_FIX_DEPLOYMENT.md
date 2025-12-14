# Blog Not Showing - Root Cause & Fix

## 🔍 Root Cause Identified

**Issue**: Production backend deployment is missing the `/api/blog` route.

**Evidence**:
1. ✅ Database has 5 published posts
2. ❌ API endpoint returns: `Cannot GET /api/blog`
3. ✅ Backend code has routes registered (`server.ts:59`)

**Conclusion**: The production backend at `https://aibc-backend-409115133182.us-central1.run.app` is outdated and missing the blog routes.

## ✅ Fix: Redeploy Backend

The backend code is correct, but production needs to be redeployed.

### Option 1: Deploy via Cloud Build (Recommended)

```bash
cd /Users/akeemojuko/Documents/aibc_core-1/backend

# Make sure you're authenticated
gcloud auth login

# Set your project ID (replace with actual project ID)
export PROJECT_ID=your-project-id

# Build and deploy
gcloud builds submit --tag gcr.io/$PROJECT_ID/aibc-backend

gcloud run deploy aibc-backend \
  --image gcr.io/$PROJECT_ID/aibc-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2 \
  --timeout 300 \
  --max-instances 10
```

### Option 2: Deploy via Cloud Build YAML

```bash
cd /Users/akeemojuko/Documents/aibc_core-1

# Use the existing cloudbuild.yaml
gcloud builds submit --config backend/cloudbuild.yaml
```

### Option 3: Manual Docker Build & Deploy

```bash
cd /Users/akeemojuko/Documents/aibc_core-1/backend

# Build Docker image
docker build -t gcr.io/YOUR_PROJECT_ID/aibc-backend .

# Push to Container Registry
docker push gcr.io/YOUR_PROJECT_ID/aibc-backend

# Deploy to Cloud Run
gcloud run deploy aibc-backend \
  --image gcr.io/YOUR_PROJECT_ID/aibc-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

## ✅ Verification

After deployment, verify the endpoint works:

```bash
curl "https://aibc-backend-409115133182.us-central1.run.app/api/blog?status=published&page=1&limit=12"
```

Expected response:
```json
{
  "posts": [...],
  "total": 5,
  "page": 1,
  "limit": 12,
  "totalPages": 1
}
```

## 📋 What's Already Fixed in Code

✅ Blog routes registered in `backend/src/server.ts:59`
✅ Blog service queries published posts correctly
✅ Frontend calls correct API URL
✅ Database has 5 published posts

**Only missing**: Production deployment with latest code.

