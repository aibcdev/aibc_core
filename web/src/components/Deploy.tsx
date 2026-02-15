import React, { useState } from 'react';
import {
  Check,
  Globe,
  Search,
  Loader2,
  MessageSquare,
  TrendingUp,
  Video,
  Users,
  BarChart3,
  PenTool,
  Target,
  Megaphone,
  Mail,
  Calendar
} from 'lucide-react';

// Agent Capabilities - Practical business functions
const AGENT_CAPABILITIES = [
  {
    id: 'social_media',
    name: 'Social Media Management',
    description: 'Daily posting, engagement, and community management across all platforms.',
    icon: MessageSquare,
  },
  {
    id: 'content_creation',
    name: 'Content Creation',
    description: 'Blog posts, articles, newsletters, and thought leadership content.',
    icon: PenTool,
  },
  {
    id: 'competitor_analysis',
    name: 'Competitor Intelligence',
    description: 'Monitor competitor activity and surface actionable insights.',
    icon: Target,
  },
  {
    id: 'trend_monitoring',
    name: 'Trend & News Monitoring',
    description: 'Track industry trends and current affairs for timely content.',
    icon: TrendingUp,
  },
  {
    id: 'campaign_strategy',
    name: 'Campaign Strategy',
    description: 'Plan and execute marketing campaigns with measurable outcomes.',
    icon: Megaphone,
  },
  {
    id: 'video_production',
    name: 'Video Content',
    description: 'AI-generated video updates and spokesperson content.',
    icon: Video,
  },
  {
    id: 'email_marketing',
    name: 'Email Marketing',
    description: 'Automated email sequences, newsletters, and nurture campaigns.',
    icon: Mail,
  },
  {
    id: 'community_engagement',
    name: 'Community Engagement',
    description: 'Monitor and respond to mentions, comments, and conversations.',
    icon: Users,
  },
  {
    id: 'analytics_reporting',
    name: 'Analytics & Reporting',
    description: 'Weekly performance reports and strategic recommendations.',
    icon: BarChart3,
  },
  {
    id: 'content_calendar',
    name: 'Content Calendar',
    description: 'Automated scheduling and content planning for consistency.',
    icon: Calendar,
  },
];

const Deploy: React.FC = () => {
  const [step, setStep] = useState(1);
  const [url, setUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [selectedCapabilities, setSelectedCapabilities] = useState<string[]>([]);
  const [deploymentProgress, setDeploymentProgress] = useState(0);

  const handleScan = () => {
    if (!url) return;
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setStep(2);
    }, 2000);
  };

  const toggleCapability = (id: string) => {
    if (selectedCapabilities.includes(id)) {
      setSelectedCapabilities(selectedCapabilities.filter(c => c !== id));
    } else {
      setSelectedCapabilities([...selectedCapabilities, id]);
    }
  };

  const handleDeploy = () => {
    if (selectedCapabilities.length === 0) return;
    setStep(3);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 1;
      setDeploymentProgress(progress);
      if (progress >= 100) clearInterval(interval);
    }, 50);
  };

  return (
    <div className="pt-32 pb-24 min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-4 md:px-8 relative z-10">

      {/* Header */}
      <div className="w-full max-w-5xl mb-12 fade-in-up">
        <div className="flex items-center justify-between mb-8">
          <div className="flex flex-col">
            <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-2">
              Step {step} of 3
            </span>
            <h1 className="text-3xl font-instrument-serif text-white">
              {step === 1 && "Analyze Your Brand"}
              {step === 2 && "Configure Your Agent"}
              {step === 3 && "Deploying Your Agent"}
            </h1>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3].map(i => (
              <div key={i} className={`h-1 w-8 rounded-full transition-colors ${step >= i ? 'bg-emerald-500' : 'bg-zinc-800'}`}></div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-5xl bg-zinc-900/30 border border-zinc-800 backdrop-blur-xl rounded-3xl p-8 md:p-12 min-h-[600px] flex flex-col relative overflow-hidden shadow-2xl fade-in-up">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none"></div>

        {/* STEP 1: SCAN */}
        {step === 1 && (
          <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto w-full py-12">
            <div className="mb-12 text-center">
              <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-white/10">
                <Search className="w-8 h-8 text-zinc-400" />
              </div>
              <h2 className="text-2xl text-white font-medium mb-3">Enter Your Website</h2>
              <p className="text-zinc-400 font-light max-w-md mx-auto">
                We'll analyze your brand presence, messaging, and visual identity to configure your AI marketing agent.
              </p>
            </div>

            <div className="w-full space-y-4">
              <div className="flex gap-4 p-2 bg-zinc-900/50 border border-zinc-700 rounded-xl focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500/50 transition-all">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://yourcompany.com"
                  className="flex-1 bg-transparent border-none px-4 py-3 text-white focus:outline-none placeholder:text-zinc-600 text-lg"
                />
                <button
                  onClick={handleScan}
                  disabled={isScanning || !url}
                  className="px-8 py-3 bg-white text-black rounded-lg hover:bg-zinc-200 transition-colors font-medium min-w-[140px] flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isScanning ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Analyze'}
                </button>
              </div>

              <div className="flex justify-center gap-6 text-xs text-zinc-500 font-mono mt-8">
                <span className="flex items-center gap-2"><Globe className="w-3 h-3" /> Website Analysis</span>
                <span className="flex items-center gap-2"><MessageSquare className="w-3 h-3" /> Social Profiles</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: SELECT CAPABILITIES */}
        {step === 2 && (
          <div className="flex flex-col h-full">
            <div className="text-center mb-10">
              <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-3 block">Brand Analyzed ✓</span>
              <h2 className="text-3xl text-white font-instrument-serif mb-4">What do you need your agent to do?</h2>
              <p className="text-zinc-400 font-light max-w-2xl mx-auto">
                Select the marketing functions you want your AI agent to handle. You can always add more later.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto max-h-[400px] pr-2 pb-20">
              {AGENT_CAPABILITIES.map((cap) => {
                const isSelected = selectedCapabilities.includes(cap.id);
                return (
                  <div
                    key={cap.id}
                    onClick={() => toggleCapability(cap.id)}
                    className={`
                      relative p-5 rounded-xl border cursor-pointer transition-all duration-200 group
                      ${isSelected
                        ? 'bg-emerald-900/20 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.1)]'
                        : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'
                      }
                    `}
                  >
                    {isSelected && (
                      <div className="absolute top-3 right-3 text-emerald-500">
                        <Check className="w-4 h-4" />
                      </div>
                    )}

                    <div className={`
                      w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-colors
                      ${isSelected ? 'bg-emerald-500 text-white' : 'bg-zinc-800 text-zinc-400 group-hover:text-zinc-300'}
                    `}>
                      <cap.icon className="w-5 h-5" />
                    </div>

                    <h3 className={`font-medium mb-1 ${isSelected ? 'text-white' : 'text-zinc-300'}`}>{cap.name}</h3>
                    <p className="text-xs text-zinc-500">{cap.description}</p>
                  </div>
                );
              })}
            </div>

            <div className="absolute bottom-8 right-8 z-20">
              <button
                onClick={handleDeploy}
                disabled={selectedCapabilities.length === 0}
                className="flex items-center gap-2 px-8 py-4 bg-white text-black rounded-full font-semibold hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
              >
                Deploy Agent ({selectedCapabilities.length} selected)
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: DEPLOYMENT */}
        {step === 3 && (
          <div className="flex flex-col items-center justify-center h-full w-full py-12">
            {deploymentProgress < 100 ? (
              <div className="text-center">
                <div className="relative w-32 h-32 mx-auto mb-12">
                  <div className="absolute inset-0 border-4 border-zinc-800 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center font-mono text-2xl font-bold text-white">
                    {deploymentProgress}%
                  </div>
                </div>
                <h2 className="text-3xl font-instrument-serif text-white mb-4">Configuring Your Agent...</h2>
                <div className="h-8 overflow-hidden">
                  <div className="animate-[slideUp_2s_infinite]">
                    <p className="text-zinc-500 font-mono text-sm py-1">Learning your brand voice...</p>
                    <p className="text-zinc-500 font-mono text-sm py-1">Connecting to social platforms...</p>
                    <p className="text-zinc-500 font-mono text-sm py-1">Setting up monitoring...</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_60px_rgba(16,185,129,0.6)]">
                  <Check className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-5xl font-instrument-serif text-white mb-6">Your Agent is Live</h2>
                <p className="text-zinc-400 text-lg mb-10 max-w-xl mx-auto">
                  Your AI marketing agent is now active and learning. Access your dashboard to see insights and suggestions.
                </p>
                <a href="#dashboard" className="px-10 py-4 bg-white text-black rounded-full font-bold hover:scale-105 transition-transform shadow-lg inline-block">
                  Open Dashboard
                </a>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default Deploy;
