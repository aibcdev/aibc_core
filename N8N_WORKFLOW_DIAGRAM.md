# n8n Content Delivery Workflow - Simplified

## 🎯 Core Focus: Content Delivery from Website Details Only

The n8n workflow is **simplified** to focus solely on content delivery. Input: **Website details only**. Output: **High-quality reviewed content ready for Content Hub**.

---

## 📊 Complete Workflow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    INPUT: Website Details Only                   │
│                    (e.g., "company.com")                         │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    STEP 1: Digital Footprint Scan               │
│                    (Existing AIBC Scan Service)                │
│                                                                  │
│  • Scrapes website and social platforms                         │
│  • Extracts brand DNA, content, competitors                     │
│  • Generates initial content ideas                              │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              STEP 2: n8n Workflow Triggered                     │
│              (Automatic after scan completes)                    │
│                                                                  │
│  POST /api/n8n/workflow/orchestrate                             │
│  {                                                               │
│    workflowType: "scan-complete",                                │
│    brandDNA: {...},                                              │
│    extractedContent: {...},                                     │
│    competitorIntelligence: [...]                                │
│  }                                                               │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              STEP 3: Master CMO Agent (Orchestrator)           │
│              Determines which agents to run                      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
                ▼                         ▼
┌──────────────────────────┐  ┌──────────────────────────┐
│   RESEARCH AGENT          │  │   THINK AGENT            │
│   (Critical)              │  │   (Strategy Analysis)     │
│                           │  │                           │
│  • Filters LOW engagement │  │  • Analyzes brand DNA     │
│  • Spots BIG successes    │  │  • Optimizes strategy     │
│  • Extracts success       │  │  • Creates content plan   │
│    factors from           │  │                           │
│    competitors            │  │                           │
│  • Enhances competitor    │  │                           │
│    intelligence           │  │                           │
└────────────┬─────────────┘  └────────────┬──────────────┘
             │                            │
             └────────────┬───────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│              STEP 4: MEDIA AGENT                                │
│              (Content Asset Generation)                         │
│                                                                  │
│  • Generates images via FAL/Gemini                              │
│  • Creates video assets                                         │
│  • Optimizes for platforms                                      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              STEP 5: REVIEW AGENT (2 Filter Layers)             │
│                                                                  │
│  FILTER LAYER 1: Generation Mistakes                            │
│  ├─ Text Quality (grammar, clarity, engagement)                 │
│  ├─ Brand Alignment Check                                       │
│  ├─ Competitor Benchmarking                                     │
│  ├─ Strategic Alignment                                         │
│  └─ Platform Optimization                                       │
│                                                                  │
│  FILTER LAYER 2: Image/Media Failures                            │
│  ├─ Image URL Validation                                        │
│  ├─ Video URL Validation                                        │
│  └─ Media Quality Checks                                         │
│                                                                  │
│  FINAL CHECK:                                                    │
│  ├─ Placeholder text detection                                  │
│  ├─ Completeness verification                                   │
│  └─ Quality score ≥70/100, <3 issues                            │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              STEP 6: HELPER AGENT                               │
│              (Content Hub Delivery)                             │
│                                                                  │
│  • Stores reviewed content in .content-hub-reviewed.json         │
│  • Makes content available via API                              │
│  • NO email/Slack - content only                                │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              STEP 7: CONTENT HUB (Frontend)                     │
│              (Company Review)                                    │
│                                                                  │
│  • Polls /api/content-hub/reviewed every 30s                   │
│  • Displays reviewed content with "suggested" status             │
│  • Company reviews and approves/rejects                         │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              STEP 8: CALENDAR                                   │
│              (Approved Content Only)                            │
│                                                                  │
│  • Approved content added to calendar                            │
│  • Ready for scheduling                                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Simplified Agent Responsibilities

### 1. **Research Agent** (Critical)
- **Input**: Competitor intelligence from scan
- **Process**: 
  - Filters out bottom 30% low engagement content
  - Identifies top 20% high-performing content
  - Extracts success factors using LLM
- **Output**: Enhanced competitor intelligence with engagement analysis

### 2. **Think Agent** (Strategy)
- **Input**: Brand DNA, strategic insights, competitor intelligence
- **Process**: 
  - Analyzes content strategy
  - Optimizes based on competitor successes
  - Generates strategic recommendations
- **Output**: Optimized content strategy

### 3. **Media Agent** (Assets)
- **Input**: Content ideas, brand DNA
- **Process**: 
  - Generates images via FAL/Gemini
  - Creates video assets
  - Optimizes for platforms
- **Output**: Media assets for content

### 4. **Review Agent** (Quality)
- **Input**: Generated content + media
- **Process**: 
  - 2 filter layers (text + image)
  - 5-layer quality review
  - Final quality check
- **Output**: Reviewed content (quality score, issues, improvements)

### 5. **Helper Agent** (Delivery)
- **Input**: Reviewed content
- **Process**: 
  - Stores in `.content-hub-reviewed.json`
  - Makes available via API
  - **NO email/Slack** - content delivery only
- **Output**: Content ready for Content Hub

### 6. **Poster Agent** (Storage - Optional)
- **Input**: Reviewed content
- **Process**: 
  - Stores in Notion (if configured)
  - **NO Buffer posting** - storage only
- **Output**: Content stored for reference

---

## 📥 Input → Output Flow

```
Website Details (company.com)
    │
    ▼
Digital Footprint Scan
    │
    ├─→ Brand DNA
    ├─→ Extracted Content
    ├─→ Competitor Intelligence
    └─→ Strategic Insights
    │
    ▼
n8n Workflow Triggered
    │
    ├─→ Research Agent (filters low engagement, spots successes)
    ├─→ Think Agent (optimizes strategy)
    ├─→ Media Agent (generates assets)
    ├─→ Review Agent (2 filter layers, quality check)
    └─→ Helper Agent (delivers to Content Hub)
    │
    ▼
Content Hub (Company Review)
    │
    ├─→ Approve → Calendar
    └─→ Reject → Feedback Loop
```

---

## 🚫 Removed Services

The following have been **removed** from n8n workflow:
- ❌ Email service (Gmail integration)
- ❌ Slack notifications
- ❌ Buffer posting (storage only, no posting)
- ❌ Google Calendar scheduling (handled by frontend)

**Focus**: Content delivery only, based on website details input.

---

## 🔑 Key Simplifications

1. **Input**: Website details only (no user messages during workflow)
2. **Output**: Reviewed content in Content Hub (no email/Slack)
3. **Focus**: Content quality and delivery (no distribution automation)
4. **Review**: Company reviews in Content Hub before calendar (manual gate)

---

## 📝 API Endpoints Used

### Workflow Trigger
```
POST /api/n8n/workflow/orchestrate
{
  "workflowType": "scan-complete",
  "brandDNA": {...},
  "extractedContent": {...},
  "competitorIntelligence": [...]
}
```

### Content Hub Access
```
GET /api/content-hub/reviewed
Returns: { success: true, items: [...] }
```

### Content Approval
```
POST /api/content-hub/reviewed/:id/approve
POST /api/content-hub/reviewed/:id/reject
```

---

## 🎯 Success Criteria

1. ✅ Website details → High-quality reviewed content
2. ✅ Low engagement content filtered out
3. ✅ Competitor successes identified and learned from
4. ✅ 2 filter layers catch generation mistakes and image failures
5. ✅ Content appears in Content Hub for company review
6. ✅ Approved content ready for calendar

**No email. No Slack. Just content delivery.**





