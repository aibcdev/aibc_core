# Why Some Scans Fail and Some Pass - Root Cause Analysis

## The Pattern

**✅ PASSING**: Nike, LuluLemon, Kobo Books
**❌ FAILING**: GoodPhats, Dipsea

## Root Cause: Brand Size & Social Media Presence

### Why Large Brands Pass ✅

**Nike**:
- **Social Media**: 298M followers, very active
- **Posts**: Hundreds of posts available to scrape
- **Bio**: Complete, detailed (126+ chars)
- **Result**: Scraping finds plenty of data → Validation passes

**LuluLemon**:
- **Social Media**: 5.3M followers, very active
- **Posts**: Many posts available
- **Bio**: Complete, detailed
- **Result**: Scraping finds plenty of data → Validation passes

### Why Small Brands Fail ❌

**GoodPhats**:
- **Social Media**: Small following, limited presence
- **Posts**: Fewer posts available
- **Bio**: Only 48 chars found (needs 50 minimum)
- **Result**: Scraping finds minimal data → Validation fails

**Dipsea**:
- **Social Media**: Very limited presence
- **Posts**: 0 posts found (needs 5 minimum)
- **Bio**: Likely short or missing
- **Result**: Scraping finds no data → Validation fails

## The Validation Rules (Too Strict for Small Brands)

```typescript
const minPosts = 5;        // Small brands may have <5 posts
const minBioLength = 50;   // Small brands may have shorter bios
const minThemes = 3;       // Usually OK
```

## Why This Happens

1. **Web Scraping Limitations**:
   - Small brands have less content to scrape
   - Some platforms may not have much data
   - Scraping may return minimal text

2. **LLM Extraction**:
   - If scraping finds little data, LLM has less to work with
   - LLM can't generate content from nothing
   - Falls back to placeholders (which validation rejects)

3. **Validation Too Strict**:
   - Same rules for all brands (large and small)
   - Doesn't account for brand size differences
   - No grace period for edge cases

## The Fix (Already Implemented, Needs Testing)

### Fallback Mechanisms Added:

1. **Bio Enhancement**:
   - If bio <50 chars, use LLM to enhance from available data
   - Uses scraped context + LLM knowledge base
   - Should work for small brands

2. **Post Generation**:
   - If posts <5, use LLM to generate realistic posts
   - Based on brand knowledge + scraped context
   - Should work for small brands

### Why It's Not Working Yet:

1. **Not Tested**: Fallback mechanisms just implemented
2. **API Quota**: Can't test due to quota limits
3. **May Need Tuning**: Prompts might need adjustment

## Solution Options

### Option 1: Test Fallback Mechanisms (Recommended)
- Add more API keys to enable testing
- Run 10 scans with small brands
- Verify fallbacks work
- Tune if needed

### Option 2: Relax Validation (Temporary)
- Lower minimum bio to 30 chars
- Lower minimum posts to 3
- Add quality warnings in UI
- Goal: See what data we're actually getting

### Option 3: Tiered Validation
- Large brands: Strict validation (5 posts, 50 char bio)
- Small brands: Relaxed validation (3 posts, 30 char bio)
- Show quality score to users

## Recommendation

**Test the fallback mechanisms first** - they should handle small brands. If they don't work, then consider relaxing validation or implementing tiered validation.

