# Quota Still 0 - Troubleshooting Guide

## Current Status
- ✅ Billing enabled
- ✅ Generative Language API enabled
- ❌ Quota still showing: **0** (limit: 0)

## Possible Issues

### 1. Wrong Project/API Key Mismatch
**Check**: Is the API key from the same project where billing is enabled?

**Solution**:
1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Check which project the API key belongs to
3. Verify billing is enabled for **that specific project**
4. Verify API is enabled for **that specific project**

### 2. Free Tier Not Available for Gemini 2.0
**Issue**: Google may have removed free tier for Gemini 2.0 models

**Check**: Try accessing quota dashboard:
- https://aistudio.google.com/usage?tab=rate-limit
- Look for "Free tier" vs "Paid tier" quotas

**Solution**: May need to:
- Use paid tier (billing already enabled)
- Or find a model that still has free tier

### 3. Quota Propagation Delay
**Issue**: Can take up to 1 hour for quota to activate

**Solution**: Wait longer, or check Google Cloud Console:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to: **APIs & Services > Quotas**
3. Search for: "Generative Language API"
4. Check if quotas are visible (even if 0)

### 4. API Key Restrictions
**Issue**: API key may have restrictions preventing usage

**Check**:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to: **APIs & Services > Credentials**
3. Click on your API key
4. Check **API restrictions** - should allow "Generative Language API"
5. Check **Application restrictions** - should allow your usage

### 5. Project-Level Quota Limits
**Issue**: Project may have quota limits set to 0

**Check**:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to: **IAM & Admin > Quotas**
3. Search for: "Generative Language API"
4. Check if any quotas are set to 0 or disabled

## Immediate Actions

### Action 1: Verify Project Match
```bash
# Check which project the API key belongs to
# The key should be from the same project where billing is enabled
```

### Action 2: Check Quota Dashboard
Visit: https://aistudio.google.com/usage?tab=rate-limit
- What does it show?
- Is there a "Free tier" section?
- Is there a "Paid tier" section?

### Action 3: Try Paid Tier
Since billing is enabled, try using paid tier directly:
- May have immediate quota
- Cost: ~$0.075 per 1M input tokens
- Per scan: ~$0.01-0.05

### Action 4: Create New API Key
1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Create a **new** API key
3. Make sure it's from the project with billing enabled
4. Test the new key

## Alternative: Use Different Model

If Gemini 2.0 has no free tier, we can:
1. **Switch to DeepSeek** (if you have key) - $0.001/1k tokens
2. **Switch to OpenAI** (if you have key) - $0.005/1k tokens  
3. **Use paid Gemini** - $0.075/1M tokens (very cheap)

## Next Steps

1. **Check quota dashboard**: https://aistudio.google.com/usage?tab=rate-limit
2. **Verify project match**: API key project = billing project
3. **Check API restrictions**: Key should allow Generative Language API
4. **Try paid tier**: Since billing is enabled, paid tier should work immediately
5. **Create new key**: If current key has issues

## Questions to Answer

1. What does the quota dashboard show? (https://aistudio.google.com/usage?tab=rate-limit)
2. Is the API key from the same project where billing is enabled?
3. Are there any API key restrictions?
4. Are you willing to use paid tier? (Very cheap: ~$0.01-0.05 per scan)

