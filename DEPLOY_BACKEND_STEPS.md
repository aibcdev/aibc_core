# Deploy Backend to Google Cloud Run - Step by Step

## ✅ Prerequisites Check
- ✅ gcloud CLI installed
- ✅ VITE_API_URL set in Netlify (`https://api.aibcmedia.com`)

## Step 1: Login to Google Cloud

```bash
gcloud auth login
```

This will open a browser window for you to authenticate.

## Step 2: Set Your GCP Project

```bash
# List your projects
gcloud projects list

# Set your project (replace YOUR_PROJECT_ID)
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

After deployment completes:

```bash
gcloud run services describe aibc-backend \
    --region us-central1 \
    --format="value(status.url)"
```

This will output something like: `https://aibc-backend-xxxxx-uc.a.run.app`

## Step 7: Update Netlify Environment Variable (if needed)

If your backend URL is different from `https://api.aibcmedia.com`:

1. **Netlify Dashboard** → Site settings → Environment variables
2. Update `VITE_API_URL` to your actual backend URL
3. **Save**
4. **Trigger deploy** (or wait for auto-deploy)

## Step 8: Test the Deployment

```bash
# Test health endpoint
curl https://your-backend-url/health

# Should return: {"status":"ok",...}
```

## That's It! 🎉

Your backend will be live and your frontend will connect to it automatically.

---

**Ready to start?** Let's begin with Step 1!

