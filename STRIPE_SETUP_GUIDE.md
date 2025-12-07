# Stripe Integration Setup Guide

## Backend Setup

### 1. Install Stripe Package

```bash
cd backend
npm install stripe
```

### 2. Get Stripe API Keys

1. Go to https://dashboard.stripe.com
2. Click **Developers** → **API keys**
3. Copy:
   - **Secret key** (starts with `sk_test_` or `sk_live_`)
   - **Publishable key** (starts with `pk_test_` or `pk_live_`)

### 3. Set Environment Variables

**In backend `.env`:**
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_... (get after setting up webhook)
```

**In Cloud Run (production):**
```bash
gcloud run services update aibc-backend \
  --set-secrets STRIPE_SECRET_KEY=stripe-secret-key:latest \
  --set-secrets STRIPE_WEBHOOK_SECRET=stripe-webhook-secret:latest
```

### 4. Create Products in Stripe Dashboard

1. Go to **Products** → **Add product**
2. Create:
   - **Pro Plan (Monthly)**
     - Price: $29.00
     - Billing: Recurring monthly
     - Metadata: `tier=pro`
   - **Pro Plan (Yearly)**
     - Price: $290.00
     - Billing: Recurring yearly
     - Metadata: `tier=pro`
   - **Enterprise Plan** (if needed)
     - Price: Custom
     - Metadata: `tier=enterprise`

3. Copy the **Price IDs** (starts with `price_...`)

### 5. Set Up Webhook

1. Go to **Developers** → **Webhooks** → **Add endpoint**
2. URL: `https://your-backend-url.com/api/stripe/webhook`
3. Events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy the **Webhook signing secret** (starts with `whsec_...`)

## Frontend Setup

### Environment Variables (Optional)

If using Stripe Elements (not required for current implementation):
```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## Testing

### Test Mode

1. Use test API keys (`sk_test_...`, `pk_test_...`)
2. Use test card: `4242 4242 4242 4242`
3. Any future expiry date
4. Any 3-digit CVC

### Test Flow

1. User clicks "Upgrade to Pro" on pricing page
2. Redirects to Stripe checkout
3. User enters test card
4. Completes payment
5. Redirects back to dashboard
6. Subscription updated
7. Credits added (500 for Pro)

## Production Checklist

- [ ] Switch to live API keys (`sk_live_...`)
- [ ] Update webhook URL to production backend
- [ ] Test checkout flow end-to-end
- [ ] Verify subscription updates in database
- [ ] Test credit allocation
- [ ] Test customer portal access

## Troubleshooting

### "Failed to create checkout session"
- Check `STRIPE_SECRET_KEY` is set in backend
- Verify backend is running
- Check CORS settings

### "Payment not completed"
- Check webhook is configured
- Verify session ID is correct
- Check Stripe dashboard for payment status

### Credits not added after payment
- Check webhook is receiving events
- Verify subscription update logic
- Check localStorage for subscription data

