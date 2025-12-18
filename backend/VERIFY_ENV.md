# How to Verify Your .env File Has Values

## Quick Check

After you edit `backend/.env`, you can verify the values are there by running:

```bash
cd backend
node -e "require('dotenv').config(); console.log('URL:', process.env.SUPABASE_URL ? '✅ SET' : '❌ NOT SET'); console.log('KEY:', process.env.SUPABASE_ANON_KEY ? '✅ SET' : '❌ NOT SET');"
```

If both show ✅ SET, your values are correctly added!

## What Your .env Should Look Like

```env
DEEPSEEK_API_KEY=sk-0e257963f783429eba1604ceb59f87c1
GEMINI_API_KEY=AIzaSyAuSAfofCy9GXZO2I0NPm6v4AuEeVdiO_U

# Supabase Configuration (for persistent storage)
# SUPABASE_URL=your_supabase_url_here
# SUPABASE_ANON_KEY=your_supabase_key_here

SUPABASE_URL=https://abcdefghijklmnop.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzODk2NzI5MCwiZXhwIjoxOTU0NTQzMjkwfQ.abc123xyz789
```

**Important:** 
- No quotes around the values
- No spaces around the `=`
- Make sure you SAVE the file after editing

## Common Issues

1. **Empty values**: If you see `SUPABASE_URL=`, add the actual URL after the `=`
2. **Quotes**: Don't use quotes like `SUPABASE_URL="https://..."` - just `SUPABASE_URL=https://...`
3. **Spaces**: Don't use spaces like `SUPABASE_URL = https://...` - use `SUPABASE_URL=https://...`
4. **Not saved**: Make sure you save the file after editing (Cmd+S or Ctrl+S)



