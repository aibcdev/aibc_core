import React, { useState, useEffect } from 'react';
import { Check, ChevronDown, ArrowLeft, Loader2, Sparkles, FileText, Copy, FolderOpen, Send } from 'lucide-react';
import { ViewState, NavProps } from '../types';
import { getUserSubscription, SubscriptionTier } from '../services/subscriptionService';
import { createCheckoutSession, getPrices } from '../services/stripeService';
import Navigation from './shared/Navigation';
import Footer from './shared/Footer';

const PricingView: React.FC<NavProps> = ({ onNavigate }) => {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [subscription, setSubscription] = useState(getUserSubscription());
  const [stripePrices, setStripePrices] = useState<any[]>([]);
  
  // Dynamic pricing calculator state
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set(['Organic Social']));
  const [teamSize, setTeamSize] = useState(1);

  useEffect(() => {
    getPrices().then(prices => {
      setStripePrices(prices);
    }).catch(err => {
      console.error('Failed to load prices:', err);
    });
  }, []);

  // Pricing calculator data (from Blaze.ai)
  const categoryCosts = {
    'Organic Social': {
      agency: 5000,
      tools: [
        { name: 'Storyteq', price: 2875 },
        { name: 'Hootsuite', price: 149 },
        { name: 'Social Insider', price: 99 }
      ]
    },
    'Short Form Video': {
      agency: 7500,
      tools: [
        { name: 'Capcut', price: 25 },
        { name: 'Veed', price: 24 },
        { name: 'Canva', price: 20 }
      ]
    },
    'Paid Ads': {
      agency: 10000,
      tools: [
        { name: 'Confect', price: 299 },
        { name: 'Motion', price: 250 },
        { name: 'Madgicx', price: 99 }
      ]
    },
    'SEO': {
      agency: 10000,
      tools: [
        { name: 'Semrush', price: 199 },
        { name: 'Jasper', price: 69 },
        { name: 'Writesonic', price: 49 }
      ]
    },
    'Email': {
      agency: 5000,
      tools: [
        { name: 'Hubspot', price: 500 },
        { name: 'Jasper', price: 69 },
        { name: 'ChatGPT', price: 20 }
      ]
    }
  };

  const calculateSavings = () => {
    let totalAgency = 0;
    let totalTools = 0;

    selectedCategories.forEach(category => {
      const costs = categoryCosts[category as keyof typeof categoryCosts];
      if (costs) {
        totalAgency += costs.agency;
        totalTools += costs.tools.reduce((sum, tool) => sum + tool.price, 0);
      }
    });

    const monthlySavings = (totalAgency - totalTools) * teamSize;
    const annualSavings = monthlySavings * 12;

    return { monthlySavings, annualSavings };
  };

  const { monthlySavings, annualSavings } = calculateSavings();

  const plans = [
    {
      name: 'Free',
      price: 0,
      tagline: 'Try the brain before you buy the body.',
      seats: 1,
      credits: 15,
      features: [
        '1 × Digital Footprint Scan (homepage + 1 social profile)',
        'Basic brand persona & tone summary',
        'Access to the AIBC Stream dashboard',
        'Generate a handful of test assets (e.g. ~10 short posts + 1–2 longer pieces)',
        'Core text templates: social post, LinkedIn update, short script',
        'Copy-to-clipboard & download (you post manually)'
      ],
      buttonText: 'Start Free',
      buttonStyle: 'bg-white text-black hover:bg-gray-100',
      current: subscription.tier === SubscriptionTier.FREE,
      popular: false
    },
    {
      name: 'Pro',
      price: 39,
      tagline: 'Weekly content without hiring a content marketer.',
      seats: 1,
      credits: 150,
      features: [
        'Everything in Free, plus:',
        'Full Digital Footprint Scan refreshed monthly',
        '~150 credits / month for:',
        '  60+ short posts,',
        '  8–10 long-form pieces,',
        '  or a mix of both',
        'All text formats: LinkedIn posts, X threads, blogs, newsletters, scripts',
        '2 saved Brand Voices + 2 saved Audiences',
        'Light content insights: topics, tone, "you vs industry" view',
        'Email support'
      ],
      buttonText: 'Get Pro',
      buttonStyle: 'bg-white text-black hover:bg-gray-100',
      current: false,
      popular: false
    },
    {
      name: 'Business',
      price: 149,
      tagline: 'Your AI content department, without the payroll.',
      seats: 3,
      credits: 600,
      features: [
        'Everything in Pro, plus:',
        '600 credits / month for a full slate of content, e.g.:',
        '  150–200 short posts',
        '  20+ long-form articles / newsletters',
        '  8–10 podcast/audio scripts',
        '  10–15 short video packages or 5–7 long video packages',
        'Multi-format outputs: text, audio scripts, video packages (script + visual prompts)',
        'Competitor Content Radar for up to 5 brands (topics, angles, gaps)',
        'Content Slate Builder: monthly content plan auto-built from your footprint',
        'Multi-brand workspaces (run multiple brands/clients from one login)',
        'Up to 5 Brand Voices & unlimited Audiences',
        'Priority email support'
      ],
      buttonText: 'Upgrade to Business',
      buttonStyle: 'bg-orange-500 text-white hover:bg-orange-600',
      current: subscription.tier === SubscriptionTier.ENTERPRISE,
      popular: true,
      tier: SubscriptionTier.ENTERPRISE
    },
    {
      name: 'Lifetime Deal',
      subtitle: 'Founders Year',
      price: 149,
      priceType: 'one-time',
      tagline: '12 months of Business-level firepower for less than one month of an intern.',
      seats: 10,
      credits: 'Fair-use unlimited for 12 months',
      features: [
        'All Business features for 12 months',
        'No visible credit meter – fair-use unlimited generation for a year',
        '(Soft rate-limits behind the scenes to prevent abuse)',
        '10 seats – invite your whole team or multiple clients',
        'Perfect for early adopters, agencies, and power users',
        'Priority onboarding session with AIBC team',
        'Lifetime Deal badge – price and access locked for the entire year'
      ],
      buttonText: 'Claim Lifetime Deal',
      buttonStyle: 'bg-orange-500 text-white hover:bg-orange-600',
      current: false,
      popular: false,
      limitedOffer: true
    },
    {
      name: 'Enterprise',
      price: 'Custom pricing',
      tagline: 'Plug AIBC into your stack and scale content like software.',
      seats: 'From 10+',
      credits: 'High-volume / SLA-based unlimited',
      features: [
        'Everything in Business, plus:',
        'API access to generate content directly from your CRM, CMS, or internal tools',
        'SSO, role-based access, and approval workflows',
        'Custom credit packages or unlimited usage with SLAs',
        'Custom training on your internal docs, transcripts & knowledge base',
        'Dedicated account manager & shared Slack/Teams channel',
        'Security review, DPA, and enterprise onboarding'
      ],
      buttonText: 'Talk to Sales',
      buttonStyle: 'border border-white/20 bg-transparent text-white hover:bg-white/5',
      current: false,
      popular: false
    }
  ];

  const allPlansInclude = [
    { icon: Sparkles, text: 'Brand Scan Engine – we read your site & socials to learn your voice' },
    { icon: FileText, text: 'Persona-aware prompts – content tuned to your target audience' },
    { icon: Copy, text: 'Brand-tuned copy – not generic AI fluff' },
    { icon: FolderOpen, text: 'Organised content slates – campaigns grouped by theme & outcome' },
    { icon: Send, text: 'Copy-and-go exports – grab text, scripts, prompts and paste into any platform' }
  ];

  const faqs = [
    {
      question: 'What happens on the Free plan?',
      answer: 'Free lets you run your first digital footprint scan, see your brand analysis, and generate a small batch of content. It\'s there so you can see how close AIBC gets to your voice before you pay.'
    },
    {
      question: 'What\'s the real difference between Pro and Business?',
      answer: 'Pro is for solo operators who mainly need text. Business is for brands and teams who want a full content slate — text, audio scripts, and video packages — plus competitor insights and multi-brand workspaces.'
    },
    {
      question: 'What does "fair-use unlimited" mean on the Lifetime Deal?',
      answer: 'You won\'t see a credit meter and you won\'t hit normal monthly caps. We simply prevent abuse (e.g. bots hammering the API) behind the scenes. If you\'re using AIBC like a real team, you\'re safe.'
    },
    {
      question: 'Do you post content for me?',
      answer: 'No. AIBC is content creation, not a social scheduler. We generate brand-tuned content and you copy/paste into LinkedIn, X, YouTube, email platforms, etc. That keeps things simple, secure, and platform-agnostic.'
    },
    {
      question: 'Can I change or cancel my plan?',
      answer: 'Yes. You can upgrade or downgrade at any time. If you cancel, you keep access until the end of your billing period. Lifetime Deal is a one-time charge and runs for 12 months from activation.'
    },
    {
      question: 'Do you support agencies and multi-brand setups?',
      answer: 'Yes. Business supports multi-brand workspaces; Lifetime gives you 10 seats; Enterprise adds API access and higher-volume content for agencies who want to build AIBC into their client services.'
    }
  ];

  const toggleCategory = (category: string) => {
    const newSet = new Set(selectedCategories);
    if (newSet.has(category)) {
      newSet.delete(category);
    } else {
      newSet.add(category);
    }
    setSelectedCategories(newSet);
  };

  return (
    <div id="pricing-view" className="min-h-screen bg-[#050505] text-white">
      <Navigation onNavigate={onNavigate} />
      <main className="pt-16 px-4 sm:px-6 lg:px-8 pb-20">
        {/* Hero Section */}
        <div className="max-w-6xl mx-auto mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6 leading-tight">
                Choose a plan. Feed us your links. We handle the content thinking.
          </h1>
              <p className="text-lg text-white/70 mb-6 leading-relaxed">
                AIBC scans your digital footprint — site, socials, interviews, decks — and turns it into on-brand text, audio, and video you can copy–paste straight into your channels. No posting integrations. No content marketer hire.
              </p>
              <p className="text-sm text-white/50 mb-8">
                Start free in under 2 minutes. No credit card required.
              </p>
              <div className="flex items-center gap-4">
          <button
                  onClick={() => {
                    const authToken = localStorage.getItem('authToken');
                    if (authToken) {
                      onNavigate(ViewState.DASHBOARD);
                    } else {
                      onNavigate(ViewState.LOGIN);
                    }
                  }}
                  className="px-6 py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Start Free
          </button>
            <button
                  onClick={() => onNavigate(ViewState.LANDING)}
                  className="px-6 py-3 border border-white/20 rounded-lg font-semibold hover:bg-white/5 transition-colors"
                >
                  Talk to Sales
            </button>
              </div>
            </div>
            <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-8">
              {/* Dashboard mockup placeholder */}
              <div className="aspect-video bg-orange-500/20 rounded-lg flex items-center justify-center">
                <span className="text-white/40 text-sm">Dashboard Preview</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Title */}
        <div className="max-w-4xl mx-auto text-center mb-12">
          <div className="text-sm text-white/40 uppercase tracking-wider mb-2">Pricing</div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Plans that scale with your content, not your headcount.
          </h2>
          <p className="text-base text-white/60 leading-relaxed">
            Every plan uses a simple credit system. Text costs the least, audio costs more, and video costs the most — so you only pay more when you ask AIBC to do more work.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="max-w-7xl mx-auto mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {plans.slice(0, 4).map((plan) => (
            <div
              key={plan.name}
                className={`relative bg-[#0A0A0A] border rounded-2xl p-6 flex flex-col ${
                plan.popular
                    ? 'border-orange-500/50 shadow-[0_0_30px_rgba(249,115,22,0.2)]'
                    : plan.limitedOffer
                    ? 'border-orange-500/50 shadow-[0_0_30px_rgba(249,115,22,0.2)]'
                  : 'border-white/10 hover:border-white/20'
              } transition-all`}
            >
              {plan.popular && (
                  <div className="absolute -top-3 left-6 bg-orange-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Most Popular
                  </div>
                )}
                {plan.limitedOffer && (
                  <div className="absolute -top-3 left-6 bg-orange-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Limited 30-Day Offer
                </div>
              )}

              <div className="mb-6">
                  <h3 className="text-2xl font-bold text-white mb-1">{plan.name}</h3>
                  {plan.subtitle && (
                    <div className="text-sm text-white/60 mb-2">{plan.subtitle}</div>
                  )}
                  <div className="flex items-baseline gap-2 mb-2">
                    {typeof plan.price === 'number' ? (
                      <>
                        <span className="text-4xl font-bold text-white">
                          ${plan.priceType === 'one-time' ? plan.price : plan.price}
                        </span>
                        {plan.priceType === 'one-time' ? (
                          <span className="text-sm text-white/40"> one-time</span>
                        ) : (
                    <span className="text-sm text-white/40">/mo</span>
                  )}
                      </>
                    ) : (
                      <span className="text-2xl font-bold text-white">{plan.price}</span>
                    )}
                  </div>
                  <p className="text-sm text-white/60 mb-3">{plan.tagline}</p>
                  <div className="text-xs text-white/40 space-y-1">
                    <div>{plan.seats} {typeof plan.seats === 'number' ? 'seat' + (plan.seats > 1 ? 's' : '') : plan.seats}</div>
                    <div>{plan.credits} {typeof plan.credits === 'number' ? 'credits / month' : 'credits'}</div>
                  </div>
              </div>

                <ul className="flex-1 space-y-3 mb-6 text-sm text-white/80">
                {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={async () => {
                    if (plan.name === 'Free' || plan.current) return;
                    if (plan.name === 'Enterprise' || plan.name === 'Lifetime Deal') {
                      // Handle custom pricing or lifetime deal
                      return;
                    }
                    
                  const authToken = localStorage.getItem('authToken');
                  if (!authToken) {
                    onNavigate(ViewState.LOGIN);
                    return;
                  }

                  setLoading(plan.name);
                    try {
                      // Handle different plan types
                      if (plan.name === 'Lifetime Deal') {
                        // Lifetime Deal: one-time payment
                        const session = await createCheckoutSession(
                          'lifetime_deal', // Special identifier
                          'lifetime' as any
                        );
                        window.location.href = session.url;
                      } else if (plan.name === 'Enterprise') {
                        // Enterprise: contact sales
                        alert('Please contact sales for Enterprise pricing.');
                        setLoading(null);
                      } else if (plan.name === 'Free') {
                        // Free plan: just navigate to dashboard
                        onNavigate(ViewState.DASHBOARD);
                        setLoading(null);
                      } else {
                        // Pro or Business: find Stripe price
                        const tierMap: Record<string, string> = {
                          'Pro': 'standard',
                          'Business': 'business',
                        };
                        const tierKey = tierMap[plan.name] || plan.name.toLowerCase();
                        
                    const price = stripePrices.find(p => 
                          (p.tier === tierKey || p.tier === (plan.tier || plan.name.toLowerCase())) && 
                          p.interval === 'month'
                    );

                    if (!price) {
                          // Fallback: create price on the fly if not found
                          console.warn('Price not found in Stripe, using fallback');
                          // For now, show error - in production, create price via API
                      alert('Pricing not available. Please contact support.');
                      setLoading(null);
                      return;
                    }

                    const session = await createCheckoutSession(
                      price.id,
                          (plan.tier || SubscriptionTier.PRO) as SubscriptionTier
                    );

                    window.location.href = session.url;
                      }
                  } catch (error: any) {
                    console.error('Checkout error:', error);
                    alert(error.message || 'Failed to start checkout. Please try again.');
                    setLoading(null);
                  }
                }}
                className={`w-full py-3 rounded-lg font-semibold text-sm transition-all ${plan.buttonStyle} ${
                    plan.current && plan.name !== 'Free' ? 'cursor-default opacity-50' : 'hover:scale-105'
                }`}
                disabled={(plan.current && plan.name !== 'Free') || loading === plan.name}
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

          {/* Enterprise Card - Full Width */}
          <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">{plans[4].name}</h3>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-2xl font-bold text-white">{plans[4].price}</span>
                  </div>
                  <p className="text-sm text-white/60 mb-3">{plans[4].tagline}</p>
                  <div className="text-xs text-white/40 space-y-1">
                    <div>{plans[4].seats} seats</div>
                    <div>{plans[4].credits}</div>
                  </div>
                </div>
                <button
                  onClick={() => onNavigate(ViewState.LANDING)}
                  className="px-6 py-3 border border-white/20 rounded-lg font-semibold hover:bg-white/5 transition-colors"
                >
                  {plans[4].buttonText}
                </button>
              </div>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-white/80">
                {plans[4].features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {plans[3].limitedOffer && (
            <p className="text-xs text-white/40 text-center mt-4">
              This Founders offer is available for 30 days only. After that, unlimited plans move to higher pricing.
            </p>
          )}
        </div>

        {/* All Plans Include */}
        <div className="max-w-6xl mx-auto mb-16">
          <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-8">
            <h3 className="text-lg font-bold text-white mb-6">All plans include:</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {allPlansInclude.map((item, i) => (
                <div key={i} className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
                    <item.icon className="w-6 h-6 text-white/60" />
                  </div>
                  <p className="text-xs text-white/70 leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Credits Explainer */}
        <div className="max-w-6xl mx-auto mb-16">
          <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-8">
            <h3 className="text-xl font-bold text-white mb-4">How credits work</h3>
            <p className="text-sm text-white/60 mb-6">
              AIBC uses credits so you only pay more when the work is heavier. Video is premium content that uses more credits:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">1-3 credits</div>
                <div className="text-xs text-white/60">→ Images & graphics (social posts, carousels)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">3-5 credits</div>
                <div className="text-xs text-white/60">→ Long-form content (blogs, newsletters, articles)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">5-12 credits</div>
                <div className="text-xs text-white/60">→ Audio content (podcasts, voice-overs)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">25 credits</div>
                <div className="text-xs text-white/60">→ Short video (10–30s reels, shorts)</div>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">50 credits</div>
                <div className="text-xs text-white/60">→ Mid-length video (30–90s)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">100 credits</div>
                <div className="text-xs text-white/60">→ Long video package (90s+)</div>
              </div>
            </div>
            <p className="text-xs text-white/40 mt-4 text-center">
              Pro tip: Pro plan (150 credits) = ~6 short videos or 150+ posts per month
            </p>
            <p className="text-sm text-white/60 mt-6 text-center">
              You generate content inside AIBC, then copy/paste it into your channels. No social logins, no posting automations.
            </p>
            </div>
          </div>

        {/* Dynamic Pricing Calculator */}
        <div className="max-w-6xl mx-auto mb-16">
          <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-2">
              Agency-level strategy, content, and insights for 1% of the price.
            </h3>
            <p className="text-sm text-white/60 mb-6">
              See how much you save with everything under one roof.
            </p>
            
            <div className="flex flex-wrap gap-3 mb-8">
              {Object.keys(categoryCosts).map((category) => (
                <button
                  key={category}
                  onClick={() => toggleCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategories.has(category)
                      ? 'bg-white text-black'
                      : 'bg-white/5 text-white/60 hover:bg-white/10'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
              {Object.entries(categoryCosts).map(([category, costs]) => (
                <div key={category} className={`${selectedCategories.has(category) ? '' : 'opacity-30'}`}>
                  <div className="text-xs font-bold text-white/40 uppercase mb-2">{category}</div>
                  <div className="space-y-2">
                    <div className="text-sm text-white/60">Agency: ${costs.agency.toLocaleString()}/mo</div>
                    {costs.tools.map((tool) => (
                      <div key={tool.name} className="text-xs text-white/40">
                        {tool.name}: ${tool.price}/mo
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-white/10">
              <div className="flex items-center gap-4">
                <label className="text-sm text-white/60">Team Size:</label>
                <input
                  type="number"
                  min="1"
                  value={teamSize}
                  onChange={(e) => setTeamSize(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                />
              </div>
              <div className="text-right">
                <div className="text-sm text-white/60 mb-1">Monthly Savings</div>
                <div className="text-4xl font-bold text-white">${monthlySavings.toLocaleString()}</div>
                <div className="text-sm text-white/60 mt-2">Annual Savings</div>
                <div className="text-3xl font-bold text-white">${annualSavings.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-6xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">Frequently asked questions</h2>
          <p className="text-sm text-white/60 mb-8">
            If you're still thinking it through, these might help. If not, hit Talk to Sales and we'll walk you through it.
          </p>
          
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
                  <span className="text-lg font-medium text-white pr-4">{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-white/40 transition-transform flex-shrink-0 ${
                      openFAQ === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFAQ === index && (
                  <div className="px-6 pb-6 text-white/70 leading-relaxed text-sm">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA Banner */}
        <div className="max-w-6xl mx-auto">
          <div className="bg-orange-500/10 border border-white/10 rounded-2xl p-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to stop staring at a blank content calendar?
            </h2>
            <p className="text-base text-white/70 mb-8 leading-relaxed">
              Let AIBC turn your existing digital footprint into the next year of content ideas, scripts, posts, and video concepts — so your team can focus on the work that actually moves the business.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => {
                  const authToken = localStorage.getItem('authToken');
                  if (authToken) {
                    onNavigate(ViewState.DASHBOARD);
                  } else {
                    onNavigate(ViewState.LOGIN);
                  }
                }}
                className="px-8 py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Start Free
              </button>
              <p className="text-sm text-white/50">
                No credit card needed · Upgrade only if you love the output.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer onNavigate={onNavigate} />
    </div>
  );
};

export default PricingView;
