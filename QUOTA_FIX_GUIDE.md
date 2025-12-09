# 🔧 Fixing Gemini API Quota Issue

## Problem
Error shows `limit: 0` for all free tier metrics, suggesting quota is **not configured** rather than exceeded.

## Root Causes

### 1. **Generative AI API Not Enabled** (Most Likely)
The API needs to be enabled in your Google Cloud project.

**Fix:**
1. Go to: https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com
2. Select your project
3. Click **"Enable"**
4. Wait 1-2 minutes for activation

### 2. **Billing Account Not Linked**
Even the free tier sometimes requires a billing account to be linked (you won't be charged for free tier usage).

**Fix:**
1. Go to: https://console.cloud.google.com/billing
2. Link a billing account to your project
3. Note: Free tier usage won't charge you, but billing account is required

### 3. **Check Current Quota Status**
Verify your quota settings:

1. Go to: https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com/quotas
2. Look for:
   - `GenerateContentInputTokensPerModelPerMinute-FreeTier`
   - `GenerateRequestsPerMinutePerProjectPerModel-FreeTier`
   - `GenerateRequestsPerDayPerProjectPerModel-FreeTier`
3. These should show limits > 0 (not 0)

### 4. **Verify API Key Project**
Make sure your API key is from the same Google Cloud project where you enabled the API.

**Check:**
1. Go to: https://aistudio.google.com/apikey
2. Verify which project the key belongs to
3. Make sure that project has the API enabled

## Quick Checklist

- [ ] Generative AI API enabled in Google Cloud Console
- [ ] Billing account linked to project (even if not charged)
- [ ] API key created in same project
- [ ] Quota limits show > 0 (not 0)
- [ ] Wait 1-2 minutes after enabling API

## After Fixing

1. Wait 1-2 minutes for changes to propagate
2. Try scanning again
3. Check backend logs for any remaining errors

## Still Not Working?

If quota still shows `limit: 0` after enabling API and linking billing:
- Check if there are any project-level restrictions
- Verify the API key is valid and active
- Try creating a new API key in the same project

