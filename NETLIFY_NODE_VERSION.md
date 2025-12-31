# Netlify Node.js Version Configuration

## Current Configuration

The project is configured to use **Node.js 22** on Netlify for optimal compatibility with Agent Runners.

## Why Node.js 22?

Netlify Agent Runners work best with Node.js 22 or higher. Using Node.js 20 or lower may cause:
- Some features may not work as expected
- Build performance issues
- Compatibility problems with modern npm packages

## Configuration

The Node.js version is set in `netlify.toml`:

```toml
[build.environment]
  NODE_VERSION = "22"
```

## Updating Node.js Version on Netlify

If you see a warning about Node.js version in the Netlify dashboard:

1. **Option 1: Update netlify.toml** (Recommended)
   - The `netlify.toml` file already specifies Node.js 22
   - Commit and push the change
   - Netlify will use the specified version on next deploy

2. **Option 2: Set in Netlify Dashboard**
   - Go to: **Site settings** → **Build & deploy** → **Environment**
   - Add environment variable: `NODE_VERSION` = `22`
   - Redeploy the site

## Verification

After deployment, verify the Node.js version:
- Check build logs in Netlify dashboard
- Look for: `Now using node v22.x.x`

## Related Files

- `netlify.toml` - Netlify build configuration
- `package.json` - Project dependencies (compatible with Node.js 22)

