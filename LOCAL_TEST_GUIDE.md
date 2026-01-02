# Local Testing Guide - Content Hub Central Hub

## ✅ Changes to Test

### 1. Brand Profile Auto-Population

**Test Steps:**
1. Run a scan with a website (e.g., `script.tv`)
2. Go to Brand Assets → Profile tab
3. Verify:
   - ✅ All fields are read-only (lock icons visible)
   - ✅ Name, industry, description auto-filled from scan
   - ✅ Logo auto-populated (if extracted from website)
   - ✅ Cannot manually edit fields

**Expected:**
- Brand profile shows data from `brandIdentity` in scan results
- Fields have lock icons and are disabled
- Message: "Brand profile is auto-filled from your website scan"

### 2. ALL Sections → Content Hub via n8n

**Test Brand Assets Update:**
1. Go to Brand Assets
2. Add a color, font, or material
3. Check backend logs: `tail -f /tmp/backend.log | grep "brand-assets"`
4. Verify n8n workflow is triggered
5. Check Content Hub for updates

**Test Strategy Update:**
1. Go to Strategy
2. Send a message (e.g., "focus on video content")
3. Verify Content Hub receives update
4. Check for new content suggestions

**Test Scan Complete:**
1. Run a new scan
2. Verify scan-complete workflow triggers
3. Check Content Hub for new content

### 3. UI Simplified - Content Quality Focus

**Test Content Hub:**
1. Go to Content Hub
2. Verify:
   - ✅ Only 2 filter buttons: "ALL CONTENT" | "NEW SUGGESTIONS"
   - ✅ Content titles are larger and prominent
   - ✅ Less metadata noise
   - ✅ Focus on content quality

**Expected:**
- Clean, minimal filters
- Content titles are the star
- Easy to see what's new

## 🧪 Quick Test Commands

```bash
# Check backend is running
curl http://localhost:3001/health

# Test brand assets route
curl -X POST http://localhost:3001/api/brand-assets/update \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","materials":[],"colors":[],"fonts":[]}'

# Watch backend logs
tail -f /tmp/backend.log | grep -E "(brand-assets|Content Hub|n8n)"
```

## 📊 What to Look For

1. **Brand Profile:**
   - Auto-populated fields
   - Read-only indicators
   - Logo from website

2. **Content Hub Updates:**
   - New content after brand assets change
   - New content after strategy change
   - All changes flow to Content Hub

3. **UI Simplification:**
   - Minimal filters
   - Prominent content titles
   - Clean interface

## 🚀 Start Testing

1. **Frontend:** http://localhost:5174
2. **Backend:** http://localhost:3001
3. **OpenManus:** http://localhost:8000 (if enabled)

Navigate to:
- Brand Assets → Profile (check auto-population)
- Content Hub (check simplified UI)
- Strategy (send message, check Content Hub updates)
