# API Key Rotation Guide

## Current Key (Key #1)
```
YOUR_API_KEY_HERE
```

**Status**: ✅ Configured in `backend/.env` | ⚠️ **Quota: 0** (needs billing/API activation)

## Where to Update Keys

### 1. Backend Local Development
**File**: `backend/.env`
```bash
GEMINI_API_KEY=YOUR_API_KEY_HERE
```

### 2. Cloud Run (Production)
**Method**: GCP Secret Manager
```bash
# Update secret
gcloud secrets versions add gemini-api-key --data-file=- <<< "YOUR_API_KEY_HERE"

# Redeploy (if needed)
gcloud run services update aibc-backend --region us-central1
```

### 3. Netlify (Frontend - if needed)
**Location**: Site Settings > Environment Variables
- Variable: `VITE_GEMINI_API_KEY`
- Value: `YOUR_API_KEY_HERE`

## Key Rotation Strategy

If you want to rotate 5 keys for load distribution:

### Option 1: Sequential Rotation
- Use one key until quota exhausted
- Rotate to next key
- Track usage per key

### Option 2: Round-Robin
- Distribute requests across keys
- Requires code changes to implement

### Option 3: Single Key (Recommended)
- Use one key with free tier (250/day)
- Upgrade to paid if needed
- Simpler to manage

## Free Tier Limits (per key)

⚠️ **IMPORTANT**: New API keys show quota of 0 until:
1. **Billing is enabled** in Google Cloud Console (even for free tier)
2. **Generative Language API is enabled** in the project
3. **Wait 5-10 minutes** for quota to activate

Once activated:
- **Daily**: 250 requests per day (if available)
- **Rate**: 10 requests per minute
- **Model**: gemini-2.0-flash-lite (currently configured)

## Usage Per Scan

Each scan makes **4-5 API calls**:
1. Brand research/extraction
2. Brand DNA extraction
3. Strategic insights
4. Competitor intelligence
5. (Optional) Additional analysis

**Math**: 250 requests ÷ 5 calls = **50 scans per day per key**

## Next Keys (When Needed)

When you get the other 4 keys, add them here:
- Key #2: `_________________`
- Key #3: `_________________`
- Key #4: `_________________`
- Key #5: `_________________`

## Testing

After updating the key:
1. **Enable billing** in Google Cloud Console (project: `AIBC-GCP-PROD01`)
2. **Enable Generative Language API** in APIs & Services
3. **Wait 5-10 minutes** for quota activation
4. Restart backend: `cd backend && npm run dev`
5. Test single scan: Check logs for API errors
6. Run full test: `node test-scans.js`

## Current Issue

**Error**: "limit: 0" for all Gemini 2.0 models
**Solution**: See `GEMINI_QUOTA_ISSUE.md` for detailed troubleshooting

