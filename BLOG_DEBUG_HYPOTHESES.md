# Blog Not Showing - Debug Hypotheses

## Hypotheses

**A**: Backend API returns empty posts array (no published posts in database)
- **Evidence needed**: Check if `listBlogPosts` returns posts with `status: 'published'` and `published_at` not null
- **Instrumentation**: Added logs in `seoContentService.ts:343` to check query results

**B**: Backend API not deployed or route not registered
- **Evidence needed**: Check if `/api/blog` endpoint exists and is accessible
- **Instrumentation**: Added logs in `blog.ts:24` to check if route is hit

**C**: Frontend API URL incorrect or CORS issue
- **Evidence needed**: Check if frontend is calling correct URL and if response is received
- **Instrumentation**: Added logs in `BlogView.tsx:45` to check API URL and response status

**D**: Supabase not configured in production
- **Evidence needed**: Check if `isSupabaseConfigured()` returns true in production
- **Instrumentation**: Added logs in `seoContentService.ts:308` to check Supabase config

**E**: Database query error or no published posts
- **Evidence needed**: Check if Supabase query succeeds and returns data
- **Instrumentation**: Added logs in `seoContentService.ts:343` to check query results and errors

## Next Steps

1. User visits https://www.aibcmedia.com/blog
2. Check browser console for errors
3. Check network tab for API call to `/api/blog`
4. Review logs in `.cursor/debug.log` after reproduction







