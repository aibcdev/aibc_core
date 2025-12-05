const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export type UserTier = 'free' | 'pro' | 'business' | 'premium';

export interface CreditBalance {
  userId: string;
  tier: UserTier;
  credits: number;
  totalCreditsUsed: number;
  lastRefill?: string;
  nextRefill?: string;
}

export interface FeatureAccess {
  feature: string;
  allowed: boolean;
  reason?: string;
  creditsRequired?: number;
  creditsAvailable?: number;
}

/**
 * Get user credit balance
 */
export function getCreditBalance(userId: string, userTier: UserTier): CreditBalance {
  // For now, use localStorage (will be replaced with API call)
  const stored = localStorage.getItem(`credits_${userId}`);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Error parsing credit balance:', e);
    }
  }
  
  // Default based on tier
  const defaultCredits: Record<UserTier, number> = {
    free: 0,
    pro: 100,
    business: 500,
    premium: 2000
  };
  
  return {
    userId,
    tier: userTier,
    credits: defaultCredits[userTier],
    totalCreditsUsed: 0
  };
}

/**
 * Check if user can access a feature
 */
export async function checkFeatureAccess(
  feature: string,
  userTier: UserTier = 'free'
): Promise<FeatureAccess> {
  try {
    const userId = localStorage.getItem('userId') || 'anonymous';
    const balance = getCreditBalance(userId, userTier);
    
    const response = await fetch(`${API_URL}/api/credits/check-access`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        feature,
        userTier,
        userCredits: balance.credits
      }),
    });

    if (response.ok) {
      return await response.json();
    }
    
    // Fallback to client-side check
    return checkFeatureAccessLocal(feature, userTier, balance.credits);
  } catch (error) {
    console.error('Error checking feature access:', error);
    const userId = localStorage.getItem('userId') || 'anonymous';
    const balance = getCreditBalance(userId, userTier);
    return checkFeatureAccessLocal(feature, userTier, balance.credits);
  }
}

/**
 * Client-side feature access check (fallback)
 */
function checkFeatureAccessLocal(
  feature: string,
  userTier: UserTier,
  userCredits: number
): FeatureAccess {
  const CREDIT_COSTS: Record<string, number> = {
    'content.text': 1,
    'content.thread': 3,
    'content.image': 5,
    'content.video': 50,
    'content.audio': 30,
    'content.podcast': 40,
    'scan.standard': 0,
    'scan.deep': 10,
    'analytics.basic': 0,
    'analytics.custom': 5,
    'competitor.basic': 0,
    'competitor.deep': 5,
  };
  
  const TIER_FEATURES: Record<UserTier, string[]> = {
    free: ['content.text', 'scan.standard', 'analytics.basic', 'competitor.basic'],
    pro: ['content.text', 'content.thread', 'content.image', 'scan.standard', 'analytics.basic', 'competitor.basic'],
    business: ['content.text', 'content.thread', 'content.image', 'scan.standard', 'scan.deep', 'analytics.basic', 'analytics.custom', 'competitor.basic', 'competitor.deep'],
    premium: ['content.text', 'content.thread', 'content.image', 'content.video', 'content.audio', 'content.podcast', 'scan.standard', 'scan.deep', 'analytics.basic', 'analytics.custom', 'competitor.basic', 'competitor.deep']
  };
  
  const creditsRequired = CREDIT_COSTS[feature] || 0;
  const tierFeatures = TIER_FEATURES[userTier] || [];
  
  if (!tierFeatures.includes(feature)) {
    return {
      feature,
      allowed: false,
      reason: `This feature requires a higher tier.`,
      creditsRequired,
      creditsAvailable: userCredits
    };
  }
  
  if (creditsRequired > 0 && userCredits < creditsRequired) {
    return {
      feature,
      allowed: false,
      reason: `Insufficient credits. Required: ${creditsRequired}, Available: ${userCredits}`,
      creditsRequired,
      creditsAvailable: userCredits
    };
  }
  
  return {
    feature,
    allowed: true,
    creditsRequired,
    creditsAvailable: userCredits
  };
}

/**
 * Use credits for a feature
 */
export async function useCredits(
  feature: string,
  userTier: UserTier = 'free'
): Promise<{ success: boolean; newBalance: number; error?: string }> {
  try {
    const userId = localStorage.getItem('userId') || 'anonymous';
    const balance = getCreditBalance(userId, userTier);
    
    // Check access first
    const access = await checkFeatureAccess(feature, userTier);
    if (!access.allowed) {
      return {
        success: false,
        newBalance: balance.credits,
        error: access.reason
      };
    }
    
    // Deduct credits
    const creditsRequired = access.creditsRequired || 0;
    const newBalance = Math.max(0, balance.credits - creditsRequired);
    
    // Update localStorage
    const updatedBalance: CreditBalance = {
      ...balance,
      credits: newBalance,
      totalCreditsUsed: balance.totalCreditsUsed + creditsRequired
    };
    localStorage.setItem(`credits_${userId}`, JSON.stringify(updatedBalance));
    
    // Call backend to record usage
    try {
      await fetch(`${API_URL}/api/credits/use`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          feature,
          creditsUsed: creditsRequired,
          newBalance
        }),
      });
    } catch (error) {
      console.error('Error recording credit usage:', error);
      // Continue anyway - local update succeeded
    }
    
    return {
      success: true,
      newBalance
    };
  } catch (error: any) {
    return {
      success: false,
      newBalance: 0,
      error: error.message
    };
  }
}


