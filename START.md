# 🚀 Quick Start Guide

## Prerequisites
- Node.js 18+ installed
- Gemini API key (get from https://makersuite.google.com/app/apikey)

## Step 1: Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY
npm install
npm run install-playwright
npm run dev
```

Backend will run on `http://localhost:3001`

## Step 2: Frontend Setup

```bash
# In root directory
npm install
# Create .env file with:
# VITE_API_URL=http://localhost:3001
# VITE_GEMINI_API_KEY=your_key_here (optional, for client-side fallback)
npm run dev
```

Frontend will run on `http://localhost:5173`

## Step 3: Test the Flow

1. Open `http://localhost:5173`
2. Click "Get Started"
3. Enter a username (e.g., "elonmusk" for Twitter)
4. Click "Scan Digital Footprint"
5. Watch the scan progress in real-time
6. View results when complete

## Troubleshooting

**Backend won't start:**
- Check that port 3001 is not in use
- Verify GEMINI_API_KEY is set in backend/.env

**Frontend can't connect:**
- Verify backend is running on port 3001
- Check VITE_API_URL in frontend .env
- Check browser console for CORS errors

**Scan fails:**
- Check backend logs for errors
- Verify Gemini API key is valid
- Some platforms may block scraping (this is expected)

## Production Deployment

See `IMMEDIATE_NEXT_STEPS.md` for Google Cloud deployment instructions.

