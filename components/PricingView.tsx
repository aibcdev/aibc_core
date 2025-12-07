import React, { useState, useEffect } from 'react';
import { Check, ChevronDown, ArrowLeft, Loader2 } from 'lucide-react';
import { ViewState, NavProps } from '../types';
import { getUserSubscription, SubscriptionTier } from '../services/subscriptionService';
import { createCheckoutSession, getPrices } from '../services/stripeService';

const PricingView: React.FC<NavProps> = ({ onNavigate }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [subscription, setSubscription] = useState(getUserSubscription());
  const [stripePrices, setStripePrices] = useState<any[]>([]);

  useEffect(() => {
    // Load Stripe prices
    getPrices().then(prices => {
      setStripePrices(prices);
    }).catch(err => {
      console.error('Failed to load prices:', err);
    });
  }, []);

  const plans = [
    {
      name: 'Free',
      price: 0,
      description: 'Testing AI content',
      features: [
        '5 Credits / Month',
        'Text Posts (up to 5)',
        'Articles (1/mo)',
        'Digital Footprint Scan (1/mo)'
      ],
      buttonText: 'Current Plan',
      buttonStyle: 'border border-white/20 bg-transparent text-white',
      current: true
    },
    {
      name: 'Pro',
      price: 29,
      description: 'Small teams',
      features: [
        '20 Credits / Month',
        'Text Posts (up to 20)',
        'Articles (4/mo)',
        'Podcasts (2/mo)',
        'Digital Footprint Scan (5/mo)'
      ],
      buttonText: 'Start Trial',
      buttonStyle: 'bg-white text-black hover:bg-gray-100',
      popular: false
    },
    {
      name: 'Enterprise',
      price: 149,
      description: 'Agencies & enterprises',
      features: [
        'Unlimited Credits',
        'Unlimited Scans',
        'All Features',
        'Priority Support',
        'Custom Integrations',
        'Dedicated Account Manager'
      ],
      buttonText: subscription.tier === SubscriptionTier.ENTERPRISE ? 'Current Plan' : 'Contact Sales',
      buttonStyle: subscription.tier === SubscriptionTier.ENTERPRISE
        ? 'border border-white/20 bg-transparent text-white'
        : 'border border-white/20 bg-transparent text-white hover:bg-white/5',
      current: subscription.tier === SubscriptionTier.ENTERPRISE,
      popular: false,
      tier: SubscriptionTier.ENTERPRISE
    }
  ];

  const features = [
    { name: 'AI Content Generator', free: true, pro: true, business: true, premium: true },
    { name: 'Brand Voice Tuning', free: false, pro: true, business: true, premium: true },
    { name: 'Social Media Scheduling', free: false, pro: true, business: true, premium: true },
    { name: 'Analytics Depth', free: 'None', pro: 'Basic', business: 'Advanced', premium: 'Advanced' },
    { name: 'Team Collaboration', free: false, pro: false, business: true, premium: true }
  ];

  const faqs = [
    {
      question: 'What are credits?',
      answer: 'Credits are the currency for generating content. 1 Credit = 1 short text post; 5 Credits = 1 article; 8 Credits = 1 podcast episode script; 10 Credits = 1 short video; 15 Credits = 1 long-form video. Prepaid credits give you maximum flexibility – allocate them as you see fit instead of being locked into rigid quotas.'
    },
    {
      question: 'Can I buy more credits?',
      answer: 'Yes, you can purchase additional credits at any time. Additional credits are available in packs and can be added to your monthly subscription or purchased as one-time add-ons.'
    },
    {
      question: 'Do unused credits roll over?',
      answer: 'Unused credits from your monthly allocation do not roll over to the next month. However, any additional credits you purchase separately will remain in your account until used.'
    },
    {
      question: "What's the difference between monthly and annual billing?",
      answer: 'Annual billing saves you 15% compared to monthly billing. You pay for 12 months upfront and get the same features at a discounted rate. Annual plans also include priority support and early access to new features.'
    }
  ];

  const annualPrice = (monthlyPrice: number) => Math.round(monthlyPrice * 12 * 0.85);

  return (
    <div id="pricing-view" className="min-h-screen bg-[#050505] text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate(ViewState.LANDING)}>
            <div className="h-8 w-8 flex items-center justify-center text-white">
              <svg viewBox="0 0 100 100" className="w-full h-full text-white" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="48" stroke="currentColor" strokeWidth="4" />
                <circle cx="50" cy="50" r="34" stroke="currentColor" strokeWidth="4" />
                <circle cx="50" cy="50" r="20" stroke="currentColor" strokeWidth="4" />
                <circle cx="50" cy="50" r="6" fill="currentColor" />
              </svg>
            </div>
            <span className="text-2xl font-black tracking-tighter text-white">AIBC</span>
          </div>
          <button 
            onClick={() => onNavigate(ViewState.LANDING)}
            className="flex items-center gap-2 text-xs font-medium text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </div>
      </nav>

      <main className="pt-24 px-4 sm:px-6 lg:px-8 pb-20">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-sans font-medium tracking-tight text-white mb-6">
            Forget hiring a full-time content marketer.
          </h1>
          <p className="text-lg text-white/70 max-w-3xl mx-auto leading-relaxed">
            AIBroadcasting's AI powers your marketing 24/7. Create social posts, articles, podcast scripts, and videos with a single click every day. In fact, <em className="text-white/90">McKinsey reports that marketing campaigns once requiring months of work can now be rolled out in days with generative AI</em>, so you'll be executing daily content strategies at lightning speed.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`text-sm font-medium transition-colors ${
              billingCycle === 'monthly' ? 'text-white' : 'text-white/40'
            }`}
          >
            Monthly
          </button>
          <div className="relative">
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                billingCycle === 'annual' ? 'bg-orange-500' : 'bg-white/20'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                  billingCycle === 'annual' ? 'translate-x-7' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
          <button
            onClick={() => setBillingCycle('annual')}
            className={`text-sm font-medium transition-colors ${
              billingCycle === 'annual' ? 'text-green-400' : 'text-white/40'
            }`}
          >
            Annual <span className="text-green-400">(Save 15%)</span>
          </button>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mb-20">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={`relative bg-[#0A0A0A] border rounded-2xl p-8 flex flex-col ${
                plan.popular
                  ? 'border-purple-500/50 shadow-[0_0_30px_rgba(168,85,247,0.2)] scale-105'
                  : 'border-white/10 hover:border-white/20'
              } transition-all`}
            >
              {plan.popular && (
                <div className="absolute -top-3 right-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl font-bold text-white">
                    ${billingCycle === 'annual' ? annualPrice(plan.price) : plan.price}
                  </span>
                  {billingCycle === 'annual' && plan.price > 0 && (
                    <span className="text-sm text-white/40">/year</span>
                  )}
                  {billingCycle === 'monthly' && plan.price > 0 && (
                    <span className="text-sm text-white/40">/mo</span>
                  )}
                </div>
                <p className="text-sm text-white/60">{plan.description}</p>
              </div>

              <ul className="flex-1 space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-white/80">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={async () => {
                  if (plan.name === 'Free') return;
                  
                  // Check if user is logged in
                  const authToken = localStorage.getItem('authToken');
                  if (!authToken) {
                    onNavigate(ViewState.LOGIN);
                    return;
                  }

                  setLoading(plan.name);
                  
                  try {
                    // Find matching Stripe price
                    const price = stripePrices.find(p => 
                      p.tier === (plan.tier || plan.name.toLowerCase()) && 
                      p.interval === (billingCycle === 'monthly' ? 'month' : 'year')
                    );

                    if (!price) {
                      alert('Pricing not available. Please contact support.');
                      setLoading(null);
                      return;
                    }

                    // Create checkout session
                    const session = await createCheckoutSession(
                      price.id,
                      plan.name.toLowerCase() === 'pro' ? SubscriptionTier.PRO : SubscriptionTier.ENTERPRISE
                    );

                    // Redirect to Stripe checkout
                    window.location.href = session.url;
                  } catch (error: any) {
                    console.error('Checkout error:', error);
                    alert(error.message || 'Failed to start checkout. Please try again.');
                    setLoading(null);
                  }
                }}
                className={`w-full py-3 rounded-lg font-semibold text-sm transition-all ${plan.buttonStyle} ${
                  plan.current ? 'cursor-default' : 'hover:scale-105'
                }`}
                disabled={plan.current || loading === plan.name}
              >
                {loading === plan.name ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading...
                  </span>
                ) : (
                  plan.buttonText
                )}
              </button>
            </div>
          ))}
        </div>

        {/* How Credits Work */}
        <div className="max-w-4xl mx-auto text-center mb-20">
          <h2 className="text-3xl font-medium tracking-tight text-white mb-6">How Credits Work</h2>
          <p className="text-base text-white/70 leading-relaxed max-w-3xl mx-auto">
            1 Credit = 1 short text post; 5 = an article; 8 = a podcast episode script; 10 = short video; 15 = long-form video. Prepaid credits give you maximum flexibility – allocate them as you see fit instead of being locked into rigid quotas. And because you prepay each month, your content budget is predictable with no surprise overages.
          </p>
        </div>

        {/* Feature Comparison */}
        <div className="max-w-6xl mx-auto mb-20">
          <h2 className="text-3xl font-medium tracking-tight text-white mb-8">Feature Comparison</h2>
          
          <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 text-sm font-bold text-white uppercase tracking-wider">Feature</th>
                    <th className="text-center p-4 text-sm font-bold text-white uppercase tracking-wider">Free</th>
                    <th className="text-center p-4 text-sm font-bold text-white uppercase tracking-wider">Pro</th>
                    <th className="text-center p-4 text-sm font-bold text-blue-400 uppercase tracking-wider">Business</th>
                    <th className="text-center p-4 text-sm font-bold text-white uppercase tracking-wider">Premium</th>
                  </tr>
                </thead>
                <tbody>
                  {features.map((feature, index) => (
                    <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-4 text-sm text-white font-medium">{feature.name}</td>
                      <td className="p-4 text-center">
                        {feature.free === true ? (
                          <Check className="w-5 h-5 text-green-500 mx-auto" />
                        ) : feature.free === false ? (
                          <span className="text-white/20">—</span>
                        ) : (
                          <span className="text-white/60 text-sm">{feature.free}</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {feature.pro === true ? (
                          <Check className="w-5 h-5 text-green-500 mx-auto" />
                        ) : feature.pro === false ? (
                          <span className="text-white/20">—</span>
                        ) : (
                          <span className="text-white/60 text-sm">{feature.pro}</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {feature.business === true ? (
                          <Check className="w-5 h-5 text-green-500 mx-auto" />
                        ) : feature.business === false ? (
                          <span className="text-white/20">—</span>
                        ) : (
                          <span className="text-white/60 text-sm">{feature.business}</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {feature.premium === true ? (
                          <Check className="w-5 h-5 text-green-500 mx-auto" />
                        ) : feature.premium === false ? (
                          <span className="text-white/20">—</span>
                        ) : (
                          <span className="text-white/60 text-sm">{feature.premium}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p className="mt-6 text-sm text-white/60 leading-relaxed max-w-4xl">
            All plans include the full AI content engine and templates to turn your credits into ready-to-publish assets. <strong className="text-white/90">McKinsey finds generative AI can boost marketing productivity by 5-15%</strong>, underscoring how each AI-generated article or video drives more value. Upgrading to Pro and above unlocks time-saving features like one-click scheduling and analytics so you can "set it and forget it" while AIBroadcasting fuels your growth.
          </p>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-medium tracking-tight text-white mb-8">Frequently Asked Questions</h2>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-[#0A0A0A] border border-white/10 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                  className="w-full p-6 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                >
                  <span className="text-lg font-medium text-white">{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-white/40 transition-transform ${
                      openFAQ === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFAQ === index && (
                  <div className="px-6 pb-6 text-white/70 leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PricingView;

