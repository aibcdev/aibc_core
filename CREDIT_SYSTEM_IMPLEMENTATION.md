# Credit System & Stripe Integration - Implementation Guide

## What's Been Implemented

### ✅ Core Services Created

1. **`services/subscriptionService.ts`**
   - Subscription tier management (Free, Pro, Enterprise)
   - Credit balance tracking
   - Credit transaction history
   - Feature access checks
   - Credit costs for actions

2. **`services/stripeService.ts`**
   - Stripe checkout session creation
   - Customer portal access
   - Session verification
   - Price fetching

3. **`services/adminService.ts`**
   - Admin authorization (watchaibc@gmail.com)
   - Admin-only functions
   - User management
   - Admin stats

### ✅ Components Created

1. **`components/AdminView.tsx`**
   - Full admin panel with tabs
   - User management
   - Subscription overview
   - Platform analytics

2. **`components/FeatureLock.tsx`**
   - Feature gating component
   - Shows upgrade prompts
   - Locks features based on subscription tier

### ✅ Backend Routes Created

1. **`backend/src/routes/stripe.ts`**
   - Checkout session creation
   - Customer portal
   - Session verification
   - Webhook handling
   - Price listing

2. **`backend/src/routes/admin.ts`**
   - Admin-only endpoints
   - User listing
   - Admin stats

### ✅ Integration Points

1. **AuditView** - Checks credits before scanning
2. **SettingsView** - Shows real subscription and credit balance
3. **DashboardView** - Admin panel link (if admin)
4. **App.tsx** - Admin view routing

## Credit Costs

- **Digital Footprint Scan:** 10 credits
- **Content Generation:** 5 credits
- **Competitor Analysis:** 15 credits
- **Brand DNA Extraction:** 8 credits

## Subscription Tiers

### Free
- 1 scan/month
- 10 credits/month
- Basic features only

### Pro ($29/month)
- 50 scans/month
- 500 credits/month
- Content generation
- Competitor tracking
- Advanced analytics

### Enterprise
- Unlimited scans
- Unlimited credits
- All features

## Next Steps to Complete

### 1. Update PricingView with Stripe Integration
- Connect "Start Trial" buttons to Stripe checkout
- Show real prices from Stripe
- Handle checkout completion

### 2. Add Feature Locks to Sections
- Production Room (Pro+)
- Competitor Tracking (Pro+)
- Advanced Analytics (Pro+)
- Content Generation (Pro+)

### 3. Remove Dummy Data
- Settings billing section ✅ (done)
- Dashboard analytics (already uses real data)
- Calendar events (already uses real data)

### 4. Backend Setup
- Install Stripe package: `npm install stripe`
- Set `STRIPE_SECRET_KEY` in backend `.env`
- Set `STRIPE_WEBHOOK_SECRET` for webhooks
- Create Stripe products and prices in Stripe Dashboard

### 5. Environment Variables Needed

**Backend (.env):**
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Frontend (Netlify):**
```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_... (optional, if using Stripe Elements)
```

## Testing

1. **Test Credit Deduction:**
   - Sign up → Should have 0 credits (Free tier)
   - Try to scan → Should show "Insufficient credits"
   - Upgrade to Pro → Should get 500 credits
   - Scan should deduct 10 credits

2. **Test Admin Panel:**
   - Sign in with watchaibc@gmail.com
   - Should see "Admin Panel" in sidebar
   - Click → Should see admin dashboard

3. **Test Feature Locks:**
   - Free user → Should see locked features
   - Pro user → Should have access

## Stripe Setup Required

1. **Create Stripe Account** (if not done)
2. **Create Products:**
   - Pro Plan (Monthly) - $29
   - Pro Plan (Yearly) - $290
3. **Get API Keys:**
   - Secret Key → Backend `.env`
   - Publishable Key → Frontend (optional)
4. **Set Webhook:**
   - URL: `https://your-backend-url.com/api/stripe/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

