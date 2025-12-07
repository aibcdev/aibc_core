# ⚠️ CRITICAL: API Key Security Issue

## Problem
**Error**: "Your API key was reported as leaked. Please use another API key."

This means your Gemini API key has been exposed and Google has revoked it for security.

## Why This Happened

API keys can be flagged as "leaked" if:
1. **Committed to Git** (even in private repos, if made public)
2. **Exposed in logs** (console.log, error messages)
3. **Shared publicly** (screenshots, documentation)
4. **Used in client-side code** (frontend JavaScript)

## Immediate Actions Required

### 1. Generate New API Key
1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Navigate to API Keys
3. **Revoke the old key** (if still accessible)
4. **Create a new API key**
5. **Save it securely** (password manager, not in code)

### 2. Update Environment Variables

**Backend (.env file)**:
```bash
GEMINI_API_KEY=your_new_key_here
```

**Frontend (Netlify Environment Variables)**:
```bash
VITE_GEMINI_API_KEY=your_new_key_here  # Only if needed client-side
```

**Cloud Run (GCP Secret Manager)**:
- Update the secret in Secret Manager
- Redeploy the service

### 3. Security Best Practices

✅ **DO:**
- Store API keys in environment variables
- Use `.env` files (add to `.gitignore`)
- Use GCP Secret Manager for production
- Rotate keys regularly

❌ **DON'T:**
- Commit API keys to Git
- Log API keys in console
- Share keys in screenshots/docs
- Hardcode keys in source code

## Current Status

✅ **Scraping**: Working (1778 chars scraped from Nike)
✅ **Quality Validation**: Working (rejecting failed scans)
❌ **LLM Extraction**: Blocked by leaked API key

## Next Steps

1. **Get new API key** from Google AI Studio
2. **Update environment variables** (backend .env, Cloud Run secrets)
3. **Restart backend** to load new key
4. **Test again** with 5 companies

## Prevention

- Never commit `.env` files
- Use `.gitignore` for sensitive files
- Review all commits before pushing
- Use secret management tools (GCP Secret Manager)

Once you have a new API key, the system will work with the free tier (250 requests/day).

