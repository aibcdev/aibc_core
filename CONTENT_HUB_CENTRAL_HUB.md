# Content Hub - Central Hub Implementation

## Core Principle: ALL Roads Lead to Content Hub

Every change, update, or piece of information should flow to Content Hub via n8n workflows.

## Implementation Status

### ✅ Completed

1. **Brand Assets → Content Hub**
   - Route: `POST /api/brand-assets/update`
   - Triggers: `brand-assets-update` workflow
   - Auto-populates brand profile from scan (read-only)
   - Logo extracted from website during scan

2. **Strategy → Content Hub**
   - Route: `POST /api/strategy/process`
   - Triggers: `strategy-modification` workflow
   - Already implemented ✅

3. **Scan Complete → Content Hub**
   - Triggers: `scan-complete` workflow
   - Already implemented ✅
   - Now includes brandIdentity with logoUrl

### 🔄 To Complete

4. **Competitor Updates → Content Hub**
   - Need to add route: `POST /api/competitors/update`
   - Trigger: `competitor-update` workflow
   - When competitors are added/removed

5. **UI Simplification**
   - Remove noise, focus on content quality
   - Hide unnecessary filters/options
   - Make content quality the primary focus

## Workflow Types

All workflows should end with Helper Agent sending to Content Hub:

- `scan-complete` → Content Hub ✅
- `strategy-modification` → Content Hub ✅
- `brand-assets-update` → Content Hub ✅
- `competitor-update` → Content Hub (TODO)

## Brand Profile Auto-Population

**Before:**
- Manual entry fields for name, logo, industry, etc.

**After:**
- Auto-populated from `brandIdentity` in scan results
- Fields are read-only
- Logo extracted from website during scan
- User cannot manually edit (must run new scan)

## Logo Extraction

During website scan:
1. Check common logo selectors (img[alt*="logo"], header img, etc.)
2. Fallback to favicon
3. Store in `brandIdentity.logoUrl`
4. Include in scan results
5. Auto-populate brand profile

## Next Steps

1. Add competitor update route
2. Simplify Content Hub UI
3. Test all workflows end at Content Hub
