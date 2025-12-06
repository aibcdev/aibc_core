# Google Cloud Run Deployment - Step by Step

## Prerequisites Check

Before we start, let's verify:
- ✅ Google Cloud account (you have this)
- ⏳ gcloud CLI installed
- ⏳ GCP project ID
- ⏳ Gemini API key

## Step 1: Install gcloud CLI (if not installed)

**Mac:**
```bash
brew install google-cloud-sdk
```

**Or download:** https://cloud.google.com/sdk/docs/install

**Verify installation:**
```bash
gcloud --version
```

## Step 2: Login and Set Project

```bash
# Login to Google Cloud
gcloud auth login

# List your projects
gcloud projects list

# Set your project (replace YOUR_PROJECT_ID with your actual project ID)
gcloud config set project YOUR_PROJECT_ID

# Verify
gcloud config get-value project
```

## Step 3: Enable Required APIs

```bash
gcloud services enable \
    cloudbuild.googleapis.com \
    run.googleapis.com \
    containerregistry.googleapis.com \
    secretmanager.googleapis.com
```

## Step 4: Store Gemini API Key in Secret Manager

**Important:** Replace `YOUR_GEMINI_API_KEY` with your actual key!

```bash
# Create secret (if it doesn't exist)
echo -n "YOUR_GEMINI_API_KEY" | gcloud secrets create gemini-api-key \
    --data-file=- \
    --replication-policy="automatic"

# OR if secret already exists, update it:
echo -n "YOUR_GEMINI_API_KEY" | gcloud secrets versions add gemini-api-key \
    --data-file=-
```

## Step 5: Deploy Backend

**Option A: Using the deploy script (Easiest)**
```bash
cd backend
chmod +x deploy.sh
./deploy.sh
```

**Option B: Manual deployment**
```bash
cd backend

# Build and push Docker image
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/aibc-backend

# Deploy to Cloud Run
gcloud run deploy aibc-backend \
    --image gcr.io/YOUR_PROJECT_ID/aibc-backend \
    --region us-central1 \
    --platform managed \
    --allow-unauthenticated \
    --memory 2Gi \
    --cpu 2 \
    --timeout 300 \
    --max-instances 10 \
    --set-secrets GEMINI_API_KEY=gemini-api-key:latest \
    --set-env-vars PORT=8080,FRONTEND_URL=https://aibcmedia.com
```

## Step 6: Get Your Backend URL

After deployment completes, get your URL:

```bash
gcloud run services describe aibc-backend \
    --region us-central1 \
    --format="value(status.url)"
```

This will output something like: `https://aibc-backend-xxxxx-uc.a.run.app`

## Step 7: Update Frontend Environment Variable

1. **In Netlify Dashboard:**
   - Go to your site
   - **Site settings** → **Environment variables**
   - Add/Update: `VITE_API_URL` = `https://aibc-backend-xxxxx-uc.a.run.app` (your actual URL)
   - **Save**

2. **Redeploy frontend:**
   - Netlify will auto-redeploy, or
   - **Deploys** → **Trigger deploy** → **Clear cache and deploy site**

## Step 8: Test the Deployment

```bash
# Test health endpoint
curl https://your-backend-url/health

# Should return: {"status":"ok",...}
```

## Troubleshooting

### "Project not found"
- Make sure you've set the correct project: `gcloud config set project YOUR_PROJECT_ID`
- Verify project exists: `gcloud projects list`

### "Permission denied"
- Make sure billing is enabled for your project
- Check you have Cloud Run Admin role

### "Secret not found"
- Create the secret first (Step 4)
- Make sure secret name matches: `gemini-api-key`

### "Build failed"
- Check Dockerfile is correct
- Verify all dependencies in package.json
- Check build logs: `gcloud builds list`

## What Happens After Deployment

1. ✅ Backend API is live at: `https://aibc-backend-xxxxx-uc.a.run.app`
2. ✅ Frontend will connect to real backend (no more fallback)
3. ✅ Authentication will use real backend
4. ✅ All API endpoints will work

## Cost Estimate

- **Cloud Run:** Free tier = 2 million requests/month
- **After free tier:** ~$0.40 per million requests
- **Memory/CPU:** Only charged when handling requests
- **Scales to zero:** No cost when idle

## Next Steps After Deployment

1. Test sign up/sign in (should use real backend now)
2. Test digital footprint scanning
3. Monitor logs: `gcloud run services logs read aibc-backend --region=us-central1`
4. Set up custom domain for backend (optional): `api.aibcmedia.com`

---

Ready to deploy? Let's start with Step 1!

