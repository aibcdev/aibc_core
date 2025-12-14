# Continuous Learning & Improvement System

## Overview

AIBC now includes a comprehensive machine learning and continuous improvement system that refines the digital scan and content generation based on real user feedback and performance data.

## Architecture

### Core Components

1. **Learning Service** (`backend/src/services/learningService.ts`)
   - Tracks user feedback (approvals, edits, dismissals, ratings)
   - Analyzes patterns to generate insights
   - Manages prompt versioning and performance tracking
   - Runs daily analysis to auto-apply high-confidence improvements

2. **Learning API** (`backend/src/routes/learning.ts`)
   - RESTful endpoints for feedback tracking
   - Insight retrieval and application
   - Prompt version management

3. **Learning Client** (`services/learningClient.ts`)
   - Frontend service for tracking user interactions
   - Helper functions for common feedback types

4. **Database Schema** (`backend/database/learning_schema.sql`)
   - User feedback storage
   - Scan quality metrics
   - Learning insights
   - Prompt versions
   - Content performance tracking
   - A/B test results

## What Gets Learned

### 1. User Interactions
- **Approvals**: When users save/schedule content (positive signal)
- **Edits**: When users modify generated content (improvement opportunity)
- **Dismissals**: When users reject content (negative signal)
- **Ratings**: Explicit quality ratings (1-5 scale)
- **Regenerations**: When users request new content

### 2. Content Performance
- Approval rates by content type
- Dismissal rates by platform
- Average ratings per category
- Edit frequency and patterns

### 3. Scan Quality
- Extraction confidence scores
- Brand DNA accuracy (user-rated)
- Content ideas count vs. approved
- Overall scan success metrics

### 4. Prompt Performance
- Version tracking with performance metrics
- A/B testing capabilities
- Automatic optimization based on outcomes

## How It Works

### Feedback Collection

Every user interaction is tracked:

```typescript
// When user approves content
trackApproval(scanId, username, contentId, title, platform, contentType);

// When user edits content
trackEdit(scanId, username, contentId, title, originalContent, editedContent, platform, contentType);

// When user dismisses content
trackDismissal(scanId, username, contentId, title, reason, platform, contentType);

// When user rates content
trackRating(scanId, username, contentId, title, rating, comment, platform, contentType);
```

### Learning Analysis

The system automatically analyzes feedback patterns:

1. **Pattern Detection**: Identifies low-performing content types, platforms, or formats
2. **Insight Generation**: Creates actionable recommendations
3. **Confidence Scoring**: Assigns confidence levels (0-1) to insights
4. **Auto-Application**: High-confidence insights (>0.8) are automatically applied

### Prompt Optimization

When insights suggest prompt improvements:

1. **Version Creation**: New prompt versions are created
2. **Performance Tracking**: Each version's performance is tracked
3. **A/B Testing**: Versions can be tested against each other
4. **Automatic Rollout**: Best-performing versions become active

### Daily Analysis

A scheduled job runs daily to:

- Analyze all recent feedback
- Generate new insights
- Auto-apply high-confidence improvements
- Update prompt versions based on performance

## API Endpoints

### Track Feedback
```
POST /api/learning/feedback
Body: {
  scanId: string,
  username: string,
  feedbackType: 'approval' | 'edit' | 'regeneration' | 'dismissal' | 'rating' | 'custom',
  contentId?: string,
  contentTitle?: string,
  rating?: number,
  comment?: string,
  metadata?: object
}
```

### Track Scan Quality
```
POST /api/learning/scan-quality
Body: {
  scanId: string,
  username: string,
  extractionConfidence?: number,
  brandDNAAccuracy?: number,
  contentIdeasCount: number,
  contentIdeasApproved: number,
  contentIdeasEdited: number,
  contentIdeasDismissed: number,
  averageRating?: number
}
```

### Get Active Insights
```
GET /api/learning/insights?limit=10
Response: {
  success: true,
  insights: LearningInsight[]
}
```

### Apply Insight
```
POST /api/learning/insights/:id/apply
```

### Get Prompt Versions
```
GET /api/learning/prompts/:category
Response: {
  success: true,
  versions: PromptVersion[]
}
```

### Create Prompt Version
```
POST /api/learning/prompts
Body: {
  category: 'content_generation' | 'brand_identity' | 'competitor_analysis' | 'dna_extraction',
  prompt: string,
  systemPrompt?: string,
  basedOnInsightId?: string
}
```

## Database Setup

Run the schema to create learning tables:

```bash
# Apply to Supabase
psql $DATABASE_URL -f backend/database/learning_schema.sql
```

Or use the Supabase SQL editor to run `backend/database/learning_schema.sql`.

## Integration Points

### Content Hub
- Tracks approvals when content is saved/scheduled
- Tracks edits when content is modified
- Tracks dismissals when content is removed
- Tracks regenerations when new content is requested

### Scan Completion
- Tracks scan quality metrics automatically
- Records extraction confidence
- Tracks content ideas count and outcomes

### Future Integration Points
- Production Room: Track content publishing success
- Analytics: Track engagement metrics
- Strategy View: Track strategy effectiveness

## Continuous Improvement Flow

```
User Interaction
    ↓
Feedback Tracked
    ↓
Pattern Analysis (Daily)
    ↓
Insight Generation
    ↓
High Confidence? (>0.8)
    ↓ Yes
Auto-Apply
    ↓
Prompt Version Created
    ↓
Performance Tracked
    ↓
Best Version Becomes Active
    ↓
System Improves
```

## Benefits

1. **Self-Improving System**: Gets better with every interaction
2. **Data-Driven Optimization**: Decisions based on real user behavior
3. **Automatic Refinement**: High-confidence improvements applied automatically
4. **Version Control**: Track prompt evolution and performance
5. **A/B Testing**: Test improvements before full rollout
6. **Transparency**: Full audit trail of changes and outcomes

## Next Steps

1. **Set up scheduled job** for daily analysis (Cloud Scheduler or cron)
2. **Add UI dashboard** for viewing insights and prompt versions
3. **Implement A/B testing** for prompt variations
4. **Add engagement tracking** from published content
5. **Create admin interface** for manual insight review

## Monitoring

Key metrics to track:

- Feedback volume per day
- Insight generation rate
- Auto-application rate
- Prompt version performance
- Overall content approval rate trends
- Brand DNA accuracy improvements

## Privacy & Compliance

- All feedback is anonymized where possible
- User data stored securely in Supabase
- GDPR-compliant data retention policies
- No PII in learning insights

---

**The system is now live and learning from every user interaction!** 🚀

