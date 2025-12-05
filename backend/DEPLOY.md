# Google Cloud Deployment Guide

## Prerequisites

1. **Google Cloud Account** with credits activated
2. **gcloud CLI** installed: https://cloud.google.com/sdk/docs/install
3. **Project created** in Google Cloud Console

## Quick Deploy

### Option 1: Automated Script
```bash
chmod +x deploy.sh
./deploy.sh
```

### Option 2: Manual Steps

#### 1. Set up GCP Project
```bash
# Login to Google Cloud
gcloud auth login

# Set your project ID
gcloud config set project YOUR_PROJECT_ID

# Enable required APIs
gcloud services enable \
    cloudbuild.googleapis.com \
    run.googleapis.com \
    containerregistry.googleapis.com \
    secretmanager.googleapis.com
```

#### 2. Set up Secrets
```bash
# Store Gemini API key in Secret Manager
echo -n "your_gemini_api_key" | gcloud secrets create gemini-api-key \
    --data-file=- \
    --replication-policy="automatic"
```

#### 3. Build and Deploy
```bash
# Build Docker image
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
    --set-env-vars PORT=8080,FRONTEND_URL=https://your-frontend-domain.com
```

## Environment Variables

Set these in Cloud Run:
- `PORT=8080` (required)
- `FRONTEND_URL` (your frontend URL for CORS)
- `GEMINI_API_KEY` (from Secret Manager)

## Update Frontend

After deployment, update your frontend `.env`:
```
VITE_API_URL=https://aibc-backend-xxxxx-uc.a.run.app
```

## Monitoring

View logs:
```bash
gcloud run services logs read aibc-backend --region=us-central1
```

View service:
```bash
gcloud run services describe aibc-backend --region=us-central1
```

## Cost Optimization

- **Cloud Run** charges only when requests are processed
- **Free tier**: 2 million requests/month
- **Scaling**: Auto-scales to zero when not in use
- **Memory**: 2Gi is sufficient for Playwright + Node.js

## Troubleshooting

**Build fails:**
- Check Dockerfile syntax
- Verify all dependencies in package.json
- Check Cloud Build logs

**Deployment fails:**
- Verify secrets are created
- Check IAM permissions
- Review Cloud Run logs

**Runtime errors:**
- Check environment variables
- Verify Secret Manager access
- Review application logs

