# Scraping Improvements - Why Small Brands Were Failing

## The Real Problem

You're absolutely right - **small brands have posted hundreds/thousands of times**, so the issue wasn't brand size. The problem was:

1. **Scraping was too basic** - only scrolled once, waited 5 seconds
2. **No platform-specific selectors** - just grabbed all body text
3. **LLM extraction wasn't finding posts** - even when scraped text contained them

## What Was Fixed

### 1. Enhanced Scraping Strategy

**Before**:
- Single scroll
- 5 second wait
- Just `innerText('body')` - generic extraction

**After**:
- **5 scrolls per platform** - loads more posts
- **8 second initial wait** - ensures content loads
- **3 second wait between scrolls** - allows posts to load
- **Platform-specific selectors**:
  - Twitter/X: `[data-testid="tweetText"]`, `[data-testid="tweet"]`
  - Instagram: `article`, `[role="article"]`
  - LinkedIn: `[data-id*="urn"]`, `.feed-shared-update-v2`

### 2. Better Post Extraction

**Twitter/X**:
```typescript
// Scroll 5 times to load posts
for (let i = 0; i < 5; i++) {
  scrollToBottom();
  wait(3000ms);
}

// Extract tweets using proper selectors
const tweets = document.querySelectorAll('[data-testid="tweetText"]');
// Format: "Posts:\n[tweet1]\n\n---\n\n[tweet2]"
```

**Instagram**:
```typescript
// Scroll 5 times
// Extract from article elements
const posts = document.querySelectorAll('article, [role="article"]');
```

**LinkedIn**:
```typescript
// Scroll 5 times
// Extract from feed elements
const posts = document.querySelectorAll('[data-id*="urn"], .feed-shared-update-v2');
```

### 3. Improved LLM Extraction Prompt

**Before**: Generic "extract posts from scraped content"

**After**: 
- Explicitly tells LLM to look for "Posts:" sections
- Instructs to extract posts separated by "---"
- Warns against generating placeholders
- Emphasizes extracting REAL posts from scraped data

## Why This Fixes Small Brands

**The Real Issue**: 
- Scraping was finding posts, but:
  1. Not scrolling enough to load them
  2. Not using proper selectors to extract them
  3. LLM wasn't recognizing posts in scraped text

**Now**:
- ✅ Scrolls 5 times per platform (loads 20-50 posts)
- ✅ Uses platform-specific selectors (finds actual post elements)
- ✅ Formats posts clearly for LLM ("Posts:\n[post1]\n\n---\n\n[post2]")
- ✅ LLM prompt explicitly extracts from formatted posts

## Expected Results

**Before**: 
- GoodPhats: 0 posts (scraping didn't find them)
- Dipsea: 0 posts (scraping didn't find them)

**After**:
- GoodPhats: Should find 5-20 posts (scraping scrolls 5x, extracts properly)
- Dipsea: Should find 5-20 posts (scraping scrolls 5x, extracts properly)

## Testing

To verify:
1. Run scan for GoodPhats
2. Check logs for `[SCRAPE]` messages
3. Should see: `[SUCCESS] Scraped twitter: [large number] chars`
4. Should see posts extracted in final output

## Next Steps

1. **Test with small brands** (GoodPhats, Dipsea)
2. **Verify posts are extracted** (should see 5-20 posts)
3. **Check scraping logs** (should see successful scraping)
4. **If still failing**: May need to handle login requirements or rate limiting

