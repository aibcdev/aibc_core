/**
 * Learning & Feedback Client
 * Frontend service for tracking user feedback and interactions
 */

const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname.includes('aibcmedia.com') || hostname.includes('netlify')) {
      return 'https://aibc-backend-409115133182.us-central1.run.app';
    }
  }
  return import.meta.env.VITE_API_URL || 'http://localhost:3001';
};

const API_URL = getApiUrl();

export interface FeedbackData {
  scanId: string;
  username: string;
  feedbackType: 'approval' | 'edit' | 'regeneration' | 'dismissal' | 'rating' | 'custom';
  contentId?: string;
  contentTitle?: string;
  rating?: number;
  comment?: string;
  metadata?: {
    originalContent?: string;
    editedContent?: string;
    reason?: string;
    platform?: string;
    contentType?: string;
  };
}

/**
 * Track user feedback for learning
 */
export async function trackFeedback(feedback: FeedbackData): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/api/learning/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...feedback,
        timestamp: new Date().toISOString()
      })
    });

    if (!response.ok) {
      console.error('[LEARNING] Failed to track feedback:', response.statusText);
      return false;
    }

    console.log(`[LEARNING] ✅ Feedback tracked: ${feedback.feedbackType}`);
    return true;
  } catch (error) {
    console.error('[LEARNING] Error tracking feedback:', error);
    return false;
  }
}

/**
 * Track scan quality metrics
 */
export async function trackScanQuality(metrics: {
  scanId: string;
  username: string;
  extractionConfidence?: number;
  brandDNAAccuracy?: number;
  contentIdeasCount: number;
  contentIdeasApproved: number;
  contentIdeasEdited: number;
  contentIdeasDismissed: number;
  averageRating?: number;
}): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/api/learning/scan-quality`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...metrics,
        timestamp: new Date().toISOString()
      })
    });

    if (!response.ok) {
      console.error('[LEARNING] Failed to track scan quality:', response.statusText);
      return false;
    }

    console.log('[LEARNING] ✅ Scan quality tracked');
    return true;
  } catch (error) {
    console.error('[LEARNING] Error tracking scan quality:', error);
    return false;
  }
}

/**
 * Helper: Track content approval
 */
export async function trackApproval(
  scanId: string,
  username: string,
  contentId: string,
  contentTitle: string,
  platform?: string,
  contentType?: string
): Promise<void> {
  await trackFeedback({
    scanId,
    username,
    feedbackType: 'approval',
    contentId,
    contentTitle,
    metadata: {
      platform,
      contentType
    }
  });
}

/**
 * Helper: Track content edit
 */
export async function trackEdit(
  scanId: string,
  username: string,
  contentId: string,
  contentTitle: string,
  originalContent: string,
  editedContent: string,
  platform?: string,
  contentType?: string
): Promise<void> {
  await trackFeedback({
    scanId,
    username,
    feedbackType: 'edit',
    contentId,
    contentTitle,
    metadata: {
      originalContent,
      editedContent,
      platform,
      contentType
    }
  });
}

/**
 * Helper: Track content dismissal
 */
export async function trackDismissal(
  scanId: string,
  username: string,
  contentId: string,
  contentTitle: string,
  reason?: string,
  platform?: string,
  contentType?: string
): Promise<void> {
  await trackFeedback({
    scanId,
    username,
    feedbackType: 'dismissal',
    contentId,
    contentTitle,
    metadata: {
      reason,
      platform,
      contentType
    }
  });
}

/**
 * Helper: Track content rating
 */
export async function trackRating(
  scanId: string,
  username: string,
  contentId: string,
  contentTitle: string,
  rating: number,
  comment?: string,
  platform?: string,
  contentType?: string
): Promise<void> {
  await trackFeedback({
    scanId,
    username,
    feedbackType: 'rating',
    contentId,
    contentTitle,
    rating,
    comment,
    metadata: {
      platform,
      contentType
    }
  });
}

/**
 * Helper: Track content regeneration
 */
export async function trackRegeneration(
  scanId: string,
  username: string,
  reason?: string
): Promise<void> {
  await trackFeedback({
    scanId,
    username,
    feedbackType: 'regeneration',
    metadata: {
      reason
    }
  });
}

