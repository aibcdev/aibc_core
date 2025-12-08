# 🚨 URGENT: API Key Leaked - Action Required

## What Happened

Your Gemini API key was **committed to the Git repository** in `COPY_PASTE_COMMANDS.md`. Google detected this and **revoked the key** for security.

## Immediate Actions

### 1. Generate New API Key (REQUIRED)

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Click on "Get API Key" or navigate to API Keys section
3. **Create a new API key**
4. **Copy it immediately** (you won't see it again)

### 2. Update Environment Variables

**Backend** (`backend/.env`):
```bash
GEMINI_API_KEY=your_new_key_here
```

**Cloud Run** (if deployed):
```bash
# Update secret in GCP Secret Manager
gcloud secrets versions add gemini-api-key --data-file=- <<< "your_new_key_here"
```

**Netlify** (if frontend needs it):
- Go to Site Settings > Environment Variables
- Update `VITE_GEMINI_API_KEY`

### 3. Restart Services

```bash
# Restart backend
cd backend
npm run dev
```

## What I Fixed

✅ Removed hardcoded key from `COPY_PASTE_COMMANDS.md`
✅ Added `.env` files to `.gitignore`
✅ Updated documentation to use placeholder

## Security Best Practices

- ✅ **NEVER** commit API keys to Git
- ✅ Use `.env` files (already in `.gitignore` now)
- ✅ Use GCP Secret Manager for production
- ✅ Rotate keys if exposed

## Current Status

- ✅ **Scraping**: Working (1778 chars scraped from Nike)
- ✅ **Quality Validation**: Working
- ✅ **Code**: Ready for testing
- ❌ **API Key**: Needs to be replaced

## Next Steps

1. **Get new API key** (5 minutes)
2. **Update `.env` file** (1 minute)
3. **Restart backend** (1 minute)
4. **Test again** with 5 companies

Once you have the new key, everything will work with the free tier (250 requests/day).

