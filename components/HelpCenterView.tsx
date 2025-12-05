import React from 'react';
import { ArrowLeft, CheckCircle, ArrowRight, BookOpen, Video, FileText, Settings, Sparkles, BarChart3, Lock } from 'lucide-react';
import { ViewState, NavProps } from '../types';

const HelpCenterView: React.FC<NavProps> = ({ onNavigate }) => {
  const steps = [
    {
      number: 1,
      title: 'Create Your Account',
      description: 'Sign up with your email or Google account to get started.',
      icon: <Settings className="w-5 h-5" />,
      details: [
        'Click "Get Started" on the landing page',
        'Enter your email and create a password, or sign in with Google',
        'Verify your email address (if required)',
        'You\'ll start with 100 free credits to explore the platform'
      ]
    },
    {
      number: 2,
      title: 'Scan Your Digital Footprint',
      description: 'Let AI analyze your existing content to understand your brand voice.',
      icon: <Sparkles className="w-5 h-5" />,
      details: [
        'Navigate to the "Scan" or "Digital Footprint" section',
        'Enter your X (Twitter) username or website URL',
        'Select the platforms you want to scan (X, LinkedIn, Instagram, YouTube)',
        'Wait 5-7 minutes while our AI analyzes your content',
        'Review your Brand DNA extraction results'
      ]
    },
    {
      number: 3,
      title: 'Review Your Brand DNA',
      description: 'Understand how AI has captured your unique voice, tone, and style.',
      icon: <FileText className="w-5 h-5" />,
      details: [
        'View your extracted brand voice characteristics',
        'Review identified content themes and pillars',
        'Check competitor analysis and market positioning',
        'Verify the accuracy of your brand profile'
      ]
    },
    {
      number: 4,
      title: 'Generate Your First Content',
      description: 'Create content that matches your brand voice automatically.',
      icon: <Video className="w-5 h-5" />,
      details: [
        'Go to the "Production Room" or "Content Hub"',
        'Select the type of content you want to create (text post, thread, image)',
        'Enter your topic or idea',
        'AI will generate content matching your brand voice',
        'Review, edit, and approve your content',
        'Schedule or publish directly to your platforms'
      ]
    },
    {
      number: 5,
      title: 'Set Up Integrations',
      description: 'Connect your social media accounts for seamless publishing.',
      icon: <Settings className="w-5 h-5" />,
      details: [
        'Navigate to "Integrations" in the dashboard',
        'Connect your X (Twitter), LinkedIn, Instagram accounts',
        'Verify each connection',
        'Set up auto-publishing preferences (optional)',
        'Configure posting schedules'
      ]
    },
    {
      number: 6,
      title: 'Monitor & Optimize',
      description: 'Track performance and let AI optimize your content strategy.',
      icon: <BarChart3 className="w-5 h-5" />,
      details: [
        'View analytics in the Dashboard',
        'Track engagement metrics and performance',
        'Review competitor insights',
        'Use AI recommendations to improve content',
        'Adjust your brand voice based on results'
      ]
    }
  ];

  const faqs = [
    {
      question: 'How long does the initial scan take?',
      answer: 'The digital footprint scan typically takes 5-7 minutes. This includes analyzing your content across all selected platforms, extracting your brand DNA, and generating competitor insights.'
    },
    {
      question: 'What if I don\'t have much existing content?',
      answer: 'No problem! You can still use AIBC. Provide a few examples of your preferred writing style, or let our AI learn from your website and any available social media posts. The more content you have, the more accurate the brand voice extraction will be.'
    },
    {
      question: 'Can I edit the generated content?',
      answer: 'Absolutely! All AI-generated content is fully editable. You can modify the text, adjust the tone, add your own insights, or regenerate if needed. The content is yours to customize.'
    },
    {
      question: 'How do credits work?',
      answer: 'Credits are used for premium features. Text posts cost 1 credit, threads cost 3, images cost 5, and video/audio requests cost more. Free tier users get 100 credits to start. Credits refill monthly based on your tier.'
    },
    {
      question: 'What platforms can I publish to?',
      answer: 'Currently, you can publish to X (Twitter), LinkedIn, and Instagram. More platforms are coming soon. You can also export content for manual posting on other platforms.'
    },
    {
      question: 'Is my data secure?',
      answer: 'Yes, we take data security seriously. Your content, brand DNA, and account information are encrypted and stored securely. We never share your data with third parties.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => onNavigate(ViewState.LANDING)}
            className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 flex items-center justify-center text-white">
              <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="48" stroke="currentColor" strokeWidth="4" />
                <circle cx="50" cy="50" r="34" stroke="currentColor" strokeWidth="4" />
                <circle cx="50" cy="50" r="20" stroke="currentColor" strokeWidth="4" />
                <circle cx="50" cy="50" r="6" fill="currentColor" />
              </svg>
            </div>
            <span className="text-lg font-bold tracking-tight text-white">AIBC</span>
          </div>
        </div>
      </div>

      <main className="pt-24 pb-16" itemScope itemType="https://schema.org/FAQPage">
        <div className="mx-auto max-w-4xl px-6">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm mb-6">
              <BookOpen className="w-3 h-3 mr-2" />
              Help Center
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
              Getting Started with AIBC
            </h1>
            <p className="text-lg text-white/60 max-w-2xl mx-auto">
              Follow this step-by-step guide to set up your AIBC account and start creating content that matches your brand voice.
            </p>
          </div>

          {/* Setup Steps */}
          <div className="space-y-8 mb-16">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className="relative bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 md:p-8 hover:border-white/20 transition-all"
              >
                <div className="flex items-start gap-6">
                  {/* Step Number */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-500/20 flex items-center justify-center text-orange-400 font-bold text-lg">
                      {step.number}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="text-orange-400">{step.icon}</div>
                      <h2 className="text-xl font-bold text-white">{step.title}</h2>
                    </div>
                    <p className="text-white/60 mb-4">{step.description}</p>
                    
                    <ul className="space-y-2">
                      {step.details.map((detail, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                          <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="absolute left-[35px] top-full w-[2px] h-8 bg-gradient-to-b from-orange-500/30 to-transparent"></div>
                )}
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20 rounded-2xl p-8 mb-16">
            <h2 className="text-2xl font-bold text-white mb-4">Ready to Get Started?</h2>
            <p className="text-white/60 mb-6">
              Follow the steps above, or jump right in and start scanning your digital footprint.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => onNavigate(ViewState.LOGIN)}
                className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                Create Account
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onNavigate(ViewState.INGESTION)}
                className="flex items-center gap-2 border border-white/20 bg-white/5 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
              >
                Start Scanning
                <Sparkles className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* FAQs */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-white mb-8">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all"
                  itemScope
                  itemType="https://schema.org/Question"
                >
                  <h3 className="text-lg font-semibold text-white mb-2" itemProp="name">{faq.question}</h3>
                  <div itemScope itemType="https://schema.org/Answer">
                    <p className="text-white/60 leading-relaxed" itemProp="text">{faq.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* FAQ Structured Data */}
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": faqs.map(faq => ({
                "@type": "Question",
                "name": faq.question,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": faq.answer
                }
              }))
            })}
          </script>

          {/* Support */}
          <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Still Need Help?</h2>
            <p className="text-white/60 mb-6">
              Our support team is here to help you get the most out of AIBC.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="mailto:support@aibcmedia.com"
                className="flex items-center gap-2 border border-white/20 bg-white/5 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
              >
                Contact Support
              </a>
              <a
                href="https://docs.aibcmedia.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 border border-white/20 bg-white/5 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
              >
                View API Docs
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HelpCenterView;

