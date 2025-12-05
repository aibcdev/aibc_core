# Testing Inbox Flow

## Test Steps

### 1. Create a Video/Audio Request
1. Go to Production Room
2. Click "Start Creating" on any video or audio content
3. Click "Request" button (should show instead of "Schedule" for video/audio)
4. Modal should appear with:
   - "Your content will be ready within 72 hours"
   - "Check your Inbox once it's ready"
   - "You have 3 drafts/changes available"
5. Click "Request Video" or "Request Audio"
6. Request should be created and saved to localStorage

### 2. Verify Request Appears in Inbox
1. Navigate to Inbox (sidebar menu)
2. Request should appear in the list
3. Status should be "pending"
4. Should show:
   - Requested date
   - Estimated ready date (72 hours from request)
   - Drafts remaining: 3

### 3. Test Request Details
1. Click on a request in Inbox
2. Modal should show:
   - Request title and description
   - Status information
   - Drafts remaining
   - Revision history (empty initially)

### 4. Test Revision Request
1. Open a request that has drafts remaining
2. Click "Request Revision"
3. Enter revision reason
4. Drafts remaining should decrease by 1
5. Revision should appear in history

### 5. Test Mark Complete
1. Open a ready request
2. Click "Mark as Complete"
3. Status should change to "completed"
4. Request should move to "completed" filter

## Expected Behavior

- ✅ Video/audio content shows "Request" button
- ✅ Request modal shows 72-hour message
- ✅ Request saved to localStorage
- ✅ Inbox updates immediately (same-tab)
- ✅ Inbox updates across tabs (cross-tab)
- ✅ Filters work correctly
- ✅ Revision system tracks drafts
- ✅ Status updates work

## Manual Test Commands

You can test the flow by running these in browser console:

```javascript
// Create a test request
const testRequest = {
  id: `req-${Date.now()}`,
  type: 'video',
  title: 'Test Video Request',
  description: 'This is a test video request',
  status: 'pending',
  requestedAt: new Date().toISOString(),
  estimatedReadyAt: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
  draftsRemaining: 3,
  revisions: []
};
const existing = JSON.parse(localStorage.getItem('videoAudioRequests') || '[]');
localStorage.setItem('videoAudioRequests', JSON.stringify([...existing, testRequest]));
window.dispatchEvent(new CustomEvent('videoAudioRequestAdded'));
```


