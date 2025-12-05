# LLM-Powered Web Scanning Architecture
## Zero API Cost Approach for Standard Scans

---

## Overview

Instead of using expensive platform APIs, we use **LLM-powered web scanning** to extract brand OUTPUT from public profiles. This approach:

- ✅ **Zero API Costs** - No platform API fees
- ✅ **Works for All Users** - Public profiles are accessible
- ✅ **Scalable** - Can handle unlimited scans
- ✅ **Cost Effective** - Only ~$0.40-0.60 per scan (LLM processing)

---

## Architecture

```
User Input (Username/Handle)
         ↓
┌─────────────────────────────────────┐
│   Profile URL Discovery             │
│   - twitter.com/username            │
│   - youtube.com/@channel             │
│   - linkedin.com/in/username        │
│   - instagram.com/username          │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│   Web Scraping (Playwright)         │
│   - Load public profile page        │
│   - Extract HTML content            │
│   - Handle JavaScript rendering     │
│   - Respect robots.txt              │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│   LLM Content Extraction (Gemini)   │
│   - Analyze page content           │
│   - Extract OUTPUT only             │
│   - Filter mentions/retweets        │
│   - Structure data                  │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│   OUTPUT Validation                 │
│   - Verify author matches           │
│   - Remove non-OUTPUT content       │
│   - Quality check                   │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│   Brand DNA Extraction              │
│   - Voice & tone analysis           │
│   - Topic modeling                  │
│   - Content themes                  │
└──────────────┬──────────────────────┘
               ↓
         Brand DNA Profile
```

---

## Implementation

### Step 1: Profile URL Discovery

```python
def discover_profile_urls(username: str, platforms: List[str]) -> Dict[str, str]:
    """
    Construct public profile URLs for given username
    """
    urls = {}
    
    for platform in platforms:
        if platform == 'twitter':
            urls['twitter'] = f"https://twitter.com/{username}"
        elif platform == 'youtube':
            # Try different URL formats
            urls['youtube'] = [
                f"https://youtube.com/@{username}",
                f"https://youtube.com/c/{username}",
                f"https://youtube.com/user/{username}"
            ]
        elif platform == 'linkedin':
            urls['linkedin'] = f"https://linkedin.com/in/{username}"
        elif platform == 'instagram':
            urls['instagram'] = f"https://instagram.com/{username}"
    
    return urls
```

### Step 2: Web Scraping (Playwright)

```python
from playwright.async_api import async_playwright

async def scrape_public_profile(url: str) -> str:
    """
    Scrape public profile page using Playwright
    """
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        # Set user agent to avoid detection
        await page.set_extra_http_headers({
            'User-Agent': 'Mozilla/5.0 (compatible; AIBCBot/1.0)'
        })
        
        # Load page and wait for content
        await page.goto(url, wait_until='networkidle')
        
        # Wait for dynamic content to load
        await page.wait_for_timeout(2000)
        
        # Extract page content
        content = await page.content()
        
        # Also get visible text (for LLM processing)
        text_content = await page.inner_text('body')
        
        await browser.close()
        
        return {
            'html': content,
            'text': text_content,
            'url': url
        }
```

### Step 3: LLM Content Extraction

```python
from google.genai import GoogleGenAI

class LLMContentExtractor:
    def __init__(self):
        self.llm = GoogleGenAI(api_key=os.getenv('GEMINI_API_KEY'))
    
    async def extract_output_content(
        self, 
        scraped_content: dict, 
        username: str, 
        platform: str
    ) -> dict:
        """
        Use Gemini to extract OUTPUT content from scraped page
        """
        
        prompt = f"""
        You are analyzing a public {platform} profile page for user: {username}
        
        IMPORTANT: Extract ONLY content published BY {username} (OUTPUT only).
        DO NOT extract:
        - Mentions of {username} by others
        - Retweets or shares
        - Comments from other users
        - Content about {username}
        - Third-party content
        
        From this page content, extract:
        
        1. Profile Information:
           - Bio/description
           - Profile picture URL
           - Verification status
           - Follower/following counts (if visible)
        
        2. Posts/Content Published BY {username}:
           - Post text/content
           - Timestamps
           - Media (images, videos) URLs
           - Engagement metrics (if visible)
        
        3. Content Analysis:
           - Topics/themes
           - Writing style
           - Posting frequency patterns
        
        Page Content:
        {scraped_content['text']}
        
        Return structured JSON:
        {{
            "profile": {{
                "bio": "...",
                "verified": true/false,
                "profile_image": "url"
            }},
            "posts": [
                {{
                    "content": "...",
                    "timestamp": "...",
                    "media_urls": ["..."],
                    "engagement": {{"likes": 0, "shares": 0}}
                }}
            ],
            "content_themes": ["..."],
            "extraction_confidence": 0.0-1.0
        }}
        """
        
        response = await self.llm.models.generate_content({
            model: 'gemini-2.0-flash-exp',
            contents: prompt
        })
        
        # Parse JSON response
        extracted_data = json.loads(response.text)
        
        return extracted_data
```

### Step 4: OUTPUT Validation

```python
def validate_output_only(extracted_data: dict, username: str) -> dict:
    """
    Validate that all extracted content is OUTPUT from the brand
    """
    validated_posts = []
    
    for post in extracted_data['posts']:
        # Check if post is from the brand
        if self._is_from_brand(post, username):
            # Remove any mentions or retweets
            if not self._is_mention_or_retweet(post):
                validated_posts.append(post)
    
    return {
        'profile': extracted_data['profile'],
        'posts': validated_posts,
        'content_themes': extracted_data['content_themes'],
        'confidence': extracted_data['extraction_confidence']
    }

def _is_from_brand(self, post: dict, username: str) -> bool:
    """Verify post is from brand account"""
    # Check author field, username in content, etc.
    return post.get('author') == username or username in post.get('author_id', '')

def _is_mention_or_retweet(self, post: dict) -> bool:
    """Check if post is a mention or retweet"""
    content = post.get('content', '').lower()
    return content.startswith('rt @') or content.startswith('retweeting')
```

### Step 5: Brand DNA Extraction

```python
class BrandDNAExtractor:
    def __init__(self):
        self.llm = GoogleGenAI(api_key=os.getenv('GEMINI_API_KEY'))
    
    async def extract_brand_dna(self, validated_content: dict) -> dict:
        """
        Extract brand DNA from validated OUTPUT content
        """
        
        # Aggregate all post content
        all_posts = [post['content'] for post in validated_content['posts']]
        combined_text = '\n\n'.join(all_posts)
        
        prompt = f"""
        Analyze this brand's content to extract their unique DNA:
        
        Content:
        {combined_text}
        
        Extract:
        
        1. Voice & Tone:
           - Writing style (formal, casual, technical, etc.)
           - Vocabulary patterns
           - Sentence structure
           - Emotional tone
        
        2. Content Themes:
           - Main topics they discuss
           - Value propositions
           - Messaging pillars
        
        3. Visual Identity (from descriptions):
           - Color preferences
           - Style (minimalist, bold, etc.)
        
        4. Engagement Patterns:
           - Posting frequency
           - Best performing content types
        
        Return structured JSON with brand DNA profile.
        """
        
        response = await self.llm.models.generate_content({
            model: 'gemini-2.0-flash-exp',
            contents: prompt
        })
        
        brand_dna = json.loads(response.text)
        
        return brand_dna
```

---

## Cost Breakdown

### Per Standard Scan (LLM-Powered - FREE):

- **Web Scraping (Playwright):**
  - Compute: ~$0.02 (Cloud Run, 2-3 minutes) - covered by credits initially
  
- **LLM Content Extraction:**
  - Use free tier LLMs (Gemini free tier, or self-hosted models)
  - Cost: **$0.00** (free tier)
  
- **Brand DNA Analysis:**
  - Use free tier LLMs
  - Cost: **$0.00** (free tier)
  
- **Storage:**
  - ~$0.03 (100-500MB stored) - minimal
  
- **Total: ~$0.00-0.05 per scan** (virtually free with free LLM tiers)

### Comparison:

| Method | Cost per Scan | Quality | Historical Data |
|--------|--------------|---------|----------------|
| **LLM Web Scanning** | **$0.00-0.05** (free LLMs) | Good | Recent (public) |
| **API Deep Scan** | $7.00 | Excellent | Full 10-year |

---

## Advantages

1. **Cost Effective:** 10-15x cheaper than API-based
2. **Scalable:** No API rate limits
3. **Universal:** Works for any public profile
4. **Fast:** Can process multiple platforms in parallel
5. **Flexible:** Easy to add new platforms

## Limitations

1. **Historical Data:** Limited to what's visible on public pages
2. **Accuracy:** Depends on LLM extraction quality
3. **Rate Limiting:** Need to respect platform ToS (scraping limits)
4. **JavaScript:** Some platforms require JS rendering

## Mitigation Strategies

1. **Caching:** Cache scraped pages to reduce re-scraping
2. **Respectful Scraping:** Rate limiting, robots.txt compliance
3. **Quality Validation:** Confidence scoring, human review for edge cases
4. **Hybrid Approach:** Use LLM for standard, API for deep scans

---

## Implementation Priority

1. **Week 1-2:** Twitter LLM scanner (POC)
2. **Week 3-4:** Add YouTube, LinkedIn, Instagram
3. **Week 5-6:** OUTPUT validation system
4. **Week 7-8:** Brand DNA extraction
5. **Week 9+:** Deep scan (API) for Premium tier

---

*This architecture enables cost-effective scanning for all users while maintaining quality through LLM-powered extraction.*

