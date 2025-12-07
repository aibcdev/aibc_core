import express from 'express';
import Stripe from 'stripe';

const router = express.Router();

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
});

/**
 * Create Stripe checkout session
 */
router.post('/create-checkout-session', async (req, res) => {
  try {
    const { priceId, tier, userId, userEmail, successUrl, cancelUrl } = req.body;

    if (!priceId || !tier || !userEmail) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      customer_email: userEmail,
      metadata: {
        userId,
        tier,
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

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
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID required' });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Payment not completed' });
    }

    const subscription = await stripe.subscriptions.retrieve(session.subscription as string);

    // Map Stripe subscription to our subscription format
    const subscriptionData = {
      tier: session.metadata?.tier || 'pro',
      status: subscription.status === 'active' ? 'active' : 'cancelled',
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      stripeCustomerId: subscription.customer as string,
      stripeSubscriptionId: subscription.id,
    };

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
    const prices = await stripe.prices.list({
      active: true,
      type: 'recurring',
    });

    const formattedPrices = prices.data.map(price => ({
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
  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return res.status(400).send('Webhook secret not configured');
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      console.log('Checkout completed:', session.id);
      // Update user subscription in database
      break;
    case 'customer.subscription.updated':
      const subscription = event.data.object as Stripe.Subscription;
      console.log('Subscription updated:', subscription.id);
      // Update subscription status in database
      break;
    case 'customer.subscription.deleted':
      const deletedSubscription = event.data.object as Stripe.Subscription;
      console.log('Subscription cancelled:', deletedSubscription.id);
      // Update subscription status in database
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
});

export default router;

