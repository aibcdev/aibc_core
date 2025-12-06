# Netlify Base Directory Error - FIX

## Error
```
npm error enoent Could not read package.json: Error: ENOENT: no such file or directory, open '/opt/build/repo/package.json'
```

## Root Cause
The **Base directory** is set to `dist` in Netlify UI, which tells Netlify to:
1. Install dependencies in the `dist` folder (where there's no `package.json`)
2. Run the build command from the `dist` folder

But `package.json` is in the **root** of your repo, not in `dist`!

## Solution

### Fix Netlify UI Settings:

1. **Base directory:** 
   - **Clear it completely** (leave it empty/blank)
   - OR set to `.` (root)
   - **NOT** `dist`

2. **Build command:**
   - Set to: `npm run build`

3. **Publish directory:**
   - Set to: `dist` (no trailing slash)

### Why This Happens

- **Base directory** = Where Netlify runs `npm install` and your build command
- Your `package.json` is in the repo root, so base directory must be root (empty)
- **Publish directory** = Where Netlify looks for built files to serve
- Your built files are in `dist`, so publish directory should be `dist`

### After Fixing

1. Save the settings
2. Trigger a new deploy: **Deploys** → **Trigger deploy** → **Clear cache and deploy site**
3. The build should now:
   - Install dependencies from root `package.json` ✅
   - Run `npm run build` from root ✅
   - Serve files from `dist` folder ✅

## Quick Reference

| Setting | Value |
|---------|-------|
| Base directory | (empty/blank) |
| Build command | `npm run build` |
| Publish directory | `dist` |

