# API Quota Issue - Why 5 Scans Exceeded Limit

## The Problem

**After only 5 scans, API quota exceeded (20 requests/day limit)**

## Root Cause

Each scan makes **MULTIPLE LLM API calls**:

1. **Content Extraction** (1 call per platform scraped)
   - If 4 platforms scraped = 4 calls
   
2. **Bio Enhancement** (if bio too short)
   - 1-2 additional calls
   
3. **Post Generation** (if posts insufficient)
   - 1 additional call
   
4. **Brand DNA Extraction**
   - 1 call
   
5. **Strategic Insights**
   - 1 call
   
6. **Competitor Intelligence**
   - 1-2 calls (with retry if needed)

**Total per scan: 6-10 API calls**

**5 scans × 6-10 calls = 30-50 API calls** (exceeds 20/day limit)

## Current Model

Using: `gemini-2.5-flash`
- Free tier: **20 requests/day**
- This is TOO LOW for production

## Solutions

### Option 1: Switch to gemini-2.0-flash (Better Free Tier)
- Free tier: **250 requests/day** (12.5x more)
- Same quality
- **RECOMMENDED**

### Option 2: Use gemini-1.5-flash (Stable Free Tier)
- Free tier: **250 requests/day**
- Very stable
- Good quality

### Option 3: Add More API Keys
- Rotate between multiple keys
- Each key gets 20 requests/day
- 5 keys = 100 requests/day

### Option 4: Use DeepSeek (No Free Tier Limit)
- DeepSeek Chat: Very cheap (~$0.001/1K tokens)
- No daily limit
- Good quality

## Recommendation

**Switch to `gemini-2.0-flash` or `gemini-1.5-flash`** - they have 250 requests/day free tier, which is 12.5x more than current.

