# Why `limit: 0` Means Quota NOT Configured (Not Rate Limited)

## The Critical Error Detail

The error shows:
```
Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_requests
limit: 0, model: gemini-2.0-flash
```

**`limit: 0` means the quota is NOT configured, NOT that you exceeded it.**

## What `limit: 0` Actually Means

1. **API Not Enabled**: The Generative AI API might not be enabled in your Google Cloud project
2. **Billing Not Linked**: Even free tier requires a billing account to be linked (you won't be charged)
3. **Project Restrictions**: The project might have restrictions preventing API usage
4. **New Key/Project**: The API key was created but the project wasn't fully set up

## Why This Happens with a "Brand New Key"

A brand new API key doesn't automatically:
- Enable the Generative AI API in the project
- Link billing (even for free tier)
- Configure quotas

You need to:
1. Enable the API: https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com
2. Link billing: https://console.cloud.google.com/billing (won't charge for free tier)
3. Wait 1-2 minutes for activation

## The Fix

**For now, we've completely removed all client-side Gemini calls** so this doesn't matter. The backend uses DeepSeek instead.

But if you want Gemini to work later:
1. Enable the API in Google Cloud Console
2. Link a billing account
3. Quota limits will show > 0 (not 0)

