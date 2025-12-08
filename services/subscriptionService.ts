/**
 * Subscription and Credit Management Service
 */

import { isAdmin } from './adminService';

export enum SubscriptionTier {
  FREE = 'free',
  PRO = 'pro',
  ENTERPRISE = 'enterprise'
}

export interface Subscription {
  tier: SubscriptionTier;
  status: 'active' | 'cancelled' | 'past_due' | 'trialing';
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

export interface CreditBalance {
  credits: number;
  lastUpdated: Date;
}

export interface CreditTransaction {
  id: string;
  type: 'scan' | 'content_generation' | 'purchase' | 'refund' | 'bonus';
  amount: number; // Positive for additions, negative for deductions
  description: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

// Credit costs for different actions
export const CREDIT_COSTS = {
  DIGITAL_FOOTPRINT_SCAN: 10,
  CONTENT_GENERATION: 5,
  COMPETITOR_ANALYSIS: 15,
  BRAND_DNA_EXTRACTION: 8,
  AUDIO_GENERATION: 8, // Podcast/audio content
  VIDEO_GENERATION: 15, // Video content
  SHORT_VIDEO: 10, // Short-form video
  LONG_VIDEO: 20, // Long-form video
} as const;

// Subscription tier limits
export const TIER_LIMITS = {
  [SubscriptionTier.FREE]: {
    monthlyScans: 1,
    monthlyCredits: 10,
    contentGenerations: 0,
    competitorTracking: 0,
    features: ['basic_scan'] as string[],
  },
  [SubscriptionTier.PRO]: {
    monthlyScans: 50,
    monthlyCredits: 500,
    contentGenerations: 100,
    competitorTracking: 10,
    features: ['basic_scan', 'content_generation', 'competitor_tracking', 'advanced_analytics'] as string[],
  },
  [SubscriptionTier.ENTERPRISE]: {
    monthlyScans: -1, // Unlimited
    monthlyCredits: -1, // Unlimited
    contentGenerations: -1, // Unlimited
    competitorTracking: -1, // Unlimited
    features: ['all'] as string[],
  },
} as const;

/**
 * Get user subscription from localStorage or API
 */
export function getUserSubscription(): Subscription {
  try {
    const stored = localStorage.getItem('userSubscription');
    if (stored) {
      const sub = JSON.parse(stored);
      return {
        ...sub,
        currentPeriodEnd: sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd) : null,
      };
    }
  } catch (e) {
    console.error('Error parsing subscription:', e);
  }
  
  // Default to free tier
  return {
    tier: SubscriptionTier.FREE,
    status: 'active',
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false,
  };
}

/**
 * Get user credit balance
 */
export function getCreditBalance(): CreditBalance {
  try {
    const stored = localStorage.getItem('creditBalance');
    if (stored) {
      const balance = JSON.parse(stored);
      return {
        ...balance,
        lastUpdated: new Date(balance.lastUpdated),
      };
    }
  } catch (e) {
    console.error('Error parsing credit balance:', e);
  }
  
  return {
    credits: 0,
    lastUpdated: new Date(),
  };
}

/**
 * Check if user has enough credits for an action
 */
export function hasEnoughCredits(action: keyof typeof CREDIT_COSTS): boolean {
  const balance = getCreditBalance();
  const cost = CREDIT_COSTS[action];
  return balance.credits >= cost;
}

/**
 * Deduct credits for an action
 * @param action - The action to deduct credits for
 * @param metadata - Optional metadata (e.g., contentId for audio/video)
 */
export function deductCredits(action: keyof typeof CREDIT_COSTS, metadata?: Record<string, unknown>): boolean {
  const balance = getCreditBalance();
  const cost = CREDIT_COSTS[action];
  
  if (balance.credits < cost) {
    return false;
  }
  
  const newBalance = balance.credits - cost;
  const updated: CreditBalance = {
    credits: newBalance,
    lastUpdated: new Date(),
  };
  
  localStorage.setItem('creditBalance', JSON.stringify(updated));
  
  // Determine transaction type
  let transactionType: CreditTransaction['type'] = 'content_generation';
  if (action === 'DIGITAL_FOOTPRINT_SCAN') transactionType = 'scan';
  if (action === 'COMPETITOR_ANALYSIS') transactionType = 'scan';
  if (action.includes('AUDIO') || action.includes('VIDEO')) transactionType = 'content_generation';
  
  // Log transaction
  addCreditTransaction({
    type: transactionType,
    amount: -cost,
    description: `Used ${cost} credits for ${action}`,
    metadata: metadata as Record<string, any> | undefined,
  });
  
  return true;
}

/**
 * Add credits to user balance
 */
export function addCredits(amount: number, description: string, type: CreditTransaction['type'] = 'purchase'): void {
  const balance = getCreditBalance();
  const newBalance = balance.credits + amount;
  
  const updated: CreditBalance = {
    credits: newBalance,
    lastUpdated: new Date(),
  };
  
  localStorage.setItem('creditBalance', JSON.stringify(updated));
  
  addCreditTransaction({
    type,
    amount,
    description,
  });
}

/**
 * Add credit transaction to history
 */
function addCreditTransaction(transaction: Omit<CreditTransaction, 'id' | 'timestamp'>): void {
  try {
    const history = getCreditHistory();
    const newTransaction: CreditTransaction = {
      ...transaction,
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };
    
    history.unshift(newTransaction);
    // Keep only last 100 transactions
    if (history.length > 100) {
      history.splice(100);
    }
    
    localStorage.setItem('creditHistory', JSON.stringify(history));
  } catch (e) {
    console.error('Error saving credit transaction:', e);
  }
}

/**
 * Accept audio/video content - deducts credits only when user accepts
 * @param contentId - The ID of the content being accepted
 * @param contentType - 'audio' or 'video'
 */
export function acceptContent(contentId: string, contentType: 'audio' | 'video'): boolean {
  const action = contentType === 'audio' 
    ? 'AUDIO_GENERATION' 
    : 'VIDEO_GENERATION';
  
  return deductCredits(action, { contentId, accepted: true } as Record<string, any>);
}

/**
 * Get credit transaction history
 */
export function getCreditHistory(): CreditTransaction[] {
  try {
    const stored = localStorage.getItem('creditHistory');
    if (stored) {
      const history = JSON.parse(stored);
      return history.map((tx: any) => ({
        ...tx,
        timestamp: new Date(tx.timestamp),
      }));
    }
  } catch (e) {
    console.error('Error parsing credit history:', e);
  }
  
  return [];
}

/**
 * Check if user has access to a feature
 */
export function hasFeatureAccess(feature: string): boolean {
  const subscription = getUserSubscription();
  const limits = TIER_LIMITS[subscription.tier];
  
  if (limits.features.includes('all')) {
    return true;
  }
  
  return limits.features.includes(feature);
}

/**
 * Check if user can perform an action based on subscription
 */
export function canPerformAction(action: 'scan' | 'content_generation' | 'competitor_tracking'): boolean {
  const subscription = getUserSubscription();
  const limits = TIER_LIMITS[subscription.tier];
  
  // Check if feature is available
  if (action === 'scan' && !hasFeatureAccess('basic_scan')) {
    return false;
  }
  
  if (action === 'content_generation' && !hasFeatureAccess('content_generation')) {
    return false;
  }
  
  if (action === 'competitor_tracking' && !hasFeatureAccess('competitor_tracking')) {
    return false;
  }
  
  // Check credits
  if (action === 'scan') {
    return hasEnoughCredits('DIGITAL_FOOTPRINT_SCAN');
  }
  
  if (action === 'content_generation') {
    return hasEnoughCredits('CONTENT_GENERATION');
  }
  
  if (action === 'competitor_tracking') {
    return hasEnoughCredits('COMPETITOR_ANALYSIS');
  }
  
  return false;
}

/**
 * Update subscription (called after Stripe payment)
 */
export function updateSubscription(subscription: Subscription): void {
  localStorage.setItem('userSubscription', JSON.stringify(subscription));
  
  // Give initial credits based on tier
  const balance = getCreditBalance();
  if (balance.credits === 0 && subscription.tier !== SubscriptionTier.FREE) {
    const initialCredits = subscription.tier === SubscriptionTier.PRO ? 500 : 10000;
    addCredits(initialCredits, 'Welcome bonus credits', 'bonus');
  }
}

/**
 * ADMIN FUNCTIONS - Credit Management
 * Only accessible to admin users (watchaibc@gmail.com)
 */

/**
 * Admin: Add credits to any user (by email)
 * @param userEmail - Email of the user to add credits to
 * @param amount - Number of credits to add
 * @param description - Reason for adding credits
 */
export function adminAddCredits(userEmail: string, amount: number, description: string): boolean {
  if (!isAdmin()) {
    throw new Error('Unauthorized: Admin access required');
  }
  
  // For now, if admin is managing their own account or testing, add to current user
  // In production, this would update a database
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  if (currentUser.email?.toLowerCase() === userEmail.toLowerCase()) {
    addCredits(amount, `[ADMIN] ${description}`, 'bonus');
    return true;
  }
  
  // TODO: In production, update user's credits in database
  console.log(`[ADMIN] Would add ${amount} credits to ${userEmail}: ${description}`);
  return true;
}

/**
 * Admin: Set credits for any user (by email)
 * @param userEmail - Email of the user
 * @param amount - New credit balance
 * @param description - Reason for setting credits
 */
export function adminSetCredits(userEmail: string, amount: number, description: string): boolean {
  if (!isAdmin()) {
    throw new Error('Unauthorized: Admin access required');
  }
  
  // For now, if admin is managing their own account, set current user's credits
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  if (currentUser.email?.toLowerCase() === userEmail.toLowerCase()) {
    const updated: CreditBalance = {
      credits: amount,
      lastUpdated: new Date(),
    };
    localStorage.setItem('creditBalance', JSON.stringify(updated));
    
    addCreditTransaction({
      type: 'bonus',
      amount: amount - getCreditBalance().credits,
      description: `[ADMIN] ${description}`,
    });
    return true;
  }
  
  // TODO: In production, update user's credits in database
  console.log(`[ADMIN] Would set ${userEmail} credits to ${amount}: ${description}`);
  return true;
}

/**
 * Admin: Get credit balance for any user (by email)
 * @param userEmail - Email of the user
 */
export function adminGetCredits(userEmail: string): CreditBalance {
  if (!isAdmin()) {
    throw new Error('Unauthorized: Admin access required');
  }
  
  // For now, if admin is checking their own account, return current balance
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  if (currentUser.email?.toLowerCase() === userEmail.toLowerCase()) {
    return getCreditBalance();
  }
  
  // TODO: In production, fetch from database
  console.log(`[ADMIN] Would get credits for ${userEmail}`);
  return { credits: 0, lastUpdated: new Date() };
}

