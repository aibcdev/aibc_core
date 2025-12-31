# Strategy Hub OpenManus Enhancement

## Overview
Enhanced the Strategy Hub conversation to adopt an OpenManus-style iterative process that proactively suggests marketing ideas and automatically loops/updates the Content Hub and related data.

## Key Features Implemented

### 1. OpenManus-Style Iterative Suggestion Loop

**File**: `components/StrategyView.tsx`

- **Proactive Suggestions**: After data loads, the system automatically generates marketing suggestions
- **Iterative Loop**: After each user message, new suggestions are generated (2-second delay)
- **Content Hub Integration**: Suggestions automatically update Content Hub with new content ideas
- **Conversation Persistence**: Suggestions are saved to conversation history

**Implementation**:
```typescript
// Proactive suggestion generation after data loads
useEffect(() => {
  const suggestionTimer = setTimeout(() => {
    if (scanUsername && brandDNA && !isLoadingData && messages.length <= 1) {
      generateProactiveSuggestions();
    }
  }, 2000);
}, [scanUsername, brandDNA, isLoadingData]);

// Iterative loop after each response
setTimeout(() => {
  generateProactiveSuggestions();
}, 2000);
```

### 2. Marketing Suggestions API

**File**: `backend/src/routes/strategy.ts`

**New Endpoint**: `POST /api/strategy/suggest`

- Generates 5 proactive marketing suggestions
- Creates content ideas for each suggestion
- Uses task planning for structured execution
- Returns suggestions and content ideas ready for Content Hub

**Features**:
- Task planning integration for structured suggestion generation
- Content idea generation for each suggestion
- Conversation history awareness
- Brand DNA and competitor intelligence integration

### 3. Free Scraping APIs Integration

**File**: `backend/src/services/scrapingAPIService.ts` (NEW)

**Supported APIs**:
- **ScraperAPI** (free tier: 5k requests/month)
- **ScrapingBee** (free tier: 1k requests/month)
- **SerpAPI** (for search results)
- **Direct fetch** (fallback)

**Capabilities**:
- Website scraping
- Digital footprint analysis
- Competitor content scraping
- Analytics data extraction
- SEO analysis
- Social profile discovery

**Integration Points**:
- Research Agent: Uses scraping for deep competitor analysis
- Browser Agent: Enhanced with scraping API fallbacks
- Strategy Processing: Uses digital footprint data for suggestions

### 4. Enhanced Research Agent

**File**: `backend/src/services/agents/researchAgent.ts`

**New Functions**:
- `analyze-digital-footprint`: Uses scraping APIs for comprehensive footprint analysis
- `scrape-competitor`: Deep competitor content scraping
- `get-analytics-data`: Analytics and tracking detection

**Integration**:
- Automatically uses scraping APIs when browser automation is unavailable
- Falls back gracefully if APIs are not configured
- Enhances competitor intelligence with scraped data

### 5. Content Hub Auto-Update Loop

**File**: `components/StrategyView.tsx`

**Automatic Updates**:
- Suggestions trigger Content Hub regeneration
- Content ideas from suggestions are added to Content Hub
- Strategy events are dispatched with `forceContentRegenerate: true`
- localStorage is updated with new content ideas

**Flow**:
```
User Message → Strategy Processing → Marketing Suggestions Generated
  ↓
Content Ideas Created for Each Suggestion
  ↓
Content Hub Updated via Event Dispatch
  ↓
localStorage Updated with New Ideas
  ↓
Iterative Loop: New Suggestions Generated (2s delay)
```

## API Endpoints

### Strategy Suggestions
- `POST /api/strategy/suggest` - Generate proactive marketing suggestions

### Scraping APIs
- `POST /api/scraping/website` - Scrape website content
- `POST /api/scraping/digital-footprint` - Analyze digital footprint
- `POST /api/scraping/competitor` - Scrape competitor content
- `POST /api/scraping/analytics` - Get analytics data

## Environment Variables

Add these to your `.env` file for scraping APIs:

```bash
# Scraping APIs (all free tiers)
SCRAPERAPI_KEY=your_scraperapi_key          # Free: 5k requests/month
SCRAPINGBEE_API_KEY=your_scrapingbee_key     # Free: 1k requests/month
SERPAPI_KEY=your_serpapi_key                # For search results

# Enable features
ENABLE_TASK_PLANNING=true
ENABLE_BROWSER_AUTOMATION=true
```

## Usage Flow

### 1. Initial Load
- Strategy Hub loads scan data
- After 2 seconds, proactive suggestions are generated
- Suggestions appear in conversation
- Content ideas are added to Content Hub

### 2. User Interaction
- User sends a message
- Strategy is processed via n8n workflow
- Marketing suggestions are generated
- Response includes suggestions
- Content Hub is updated automatically

### 3. Iterative Loop
- After response, new suggestions are generated (2s delay)
- Suggestions are added to conversation
- Content Hub is updated with new ideas
- Process continues iteratively

### 4. Digital Footprint Enhancement
- Scraping APIs analyze brand's digital presence
- Competitor content is scraped for analysis
- Analytics data is extracted
- All data enhances LLM context for better suggestions

## Benefits

1. **Proactive Strategy**: System suggests ideas without waiting for user input
2. **Continuous Improvement**: Iterative loop keeps Content Hub updated
3. **Rich Context**: Scraping APIs provide real-time market data
4. **Automated Workflow**: Content Hub updates happen automatically
5. **Marketing-Focused**: Suggestions are specifically marketing-oriented

## Integration with Existing Systems

- **n8n Workflows**: Strategy processing triggers n8n workflows
- **Content Hub**: Auto-updates with new content ideas
- **Task Planning**: Uses OpenManus-style task planning
- **Feedback Loops**: Suggestions can be tracked for performance
- **Browser Automation**: Works alongside Playwright automation

## Next Steps

1. Configure scraping API keys in environment variables
2. Test proactive suggestion generation
3. Monitor Content Hub updates
4. Track suggestion performance via feedback service
5. Iterate based on user feedback

