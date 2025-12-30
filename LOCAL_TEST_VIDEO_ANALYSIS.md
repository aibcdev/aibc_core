# 🧪 Local Testing Guide - Video Analysis Feature

## ✅ Servers Running

Both backend and frontend servers are running:
- **Backend**: `http://localhost:3001`
- **Frontend**: `http://localhost:5178` (or check terminal for actual port)

## 🚀 How to Test Video Analysis

### Step 1: Open the Application
1. Open your browser and go to: **http://localhost:5178** (or check your terminal for the actual port)
2. You should see the AIBC dashboard
3. **Note**: If port 5174 is in use, Vite will automatically use the next available port (5175, 5176, etc.)

### Step 2: Test with a Company That Has Video Channels

**Recommended Test Subjects:**
- **Airbnb** (`airbnb.com`) - Large company with YouTube + Instagram
- **Notion** (`notion.so`) - Medium company with YouTube
- **Nike** (`nike.com`) - Large company with YouTube + TikTok

### Step 3: Start a Digital Footprint Scan

1. Click **"Get Started"** or navigate to the scan page
2. Enter one of the test companies (e.g., `airbnb.com`)
3. Select platforms: **YouTube, Twitter, Instagram, LinkedIn**
4. Click **"Scan Digital Footprint"**

### Step 4: Watch for Video Analysis

During the scan, you should see:
- ✅ **OUTPUT Only Verification** - Only brand content analyzed
- ✅ **Channel Detection** - YouTube/Instagram/TikTok channels detected
- ✅ **Video Fetching** - 2-3 videos fetched from channels
- ✅ **Video Analysis** - Videos analyzed for style and insights
- ✅ **Competitor Enrichment** - Competitors enriched with video insights

### Step 5: Check Results

After scan completes, check:

1. **Analytics View**
   - Look for video performance metrics
   - Check for video insights in competitor data

2. **Content Hub**
   - Video recommendations should appear
   - Style patterns from video analysis

3. **Competitor Intelligence**
   - Competitors should have video insights attached
   - Style recommendations based on video analysis

## 🔍 What to Look For

### ✅ Success Indicators:
- Scan completes successfully
- Logs show: `[VIDEO ANALYSIS] Starting video analysis...`
- Logs show: `[VIDEO ANALYSIS] Found X videos to analyze`
- Logs show: `[VIDEO ANALYSIS] ✅ Analyzed X videos`
- Logs show: `[VIDEO ANALYSIS] ✅ Enriched X competitors with video insights`
- Results include `videoAnalysis` object
- Competitors have `videoInsights` property

### ⚠️ If Video Analysis Doesn't Run:
- Check backend logs for errors
- Verify social links are detected (should show YouTube/Instagram/TikTok)
- Check that channels are accessible
- Verify Playwright is installed: `npm run install-playwright` in backend

## 📊 Expected Results

### For Airbnb:
- **Channels Detected**: YouTube, Instagram
- **Videos Analyzed**: 2-3 from each channel
- **Insights**: Style patterns, success factors, content themes
- **Competitors**: Enriched with video insights

### For Notion:
- **Channels Detected**: YouTube
- **Videos Analyzed**: 2-3 from YouTube
- **Insights**: Product demo style, educational content patterns
- **Competitors**: Enriched with video insights

## 🐛 Troubleshooting

### Backend Not Starting:
```bash
cd backend
npm install
npm run install-playwright
npm run dev
```

### Frontend Not Starting:
```bash
# In root directory
npm install
npm run dev
```

### Video Analysis Not Running:
1. Check backend console for errors
2. Verify `.env` has `GEMINI_API_KEY`
3. Check that social links are being detected
4. Verify Playwright browsers are installed

### No Videos Found:
- This is normal if the company doesn't have video channels
- Try a different company (Airbnb, Notion, Nike)
- Check that social links include YouTube/Instagram/TikTok

## 📝 Testing Checklist

- [ ] Backend running on port 3001
- [ ] Frontend running on port 5173
- [ ] Can access http://localhost:5173
- [ ] Can start a scan
- [ ] Scan completes successfully
- [ ] Video analysis executes (check logs)
- [ ] Videos are analyzed (check results)
- [ ] Competitors are enriched (check results)
- [ ] Video insights appear in UI

## 🎯 Quick Test Command

You can also test via API directly:

```bash
# Start a scan
curl -X POST http://localhost:3001/api/scan/start \
  -H "Content-Type: application/json" \
  -d '{
    "username": "airbnb.com",
    "platforms": ["youtube", "twitter", "instagram", "linkedin"],
    "scanType": "standard"
  }'

# Check scan status (replace SCAN_ID)
curl http://localhost:3001/api/scan/SCAN_ID/status

# Get results (replace SCAN_ID)
curl http://localhost:3001/api/scan/SCAN_ID/results
```

## 📈 Success Metrics

After testing, you should see:
- ✅ All scans complete successfully
- ✅ Video analysis runs for companies with channels
- ✅ Video insights enrich competitor intelligence
- ✅ Style patterns extracted from videos
- ✅ Content recommendations based on video analysis

---

**Ready to test!** Open http://localhost:5173 and start a scan with a company that has video channels.
