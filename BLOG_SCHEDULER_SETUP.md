# Blog Auto-Publishing Scheduler Setup

## Overview

The blog auto-publishing system publishes 1 blog post every day at 9 AM automatically.

## How It Works

1. **Draft Posts**: Create blog posts with `status: 'draft'` in the database
2. **Scheduler**: Daily job calls `/api/blog/publish-scheduled` at 9 AM
3. **Auto-Publish**: System finds the oldest draft and publishes it
4. **Result**: Post becomes visible on the blog page

## Setup Instructions

### Option 1: Google Cloud Scheduler (Recommended for Production)

```bash
# Create a Cloud Scheduler job
gcloud scheduler jobs create http blog-auto-publish \
  --schedule="0 9 * * *" \
  --uri="https://your-backend-url/api/blog/publish-scheduled" \
  --http-method=POST \
  --time-zone="America/New_York" \
  --description="Publish 1 blog post daily at 9 AM"
```

**Note**: Replace `your-backend-url` with your actual backend URL (e.g., `https://aibc-backend-409115133182.us-central1.run.app`)

### Option 2: Cron Job (Local/Development)

Add to your server startup or system cron:

```bash
# Runs daily at 9 AM
0 9 * * * curl -X POST http://localhost:3001/api/blog/publish-scheduled
```

### Option 3: Manual Trigger (Testing)

```bash
curl -X POST http://localhost:3001/api/blog/publish-scheduled
```

## API Endpoints

### Publish Scheduled Post
```
POST /api/blog/publish-scheduled
Response: {
  success: true,
  message: "Published post: 'Post Title'",
  post: { ... }
}
```

### Get Scheduler Status
```
GET /api/blog/scheduler-status
Response: {
  success: true,
  nextPublishTime: "2024-12-14T09:00:00.000Z",
  draftCount: 10,
  publishedCount: 5
}
```

## Creating Draft Posts

Posts should be created with `status: 'draft'`. The scheduler will:
- Find the oldest draft (by `created_at`)
- Publish it (set `status: 'published'` and `published_at: now()`)
- Make it visible on the blog page

## Timezone

The scheduler runs at 9 AM in the timezone you specify:
- **Cloud Scheduler**: Set via `--time-zone` flag
- **Cron**: Uses server timezone

## Monitoring

Check scheduler status:
```bash
curl http://localhost:3001/api/blog/scheduler-status
```

This shows:
- Next scheduled publish time
- Number of draft posts waiting
- Number of published posts

## Troubleshooting

**No posts published?**
- Check if there are draft posts: `GET /api/blog/scheduler-status`
- Verify scheduler is running: Check Cloud Scheduler logs or cron logs
- Check backend logs for errors

**Posts not showing?**
- Verify post has `status: 'published'` and `published_at` is set
- Check blog API endpoint returns published posts
- Verify frontend is calling the correct API URL



