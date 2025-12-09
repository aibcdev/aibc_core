# ⚠️ CRITICAL: API Key Security Issue

## Problem Found
The `.env` file with your API key was **committed to git** in the past. This means:
- Your API keys are in git history
- Anyone with access to the repo can see them
- Google flagged them as "leaked" because they're in a public/accessible repo

## Immediate Actions Required

### 1. Rotate ALL API Keys
**Your current API keys are compromised.** You MUST:
1. Go to https://aistudio.google.com/apikey
2. **Delete/Revoke ALL existing keys** (they're all compromised)
3. Create **brand new** API keys
4. Update `backend/.env` with the new key

### 2. Remove .env from Git
I've removed `.env` from git tracking, but the keys are still in git history.

### 3. Clean Git History (If Repo is Private)
If this is a private repo, you can clean the history:
```bash
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env backend/.env" \
  --prune-empty --tag-name-filter cat -- --all
```

**WARNING**: This rewrites git history. Only do this if:
- Repo is private
- You coordinate with your team
- You understand the consequences

### 4. If Repo is Public
If this repo is public on GitHub:
- **Assume all keys are compromised**
- Rotate ALL keys immediately
- Consider the repo compromised

## Going Forward

### ✅ DO:
- Keep `.env` files in `.gitignore` (already done)
- Use environment variables in production
- Never commit API keys
- Never share API keys in screenshots/messages

### ❌ DON'T:
- Commit `.env` files
- Share API keys in documentation
- Put keys in code comments
- Show keys in terminal output

## Current Status
- ✅ `.env` removed from git tracking (committed)
- ✅ `.gitignore` properly configured
- ⚠️ **Keys still in git history** - they are compromised
- ⚠️ **You MUST create new API keys** - old ones are leaked

## How to Update API Key (Safe Instructions)

1. **Get a new API key** from https://aistudio.google.com/apikey
2. **Update `backend/.env`** file (NOT committed to git):
   ```bash
   cd backend
   echo "GEMINI_API_KEY=YOUR_NEW_KEY_HERE" > .env
   ```
   Replace `YOUR_NEW_KEY_HERE` with your actual new key.
3. **Restart backend**:
   ```bash
   # Kill current backend (Ctrl+C)
   npm run dev
   ```

**IMPORTANT**: Never share your actual API key in messages, screenshots, or documentation.

