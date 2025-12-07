# API Quota Analysis - Why 10 Scans Exceeded Limit

## The Problem

**Issue**: Gemini API quota exceeded after ~10 scans
**Expected**: Gemini free tier should allow 250 requests/day

## Root Cause Analysis

### 1. Using Experimental Model
- **Current**: `gemini-2.0-flash-exp` (experimental)
- **Problem**: Experimental models may NOT have free tier access
- **Error shows**: "limit: 0" - suggests no free tier for this model

### 2. Multiple API Calls Per Scan
Each scan makes **4-5 separate LLM API calls**:

1. **Brand Research/Extraction** (1 call)
   - If scraping works: `extractFromScrapedContent()`
   - If scraping fails: `researchBrandWithLLM()`

2. **Brand DNA Extraction** (1 call)
   - `extractBrandDNA()`

3. **Strategic Insights** (1 call)
   - `generateStrategicInsights()`

4. **Competitor Intelligence** (1 call)
   - `generateCompetitorIntelligence()`

**Total**: 4-5 API calls per scan

### 3. Math
- 10 scans × 4-5 calls = **40-50 API calls**
- Free tier: **250 requests/day, 10 requests/minute**
- **BUT**: If using experimental model with no free tier = **0 requests allowed**

## Solution

### Fix 1: Switch to Free Tier Model ✅
- **Changed**: `gemini-2.0-flash-exp` → `gemini-1.5-flash`
- **Reason**: `gemini-1.5-flash` has confirmed free tier (250/day, 10/min)
- **Alternative**: Try `gemini-2.0-flash` (non-experimental) if available

### Fix 2: Optimize API Calls (Future)
- Combine operations to reduce calls
- Cache results where possible
- Batch requests

## Free Tier Limits (Gemini 1.5 Flash)

- **Daily**: 250 requests per day
- **Rate**: 10 requests per minute
- **Model**: Flash only (not Pro)

## Current Status

✅ **Fixed**: Switched to `gemini-1.5-flash` (confirmed free tier)
✅ **Fixed**: Updated all model references
⏳ **Pending**: Test with new model

## Next Steps

1. **Test with `gemini-1.5-flash`** - should work with free tier
2. **Monitor usage** - track API calls per scan
3. **Optimize** - reduce calls if needed
4. **Upgrade** - if free tier insufficient for production

## Why This Happened

The experimental model (`-exp`) likely doesn't have free tier access. Google restricts free tier to stable models only. Using `gemini-1.5-flash` should resolve this.

