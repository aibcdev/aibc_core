# 🚀 Deploy Backend to Google Cloud Platform - Step by Step

## Quick Start (5 Steps)

### Step 1: Install gcloud CLI

```bash
# Mac
brew install google-cloud-sdk

# Verify
gcloud --version
```

---

### Step 2: Login and Set Project

```bash
# Login (opens browser)
gcloud auth login

# List your projects
gcloud projects list

# Set your project (replace YOUR_PROJECT_ID)
gcloud config set project YOUR_PROJECT_ID

# Verify
gcloud config get-value project
```

---

### Step 3: Enable APIs

```bash
gcloud services enable \
    cloudbuild.googleapis.com \
    run.googleapis.com \
    containerregistry.googleapis.com \
    secretmanager.googleapis.com
```

---

### Step 4: Store Gemini API Key

```bash
# Replace YOUR_GEMINI_API_KEY with your actual key
echo -n "YOUR_GEMINI_API_KEY" | gcloud secrets create gemini-api-key \
    --data-file=- \
    --replication-policy="automatic"
```

**If secret already exists, update it:**
```bash
echo -n "YOUR_GEMINI_API_KEY" | gcloud secrets versions add gemini-api-key \
    --data-file=-
```

---

### Step 5: Deploy!

**Option A: Using deploy script (Easiest)**
```bash
cd backend
chmod +x deploy.sh
./deploy.sh
```

**Option B: Manual deployment**
```bash
cd backend

# Deploy to Cloud Run (builds and deploys automatically)
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

---

## After Deployment

### Get Your Backend URL

```bash
gcloud run services describe aibc-backend \
    --region us-central1 \
    --format="value(status.url)"
```

You'll get something like: `https://aibc-backend-xxxxx-uc.a.run.app`

---

### Update Netlify Environment Variable

1. Go to **Netlify Dashboard** → Your Site → **Site settings** → **Environment variables**
2. Update `VITE_API_URL` to your backend URL (or `https://api.aibcmedia.com` if you set up custom domain)
3. **Save**
4. **Trigger deploy** (or wait for auto-deploy)

---

### Test It

```bash
# Test health endpoint
curl https://your-backend-url/health

# Should return: {"status":"ok",...}
```

---

## Set Up Custom Domain (Optional)

To use `api.aibcmedia.com` instead of the Cloud Run URL:

### Step 1: Map Domain in Cloud Run

```bash
gcloud run domain-mappings create \
    --service aibc-backend \
    --domain api.aibcmedia.com \
    --region us-central1
```

### Step 2: Add DNS Records in GoDaddy

Cloud Run will give you DNS records. Add them to GoDaddy:

1. Go to **GoDaddy DNS Management**
2. Add **CNAME** record:
   - **Name:** `api`
   - **Value:** `ghs.googlehosted.com` (or what Cloud Run provides)
   - **TTL:** `3600`

3. Wait 5-60 minutes for DNS propagation

### Step 3: Update Netlify

Update `VITE_API_URL` in Netlify to: `https://api.aibcmedia.com`

---

## Troubleshooting

### "Project not found"
```bash
# Make sure project is set
gcloud config set project YOUR_PROJECT_ID
gcloud projects list  # Verify it exists
```

### "Permission denied"
- Make sure billing is enabled for your project
- Check you have Cloud Run Admin role

### "Secret not found"
```bash
# Verify secret exists
gcloud secrets list

# Check secret name matches
gcloud secrets describe gemini-api-key
```

### "Build failed"
```bash
# Check build logs
gcloud builds list --limit=5
gcloud builds log BUILD_ID
```

### "CORS errors"
- Verify `FRONTEND_URL` is set correctly: `https://aibcmedia.com`
- Check backend CORS config in `backend/src/server.ts`

---

## Monitor Deployment

```bash
# View logs
gcloud run services logs read aibc-backend --region us-central1

# View service details
gcloud run services describe aibc-backend --region us-central1
```

---

## Cost Estimate

- **Free tier:** 2 million requests/month, 360,000 GB-seconds
- **After free tier:** ~$0.40 per million requests
- **Estimated monthly:** $5-20 for moderate usage
- **Scales to zero:** No cost when idle

---

## What Happens Next

1. ✅ Backend deployed to Cloud Run
2. ✅ Frontend connects to real backend (no more fallback)
3. ✅ Scans use real data (not simulated)
4. ✅ Authentication works with real backend

---

## Quick Reference

```bash
# Login
gcloud auth login

# Set project
gcloud config set project YOUR_PROJECT_ID

# Deploy
cd backend
gcloud run deploy aibc-backend --source . --region us-central1 \
    --allow-unauthenticated --set-secrets="GEMINI_API_KEY=gemini-api-key:latest" \
    --set-env-vars="PORT=8080,FRONTEND_URL=https://aibcmedia.com"

# Get URL
gcloud run services describe aibc-backend --region us-central1 \
    --format="value(status.url)"

# View logs
gcloud run services logs read aibc-backend --region us-central1
```

---

**Ready? Start with Step 1!** 🚀

