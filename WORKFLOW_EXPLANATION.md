o bit, alonfse how many peolpel will # n8n Workflow Explanation - Content Delivery Focus

## 🎯 Simple Flow: Website → Content Hub

```
┌─────────────────┐
│  Website Input   │  (e.g., "company.com")
└────────┬─────────┘
         │
         ▼
┌─────────────────┐
│  Scan Service   │  Extracts brand DNA, content, competitors
│                 │  + Video Analysis (runs during scan)
└────────┬─────────┘
         │
         ▼
┌─────────────────┐
│  n8n Workflow   │  Orchestrates agents (uses video insights)
└────────┬─────────┘
         │
    ┌─────┴─────┐
    │           │
    ▼           ▼
┌────────┐ ┌────────┐
│Research│ │ Think  │  Filter low engagement, optimize strategy
└───┬────┘ └───┬────┘
    │          │
    └────┬─────┘
         │
         ▼
┌─────────────────┐
│  Media Agent     │  Generate images/videos
└────────┬─────────┘
         │
         ▼
┌─────────────────┐
│  Review Agent   │  2 Filter Layers + Quality Check
└────────┬─────────┘
         │
         ▼
┌─────────────────┐
│  Helper Agent   │  Deliver to Content Hub
└────────┬─────────┘
         │
         ▼
┌─────────────────┐
│  Content Hub    │  Company reviews content
└────────┬─────────┘
         │
         ▼
┌─────────────────┐
│    Calendar     │  Approved content scheduled
└─────────────────┘
```

---

## 📋 Step-by-Step Process

### 1. **Input: Website Details Only**
- User provides website (e.g., "company.com")
- No other input needed

### 2. **Scan Service**
- Scrapes website and social platforms
- Extracts:
  - Brand DNA (voice, tone, themes)
  - Content (posts, themes, engagement)
  - Competitors (intelligence, content)
  - Strategic insights
- **Video Analysis** (runs during scan):
  - Analyzes client video outputs (YouTube, TikTok, Instagram Reels, etc.)
  - Extracts video insights (content, performance, style, technical)
  - Enriches competitor intelligence with video patterns
  - Feeds insights into analytics, content hub, and strategy

### 3. **n8n Workflow Triggered**
- Automatically triggered after scan completes
- Master CMO Agent orchestrates:

#### **Video Analysis** (Integrated into Scan Service)
- **Runs During Scan**: Analyzes client video outputs as part of digital footprint scan
- **Extracts**: 
  - Content insights (topics, themes, messaging, hooks, CTAs)
  - Performance metrics (engagement rates, performance scores)
  - Style patterns (visual style, pacing, tone, editing style)
  - Technical analysis (quality, length, format optimization)
- **Identifies**: 
  - Top performing videos (top 20%)
  - Common success factors across videos
  - Content and style patterns
  - Improvement areas and recommendations
- **Enriches**:
  - Competitor intelligence with video insights
  - Analytics with video performance data
  - Content Hub with video recommendations
  - Strategic insights with video patterns
- **Output**: Video analysis results included in scan output for immediate use

#### **Research Agent** (Critical)
- **Filters**: Removes bottom 30% low engagement content
- **Spots**: Identifies top 20% high-performing content
- **Extracts**: Success factors from winners
- **Output**: Enhanced competitor intelligence
- **Uses**: Video insights from Video Analysis Agent

#### **Think Agent**
- Analyzes brand DNA + filtered competitor data + video insights
- Optimizes content strategy based on video performance patterns
- Creates content plan informed by video analysis

#### **Media Agent**
- Generates images via FAL/Gemini
- Creates video assets
- Optimizes for platforms

#### **Review Agent** (2 Filter Layers)
- **Layer 1**: Text quality (grammar, clarity, brand alignment)
- **Layer 2**: Image/media validation (URLs, quality)
- **Final**: Quality score ≥70/100, <3 issues

#### **Helper Agent** (Delivery Only)
- Stores reviewed content in `.content-hub-reviewed.json`
- Makes available via `/api/content-hub/reviewed`
- **NO email, NO Slack, NO calendar** - just delivery

#### **Poster Agent** (Storage Only)
- Optionally stores in Notion for reference
- **NO posting, NO distribution** - just storage

### 4. **Content Hub**
- Polls API every 30 seconds
- Displays reviewed content with "suggested" status
- Company reviews and approves/rejects

### 5. **Calendar**
- Approved content added to calendar
- Ready for scheduling

---

## 🚫 What's Removed

### Helper Agent
- ❌ Email (Gmail)
- ❌ Slack notifications
- ❌ Google Calendar scheduling
- ✅ **Only**: Content Hub delivery

### Poster Agent
- ❌ Buffer scheduling
- ❌ Content publishing
- ❌ Distribution preparation
- ✅ **Only**: Notion storage (optional, for reference)

---

## ✅ What Remains

1. **Video Analysis Agent**: Analyze client video outputs, extract insights
2. **Research Agent**: Filter low engagement, spot successes
3. **Think Agent**: Strategy optimization (informed by video insights)
4. **Media Agent**: Asset generation
5. **Review Agent**: Quality assurance (2 filters)
6. **Helper Agent**: Content Hub delivery
7. **Poster Agent**: Notion storage (optional)

---

## 🔑 Key Points

1. **Input**: Website details only
2. **Output**: Reviewed content in Content Hub
3. **Focus**: Content quality and delivery
4. **No Distribution**: Company handles distribution manually
5. **No Notifications**: No email/Slack - content appears in Content Hub

---

## 📊 Data Flow

```
Website → Scan (with Video Analysis integrated) 
→ Results: Brand DNA + Competitor Intelligence (enriched with video insights) 
→ Analytics + Content Hub (with video data)
→ n8n → Research (filter) → Think (optimize with video insights) 
→ Media (generate) → Review (quality) → Helper (deliver) 
→ Content Hub → Company Review → Calendar
```

**Key Change**: Video analysis now runs **during the scan** (not after), so all outputs (competitor info, analytics, content hub) are immediately enriched with video insights.

**Simple. Focused. Content delivery only.**

