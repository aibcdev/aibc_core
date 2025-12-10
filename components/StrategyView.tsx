import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, AlertCircle, TrendingUp, Target, MessageSquare, Loader2 } from 'lucide-react';
import { getLatestScanResults } from '../services/apiClient';

interface StrategyMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface StrategyPlan {
  id: string;
  type: 'competitor_focus' | 'content_shift' | 'brand_building' | 'custom';
  title: string;
  description: string;
  implemented: boolean;
  createdAt: Date;
}

interface StrategicInsight {
  id: string;
  type: 'signal' | 'market_shift' | 'sentiment' | 'opportunity' | 'threat';
  title: string;
  description: string;
  timestamp: Date;
  priority: 'high' | 'medium' | 'low';
  tag: string;
  tagColor: 'red' | 'green' | 'amber' | 'blue';
}

const StrategyView: React.FC = () => {
  const [messages, setMessages] = useState<StrategyMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [strategyPlans, setStrategyPlans] = useState<StrategyPlan[]>([]);
  const [strategicInsights, setStrategicInsights] = useState<StrategicInsight[]>([]);
  const [brandDNA, setBrandDNA] = useState<any>(null);
  const [competitorIntelligence, setCompetitorIntelligence] = useState<any[]>([]);
  const [scanUsername, setScanUsername] = useState<string | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadScanData();
    loadStrategyData();
    
    // Listen for new scan started - clear all state
    const handleNewScanStarted = (event: CustomEvent) => {
      console.log('🧹 Strategy: New scan started, clearing all state');
      const { username } = event.detail;
      
      // Clear all strategy state
      setStrategicInsights([]);
      setBrandDNA(null);
      setCompetitorIntelligence([]);
      setScanUsername(null);
      setMessages([]);
      setStrategyPlans([]);
      
      // Clear localStorage cache
      localStorage.removeItem('lastScanResults');
      localStorage.removeItem('activeContentStrategy');
      localStorage.removeItem('strategyPlans');
      
      // Reload data for new scan
      setTimeout(() => {
        loadScanData();
        loadStrategyData();
      }, 500);
    };
    
    // Listen for scan completion events
    const handleScanComplete = () => {
      console.log('📥 Scan completed - reloading strategy data...');
      loadScanData();
    };
    
    // Listen for username changes
    const handleUsernameChange = () => {
      const newUsername = localStorage.getItem('lastScannedUsername');
      if (newUsername && newUsername !== scanUsername) {
        console.log('📥 Username changed - reloading strategy data...');
        setStrategicInsights([]);
        setBrandDNA(null);
        setCompetitorIntelligence([]);
        loadScanData();
      }
    };
    
    window.addEventListener('newScanStarted', handleNewScanStarted as EventListener);
    window.addEventListener('scanComplete', handleScanComplete);
    
    // Poll for username changes
    const usernameCheckInterval = setInterval(() => {
      const newUsername = localStorage.getItem('lastScannedUsername');
      if (newUsername && newUsername !== scanUsername) {
        handleUsernameChange();
      }
    }, 2000);
    
    return () => {
      window.removeEventListener('newScanStarted', handleNewScanStarted as EventListener);
      window.removeEventListener('scanComplete', handleScanComplete);
      clearInterval(usernameCheckInterval);
    };
  }, [scanUsername]);

  useEffect(() => {
    if (brandDNA || competitorIntelligence.length > 0) {
      generateStrategicInsights();
      generateInitialAIMessage();
    }
  }, [brandDNA, competitorIntelligence]);

  const loadScanData = async () => {
    setIsLoadingData(true);
    try {
      // Try localStorage first
      const cachedResults = localStorage.getItem('lastScanResults');
      const currentUsername = localStorage.getItem('lastScannedUsername');
      
      if (cachedResults && currentUsername) {
        try {
          const cached = JSON.parse(cachedResults);
          const cachedUsername = cached.scanUsername || cached.username;
          
          // Only use cache if username matches
          if (cachedUsername && cachedUsername.toLowerCase() === currentUsername.toLowerCase()) {
            setBrandDNA(cached.brandDNA || null);
            setCompetitorIntelligence(Array.isArray(cached.competitorIntelligence) ? cached.competitorIntelligence : []);
            setScanUsername(currentUsername);
            
            // Generate insights from cached data
            if (cached.strategicInsights && Array.isArray(cached.strategicInsights)) {
              generateInsightsFromData(cached.strategicInsights, cached.brandDNA, cached.competitorIntelligence);
            }
          }
        } catch (e) {
          console.error('Error parsing cached results:', e);
        }
      }
      
      // Also try API
      if (currentUsername) {
        try {
          const scanResults = await getLatestScanResults(currentUsername);
          if (scanResults.success && scanResults.data) {
            setBrandDNA(scanResults.data.brandDNA || null);
            setCompetitorIntelligence(Array.isArray(scanResults.data.competitorIntelligence) ? scanResults.data.competitorIntelligence : []);
            setScanUsername(currentUsername);
            
            if (scanResults.data.strategicInsights && Array.isArray(scanResults.data.strategicInsights)) {
              generateInsightsFromData(scanResults.data.strategicInsights, scanResults.data.brandDNA, scanResults.data.competitorIntelligence);
            }
          }
        } catch (e) {
          console.error('Error fetching scan results:', e);
        }
      }
    } finally {
      setIsLoadingData(false);
    }
  };

  const generateInsightsFromData = (insights: any[], dna: any, competitors: any[]) => {
    const generated: StrategicInsight[] = [];
    
    // Generate insights from strategic insights data
    if (insights && insights.length > 0) {
      insights.slice(0, 3).forEach((insight, index) => {
        const insightType = insight.type || insight.category || 'opportunity';
        const priority = insight.priority || insight.impact || 'medium';
        
        let type: StrategicInsight['type'] = 'opportunity';
        let tag = 'OPPORTUNITY';
        let tagColor: StrategicInsight['tagColor'] = 'green';
        
        if (insightType.toLowerCase().includes('threat') || priority === 'high') {
          type = 'threat';
          tag = 'HIGH THREAT';
          tagColor = 'red';
        } else if (insightType.toLowerCase().includes('market') || insightType.toLowerCase().includes('trend')) {
          type = 'market_shift';
          tag = 'OPPORTUNITY';
          tagColor = 'green';
        } else if (insightType.toLowerCase().includes('sentiment')) {
          type = 'sentiment';
          tag = 'ALERT';
          tagColor = 'amber';
        }
        
        generated.push({
          id: `insight-${index}`,
          type,
          title: insight.title || insight.recommendation || 'Strategic Insight',
          description: insight.description || insight.summary || insight.recommendation || '',
          timestamp: new Date(Date.now() - (index * 15 * 60 * 1000)), // Stagger timestamps
          priority: priority === 'high' ? 'high' : priority === 'low' ? 'low' : 'medium',
          tag,
          tagColor
        });
      });
    }
    
    // Generate competitor-based insights
    if (competitors && competitors.length > 0 && generated.length < 3) {
      const topCompetitor = competitors[0];
      if (topCompetitor.name) {
        generated.push({
          id: 'competitor-signal',
          type: 'signal',
          title: `Competitor Activity: ${topCompetitor.name}`,
          description: topCompetitor.advantage 
            ? `${topCompetitor.name} has a strong focus on ${topCompetitor.advantage}.`
            : `Recent activity detected from competitor ${topCompetitor.name}.`,
          timestamp: new Date(Date.now() - (2 * 60 * 1000)), // 2 minutes ago
          priority: topCompetitor.threatLevel === 'HIGH' ? 'high' : 'medium',
          tag: topCompetitor.threatLevel === 'HIGH' ? 'HIGH THREAT' : 'SIGNAL',
          tagColor: topCompetitor.threatLevel === 'HIGH' ? 'red' : 'blue'
        });
      }
    }
    
    // Generate market share insights if available
    if (dna && dna.industry && generated.length < 3) {
      generated.push({
        id: 'market-shift',
        type: 'market_shift',
        title: `Market Activity in ${dna.industry}`,
        description: `Increased activity detected in the ${dna.industry} sector. Monitor trends closely.`,
        timestamp: new Date(Date.now() - (15 * 60 * 1000)), // 15 minutes ago
        priority: 'medium',
        tag: 'OPPORTUNITY',
        tagColor: 'green'
      });
    }
    
    setStrategicInsights(generated.slice(0, 3)); // Max 3 insights
  };

  const generateStrategicInsights = () => {
    // This will be called after data loads
    const insights: StrategicInsight[] = [];
    
    // Generate from competitor intelligence
    if (competitorIntelligence.length > 0) {
      const topCompetitor = competitorIntelligence[0];
      insights.push({
        id: 'competitor-1',
        type: 'signal',
        title: `Competitor Activity: ${topCompetitor.name || 'Key Competitor'}`,
        description: topCompetitor.advantage 
          ? `${topCompetitor.name} has a strong focus on ${topCompetitor.advantage}.`
          : `Recent activity detected from ${topCompetitor.name || 'a key competitor'}.`,
        timestamp: new Date(Date.now() - (2 * 60 * 1000)),
        priority: topCompetitor.threatLevel === 'HIGH' ? 'high' : 'medium',
        tag: topCompetitor.threatLevel === 'HIGH' ? 'HIGH THREAT' : 'SIGNAL',
        tagColor: topCompetitor.threatLevel === 'HIGH' ? 'red' : 'blue'
      });
    }
    
    // Generate from brand DNA
    if (brandDNA && brandDNA.industry) {
      insights.push({
        id: 'market-1',
        type: 'market_shift',
        title: `Market Activity in ${brandDNA.industry}`,
        description: `Trending topics detected in the ${brandDNA.industry} sector.`,
        timestamp: new Date(Date.now() - (15 * 60 * 1000)),
        priority: 'medium',
        tag: 'OPPORTUNITY',
        tagColor: 'green'
      });
    }
    
    if (insights.length > 0) {
      setStrategicInsights(insights);
    }
  };

  const generateInitialAIMessage = () => {
    const competitorCount = competitorIntelligence.length;
    const brandName = scanUsername || brandDNA?.name || 'your brand';
    const industry = brandDNA?.industry || 'your sector';
    
    let message = `I've analyzed the digital footprint scan for ${brandName}. `;
    
    if (competitorCount > 0) {
      message += `I've identified ${competitorCount} key competitor${competitorCount > 1 ? 's' : ''} in ${industry}. `;
      const topCompetitor = competitorIntelligence[0];
      if (topCompetitor.name) {
        message += `${topCompetitor.name} appears to be your primary competitor. `;
      }
    }
    
    if (brandDNA) {
      const themes = brandDNA.themes || brandDNA.corePillars || [];
      if (themes.length > 0) {
        message += `Your brand focuses on ${themes.slice(0, 2).join(' and ')}. `;
      }
    }
    
    message += `How can I assist with your content strategy today?`;
    
    setMessages([{
      id: '1',
      role: 'assistant',
      content: message,
      timestamp: new Date()
    }]);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadStrategyData = () => {
    try {
      const stored = localStorage.getItem('strategyPlans');
      if (stored) {
        const parsed = JSON.parse(stored);
        setStrategyPlans(parsed.map((p: any) => ({
          ...p,
          createdAt: new Date(p.createdAt)
        })));
      }
    } catch (e) {
      console.error('Error loading strategy data:', e);
    }
  };

  const saveStrategyPlan = (plan: StrategyPlan) => {
    const updated = [...strategyPlans, plan];
    setStrategyPlans(updated);
    localStorage.setItem('strategyPlans', JSON.stringify(updated));
    
    // Update scan results to reflect strategy changes
    const lastScanResults = localStorage.getItem('lastScanResults');
    if (lastScanResults) {
      try {
        const parsed = JSON.parse(lastScanResults);
        if (!parsed.strategy) {
          parsed.strategy = [];
        }
        parsed.strategy.push({
          ...plan,
          appliedAt: new Date().toISOString()
        });
        localStorage.setItem('lastScanResults', JSON.stringify(parsed));
      } catch (e) {
        console.error('Error updating scan results:', e);
      }
    }
    
    // Save active strategy for content generation
    localStorage.setItem('activeContentStrategy', JSON.stringify({
      ...plan,
      appliedAt: new Date().toISOString(),
      affectsContentGeneration: true
    }));
    
    // Dispatch event to notify content generation components
    window.dispatchEvent(new CustomEvent('strategyUpdated', {
      detail: { strategy: plan }
    }));
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: StrategyMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response and strategy implementation
    setTimeout(() => {
      const aiResponse = generateAIResponse(input);
      const assistantMessage: StrategyMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse.content,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // If AI created a strategy plan, save it
      if (aiResponse.plan) {
        saveStrategyPlan(aiResponse.plan);
      }

      setIsLoading(false);
    }, 1500);
  };

  const getTimeAgo = (timestamp: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const generateAIResponse = (userInput: string): { content: string; plan?: StrategyPlan } => {
    const lowerInput = userInput.toLowerCase();
    const brandName = scanUsername || brandDNA?.name || 'your brand';
    const topCompetitor = competitorIntelligence.length > 0 ? competitorIntelligence[0] : null;
    
    // Detect strategy type
    if (lowerInput.includes('competitor') || lowerInput.includes('focus on')) {
      const competitorMatch = userInput.match(/focus on competitors? like (.+?)(?: and|$)/i);
      let competitorName = competitorMatch ? competitorMatch[1].trim() : (topCompetitor?.name || 'key competitors');
      
      // Check if mentioned competitor exists in our data
      if (competitorIntelligence.length > 0) {
        const foundCompetitor = competitorIntelligence.find(c => 
          c.name?.toLowerCase().includes(competitorName.toLowerCase()) ||
          competitorName.toLowerCase().includes(c.name?.toLowerCase() || '')
        );
        if (foundCompetitor) {
          competitorName = foundCompetitor.name;
        }
      }
      
      const plan: StrategyPlan = {
        id: Date.now().toString(),
        type: 'competitor_focus',
        title: `Focus on ${competitorName}`,
        description: `Content strategy will prioritize matching and analyzing ${competitorName}'s content approach`,
        implemented: true,
        createdAt: new Date()
      };

      return {
        content: `Got it! I've updated ${brandName}'s content strategy to focus on ${competitorName}. Your future content suggestions will prioritize matching their content style, posting frequency, and engagement tactics. This will be reflected in your next content generation cycle.`,
        plan
      };
    }

    if (lowerInput.includes('brand') || lowerInput.includes('building') || lowerInput.includes('sales')) {
      const themes = brandDNA?.themes || brandDNA?.corePillars || [];
      const themeFocus = themes.length > 0 ? themes[0] : 'brand values';
      
      const plan: StrategyPlan = {
        id: Date.now().toString(),
        type: 'brand_building',
        title: 'Brand Building Focus',
        description: `Content strategy shifted to brand building with focus on ${themeFocus}`,
        implemented: true,
        createdAt: new Date()
      };

      return {
        content: `Perfect! I've adjusted ${brandName}'s content plan to prioritize brand building over sales content. Your content suggestions will focus on ${themeFocus} and ${themes.length > 1 ? themes[1] : 'thought leadership'}, aligning with your brand DNA.`,
        plan
      };
    }

    if (lowerInput.includes('competitor') && topCompetitor) {
      return {
        content: `Based on the scan, ${topCompetitor.name} is your primary competitor. They focus on ${topCompetitor.advantage || 'their core strengths'}. Would you like me to create a strategy to differentiate ${brandName} from ${topCompetitor.name}?`
      };
    }

    if (lowerInput.includes('content') || lowerInput.includes('plan') || lowerInput.includes('strategy')) {
      const industry = brandDNA?.industry || 'your industry';
      const competitorCount = competitorIntelligence.length;
      
      return {
        content: `I understand. Based on the scan, ${brandName} operates in ${industry} with ${competitorCount} identified competitor${competitorCount !== 1 ? 's' : ''}. I'll analyze your current content performance and competitor landscape to suggest strategic adjustments. What specific aspect would you like to focus on?`
      };
    }

    // Generic response with brand context
    const industry = brandDNA?.industry ? ` in ${brandDNA.industry}` : '';
    return {
      content: `I've noted your request and will incorporate it into ${brandName}'s content strategy${industry}. Your next content generation will reflect these changes. Is there anything specific you'd like me to prioritize?`
    };
  };

  return (
    <div className="max-w-[1600px] mx-auto p-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black uppercase tracking-tighter text-white mb-2">Strategy</h1>
        <p className="text-white/40 text-sm">Talk to AI to create and implement strategic content plans</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Strategic Insights/Alerts */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-sm font-bold text-white mb-4">Strategic Insights</h2>
          
          {isLoadingData ? (
            <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-4 flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-white/40 animate-spin" />
              <span className="text-sm text-white/40 ml-2">Loading insights...</span>
            </div>
          ) : strategicInsights.length === 0 ? (
            <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-4">
              <p className="text-sm text-white/40 text-center">
                {scanUsername 
                  ? `No strategic insights available yet for ${scanUsername}. Run a digital footprint scan to generate insights.`
                  : 'No scan data available. Run a digital footprint scan to see strategic insights.'}
              </p>
            </div>
          ) : (
            strategicInsights.map((insight) => {
              const typeLabels: Record<StrategicInsight['type'], string> = {
                signal: 'SIGNAL DETECTED',
                market_shift: 'MARKET SHIFT',
                sentiment: 'SENTIMENT',
                opportunity: 'OPPORTUNITY',
                threat: 'THREAT'
              };
              
              const timeAgo = getTimeAgo(insight.timestamp);
              const tagColors = {
                red: 'bg-red-500/20 text-red-400',
                green: 'bg-green-500/20 text-green-400',
                amber: 'bg-amber-500/20 text-amber-400',
                blue: 'bg-blue-500/20 text-blue-400'
              };
              
              return (
                <div key={insight.id} className="bg-[#0A0A0A] border border-white/10 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white/40 uppercase">{typeLabels[insight.type]}</span>
                    <span className="text-xs text-white/30">{timeAgo}</span>
                  </div>
                  <p className="text-sm text-white/70 mb-3">
                    {insight.description}
                  </p>
                  <span className={`inline-block px-2 py-1 ${tagColors[insight.tagColor]} text-[10px] font-bold rounded`}>
                    {insight.tag}
                  </span>
                </div>
              );
            })
          )}

          {/* Active Strategy Plans */}
          {strategyPlans.length > 0 && (
            <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-4 mt-6">
              <h3 className="text-xs font-bold text-white/40 uppercase mb-3">Active Plans</h3>
              <div className="space-y-2">
                {strategyPlans.filter(p => p.implemented).map(plan => (
                  <div key={plan.id} className="p-2 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="w-3 h-3 text-green-400" />
                      <span className="text-xs font-bold text-white">{plan.title}</span>
                    </div>
                    <p className="text-[10px] text-white/40">{plan.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: AI Chat */}
        <div className="lg:col-span-2 bg-[#0A0A0A] border border-white/10 rounded-xl flex flex-col h-[600px]">
          {/* Chat Header */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">AI Strategy Assistant</h3>
                <p className="text-xs text-white/40">Analyzing competitor trends and market data</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-xl p-4 ${
                    message.role === 'user'
                      ? 'bg-white/10 text-white'
                      : 'bg-white/5 text-white/70'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                </div>
                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <Loader2 className="w-4 h-4 text-white/40 animate-spin" />
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder="Ask for strategy based on competitor trends..."
                className="flex-1 bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/30"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="p-3 bg-green-500 hover:bg-green-400 disabled:bg-white/10 disabled:text-white/30 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StrategyView;

