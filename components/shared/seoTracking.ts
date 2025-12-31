/**
 * SEO Tracking Utility - Track page views, clicks, and conversions for SEO/Ad optimization
 */

export interface SEOTrackingEvent {
  page: string;
  event: 'pageview' | 'click' | 'conversion' | 'scroll' | 'time_on_page';
  element?: string;
  data?: Record<string, any>;
  timestamp?: number;
}

/**
 * Track SEO events for analytics and ad optimization
 */
export function trackSEOEvent(event: SEOTrackingEvent): void {
  if (typeof window === 'undefined') return;

  const trackingData = {
    ...event,
    timestamp: event.timestamp || Date.now(),
    url: window.location.href,
    referrer: document.referrer,
    userAgent: navigator.userAgent,
  };

  // Send to backend analytics
  fetch('/api/seo/analytics/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(trackingData),
  }).catch(() => {
    // Silently fail if backend is unavailable
  });

  // Also track in localStorage for offline sync
  try {
    const existing = JSON.parse(localStorage.getItem('seo_tracking_queue') || '[]');
    existing.push(trackingData);
    // Keep only last 100 events
    const trimmed = existing.slice(-100);
    localStorage.setItem('seo_tracking_queue', JSON.stringify(trimmed));
  } catch (e) {
    // Ignore localStorage errors
  }

  // Google Analytics 4 (if available)
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', event.event, {
      page_path: window.location.pathname,
      page_title: document.title,
      ...event.data,
    });
  }
}

/**
 * Track page view
 */
export function trackPageView(page: string, data?: Record<string, any>): void {
  trackSEOEvent({
    page,
    event: 'pageview',
    data: {
      ...data,
      load_time: performance.now(),
    },
  });
}

/**
 * Track CTA clicks (for ad optimization)
 */
export function trackCTAClick(page: string, ctaType: string, location: string): void {
  trackSEOEvent({
    page,
    event: 'click',
    element: 'cta',
    data: {
      cta_type: ctaType,
      location,
    },
  });
}

/**
 * Track conversions (for ad optimization)
 */
export function trackConversion(page: string, conversionType: string, value?: number): void {
  trackSEOEvent({
    page,
    event: 'conversion',
    element: conversionType,
    data: {
      conversion_type: conversionType,
      value,
    },
  });
}



