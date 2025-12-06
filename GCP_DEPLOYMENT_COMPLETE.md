# Google Cloud Platform Deployment Guide
## Complete Setup for AIBC Backend

## Prerequisites

1. **Google Cloud Account** with billing enabled
2. **gcloud CLI** installed: `brew install google-cloud-sdk`
3. **Project created** in Google Cloud Console

## Step 1: Initial Setup

### 1.1 Login and Configure

```bash
# Login to Google Cloud
gcloud auth login

# Set your project (replace with your project ID)
gcloud config set project YOUR_PROJECT_ID

# Verify project
gcloud config get-value project
```

### 1.2 Enable Required APIs

```bash
gcloud services enable \
    cloudbuild.googleapis.com \
    run.googleapis.com \
    containerregistry.googleapis.com \
    secretmanager.googleapis.com \
    cloudscheduler.googleapis.com \
    cloudtasks.googleapis.com \
    firestore.googleapis.com \
    bigquery.googleapis.com
```

## Step 2: Store Secrets

### 2.1 Store Gemini API Key

```bash
# Replace with your actual Gemini API key
echo -n "YOUR_GEMINI_API_KEY" | gcloud secrets create gemini-api-key \
    --data-file=- \
    --replication-policy="automatic"
```

### 2.2 Store JWT Secret

```bash
# Generate a secure random secret
openssl rand -base64 32 | gcloud secrets create jwt-secret \
    --data-file=- \
    --replication-policy="automatic"
```

### 2.3 Store Google OAuth Credentials (if using)

```bash
# Store Google Client ID
echo -n "YOUR_GOOGLE_CLIENT_ID" | gcloud secrets create google-client-id \
    --data-file=- \
    --replication-policy="automatic"

# Store Google Client Secret
echo -n "YOUR_GOOGLE_CLIENT_SECRET" | gcloud secrets create google-client-secret \
    --data-file=- \
    --replication-policy="automatic"
```

## Step 3: Create Dockerfile

Create `backend/Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 8080

# Start server
CMD ["node", "dist/server.js"]
```

## Step 4: Build and Deploy

### 4.1 Build Docker Image

```bash
cd backend

# Build and push to Container Registry
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/aibc-backend
```

### 4.2 Deploy to Cloud Run

```bash
gcloud run deploy aibc-backend \
    --image gcr.io/YOUR_PROJECT_ID/aibc-backend \
    --region us-central1 \
    --platform managed \
    --allow-unauthenticated \
    --memory 2Gi \
    --cpu 2 \
    --timeout 300 \
    --max-instances 10 \
    --min-instances 0 \
    --set-secrets GEMINI_API_KEY=gemini-api-key:latest,JWT_SECRET=jwt-secret:latest \
    --set-env-vars PORT=8080,FRONTEND_URL=https://aibcmedia.com,NODE_ENV=production
```

### 4.3 Get Deployment URL

```bash
gcloud run services describe aibc-backend \
    --region us-central1 \
    --format="value(status.url)"
```

## Step 5: Update Frontend

### 5.1 Set Environment Variable in Netlify

1. Go to Netlify Dashboard → Site Settings → Environment Variables
2. Add: `VITE_API_URL=https://your-cloud-run-url.run.app`

### 5.2 Redeploy Frontend

Netlify will automatically redeploy when you push to GitHub, or trigger manually.

## Step 6: Set Up Firestore (for Competitor Tracking)

### 6.1 Create Firestore Database

```bash
# Create Firestore database in Native mode
gcloud firestore databases create \
    --location=us-central \
    --type=firestore-native
```

### 6.2 Set Up Collections

Collections will be created automatically when the app writes data, but you can pre-create indexes:

```bash
# Create index for competitor posts
gcloud firestore indexes create \
    --collection-group=competitor_posts \
    --query-scope=COLLECTION \
    --field-config field-path=competitorId,order=ASCENDING \
    --field-config field-path=postedAt,order=DESCENDING
```

## Step 7: Set Up Cloud Scheduler (for Daily Competitor Scans)

### 7.1 Create Scheduled Job

```bash
# Get Cloud Run service URL
SERVICE_URL=$(gcloud run services describe aibc-backend \
    --region us-central1 \
    --format="value(status.url)")

# Create Cloud Scheduler job for daily competitor scans
gcloud scheduler jobs create http daily-competitor-scans \
    --location=us-central1 \
    --schedule="0 2 * * *" \
    --uri="${SERVICE_URL}/api/competitors/scan-all" \
    --http-method=POST \
    --headers="Content-Type=application/json" \
    --message-body='{"trigger":"scheduled"}' \
    --time-zone="America/New_York"
```

## Step 8: Monitoring & Logging

### 8.1 View Logs

```bash
# View recent logs
gcloud run services logs read aibc-backend \
    --region us-central1 \
    --limit 50

# Follow logs in real-time
gcloud run services logs tail aibc-backend \
    --region us-central1
```

### 8.2 Set Up Alerts

1. Go to Cloud Console → Monitoring → Alerting
2. Create alert policies for:
   - High error rate
   - High latency
   - Low request count (service down)

## Step 9: Cost Optimization

### 9.1 Set Budget Alerts

```bash
# Create budget alert
gcloud billing budgets create \
    --billing-account=YOUR_BILLING_ACCOUNT_ID \
    --display-name="AIBC Monthly Budget" \
    --budget-amount=500USD \
    --threshold-rule=percent=50 \
    --threshold-rule=percent=90 \
    --threshold-rule=percent=100
```

### 9.2 Optimize Cloud Run Settings

- **Min instances**: 0 (scale to zero when not in use)
- **Max instances**: 10 (adjust based on traffic)
- **Memory**: 2Gi (adjust based on usage)
- **CPU**: 2 (adjust based on load)

## Step 10: Testing

### 10.1 Test API Endpoints

```bash
# Get service URL
SERVICE_URL=$(gcloud run services describe aibc-backend \
    --region us-central1 \
    --format="value(status.url)")

# Test health endpoint
curl "${SERVICE_URL}/api/health"

# Test scan endpoint
curl -X POST "${SERVICE_URL}/api/scan/start" \
    -H "Content-Type: application/json" \
    -d '{"username":"testuser","platforms":["twitter"],"scanType":"standard"}'
```

## Troubleshooting

### Service Won't Start

1. Check logs: `gcloud run services logs read aibc-backend --region us-central1`
2. Verify secrets are set: `gcloud secrets versions access latest --secret="gemini-api-key"`
3. Check environment variables: `gcloud run services describe aibc-backend --region us-central1`

### CORS Errors

1. Verify `FRONTEND_URL` is set correctly
2. Check CORS configuration in `server.ts`
3. Ensure frontend URL is in allowed origins

### High Costs

1. Check Cloud Run metrics in Console
2. Review Firestore usage
3. Optimize scan frequency
4. Set up budget alerts

## Next Steps

1. Set up CI/CD pipeline (Cloud Build)
2. Configure custom domain for Cloud Run
3. Set up monitoring dashboards
4. Implement competitor tracking system
5. Set up automated backups

## Support

- Google Cloud Documentation: https://cloud.google.com/docs
- Cloud Run Documentation: https://cloud.google.com/run/docs
- Firestore Documentation: https://cloud.google.com/firestore/docs

