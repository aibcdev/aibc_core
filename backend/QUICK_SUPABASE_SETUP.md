# Quick Supabase Setup

Since you already have your Supabase URL and key, just add them to `backend/.env`:

```env
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_key_here
```

**Important:** Make sure you've also run the database schema in Supabase:

1. Go to your Supabase project dashboard
2. Click on **SQL Editor**
3. Copy the entire contents of `backend/database/schema.sql`
4. Paste and click **Run**

Then test the connection:

```bash
cd backend
npx ts-node scripts/test-supabase.ts
```

If the test passes, you're all set! Content will now persist across server restarts.








