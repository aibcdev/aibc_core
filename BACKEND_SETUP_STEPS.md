# 🚀 Backend Setup Steps - Clear & Simple

## Current Status Check

✅ gcloud CLI installed  
✅ Logged into GCP  
⏳ Next: Set project and deploy

---

## Step 1: Set Your GCP Project

```bash
# List your projects
gcloud projects list

# Set your project (replace YOUR_PROJECT_ID with actual ID)
gcloud config set project YOUR_PROJECT_ID

# Verify it's set
gcloud config get-value project
```

**If you don't have a project yet:**
```bash
# Create a new project
gcloud projects create aibc-backend --name="AIBC Backend"

# Set it
gcloud config set project aibc-backend

# Enable billing (required for Cloud Run)
# Go to: https://console.cloud.google.com/billing
```

---

## Step 2: Enable Required APIs

Run this command (one time):

```bash
gcloud services enable \
    cloudbuild.googleapis.com \
    run.googleapis.com \
    containerregistry.googleapis.com \
    secretmanager.googleapis.com
```

**Wait for:** "Operation finished successfully" for each service.

---

## Step 3: Store Your Gemini API Key

**Important:** Replace `YOUR_GEMINI_API_KEY` with your actual Gemini API key!

```bash
# Create the secret (if it doesn't exist)
echo -n "YOUR_GEMINI_API_KEY" | gcloud secrets create gemini-api-key \
    --data-file=- \
    --replication-policy="automatic"
```

**If you get "already exists" error:**
```bash
# Update existing secret instead
echo -n "YOUR_GEMINI_API_KEY" | gcloud secrets versions add gemini-api-key \
    --data-file=-
```

**Verify it was created:**
```bash
gcloud secrets list
```

---

## Step 4: Deploy the Backend

Navigate to the backend directory and deploy:

```bash
cd backend

# Deploy to Cloud Run (this will build and deploy automatically)
gcloud run deploy aibc-backend \
    --source . \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated \
    --memory 2Gi \
    --cpu 2 \
    --timeout 900 \
    --max-instances 10 \
    --set-secrets="GEMINI_API_KEY=gemini-api-key:latest" \
    --set-env-vars="PORT=8080,FRONTEND_URL=https://aibcmedia.com,NODE_ENV=production"
```

**What this does:**
- Builds your Docker image automatically
- Pushes to Google Container Registry
- Deploys to Cloud Run
- Sets up secrets and environment variables
- Makes it publicly accessible

**This takes 5-10 minutes.** You'll see build progress in the terminal.

---

## Step 5: Get Your Backend URL

After deployment completes, get your URL:

```bash
gcloud run services describe aibc-backend \
    --region us-central1 \
    --format="value(status.url)"
```

**You'll get something like:** `https://aibc-backend-xxxxx-uc.a.run.app`

**Save this URL!** You'll need it next.

---

## Step 6: Update Netlify Environment Variable

1. Go to **Netlify Dashboard**: https://app.netlify.com
2. Click on your site (aibcmedia.com)
3. Go to **Site settings** → **Environment variables**
4. Find `VITE_API_URL` or create it:
   - **Key:** `VITE_API_URL`
   - **Value:** Your backend URL from Step 5 (or `https://api.aibcmedia.com` if you set up custom domain)
5. Click **Save**
6. Go to **Deploys** → **Trigger deploy** → **Clear cache and deploy site**

---

## Step 7: Test It Works

```bash
# Test health endpoint
curl https://your-backend-url/health

# Should return: {"status":"ok","timestamp":"..."}
```

**In your frontend:**
- Go to the scan page
- Click "Retry Connection"
- The error should disappear and it should connect to the real backend!

---

## Optional: Set Up Custom Domain (api.aibcmedia.com)

If you want to use `api.aibcmedia.com` instead of the Cloud Run URL:

### A. Map Domain in Cloud Run

```bash
gcloud run domain-mappings create \
    --service aibc-backend \
    --domain api.aibcmedia.com \
    --region us-central1
```

### B. Add DNS Record in GoDaddy

1. Go to **GoDaddy DNS Management** for `aibcmedia.com`
2. Add **CNAME** record:
   - **Name:** `api`
   - **Value:** `ghs.googlehosted.com` (or what Cloud Run provides)
   - **TTL:** `3600`
3. Wait 5-60 minutes for DNS to propagate

### C. Update Netlify

Update `VITE_API_URL` to: `https://api.aibcmedia.com`

---

## Troubleshooting

### "Project not found"
```bash
# List projects
gcloud projects list

# Set correct project
gcloud config set project YOUR_PROJECT_ID
```

### "Permission denied" or "Billing not enabled"
- Go to: https://console.cloud.google.com/billing
- Link a billing account to your project
- Cloud Run requires billing (but has generous free tier)

### "Secret not found"
```bash
# Check if secret exists
gcloud secrets list

# If not, create it (Step 3)
```

### "Build failed"
```bash
# Check build logs
gcloud builds list --limit=5
gcloud builds log BUILD_ID
```

### "CORS errors" after deployment
- Verify `FRONTEND_URL` is set to: `https://aibcmedia.com`
- Check backend logs: `gcloud run services logs read aibc-backend --region us-central1`

---

## Quick Command Reference

```bash
# Set project
gcloud config set project YOUR_PROJECT_ID

# Enable APIs
gcloud services enable cloudbuild.googleapis.com run.googleapis.com containerregistry.googleapis.com secretmanager.googleapis.com

# Create secret
echo -n "YOUR_GEMINI_API_KEY" | gcloud secrets create gemini-api-key --data-file=- --replication-policy="automatic"

# Deploy
cd backend
gcloud run deploy aibc-backend --source . --region us-central1 --allow-unauthenticated --memory 2Gi --cpu 2 --timeout 900 --set-secrets="GEMINI_API_KEY=gemini-api-key:latest" --set-env-vars="PORT=8080,FRONTEND_URL=https://aibcmedia.com"

# Get URL
gcloud run services describe aibc-backend --region us-central1 --format="value(status.url)"

# View logs
gcloud run services logs read aibc-backend --region us-central1
```

---

## What Happens After Setup

✅ Backend API live at Cloud Run URL  
✅ Frontend connects to real backend (no more fallback)  
✅ Scans use real data (not simulated)  
✅ Authentication works with real backend  
✅ All features fully functional  

---

**Ready? Start with Step 1!** 🚀

