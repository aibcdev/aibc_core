# Stripe Integration Setup Guide

## ✅ Completed Implementation

### Backend Routes (`backend/src/routes/stripe.ts`)
1. **POST `/api/stripe/create-checkout-session`**
   - Creates Stripe checkout session for subscriptions
   - Handles Lifetime Deal as one-time payment ($149)
   - Maps tiers correctly (Standard → PRO, Business → ENTERPRISE)

2. **POST `/api/stripe/verify-session`**
   - Verifies payment completion
   - Handles both subscriptions and one-time payments
   - Maps Stripe tiers to internal SubscriptionTier enum
   - Sets 12-month access for Lifetime Deal

3. **POST `/api/stripe/customer-portal`**
   - Provides billing portal access
   - Allows subscription management

4. **POST `/api/stripe/webhook`**
   - Handles Stripe webhook events:
     - `checkout.session.completed` - Payment success
     - `customer.subscription.created/updated` - Subscription changes
     - `customer.subscription.deleted` - Cancellations
     - `invoice.payment_succeeded` - Recurring payments
     - `invoice.payment_failed` - Payment failures

5. **GET `/api/stripe/prices`**
   - Returns available Stripe prices
   - Falls back to default prices if Stripe not configured

### Frontend Services (`services/stripeService.ts`)
- `createCheckoutSession()` - Initiates checkout
- `verifyCheckoutSession()` - Verifies and activates subscription
- `getCustomerPortalUrl()` - Gets billing portal URL
- `getPrices()` - Fetches available prices

### Frontend Integration
- Pricing page buttons trigger checkout
- Dashboard verifies session on load (handles Stripe redirect)
- Credit balance updates automatically on subscription activation

## 🔧 Required Setup Steps

### 1. Stripe Account Setup
1. Create/Login to Stripe account: https://dashboard.stripe.com
2. Get API keys:
   - **Test Mode**: Use test keys for development
   - **Live Mode**: Use live keys for production

### 2. Create Products & Prices in Stripe Dashboard

#### Standard Plan ($39/month)
1. Go to Products → Create Product
2. Name: "AIBC Standard"
3. Description: "Weekly content without hiring a content marketer"
4. Pricing:
   - Type: Recurring
   - Price: $39.00 USD
   - Billing period: Monthly
5. Save the **Price ID** (starts with `price_`)

#### Business Plan ($149/month)
1. Create Product: "AIBC Business"
2. Description: "Your AI content department, without the payroll"
3. Pricing:
   - Type: Recurring
   - Price: $149.00 USD
   - Billing period: Monthly
4. Save the **Price ID**

#### Lifetime Deal ($149 one-time)
- Handled automatically via code (no Stripe product needed)
- Uses `price_data` in checkout session

### 3. Environment Variables

Add to `backend/.env`:
```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_... # or sk_live_... for production
STRIPE_WEBHOOK_SECRET=whsec_... # From Stripe Dashboard → Webhooks
```

### 4. Webhook Configuration

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. Endpoint URL: `https://your-domain.com/api/stripe/webhook`
4. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the **Signing secret** (starts with `whsec_`)
6. Add to `backend/.env` as `STRIPE_WEBHOOK_SECRET`

### 5. Update Price IDs in Code

Option A: Fetch from Stripe API (Recommended)
- The `getPrices()` function already fetches prices dynamically
- Ensure prices have `metadata.tier` set in Stripe Dashboard:
  - Standard price: `tier=standard`
  - Business price: `tier=business`

Option B: Hardcode Price IDs
- Update `services/stripeService.ts` `getDefaultPrices()` function
- Or update `components/PricingView.tsx` to use specific price IDs

### 6. Test the Integration

#### Test Cards (Stripe Test Mode)
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Requires 3D Secure: `4000 0025 0000 3155`

#### Test Flow
1. Click "Get Standard" or "Upgrade to Business" on pricing page
2. Complete checkout with test card
3. Verify redirect to dashboard
4. Check subscription is activated
5. Verify credit balance updated

## 📊 Credit Management Verification

### ✅ Verified Credit Costs
- Short Post: 1 credit ✅
- Long-form: 3 credits ✅
- Audio: 5 credits ✅
- Short Video: 10 credits ✅
- Long Video: 15 credits ✅

### ✅ Verified Tier Limits
- Free: 15 credits/month ✅
- Standard: 150 credits/month ✅
- Business: 600 credits/month ✅
- Lifetime Deal: Unlimited (fair-use) ✅

### ✅ Stress Test Results
- Overspending prevention: ✅ Working
- Negative balance protection: ✅ Working
- Tier limit enforcement: ✅ Working
- Monthly credit reset: ✅ Working

## 🚀 Next Steps

1. **Set up Stripe account** and get API keys
2. **Create products/prices** in Stripe Dashboard
3. **Configure webhook** endpoint
4. **Test checkout flow** with test cards
5. **Verify webhook** receives events
6. **Test subscription lifecycle** (create, update, cancel)
7. **Deploy to production** with live Stripe keys

## 📝 Notes

- Lifetime Deal is handled as a one-time payment, not a subscription
- Credit balance automatically resets monthly based on tier
- Unlimited tiers (Lifetime Deal, Enterprise) skip credit deduction but log transactions
- All credit operations are logged in transaction history
