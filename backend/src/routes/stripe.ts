import express from 'express';

const router = express.Router();

// SubscriptionTier enum (matching frontend)
enum SubscriptionTier {
  FREE = 'free',
  PRO = 'pro',
  ENTERPRISE = 'enterprise'
}

// Stripe will be initialized when STRIPE_SECRET_KEY is set
// For now, routes return appropriate errors if not configured
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

function getStripe() {
  if (!STRIPE_SECRET_KEY) {
    return null;
  }
  // Dynamic import to avoid build errors when stripe isn't installed
  try {
    const Stripe = require('stripe');
    return new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2024-11-20.acacia' });
  } catch {
    return null;
  }
}

/**
 * Create Stripe checkout session
 */
router.post('/create-checkout-session', async (req, res) => {
  try {
    const stripe = getStripe();
    if (!stripe) {
      return res.status(503).json({ error: 'Stripe not configured. Set STRIPE_SECRET_KEY.' });
    }

    const { priceId, tier, userId, userEmail, successUrl, cancelUrl } = req.body;

    if (!tier || !userEmail) {
      return res.status(400).json({ error: 'Missing required fields (tier, userEmail)' });
    }

    // Lifetime deal doesn't need priceId
    if (tier !== 'lifetime_deal' && !priceId) {
      return res.status(400).json({ error: 'priceId required for subscription plans' });
    }

    // Handle Lifetime Deal (one-time payment) vs subscriptions
    const isLifetimeDeal = tier === 'lifetime' || tier === 'lifetime_deal';
    
    const sessionConfig: any = {
      payment_method_types: ['card'],
      customer_email: userEmail,
      metadata: {
        userId: userId || 'unknown',
        tier,
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    };

    if (isLifetimeDeal) {
      // Lifetime Deal: one-time payment of $149
      sessionConfig.mode = 'payment';
      sessionConfig.line_items = [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'AIBC Lifetime Deal - Founders Year',
              description: '12 months of Business-level features',
            },
            unit_amount: 14900, // $149.00
          },
          quantity: 1,
        },
      ];
    } else {
      // Regular subscription
      sessionConfig.mode = 'subscription';
      sessionConfig.line_items = [
        {
          price: priceId,
          quantity: 1,
        },
      ];
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    res.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    res.status(500).json({ error: error.message || 'Failed to create checkout session' });
  }
});

/**
 * Get customer portal URL
 */
router.post('/customer-portal', async (req, res) => {
  try {
    const stripe = getStripe();
    if (!stripe) {
      return res.status(503).json({ error: 'Stripe not configured' });
    }

    const { returnUrl } = req.body;
    const userId = req.headers['x-user-id'] as string;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get or create Stripe customer
    // In production, you'd look up the customer ID from your database
    const customerId = `cus_${userId}`;

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    res.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe portal error:', error);
    res.status(500).json({ error: error.message || 'Failed to create portal session' });
  }
});

/**
 * Verify checkout session and return subscription
 */
router.post('/verify-session', async (req, res) => {
  try {
    const stripe = getStripe();
    if (!stripe) {
      return res.status(503).json({ error: 'Stripe not configured' });
    }

    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID required' });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Payment not completed' });
    }

    const tier = session.metadata?.tier || 'pro';
    const isLifetimeDeal = tier === 'lifetime' || tier === 'lifetime_deal';

    let subscriptionData: any;

    if (isLifetimeDeal) {
      // Lifetime Deal: one-time payment, set 12-month access
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 12); // 12 months from now
      
      subscriptionData = {
        tier: SubscriptionTier.ENTERPRISE, // Business-level features
        status: 'active',
        currentPeriodEnd: endDate,
        cancelAtPeriodEnd: false,
        stripeCustomerId: session.customer as string,
        stripeSubscriptionId: null, // No subscription for one-time payment
        isLifetimeDeal: true,
      };
    } else {
      // Regular subscription - only retrieve if subscription exists
      if (!session.subscription) {
        return res.status(400).json({ error: 'No subscription found for this session' });
    }

    const subscription = await stripe.subscriptions.retrieve(session.subscription as string) as any;

      // Map tier names to our SubscriptionTier enum
      let mappedTier = SubscriptionTier.PRO;
      if (tier === 'standard' || tier === 'pro') {
        mappedTier = SubscriptionTier.PRO;
      } else if (tier === 'business' || tier === 'enterprise') {
        mappedTier = SubscriptionTier.ENTERPRISE;
      }

      subscriptionData = {
        tier: mappedTier,
      status: subscription.status === 'active' ? 'active' : 'cancelled',
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      stripeCustomerId: subscription.customer as string,
      stripeSubscriptionId: subscription.id,
    };
    }

    res.json({ subscription: subscriptionData });
  } catch (error: any) {
    console.error('Stripe verification error:', error);
    res.status(500).json({ error: error.message || 'Failed to verify session' });
  }
});

/**
 * Get available prices
 */
router.get('/prices', async (req, res) => {
  try {
    const stripe = getStripe();
    if (!stripe) {
      // Return default prices if Stripe not configured
      return res.json({ 
        prices: [
          { id: 'price_pro_monthly', amount: 2900, currency: 'usd', interval: 'month', tier: 'pro' },
          { id: 'price_pro_yearly', amount: 29000, currency: 'usd', interval: 'year', tier: 'pro' },
        ] 
      });
    }

    const prices = await stripe.prices.list({
      active: true,
      type: 'recurring',
    });

    const formattedPrices = prices.data.map((price: any) => ({
      id: price.id,
      amount: price.unit_amount || 0,
      currency: price.currency,
      interval: price.recurring?.interval || 'month',
      tier: price.metadata?.tier || 'pro',
    }));

    res.json({ prices: formattedPrices });
  } catch (error: any) {
    console.error('Get prices error:', error);
    res.status(500).json({ error: error.message || 'Failed to get prices' });
  }
});

/**
 * Webhook handler for Stripe events
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const stripe = getStripe();
  if (!stripe) {
    return res.status(503).send('Stripe not configured');
  }

  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return res.status(400).send('Webhook secret not configured');
  }

  let event: any;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const checkoutSession = event.data.object;
      console.log('Checkout completed:', checkoutSession.id);
      // Update user subscription in database
      break;
    case 'customer.subscription.updated':
      const updatedSubscription = event.data.object;
      console.log('Subscription updated:', updatedSubscription.id);
      // Update subscription status in database
      break;
    case 'customer.subscription.deleted':
      const deletedSubscription = event.data.object;
      console.log('Subscription cancelled:', deletedSubscription.id);
      // Update subscription status in database
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
});

export default router;

