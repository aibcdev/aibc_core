/**
 * Credit Management System Verification & Stress Test
 * Verifies credit costs match pricing model and tests edge cases
 */

import { CREDIT_COSTS, TIER_LIMITS, SubscriptionTier, getCreditBalance, deductCredits, hasEnoughCredits, getUserSubscription } from '../services/subscriptionService';

// Expected credit costs from pricing page
const EXPECTED_COSTS = {
  SHORT_POST: 1,           // 1 credit = 1 short post
  LONG_FORM: 3,            // 3 credits = 1 long-form
  AUDIO: 5,                // 5 credits = 1 audio/podcast
  SHORT_VIDEO: 10,         // 10 credits = 1 short video (10-30s)
  LONG_VIDEO: 15,          // 15 credits = 1 long video (30-180s)
};

// Expected tier limits from pricing page
const EXPECTED_TIER_LIMITS = {
  FREE: 15,
  PRO: 150,        // Standard tier
  ENTERPRISE: 600, // Business tier
};

console.log('🔍 CREDIT MANAGEMENT SYSTEM VERIFICATION\n');
console.log('='.repeat(60));

// Test 1: Verify Credit Costs Match Pricing Model
console.log('\n📊 TEST 1: Credit Costs Verification');
console.log('-'.repeat(60));

const costChecks = [
  { action: 'CONTENT_GENERATION', expected: EXPECTED_COSTS.SHORT_POST, actual: CREDIT_COSTS.CONTENT_GENERATION },
  { action: 'LONG_FORM_CONTENT', expected: EXPECTED_COSTS.LONG_FORM, actual: CREDIT_COSTS.LONG_FORM_CONTENT },
  { action: 'AUDIO_GENERATION', expected: EXPECTED_COSTS.AUDIO, actual: CREDIT_COSTS.AUDIO_GENERATION },
  { action: 'SHORT_VIDEO', expected: EXPECTED_COSTS.SHORT_VIDEO, actual: CREDIT_COSTS.SHORT_VIDEO },
  { action: 'LONG_VIDEO', expected: EXPECTED_COSTS.LONG_VIDEO, actual: CREDIT_COSTS.LONG_VIDEO },
];

let costErrors = 0;
costChecks.forEach(({ action, expected, actual }) => {
  const match = expected === actual;
  console.log(`${match ? '✅' : '❌'} ${action}: Expected ${expected}, Got ${actual}`);
  if (!match) costErrors++;
});

// Test 2: Verify Tier Limits Match Pricing Model
console.log('\n📊 TEST 2: Tier Limits Verification');
console.log('-'.repeat(60));

const tierChecks = [
  { tier: SubscriptionTier.FREE, expected: EXPECTED_TIER_LIMITS.FREE, actual: TIER_LIMITS[SubscriptionTier.FREE].monthlyCredits },
  { tier: SubscriptionTier.PRO, expected: EXPECTED_TIER_LIMITS.PRO, actual: TIER_LIMITS[SubscriptionTier.PRO].monthlyCredits },
  { tier: SubscriptionTier.ENTERPRISE, expected: EXPECTED_TIER_LIMITS.ENTERPRISE, actual: TIER_LIMITS[SubscriptionTier.ENTERPRISE].monthlyCredits },
];

let tierErrors = 0;
tierChecks.forEach(({ tier, expected, actual }) => {
  const match = expected === actual;
  console.log(`${match ? '✅' : '❌'} ${tier}: Expected ${expected}, Got ${actual}`);
  if (!match) tierErrors++;
});

// Test 3: Stress Test - Credit Deduction Edge Cases
console.log('\n📊 TEST 3: Credit Deduction Stress Test');
console.log('-'.repeat(60));

// Simulate scenarios
const stressTests = [
  {
    name: 'Free tier user with 15 credits',
    setup: () => {
      localStorage.setItem('userSubscription', JSON.stringify({ tier: SubscriptionTier.FREE, status: 'active' }));
      localStorage.setItem('creditBalance', JSON.stringify({ credits: 15, lastUpdated: new Date() }));
    },
    tests: [
      { action: 'CONTENT_GENERATION', canAfford: true, expectedRemaining: 14 },
      { action: 'LONG_FORM_CONTENT', canAfford: true, expectedRemaining: 11 },
      { action: 'AUDIO_GENERATION', canAfford: true, expectedRemaining: 6 },
      { action: 'SHORT_VIDEO', canAfford: true, expectedRemaining: -4 }, // Should fail
      { action: 'LONG_VIDEO', canAfford: false, expectedRemaining: -4 },
    ]
  },
  {
    name: 'Standard tier user with 150 credits',
    setup: () => {
      localStorage.setItem('userSubscription', JSON.stringify({ tier: SubscriptionTier.PRO, status: 'active' }));
      localStorage.setItem('creditBalance', JSON.stringify({ credits: 150, lastUpdated: new Date() }));
    },
    tests: [
      { action: 'CONTENT_GENERATION', canAfford: true, count: 60, expectedRemaining: 90 }, // 60 short posts
      { action: 'LONG_FORM_CONTENT', canAfford: true, count: 8, expectedRemaining: 66 }, // 8 long-form
      { action: 'AUDIO_GENERATION', canAfford: true, count: 10, expectedRemaining: 16 }, // 10 audio
      { action: 'SHORT_VIDEO', canAfford: true, count: 1, expectedRemaining: 6 }, // 1 short video
      { action: 'LONG_VIDEO', canAfford: false, expectedRemaining: 6 }, // Can't afford long video
    ]
  },
  {
    name: 'Business tier user with 600 credits',
    setup: () => {
      localStorage.setItem('userSubscription', JSON.stringify({ tier: SubscriptionTier.ENTERPRISE, status: 'active' }));
      localStorage.setItem('creditBalance', JSON.stringify({ credits: 600, lastUpdated: new Date() }));
    },
    tests: [
      { action: 'CONTENT_GENERATION', canAfford: true, count: 150, expectedRemaining: 450 }, // 150 short posts
      { action: 'LONG_FORM_CONTENT', canAfford: true, count: 20, expectedRemaining: 390 }, // 20 long-form
      { action: 'AUDIO_GENERATION', canAfford: true, count: 8, expectedRemaining: 350 }, // 8 audio
      { action: 'SHORT_VIDEO', canAfford: true, count: 10, expectedRemaining: 250 }, // 10 short videos
      { action: 'LONG_VIDEO', canAfford: true, count: 5, expectedRemaining: 175 }, // 5 long videos
    ]
  },
];

let stressTestErrors = 0;
stressTests.forEach(({ name, setup, tests }) => {
  console.log(`\n  Testing: ${name}`);
  setup();
  
  tests.forEach(({ action, canAfford, count = 1, expectedRemaining }) => {
    const initialBalance = getCreditBalance().credits;
    const hasEnough = hasEnoughCredits(action as keyof typeof CREDIT_COSTS);
    
    if (hasEnough !== canAfford) {
      console.log(`    ❌ ${action}: Expected canAfford=${canAfford}, got ${hasEnough}`);
      stressTestErrors++;
      return;
    }
    
    if (canAfford) {
      let success = true;
      for (let i = 0; i < count; i++) {
        success = deductCredits(action as keyof typeof CREDIT_COSTS) && success;
      }
      
      const finalBalance = getCreditBalance().credits;
      const actualRemaining = finalBalance;
      
      if (actualRemaining !== expectedRemaining) {
        console.log(`    ❌ ${action} (x${count}): Expected remaining=${expectedRemaining}, got ${actualRemaining}`);
        stressTestErrors++;
      } else {
        console.log(`    ✅ ${action} (x${count}): Balance ${initialBalance} → ${actualRemaining}`);
      }
    } else {
      console.log(`    ✅ ${action}: Correctly blocked (insufficient credits)`);
    }
  });
});

// Test 4: Verify No Overspending
console.log('\n📊 TEST 4: Overspending Prevention');
console.log('-'.repeat(60));

localStorage.setItem('userSubscription', JSON.stringify({ tier: SubscriptionTier.FREE, status: 'active' }));
localStorage.setItem('creditBalance', JSON.stringify({ credits: 5, lastUpdated: new Date() }));

const overspendTests = [
  { action: 'LONG_VIDEO', shouldBlock: true }, // 15 credits, only have 5
  { action: 'SHORT_VIDEO', shouldBlock: true }, // 10 credits, only have 5
  { action: 'AUDIO_GENERATION', shouldBlock: false }, // 5 credits, have 5
  { action: 'CONTENT_GENERATION', shouldBlock: false }, // 1 credit, have 5
];

let overspendErrors = 0;
overspendTests.forEach(({ action, shouldBlock }) => {
  const balance = getCreditBalance().credits;
  const cost = CREDIT_COSTS[action as keyof typeof CREDIT_COSTS];
  const canAfford = hasEnoughCredits(action as keyof typeof CREDIT_COSTS);
  
  if (canAfford && shouldBlock) {
    console.log(`    ❌ ${action}: Should block (need ${cost}, have ${balance}) but allowed`);
    overspendErrors++;
  } else if (!canAfford && !shouldBlock) {
    console.log(`    ❌ ${action}: Should allow (need ${cost}, have ${balance}) but blocked`);
    overspendErrors++;
  } else {
    console.log(`    ✅ ${action}: Correctly ${shouldBlock ? 'blocked' : 'allowed'} (need ${cost}, have ${balance})`);
  }
});

// Summary
console.log('\n' + '='.repeat(60));
console.log('📋 VERIFICATION SUMMARY');
console.log('='.repeat(60));
console.log(`Credit Costs: ${costErrors === 0 ? '✅ PASS' : `❌ FAIL (${costErrors} errors)`}`);
console.log(`Tier Limits: ${tierErrors === 0 ? '✅ PASS' : `❌ FAIL (${tierErrors} errors)`}`);
console.log(`Stress Tests: ${stressTestErrors === 0 ? '✅ PASS' : `❌ FAIL (${stressTestErrors} errors)`}`);
console.log(`Overspending Prevention: ${overspendErrors === 0 ? '✅ PASS' : `❌ FAIL (${overspendErrors} errors)`}`);

const totalErrors = costErrors + tierErrors + stressTestErrors + overspendErrors;
if (totalErrors === 0) {
  console.log('\n🎉 All tests passed! Credit management system is correctly configured.');
} else {
  console.log(`\n⚠️  ${totalErrors} total errors found. Please review and fix.`);
}

export {};

