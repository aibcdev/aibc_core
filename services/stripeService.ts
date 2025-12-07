/**
 * Stripe Payment Integration Service
 */

import { Subscription, SubscriptionTier, updateSubscription } from './subscriptionService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface StripeCheckoutSession {
  sessionId: string;
  url: string;
}

export interface StripePrice {
  id: string;
  amount: number;
  currency: string;
  interval: 'month' | 'year';
  tier: SubscriptionTier;
}

/**
 * Create Stripe checkout session for subscription
 */
export async function createCheckoutSession(priceId: string, tier: SubscriptionTier): Promise<StripeCheckoutSession> {
  try {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    
    const response = await fetch(`${API_BASE_URL}/api/stripe/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
      body: JSON.stringify({
        priceId,
        tier,
        userId: user?.id,
        userEmail: user?.email,
        successUrl: `${window.location.origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/pricing`,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to create checkout session' }));
      throw new Error(error.error || 'Failed to create checkout session');
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    throw error;
  }
}

/**
 * Get Stripe customer portal URL
 */
export async function getCustomerPortalUrl(): Promise<string> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/stripe/customer-portal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
      body: JSON.stringify({
        returnUrl: `${window.location.origin}/dashboard`,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to get portal URL' }));
      throw new Error(error.error || 'Failed to get portal URL');
    }

    const data = await response.json();
    return data.url;
  } catch (error: any) {
    console.error('Stripe portal error:', error);
    throw error;
  }
}

/**
 * Verify Stripe checkout session and update subscription
 */
export async function verifyCheckoutSession(sessionId: string): Promise<Subscription> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/stripe/verify-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
      body: JSON.stringify({ sessionId }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to verify session' }));
      throw new Error(error.error || 'Failed to verify session');
    }

    const data = await response.json();
    
    // Update local subscription
    updateSubscription(data.subscription);
    
    return data.subscription;
  } catch (error: any) {
    console.error('Stripe verification error:', error);
    throw error;
  }
}

/**
 * Get available subscription prices
 */
export async function getPrices(): Promise<StripePrice[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/stripe/prices`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) {
      // Fallback to default prices if API fails
      return getDefaultPrices();
    }

    const data = await response.json();
    return data.prices || getDefaultPrices();
  } catch (error: any) {
    console.error('Get prices error:', error);
    return getDefaultPrices();
  }
}

/**
 * Default prices (fallback)
 */
function getDefaultPrices(): StripePrice[] {
  return [
    {
      id: 'price_pro_monthly',
      amount: 2900, // $29.00
      currency: 'usd',
      interval: 'month',
      tier: SubscriptionTier.PRO,
    },
    {
      id: 'price_pro_yearly',
      amount: 29000, // $290.00 (save 2 months)
      currency: 'usd',
      interval: 'year',
      tier: SubscriptionTier.PRO,
    },
  ];
}

