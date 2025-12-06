# Netlify Build Settings - FIX REQUIRED

## Current Settings (WRONG)
- **Base directory:** `dist` ❌
- **Build command:** (empty) ❌
- **Publish directory:** `dist/` ⚠️ (trailing slash)

## Correct Settings (FIX)

### Base directory
- **Should be:** (empty/blank) or `.` (root)
- **Why:** Base directory is where Netlify installs dependencies (`npm install`) and runs your build command. It needs to be where your `package.json` is located (the root of your repo), NOT the output folder.

### Build command
- **Should be:** `npm run build`
- **Why:** This tells Netlify to run your Vite build process.

### Publish directory
- **Should be:** `dist` (no trailing slash)
- **Why:** This is where Vite outputs the built files. The trailing slash might cause issues.

## How to Fix

1. **Base directory:** Clear the field (leave it empty) or set to `.`
2. **Build command:** Enter `npm run build`
3. **Publish directory:** Change `dist/` to `dist` (remove trailing slash)
4. **Save** the settings
5. **Trigger a new deploy** (Deploys → Trigger deploy → Clear cache and deploy site)

## Why This Matters

- **Base directory = "dist"** means Netlify tries to run `npm install` inside the `dist` folder, which doesn't have a `package.json`. This will fail or cause weird behavior.
- **Empty build command** means Netlify doesn't know to build your app, so it might be trying to serve files that don't exist or are outdated.
- **Trailing slash** in publish directory can sometimes cause routing issues.

## After Fixing

Once you update these settings and redeploy, your site should work! The build will:
1. Install dependencies in the root (where package.json is)
2. Run `npm run build` to create the dist folder
3. Serve files from the dist folder

