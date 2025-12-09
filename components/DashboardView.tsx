import React, { useState, useRef, useEffect } from 'react';
import { 
  Inbox, Flag, Settings, Bell, Search, 
  MoreHorizontal, Calendar, CheckCircle2, Clock, 
  AlertCircle, Briefcase, Plus, Trash2,
  X, Zap, Globe, Users, Activity, BarChart2, ShieldAlert,
  Target, FileText, Send, CheckCircle, Sparkles, TrendingUp,
  Linkedin, Instagram, Play, Loader2
} from 'lucide-react';
import { ViewState, NavProps } from '../types';
import { fetchAnalyticsData, fetchCalendarEvents, fetchCompetitors, fetchContentPipeline } from '../services/dashboardData';
import { getLatestScanResults } from '../services/apiClient';
import { isAdmin } from '../services/adminService';
import { SubscriptionTier } from '../services/subscriptionService';
import FeatureLock from './FeatureLock';
import ContentHubView from './ContentHubView';
import StrategyView from './StrategyView';
import ProductionRoomView from './ProductionRoomView';
import CalendarView from './CalendarView';
import AnalyticsView from './AnalyticsView';
import BrandAssetsView from './BrandAssetsView';
import IntegrationsView from './IntegrationsView';
import SettingsView from './SettingsView';

// Task Interface
interface Task {
  id: number;
  title: string;
  description?: string;
  priority: 'High' | 'Medium' | 'Low';
  due: string;
  dueDate?: Date;
  dueTime?: string;
  completed: boolean;
  emailNotification?: boolean;
  addToCalendar?: boolean;
  notificationEmail?: string;
}

type DashboardPage = 'dashboard' | 'contentHub' | 'strategy' | 'production' | 'calendar' | 'assets' | 'integrations' | 'competitors' | 'analytics' | 'settings';

const DashboardView: React.FC<NavProps> = ({ onNavigate }) => {
  const [currentPage, setCurrentPage] = useState<DashboardPage>('dashboard');
  const [activeTab, setActiveTab] = useState<'activity' | 'tasks'>('tasks');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const taskInputRef = useRef<HTMLInputElement>(null);
  const [userInfo, setUserInfo] = useState<{ name: string; email: string; initials: string } | null>(null);
  
  // Modal State
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Real Data State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [competitors, setCompetitors] = useState<any[]>([]);
  const [contentPipeline, setContentPipeline] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Scan Results State
  const [strategicInsights, setStrategicInsights] = useState<any[]>([]);
  const [brandDNA, setBrandDNA] = useState<any>(null);
  const [competitorIntelligence, setCompetitorIntelligence] = useState<any[]>([]);
  const [marketShare, setMarketShare] = useState<any>(null);
  const [scanUsername, setScanUsername] = useState<string | null>(null);
  const [showAddCompetitor, setShowAddCompetitor] = useState(false);
  const [newCompetitor, setNewCompetitor] = useState({
    name: '',
    xHandle: '',
    youtubeChannel: '',
    linkedinUrl: '',
    instagramHandle: '',
    tiktokHandle: '',
    threatLevel: 'MEDIUM' as 'HIGH' | 'MEDIUM' | 'LOW',
    notes: ''
  });
  const [competitorVerification, setCompetitorVerification] = useState<{
    isVerifying: boolean;
    verified: boolean;
    profile?: { name: string; bio?: string; followers?: string };
    error?: string;
  } | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    title: string;
    message: string;
    time: string;
    unread: boolean;
  }>>([]);
  const [competitorSearchTimeout, setCompetitorSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // Debug: Log state changes
  useEffect(() => {
    console.log('=== DASHBOARD DATA STATE ===');
    console.log('Strategic Insights:', strategicInsights?.length || 0, strategicInsights);
    console.log('Brand DNA:', !!brandDNA, brandDNA);
    console.log('Competitor Intelligence:', competitorIntelligence?.length || 0, competitorIntelligence);
    console.log('Market Share:', marketShare);
    console.log('Scan Username:', scanUsername);
    console.log('Analytics:', analytics);
    
    // Check localStorage
    const cached = localStorage.getItem('lastScanResults');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        console.log('=== LOCALSTORAGE DATA ===');
        console.log('Has strategicInsights:', !!parsed.strategicInsights, parsed.strategicInsights?.length);
        console.log('Has brandDNA:', !!parsed.brandDNA);
        console.log('Has competitorIntelligence:', !!parsed.competitorIntelligence, parsed.competitorIntelligence?.length);
        console.log('Has marketShare:', !!parsed.marketShare);
        console.log('Has extractedContent:', !!parsed.extractedContent);
        console.log('Full cached data keys:', Object.keys(parsed));
        
        // Check if data exists but state is empty
        if (parsed.strategicInsights && (!strategicInsights || strategicInsights.length === 0)) {
          console.error('⚠️ DATA MISMATCH: localStorage has insights but state is empty!');
          console.log('localStorage insights:', parsed.strategicInsights);
          console.log('State insights:', strategicInsights);
        }
        if (parsed.brandDNA && !brandDNA) {
          console.error('⚠️ DATA MISMATCH: localStorage has brandDNA but state is null!');
        }
        if (parsed.competitorIntelligence && (!competitorIntelligence || competitorIntelligence.length === 0)) {
          console.error('⚠️ DATA MISMATCH: localStorage has competitors but state is empty!');
          console.log('localStorage competitors:', parsed.competitorIntelligence);
          console.log('State competitors:', competitorIntelligence);
        }
      } catch (e) {
        console.error('Error parsing cache:', e);
      }
    } else {
      console.log('No cached scan results in localStorage');
    }
  }, [strategicInsights, brandDNA, competitorIntelligence, scanUsername, marketShare, analytics]);

  // Fetch real data on mount
  useEffect(() => {
    // Set loading to false immediately so dashboard renders instantly
    // Data will load in background to prevent blank screen
    setLoading(false);
    
        const loadData = async () => {
      try {
        const [analyticsData, events, competitorData, pipeline] = await Promise.all([
          fetchAnalyticsData(),
          fetchCalendarEvents(),
          fetchCompetitors(),
          fetchContentPipeline(),
        ]);
        
        setAnalytics(analyticsData);
        setCalendarEvents(events);
        setCompetitors(competitorData);
        setContentPipeline(pipeline);
        
        console.log('Analytics loaded:', analyticsData);
        
        // Load scan results - try multiple methods
        const loadScanData = () => {
          // Method 1: Try localStorage cache first (fastest)
          const cachedResults = localStorage.getItem('lastScanResults');
          if (cachedResults) {
            try {
              const cached = JSON.parse(cachedResults);
              console.log('=== LOADING FROM CACHE ===');
              console.log('Cached data keys:', Object.keys(cached));
              console.log('Strategic insights:', cached.strategicInsights?.length || 0, cached.strategicInsights);
              console.log('Brand DNA:', !!cached.brandDNA, cached.brandDNA);
              console.log('Competitor intelligence:', cached.competitorIntelligence?.length || 0, cached.competitorIntelligence);
              console.log('Market share:', cached.marketShare);
              
              // Set strategic insights - ensure it's an array
              if (cached.strategicInsights) {
                const insights = Array.isArray(cached.strategicInsights) ? cached.strategicInsights : [];
                console.log('Setting strategic insights:', insights.length);
                setStrategicInsights(insights);
              } else {
                console.warn('No strategic insights in cache');
                setStrategicInsights([]);
              }
              
              // Set brand DNA
              if (cached.brandDNA) {
                console.log('Setting brand DNA');
                setBrandDNA(cached.brandDNA);
              } else {
                console.warn('No brand DNA in cache');
                setBrandDNA(null);
              }
              
              // Ensure competitorIntelligence is always an array
              if (cached.competitorIntelligence) {
                const competitors = Array.isArray(cached.competitorIntelligence) 
                  ? cached.competitorIntelligence 
                  : [];
                console.log('Setting competitors:', competitors.length, 'manual:', competitors.filter((c: any) => c.isManual).length);
                setCompetitorIntelligence(competitors);
              } else {
                console.warn('No competitor intelligence in cache');
                setCompetitorIntelligence([]);
              }
              
              if (cached.marketShare) {
                console.log('Setting market share');
                setMarketShare(cached.marketShare);
              }
              
              const username = localStorage.getItem('lastScannedUsername');
              if (username) {
                console.log('Setting scan username:', username);
                setScanUsername(username);
              }
              
              // Recalculate analytics with cached scan data
              fetchAnalyticsData().then(updatedAnalytics => {
                console.log('Analytics updated from cache:', updatedAnalytics);
                setAnalytics(updatedAnalytics);
              }).catch(err => {
                console.error('Error updating analytics:', err);
              });
            } catch (e) {
              console.error('Error parsing cached results:', e);
            }
          }
          
          // Method 2: Try API fetch
          const storedUsername = localStorage.getItem('lastScannedUsername');
          if (storedUsername) {
            getLatestScanResults(storedUsername)
              .then(async (scanResults) => {
                console.log('API scan results:', scanResults);
                console.log('=== FULL API RESPONSE DEBUG ===');
                console.log('Full scanResults:', JSON.stringify(scanResults, null, 2));
                console.log('scanResults.data:', scanResults.data);
                console.log('competitorIntelligence type:', typeof scanResults.data?.competitorIntelligence);
                console.log('competitorIntelligence value:', scanResults.data?.competitorIntelligence);
                console.log('Is array?', Array.isArray(scanResults.data?.competitorIntelligence));
                console.log('Length:', scanResults.data?.competitorIntelligence?.length);
                
                if (scanResults.success && scanResults.data) {
                  console.log('=== API SCAN RESULTS ===');
                  console.log('Full data object:', scanResults.data);
                  console.log('Data keys:', Object.keys(scanResults.data));
                  console.log('Loading scan results:', {
                    hasInsights: !!scanResults.data.strategicInsights,
                    insightsCount: scanResults.data.strategicInsights?.length || 0,
                    insightsData: scanResults.data.strategicInsights,
                    hasBrandDNA: !!scanResults.data.brandDNA,
                    brandDNAKeys: scanResults.data.brandDNA ? Object.keys(scanResults.data.brandDNA) : [],
                    competitorCount: scanResults.data.competitorIntelligence?.length || 0,
                    competitors: scanResults.data.competitorIntelligence,
                    hasMarketShare: !!scanResults.data.marketShare,
                    hasExtractedContent: !!scanResults.data.extractedContent
                  });
                  
                  // Set strategic insights - ensure it's an array
                  const insights = Array.isArray(scanResults.data.strategicInsights) 
                    ? scanResults.data.strategicInsights 
                    : [];
                  console.log('Setting strategic insights from API:', insights.length);
                  setStrategicInsights(insights);
                  
                  // Set brand DNA
                  console.log('Setting brand DNA from API:', !!scanResults.data.brandDNA);
                  setBrandDNA(scanResults.data.brandDNA || null);
                  
                  // Get scan competitors
                  const scanCompetitors = Array.isArray(scanResults.data.competitorIntelligence) 
                    ? scanResults.data.competitorIntelligence 
                    : [];
                  
                  // Get manual competitors from existing cache (before overwriting)
                  const existingCache = localStorage.getItem('lastScanResults');
                  let manualCompetitors: any[] = [];
                  if (existingCache) {
                    try {
                      const cached = JSON.parse(existingCache);
                      manualCompetitors = (cached.competitorIntelligence || []).filter((c: any) => c.isManual);
                      console.log('Found manual competitors:', manualCompetitors.length);
                    } catch (e) {
                      console.error('Error loading manual competitors:', e);
                    }
                  }
                  
                  // Merge: scan competitors first, then manual (avoid duplicates by name)
                  const competitorMap = new Map();
                  scanCompetitors.forEach((c: any) => {
                    competitorMap.set(c.name?.toLowerCase(), c);
                  });
                  manualCompetitors.forEach((c: any) => {
                    if (!competitorMap.has(c.name?.toLowerCase())) {
                      competitorMap.set(c.name?.toLowerCase(), c);
                    }
                  });
                  
                  const mergedCompetitors = Array.from(competitorMap.values());
                  console.log('Merged competitors:', mergedCompetitors.length, 'scan:', scanCompetitors.length, 'manual:', manualCompetitors.length);
                  setCompetitorIntelligence(mergedCompetitors);
                  setMarketShare(scanResults.data.marketShare || null);
                  setScanUsername(storedUsername);
                  
                  // Update cache with merged data
                  const updatedCache = {
                    ...scanResults.data,
                    competitorIntelligence: mergedCompetitors
                  };
                  localStorage.setItem('lastScanResults', JSON.stringify(updatedCache));
                  
                  // Recalculate analytics with new scan data
                  const updatedAnalytics = await fetchAnalyticsData();
                  setAnalytics(updatedAnalytics);
                  console.log('Analytics updated after scan load:', updatedAnalytics);
                } else {
                  console.error('❌ API returned success but data is null or undefined');
                }
              })
              .catch(error => {
                console.error('❌ Error fetching scan results from API:', error);
                // Don't clear existing data on API error
              })
              .catch(error => {
                console.error('Error loading scan results from API:', error);
                // Keep cached data if API fails
              });
          }
        };
        
        loadScanData();
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      }
      // Note: loading is already false, so we don't need to set it again
    };

    loadData();
  }, []);

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      const newTask: Task = {
        id: Date.now(),
        title: newTaskTitle,
        description: '',
        priority: 'Medium', // Default priority
        due: 'Next Week',
        completed: false
      };
      setTasks([newTask, ...tasks]);
      setNewTaskTitle('');
    }
  };

  const handleTaskClick = (task: Task) => {
    if (!task.completed) {
      setSelectedTask({ ...task }); // Create a copy to edit
    }
  };

  const handleSaveTask = () => {
    if (selectedTask) {
      setTasks(tasks.map(t => t.id === selectedTask.id ? selectedTask : t));
      setSelectedTask(null);
    }
  };

  const handleModalChange = (field: keyof Task, value: any) => {
    if (selectedTask) {
      setSelectedTask({ ...selectedTask, [field]: value });
    }
  };

  // Always render the dashboard structure, even during loading
  // This prevents blank screens during navigation
  return (
    <div className="flex h-screen bg-[#050505] text-white overflow-hidden font-sans relative">
      
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-white/10 flex flex-col bg-[#080808]">
         <div className="h-16 flex items-center px-6 border-b border-white/10">
             <div className="flex items-center gap-3">
                <div className="h-6 w-6 flex items-center justify-center text-white">
                    <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="50" cy="50" r="48" stroke="currentColor" strokeWidth="4" />
                        <circle cx="50" cy="50" r="34" stroke="currentColor" strokeWidth="4" />
                        <circle cx="50" cy="50" r="20" stroke="currentColor" strokeWidth="4" />
                        <circle cx="50" cy="50" r="6" fill="currentColor" />
                    </svg>
                </div>
                <span className="text-lg font-black tracking-tight text-white">AIBC</span>
             </div>
         </div>

         <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
             <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-4 mb-4 mt-2">Platform</div>
             <SidebarItem label="Dashboard" active={currentPage === 'dashboard'} onClick={() => setCurrentPage('dashboard')} />
             <SidebarItem label="Content Hub" active={currentPage === 'contentHub'} onClick={() => setCurrentPage('contentHub')} />
             <SidebarItem label="Strategy" active={currentPage === 'strategy'} onClick={() => setCurrentPage('strategy')} />
             <SidebarItem label="Production Room" active={currentPage === 'production'} onClick={() => setCurrentPage('production')} />
             <SidebarItem label="Inbox" active={false} onClick={() => onNavigate(ViewState.INBOX)} />
             <SidebarItem label="Calendar" active={currentPage === 'calendar'} onClick={() => setCurrentPage('calendar')} />
             <SidebarItem label="Brand Assets" active={currentPage === 'assets'} onClick={() => setCurrentPage('assets')} />
             <SidebarItem label="Integrations" active={currentPage === 'integrations'} onClick={() => setCurrentPage('integrations')} />
             <SidebarItem label="Analytics" active={currentPage === 'analytics'} onClick={() => setCurrentPage('analytics')} />
             <div className="mt-4 pt-4 border-t border-white/5">
               <SidebarItem label="Settings" active={currentPage === 'settings'} onClick={() => setCurrentPage('settings')} />
               {isAdmin() && (
                 <SidebarItem 
                   label="Admin Panel" 
                   active={false} 
                   onClick={() => onNavigate(ViewState.ADMIN)} 
                 />
               )}
             </div>
         </div>

         <div className="p-4 border-t border-white/10">
             <div className="flex items-center gap-3 px-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-purple-600 flex items-center justify-center text-xs font-bold border border-white/20">
                    {userInfo?.initials || 'U'}
                </div>
                <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-white truncate">{userInfo?.name || 'User'}</div>
                    <div className="text-[10px] text-white/40 truncate">{userInfo?.email || 'Pro Plan'}</div>
                </div>
             </div>
         </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header */}
        <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-[#050505]/50 backdrop-blur-sm z-10">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-white/40">
              <Calendar className="w-3 h-3" />
              <span>{new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
              {scanUsername && (
                <span className="bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded text-[10px] font-bold">Scan: {scanUsername}</span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const lastUsername = localStorage.getItem('lastScannedUsername');
                if (lastUsername) {
                  onNavigate(ViewState.AUDIT);
                } else {
                  onNavigate(ViewState.INGESTION);
                }
              }}
              className="px-3 py-1.5 bg-gradient-to-r from-orange-500 to-purple-600 border border-white/10 rounded-lg text-xs font-bold text-white hover:from-orange-600 hover:to-purple-700 transition-all flex items-center gap-2"
            >
              <Zap className="w-3 h-3" />
              Rescan Footprint
            </button>
            <button
              onClick={async () => {
                console.log('Manual refresh triggered');
                // Try localStorage first
                const cachedResults = localStorage.getItem('lastScanResults');
                if (cachedResults) {
                  try {
                    const cached = JSON.parse(cachedResults);
                    console.log('Loading from cache:', cached);
                    setStrategicInsights(cached.strategicInsights || []);
                    setBrandDNA(cached.brandDNA || null);
                    // Ensure competitorIntelligence is always an array
                    const competitors = Array.isArray(cached.competitorIntelligence) 
                      ? cached.competitorIntelligence 
                      : [];
                    setCompetitorIntelligence(competitors);
                    setMarketShare(cached.marketShare || null);
                  } catch (e) {
                    console.error('Cache parse error:', e);
                  }
                }
                
                // Then try API
                const storedUsername = localStorage.getItem('lastScannedUsername');
                if (storedUsername) {
                  try {
                    const scanResults = await getLatestScanResults(storedUsername);
                    console.log('Refresh results:', scanResults);
                    
                    // Handle case where API returns null
                    if (scanResults.success && scanResults.data === null) {
                      console.warn('⚠️ Refresh: API returned null - no completed scans found');
                      // Keep existing cache data, don't overwrite
                      return;
                    }
                    
                    if (!scanResults.success) {
                      console.error('❌ Refresh: API returned error:', scanResults);
                      return;
                    }
                    
                    if (!scanResults.data) {
                      console.error('❌ Refresh: API returned success but data is null/undefined');
                      return;
                    }
                    
                    if (scanResults.data) {
                      setStrategicInsights(scanResults.data.strategicInsights || []);
                      setBrandDNA(scanResults.data.brandDNA || null);
                      
                      // Get scan competitors
                      const scanCompetitors = Array.isArray(scanResults.data.competitorIntelligence) 
                        ? scanResults.data.competitorIntelligence 
                        : [];
                      
                      // Get manual competitors from existing cache (before overwriting)
                      const existingCache = localStorage.getItem('lastScanResults');
                      let manualCompetitors: any[] = [];
                      if (existingCache) {
                        try {
                          const cached = JSON.parse(existingCache);
                          manualCompetitors = (cached.competitorIntelligence || []).filter((c: any) => c.isManual);
                          console.log('Refresh: Found manual competitors:', manualCompetitors.length);
                        } catch (e) {
                          console.error('Error loading manual competitors:', e);
                        }
                      }
                      
                      // Merge: scan competitors first, then manual (avoid duplicates by name)
                      const competitorMap = new Map();
                      scanCompetitors.forEach((c: any) => {
                        competitorMap.set(c.name?.toLowerCase(), c);
                      });
                      manualCompetitors.forEach((c: any) => {
                        if (!competitorMap.has(c.name?.toLowerCase())) {
                          competitorMap.set(c.name?.toLowerCase(), c);
                        }
                      });
                      
                      const mergedCompetitors = Array.from(competitorMap.values());
                      setCompetitorIntelligence(mergedCompetitors);
                      setMarketShare(scanResults.data.marketShare || null);
                      setScanUsername(storedUsername);
                      
                      // Update cache with merged data
                      const updatedCache = {
                        ...scanResults.data,
                        competitorIntelligence: mergedCompetitors
                      };
                      localStorage.setItem('lastScanResults', JSON.stringify(updatedCache));
                      
                      // Recalculate analytics with new scan data
                      const updatedAnalytics = await fetchAnalyticsData();
                      setAnalytics(updatedAnalytics);
                      
                      console.log('Data refreshed:', {
                        insights: scanResults.data.strategicInsights?.length || 0,
                        brandDNA: !!scanResults.data.brandDNA,
                        competitors: mergedCompetitors.length,
                        scanCompetitors: scanCompetitors.length,
                        manualCompetitors: manualCompetitors.length,
                        marketShare: !!scanResults.data.marketShare,
                        analytics: updatedAnalytics
                      });
                    } else {
                      console.error('❌ Refresh: API returned success but data is null or undefined');
                    }
                  } catch (error) {
                    console.error('❌ Refresh error:', error);
                    // Don't clear existing data on error
                  }
                } else {
                  console.log('No username found in localStorage');
                }
              }}
              className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-white hover:bg-white/10 transition-colors"
            >
              Refresh Data
            </button>
          </div>

          {/* Global Search Bar */}
          <div className="flex-1 max-w-xl mx-8 hidden md:block group relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-white transition-colors" />
            <input 
              type="text" 
              placeholder="Search content, tasks..." 
              className="w-full bg-[#1A1A1A] border border-white/10 rounded-full py-2 pl-10 pr-4 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 focus:bg-white/5 transition-all"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
               <span className="text-[10px] text-white/20 border border-white/10 rounded px-1.5 py-0.5 font-mono">⌘K</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="flex items-center bg-[#1A1A1A] rounded-full px-3 py-1.5 border border-white/10 hidden lg:flex">
                <span className="text-xs font-medium text-white/60 mr-4">Day</span>
                <span className="text-xs font-medium text-white/40 hover:text-white cursor-pointer mr-4">Week</span>
                <span className="text-xs font-medium text-white/40 hover:text-white cursor-pointer mr-4">Month</span>
                <span className="text-xs font-medium text-white/40 hover:text-white cursor-pointer">Year</span>
             </div>
             
             <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="h-9 w-9 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 text-white/60 relative"
                >
                  <Bell className="w-4 h-4" />
                  <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-black"></span>
                </button>
                
                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute top-full right-0 mt-2 w-80 bg-[#0A0A0A] border border-white/10 rounded-xl shadow-2xl z-50">
                    <div className="p-4 border-b border-white/10">
                      <h3 className="text-sm font-bold text-white">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-white/40 text-sm">No notifications</div>
                      ) : (
                        notifications.map((notif) => (
                          <div key={notif.id} className="p-4 border-b border-white/5 hover:bg-white/5 cursor-pointer">
                            <div className="flex items-start gap-3">
                              <div className={`w-2 h-2 rounded-full mt-2 ${notif.unread ? 'bg-green-400' : 'bg-white/20'}`}></div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-white mb-1">{notif.title}</p>
                                <p className="text-xs text-white/60">{notif.message}</p>
                                <p className="text-[10px] text-white/30 mt-1">{notif.time}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    {notifications.length > 0 && (
                      <div className="p-3 border-t border-white/10">
                        <button
                          onClick={() => {
                            setNotifications(notifications.map(n => ({ ...n, unread: false })));
                          }}
                          className="w-full text-xs text-white/60 hover:text-white text-center"
                        >
                          Mark all as read
                        </button>
                      </div>
                    )}
                  </div>
                )}
             </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-[#050505] custom-scrollbar relative">
            
            {/* 1. DASHBOARD VIEW (Default) */}
            {currentPage === 'dashboard' && (
                <div className="grid grid-cols-12 gap-6 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="col-span-12 lg:col-span-8 space-y-6">
                        {/* Top Metrics - SYSTEM METRICS */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-5">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider">AVG COMPLETION TIME</div>
                                    <TrendingUp className="w-3 h-3 text-white/20" />
                                </div>
                                <div className="flex items-baseline gap-2 mb-1">
                                    <span className="text-2xl font-black text-white">{analytics?.avgCompletionTime || 'N/A'}</span>
                                    {analytics?.avgCompletionTimeChange && (
                                        <span className={`text-xs font-bold ${analytics.avgCompletionTimeChange < 0 ? 'text-red-400' : 'text-white/40'}`}>
                                            {analytics.avgCompletionTimeChange > 0 ? '+' : ''}{analytics.avgCompletionTimeChange}%
                                        </span>
                                    )}
                                </div>
                                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full" style={{ width: `${Math.min(analytics?.avgCompletionTimePercent || 0, 100)}%` }}></div>
                                </div>
                            </div>
                            
                            <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-5">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider">ACTIVE WORKFLOWS</div>
                                    <Zap className="w-3 h-3 text-white/20" />
                                </div>
                                <div className="flex items-baseline gap-2 mb-1">
                                    <span className="text-2xl font-black text-white">{analytics?.activeWorkflows || 0}</span>
                                    {analytics?.activeWorkflowsChange && (
                                        <span className={`text-xs font-bold ${analytics.activeWorkflowsChange > 0 ? 'text-green-400' : 'text-white/40'}`}>
                                            {analytics.activeWorkflowsChange > 0 ? '+' : ''}{analytics.activeWorkflowsChange}
                                        </span>
                                    )}
                                </div>
                                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full" style={{ width: `${Math.min((analytics?.activeWorkflows || 0) / 500 * 100, 100)}%` }}></div>
                                </div>
                            </div>
                            
                            <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-5">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider">GLOBAL ASSET VELOCITY</div>
                                    <Zap className="w-3 h-3 text-white/20" />
                                </div>
                                <div className="flex items-baseline gap-2 mb-1">
                                    <span className="text-2xl font-black text-white">{analytics?.globalAssetVelocity || 'N/A'}</span>
                                    {analytics?.globalAssetVelocityChange && (
                                        <span className={`text-xs font-bold ${analytics.globalAssetVelocityChange > 0 ? 'text-green-400' : 'text-white/40'}`}>
                                            {analytics.globalAssetVelocityChange > 0 ? '+' : ''}{analytics.globalAssetVelocityChange}%
                                        </span>
                                    )}
                                </div>
                                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" style={{ width: `${Math.min(analytics?.globalAssetVelocityPercent || 0, 100)}%` }}></div>
                                </div>
                            </div>
                            
                            <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-5">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider">AI COMPUTE EFFICIENCY</div>
                                    <Sparkles className="w-3 h-3 text-white/20" />
                                </div>
                                <div className="flex items-baseline gap-2 mb-1">
                                    <span className="text-2xl font-black text-white">{analytics?.aiComputeEfficiency || 'N/A'}</span>
                                    {analytics?.aiComputeEfficiencyChange && (
                                        <span className={`text-xs font-bold ${analytics.aiComputeEfficiencyChange > 0 ? 'text-green-400' : 'text-white/40'}`}>
                                            {analytics.aiComputeEfficiencyChange > 0 ? '+' : ''}{analytics.aiComputeEfficiencyChange}%
                                        </span>
                                    )}
                                </div>
                                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full" style={{ width: `${Math.min(analytics?.aiComputeEfficiencyPercent || 0, 100)}%` }}></div>
                                </div>
                            </div>
                        </div>

                        {/* Content Calendar */}
                        <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 min-h-[400px] flex flex-col shadow-xl">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-baseline gap-2">
                                    <h2 className="text-lg font-bold text-white">Content Calendar</h2>
                                    <span className="text-xs text-white/40 font-mono">{new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-white/40">
                                    <Clock className="w-3 h-3" />
                                    <span>Week {Math.ceil((new Date().getTime() - new Date(new Date().getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000))}</span>
                                </div>
                            </div>
                            {loading ? (
                                <div className="flex-1 flex items-center justify-center text-white/40">Loading calendar...</div>
                            ) : calendarEvents.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-center">
                                    <Calendar className="w-12 h-12 text-white/20 mb-4" />
                                    <p className="text-white/40 text-sm mb-2">No scheduled content</p>
                                    <p className="text-white/20 text-xs">Your content calendar will appear here</p>
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-12 mb-4 px-2">
                                        <div className="col-span-3"></div>
                                        <div className="col-span-9 grid grid-cols-9 text-[10px] text-white/30 font-mono text-center">
                                            <div>MON</div><div>TUE</div><div>WED</div><div>THU</div><div>FRI</div><div>SAT</div><div>SUN</div><div>MON</div><div>TUE</div>
                                        </div>
                                    </div>
                                    <div className="space-y-6 relative flex-1">
                                        <div className="absolute inset-0 grid grid-cols-12 pointer-events-none">
                                            <div className="col-span-3 border-r border-white/[0.03]"></div>
                                            <div className="col-span-9 grid grid-cols-9">
                                                {[...Array(9)].map((_,i) => <div key={i} className="border-r border-white/[0.03] h-full"></div>)}
                                            </div>
                                        </div>
                                        {/* Calendar events would be rendered here from real data */}
                                        <div className="text-white/40 text-sm text-center py-8">Calendar events will appear here</div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* AI Strategic Insights */}
                        <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 shadow-xl">
                            <div className="flex items-center gap-2 mb-6">
                                <Sparkles className="w-4 h-4 text-white/60" />
                                <h2 className="text-lg font-bold text-white">AI Strategic Insights</h2>
                            </div>
                            {!strategicInsights || strategicInsights.length === 0 ? (
                                <div className="text-center py-12">
                                    <Sparkles className="w-12 h-12 text-white/20 mx-auto mb-4" />
                                    <p className="text-white/40 text-sm mb-2">No insights available yet</p>
                                    <p className="text-white/20 text-xs">Run a digital footprint scan to generate strategic insights</p>
                                    {process.env.NODE_ENV === 'development' && (
                                        <p className="text-red-400 text-xs mt-2">Debug: strategicInsights = {JSON.stringify(strategicInsights)}</p>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {strategicInsights.map((insight, index) => {
                                        if (!insight || !insight.title) {
                                          console.warn('Invalid insight at index', index, insight);
                                          return null;
                                        }
                                        return <StrategicInsightCard key={`insight-${index}`} insight={insight} />;
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Market Share */}
                        {marketShare && (
                          <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 mb-6">
                            <div className="flex items-center justify-between mb-4">
                              <h2 className="text-lg font-bold text-white">Market Position</h2>
                              <span className="text-[10px] text-white/30 bg-white/5 px-2 py-1 rounded">ESTIMATE</span>
                            </div>
                            <div className="flex items-baseline gap-2 mb-2">
                              <span className="text-4xl font-black text-white">{marketShare.percentage}%</span>
                              <span className="text-sm text-white/40">of {marketShare.industry}</span>
                            </div>
                            <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-3">
                              <div 
                                className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all" 
                                style={{ width: `${Math.min(marketShare.percentage * 10, 100)}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-xs text-white/40">
                              <span>Rank #{marketShare.yourRank || '—'} of {marketShare.totalCreatorsInSpace || '—'}</span>
                              <span className="text-white/30">{marketShare.note}</span>
                            </div>
                          </div>
                        )}

                        {/* Forensic Competitor Intelligence - MATCHING SCREENSHOT */}
                        <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 shadow-xl">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <Target className="w-5 h-5 text-red-500" />
                                    <div>
                                        <h2 className="text-xl font-black text-white uppercase tracking-tight">FORENSIC COMPETITOR INTEL</h2>
                                        <p className="text-xs text-white/40 mt-1">{scanUsername ? 'UPDATED 12m AGO' : 'No scan yet'}</p>
                                    </div>
                                </div>
                                <button 
                                  onClick={() => setShowAddCompetitor(!showAddCompetitor)}
                                  className="px-3 py-1.5 text-xs font-medium text-white/60 hover:text-white border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
                                >
                                  {showAddCompetitor ? 'Cancel' : '+ Add'}
                                </button>
                            </div>
                            
                            {/* Add Competitor Form */}
                            {showAddCompetitor && (
                              <div className="bg-white/[0.02] border border-white/10 rounded-xl p-5 mb-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                <h4 className="text-sm font-bold text-white mb-4">Add New Competitor</h4>
                                
                                {/* Name with Verification */}
                                <div className="mb-4">
                                  <label className="block text-[10px] text-white/40 uppercase tracking-wider mb-1.5">Search Competitor Name *</label>
                                  <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                    <input
                                      type="text"
                                      value={newCompetitor.name}
                                      onChange={(e) => {
                                        const name = e.target.value;
                                        setNewCompetitor({...newCompetitor, name});
                                        setCompetitorVerification(null);
                                        
                                        // Debounced verification
                                        if (competitorSearchTimeout) clearTimeout(competitorSearchTimeout);
                                        if (name.length >= 2) {
                                          const timeout = setTimeout(async () => {
                                            setCompetitorVerification({ isVerifying: true, verified: false });
                                            try {
                                              const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
                                              const response = await fetch(`${API_BASE_URL}/api/verify-competitor`, {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ name, industry: brandDNA?.industry })
                                              });
                                              const data = await response.json();
                                              setCompetitorVerification({
                                                isVerifying: false,
                                                verified: data.verified,
                                                profile: data.profile,
                                                error: data.error
                                              });
                                            } catch (err) {
                                              // Fallback - allow if name is valid format
                                              setCompetitorVerification({
                                                isVerifying: false,
                                                verified: name.length >= 2,
                                                profile: { name: name }
                                              });
                                            }
                                          }, 800);
                                          setCompetitorSearchTimeout(timeout);
                                        }
                                      }}
                                      placeholder="Search for creator, brand, or company..."
                                      className="w-full bg-[#050505] border border-white/10 rounded-lg py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/30"
                                    />
                                    {competitorVerification?.isVerifying && (
                                      <Activity className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 animate-spin" />
                                    )}
                                  </div>
                                </div>

                                {/* Verification Result */}
                                {competitorVerification && !competitorVerification.isVerifying && (
                                  <div className={`mb-4 p-3 rounded-lg border ${
                                    competitorVerification.verified 
                                      ? 'bg-green-500/10 border-green-500/20' 
                                      : 'bg-red-500/10 border-red-500/20'
                                  }`}>
                                    {competitorVerification.verified ? (
                                      <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                                          {competitorVerification.profile?.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2">
                                            <p className="text-sm font-bold text-white">{competitorVerification.profile?.name}</p>
                                            <CheckCircle className="w-4 h-4 text-green-400" />
                                          </div>
                                          {competitorVerification.profile?.bio && (
                                            <p className="text-xs text-white/40">{competitorVerification.profile.bio}</p>
                                          )}
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-2 text-red-300 text-sm">
                                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                        <span>{competitorVerification.error || 'Could not verify this competitor'}</span>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Searching indicator */}
                                {competitorVerification?.isVerifying && (
                                  <div className="mb-4 flex items-center gap-2 text-white/40 text-sm">
                                    <Activity className="w-4 h-4 animate-spin" />
                                    <span>Searching...</span>
                                  </div>
                                )}
                                
                                {/* Threat Level (only show after verification) */}
                                {competitorVerification?.verified && (
                                  <>
                                    <div className="mb-4">
                                      <label className="block text-[10px] text-white/40 uppercase tracking-wider mb-1.5">Threat Level</label>
                                      <div className="flex gap-2">
                                        {['HIGH', 'MEDIUM', 'LOW'].map(level => (
                                          <button
                                            key={level}
                                            onClick={() => setNewCompetitor({...newCompetitor, threatLevel: level as any})}
                                            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                                              newCompetitor.threatLevel === level
                                                ? level === 'HIGH' ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                                : level === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                                : 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                : 'bg-white/5 text-white/40 border border-white/10'
                                            }`}
                                          >
                                            {level}
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                    
                                    {/* Platform Handles (collapsed) */}
                                    <details className="mb-4">
                                      <summary className="text-[10px] text-white/40 uppercase tracking-wider cursor-pointer hover:text-white/60 mb-2">
                                        + Add Platform Handles (optional)
                                      </summary>
                                      <div className="space-y-2 mt-2">
                                        {[
                                          { key: 'xHandle', icon: '𝕏', placeholder: '@username', color: 'bg-white/10' },
                                          { key: 'youtubeChannel', icon: '▶', placeholder: 'Channel name', color: 'bg-red-500/20' },
                                          { key: 'instagramHandle', icon: '📷', placeholder: '@username', color: 'bg-pink-500/20' },
                                          { key: 'tiktokHandle', icon: '♪', placeholder: '@username', color: 'bg-white/10' },
                                          { key: 'linkedinUrl', icon: 'in', placeholder: 'Profile URL', color: 'bg-blue-500/20' },
                                        ].map(({ key, icon, placeholder, color }) => (
                                          <div key={key} className="flex items-center gap-2 bg-[#050505] border border-white/10 rounded-lg p-2">
                                            <div className={`w-6 h-6 rounded ${color} flex items-center justify-center text-xs`}>{icon}</div>
                                            <input
                                              type="text"
                                              value={(newCompetitor as any)[key]}
                                              onChange={(e) => setNewCompetitor({...newCompetitor, [key]: e.target.value})}
                                              placeholder={placeholder}
                                              className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none"
                                            />
                                          </div>
                                        ))}
                                      </div>
                                    </details>
                                  </>
                                )}
                                
                                {/* Actions */}
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => {
                                      setShowAddCompetitor(false);
                                      setNewCompetitor({ name: '', xHandle: '', youtubeChannel: '', linkedinUrl: '', instagramHandle: '', tiktokHandle: '', threatLevel: 'MEDIUM', notes: '' });
                                      setCompetitorVerification(null);
                                    }}
                                    className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white/60 text-xs font-medium rounded-lg transition-colors"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (competitorVerification?.verified) {
                                        const platforms = [];
                                        if (newCompetitor.xHandle) platforms.push('X');
                                        if (newCompetitor.youtubeChannel) platforms.push('YouTube');
                                        if (newCompetitor.linkedinUrl) platforms.push('LinkedIn');
                                        if (newCompetitor.instagramHandle) platforms.push('Instagram');
                                        if (newCompetitor.tiktokHandle) platforms.push('TikTok');
                                        
                                        const newCompetitorData = {
                                          name: competitorVerification.profile?.name || newCompetitor.name,
                                          threatLevel: newCompetitor.threatLevel,
                                          primaryVector: platforms.length > 0 ? platforms.join(', ') : 'General',
                                          theirAdvantage: competitorVerification.profile?.bio || 'Analyzing...',
                                          yourOpportunity: 'Research in progress',
                                          handles: {
                                            x: newCompetitor.xHandle,
                                            youtube: newCompetitor.youtubeChannel,
                                            linkedin: newCompetitor.linkedinUrl,
                                            instagram: newCompetitor.instagramHandle,
                                            tiktok: newCompetitor.tiktokHandle
                                          },
                                          isManual: true // Flag to identify manually added competitors
                                        };
                                        
                                        // Update state
                                        const updatedCompetitors = [...competitorIntelligence, newCompetitorData];
                                        setCompetitorIntelligence(updatedCompetitors);
                                        
                                        // CRITICAL: Save to localStorage immediately
                                        const cachedResults = localStorage.getItem('lastScanResults');
                                        if (cachedResults) {
                                          try {
                                            const cached = JSON.parse(cachedResults);
                                            cached.competitorIntelligence = updatedCompetitors;
                                            localStorage.setItem('lastScanResults', JSON.stringify(cached));
                                          } catch (e) {
                                            console.error('Error saving competitor to cache:', e);
                                          }
                                        } else {
                                          // If no cache exists, create one
                                          const newCache = {
                                            competitorIntelligence: updatedCompetitors,
                                            strategicInsights: strategicInsights,
                                            brandDNA: brandDNA,
                                            marketShare: marketShare
                                          };
                                          localStorage.setItem('lastScanResults', JSON.stringify(newCache));
                                        }
                                        
                                        setNewCompetitor({ name: '', xHandle: '', youtubeChannel: '', linkedinUrl: '', instagramHandle: '', tiktokHandle: '', threatLevel: 'MEDIUM', notes: '' });
                                        setCompetitorVerification(null);
                                        setShowAddCompetitor(false);
                                      }
                                    }}
                                    disabled={!competitorVerification?.verified}
                                    className="flex-1 py-2.5 bg-green-500 hover:bg-green-400 disabled:bg-white/10 disabled:text-white/30 disabled:cursor-not-allowed text-black text-xs font-bold rounded-lg transition-colors"
                                  >
                                    Add Competitor
                                  </button>
                                </div>
                              </div>
                            )}
                            
                            {!competitorIntelligence || competitorIntelligence.length === 0 ? (
                                <div className="text-center py-12">
                                    <Target className="w-12 h-12 text-white/20 mx-auto mb-4" />
                                    <p className="text-white/40 text-sm mb-2">No competitors identified yet</p>
                                    <p className="text-white/20 text-xs">Run a digital footprint scan to identify competitors</p>
                                    {process.env.NODE_ENV === 'development' && (
                                        <p className="text-red-400 text-xs mt-2">Debug: competitorIntelligence = {competitorIntelligence?.length || 0} items</p>
                                    )}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {competitorIntelligence.map((competitor: any, index: number) => (
                                        <ForensicCompetitorCard 
                                          key={`competitor-${index}`} 
                                          competitor={competitor}
                                          onRemove={() => {
                                            setCompetitorIntelligence(competitorIntelligence.filter((_, i) => i !== index));
                                          }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="col-span-12 lg:col-span-4 space-y-6">
                        {/* Brand DNA */}
                        <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 relative overflow-hidden shadow-lg">
                            <h3 className="text-sm font-bold text-white mb-6">Brand DNA</h3>
                            {!brandDNA ? (
                                <div className="text-center py-12 text-white/40">
                                    <Sparkles className="w-12 h-12 text-white/20 mx-auto mb-4" />
                                    <p className="text-sm mb-2">No brand DNA extracted yet</p>
                                    <p className="text-xs text-white/20">Run a digital footprint scan</p>
                                    {process.env.NODE_ENV === 'development' && (
                                        <p className="text-red-400 text-xs mt-2">Debug: brandDNA = {brandDNA ? 'exists' : 'null'}</p>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {/* Archetype */}
                                    <div>
                                        <div className="text-[10px] font-bold text-white/30 uppercase tracking-wider mb-2">ARCHETYPE</div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                                            <span className="text-sm text-white">• {brandDNA.archetype || 'The Architect'}</span>
                                        </div>
                                    </div>
                                    
                                    {/* Voice Tone */}
                                    <div>
                                        <div className="text-[10px] font-bold text-white/30 uppercase tracking-wider mb-3">VOICE TONE</div>
                                        <div className="flex flex-wrap gap-2">
                                            {(brandDNA.voice?.tones || ['Systematic', 'Transparent', 'Dense']).map((tone: string, index: number) => (
                                                <button
                                                    key={index}
                                                    className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                                                        index === 0 
                                                            ? 'bg-white/10 text-white border border-white/20' 
                                                            : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                                                    }`}
                                                >
                                                    {tone}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    {/* Core Pillars */}
                                    <div>
                                        <div className="text-[10px] font-bold text-white/30 uppercase tracking-wider mb-3">CORE PILLARS</div>
                                        <div className="space-y-2">
                                            {(brandDNA.corePillars || ['Automated Content Scale', 'Forensic Brand Analysis', 'Enterprise Reliability']).map((pillar: string, index: number) => (
                                                <div key={index} className="flex items-center gap-2 text-sm text-white">
                                                    <span className="text-white/40">•</span>
                                                    <span>{pillar}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Content Velocity - MATCHING SCREENSHOT */}
                        <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 relative overflow-hidden shadow-lg">
                            <div className="flex justify-between items-start mb-6 relative z-10">
                                <div>
                                    <h3 className="text-sm font-bold text-white">Content Velocity</h3>
                                    <p className="text-[10px] text-white/40">Team: Global Marketing</p>
                                </div>
                            </div>
                            {loading ? (
                                <div className="text-center py-12 text-white/40">Loading...</div>
                            ) : contentPipeline ? (
                                <div className="flex items-center gap-8 relative z-10">
                                    {/* Donut Chart */}
                                    <div className="relative w-32 h-32 flex-shrink-0">
                                        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                                            {/* Background circle */}
                                            <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                                            {/* Published (72%) - Blue */}
                                            <circle 
                                                cx="50" cy="50" r="40" fill="none" 
                                                stroke="#3b82f6" strokeWidth="8" 
                                                strokeDasharray={`${2 * Math.PI * 40 * 0.72} ${2 * Math.PI * 40}`}
                                                strokeDashoffset="0"
                                                strokeLinecap="round"
                                            />
                                            {/* Drafting (remaining visible) - Gray */}
                                            <circle 
                                                cx="50" cy="50" r="40" fill="none" 
                                                stroke="rgba(255,255,255,0.1)" strokeWidth="8" 
                                                strokeDasharray={`${2 * Math.PI * 40 * 0.28} ${2 * Math.PI * 40}`}
                                                strokeDashoffset={`-${2 * Math.PI * 40 * 0.72}`}
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="text-center">
                                                <div className="text-2xl font-black text-blue-400">72%</div>
                                                <div className="text-[9px] text-white/40 uppercase tracking-wider">Published</div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Legend */}
                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                                <span className="text-xs text-white/60">Published</span>
                                            </div>
                                            <span className="text-sm font-bold text-white">{contentPipeline.published || 128}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                                <span className="text-xs text-white/60">Drafting</span>
                                            </div>
                                            <span className="text-sm font-bold text-white">{contentPipeline.drafting || 390}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                                                <span className="text-xs text-white/60">Scheduled</span>
                                            </div>
                                            <span className="text-sm font-bold text-white">{contentPipeline.scheduled || 250}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                                <span className="text-xs text-white/60">Needs Review</span>
                                            </div>
                                            <span className="text-sm font-bold text-white">{contentPipeline.needsReview || 22}</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12 text-white/40">
                                    <FileText className="w-12 h-12 text-white/20 mx-auto mb-4" />
                                    <p className="text-sm mb-2">No content yet</p>
                                    <p className="text-xs text-white/20">Create your first piece of content</p>
                                </div>
                            )}
                        </div>

                        {/* Tasks & Activity */}
                        <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 min-h-[400px] flex flex-col shadow-lg">
                            <div className="flex items-center gap-6 mb-6 border-b border-white/10 pb-0">
                                <button onClick={() => setActiveTab('tasks')} className={`text-sm font-bold pb-4 border-b-2 transition-all ${activeTab === 'tasks' ? 'text-white border-green-500' : 'text-white/40 border-transparent'}`}>Tasks</button>
                                <button onClick={() => setActiveTab('activity')} className={`text-sm font-bold pb-4 border-b-2 transition-all ${activeTab === 'activity' ? 'text-white border-green-500' : 'text-white/40 border-transparent'}`}>Recent Activity</button>
                            </div>
                            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                {activeTab === 'tasks' ? (
                                    <div className="space-y-4">
                                        <form onSubmit={handleAddTask} className="flex gap-2 mb-4">
                                            <input ref={taskInputRef} type="text" value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} placeholder="Add a new task..." className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-green-500/50" />
                                            <button type="submit" disabled={!newTaskTitle.trim()} className="bg-white/10 hover:bg-green-500/20 text-white hover:text-green-500 disabled:opacity-50 p-2 rounded-lg"><Plus className="w-4 h-4" /></button>
                                        </form>
                                        {tasks.map(task => (
                                            <div key={task.id} className={`group flex items-start gap-3 p-3 rounded-xl border transition-all duration-300 cursor-pointer ${task.completed ? 'bg-white/[0.01] border-white/[0.02] opacity-60' : 'bg-white/[0.02] border-white/[0.05] hover:border-white/10'}`}>
                                                <button onClick={(e) => { e.stopPropagation(); toggleTask(task.id); }} className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center transition-all duration-300 ${task.completed ? 'bg-green-500 border-green-500 scale-100' : 'border-white/30 hover:border-white/60 bg-transparent'}`}>
                                                    <CheckCircle2 className={`w-3 h-3 text-black transform transition-all duration-300 ${task.completed ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`} />
                                                </button>
                                                <div className="flex-1 min-w-0" onClick={() => handleTaskClick(task)}>
                                                    <div className={`text-xs font-medium truncate ${task.completed ? 'text-white/30 line-through' : 'text-white'}`}>{task.title}</div>
                                                    <div className="flex items-center gap-2 mt-2"><span className={`text-[9px] px-1.5 py-0.5 rounded border font-medium ${task.priority === 'High' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-orange-500/10 border-orange-500/20 text-orange-400'}`}>{task.priority}</span><span className="text-[9px] text-white/30 flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> {task.due}</span></div>
                                                </div>
                                                <button className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                                            </div>
                                        ))}
                                        {tasks.length === 0 && <div className="text-center py-10"><p className="text-white/40 text-xs">No tasks yet</p><button onClick={() => taskInputRef.current?.focus()} className="mt-2 text-green-500 text-xs font-bold">Add Task</button></div>}
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="text-[10px] text-white/40 mb-2 font-mono">TODAY</div>
                                        {loading ? (
                                            <div className="text-center py-8 text-white/40 text-xs">Loading activity...</div>
                                        ) : (
                                            <div className="text-center py-8 text-white/40 text-xs">No recent activity</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 2. COMPETITOR INTELLIGENCE VIEW */}
            {currentPage === 'competitors' && (
                <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-black text-white tracking-tight mb-2">Competitor Intelligence</h1>
                            <p className="text-white/40 text-sm">Real-time analysis of your top 3 rivals in the <span className="text-white">Generative Content</span> sector.</p>
                        </div>
                        <div className="flex gap-2">
                             <button className="px-4 py-2 bg-[#1A1A1A] border border-white/10 rounded-lg text-xs font-bold text-white hover:bg-white/5 transition-colors">Export Report</button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Competitor 1 */}
                        <CompetitorCard 
                            name="HyperGraph AI"
                            category="Automated Clipping"
                            share="18.5%"
                            trend="up"
                            strategy="High-volume short-form video spamming across TikTok & Shorts."
                            frequency="Daily (15x)"
                            ourEdge="We have better context-aware editing and brand voice consistency."
                            theirEdge="They are faster at raw processing speed (approx 20% faster)."
                            color="blue"
                        />
                         {/* Competitor 2 */}
                        <CompetitorCard 
                            name="CopyStream"
                            category="Text Generation"
                            share="12.2%"
                            trend="down"
                            strategy="SEO-heavy long-form articles and programmatic landing pages."
                            frequency="Weekly (50x)"
                            ourEdge="Our multi-modal capabilities (Video/Audio) vs their text-only focus."
                            theirEdge="Deep integration with legacy CMS platforms."
                            color="purple"
                        />
                         {/* Competitor 3 */}
                        <CompetitorCard 
                            name="ViralPulse"
                            category="Trend Jacking"
                            share="9.8%"
                            trend="up"
                            strategy="Real-time trend scraping and meme-template generation."
                            frequency="Hourly (Reactive)"
                            ourEdge="Enterprise-grade governance and brand safety features."
                            theirEdge="Higher viral coefficient on B2C platforms."
                            color="orange"
                        />
                    </div>

                    {/* Comparison Matrix */}
                    <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-8">
                        <h3 className="text-lg font-bold text-white mb-6">Strategic Positioning Map</h3>
                        <div className="relative w-full h-[400px] bg-[#050505] rounded-xl border border-white/5 p-6 overflow-hidden">
                             {/* Grid Lines */}
                             <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 divide-x divide-y divide-white/[0.03]"></div>
                             
                             {/* Axes */}
                             <div className="absolute left-6 bottom-6 top-6 w-[1px] bg-white/20"></div>
                             <div className="absolute left-6 bottom-6 right-6 h-[1px] bg-white/20"></div>
                             <div className="absolute left-2 bottom-[50%] -rotate-90 text-[10px] font-bold text-white/40 tracking-widest origin-left">QUALITY</div>
                             <div className="absolute bottom-2 left-[50%] text-[10px] font-bold text-white/40 tracking-widest">VELOCITY</div>

                             {/* Bubbles */}
                             <div className="absolute top-[20%] right-[30%] flex flex-col items-center group cursor-pointer">
                                 <div className="w-16 h-16 rounded-full bg-orange-500/20 border border-orange-500 flex items-center justify-center shadow-[0_0_30px_rgba(255,94,30,0.3)] animate-pulse-slow">
                                     <div className="w-4 h-4 rounded-full bg-orange-500"></div>
                                 </div>
                                 <span className="mt-2 text-xs font-bold text-white bg-black/50 px-2 py-0.5 rounded">US (AIBC)</span>
                             </div>

                             <div className="absolute bottom-[30%] right-[20%] flex flex-col items-center">
                                 <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/50 flex items-center justify-center">
                                     <div className="text-[8px] font-bold text-blue-500">HG</div>
                                 </div>
                                 <span className="mt-1 text-[10px] text-white/40">HyperGraph</span>
                             </div>

                              <div className="absolute top-[40%] left-[30%] flex flex-col items-center">
                                 <div className="w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/50 flex items-center justify-center">
                                     <div className="text-[8px] font-bold text-purple-500">CS</div>
                                 </div>
                                 <span className="mt-1 text-[10px] text-white/40">CopyStream</span>
                             </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Content Hub */}
            {currentPage === 'contentHub' && <ContentHubView />}

            {/* Strategy */}
            {currentPage === 'strategy' && <StrategyView />}

            {/* Production Room */}
            {currentPage === 'production' && (
              <FeatureLock 
                feature="content_generation" 
                requiredTier={SubscriptionTier.PRO}
                onNavigate={onNavigate}
              >
                <ProductionRoomView />
              </FeatureLock>
            )}

            {/* Calendar */}
            {currentPage === 'calendar' && <CalendarView />}

            {/* Analytics */}
            {currentPage === 'analytics' && <AnalyticsView />}

            {/* Brand Assets */}
            {currentPage === 'assets' && <BrandAssetsView />}

            {/* Integrations */}
            {currentPage === 'integrations' && <IntegrationsView />}

            {/* Settings */}
            {currentPage === 'settings' && <SettingsView onLogout={() => onNavigate(ViewState.LANDING)} onNavigate={onNavigate} />}

        </main>

        {/* TASK EDIT MODAL */}
        {selectedTask && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedTask(null)}></div>
            <div className="relative w-full max-w-lg bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                <button onClick={() => setSelectedTask(null)} className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
                <h2 className="text-lg font-bold text-white mb-6">Edit Task</h2>
                <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">Title</label>
                      <input type="text" value={selectedTask.title} onChange={(e) => handleModalChange('title', e.target.value)} className="w-full bg-[#050505] border border-white/10 rounded-lg p-3 text-sm text-white focus:border-white/30 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">Description</label>
                      <textarea value={selectedTask.description || ''} onChange={(e) => handleModalChange('description', e.target.value)} rows={3} className="w-full bg-[#050505] border border-white/10 rounded-lg p-3 text-sm text-white focus:border-white/30 focus:outline-none resize-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">Priority</label>
                          <select value={selectedTask.priority} onChange={(e) => handleModalChange('priority', e.target.value)} className="w-full bg-[#050505] border border-white/10 rounded-lg p-3 text-sm text-white focus:border-white/30 focus:outline-none appearance-none">
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">Due Date</label>
                          <input 
                            type="date" 
                            value={selectedTask.dueDate ? new Date(selectedTask.dueDate).toISOString().split('T')[0] : ''} 
                            onChange={(e) => {
                              const date = new Date(e.target.value);
                              handleModalChange('dueDate', date);
                              handleModalChange('due', date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
                            }} 
                            className="w-full bg-[#050505] border border-white/10 rounded-lg p-3 text-sm text-white focus:border-white/30 focus:outline-none [color-scheme:dark]" 
                          />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">Time</label>
                          <input 
                            type="time" 
                            value={selectedTask.dueTime || '09:00'} 
                            onChange={(e) => handleModalChange('dueTime', e.target.value)} 
                            className="w-full bg-[#050505] border border-white/10 rounded-lg p-3 text-sm text-white focus:border-white/30 focus:outline-none [color-scheme:dark]" 
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">Email</label>
                          <input 
                            type="email" 
                            value={selectedTask.notificationEmail || ''} 
                            onChange={(e) => handleModalChange('notificationEmail', e.target.value)} 
                            placeholder="your@email.com"
                            className="w-full bg-[#050505] border border-white/10 rounded-lg p-3 text-sm text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none" 
                          />
                        </div>
                    </div>
                    
                    {/* Notification Options */}
                    <div className="flex gap-4 pt-2">
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={selectedTask.emailNotification || false}
                          onChange={(e) => handleModalChange('emailNotification', e.target.checked)}
                          className="w-4 h-4 rounded border-white/20 bg-white/5 text-green-500 focus:ring-green-500/20"
                        />
                        <span className="text-xs text-white/60 group-hover:text-white">Email reminder</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={selectedTask.addToCalendar || false}
                          onChange={(e) => handleModalChange('addToCalendar', e.target.checked)}
                          className="w-4 h-4 rounded border-white/20 bg-white/5 text-green-500 focus:ring-green-500/20"
                        />
                        <span className="text-xs text-white/60 group-hover:text-white">Add to Google Calendar</span>
                      </label>
                    </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                    <button onClick={() => setSelectedTask(null)} className="px-4 py-2 rounded-lg border border-white/10 text-xs font-bold uppercase tracking-widest text-white hover:bg-white/5 transition-colors">Cancel</button>
                    <button onClick={handleSaveTask} className="px-6 py-2 rounded-lg bg-green-500 hover:bg-green-400 text-black text-xs font-bold uppercase tracking-widest transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)]">Save Changes</button>
                </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* --- Competitor Components --- */

const CompetitorCard = ({ name, category, share, trend, strategy, frequency, ourEdge, theirEdge, color }: any) => {
    const colorStyles = {
        blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
        purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
        orange: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' },
    }[color as 'blue' | 'purple' | 'orange'] || { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/20' };

    return (
        <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all hover:-translate-y-1 group relative overflow-hidden">
             {/* Header */}
             <div className="flex justify-between items-start mb-6">
                 <div className="flex items-center gap-3">
                     <div className={`w-12 h-12 rounded-xl ${colorStyles.bg} flex items-center justify-center font-bold text-xl ${colorStyles.text}`}>
                         {name[0]}
                     </div>
                     <div>
                         <h3 className="font-bold text-lg text-white">{name}</h3>
                         <span className="text-xs text-white/40">{category}</span>
                     </div>
                 </div>
                 <div className="text-right">
                     <div className="text-xl font-bold text-white">{share}</div>
                     <div className={`text-[10px] font-bold ${trend === 'up' ? 'text-green-500' : 'text-red-500'} flex items-center justify-end gap-0.5`}>
                         {trend === 'up' ? '▲' : '▼'} Market Share
                     </div>
                 </div>
             </div>

             {/* Details */}
             <div className="space-y-4 mb-6">
                 <div>
                     <div className="text-[10px] font-bold text-white/30 uppercase tracking-wider mb-1">Content Strategy</div>
                     <p className="text-sm text-white/80 leading-relaxed">{strategy}</p>
                 </div>
                 <div>
                     <div className="text-[10px] font-bold text-white/30 uppercase tracking-wider mb-1">Frequency</div>
                     <div className="flex items-center gap-2">
                         <Activity className="w-3 h-3 text-white/40" />
                         <span className="text-sm text-white font-mono">{frequency}</span>
                     </div>
                 </div>
             </div>

             {/* Battle Card */}
             <div className="bg-white/[0.03] rounded-xl p-4 space-y-3">
                 <div className="flex gap-3">
                     <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                         <Target className="w-3 h-3 text-green-500" />
                     </div>
                     <div>
                         <div className="text-[10px] font-bold text-green-500 uppercase tracking-wider mb-0.5">Our Edge</div>
                         <p className="text-xs text-white/70">{ourEdge}</p>
                     </div>
                 </div>
                 <div className="w-full h-[1px] bg-white/5"></div>
                 <div className="flex gap-3">
                     <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                         <ShieldAlert className="w-3 h-3 text-red-500" />
                     </div>
                     <div>
                         <div className="text-[10px] font-bold text-red-500 uppercase tracking-wider mb-0.5">Their Edge</div>
                         <p className="text-xs text-white/70">{theirEdge}</p>
                     </div>
                 </div>
             </div>
        </div>
    )
}

/* --- Helpers for Dashboard --- */
const ProjectCard = ({ title, subtitle, progress, color, gradient, image }: any) => (
    <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-colors group">
        <div className="flex justify-between items-start mb-4"><div><h3 className="font-bold text-white text-sm">{title}</h3><p className="text-[10px] text-white/40 mt-1">{subtitle}</p></div><MoreHorizontal className="w-4 h-4 text-white/20 hover:text-white cursor-pointer" /></div>
        <div className={`h-24 w-full rounded-lg mb-4 overflow-hidden relative ${gradient ? `bg-gradient-to-br ${gradient}` : 'bg-[#111]'}`}>
            {image && <img src={image} className="w-full h-full object-cover opacity-80" alt="" />}
            {!image && <div className="absolute top-[-20%] left-[-20%] w-20 h-20 rounded-full bg-cyan-500 blur-2xl opacity-40"></div>}
        </div>
        <div className="flex items-center justify-between text-[10px] text-white/40 mb-2"><AvatarGroup count={2} small /><div className="flex items-center gap-1"><Calendar className="w-3 h-3" /> 2 weeks left</div></div>
        <div className="flex items-center justify-between text-[10px] mb-1"><span className="text-white/60">Progress</span><span className="text-white font-mono">{progress}%</span></div>
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden"><div className={`h-full rounded-full w-[${progress}%] ${color === 'emerald' ? 'bg-emerald-500' : 'bg-cyan-500'}`} style={{width: `${progress}%`}}></div></div>
    </div>
);

/* --- Subcomponents --- */

const AnalyticsItem = ({ label, value, trend, trendUp, icon: Icon, sparkline }: any) => (
    <div className="p-5 relative group hover:bg-white/[0.02] transition-colors">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-2 rounded-lg ${trendUp ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                <Icon className="w-4 h-4" />
            </div>
            {sparkline && (
                <svg className="w-16 h-8 opacity-50" viewBox="0 0 60 20">
                    <path d={sparkline} fill="none" stroke={trendUp ? '#10B981' : '#EF4444'} strokeWidth="2" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                </svg>
            )}
        </div>
        <div className="space-y-1">
             <div className="text-2xl font-bold text-white tracking-tight font-mono">{value}</div>
             <div className="flex items-center gap-2">
                 <span className="text-[10px] text-white/40 font-medium uppercase tracking-wider">{label}</span>
                 <span className={`text-[10px] font-bold ${trendUp ? 'text-emerald-500' : 'text-red-500'}`}>{trend}</span>
             </div>
        </div>
    </div>
);

const SidebarItem = ({ label, active, onClick }: { label: string, active?: boolean, onClick: () => void }) => (
    <div onClick={onClick} className={`
      px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-widest cursor-pointer transition-all flex items-center justify-between group h-10
      ${active 
        ? 'bg-gradient-to-r from-pink-900/20 to-purple-900/20 text-white border-l-2 border-pink-500' 
        : 'text-white hover:bg-white/5 border-l-2 border-transparent'}
    `}>
        <span className="text-white">{label}</span>
        {active && <div className="w-1.5 h-1.5 rounded-full bg-pink-500 shadow-[0_0_10px_#EC4899]"></div>}
    </div>
);

const TimelineRow = ({ icon, title, subtitle, children }: any) => (
    <div className="grid grid-cols-12 h-12 items-center px-2 group hover:bg-white/[0.02] rounded-lg transition-colors">
        <div className="col-span-3 flex items-center gap-3 pr-4">
            {icon}
            <div>
                <div className="text-xs font-bold text-white group-hover:text-green-400 transition-colors">{title}</div>
                <div className="text-[10px] text-white/40">{subtitle}</div>
            </div>
        </div>
        <div className="col-span-9 relative h-full flex items-center">
            {children}
        </div>
    </div>
);

const TimelineBar = ({ start, span, color, label, centerLabel, icon, children }: any) => {
    const widthPct = (span / 9) * 100;
    const leftPct = ((start - 1) / 9) * 100;

    return (
        <div 
            className={`absolute h-8 rounded-lg ${color} flex items-center px-2 text-[10px] text-white font-medium border border-white/5 shadow-lg overflow-hidden whitespace-nowrap z-10 hover:brightness-110 cursor-pointer transition-all hover:scale-[1.02] hover:z-20`}
            style={{ width: `calc(${widthPct}% - 4px)`, left: `${leftPct}%` }}
        >
            {centerLabel ? (
                 <div className="w-full flex items-center justify-center gap-1 opacity-70">
                    {icon} {label}
                 </div>
            ) : (
                <div className="flex justify-between items-center w-full">
                    <span className="truncate">{label}</span>
                    <div className="pl-2">{children}</div>
                </div>
            )}
        </div>
    );
};

const AvatarGroup = ({ count, small }: { count: number, small?: boolean }) => (
    <div className={`flex -space-x-1.5 ${small ? 'scale-90 origin-right' : ''}`}>
        <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=32&h=32" className="w-5 h-5 rounded-full border border-[#0A0A0A]" alt="" />
        {count > 1 && (
             <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=32&h=32" className="w-5 h-5 rounded-full border border-[#0A0A0A]" alt="" />
        )}
        {count > 2 && (
             <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=32&h=32" className="w-5 h-5 rounded-full border border-[#0A0A0A]" alt="" />
        )}
    </div>
);

const LegendItem = ({ color, label, value }: any) => (
    <div className="flex items-center justify-between text-[10px]">
        <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${color}`}></div>
            <span className="text-white/60">{label}</span>
        </div>
        <span className="text-white font-mono">{value}</span>
    </div>
);

const ActivityItem = ({ img, name, action, meta, time }: any) => (
    <div className="flex gap-3 relative group">
        <div className="flex-shrink-0 relative">
             <img src={img} className="w-8 h-8 rounded-full border border-white/10" alt={name} />
             <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#0A0A0A] rounded-full flex items-center justify-center">
                 <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
             </div>
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-xs text-white leading-snug">
                <span className="font-bold hover:underline cursor-pointer hover:text-green-400 transition-colors">{name}</span> <span className="text-white/60">{action}</span>
            </p>
            <p className="text-[10px] text-white/40 mt-0.5 truncate group-hover:text-white/60 transition-colors">{meta}</p>
        </div>
        <div className="text-[10px] text-white/30 whitespace-nowrap">{time}</div>
    </div>
);

/* --- Strategic Insight Card --- */
const StrategicInsightCard = ({ insight }: { insight: any }) => {
    // Handle both "HIGH IMPACT" and just "HIGH" formats
    const impactLevel = insight.impact?.toUpperCase() || 'MEDIUM';
    const isHigh = impactLevel.includes('HIGH');
    const isMedium = impactLevel.includes('MEDIUM');
    
    const impactColor = isHigh 
        ? 'bg-red-500/20 text-red-400 border-red-500/30'
        : isMedium 
        ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
        : 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    
    const displayImpact = isHigh ? 'HIGH IMPACT' : isMedium ? 'MEDIUM IMPACT' : 'LOW IMPACT';

    return (
        <div className="bg-white/[0.02] border border-white/10 rounded-xl p-4 hover:border-white/20 transition-all">
            <h3 className="text-sm font-bold text-white mb-2">{insight.title}</h3>
            <p className="text-sm text-white/60 mb-3">{insight.description}</p>
            <div className="flex flex-wrap gap-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${impactColor}`}>
                    {displayImpact}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-white/5 text-white/50 border border-white/10">
                    {insight.effort}
                </span>
            </div>
        </div>
    );
};

/* --- Forensic Competitor Card - MATCHING SCREENSHOT EXACTLY --- */
const ForensicCompetitorCard = ({ competitor, onRemove }: { competitor: any; onRemove?: () => void }) => {
    // Handle both "HIGH" and "HIGH THREAT" formats
    const threatLevel = competitor.threatLevel?.toUpperCase() || 'MEDIUM';
    const isHigh = threatLevel.includes('HIGH');
    const isMedium = threatLevel.includes('MEDIUM');
    
    // Match screenshot: Red glow for HIGH, Yellow for MEDIUM, Blue for LOW
    const borderGlow = isHigh 
        ? 'border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.3)]'
        : isMedium 
        ? 'border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.3)]'
        : 'border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.3)]';
    
    const threatBadgeColor = isHigh 
        ? 'bg-red-500/20 text-red-400 border-red-500/30'
        : isMedium 
        ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
        : 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    
    const displayThreat = isHigh ? 'HIGH THREAT' : isMedium ? 'MEDIUM THREAT' : 'LOW THREAT';
    
    // Extract company name parts (for highlighting like "UPSTART.AI" with .AI in magenta)
    const nameParts = competitor.name?.split('.') || [competitor.name || 'Unknown'];
    const hasDomain = competitor.name?.includes('.');

    return (
        <div className={`bg-[#0A0A0A] border-2 rounded-xl p-5 relative group ${borderGlow} transition-all hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]`}>
            {/* Remove button */}
            {onRemove && (
              <button 
                onClick={onRemove}
                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 p-1.5 hover:bg-white/10 rounded transition-all z-10"
              >
                <X className="w-3.5 h-3.5 text-white/30 hover:text-white" />
              </button>
            )}
            
            {/* Header: Name + Threat Badge */}
            <div className="flex items-start justify-between mb-4">
                <h3 className="text-sm font-black text-white uppercase tracking-tight leading-tight">
                    {hasDomain ? (
                        <>
                            {nameParts[0]}
                            <span className="text-fuchsia-400">.{nameParts[1]}</span>
                        </>
                    ) : (
                        competitor.name?.toUpperCase() || 'UNKNOWN'
                    )}
                </h3>
                <span className={`px-2 py-1 rounded text-[9px] font-bold border ${threatBadgeColor} whitespace-nowrap ml-2`}>
                    {displayThreat}
                </span>
            </div>
            
            {/* PRIMARY VECTOR */}
            <div className="mb-4">
                <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1">PRIMARY VECTOR</div>
                <p className="text-xs text-white font-medium">{competitor.primaryVector || 'Not specified'}</p>
            </div>
            
            {/* THEIR ADVANTAGE */}
            <div className="mb-4">
                <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1">THEIR ADVANTAGE</div>
                <p className="text-xs text-green-400 font-medium leading-relaxed">"{competitor.theirAdvantage || 'Analyzing...'}"</p>
            </div>
            
            {/* YOUR OPPORTUNITY */}
            <div>
                <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1">YOUR OPPORTUNITY</div>
                <p className="text-xs text-purple-400 font-medium leading-relaxed">
                    {competitor.yourOpportunity ? (
                        competitor.yourOpportunity.startsWith('|') 
                            ? competitor.yourOpportunity 
                            : competitor.yourOpportunity.startsWith('Exploit')
                            ? competitor.yourOpportunity
                            : `| ${competitor.yourOpportunity}`
                    ) : '| Research in progress'}
                </p>
            </div>
        </div>
    );
};

export default DashboardView;

