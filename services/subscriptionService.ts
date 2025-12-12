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
// Video should cost ~10% of monthly budget (users afford 5-6 videos/month max)
// Standard = 150 credits, Pro = 600 credits
export const CREDIT_COSTS = {
  DIGITAL_FOOTPRINT_SCAN: 0, // Scans are included in plan, not charged credits
  CONTENT_GENERATION: 1, // 1 credit = 1 short post
  COMPETITOR_ANALYSIS: 0, // Included in Business tier
  BRAND_DNA_EXTRACTION: 0, // Included in scan
  LONG_FORM_CONTENT: 3, // 3 credits = 1 long-form asset (blog, newsletter)
  
  // Production Room costs
  // Images: 1-3 credits (cheapest) - available from PRO tier
  IMAGE_SHORT: 1,   // Short image/graphic
  IMAGE_MID: 2,     // Mid-length image set
  IMAGE_LONG: 3,    // Full image package
  
  // Audio: 5-10 credits (medium) - available from PRO tier
  AUDIO_SHORT: 5,   // Short audio clip (30s)
  AUDIO_MID: 8,     // Mid-length audio (1-2 min)
  AUDIO_LONG: 12,   // Long audio/podcast (3+ min)
  
  // Video: EXPENSIVE - ~10% of monthly budget per video
  // Standard (150 credits): Can afford 5-6 short videos or 2-3 long videos
  // Pro (600 credits): Can afford 20+ short videos or 6-8 long videos
  VIDEO_SHORT: 25,  // Short video (10-30s) - 150/25 = 6 videos for Standard
  VIDEO_MID: 50,    // Mid-length video (30-90s) - 150/50 = 3 videos for Standard
  VIDEO_LONG: 100,  // Long video (90s+) - 600/100 = 6 videos for Pro
  
  // Legacy mappings for backward compatibility
  AUDIO_GENERATION: 8,
  VIDEO_GENERATION: 50,
  SHORT_VIDEO: 25,
  LONG_VIDEO: 100,
  IMAGE_GENERATION: 2,
} as const;

// Feature access by tier
export const FEATURE_ACCESS = {
  [SubscriptionTier.FREE]: {
    images: false,
    audio: false,
    video: false,
  },
  [SubscriptionTier.PRO]: {
    images: true,   // Images available from PRO
    audio: true,    // Audio available from PRO
    video: false,   // Video requires ENTERPRISE
  },
  [SubscriptionTier.ENTERPRISE]: {
    images: true,
    audio: true,
    video: true,    // Video only for ENTERPRISE (Pro+)
  },
} as const;

// Subscription tier limits (matching pricing page)
export const TIER_LIMITS = {
  [SubscriptionTier.FREE]: {
    monthlyScans: 1,
    monthlyCredits: 15, // Matches pricing page: 15 credits/month
    seats: 1, // 1 seat
    contentGenerations: 0,
    competitorTracking: 0,
    features: ['basic_scan'] as string[],
  },
  [SubscriptionTier.PRO]: {
    monthlyScans: 1, // Standard tier: 1 full scan/month (refreshed monthly)
    monthlyCredits: 150, // Matches pricing page: 150 credits/month
    seats: 1, // 1 seat
    contentGenerations: 100,
    competitorTracking: 0,
    features: ['basic_scan', 'content_generation', 'advanced_analytics'] as string[],
  },
  [SubscriptionTier.ENTERPRISE]: {
    monthlyScans: -1, // Unlimited
    monthlyCredits: 600, // Matches pricing page: 600 credits/month (Business tier)
    seats: 3, // 3 seats for Business tier
    contentGenerations: -1, // Unlimited
    competitorTracking: 5, // Up to 5 brands
    features: ['all'] as string[],
  },
} as const;

/**
 * Get user subscription from localStorage or API
 * Admin users get ENTERPRISE tier with full access
 */
export function getUserSubscription(): Subscription {
  // ADMIN OVERRIDE: Admin users get full Enterprise access
  if (isAdmin()) {
    return {
      tier: SubscriptionTier.ENTERPRISE,
      status: 'active',
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
    };
  }
  
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
 * Get user credit balance with monthly reset logic
 * Admin users get unlimited credits
 */
export function getCreditBalance(): CreditBalance {
  // ADMIN OVERRIDE: Unlimited credits for admin users
  if (isAdmin()) {
    return {
      credits: 99999, // Effectively unlimited
      lastUpdated: new Date(),
    };
  }
  
  try {
    const subscription = getUserSubscription();
    const limits = TIER_LIMITS[subscription.tier];
    
    const stored = localStorage.getItem('creditBalance');
    const lastReset = localStorage.getItem('creditBalanceReset');
    const now = new Date();
    
    // Check if we need to reset monthly credits
    if (lastReset) {
      const lastResetDate = new Date(lastReset);
      const daysSinceReset = Math.floor((now.getTime() - lastResetDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Reset if it's been 30+ days or if it's a new month
      if (daysSinceReset >= 30 || lastResetDate.getMonth() !== now.getMonth()) {
        // Reset credits to monthly allocation
        const newBalance: CreditBalance = {
          credits: limits.monthlyCredits,
          lastUpdated: now,
        };
        localStorage.setItem('creditBalance', JSON.stringify(newBalance));
        localStorage.setItem('creditBalanceReset', now.toISOString());
        return newBalance;
      }
    } else {
      // First time - set initial credits and reset date
      const initialBalance: CreditBalance = {
        credits: limits.monthlyCredits,
        lastUpdated: now,
      };
      localStorage.setItem('creditBalance', JSON.stringify(initialBalance));
      localStorage.setItem('creditBalanceReset', now.toISOString());
      return initialBalance;
    }
    
    // Return existing balance
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
  
  // Default: return tier-appropriate credits
  const subscription = getUserSubscription();
  const limits = TIER_LIMITS[subscription.tier];
  return {
    credits: limits.monthlyCredits,
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
 * Check if user's tier has access to a production feature
 * @param feature - 'images' | 'audio' | 'video'
 */
export function hasProductionAccess(feature: 'images' | 'audio' | 'video'): boolean {
  // Admin has full access
  if (isAdmin()) return true;
  
  const subscription = getUserSubscription();
  const access = FEATURE_ACCESS[subscription.tier];
  return access?.[feature] ?? false;
}

/**
 * Get credit cost for production request
 */
export function getProductionCreditCost(type: 'audio' | 'image' | 'video', duration: 'short' | 'mid' | 'long'): number {
  const costKey = `${type.toUpperCase()}_${duration.toUpperCase()}` as keyof typeof CREDIT_COSTS;
  return CREDIT_COSTS[costKey] ?? 5; // Default to 5 if not found
}

/**
 * Deduct credits for an action
 * @param action - The action to deduct credits for
 * @param metadata - Optional metadata (e.g., contentId for audio/video)
 * @returns true if deduction was successful, false if insufficient credits
 */
export function deductCredits(action: keyof typeof CREDIT_COSTS, metadata?: Record<string, unknown>): boolean {
  const subscription = getUserSubscription();
  const limits = TIER_LIMITS[subscription.tier];
  
  // Enterprise tier has unlimited credits - skip deduction
  if (limits.monthlyCredits === -1) {
    // Still log the transaction for tracking
    addCreditTransaction({
      type: 'content_generation',
      amount: -CREDIT_COSTS[action],
      description: `Used ${CREDIT_COSTS[action]} credits for ${action} (unlimited tier)`,
      metadata: metadata as Record<string, any> | undefined,
    });
    return true;
  }
  
  const balance = getCreditBalance();
  const cost = CREDIT_COSTS[action];
  
  // Prevent overspending - check before deducting
  if (balance.credits < cost) {
    console.warn(`Insufficient credits: need ${cost}, have ${balance.credits}`);
    return false;
  }
  
  const newBalance = balance.credits - cost;
  
  // Double-check we're not going negative (safety check)
  if (newBalance < 0) {
    console.error(`Credit deduction would result in negative balance: ${newBalance}`);
    return false;
  }
  
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
  // Admins always have access to all features
  if (isAdmin()) {
    return true;
  }
  
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
  
  // Reset credits to tier-appropriate monthly allocation
  const limits = TIER_LIMITS[subscription.tier];
  const now = new Date();
  
  const newBalance: CreditBalance = {
    credits: limits.monthlyCredits === -1 ? 10000 : limits.monthlyCredits, // Unlimited gets high number for display
    lastUpdated: now,
  };
  
  localStorage.setItem('creditBalance', JSON.stringify(newBalance));
  localStorage.setItem('creditBalanceReset', now.toISOString());
  
  // Log the subscription change
  addCreditTransaction({
    type: 'bonus',
    amount: limits.monthlyCredits === -1 ? 10000 : limits.monthlyCredits,
    description: `Subscription updated to ${subscription.tier} - monthly credits allocated`,
  });
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

