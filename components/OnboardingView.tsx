import React, { useState } from 'react';
import { Clock, Sparkles, Target, Video, Megaphone, Compass, ArrowLeft, ArrowRight } from 'lucide-react';
import { ViewState, NavProps } from '../types';
import Navigation from './shared/Navigation';
import Footer from './shared/Footer';

interface OnboardingOption {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

const OnboardingView: React.FC<NavProps> = ({ onNavigate }) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const options: OnboardingOption[] = [
    {
      id: 'no-time',
      icon: <Clock className="w-6 h-6" />,
      title: "We don't have time to create content",
      description: "Turn your existing site, decks, and socials into ready-to-post content in minutes."
    },
    {
      id: 'inconsistent',
      icon: <Sparkles className="w-6 h-6" />,
      title: "Our content isn't consistent or on-brand",
      description: "Use Feed to standardize tone, talking points, and messaging across the whole team."
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
      title: "I'm just exploring Feed",
      description: "Let me click around first — then we'll decide what to automate together."
    }
  ];

  const handleContinue = () => {
    // Store the selected option
    if (selectedOption) {
      localStorage.setItem('onboardingSelection', selectedOption);
    }
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
                What's the first thing you want Feed to help with?
              </h1>
              <p className="text-lg text-white/60">
                Pick the option that feels closest. You'll be able to explore everything inside Feed later.
              </p>
            </div>

            {/* Options Grid */}
            <div className="grid md:grid-cols-2 gap-4 mb-12">
              {options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setSelectedOption(option.id)}
                  className={`p-6 rounded-xl border transition-all text-left group ${
                    selectedOption === option.id
                      ? 'bg-[#0A0A0A] border-white/30 shadow-lg'
                      : 'bg-[#0A0A0A] border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                      selectedOption === option.id
                        ? 'bg-white/10 text-white'
                        : 'bg-white/5 text-white/60 group-hover:text-white'
                    }`}>
                      {option.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-lg font-bold mb-2 transition-colors ${
                        selectedOption === option.id ? 'text-white' : 'text-white/90'
                      }`}>
                        {option.title}
                      </h3>
                      <p className="text-sm text-white/60">
                        {option.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
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
                disabled={!selectedOption}
                className={`px-8 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  selectedOption
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

