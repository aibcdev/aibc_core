import React, { useState, useEffect } from 'react';
import { Clock, ArrowUp, Target, Video, Megaphone, Compass, ArrowLeft, ArrowRight, X, FileText, RefreshCw, BarChart2, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { ViewState, NavProps } from '../types';
import Navigation from './shared/Navigation';
import Footer from './shared/Footer';
import { getUserSubscription, SubscriptionTier } from '../services/subscriptionService';

interface OnboardingOption {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

const OnboardingView: React.FC<NavProps> = ({ onNavigate }) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [onboardingStep, setOnboardingStep] = useState<'how-it-works' | 'select-goal'>('how-it-works');

  const options: OnboardingOption[] = [
    {
      id: 'no-time',
      icon: <Clock className="w-6 h-6" />,
      title: "We don't have time to create content",
      description: "Turn your existing site, decks, and socials into ready-to-post content in minutes."
    },
    {
      id: 'inconsistent',
      icon: <ArrowUp className="w-6 h-6" />,
      title: "Our content isn't consistent or on-brand",
      description: "Use AIBC to standardize tone, talking points, and messaging across the whole team."
    },
    {
      id: 'more-leads',
      icon: <Target className="w-6 h-6" />,
      title: "We need more leads from content",
      description: "Generate content slates designed to educate, nurture, and convert your ideal customers."
    },
    {
      id: 'video',
      icon: <Video className="w-6 h-6" />,
      title: "We want to launch shows or video",
      description: "Turn your digital footprint into scripts, episode outlines, and video ideas automatically."
    },
    {
      id: 'competitors',
      icon: <Megaphone className="w-6 h-6" />,
      title: "We're not sure what to say vs competitors",
      description: "See how your space talks today and get angles that stand out from the noise."
    },
    {
      id: 'exploring',
      icon: <Compass className="w-6 h-6" />,
      title: "I'm just exploring AIBC",
      description: "Let me click around first — then we'll decide what to automate together."
    }
  ];

  const handleOptionClick = (optionId: string) => {
    setSelectedOptions(prev => {
      if (prev.includes(optionId)) {
        // Deselect if already selected
        return prev.filter(id => id !== optionId);
      } else {
        // Add to selection
        return [...prev, optionId];
      }
    });
  };

  const handleContinue = () => {
    // Get user data
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const email = user?.email || localStorage.getItem('userEmail') || '';
    
    const subscription = getUserSubscription();
    const packageTier = subscription.tier || SubscriptionTier.FREE;
    
    const companyCreatorName = localStorage.getItem('lastScannedUsername') || '';
    
    // Store onboarding data
    const onboardingData = {
      selectedOptions,
      email,
      package: packageTier,
      companyCreatorName,
      timestamp: new Date().toISOString()
    };
    
    // Store in localStorage
    localStorage.setItem('onboardingSelection', JSON.stringify(selectedOptions));
    localStorage.setItem('onboardingData', JSON.stringify(onboardingData));
    
    // Store in a list for admin viewing
    const allOnboardingData = JSON.parse(localStorage.getItem('allOnboardingData') || '[]');
    allOnboardingData.push(onboardingData);
    localStorage.setItem('allOnboardingData', JSON.stringify(allOnboardingData));
    
    // Navigate to dashboard
    onNavigate(ViewState.DASHBOARD);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Navigation onNavigate={onNavigate} />

      {/* Step 1: How AIBC Works Modal */}
      {onboardingStep === 'how-it-works' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-6 overflow-y-auto">
          <div className="relative w-full max-w-[84rem] bg-[#09090b] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-300">
            
            {/* Close Button */}
            <button 
              onClick={() => onNavigate(ViewState.DASHBOARD)}
              className="absolute top-6 right-6 z-50 p-2 text-zinc-500 hover:text-white bg-zinc-900/50 hover:bg-zinc-800 rounded-full transition-colors border border-transparent hover:border-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Content */}
            <div className="overflow-y-auto max-h-[90vh] p-8 md:p-12">
              
              {/* Background Ambient Glows */}
              <div className="absolute -top-40 -left-20 w-96 h-96 bg-fuchsia-600/10 rounded-full blur-[128px] pointer-events-none"></div>
              <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[128px] pointer-events-none"></div>

              {/* Header */}
              <div className="relative z-10 mb-12 text-center">
                <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-white mb-4">
                  How AIBC works
                </h2>
                <p className="text-lg text-zinc-400 max-w-xl mx-auto font-light leading-relaxed">
                  Automate your workflow with intelligent generation, seamless adjustments, and data-driven learning.
                </p>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">

                {/* Card 1: Content Generation */}
                <div className="group relative flex flex-col bg-zinc-900/40 border border-white/5 rounded-2xl overflow-hidden hover:border-white/20 hover:bg-zinc-900/60 transition-all duration-500">
                  <div className="p-6 pb-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mb-5 shadow-lg shadow-emerald-900/20">
                      <span className="text-sm font-bold text-white">1</span>
                    </div>
                    <h3 className="text-xl font-semibold tracking-tight mb-2">Content Generation</h3>
                    <p className="text-sm text-zinc-400 mb-6 leading-relaxed">Automatically creates tailored posts based on your brand voice.</p>
                  </div>

                  {/* Mockup Area */}
                  <div className="flex-1 bg-gradient-to-b from-zinc-800/20 to-zinc-900/50 border-t border-white/5 p-5 relative overflow-hidden min-h-[240px]">
                    {/* Calendar Header */}
                    <div className="flex items-center justify-between mb-4 text-zinc-400 scale-90 origin-left">
                      <span className="font-medium text-sm">Sep 2026</span>
                      <div className="flex gap-1">
                        <div className="p-1 bg-white/5 rounded"><ChevronLeft className="w-3 h-3" /></div>
                        <div className="p-1 bg-white/5 rounded"><ChevronRight className="w-3 h-3" /></div>
                      </div>
                    </div>

                    {/* Columns */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-2">
                        <div className="text-center mb-0.5">
                          <span className="bg-blue-600/90 text-white text-[10px] px-2 py-0.5 rounded-full font-medium">May 5</span>
                        </div>
                        <div className="bg-black border border-white/10 rounded-lg p-2 shadow-xl">
                          <div className="flex items-center gap-1.5 mb-2 text-zinc-400">
                            <FileText className="w-2.5 h-2.5 text-blue-400" />
                            <div className="h-1 w-8 bg-zinc-800 rounded-full"></div>
                          </div>
                          <div className="h-12 w-full bg-zinc-800/50 rounded mb-2 overflow-hidden relative">
                            <div className="w-full h-full bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center">
                              <Video className="w-4 h-4 text-zinc-500" />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="h-1.5 w-3/4 bg-zinc-800 rounded-full"></div>
                            <div className="h-1.5 w-1/2 bg-zinc-800 rounded-full"></div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 opacity-30">
                        <div className="text-center mb-0.5 text-zinc-500 text-[10px]">May 6</div>
                        <div className="bg-black border border-white/10 rounded-lg h-full p-2">
                          <div className="h-20 w-full bg-zinc-800 rounded relative overflow-hidden"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 2: Smart Editor */}
                <div className="group relative flex flex-col bg-zinc-900/40 border border-white/5 rounded-2xl overflow-hidden hover:border-white/20 hover:bg-zinc-900/60 transition-all duration-500">
                  <div className="p-6 pb-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-600 flex items-center justify-center mb-5 shadow-lg shadow-orange-900/20">
                      <span className="text-sm font-bold text-white">2</span>
                    </div>
                    <h3 className="text-xl font-semibold tracking-tight mb-2">Smart Editor</h3>
                    <p className="text-sm text-zinc-400 mb-6 leading-relaxed">Powerful tools to refine copy, swap images, and perfect your message.</p>
                  </div>

                  {/* Mockup Area */}
                  <div className="flex-1 bg-zinc-950 relative overflow-hidden min-h-[240px]">
                    <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/50 to-zinc-900 opacity-60"></div>
                    
                    {/* Floating UI: Replace Image */}
                    <div className="absolute top-4 left-4 bg-zinc-900/90 backdrop-blur-md border border-white/10 rounded-md py-1.5 px-2.5 flex items-center gap-1.5 shadow-xl transform transition-transform group-hover:-translate-y-1">
                      <RefreshCw className="w-2.5 h-2.5 text-white" />
                      <span className="text-xs font-medium text-white">Replace</span>
                    </div>

                    {/* Floating UI: Text Block */}
                    <div className="absolute top-1/2 left-4 -translate-y-1/2 max-w-[140px]">
                      <h4 className="text-lg font-serif text-white mb-1 leading-tight">Coaching</h4>
                      <div className="h-1 w-full bg-zinc-700 rounded-full mb-1"></div>
                      <div className="h-1 w-2/3 bg-zinc-700 rounded-full"></div>
                    </div>

                    {/* Floating UI: Color Picker */}
                    <div className="absolute bottom-4 right-4 bg-white rounded-lg p-1.5 shadow-xl w-24 transform transition-transform group-hover:scale-105">
                      <div className="w-full h-16 rounded bg-gradient-to-br from-cyan-400 to-slate-800 mb-1.5 relative"></div>
                      <div className="flex items-center gap-1 bg-zinc-100 rounded px-1.5 py-0.5">
                        <span className="text-[10px] font-mono text-zinc-600">#6147DC</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 3: Adaptive Learning */}
                <div className="group relative flex flex-col bg-zinc-900/40 border border-white/5 rounded-2xl overflow-hidden hover:border-white/20 hover:bg-zinc-900/60 transition-all duration-500">
                  <div className="p-6 pb-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center mb-5 shadow-lg shadow-purple-900/20">
                      <span className="text-sm font-bold text-white">3</span>
                    </div>
                    <h3 className="text-xl font-semibold tracking-tight mb-2">Adaptive Learning</h3>
                    <p className="text-sm text-zinc-400 mb-6 leading-relaxed">Continuous analysis optimizes future content for maximum engagement.</p>
                  </div>

                  {/* Mockup Area */}
                  <div className="flex-1 bg-gradient-to-b from-zinc-800/20 to-zinc-950 border-t border-white/5 p-5 relative flex flex-col justify-between min-h-[240px]">
                    
                    {/* Stats List */}
                    <div className="space-y-4 relative z-10">
                      {/* Stat 1 */}
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-zinc-800/50 rounded border border-white/5">
                          <BarChart2 className="w-3.5 h-3.5 text-zinc-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-white">Reach</span>
                            <span className="text-[10px] font-medium text-emerald-400 bg-emerald-400/10 px-1 py-0.5 rounded">+24%</span>
                          </div>
                          <div className="w-full bg-zinc-800 h-1 mt-1.5 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 w-3/4 h-full rounded-full"></div>
                          </div>
                        </div>
                      </div>

                      {/* Stat 2 */}
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-zinc-800/50 rounded border border-white/5">
                          <Heart className="w-3.5 h-3.5 text-zinc-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-white">Likes</span>
                            <span className="text-[10px] font-medium text-emerald-400 bg-emerald-400/10 px-1 py-0.5 rounded">+12%</span>
                          </div>
                          <div className="w-full bg-zinc-800 h-1 mt-1.5 rounded-full overflow-hidden">
                            <div className="bg-purple-500 w-1/2 h-full rounded-full"></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Chart Background */}
                    <div className="absolute bottom-0 left-0 right-0 h-32 w-full opacity-80">
                      <svg viewBox="0 0 400 200" className="w-full h-full">
                        <defs>
                          <linearGradient id="gradientChart" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.2"></stop>
                            <stop offset="100%" stopColor="#a855f7" stopOpacity="0"></stop>
                          </linearGradient>
                        </defs>
                        <path d="M0,150 C50,150 50,100 100,100 C150,100 150,130 200,120 C250,110 250,50 300,60 C350,70 350,20 400,20 V200 H0 Z" fill="url(#gradientChart)"></path>
                        <path d="M0,150 C50,150 50,100 100,100 C150,100 150,130 200,120 C250,110 250,50 300,60 C350,70 350,20 400,20" fill="none" stroke="#a855f7" strokeWidth="2"></path>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer / CTA */}
              <div className="mt-12 flex justify-end gap-3 border-t border-white/5 pt-6">
                <button 
                  onClick={() => onNavigate(ViewState.DASHBOARD)}
                  className="px-5 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => setOnboardingStep('select-goal')}
                  className="px-5 py-2 text-sm font-medium bg-white text-black rounded-lg hover:bg-zinc-200 transition-colors shadow-lg shadow-white/5"
                >
                  Get Started
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Select Goal */}
      {onboardingStep === 'select-goal' && (
        <main className="pt-16 min-h-screen flex flex-col">
          <div className="flex-1 flex items-center justify-center px-6 py-12">
            <div className="max-w-4xl w-full">
              {/* Header */}
              <div className="text-center mb-12">
                <h1 className="text-4xl sm:text-5xl font-medium text-white mb-4">
                  What's the first thing you want AIBC to help with?
                </h1>
                <p className="text-lg text-white/60">
                  Pick the option that feels closest. You'll be able to explore everything inside AIBC later.
                </p>
              </div>

              {/* Options Grid */}
              <div className="grid md:grid-cols-2 gap-4 mb-12">
                {options.map((option) => {
                  const isSelected = selectedOptions.includes(option.id);
                  return (
                    <button
                      key={option.id}
                      onClick={() => handleOptionClick(option.id)}
                      className={`p-6 rounded-xl border transition-all text-left group ${
                        isSelected
                          ? 'bg-[#0A0A0A] border-white/30 shadow-lg'
                          : 'bg-[#0A0A0A] border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-white/10 text-white'
                            : 'bg-white/5 text-white/60 group-hover:text-white'
                        }`}>
                          {option.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className={`text-lg font-bold mb-2 transition-colors ${
                            isSelected ? 'text-white' : 'text-white/90'
                          }`}>
                            {option.title}
                          </h3>
                          <p className="text-sm text-white/60">
                            {option.description}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center flex-shrink-0">
                            <div className="w-2 h-2 rounded-full bg-white"></div>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setOnboardingStep('how-it-works')}
                  className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  onClick={handleContinue}
                  disabled={selectedOptions.length === 0}
                  className={`px-8 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
                    selectedOptions.length > 0
                      ? 'bg-white text-black hover:bg-gray-100'
                      : 'bg-white/10 text-white/40 cursor-not-allowed'
                  }`}
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <Footer onNavigate={onNavigate} />
        </main>
      )}
    </div>
  );
};

export default OnboardingView;

