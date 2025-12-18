import express from 'express';
import { getSupabaseClient } from '../lib/supabase';

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
 * Get user ID from auth token
 */
function getUserIdFromRequest(req: express.Request): string | null {
  // Try to get from Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      // Decode JWT token (basic decode, no verification for now)
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      return payload.userId || payload.id || null;
    } catch {
      // If token decode fails, try to get from request body or headers
      return (req.body?.userId || req.headers['x-user-id']) as string | null;
    }
  }
  return (req.body?.userId || req.headers['x-user-id']) as string | null;
}

/**
 * Update user subscription in database
 */
async function updateUserSubscription(
  userId: string,
  subscriptionData: {
    tier: SubscriptionTier;
    status: string;
    currentPeriodEnd: Date | null;
    cancelAtPeriodEnd: boolean;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string | null;
    isLifetimeDeal?: boolean;
  }
): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    console.warn('⚠️  Supabase not configured. Subscription update skipped.');
    return;
  }

  try {
    // Update or insert subscription
    const { error } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: userId,
        tier: subscriptionData.tier,
        status: subscriptionData.status,
        current_period_end: subscriptionData.currentPeriodEnd?.toISOString() || null,
        cancel_at_period_end: subscriptionData.cancelAtPeriodEnd,
        stripe_customer_id: subscriptionData.stripeCustomerId || null,
        stripe_subscription_id: subscriptionData.stripeSubscriptionId || null,
        is_lifetime_deal: subscriptionData.isLifetimeDeal || false,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      });

    if (error) {
      console.error('Error updating subscription in database:', error);
    } else {
      console.log(`✅ Subscription updated for user ${userId}: ${subscriptionData.tier} (${subscriptionData.status})`);
    }
  } catch (error) {
    console.error('Error updating subscription:', error);
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
    const userId = getUserIdFromRequest(req);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized - user ID required' });
    }

    // Look up Stripe customer ID from database
    const supabase = getSupabaseClient();
    let customerId: string | null = null;

    if (supabase) {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('stripe_customer_id')
        .eq('user_id', userId)
        .single();

      if (!error && data?.stripe_customer_id) {
        customerId = data.stripe_customer_id;
      }
    }

    // If no customer ID found, try to get from Stripe by email
    if (!customerId) {
      // Try to get user email from auth token or request
      const userEmail = req.body.userEmail || req.headers['x-user-email'];
      if (userEmail) {
        const customers = await stripe.customers.list({
          email: userEmail as string,
          limit: 1,
        });
        if (customers.data.length > 0) {
          customerId = customers.data[0].id;
        }
      }
    }

    // If still no customer ID, create one
    if (!customerId) {
      const userEmail = req.body.userEmail || req.headers['x-user-email'] || `user-${userId}@aibc.com`;
      const customer = await stripe.customers.create({
        email: userEmail as string,
        metadata: {
          userId,
        },
      });
      customerId = customer.id;

      // Save customer ID to database
      if (supabase) {
        await supabase
          .from('subscriptions')
          .upsert({
            user_id: userId,
            stripe_customer_id: customerId,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id',
          });
      }
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl || `${req.headers.origin || 'http://localhost:5173'}/dashboard`,
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
    const userId = session.metadata?.userId || getUserIdFromRequest(req) || 'unknown';
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

    // Update subscription in database
    if (userId && userId !== 'unknown') {
      await updateUserSubscription(userId, subscriptionData);
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
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const checkoutSession = event.data.object as any;
        console.log('✅ Checkout completed:', checkoutSession.id);
        
        const userId = checkoutSession.metadata?.userId;
        const tier = checkoutSession.metadata?.tier || 'pro';
        const isLifetimeDeal = tier === 'lifetime' || tier === 'lifetime_deal';

        if (userId && userId !== 'unknown') {
          if (isLifetimeDeal) {
            // Lifetime Deal: one-time payment
            const endDate = new Date();
            endDate.setMonth(endDate.getMonth() + 12);
            
            await updateUserSubscription(userId, {
              tier: SubscriptionTier.ENTERPRISE,
              status: 'active',
              currentPeriodEnd: endDate,
              cancelAtPeriodEnd: false,
              stripeCustomerId: checkoutSession.customer as string,
              stripeSubscriptionId: null,
              isLifetimeDeal: true,
            });
          } else if (checkoutSession.subscription) {
            // Regular subscription
            const subscription = await stripe.subscriptions.retrieve(checkoutSession.subscription as string) as any;
            let mappedTier = SubscriptionTier.PRO;
            if (tier === 'business' || tier === 'enterprise') {
              mappedTier = SubscriptionTier.ENTERPRISE;
            }

            await updateUserSubscription(userId, {
              tier: mappedTier,
              status: subscription.status === 'active' ? 'active' : 'cancelled',
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
              cancelAtPeriodEnd: subscription.cancel_at_period_end,
              stripeCustomerId: subscription.customer as string,
              stripeSubscriptionId: subscription.id,
            });
          }
        }
        break;
      }
      case 'customer.subscription.updated': {
        const updatedSubscription = event.data.object as any;
        console.log('✅ Subscription updated:', updatedSubscription.id);
        
        // Find user by Stripe customer ID
        const supabase = getSupabaseClient();
        if (supabase) {
          const { data } = await supabase
            .from('subscriptions')
            .select('user_id')
            .eq('stripe_subscription_id', updatedSubscription.id)
            .single();

          if (data?.user_id) {
            // Get tier from subscription metadata or price
            let mappedTier = SubscriptionTier.PRO;
            const priceId = updatedSubscription.items?.data[0]?.price?.id;
            // You can check price metadata or subscription metadata for tier
            const tier = updatedSubscription.metadata?.tier || 'pro';
            if (tier === 'business' || tier === 'enterprise') {
              mappedTier = SubscriptionTier.ENTERPRISE;
            }

            await updateUserSubscription(data.user_id, {
              tier: mappedTier,
              status: updatedSubscription.status === 'active' ? 'active' : 'cancelled',
              currentPeriodEnd: new Date(updatedSubscription.current_period_end * 1000),
              cancelAtPeriodEnd: updatedSubscription.cancel_at_period_end,
              stripeCustomerId: updatedSubscription.customer as string,
              stripeSubscriptionId: updatedSubscription.id,
            });
          }
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const deletedSubscription = event.data.object as any;
        console.log('⚠️  Subscription cancelled:', deletedSubscription.id);
        
        // Find user by Stripe subscription ID
        const supabase = getSupabaseClient();
        if (supabase) {
          const { data } = await supabase
            .from('subscriptions')
            .select('user_id')
            .eq('stripe_subscription_id', deletedSubscription.id)
            .single();

          if (data?.user_id) {
            await updateUserSubscription(data.user_id, {
              tier: SubscriptionTier.FREE,
              status: 'cancelled',
              currentPeriodEnd: new Date(deletedSubscription.current_period_end * 1000),
              cancelAtPeriodEnd: false,
              stripeCustomerId: deletedSubscription.customer as string,
              stripeSubscriptionId: null,
            });
          }
        }
        break;
      }
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as any;
        console.log('✅ Payment succeeded:', invoice.id);
        // Subscription is already active, no action needed
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as any;
        console.log('⚠️  Payment failed:', invoice.id);
        
        // Find user and update subscription status
        const supabase = getSupabaseClient();
        if (supabase && invoice.subscription) {
          const { data } = await supabase
            .from('subscriptions')
            .select('user_id')
            .eq('stripe_subscription_id', invoice.subscription)
            .single();

          if (data?.user_id) {
            await updateUserSubscription(data.user_id, {
              tier: SubscriptionTier.PRO, // Keep tier, just update status
              status: 'past_due',
              currentPeriodEnd: new Date(invoice.period_end * 1000),
              cancelAtPeriodEnd: false,
              stripeCustomerId: invoice.customer as string,
              stripeSubscriptionId: invoice.subscription,
            });
          }
        }
        break;
      }
      default:
        console.log(`ℹ️  Unhandled event type: ${event.type}`);
    }
  } catch (error: any) {
    console.error('Error handling webhook event:', error);
    // Don't return error to Stripe, log it instead
  }

  res.json({ received: true });
});

export default router;

