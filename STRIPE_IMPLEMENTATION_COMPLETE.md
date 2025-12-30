# ✅ Stripe Payment Integration - Complete Implementation

## Overview

Stripe payment processing has been fully implemented with database integration, webhook handling, and customer portal support.

---

## What's Been Implemented

### ✅ Backend Routes (`backend/src/routes/stripe.ts`)

1. **POST `/api/stripe/create-checkout-session`**
   - Creates Stripe checkout sessions for subscriptions
   - Supports both recurring subscriptions and one-time payments (Lifetime Deal)
   - Maps tiers to Stripe prices
   - Returns checkout URL

2. **POST `/api/stripe/verify-session`**
   - Verifies completed checkout sessions
   - Updates subscription in database
   - Returns subscription data
   - Handles both subscriptions and lifetime deals

3. **POST `/api/stripe/customer-portal`**
   - Creates Stripe Customer Portal session
   - Looks up customer ID from database
   - Creates customer if doesn't exist
   - Returns portal URL

4. **GET `/api/stripe/prices`**
   - Fetches available prices from Stripe
   - Falls back to default prices if Stripe not configured
   - Returns formatted price list

5. **POST `/api/stripe/webhook`**
   - Handles Stripe webhook events:
     - `checkout.session.completed` - New subscription
     - `customer.subscription.updated` - Subscription changes
     - `customer.subscription.deleted` - Cancellation
     - `invoice.payment_succeeded` - Successful payment
     - `invoice.payment_failed` - Failed payment
   - Updates database automatically
   - Proper error handling and logging

### ✅ Frontend Service (`services/stripeService.ts`)

- `createCheckoutSession()` - Create checkout session
- `verifyCheckoutSession()` - Verify after redirect
- `getCustomerPortalUrl()` - Get customer portal
- `getPrices()` - Fetch available prices

### ✅ Database Integration

- **Table:** `subscriptions`
- **Fields:**
  - `user_id` (UUID, Primary Key)
  - `tier` (free, pro, enterprise)
  - `status` (active, cancelled, past_due, trialing)
  - `current_period_end` (Timestamp)
  - `cancel_at_period_end` (Boolean)
  - `stripe_customer_id` (Text)
  - `stripe_subscription_id` (Text)
  - `is_lifetime_deal` (Boolean)
  - `created_at`, `updated_at` (Timestamps)

- **Indexes:**
  - `stripe_customer_id` (for fast lookups)
  - `stripe_subscription_id` (for webhook processing)
  - `status` (for filtering)

### ✅ Features

- ✅ Subscription checkout (recurring)
- ✅ Lifetime deal checkout (one-time payment)
- ✅ Customer portal access
- ✅ Webhook event handling
- ✅ Database synchronization
- ✅ Error handling and logging
- ✅ Fallback to default prices if Stripe not configured

---

## Setup Instructions

### 1. Stripe Account Setup

1. **Create Stripe Account** (if not done)
   - Go to: https://dashboard.stripe.com/register
   - Complete account setup
   - Verify email and business details

2. **Get API Keys**
   - Go to: https://dashboard.stripe.com/test/apikeys
   - Copy **Secret Key** (starts with `sk_test_` for test, `sk_live_` for production)
   - Copy **Publishable Key** (starts with `pk_test_` for test, `pk_live_` for production)

3. **Create Products & Prices**

   **Option A: Via Stripe Dashboard (Recommended)**
   
   Go to: https://dashboard.stripe.com/test/products
   
   Create products:
   - **Pro Plan** (Monthly)
     - Name: "AIBC Pro Plan - Monthly"
     - Price: $29.00/month
     - Recurring: Monthly
     - Metadata: `tier: pro`
   
   - **Pro Plan** (Yearly)
     - Name: "AIBC Pro Plan - Yearly"
     - Price: $290.00/year
     - Recurring: Yearly
     - Metadata: `tier: pro`
   
   - **Business Plan** (Monthly)
     - Name: "AIBC Business Plan - Monthly"
     - Price: $79.00/month
     - Recurring: Monthly
     - Metadata: `tier: enterprise`
   
   - **Business Plan** (Yearly)
     - Name: "AIBC Business Plan - Yearly"
     - Price: $790.00/year
     - Recurring: Yearly
     - Metadata: `tier: enterprise`

   **Option B: Via Stripe API** (Automated)
   
   Use Stripe CLI or API to create products:
   ```bash
   stripe products create --name="AIBC Pro Plan" --description="Pro tier subscription"
   stripe prices create --product=prod_xxx --unit-amount=2900 --currency=usd --recurring[interval]=month --metadata[tier]=pro
   ```

4. **Configure Webhook**

   **For Local Development:**
   ```bash
   # Install Stripe CLI
   brew install stripe/stripe-cli/stripe
   
   # Login
   stripe login
   
   # Forward webhooks to local server
   stripe listen --forward-to localhost:3001/api/stripe/webhook
   ```
   
   This will give you a webhook signing secret (starts with `whsec_`)

   **For Production:**
   - Go to: https://dashboard.stripe.com/webhooks
   - Click "Add endpoint"
   - Endpoint URL: `https://your-domain.com/api/stripe/webhook`
   - Events to listen to:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
   - Copy the **Signing secret** (starts with `whsec_`)

### 2. Environment Variables

Add to `backend/.env`:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_... # or sk_live_... for production
STRIPE_WEBHOOK_SECRET=whsec_... # From Stripe Dashboard → Webhooks

# Optional (for frontend Stripe Elements)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_... # or pk_live_... for production
```

### 3. Database Setup

Run the migration:

```bash
cd backend
# If using Supabase CLI
supabase migration new create_subscriptions_table

# Or run SQL directly
psql -h your-db-host -U your-user -d your-database -f database/migrations/create_subscriptions_table.sql
```

Or manually create the table using the SQL in `backend/database/migrations/create_subscriptions_table.sql`

### 4. Update Price IDs in Code (Optional)

If you want to fetch prices from Stripe API automatically, ensure your Stripe prices have `metadata.tier` set:

- Pro prices: `metadata.tier = "pro"`
- Business/Enterprise prices: `metadata.tier = "enterprise"`

The code will automatically fetch and map prices based on metadata.

---

## Testing

### Test Cards (Stripe Test Mode)

Use these test cards in Stripe test mode:

- **Success:** `4242 4242 4242 4242`
- **Decline:** `4000 0000 0000 0002`
- **Requires Authentication:** `4000 0025 0000 3155`

**Test Card Details:**
- CVV: Any 3 digits (e.g., `123`)
- Expiry: Any future date (e.g., `12/25`)
- ZIP: Any 5 digits (e.g., `12345`)

### Test Flow

1. **Start Backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start Frontend:**
   ```bash
   npm run dev
   ```

3. **Test Checkout:**
   - Go to `/pricing`
   - Click "Start Trial" on a paid plan
   - Use test card: `4242 4242 4242 4242`
   - Complete checkout
   - Should redirect to dashboard with active subscription

4. **Test Customer Portal:**
   - Go to `/settings` (or dashboard)
   - Click "Manage Billing"
   - Should open Stripe Customer Portal
   - Can update payment method, cancel subscription, etc.

5. **Test Webhooks (Local):**
   ```bash
   stripe listen --forward-to localhost:3001/api/stripe/webhook
   ```
   
   Then trigger events:
   ```bash
   stripe trigger checkout.session.completed
   stripe trigger customer.subscription.updated
   ```

---

## API Endpoints

### Create Checkout Session
```bash
POST /api/stripe/create-checkout-session
Content-Type: application/json
Authorization: Bearer <token>

{
  "priceId": "price_xxx",
  "tier": "pro",
  "userId": "user_123",
  "userEmail": "user@example.com",
  "successUrl": "https://your-domain.com/dashboard?session_id={CHECKOUT_SESSION_ID}",
  "cancelUrl": "https://your-domain.com/pricing"
}
```

### Verify Session
```bash
POST /api/stripe/verify-session
Content-Type: application/json
Authorization: Bearer <token>

{
  "sessionId": "cs_test_xxx"
}
```

### Customer Portal
```bash
POST /api/stripe/customer-portal
Content-Type: application/json
Authorization: Bearer <token>

{
  "returnUrl": "https://your-domain.com/dashboard"
}
```

### Get Prices
```bash
GET /api/stripe/prices
Authorization: Bearer <token>
```

---

## Pricing Tiers

### Free Plan
- **Price:** $0/month
- **Features:** Basic scan, limited credits
- **No Stripe integration needed**

### Pro Plan
- **Monthly:** $29/month
- **Yearly:** $290/year (save 2 months)
- **Stripe Price ID:** Set in Stripe Dashboard
- **Metadata:** `tier: pro`

### Business/Enterprise Plan
- **Monthly:** $79/month
- **Yearly:** $790/year
- **Stripe Price ID:** Set in Stripe Dashboard
- **Metadata:** `tier: enterprise`

### Lifetime Deal
- **Price:** $149 (one-time)
- **Duration:** 12 months of Business-level features
- **No Stripe price needed** (handled in code)

---

## Webhook Events Handled

1. **`checkout.session.completed`**
   - New subscription created
   - Updates database with subscription details
   - Handles both subscriptions and lifetime deals

2. **`customer.subscription.updated`**
   - Subscription changed (plan upgrade/downgrade, status change)
   - Updates database with new subscription data

3. **`customer.subscription.deleted`**
   - Subscription cancelled
   - Sets status to 'cancelled' and tier to 'free'

4. **`invoice.payment_succeeded`**
   - Payment successful
   - Subscription remains active (no action needed)

5. **`invoice.payment_failed`**
   - Payment failed
   - Sets status to 'past_due'

---

## Error Handling

- ✅ Stripe not configured → Returns 503 with helpful message
- ✅ Missing required fields → Returns 400 with error details
- ✅ Invalid session → Returns 400 with error
- ✅ Database errors → Logged, doesn't crash
- ✅ Webhook signature verification → Returns 400 if invalid

---

## Security

- ✅ Webhook signature verification
- ✅ JWT token authentication for API endpoints
- ✅ User ID validation
- ✅ Secure customer ID lookup
- ✅ Environment variable protection

---

## Next Steps

1. ✅ **Set up Stripe account** and get API keys
2. ✅ **Create products and prices** in Stripe Dashboard
3. ✅ **Configure webhook** endpoint
4. ✅ **Add environment variables** to `backend/.env`
5. ✅ **Run database migration** to create subscriptions table
6. ✅ **Test checkout flow** with test cards
7. ✅ **Test webhooks** (local or production)
8. ✅ **Deploy to production** with live Stripe keys

---

## Troubleshooting

### "Stripe not configured" Error
- Check `STRIPE_SECRET_KEY` is set in `backend/.env`
- Restart backend server after adding env vars

### "Webhook secret not configured" Error
- Check `STRIPE_WEBHOOK_SECRET` is set in `backend/.env`
- Get webhook secret from Stripe Dashboard → Webhooks

### Customer Portal Not Working
- Ensure user has `stripe_customer_id` in database
- Check user is authenticated (valid JWT token)
- Verify Stripe customer exists in Stripe Dashboard

### Subscription Not Updating After Payment
- Check webhook is configured correctly
- Verify webhook events are being received (check Stripe Dashboard → Webhooks → Events)
- Check backend logs for webhook processing errors
- Ensure database connection is working

### Prices Not Showing
- Check Stripe API connection
- Verify products/prices exist in Stripe Dashboard
- Check prices have `metadata.tier` set (optional, but recommended)
- Code falls back to default prices if Stripe not configured

---

## Support

For Stripe-specific issues:
- Stripe Documentation: https://stripe.com/docs
- Stripe Support: https://support.stripe.com

For implementation issues:
- Check backend logs: `console.log` and `console.error` statements
- Check Stripe Dashboard → Logs for API errors
- Verify environment variables are set correctly

---

## ✅ Implementation Complete

Stripe payment processing is fully implemented and ready for use. Follow the setup instructions above to activate payment processing.




