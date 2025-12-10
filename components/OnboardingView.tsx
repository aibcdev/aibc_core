import React, { useState, useEffect } from 'react';
import { Clock, ArrowUp, Target, Video, Megaphone, Compass, ArrowLeft, ArrowRight } from 'lucide-react';
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
                onClick={() => onNavigate(ViewState.AUDIT)}
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

        <Footer />
      </main>
    </div>
  );
};

export default OnboardingView;

