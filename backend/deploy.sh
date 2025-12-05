#!/bin/bash

# Google Cloud Deployment Script

set -e

echo "🚀 Deploying AIBC Backend to Google Cloud Run..."
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud CLI not found. Please install: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if logged in
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo "⚠️  Not logged in to gcloud. Running login..."
    gcloud auth login
fi

# Get project ID
PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
if [ -z "$PROJECT_ID" ]; then
    echo "❌ No GCP project set. Please run: gcloud config set project YOUR_PROJECT_ID"
    exit 1
fi

echo "📦 Project ID: $PROJECT_ID"
echo ""

# Enable required APIs
echo "🔧 Enabling required APIs..."
gcloud services enable \
    cloudbuild.googleapis.com \
    run.googleapis.com \
    containerregistry.googleapis.com \
    secretmanager.googleapis.com \
    --project=$PROJECT_ID

# Build and deploy
echo "🏗️  Building and deploying..."
gcloud builds submit --config=cloudbuild.yaml --project=$PROJECT_ID

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📡 Your API is now available at:"
gcloud run services describe aibc-backend --region=us-central1 --format="value(status.url)" --project=$PROJECT_ID
echo ""
echo "💡 Don't forget to:"
echo "   1. Set environment variables in Cloud Run console"
echo "   2. Update frontend VITE_API_URL to point to the deployed URL"
echo "   3. Set up secrets in Secret Manager for GEMINI_API_KEY"

