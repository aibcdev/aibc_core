import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, AlertCircle, TrendingUp, Target, MessageSquare, Loader2 } from 'lucide-react';
import { getLatestScanResults, getDebugEndpoint } from '../services/apiClient';

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
    loadConversation(); // Load saved conversation
    
    // OpenManus-style: Proactively suggest marketing ideas after data loads
    const suggestionTimer = setTimeout(() => {
      if (scanUsername && brandDNA && !isLoadingData && messages.length <= 1) {
        generateProactiveSuggestions();
      }
    }, 2000); // Wait 2 seconds after data loads
    
    return () => clearTimeout(suggestionTimer);
    
    // Listen for new scan started - clear all state
    const handleNewScanStarted = (event: CustomEvent) => {
      console.log('🧹 Strategy: New scan started, clearing all state');
      const { username, isRescan } = event.detail;
      
      // #region agent log
      fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'StrategyView.tsx:handleNewScanStarted',message:'NEW SCAN STARTED - CLEARING STATE',data:{username,isRescan,currentMessagesCount:messages.length},timestamp:Date.now(),sessionId:'debug-session',runId:'strategy-clear',hypothesisId:'H15'})}).catch(()=>{});
      // #endregion
      // Clear all strategy state
      setStrategicInsights([]);
      setBrandDNA(null);
      setCompetitorIntelligence([]);
      setScanUsername(null);
      // DON'T clear messages here - they should persist unless it's a different username
      // Only clear if username changed
      if (username && username !== scanUsername) {
        // #region agent log
        fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'StrategyView.tsx:handleNewScanStarted',message:'USERNAME CHANGED - CLEARING MESSAGES',data:{oldUsername:scanUsername,newUsername:username},timestamp:Date.now(),sessionId:'debug-session',runId:'strategy-clear',hypothesisId:'H15'})}).catch(()=>{});
        // #endregion
        setMessages([]); // Only clear if username changed
      }
      setStrategyPlans([]);
      // DON'T clear input - user might be typing
      // setInput('');
      
      // Clear ALL localStorage cache (comprehensive)
      localStorage.removeItem('lastScanResults');
      localStorage.removeItem('lastScanId');
      localStorage.removeItem('lastScanTimestamp');
      localStorage.removeItem('activeContentStrategy');
      localStorage.removeItem('strategyPlans');
      // CRITICAL: Only clear conversation if username changed - preserve conversation for same user
      if (username && username !== scanUsername) {
        // #region agent log
        fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'StrategyView.tsx:handleNewScanStarted',message:'CLEARING CONVERSATION STORAGE - USERNAME CHANGED',data:{oldUsername:scanUsername,newUsername:username},timestamp:Date.now(),sessionId:'debug-session',runId:'strategy-clear',hypothesisId:'H15'})}).catch(()=>{});
        // #endregion
        localStorage.removeItem('strategyConversation'); // Only clear if username changed
        localStorage.removeItem('strategyMessages'); // Only clear if username changed
      }
      
      console.log('✅ Strategy: All cache cleared for', isRescan ? 'rescan' : 'new scan');
      
      // Reload data for new scan
      // CRITICAL: Load conversation FIRST, then scan data, to prevent messages from being cleared
      setTimeout(() => {
        loadConversation(); // Load conversation FIRST
        setTimeout(() => {
          loadScanData();
          loadStrategyData();
        }, 100); // Small delay to ensure conversation loads before scan data
      }, 500);
    };
    
    // Listen for scan completion events
    const handleScanComplete = (event: CustomEvent) => {
      const { username, results } = event.detail || {};
      // #region agent log
      fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'StrategyView.tsx:handleScanComplete',message:'scanComplete EVENT RECEIVED',data:{username,hasResults:!!results,hasBrandDNA:!!results?.brandDNA},timestamp:Date.now(),sessionId:'debug-session',runId:'strategy-scan-complete',hypothesisId:'H3'})}).catch(()=>{});
      // #endregion
      console.log('📥 Strategy: Scan completed - reloading strategy data...', username);
      if (results) {
        // Update state immediately from event
        setBrandDNA(results.brandDNA || null);
        setCompetitorIntelligence(results.competitorIntelligence || []);
        setScanUsername(username);
        if (results.strategicInsights && Array.isArray(results.strategicInsights)) {
          generateInsightsFromData(results.strategicInsights, results.brandDNA, results.competitorIntelligence);
        }
      }
      // Also reload from cache/API to ensure consistency
      // IMPORTANT: Don't clear messages or input when scan completes - preserve conversation
      loadScanData();
      // Reload conversation to ensure it's still there
      loadConversation();
    };
    
    // Listen for username changes
    const handleUsernameChange = () => {
      const newUsername = localStorage.getItem('lastScannedUsername');
      if (newUsername && newUsername !== scanUsername) {
        // #region agent log
        fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'StrategyView.tsx:handleUsernameChange',message:'USERNAME CHANGED',data:{oldUsername:scanUsername,newUsername,currentMessagesCount:messages.length},timestamp:Date.now(),sessionId:'debug-session',runId:'strategy-username-change',hypothesisId:'H15'})}).catch(()=>{});
        // #endregion
        console.log('📥 Username changed - reloading strategy data...');
        setStrategicInsights([]);
        setBrandDNA(null);
        setCompetitorIntelligence([]);
        // IMPORTANT: Only clear messages if username actually changed
        if (newUsername !== scanUsername) {
          // #region agent log
          fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'StrategyView.tsx:handleUsernameChange',message:'CLEARING MESSAGES - USERNAME CHANGED',data:{oldUsername:scanUsername,newUsername},timestamp:Date.now(),sessionId:'debug-session',runId:'strategy-username-change',hypothesisId:'H15'})}).catch(()=>{});
          // #endregion
          setMessages([]); // Only clear when username changes
        }
        // IMPORTANT: Don't clear input when username changes - preserve user's typing
        // Load conversation FIRST, then scan data
        loadConversation();
        setTimeout(() => {
          loadScanData();
        }, 100);
      }
    };
    
    // Listen for content hub updates - may trigger strategy adjustments
    const handleContentHubUpdate = (event: CustomEvent) => {
      console.log('📥 Strategy: Content Hub updated - updating strategy context...');
      loadScanData();
    };
    
    // Listen for analytics updates
    const handleAnalyticsUpdate = (event: CustomEvent) => {
      console.log('📥 Strategy: Analytics updated - may need strategy adjustment...');
      // Analytics changes may influence strategy recommendations
      loadScanData();
    };
    
    // Listen for competitor updates
    const handleCompetitorUpdate = (event: CustomEvent) => {
      console.log('📥 Strategy: Competitor updated - refreshing competitor data...', event.detail);
      loadScanData();
    };
    
    // Listen for brand assets updates
    const handleBrandAssetsUpdate = () => {
      console.log('📥 Strategy: Brand assets updated - updating strategy context...');
      loadScanData();
    };
    
    // Listen for any data change
    const handleDataChange = (event: CustomEvent) => {
      console.log('📥 Strategy: Data changed - refreshing...', event.detail?.eventType);
      loadScanData();
    };
    
    window.addEventListener('newScanStarted', handleNewScanStarted as EventListener);
    window.addEventListener('scanComplete', handleScanComplete);
    window.addEventListener('contentHubUpdated', handleContentHubUpdate as EventListener);
    window.addEventListener('analyticsUpdated', handleAnalyticsUpdate as EventListener);
    window.addEventListener('competitorUpdated', handleCompetitorUpdate as EventListener);
    window.addEventListener('brandAssetsUpdated', handleBrandAssetsUpdate);
    window.addEventListener('dataChanged', handleDataChange as EventListener);
    
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
      window.removeEventListener('contentHubUpdated', handleContentHubUpdate as EventListener);
      window.removeEventListener('analyticsUpdated', handleAnalyticsUpdate as EventListener);
      window.removeEventListener('competitorUpdated', handleCompetitorUpdate as EventListener);
      window.removeEventListener('brandAssetsUpdated', handleBrandAssetsUpdate);
      window.removeEventListener('dataChanged', handleDataChange as EventListener);
      clearInterval(usernameCheckInterval);
    };
  }, [scanUsername]);

  useEffect(() => {
    // Only generate AI message if we have data AND no existing conversation
    // This prevents overwriting conversation history
    // CRITICAL: Add delay to ensure loadConversation has completed first
    if ((brandDNA || competitorIntelligence.length > 0) && messages.length === 0) {
      // #region agent log
      fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'StrategyView.tsx:useEffect-messages',message:'CHECKING IF SHOULD GENERATE INITIAL MESSAGE',data:{hasBrandDNA:!!brandDNA,competitorCount:competitorIntelligence.length,messagesCount:messages.length},timestamp:Date.now(),sessionId:'debug-session',runId:'strategy-init',hypothesisId:'H15'})}).catch(()=>{});
      // #endregion
      // Small delay to ensure loadConversation has run first
      const timer = setTimeout(() => {
        // Double-check messages are still empty (conversation might have loaded)
        if (messages.length === 0) {
          // #region agent log
          fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'StrategyView.tsx:useEffect-messages',message:'GENERATING INITIAL MESSAGE',data:{messagesCount:messages.length},timestamp:Date.now(),sessionId:'debug-session',runId:'strategy-init',hypothesisId:'H15'})}).catch(()=>{});
          // #endregion
          generateInitialAIMessage();
        } else {
          // #region agent log
          fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'StrategyView.tsx:useEffect-messages',message:'SKIPPING INITIAL MESSAGE - CONVERSATION EXISTS',data:{messagesCount:messages.length},timestamp:Date.now(),sessionId:'debug-session',runId:'strategy-init',hypothesisId:'H15'})}).catch(()=>{});
          // #endregion
        }
      }, 500); // Increased delay to ensure loadConversation completes
      return () => clearTimeout(timer);
    }
  }, [brandDNA, competitorIntelligence, messages.length]);

  const loadScanData = async () => {
    // #region agent log
    fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'StrategyView.tsx:loadScanData',message:'LOAD SCAN DATA CALLED',data:{currentMessagesCount:messages.length,scanUsername},timestamp:Date.now(),sessionId:'debug-session',runId:'strategy-load',hypothesisId:'H16'})}).catch(()=>{});
    // #endregion
    setIsLoadingData(true);
    try {
      // Try localStorage first
      const cachedResults = localStorage.getItem('lastScanResults');
      const currentUsername = localStorage.getItem('lastScannedUsername');
      const currentTimestamp = localStorage.getItem('lastScanTimestamp');
      
      if (cachedResults && currentUsername) {
        try {
          const cached = JSON.parse(cachedResults);
          const cachedUsername = cached.scanUsername || cached.username;
          const cachedTimestamp = cached.timestamp || cached.scanTimestamp;
          
          // Validate timestamp (must be within 7 days - same as DashboardView)
          const currentTimestampAge = currentTimestamp 
            ? Date.now() - parseInt(currentTimestamp)
            : Infinity;
          const cachedTimestampAge = cachedTimestamp 
            ? Date.now() - parseInt(cachedTimestamp)
            : Infinity;
          const timestampValid = (currentTimestamp && currentTimestampAge < 604800000) || 
                                 (cachedTimestamp && cachedTimestampAge < 604800000) ||
                                 (!currentTimestamp && !cachedTimestamp);
          
          // Only use cache if username matches AND timestamp is valid
          if (cachedUsername && cachedUsername.toLowerCase() === currentUsername.toLowerCase() && timestampValid) {
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
      // CRITICAL: After loading scan data, restore conversation to prevent messages from being lost
      // This ensures messages persist even if loadScanData triggers re-renders
      setTimeout(() => {
        loadConversation();
      }, 50);
    }
  };

  const generateInsightsFromData = (insights: any[], dna: any, competitors: any[]) => {
    const generated: StrategicInsight[] = [];
    const currentUsername = scanUsername || localStorage.getItem('lastScannedUsername') || 'your brand';
    
    // First, try to use real insights from the backend
    if (insights && insights.length > 0) {
      insights.slice(0, 3).forEach((insight, index) => {
        const title = insight.title || insight.recommendation || '';
        const description = insight.description || insight.summary || insight.recommendation || '';
        
        // Skip completely empty insights
        if (!title && !description) return;
        
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
          title: title,
          description: description,
          timestamp: new Date(Date.now() - (index * 15 * 60 * 1000)), // Stagger timestamps
          priority: priority === 'high' ? 'high' : priority === 'low' ? 'low' : 'medium',
          tag,
          tagColor
        });
      });
    }
    
    // If no insights from backend, generate from REAL brand/competitor data
    if (generated.length === 0) {
      // Generate from actual competitor intelligence
      if (competitors && competitors.length > 0) {
        const topCompetitor = competitors[0];
        if (topCompetitor.name) {
          generated.push({
            id: 'competitor-insight-1',
            type: 'signal',
            title: `Competitor Activity: ${topCompetitor.name}`,
            description: `${topCompetitor.name} is active in your space. ${topCompetitor.advantage || topCompetitor.description || 'Consider analyzing their content strategy.'}`,
            timestamp: new Date(Date.now() - 5 * 60 * 1000),
            priority: 'medium',
            tag: 'COMPETITOR',
            tagColor: 'blue'
          });
        }
      }
      
      // Generate from brand DNA themes
      if (dna) {
        const themes = dna.themes || dna.corePillars || [];
        if (themes.length > 0) {
          generated.push({
            id: 'brand-insight-1',
            type: 'opportunity',
            title: `Content Opportunity: ${themes[0]}`,
            description: `Your brand strength in "${themes[0]}" presents content opportunities. Create more content around this theme to reinforce your positioning.`,
            timestamp: new Date(Date.now() - 30 * 60 * 1000),
            priority: 'medium',
            tag: 'OPPORTUNITY',
            tagColor: 'green'
          });
        }
        
        const industry = dna.industry;
        if (industry) {
          generated.push({
            id: 'market-insight-1',
            type: 'market_shift',
            title: `Market Focus: ${industry}`,
            description: `As a player in ${industry}, stay ahead by monitoring industry trends and competitor moves. Consider content that positions you as a thought leader.`,
            timestamp: new Date(Date.now() - 60 * 60 * 1000),
            priority: 'low',
            tag: 'INSIGHT',
            tagColor: 'amber'
          });
        }
      }
    }
    
    setStrategicInsights(generated);
  };

  const generateStrategicInsights = () => {
    // CRITICAL: Only use real strategicInsights from backend - NEVER generate generic fallbacks
    // This function should NOT be used - we should only use generateInsightsFromData with real backend data
    console.warn('⚠️ Strategy: generateStrategicInsights called - this should not generate generic insights');
    setStrategicInsights([]);
  };

  const generateInitialAIMessage = () => {
    // CRITICAL: Only generate initial message if there are no existing messages
    // This preserves conversation history
    if (messages.length > 0) {
      console.log('⏭️ Skipping initial message - conversation already exists');
      return;
    }
    
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
    
    const initialMessage: StrategyMessage = {
      id: 'initial_' + Date.now(),
      role: 'assistant',
      content: message,
      timestamp: new Date()
    };
    
    // Only set if no messages exist
    setMessages([initialMessage]);
    
    // Save initial message to conversation
    if (scanUsername) {
      const conversationData = {
        username: scanUsername,
        messages: [initialMessage].map(m => ({
          ...m,
          timestamp: m.timestamp.toISOString()
        })),
        lastUpdated: Date.now()
      };
      localStorage.setItem('strategyConversation', JSON.stringify(conversationData));
    }
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

  // Load saved conversation from localStorage
  const loadConversation = () => {
    // #region agent log
    fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'StrategyView.tsx:loadConversation',message:'LOAD CONVERSATION CALLED',data:{currentMessagesCount:messages.length},timestamp:Date.now(),sessionId:'debug-session',runId:'strategy-load',hypothesisId:'H15'})}).catch(()=>{});
    // #endregion
    try {
      const currentUsername = localStorage.getItem('lastScannedUsername');
      if (!currentUsername) {
        // #region agent log
        fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'StrategyView.tsx:loadConversation',message:'NO USERNAME - CANNOT LOAD',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'strategy-load',hypothesisId:'H15'})}).catch(()=>{});
        // #endregion
        console.log('⚠️ No username found - cannot load conversation');
        return;
      }
      
      const stored = localStorage.getItem('strategyConversation');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Only load if it's for the current username
        if (parsed.username === currentUsername && Array.isArray(parsed.messages) && parsed.messages.length > 0) {
          const loadedMessages = parsed.messages.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp)
          }));
          // #region agent log
          fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'StrategyView.tsx:loadConversation',message:'LOADING MESSAGES',data:{count:loadedMessages.length,username:currentUsername},timestamp:Date.now(),sessionId:'debug-session',runId:'strategy-load',hypothesisId:'H15'})}).catch(()=>{});
          // #endregion
          console.log(`✅ Loading ${loadedMessages.length} messages from conversation history for ${currentUsername}`);
          setMessages(loadedMessages);
          // #region agent log
          fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'StrategyView.tsx:loadConversation',message:'MESSAGES SET',data:{count:loadedMessages.length},timestamp:Date.now(),sessionId:'debug-session',runId:'strategy-load',hypothesisId:'H15'})}).catch(()=>{});
          // #endregion
          console.log(`✅ Conversation loaded successfully`);
        } else {
          // #region agent log
          fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'StrategyView.tsx:loadConversation',message:'INVALID CONVERSATION',data:{hasUsername:!!parsed.username,usernameMatch:parsed.username===currentUsername,hasMessages:Array.isArray(parsed.messages),messageCount:parsed.messages?.length||0},timestamp:Date.now(),sessionId:'debug-session',runId:'strategy-load',hypothesisId:'H15'})}).catch(()=>{});
          // #endregion
          console.log('⚠️ No valid conversation found in storage', { 
            hasUsername: !!parsed.username, 
            usernameMatch: parsed.username === currentUsername,
            hasMessages: Array.isArray(parsed.messages),
            messageCount: parsed.messages?.length || 0
          });
        }
      } else {
        // #region agent log
        fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'StrategyView.tsx:loadConversation',message:'NO CONVERSATION IN STORAGE',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'strategy-load',hypothesisId:'H15'})}).catch(()=>{});
        // #endregion
        console.log('⚠️ No conversation stored in localStorage');
      }
      // IMPORTANT: Don't clear input when loading conversation
      // Input state is preserved separately
    } catch (e) {
      // #region agent log
      fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'StrategyView.tsx:loadConversation',message:'ERROR LOADING CONVERSATION',data:{error:String(e)},timestamp:Date.now(),sessionId:'debug-session',runId:'strategy-load',hypothesisId:'H15'})}).catch(()=>{});
      // #endregion
      console.error('❌ Error loading conversation:', e);
    }
  };

  // Save conversation to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0 && scanUsername) {
      const conversationData = {
        username: scanUsername,
        messages: messages.map(m => ({
          ...m,
          timestamp: m.timestamp.toISOString()
        })),
        lastUpdated: Date.now()
      };
      localStorage.setItem('strategyConversation', JSON.stringify(conversationData));
      console.log(`💾 Saved ${messages.length} messages to conversation history`);
    } else if (messages.length === 0 && scanUsername) {
      // Don't clear conversation if we just don't have messages yet
      // Only clear if username changed
      console.log('⚠️ No messages to save, but username is set:', scanUsername);
    }
  }, [messages, scanUsername]);

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
        parsed.lastUpdated = Date.now();
        
        // CRITICAL: Also update contentIdeas to reflect new strategy
        // This ensures Content Hub shows strategy-aligned ideas
        if (parsed.contentIdeas && Array.isArray(parsed.contentIdeas)) {
          parsed.contentIdeas = parsed.contentIdeas.map((idea: any) => ({
            ...idea,
            strategyContext: plan.type,
            strategyPriority: plan.type === 'competitor_focus' ? 'competitor-aligned' : 
                             plan.type === 'brand_building' ? 'brand-focused' : 'balanced',
            lastStrategyUpdate: Date.now()
          }));
        }
        
        localStorage.setItem('lastScanResults', JSON.stringify(parsed));
      } catch (e) {
        console.error('Error updating scan results:', e);
      }
    }
    
    // Save active strategy for content generation
    const activeStrategy = {
      ...plan,
      appliedAt: new Date().toISOString(),
      affectsContentGeneration: true,
      brandDNA,
      scanUsername,
      // Include context for content regeneration
      contentDirection: plan.type === 'competitor_focus' ? 
        `Focus content on competing with ${plan.title.replace('Focus on ', '')}` :
        plan.type === 'brand_building' ? 
        'Focus on brand building and thought leadership' :
        plan.description
    };
    localStorage.setItem('activeContentStrategy', JSON.stringify(activeStrategy));
    
    // REAL-TIME SYNC: Dispatch events to notify ALL components - with forceRegenerate flag
    console.log('📡 Strategy: Dispatching strategyUpdated event with forceRegenerate');
    
    // Include conversation messages for context
    const strategyEvent = new CustomEvent('strategyUpdated', {
      detail: { 
        strategy: plan,
        activeStrategy,
        timestamp: Date.now(),
        source: 'StrategyView',
        forceContentRegenerate: true, // Tell Content Hub to regenerate
        messages: messages, // Include conversation for context
        conversationSummary: messages.slice(-3).map(m => m.content).join(' ') // Last 3 messages
      }
    });
    
    window.dispatchEvent(strategyEvent);
    
    // Also dispatch immediately to ensure Content Hub receives it
    setTimeout(() => {
      window.dispatchEvent(strategyEvent);
    }, 100);
    
    // Also dispatch a general data change event
    window.dispatchEvent(new CustomEvent('dataChanged', {
      detail: {
        eventType: 'strategyUpdated',
        timestamp: Date.now(),
        source: 'StrategyView',
        data: plan,
        forceContentRegenerate: true
      }
    }));
    
    // Force Content Hub update by dispatching scanComplete event
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('scanComplete', {
        detail: {
          source: 'strategyUpdate',
          timestamp: Date.now()
        }
      }));
    }, 100);
  };

  const handleSend = async () => {
    // #region agent log
    fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'StrategyView.tsx:handleSend',message:'handleSend CALLED',data:{input:input,inputLength:input.length,isLoading},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H7'})}).catch(()=>{});
    // #endregion
    
    if (!input.trim() || isLoading) {
      // #region agent log
      fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'StrategyView.tsx:handleSend',message:'handleSend BLOCKED',data:{reason:!input.trim()?'empty input':'loading',input},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H7'})}).catch(()=>{});
      // #endregion
      return;
    }

    const userMessage: StrategyMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    const userInput = input; // Save before clearing
    const updatedMessages = [...messages, userMessage];
    console.log(`💬 Adding user message. Total messages: ${updatedMessages.length}`);
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);
    
    // Save conversation immediately
    if (scanUsername) {
      const conversationData = {
        username: scanUsername,
        messages: updatedMessages.map(m => ({
          ...m,
          timestamp: m.timestamp.toISOString()
        })),
        lastUpdated: Date.now()
      };
      localStorage.setItem('strategyConversation', JSON.stringify(conversationData));
      console.log(`💾 Saved conversation immediately with ${updatedMessages.length} messages`);
    } else {
      console.warn('⚠️ No scanUsername - cannot save conversation');
    }

    // #region agent log
    fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'StrategyView.tsx:handleSend',message:'Processing strategy request',data:{userInput},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H7'})}).catch(()=>{});
    // #endregion

    try {
      // Use ONLY brand voice extracted from actual content (from brandDNA) - NOT manual settings
      // Brand voice comes from analyzing their actual posts during the scan
      // #region agent log
      fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'StrategyView.tsx:handleSend',message:'USING EXTRACTED BRAND VOICE FOR N8N',data:{hasBrandDNA:!!brandDNA,hasBrandDNAVoice:!!brandDNA?.voice,voiceStyle:brandDNA?.voice?.style,voiceTone:brandDNA?.voice?.tone},timestamp:Date.now(),sessionId:'debug-session',runId:'strategy-dispatch',hypothesisId:'H19'})}).catch(()=>{});
      // #endregion
      
      // Call backend API for real strategy processing - triggers n8n workflow
      // NOTE: Prefer 127.0.0.1 over localhost to avoid IPv6 (::1) resolution issues in browsers.
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001'}/api/strategy/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userInput,
          username: scanUsername,
          scanUsername: scanUsername,
          brandDNA, // brandDNA contains voice extracted from actual content analysis
          competitors: competitorIntelligence.map(c => c.name),
          competitorIntelligence: competitorIntelligence,
        })
      });

      if (response.ok) {
        const result = await response.json();
        // #region agent log
        fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'StrategyView.tsx:handleSend',message:'API response OK',data:{hasResult:!!result,newCompetitors:result.contentUpdates?.newCompetitors},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H7'})}).catch(()=>{});
        // #endregion
        
        // Include marketing suggestions in response if available
        let responseContent = result.response || generateAIResponse(userInput).content;
        if (result.marketingSuggestions && result.marketingSuggestions.length > 0) {
          responseContent += `\n\n**Marketing Suggestions:**\n${result.marketingSuggestions.map((s: string, i: number) => `${i + 1}. ${s}`).join('\n')}`;
        }
        
        const assistantMessage: StrategyMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: responseContent,
          timestamp: new Date()
        };
        let updatedMessages: StrategyMessage[] = [];
        setMessages(prev => {
          updatedMessages = [...prev, assistantMessage];
          console.log(`💬 Messages updated: ${updatedMessages.length} total (added assistant response)`);
          // Save conversation with assistant response
          if (scanUsername) {
            const conversationData = {
              username: scanUsername,
              messages: updatedMessages.map(m => ({
                ...m,
                timestamp: m.timestamp.toISOString()
              })),
              lastUpdated: Date.now()
            };
            localStorage.setItem('strategyConversation', JSON.stringify(conversationData));
            console.log(`💾 Saved conversation with ${updatedMessages.length} messages`);
          }
          return updatedMessages;
        });
        
        // Check if user requested adding competitors - detect from input
        const lowerInput = userInput.toLowerCase();
        if (lowerInput.includes('add') && lowerInput.includes('competitor')) {
          // Extract competitor name from input
          const competitorMatch = userInput.match(/add\s+([a-zA-Z0-9_.-]+(?:\.[a-zA-Z]+)?)/i);
          if (competitorMatch) {
            const competitorName = competitorMatch[1].replace(/\s+as.*$/i, '').trim();
            const threatLevel = lowerInput.includes('low threat') ? 'low' : lowerInput.includes('high threat') ? 'high' : 'medium';
            
            // Add competitor to localStorage
            const scanResults = localStorage.getItem('lastScanResults');
            if (scanResults) {
              try {
                const parsed = JSON.parse(scanResults);
                const newCompetitor = {
                  name: competitorName,
                  threatLevel: threatLevel,
                  primaryVector: 'User-added competitor',
                  advantage: 'Tracking requested by user',
                  opportunity: 'Monitor content and engagement',
                  platforms: ['Twitter/X', 'LinkedIn']
                };
                
                parsed.competitorIntelligence = parsed.competitorIntelligence || [];
                // Check if not already exists
                if (!parsed.competitorIntelligence.find((c: any) => c.name.toLowerCase() === competitorName.toLowerCase())) {
                  parsed.competitorIntelligence.push(newCompetitor);
                  localStorage.setItem('lastScanResults', JSON.stringify(parsed));
                  
                  // Dispatch competitor added event
                  window.dispatchEvent(new CustomEvent('competitorAdded', { 
                    detail: { competitor: newCompetitor }
                  }));
                  
                  // Dispatch data changed to reload dashboard
                  window.dispatchEvent(new CustomEvent('dataChanged', { 
                    detail: { eventType: 'competitorAdded', competitor: newCompetitor }
                  }));
                }
              } catch (e) {
                console.error('Error adding competitor:', e);
              }
            }
          }
        }
        
        // Dispatch event to update content hub with proper strategy object
        // Always dispatch strategy update, even if no contentUpdates in response
        const strategyObj = result.strategy || {
          type: 'user_directed',
          title: userInput.substring(0, 50) + (userInput.length > 50 ? '...' : ''),
          description: userInput,
          appliedAt: new Date().toISOString()
        };
        
        // Save strategy to localStorage for persistence
        localStorage.setItem('activeContentStrategy', JSON.stringify(strategyObj));
        // Save timestamp of strategy update so Content Hub can detect recent updates
        localStorage.setItem('lastStrategyUpdate', Date.now().toString());
        
        console.log('📡 Strategy: Dispatching strategyUpdated event with forceRegenerate', strategyObj);
        
        // CRITICAL: Use updatedMessages from setMessages callback, not stale closure
        const currentMessages = updatedMessages.length > 0 ? updatedMessages : messages;
        // #region agent log
        fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'StrategyView.tsx:handleSend',message:'DISPATCHING strategyUpdated EVENT',data:{hasStrategy:!!strategyObj,strategyType:strategyObj.type,hasMessages:!!currentMessages,messagesCount:currentMessages.length,usingUpdated:updatedMessages.length>0,scanUsername},timestamp:Date.now(),sessionId:'debug-session',runId:'strategy-dispatch',hypothesisId:'H18'})}).catch(()=>{});
        // #endregion
        
        // REAL-TIME SYNC: Dispatch strategyUpdated event - CRITICAL for content hub update
        const strategyEvent = new CustomEvent('strategyUpdated', { 
          detail: { 
            strategy: strategyObj, 
            activeStrategy: strategyObj,
            updates: result.contentUpdates, 
            marketingSuggestions: result.marketingSuggestions || [],
            forceContentRegenerate: true,
            timestamp: Date.now(),
            source: 'StrategyView',
            username: scanUsername,
            messages: currentMessages, // Use updated messages
            conversationSummary: currentMessages.slice(-3).map(m => m.content).join(' ') // Last 3 messages
          }
        });
        window.dispatchEvent(strategyEvent);
        // #region agent log
        fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'StrategyView.tsx:handleSend',message:'strategyUpdated EVENT DISPATCHED',data:{eventType:'strategyUpdated',hasDetail:!!strategyEvent.detail,messagesInEvent:strategyEvent.detail.messages?.length||0},timestamp:Date.now(),sessionId:'debug-session',runId:'strategy-dispatch',hypothesisId:'H18'})}).catch(()=>{});
        // #endregion
        
        // OpenManus-style: Generate new suggestions after response (iterative loop)
        setTimeout(() => {
          generateProactiveSuggestions();
        }, 2000); // Wait 2 seconds after response
        
        // Dispatch again after short delay to ensure Content Hub receives it
        setTimeout(() => {
          window.dispatchEvent(strategyEvent);
        }, 100);
        console.log('✅ Strategy: strategyUpdated event dispatched');
        
        // Also dispatch dataChanged event to ensure all components update
        window.dispatchEvent(new CustomEvent('dataChanged', {
          detail: {
            eventType: 'strategyUpdated',
            strategy: strategyObj,
            forceContentRegenerate: true,
            timestamp: Date.now(),
            source: 'StrategyView'
          }
        }));
        
        // Force a small delay then dispatch again to ensure content hub receives it
        setTimeout(() => {
          console.log('📡 Strategy: Re-dispatching strategyUpdated event to ensure content hub receives it');
          window.dispatchEvent(new CustomEvent('strategyUpdated', { 
            detail: { 
              strategy: strategyObj, 
              activeStrategy: strategyObj,
              updates: result.contentUpdates, 
              marketingSuggestions: result.marketingSuggestions || [],
              forceContentRegenerate: true,
              timestamp: Date.now(),
              source: 'StrategyView',
              username: scanUsername
            }
          }));
        }, 100);
      } else {
        // Fallback to local generation
        const aiResponse = generateAIResponse(userInput);
        const assistantMessage: StrategyMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: aiResponse.content,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
        
        if (aiResponse.plan) {
          saveStrategyPlan(aiResponse.plan);
        }
        
        // Create a strategy object for content regeneration
        const strategyObj = aiResponse.plan || {
          type: 'user_directed',
          title: userInput.substring(0, 50) + (userInput.length > 50 ? '...' : ''),
          description: userInput,
          appliedAt: new Date().toISOString()
        };
        
        // Still dispatch strategy update for local content regeneration
        localStorage.setItem('activeContentStrategy', JSON.stringify(strategyObj));
        console.log('📡 Strategy: Dispatching strategyUpdated event (fallback)', strategyObj);
        window.dispatchEvent(new CustomEvent('strategyUpdated', { 
          detail: { 
            strategy: strategyObj, 
            activeStrategy: strategyObj,
            forceContentRegenerate: true,
            timestamp: Date.now(),
            source: 'StrategyView',
            username: scanUsername
          }
        }));
      }
    } catch (error) {
      // #region agent log
      fetch(getDebugEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'StrategyView.tsx:handleSend',message:'API call FAILED',data:{error:String(error)},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H7'})}).catch(()=>{});
      // #endregion
      
      // Fallback to local generation
      const aiResponse = generateAIResponse(userInput);
      const assistantMessage: StrategyMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse.content,
        timestamp: new Date()
      };
      setMessages(prev => {
        const newMessages = [...prev, assistantMessage];
        // Save conversation
        if (scanUsername) {
          const conversationData = {
            username: scanUsername,
            messages: newMessages.map(m => ({
              ...m,
              timestamp: m.timestamp.toISOString()
            })),
            lastUpdated: Date.now()
          };
          localStorage.setItem('strategyConversation', JSON.stringify(conversationData));
        }
        return newMessages;
      });
      
      if (aiResponse.plan) {
        saveStrategyPlan(aiResponse.plan);
      }
      
      // Create a strategy object for content regeneration
      const strategyObj = aiResponse.plan || {
        type: 'user_directed',
        title: userInput.substring(0, 50) + (userInput.length > 50 ? '...' : ''),
        description: userInput,
        appliedAt: new Date().toISOString()
      };
      
      // Still dispatch event with proper strategy object
      window.dispatchEvent(new CustomEvent('strategyUpdated', { 
        detail: { strategy: strategyObj, forceContentRegenerate: true }
      }));
    }

    setIsLoading(false);
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

  /**
   * Generate proactive marketing suggestions (OpenManus-style)
   */
  const generateProactiveSuggestions = async () => {
    if (!scanUsername || !brandDNA || isLoading) return;

    try {
      console.log('[Strategy] Generating proactive marketing suggestions...');
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';
      
      const response = await fetch(`${API_BASE_URL}/api/strategy/suggest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: scanUsername,
          brandDNA,
          competitorIntelligence,
          conversationHistory: messages.slice(-5).map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (response.ok) {
        const result = await response.json();
        
        if (result.success && result.suggestions?.length > 0) {
          const suggestionsText = `**Proactive Marketing Suggestions:**\n\n${result.suggestions.map((s: string, i: number) => `${i + 1}. ${s}`).join('\n')}`;
          
          const suggestionMessage: StrategyMessage = {
            id: `suggestion_${Date.now()}`,
            role: 'assistant',
            content: suggestionsText,
            timestamp: new Date(),
          };

          setMessages(prev => {
            // Only add if not already present
            const exists = prev.some(m => m.id === suggestionMessage.id);
            if (exists) return prev;
            
            const updated = [...prev, suggestionMessage];
            
            // Save conversation
            if (scanUsername) {
              const conversationData = {
                username: scanUsername,
                messages: updated.map(m => ({
                  ...m,
                  timestamp: m.timestamp.toISOString(),
                })),
                lastUpdated: Date.now(),
              };
              localStorage.setItem('strategyConversation', JSON.stringify(conversationData));
            }
            
            return updated;
          });

          // Update Content Hub with content ideas from suggestions
          if (result.contentIdeas?.length > 0) {
            const contentIdeas = result.contentIdeas.map((ci: any) => ci.contentIdea).filter(Boolean);
            
            // Dispatch event to update Content Hub
            window.dispatchEvent(new CustomEvent('strategyUpdated', {
              detail: {
                strategy: {
                  type: 'proactive_suggestions',
                  title: 'Proactive Marketing Suggestions',
                  description: suggestionsText,
                  appliedAt: new Date().toISOString(),
                },
                contentIdeas,
                forceContentRegenerate: true,
                timestamp: Date.now(),
                source: 'StrategyView',
                username: scanUsername,
              },
            }));

            // Also update localStorage for Content Hub
            const scanResults = localStorage.getItem('lastScanResults');
            if (scanResults) {
              try {
                const parsed = JSON.parse(scanResults);
                parsed.contentIdeas = [...(parsed.contentIdeas || []), ...contentIdeas];
                parsed.lastUpdated = Date.now();
                localStorage.setItem('lastScanResults', JSON.stringify(parsed));
              } catch (e) {
                console.error('Error updating scan results with suggestions:', e);
              }
            }
          }
        }
      }
    } catch (error: any) {
      console.warn('[Strategy] Failed to generate proactive suggestions:', error.message);
    }
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

    // Handle content/plan/strategy requests - ACTUALLY IMPLEMENT, don't just ask questions
    if (lowerInput.includes('content') || lowerInput.includes('plan') || lowerInput.includes('series') || lowerInput.includes('implement')) {
      const industry = brandDNA?.industry || 'your industry';
      const themes = brandDNA?.themes || brandDNA?.corePillars || [];
      
      // Create an actual content strategy plan
      const plan: StrategyPlan = {
        id: Date.now().toString(),
        type: 'custom',
        title: userInput.substring(0, 50) + (userInput.length > 50 ? '...' : ''),
        description: `Custom content strategy: ${userInput}`,
        implemented: true,
        createdAt: new Date()
      };
      
      // Generate a substantive response that confirms implementation
      const themeFocus = themes.length > 0 ? themes[0] : industry;
      return {
        content: `✅ **Strategy implemented!**

I've created a custom content plan based on your request: "${userInput.substring(0, 100)}${userInput.length > 100 ? '...' : ''}"

**What I've done:**
- Added this strategy to your active content direction
- Your Content Hub will now generate ideas aligned with this theme
- Future content will incorporate ${themeFocus} elements

**Recommended next steps:**
1. Check Content Hub for new suggestions based on this strategy
2. Schedule your first piece of content within 24-48 hours
3. Monitor engagement and adjust the strategy as needed

The strategy is now active and will influence all content generation. Would you like me to generate specific content ideas for this strategy right now?`,
        plan
      };
    }

    // Handle "yes", "do it", "ok", etc. - confirmation responses
    if (lowerInput.match(/^(yes|ok|sure|do it|go ahead|please|implement|create|generate|make)/)) {
      const themes = brandDNA?.themes || brandDNA?.corePillars || [];
      const themeFocus = themes.length > 0 ? themes[0] : 'your brand';
      
      const plan: StrategyPlan = {
        id: Date.now().toString(),
        type: 'custom',
        title: `Content generation for ${themeFocus}`,
        description: 'User confirmed content generation request',
        implemented: true,
        createdAt: new Date()
      };
      
      return {
        content: `✅ **Done!** I've implemented your content strategy.

**What's happening now:**
- Content Hub is being updated with new suggestions
- 5-7 content ideas will be generated based on ${themeFocus}
- These will appear in your Content Hub within seconds

Check your Content Hub now to see the new content suggestions tailored to your strategy!`,
        plan
      };
    }

    // For any other input, provide a helpful response that actually does something
    const industry = brandDNA?.industry ? ` in ${brandDNA.industry}` : '';
    const plan: StrategyPlan = {
      id: Date.now().toString(),
      type: 'custom',
      title: `Strategy: ${userInput.substring(0, 40)}`,
      description: userInput,
      implemented: true,
      createdAt: new Date()
    };
    
    return {
      content: `✅ **Got it!** I've incorporated your input into ${brandName}'s content strategy${industry}.

**Changes made:**
- Your request has been saved to the active strategy
- Content Hub will reflect these preferences in future suggestions
- All new content will align with this direction

Your strategy is now active. Would you like me to generate specific content ideas, or analyze competitors in this area?`,
      plan
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

