# Netlify Can't Find Files - Repository Issue

## Error
```
npm error path /opt/build/repo/package.json
npm error enoent Could not read package.json
❯ Config file: No config file was defined: using default values.
```

## Problem
Netlify can't find `package.json` or `netlify.toml` even though they're committed to git.

## Possible Causes

### 1. Wrong Branch in Netlify
Netlify might be building from the wrong branch.

**Check:**
- Netlify Dashboard → Site settings → Build & deploy → **Branch to deploy**
- Should be: `main` (or `master` if that's your default branch)

### 2. Repository Connection Issue
Netlify might not be connected to the right repo or branch.

**Check:**
- Netlify Dashboard → Site settings → **Build & deploy** → **Continuous Deployment**
- Verify:
  - Correct repository: `aibcdev/aibc_core`
  - Branch: `main`
  - Build command: `npm run build`
  - Publish directory: `dist`

### 3. Files Not in Root Directory
If your repo structure is different, Netlify might be looking in the wrong place.

**Verify:**
- `package.json` should be at the root of your repo
- `netlify.toml` should be at the root of your repo
- Both should be committed to git

## Quick Fixes

### Fix 1: Verify Repository Connection
1. Netlify Dashboard → Site settings → **Build & deploy**
2. Scroll to **"Continuous Deployment"** section
3. Check:
   - Repository: Should be `aibcdev/aibc_core`
   - Branch: Should be `main`
   - If wrong, click **"Edit settings"** and reconnect

### Fix 2: Check Branch Settings
1. Netlify Dashboard → Site settings → **Build & deploy**
2. Look for **"Branch to deploy"** or **"Production branch"**
3. Should be: `main`

### Fix 3: Force Reconnect Repository
1. Netlify Dashboard → Site settings → **Build & deploy**
2. Under **"Continuous Deployment"**, click **"Edit settings"**
3. Disconnect and reconnect the repository
4. Make sure branch is set to `main`
5. Save and trigger a new deploy

## What to Check in Netlify

1. **Repository:** Is it connected to `aibcdev/aibc_core`?
2. **Branch:** Is it set to `main`?
3. **Build settings:** Are they correct?
4. **Deploy log:** Does it show the correct repo/branch?

Let me know what you see in the Continuous Deployment settings!

