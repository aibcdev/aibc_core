# Redeploy Backend for Blog Support

## Issue
The production backend doesn't have the `/api/blog` endpoint available. This means:
1. The blog routes need to be included in the deployment
2. Supabase environment variables need to be set in Cloud Run

## Steps to Fix

### 1. Set Supabase Environment Variables in Cloud Run

```bash
# Get your Supabase credentials from backend/.env
# Then set them in Cloud Run:

gcloud run services update aibc-backend \
  --region us-central1 \
  --set-env-vars "SUPABASE_URL=https://your-project-id.supabase.co" \
  --set-secrets "SUPABASE_ANON_KEY=supabase-anon-key:latest"

# Or if using Secret Manager:
echo -n "your-anon-key" | gcloud secrets create supabase-anon-key --data-file=-
gcloud run services update aibc-backend \
  --region us-central1 \
  --set-secrets "SUPABASE_ANON_KEY=supabase-anon-key:latest"
```

### 2. Redeploy Backend with Latest Code

```bash
cd backend

# Build and deploy
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/aibc-backend

gcloud run deploy aibc-backend \
  --image gcr.io/YOUR_PROJECT_ID/aibc-backend \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2 \
  --timeout 300 \
  --set-secrets GEMINI_API_KEY=gemini-api-key:latest,SUPABASE_ANON_KEY=supabase-anon-key:latest \
  --set-env-vars "SUPABASE_URL=https://your-project-id.supabase.co"
```

### 3. Verify Deployment

After deployment, test the endpoint:
```bash
curl https://aibc-backend-409115133182.us-central1.run.app/api/blog?status=published
```

You should get JSON with blog posts, not an error.

### 4. Generate Content in Production Database

Once the backend is redeployed, you may need to generate content in the production Supabase database:

```bash
# Run locally but pointing to production Supabase
cd backend
# Make sure backend/.env has production Supabase credentials
npx ts-node scripts/generate-today-content.ts
```

## Quick Check

To see if blog routes are working:
```bash
curl https://aibc-backend-409115133182.us-central1.run.app/api/blog?status=published&limit=5
```

Expected: JSON response with posts array
Current: "Cannot GET /api/blog" error







