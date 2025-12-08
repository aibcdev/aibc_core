# Fixed: Using Connected Accounts for Scanning

## The Problem

You were absolutely right - this should be simple:
1. User connects accounts in IntegrationsView (e.g., @goodphats, @dipsea)
2. Scan should use THOSE specific handles
3. Basic LLM should extract posts and create averaged voice

**But we were:**
- Using generic username from IngestionView
- Not using connected accounts from IntegrationsView
- Trying to guess platform URLs instead of using actual handles

## The Fix

### 1. Store Connected Accounts (IntegrationsView.tsx)
- When user connects an account, store it in localStorage
- Map integration IDs to platform names:
  - `x` → `twitter`
  - `instagram` → `instagram`
  - `linkedin` → `linkedin`
  - `youtube` → `youtube`
- Store as: `{ twitter: 'goodphats', instagram: 'goodphats', ... }`

### 2. Pass to Scan (apiClient.ts)
- Check localStorage for `connectedAccounts`
- Pass to backend in scan request
- Backend uses specific handles instead of generic username

### 3. Use in Scraping (scanService.ts)
- If `connectedAccounts` provided, use platform-specific handle
- Otherwise fall back to username
- Log which handle is being used for each platform

## How It Works Now

**Before:**
```
User enters: "goodphats"
Scan tries: twitter.com/goodphats, instagram.com/goodphats
```

**After:**
```
User connects: @goodphats (Twitter), @goodphats (Instagram)
Scan uses: twitter.com/goodphats, instagram.com/goodphats
(Using the EXACT handles they connected)
```

## Result

- ✅ Uses actual connected accounts
- ✅ No guessing - uses handles user provided
- ✅ Basic LLM extracts posts from those accounts
- ✅ Creates averaged voice from their actual content

## Testing

1. Connect accounts in IntegrationsView
2. Run scan
3. Check logs - should show: `[SCRAPE] Scraping twitter (@goodphats): ...`
4. Should find posts from those specific accounts

