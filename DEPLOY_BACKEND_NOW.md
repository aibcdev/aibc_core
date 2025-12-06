# Deploy Backend to Google Cloud Run - Quick Start

## Step 1: Install gcloud CLI

**On Mac (using Homebrew):**
```bash
brew install google-cloud-sdk
```

**Or download installer:**
- Visit: https://cloud.google.com/sdk/docs/install
- Download and run the installer

**Verify installation:**
```bash
gcloud --version
```

## Step 2: Login and Set Project

```bash
# Login to Google Cloud
gcloud auth login

# List your projects to find your project ID
gcloud projects list

# Set your project (replace YOUR_PROJECT_ID)
gcloud config set project YOUR_PROJECT_ID
```

## Step 3: Enable APIs

```bash
gcloud services enable \
    cloudbuild.googleapis.com \
    run.googleapis.com \
    containerregistry.googleapis.com \
    secretmanager.googleapis.com
```

## Step 4: Store Gemini API Key

**Replace `YOUR_GEMINI_API_KEY` with your actual key!**

```bash
# Create secret
echo -n "YOUR_GEMINI_API_KEY" | gcloud secrets create gemini-api-key \
    --data-file=- \
    --replication-policy="automatic"
```

## Step 5: Deploy

**Easy way (using script):**
```bash
cd backend
chmod +x deploy.sh
./deploy.sh
```

**Manual way:**
```bash
cd backend

# Build and deploy
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
    --set-secrets GEMINI_API_KEY=gemini-api-key:latest \
    --set-env-vars PORT=8080,FRONTEND_URL=https://aibcmedia.com
```

## Step 6: Get Backend URL

```bash
gcloud run services describe aibc-backend \
    --region us-central1 \
    --format="value(status.url)"
```

Copy this URL - you'll need it!

## Step 7: Update Netlify Environment Variable

1. **Netlify Dashboard** → Your Site → **Site settings** → **Environment variables**
2. Add/Update: `VITE_API_URL` = `https://your-backend-url-here`
3. **Save**
4. **Trigger deploy** (or wait for auto-deploy)

## That's It! 🎉

Your backend will be live and your frontend will connect to it automatically.

---

**Need help?** Let me know which step you're on!

