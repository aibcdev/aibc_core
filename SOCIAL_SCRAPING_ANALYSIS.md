# Digital Footprint Scanner - Social Media Scraping Analysis & Improvement Plan

## Executive Summary

This document analyzes why social media platforms are being skipped during digital footprint scanning and provides a comprehensive improvement plan to fix the lack of social scraping and fetching.

## Current Issues Identified

### 1. **Overly Restrictive Domain-Based Input Handling** ⚠️ CRITICAL

**Location:** `scanService.ts` lines 444-460

**Problem:**
- When input is a domain (e.g., `example.com`), the system requires social links to be discovered from website scraping FIRST
- If website scraping fails or finds no social links, ALL platforms are skipped
- Even if some social links are found, platforms without discovered links are skipped

**Code Issue:**
```typescript
if (isDomain) {
  if (Object.keys(discoveredSocialLinks).length === 0) {
    addLog(scanId, `[SKIP] ${platform} - domain detected but NO social links found on website.`);
    continue; // Skip this platform
  } else {
    // We found some links, but not for this platform - that's okay, skip it
    addLog(scanId, `[SKIP] ${platform} - domain detected but this platform's link not found on website.`);
    continue; // Skip this platform
  }
}
```

**Impact:** High - This is the primary reason platforms are being skipped

---

### 2. **Website Scraping Failure Cascades to All Platforms** ⚠️ CRITICAL

**Location:** `scanService.ts` lines 402-405

**Problem:**
- If website scraping fails completely, the system logs "Will skip all platforms since website scraping failed"
- No fallback mechanism to try direct username construction

**Code Issue:**
```typescript
} catch (error: any) {
  addLog(scanId, `[DISCOVERY] ERROR: Failed to extract social links from website: ${error.message}`);
  addLog(scanId, `[DISCOVERY] Will skip all platforms since website scraping failed`);
}
```

**Impact:** High - Complete scan failure when website is unreachable or blocks scraping

---

### 3. **Insufficient Social Link Discovery** ⚠️ HIGH

**Location:** `scanService.ts` lines 1019-1680 (extractSocialLinksFromProfile, extractSocialLinksFromWebsite)

**Problems:**
- Relies heavily on HTML regex patterns which miss JavaScript-rendered content
- Limited pattern matching - may not catch all URL variations
- No fallback to try common username patterns (e.g., if domain is `example.com`, try `@example` on Twitter)
- LLM extraction only used as secondary fallback, not primary method

**Impact:** Medium-High - Missing social links that exist but aren't in standard HTML locations

---

### 4. **Verification Before Scraping Causes False Negatives** ⚠️ MEDIUM

**Location:** `scanService.ts` lines 500-532

**Problem:**
- For non-discovered links (constructed URLs), system verifies profile exists BEFORE scraping
- `verifyProfileExists()` can incorrectly reject valid profiles
- Verification is too strict in some cases (checking for login pages, not found pages)

**Code Issue:**
```typescript
const profileExists = await verifyProfileExists(content, actualPlatform);
if (profileExists && hasMinimalContent) {
  // Only add if verification passes
} else {
  addLog(scanId, `[SKIP] ${actualPlatform} profile not found or not accessible - skipping`);
}
```

**Impact:** Medium - Valid profiles being skipped due to overly strict verification

---

### 5. **Platform-Specific Scraping Limitations** ⚠️ MEDIUM

**Location:** `scanService.ts` lines 1931-2080

**Problems:**

#### Twitter/X:
- Selectors may be outdated (`[data-testid="tweet"]`)
- Only scrolls 3 times (may not load enough content)
- No handling for rate limiting or login walls

#### Instagram:
- Generic selectors (`article, [role="article"]`) may not be specific enough
- Instagram heavily blocks automated access
- No handling for private accounts or login requirements

#### LinkedIn:
- Selectors (`[data-id*="urn"], article, .feed-shared-update-v2`) may be outdated
- LinkedIn aggressively blocks scrapers
- No handling for profile vs company page differences

#### YouTube:
- Not implemented in platform-specific section (falls through to generic)
- YouTube requires different handling for channels vs users

**Impact:** Medium - Platform-specific issues causing scraping failures

---

### 6. **No Fallback to Direct Username Construction** ⚠️ MEDIUM

**Location:** `scanService.ts` lines 438-465

**Problem:**
- When domain is provided and no social links found, system doesn't try:
  - Extracting domain name and trying as username (e.g., `example.com` → try `@example`)
  - Common variations (company name, brand name)
  - Using connected accounts more aggressively

**Impact:** Medium - Missing opportunities to find profiles

---

### 7. **Browser/Scraping Infrastructure Issues** ⚠️ LOW-MEDIUM

**Location:** `scanService.ts` lines 1832-2200

**Problems:**
- Browser launch failures not handled gracefully
- Timeouts may be too short (20s for page load, 5s for content wait)
- No retry mechanism for failed scrapes
- Single browser instance may be rate-limited

**Impact:** Low-Medium - Infrastructure issues causing intermittent failures

---

## Improvement Recommendations

### Priority 1: Fix Domain-Based Input Handling (CRITICAL)

#### 1.1 Add Fallback Username Construction
```typescript
// When domain detected and no social links found:
if (isDomain && Object.keys(discoveredSocialLinks).length === 0) {
  // Try to extract potential username from domain
  const domainName = username.replace(/^https?:\/\//, '').replace(/^www\./, '').split('.')[0];
  
  // Try common variations
  const usernameVariations = [
    domainName,
    domainName.replace(/-/g, ''),
    domainName.replace(/_/g, ''),
  ];
  
  // Try each variation for this platform
  for (const variation of usernameVariations) {
    const testUrl = getProfileUrl(variation, platform);
    if (testUrl) {
      // Try to scrape and verify
      try {
        const content = await scrapeProfile(testUrl, platform, scanId);
        if (await verifyProfileExists(content, platform)) {
          profileUrl = testUrl;
          addLog(scanId, `[FALLBACK] Found ${platform} using domain-derived username: ${variation}`);
          break;
        }
      } catch (e) {
        // Continue to next variation
      }
    }
  }
}
```

#### 1.2 Don't Skip All Platforms When Website Scraping Fails
```typescript
// Instead of skipping all platforms, try direct username construction
if (isDomain && websiteScrapingFailed) {
  addLog(scanId, `[FALLBACK] Website scraping failed, trying direct username construction...`);
  // Try username variations (see 1.1)
}
```

#### 1.3 Allow Partial Platform Discovery
```typescript
// Don't skip a platform just because it wasn't in discovered links
// Always try to construct URL from username/domain as fallback
if (!discoveredUrl && !isDomain) {
  // Regular username - use it directly (already implemented)
  profileUrl = getProfileUrl(username, platform);
} else if (!discoveredUrl && isDomain) {
  // For domains, try username extraction as fallback
  // (see 1.1)
}
```

---

### Priority 2: Improve Social Link Discovery (HIGH)

#### 2.1 Enhanced LLM-Based Link Extraction
```typescript
// Make LLM extraction PRIMARY, not fallback
async function extractSocialLinksWithLLMEnhanced(
  html: string, 
  text: string, 
  url: string, 
  scanId?: string
): Promise<Record<string, string>> {
  const prompt = `Extract ALL social media profile links from this website content.
  Look for:
  - Direct links (twitter.com/username, instagram.com/username, etc.)
  - Usernames mentioned in text (@username)
  - Social icons that link to profiles
  - Footer/header social links
  - Bio sections with social links
  
  Return JSON with platform as key and full URL as value.
  Platforms to find: twitter, instagram, youtube, linkedin, tiktok, facebook`;
  
  // Use LLM to extract (more reliable than regex)
}
```

#### 2.2 Multiple Extraction Methods in Parallel
```typescript
// Run all extraction methods in parallel, merge results
const [regexLinks, browserLinks, llmLinks] = await Promise.all([
  extractSocialLinksFromHTMLDirect(html, url, scanId),
  extractSocialLinksFromWebsite(html, url, scanId),
  extractSocialLinksWithLLMEnhanced(html, text, url, scanId)
]);

// Merge with priority: LLM > Browser > Regex
const discoveredLinks = { ...regexLinks, ...browserLinks, ...llmLinks };
```

#### 2.3 Extract from Multiple Website Sections
```typescript
// Extract from:
// 1. Footer (most common location)
// 2. Header/navigation
// 3. About page
// 4. Contact page
// 5. Bio/team pages
```

---

### Priority 3: Improve Platform-Specific Scraping (MEDIUM-HIGH)

#### 3.1 Update Selectors and Add Fallbacks
```typescript
// Twitter/X - Multiple selector strategies
const tweetSelectors = [
  '[data-testid="tweet"]',
  'article[data-testid="tweet"]',
  '[role="article"]',
  '.tweet',
  '[data-testid="tweetText"]'
];

// Try each selector until one works
for (const selector of tweetSelectors) {
  const tweets = await page.$$eval(selector, ...);
  if (tweets.length > 0) break;
}
```

#### 3.2 Handle Anti-Bot Measures
```typescript
// Add delays, randomize user agents, use residential proxies if available
await page.setExtraHTTPHeaders({
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Referer': 'https://www.google.com/', // Make it look like coming from Google
});

// Randomize wait times
await page.waitForTimeout(2000 + Math.random() * 3000);
```

#### 3.3 Implement Retry Logic
```typescript
async function scrapeProfileWithRetry(
  url: string, 
  platform: string, 
  scanId?: string, 
  maxRetries: number = 3
): Promise<{ html: string; text: string; url: string }> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await scrapeProfile(url, platform, scanId);
    } catch (error) {
      if (attempt === maxRetries) throw error;
      await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
    }
  }
}
```

#### 3.4 Add YouTube-Specific Handling
```typescript
if (platform.toLowerCase() === 'youtube') {
  // Handle both channel and user formats
  // Extract channel ID, videos, descriptions
  // Use YouTube-specific selectors
}
```

---

### Priority 4: Relax Verification Logic (MEDIUM)

#### 4.1 Make Verification More Permissive
```typescript
async function verifyProfileExists(
  content: { html: string; text: string; url: string }, 
  platform: string
): Promise<boolean> {
  // Lower threshold for minimal content
  if (!content.text || content.text.length < 10) return false; // Was 20
  
  // Only reject if STRONG indicators of not found
  // Accept anything that might be valid content
  // Let LLM extraction handle empty/invalid profiles
}
```

#### 4.2 Skip Verification for Discovered Links
```typescript
// Already implemented (line 476-499), but ensure it's always used
if (isDiscovered) {
  // Always scrape discovered links without verification
  // They came from the website, so they're likely valid
}
```

---

### Priority 5: Add Comprehensive Logging and Monitoring (LOW-MEDIUM)

#### 5.1 Detailed Skip Reason Logging
```typescript
// Log WHY each platform was skipped
addLog(scanId, `[SKIP] ${platform} - Reason: ${skipReason}`);
// Reasons: 'no_discovered_link', 'verification_failed', 'scrape_error', etc.
```

#### 5.2 Metrics Collection
```typescript
// Track:
// - Success rate per platform
// - Common skip reasons
// - Average content extracted per platform
// - Scraping failure rates
```

---

## Implementation Priority

1. **Immediate (This Week):**
   - Fix domain-based input handling (Priority 1.1, 1.2, 1.3)
   - Improve social link discovery with LLM (Priority 2.1)
   - Add fallback username construction (Priority 1.1)

2. **Short-term (Next 2 Weeks):**
   - Update platform-specific selectors (Priority 3.1)
   - Implement retry logic (Priority 3.3)
   - Relax verification logic (Priority 4.1)

3. **Medium-term (Next Month):**
   - Handle anti-bot measures (Priority 3.2)
   - Add YouTube-specific handling (Priority 3.4)
   - Multiple extraction methods (Priority 2.2)
   - Extract from multiple website sections (Priority 2.3)

4. **Long-term (Ongoing):**
   - Comprehensive logging (Priority 5)
   - Monitor and iterate based on metrics

---

## Testing Strategy

### Test Cases to Validate Fixes:

1. **Domain Input with No Social Links on Website**
   - Input: `example.com` (no social links in HTML)
   - Expected: System tries username variations, doesn't skip all platforms

2. **Domain Input with Partial Social Links**
   - Input: `example.com` (has Twitter link, no Instagram link)
   - Expected: Twitter scraped from discovered link, Instagram tried via username construction

3. **Website Scraping Failure**
   - Input: `unreachable-site.com` (site blocks scraping)
   - Expected: Fallback to username construction, doesn't skip all platforms

4. **Valid Profile with Strict Verification**
   - Input: Valid Twitter profile that verification incorrectly rejects
   - Expected: More permissive verification allows it through

5. **JavaScript-Rendered Social Links**
   - Input: Website with social links only in JavaScript-rendered footer
   - Expected: LLM extraction finds links that regex misses

---

## Success Metrics

- **Platform Skip Rate:** Reduce from current (unknown) to <10%
- **Social Link Discovery Rate:** Increase from current to >80% for websites with social links
- **Scraping Success Rate:** Increase from current to >90% for valid profiles
- **False Negative Rate:** Reduce verification false negatives to <5%

---

## Code Locations Summary

| Issue | File | Lines | Priority |
|-------|------|-------|----------|
| Domain-based skipping | `scanService.ts` | 444-460 | CRITICAL |
| Website scraping failure | `scanService.ts` | 402-405 | CRITICAL |
| Social link extraction | `scanService.ts` | 1019-1680 | HIGH |
| Verification logic | `scanService.ts` | 500-532, 1780-1830 | MEDIUM |
| Platform scraping | `scanService.ts` | 1931-2080 | MEDIUM |
| URL construction | `scanService.ts` | 1744-1777 | MEDIUM |

---

## Next Steps

1. Review this analysis with the team
2. Prioritize fixes based on current user impact
3. Implement Priority 1 fixes immediately
4. Test fixes with real-world examples
5. Monitor metrics and iterate

---

**Document Version:** 1.0  
**Date:** 2025-01-05  
**Author:** AI Analysis

