# Searchable.com Optimization Strategy
## Fast Competitor Analysis & Analytics Implementation

## Analysis of Searchable.com's Approach

Based on research, Searchable.com achieves fast competitor analysis by:

1. **Parallel Processing**: Uses parallel LLM API calls instead of sequential
2. **Smart Caching**: Caches competitor data for instant retrieval
3. **Pre-computed Rankings**: Maintains industry rankings in database
4. **URL-based Discovery**: Directly extracts competitor info from domain/URL
5. **Real-time Aggregation**: Combines multiple data sources simultaneously

## Our Optimization Strategy

### 1. Fast Competitor Discovery Service

**Current**: Sequential LLM calls, takes 30-60 seconds
**Target**: Parallel calls, cached results, < 5 seconds

#### Implementation:

```typescript
// backend/src/services/fastCompetitorService.ts

interface CompetitorCandidate {
  domain: string;
  name: string;
  similarityScore: number;
  industry: string;
  description: string;
}

export async function discoverCompetitorsFast(
  brandUrl: string,
  brandDNA: any,
  maxCompetitors: number = 5
): Promise<CompetitorCandidate[]> {
  // 1. Extract domain from URL
  const domain = extractDomain(brandUrl);
  
  // 2. Check cache first (Redis/Firestore)
  const cached = await getCachedCompetitors(domain);
  if (cached && !isCacheExpired(cached)) {
    return cached.competitors;
  }
  
  // 3. Parallel LLM calls for competitor discovery
  const discoveryPromises = [
    // Call 1: Industry competitors
    discoverByIndustry(brandDNA, domain),
    // Call 2: Similar offerings
    discoverByOffering(brandDNA, domain),
    // Call 3: Market position
    discoverByMarketPosition(brandDNA, domain)
  ];
  
  const [industryCompetitors, offeringCompetitors, positionCompetitors] = 
    await Promise.all(discoveryPromises);
  
  // 4. Merge and rank competitors
  const merged = mergeCompetitors(
    industryCompetitors,
    offeringCompetitors,
    positionCompetitors
  );
  
  // 5. Rank by similarity score
  const ranked = merged
    .sort((a, b) => b.similarityScore - a.similarityScore)
    .slice(0, maxCompetitors);
  
  // 6. Cache results
  await cacheCompetitors(domain, ranked);
  
  return ranked;
}

async function discoverByIndustry(brandDNA: any, domain: string): Promise<CompetitorCandidate[]> {
  const prompt = `Identify 3-5 direct competitors in the same industry as ${domain}.
  
Focus on:
- Similar target audience
- Comparable product/service offering
- Similar business model
- Similar market positioning

Brand DNA context:
- Industry: ${brandDNA.industry || 'unknown'}
- Core themes: ${brandDNA.themes?.join(', ') || 'N/A'}
- Voice: ${brandDNA.voice || 'N/A'}

Return JSON array of competitors with:
- domain (website URL)
- name (company name)
- similarityScore (0-1)
- industry
- description (brief)`;
  
  // Use Gemini Flash for speed (faster than Pro)
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  const result = await model.generateContent(prompt);
  // Parse and return
}

// Similar functions for discoverByOffering and discoverByMarketPosition
```

### 2. Instant Competitor Data Extraction

**Strategy**: Extract basic info immediately, deep analysis in background

```typescript
export async function extractCompetitorDataFast(
  competitorDomain: string
): Promise<CompetitorSnapshot> {
  // Parallel extraction of:
  // 1. Domain metadata (WHOIS, SSL cert, etc.)
  // 2. Homepage content (Playwright headless)
  // 3. Social profiles (quick lookup)
  // 4. Basic SEO data (title, description, keywords)
  
  const [metadata, homepage, social, seo] = await Promise.all([
    getDomainMetadata(competitorDomain),
    scrapeHomepageQuick(competitorDomain),
    findSocialProfiles(competitorDomain),
    extractSEOData(competitorDomain)
  ]);
  
  return {
    domain: competitorDomain,
    name: extractName(homepage, seo),
    industry: inferIndustry(homepage, seo),
    description: seo.description || homepage.description,
    socialProfiles: social,
    metadata,
    extractedAt: new Date()
  };
}
```

### 3. Analytics Dashboard Redesign

Match Searchable.com's interface:

**Key Components:**
1. **Filter Bar**: Date range, Platforms, Topics, Competitors dropdown
2. **AI Visibility Score**: Large score with trend graph (7-day)
3. **Industry Ranking**: Table with top competitors
4. **Metrics**: Mentions, Position, Change, Visibility %

### 4. Real-time Visibility Score Calculation

```typescript
export async function calculateVisibilityScore(
  brandDomain: string,
  competitors: string[],
  period: '7d' | '30d' | '90d'
): Promise<VisibilityScore> {
  // Parallel data collection
  const [brandMentions, competitorMentions, aiSearchData] = await Promise.all([
    getMentions(brandDomain, period),
    getCompetitorMentions(competitors, period),
    getAISearchRankings(brandDomain, period)
  ]);
  
  // Calculate score based on:
  // - Mention volume and quality
  // - AI search ranking positions
  // - Industry comparison
  // - Trend direction
  
  const score = calculateScore({
    mentions: brandMentions,
    rankings: aiSearchData,
    competitors: competitorMentions,
    period
  });
  
  return {
    score: score.value,
    change: score.change,
    trend: score.trend, // 7-day data points
    ranking: calculateRank(brandDomain, competitorMentions)
  };
}
```

## Implementation Priority

1. **Fast Competitor Discovery** (Highest Priority)
   - Parallel LLM calls
   - Caching layer
   - URL-based extraction

2. **Analytics Dashboard Redesign**
   - New AnalyticsView component
   - Visibility score calculation
   - Industry ranking table

3. **Real-time Data Updates**
   - Background polling
   - Incremental updates
   - Optimistic UI updates

## Performance Targets

- **Competitor Discovery**: < 5 seconds (from URL to ranked list)
- **Competitor Data Extraction**: < 3 seconds per competitor
- **Visibility Score Calculation**: < 2 seconds
- **Analytics Page Load**: < 1 second (with cached data)

