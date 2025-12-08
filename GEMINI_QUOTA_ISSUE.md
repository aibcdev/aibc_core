# Gemini API Quota Issue - Critical

## Problem

**All Gemini 2.0 models have a free tier limit of 0** for new API keys:
- `gemini-2.0-flash` - limit: 0
- `gemini-2.0-flash-001` - limit: 0  
- `gemini-2.0-flash-lite` - limit: 0

## Root Cause

Google has changed their free tier policy. New API keys may need:
1. **Billing enabled** - Even for free tier usage
2. **API activation** - Enable Gemini API in Google Cloud Console
3. **Time to activate** - New keys may take time to get quota

## Current Status

✅ **API Key #1**: `AIzaSyASENxqhs4oAeSXSNJugPPv8FkYKIqE5Kc`
- Status: Configured in `backend/.env`
- Quota: **0 requests/day (free tier)**
- Error: "limit: 0" for all 2.0 models

## Solutions

### Option 1: Enable Billing (Recommended)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select project: `AIBC-GCP-PROD01`
3. Enable billing (free tier still applies, but billing must be enabled)
4. Go to **APIs & Services > Enabled APIs**
5. Enable **Generative Language API**
6. Wait 5-10 minutes for quota to activate

### Option 2: Use Different Model (If Available)
Check if `gemini-1.5-flash` is available (it was removed from the API, but might be accessible via different endpoint).

### Option 3: Wait for Quota Reset
- Free tier quotas reset daily
- New keys may need 24 hours to activate
- Check quota at: https://ai.dev/usage?tab=rate-limit

### Option 4: Rotate to Paid Tier
- Upgrade to paid tier ($0.075 per 1M input tokens)
- Much higher limits
- Cost per scan: ~$0.01-0.05 depending on size

## Testing Quota

Check your current quota:
```bash
# Replace with your API key
curl "https://generativelanguage.googleapis.com/v1beta/models?key=YOUR_KEY" | jq '.models[] | select(.name | contains("flash"))'
```

## Next Steps

1. **Enable billing** in Google Cloud Console (required even for free tier)
2. **Enable Generative Language API** in the project
3. **Wait 5-10 minutes** for quota to activate
4. **Test again** with the same key
5. **Rotate to 4 more keys** once first key works

## Key Rotation Strategy

Once quota is working:
- **Key #1**: `AIzaSyASENxqhs4oAeSXSNJugPPv8FkYKIqE5Kc` ✅ Configured
- **Key #2**: `_________________` (pending)
- **Key #3**: `_________________` (pending)
- **Key #4**: `_________________` (pending)
- **Key #5**: `_________________` (pending)

Each key should have:
- Billing enabled
- API enabled
- Free tier: 250 requests/day (if available)
- Or paid tier: Higher limits

## Current Model Configuration

**File**: `backend/src/services/llmService.ts`
- Model: `gemini-2.0-flash-lite`
- Provider: `gemini-flash`
- Status: ✅ Configured, ⚠️ Waiting for quota

## Action Required

**URGENT**: Enable billing and API in Google Cloud Console, then test again.

