"use strict";
/**
 * Credit Management Service
 * Handles user credits, tier-based access, and feature locks
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TIER_LIMITS = exports.CREDIT_COSTS = void 0;
exports.checkFeatureAccess = checkFeatureAccess;
exports.deductCredits = deductCredits;
exports.getCreditBalance = getCreditBalance;
exports.refillMonthlyCredits = refillMonthlyCredits;
exports.checkScanLimit = checkScanLimit;
// Credit costs per feature
exports.CREDIT_COSTS = {
    // Content Generation
    'content.text': 1, // Text post generation
    'content.thread': 3, // Thread generation
    'content.image': 5, // Image generation
    'content.video': 50, // Video generation (curated)
    'content.audio': 30, // Audio generation (curated)
    'content.podcast': 40, // Podcast generation
    // Scanning
    'scan.standard': 0, // Free tier - LLM scan
    'scan.deep': 10, // Premium tier - API scan
    // Analytics
    'analytics.basic': 0, // Free analytics
    'analytics.custom': 5, // Custom reports (Business+)
    // Competitor Analysis
    'competitor.basic': 0, // Basic competitor data
    'competitor.deep': 5, // Deep competitor analysis
};
// Tier limits
exports.TIER_LIMITS = {
    free: {
        credits: 0,
        monthlyScans: 5,
        features: ['content.text', 'scan.standard', 'analytics.basic', 'competitor.basic']
    },
    pro: {
        credits: 100,
        monthlyScans: 30,
        features: ['content.text', 'content.thread', 'content.image', 'scan.standard', 'analytics.basic', 'competitor.basic']
    },
    business: {
        credits: 500,
        monthlyScans: 100,
        features: ['content.text', 'content.thread', 'content.image', 'scan.standard', 'scan.deep', 'analytics.basic', 'analytics.custom', 'competitor.basic', 'competitor.deep']
    },
    premium: {
        credits: 2000,
        monthlyScans: -1, // Unlimited
        features: ['content.text', 'content.thread', 'content.image', 'content.video', 'content.audio', 'content.podcast', 'scan.standard', 'scan.deep', 'analytics.basic', 'analytics.custom', 'competitor.basic', 'competitor.deep']
    }
};
/**
 * Check if user has access to a feature
 */
function checkFeatureAccess(userId, feature, userTier = 'free', userCredits = 0) {
    const tierLimits = exports.TIER_LIMITS[userTier];
    const creditsRequired = exports.CREDIT_COSTS[feature];
    // Check if feature is available for this tier
    if (!tierLimits.features.includes(feature)) {
        return {
            feature,
            allowed: false,
            reason: `This feature requires a higher tier. Available in ${getRequiredTier(feature)} tier.`,
            creditsRequired,
            creditsAvailable: userCredits
        };
    }
    // Check if user has enough credits
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
 * Get required tier for a feature
 */
function getRequiredTier(feature) {
    if (exports.CREDIT_COSTS[feature] === 0)
        return 'Free';
    if (feature.includes('video') || feature.includes('audio') || feature.includes('podcast'))
        return 'Premium';
    if (feature.includes('custom') || feature.includes('deep'))
        return 'Business';
    return 'Pro';
}
/**
 * Deduct credits for feature usage
 */
function deductCredits(userId, feature, userTier, currentCredits) {
    const access = checkFeatureAccess(userId, feature, userTier, currentCredits);
    if (!access.allowed) {
        return {
            success: false,
            newBalance: currentCredits,
            error: access.reason
        };
    }
    const creditsRequired = exports.CREDIT_COSTS[feature];
    const newBalance = currentCredits - creditsRequired;
    return {
        success: true,
        newBalance: Math.max(0, newBalance)
    };
}
/**
 * Get credit balance for user
 */
function getCreditBalance(userId, userTier) {
    // In production, this would fetch from database
    // For now, use localStorage on frontend
    const defaultCredits = exports.TIER_LIMITS[userTier].credits;
    return {
        userId,
        tier: userTier,
        credits: defaultCredits,
        totalCreditsUsed: 0
    };
}
/**
 * Refill credits (monthly reset)
 */
function refillMonthlyCredits(userId, userTier) {
    const tierLimits = exports.TIER_LIMITS[userTier];
    return {
        userId,
        tier: userTier,
        credits: tierLimits.credits,
        totalCreditsUsed: 0,
        lastRefill: new Date().toISOString(),
        nextRefill: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
    };
}
/**
 * Check scan limit for tier
 */
function checkScanLimit(userTier, scansThisMonth) {
    const limit = exports.TIER_LIMITS[userTier].monthlyScans;
    if (limit === -1)
        return true; // Unlimited
    return scansThisMonth < limit;
}
