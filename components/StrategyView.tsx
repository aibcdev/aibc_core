import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, AlertCircle, TrendingUp, Target, MessageSquare, Loader2 } from 'lucide-react';

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

const StrategyView: React.FC = () => {
  const [messages, setMessages] = useState<StrategyMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [strategyPlans, setStrategyPlans] = useState<StrategyPlan[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadStrategyData();
    // Initial AI message
    setMessages([{
      id: '1',
      role: 'assistant',
      content: "I've analyzed the data from your Memory Bank. Competitor activity is high in your sector. How can I assist with your strategy today?",
      timestamp: new Date()
    }]);
  }, []);

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

  const generateAIResponse = (userInput: string): { content: string; plan?: StrategyPlan } => {
    const lowerInput = userInput.toLowerCase();
    
    // Detect strategy type
    if (lowerInput.includes('competitor') || lowerInput.includes('focus on')) {
      const competitorMatch = userInput.match(/focus on competitors? like (.+?)(?: and|$)/i);
      const competitorName = competitorMatch ? competitorMatch[1].trim() : 'key competitors';
      
      const plan: StrategyPlan = {
        id: Date.now().toString(),
        type: 'competitor_focus',
        title: `Focus on ${competitorName}`,
        description: `Content strategy will prioritize matching and analyzing ${competitorName}'s content approach`,
        implemented: true,
        createdAt: new Date()
      };

      return {
        content: `Got it! I've updated your content strategy to focus on ${competitorName}. Your future content suggestions will prioritize matching their content style, posting frequency, and engagement tactics. This will be reflected in your next content generation cycle.`,
        plan
      };
    }

    if (lowerInput.includes('brand') || lowerInput.includes('building') || lowerInput.includes('sales')) {
      const plan: StrategyPlan = {
        id: Date.now().toString(),
        type: 'brand_building',
        title: 'Brand Building Focus',
        description: 'Content strategy shifted to brand building over sales-focused content',
        implemented: true,
        createdAt: new Date()
      };

      return {
        content: "Perfect! I've adjusted your content plan to prioritize brand building over sales content for the next month. Your content suggestions will focus on thought leadership, storytelling, and community building rather than direct sales pitches.",
        plan
      };
    }

    if (lowerInput.includes('content') || lowerInput.includes('plan') || lowerInput.includes('strategy')) {
      return {
        content: "I understand. I'll analyze your current content performance and competitor landscape to suggest strategic adjustments. What specific aspect would you like to focus on?"
      };
    }

    // Generic response
    return {
      content: "I've noted your request and will incorporate it into your content strategy. Your next content generation will reflect these changes. Is there anything specific you'd like me to prioritize?"
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
          
          {/* Signal Detected */}
          <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white/40 uppercase">SIGNAL DETECTED</span>
              <span className="text-xs text-white/30">2m ago</span>
            </div>
            <p className="text-sm text-white/70 mb-3">
              Competitor <strong>NextGen Tech</strong> just released a video on 'GPT-5 Rumors'.
            </p>
            <span className="inline-block px-2 py-1 bg-red-500/20 text-red-400 text-[10px] font-bold rounded">
              HIGH THREAT
            </span>
          </div>

          {/* Market Shift */}
          <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white/40 uppercase">MARKET SHIFT</span>
              <span className="text-xs text-white/30">15m ago</span>
            </div>
            <p className="text-sm text-white/70 mb-3">
              Keyword 'AI Automation' volume spiked by <strong>+45%</strong> on Twitter.
            </p>
            <span className="inline-block px-2 py-1 bg-green-500/20 text-green-400 text-[10px] font-bold rounded">
              OPPORTUNITY
            </span>
          </div>

          {/* Sentiment */}
          <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white/40 uppercase">SENTIMENT</span>
              <span className="text-xs text-white/30">1h ago</span>
            </div>
            <p className="text-sm text-white/70 mb-3">
              Negative sentiment detected on your latest post regarding audio quality.
            </p>
            <span className="inline-block px-2 py-1 bg-amber-500/20 text-amber-400 text-[10px] font-bold rounded">
              ALERT
            </span>
          </div>

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

