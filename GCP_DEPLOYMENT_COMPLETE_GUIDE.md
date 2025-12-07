# 🚀 Complete GCP Deployment Guide for AIBC Backend

## Prerequisites

- ✅ Google Cloud account (you have: `akeem@script.tv`)
- ⏳ gcloud CLI installed
- ⏳ GCP project created
- ⏳ Gemini API key

---

## Step 1: Install Google Cloud CLI

**Mac:**
```bash
brew install google-cloud-sdk
```

**Or download:** https://cloud.google.com/sdk/docs/install

**Verify:**
```bash
gcloud --version
```

---

## Step 2: Authenticate and Set Up Project

```bash
# Login to Google Cloud
gcloud auth login

# List your projects
gcloud projects list

# Set your project (replace YOUR_PROJECT_ID with your actual project ID)
gcloud config set project YOUR_PROJECT_ID

# Verify
gcloud config get-value project

# Set default region
gcloud config set compute/region us-central1
gcloud config set compute/zone us-central1-a
```

---

## Step 3: Enable Required APIs

```bash
gcloud services enable \
    cloudbuild.googleapis.com \
    run.googleapis.com \
    containerregistry.googleapis.com \
    secretmanager.googleapis.com \
    artifactregistry.googleapis.com
```

---

## Step 4: Set Up Secrets (Gemini API Key)

```bash
# Create secret for Gemini API key
echo -n "YOUR_GEMINI_API_KEY_HERE" | gcloud secrets create gemini-api-key \
    --data-file=- \
    --replication-policy="automatic"

# Grant Cloud Run access to the secret
gcloud secrets add-iam-policy-binding gemini-api-key \
    --member="serviceAccount:YOUR_PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"
```

**To get your project number:**
```bash
gcloud projects describe YOUR_PROJECT_ID --format="value(projectNumber)"
```

---

## Step 5: Create Dockerfile for Backend

Create `backend/Dockerfile`:

```dockerfile
FROM node:18-slim

# Install Playwright dependencies
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxkbcommon0 \
    libxrandr2 \
    xdg-utils \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --only=production

# Install Playwright browsers
RUN npx playwright install --with-deps chromium

# Copy source code
COPY src ./src

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 8080

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Start server
CMD ["node", "dist/server.js"]
```

---

## Step 6: Create .dockerignore

Create `backend/.dockerignore`:

```
node_modules
npm-debug.log
.env
.env.local
dist
.git
.gitignore
*.md
```

---

## Step 7: Build and Deploy to Cloud Run

```bash
# Navigate to backend directory
cd backend

# Build and deploy in one command
gcloud run deploy aibc-backend \
    --source . \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated \
    --set-secrets="GEMINI_API_KEY=gemini-api-key:latest" \
    --set-env-vars="NODE_ENV=production,FRONTEND_URL=https://aibcmedia.com" \
    --memory 2Gi \
    --cpu 2 \
    --timeout 900 \
    --max-instances 10 \
    --min-instances 0
```

**This will:**
- Build your Docker image
- Push to Google Container Registry
- Deploy to Cloud Run
- Set up secrets and environment variables
- Make it publicly accessible

---

## Step 8: Get Your Backend URL

After deployment, you'll get a URL like:
```
https://aibc-backend-xxxxx-uc.a.run.app
```

**Save this URL!** You'll need it for DNS setup.

---

## Step 9: Set Up Custom Domain (api.aibcmedia.com)

### Option A: Using Cloud Run Domain Mapping

```bash
# Map custom domain
gcloud run domain-mappings create \
    --service aibc-backend \
    --domain api.aibcmedia.com \
    --region us-central1
```

This will give you DNS records to add to your domain.

### Option B: Manual DNS Setup

1. **Get the Cloud Run service URL** (from Step 8)

2. **Add CNAME record in GoDaddy:**
   - Type: `CNAME`
   - Name: `api`
   - Value: `aibc-backend-xxxxx-uc.a.run.app`
   - TTL: `3600`

3. **Wait for DNS propagation** (5-60 minutes)

---

## Step 10: Update Frontend Environment Variable

In Netlify, update the environment variable:

1. Go to Netlify Dashboard → Site Settings → Environment Variables
2. Update `VITE_API_URL` to: `https://api.aibcmedia.com`
3. Trigger a new deployment

**Or if using local .env:**
```bash
echo "VITE_API_URL=https://api.aibcmedia.com" > .env
```

---

## Step 11: Test the Deployment

```bash
# Test health endpoint
curl https://api.aibcmedia.com/health

# Should return: {"status":"ok","timestamp":"..."}
```

---

## Step 12: Monitor and Verify

1. **Check Cloud Run logs:**
   ```bash
   gcloud run services logs read aibc-backend --region us-central1
   ```

2. **Test scan endpoint:**
   ```bash
   curl -X POST https://api.aibcmedia.com/api/scan/start \
     -H "Content-Type: application/json" \
     -d '{"username":"test","platforms":["twitter"],"scanType":"standard"}'
   ```

3. **In the frontend:** Click "Retry Connection" in the scan interface

---

## Troubleshooting

### Issue: Build fails
```bash
# Check build logs
gcloud builds list --limit=5

# View specific build
gcloud builds log BUILD_ID
```

### Issue: Secret not found
```bash
# Verify secret exists
gcloud secrets list

# Check IAM permissions
gcloud secrets get-iam-policy gemini-api-key
```

### Issue: CORS errors
- Verify `FRONTEND_URL` is set correctly in Cloud Run
- Check backend CORS configuration in `backend/src/server.ts`

### Issue: Timeout errors
- Increase timeout: `--timeout 1800` (30 minutes)
- Increase memory: `--memory 4Gi`

---

## Cost Estimation

**Cloud Run pricing (approximate):**
- **Free tier:** 2 million requests/month, 360,000 GB-seconds
- **After free tier:** ~$0.40 per million requests, $0.0000025 per GB-second
- **Estimated monthly cost:** $5-20 for moderate usage

**Secret Manager:**
- First 6 secrets: Free
- Additional: $0.06 per secret per month

---

## Quick Deploy Script

Save this as `deploy-gcp.sh`:

```bash
#!/bin/bash

PROJECT_ID="YOUR_PROJECT_ID"
REGION="us-central1"
SERVICE_NAME="aibc-backend"

echo "🚀 Deploying to Google Cloud Run..."

cd backend

gcloud run deploy $SERVICE_NAME \
    --source . \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --set-secrets="GEMINI_API_KEY=gemini-api-key:latest" \
    --set-env-vars="NODE_ENV=production,FRONTEND_URL=https://aibcmedia.com" \
    --memory 2Gi \
    --cpu 2 \
    --timeout 900 \
    --max-instances 10

echo "✅ Deployment complete!"
echo "📋 Next: Set up DNS for api.aibcmedia.com"
```

Make it executable:
```bash
chmod +x deploy-gcp.sh
./deploy-gcp.sh
```

---

## Next Steps After Deployment

1. ✅ Backend deployed to Cloud Run
2. ✅ DNS configured for `api.aibcmedia.com`
3. ✅ Frontend `VITE_API_URL` updated
4. ✅ Test scan in frontend
5. ✅ Monitor Cloud Run logs for errors

---

## Support

If you encounter issues:
1. Check Cloud Run logs: `gcloud run services logs read aibc-backend`
2. Verify secrets: `gcloud secrets versions access latest --secret="gemini-api-key"`
3. Test locally first: `cd backend && npm run dev`

