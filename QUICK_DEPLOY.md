# 🚀 Quick Deployment Guide

## One-Command Deploy

```bash
cd backend && ./deploy.sh
```

## Manual Deploy (3 Steps)

### 1. Set Up GCP
```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
gcloud services enable cloudbuild.googleapis.com run.googleapis.com
```

### 2. Store Secrets
```bash
echo -n "your_gemini_api_key" | gcloud secrets create gemini-api-key --data-file=-
```

### 3. Deploy
```bash
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/aibc-backend
gcloud run deploy aibc-backend \
    --image gcr.io/YOUR_PROJECT_ID/aibc-backend \
    --region us-central1 \
    --platform managed \
    --allow-unauthenticated \
    --memory 2Gi \
    --cpu 2 \
    --set-secrets GEMINI_API_KEY=gemini-api-key:latest \
    --set-env-vars PORT=8080
```

## Get Your URL
```bash
gcloud run services describe aibc-backend --format="value(status.url)"
```

## Update Frontend
Add to `.env`:
```
VITE_API_URL=https://your-deployed-url
```

Done! 🎉

