# 🔒 Security Guide - API Key Protection

## What Happened

Your Gemini API key was exposed in `backend/.env.bak` which was committed to git. Google detected this and revoked the key.

**Exposed Files:**
- `backend/.env.bak` (contained `GEMINI_API_KEY` and `DEEPSEEK_API_KEY`)
- `.env` (was tracked in git)

## ✅ Security Fixes Applied

### 1. Removed Exposed Files from Git
- ✅ Removed `.env` from git tracking
- ✅ Removed `backend/.env.bak` from git tracking
- ⚠️ **Note:** Files are still in git history. For complete removal, consider using `git filter-branch` or BFG Repo-Cleaner (advanced)

### 2. Enhanced .gitignore
Added comprehensive patterns to block:
- All `.env` files and variants
- All `.bak`, `.backup`, `.old` files
- All API key and secret files

### 3. Pre-Commit Hook Protection
**Location:** `.git/hooks/pre-commit`

**What it does:**
- Scans every commit for API key patterns
- Blocks commits containing:
  - Google API keys (`AIza...`)
  - OpenAI/Anthropic keys (`sk-...`)
  - GitHub tokens (`ghp_...`, `gho_...`, etc.)
  - AWS keys (`AKIA...`)
  - Any `.env`, `.bak`, or backup files
  - Common API key variable names

**How it works:**
- Automatically runs before every commit
- Shows red error if API keys detected
- Prevents commit from completing

## 🚨 CRITICAL: Getting a New API Key

**Your old Gemini API key is REVOKED and will never work again.**

### Steps to Get New Key:

1. **Generate New Gemini API Key:**
   - Go to: https://makersuite.google.com/app/apikey
   - Click "Create API Key"
   - Copy the new key

2. **Update Your Local .env File:**
   ```bash
   cd backend
   nano .env
   # Replace GEMINI_API_KEY with your new key
   ```

3. **NEVER commit the new key:**
   - ✅ It's in `.gitignore` (won't be tracked)
   - ✅ Pre-commit hook will block it if you try
   - ✅ Use environment variables only

## 🛡️ Best Practices Going Forward

### ✅ DO:
- ✅ Keep all API keys in `.env` files (already in `.gitignore`)
- ✅ Use environment variables in code: `process.env.GEMINI_API_KEY`
- ✅ Test locally before committing
- ✅ The pre-commit hook will catch mistakes automatically

### ❌ DON'T:
- ❌ Commit `.env` files (even if renamed)
- ❌ Commit `.bak`, `.backup`, or `.old` files
- ❌ Hardcode API keys in source code
- ❌ Share API keys in chat/email
- ❌ Commit files with "api", "key", or "secret" in the name

## 🔍 How to Verify Security

### Test Pre-Commit Hook:
```bash
# Try to commit a test file with an API key (should be blocked)
echo "GEMINI_API_KEY=test123" > test.env
git add test.env
git commit -m "test"  # Should FAIL with security error
rm test.env
```

### Check What's Tracked:
```bash
# Should show NO .env files
git ls-files | grep -i "\.env"
```

### Check Git History:
```bash
# Should show no recent commits with API keys
git log --all --full-history -p | grep -i "AIza\|sk-"
```

## 📝 If You Need to Share Config

**Use `.env.example` instead:**
```bash
# .env.example (safe to commit)
GEMINI_API_KEY=replace_with_your_actual_key
DEEPSEEK_API_KEY=replace_with_your_actual_key
```

**Never put real keys in `.env.example`!**

## 🆘 If You Accidentally Commit a Key

1. **Immediately revoke the key** (if possible)
2. **Remove from git tracking:**
   ```bash
   git rm --cached path/to/file
   ```
3. **Update .gitignore** if needed
4. **Generate a new key**
5. **Consider cleaning git history** (advanced - use `git filter-branch`)

## 🔐 Current Protection Status

- ✅ `.env` files in `.gitignore`
- ✅ `.bak` files in `.gitignore`
- ✅ Pre-commit hook active
- ✅ API key patterns blocked
- ⚠️ Old keys still in git history (consider cleaning)

---

**Last Updated:** After security incident on 2025-12-10
**Status:** Protected ✅

