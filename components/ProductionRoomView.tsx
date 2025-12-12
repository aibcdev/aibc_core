import React, { useState, useEffect } from 'react';
import { Mic, Image as ImageIcon, Video, ArrowRight, ChevronDown, MoreHorizontal, Loader2, X, Sparkles, RefreshCw, Calendar, Clock, Zap, Play, Download, CheckCircle } from 'lucide-react';
import { generatePodcast } from '../services/podcastClient';
import { addToInbox } from '../services/inboxService';
import { hasEnoughCredits, deductCredits, CREDIT_COSTS, getCreditBalance, hasProductionAccess, getProductionCreditCost, getUserSubscription, SubscriptionTier } from '../services/subscriptionService';

interface ProductionRequest {
  id: string;
  title: string;
  type: 'audio' | 'image' | 'video';
  duration: 'short' | 'mid' | 'long';
  style: string;
  aspectRatio: string;
  status: 'processing' | 'queued' | 'completed' | 'failed';
  description: string;
  createdAt: Date;
  result?: any;
}

const ProductionRoomView: React.FC = () => {
  // Output type selection
  const [outputType, setOutputType] = useState<'audio' | 'image' | 'video'>('image');
  
  // Duration selection
  const [duration, setDuration] = useState<'short' | 'mid' | 'long'>('mid');
  
  // Aesthetic options
  const [visualStyle, setVisualStyle] = useState('Animation');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  
  // Production queue
  const [productionQueue, setProductionQueue] = useState<ProductionRequest[]>([]);
  const [isRequesting, setIsRequesting] = useState(false);
  
  // Credits
  const [creditBalance, setCreditBalance] = useState({ credits: 50, used: 0 });
  
  // Load existing requests and credits on mount
  useEffect(() => {
    // Load production queue from localStorage
    const savedQueue = localStorage.getItem('productionQueue');
    if (savedQueue) {
      try {
        const parsed = JSON.parse(savedQueue);
        setProductionQueue(parsed.map((item: any) => ({
          ...item,
          createdAt: new Date(item.createdAt)
        })));
      } catch (e) {
        console.error('Error parsing production queue:', e);
      }
    } else {
      // Initialize with demo items
      setProductionQueue([
        {
          id: 'demo_1',
          title: 'Product Showcase V2',
          type: 'video',
          duration: 'mid',
          style: 'Animation',
          aspectRatio: '16:9',
          status: 'processing',
          description: 'Mid-length video, minimalist style...',
          createdAt: new Date(Date.now() - 2 * 60 * 1000)
        },
        {
          id: 'demo_2',
          title: 'Podcast Intro Audio',
          type: 'audio',
          duration: 'short',
          style: 'Energetic',
          aspectRatio: 'N/A',
          status: 'queued',
          description: 'Short audio, energetic tone...',
          createdAt: new Date(Date.now() - 15 * 60 * 1000)
        },
        {
          id: 'demo_3',
          title: 'Social Media Banners',
          type: 'image',
          duration: 'short',
          style: 'Corporate',
          aspectRatio: '1:1',
          status: 'completed',
          description: '5 image variants, corporate style...',
          createdAt: new Date(Date.now() - 60 * 60 * 1000)
        }
      ]);
    }
    
    // Load credit balance
    const balance = getCreditBalance();
    setCreditBalance({ credits: balance.credits, used: balance.used || 0 });
  }, []);
  
  // Save queue to localStorage whenever it changes
  useEffect(() => {
    if (productionQueue.length > 0) {
      localStorage.setItem('productionQueue', JSON.stringify(productionQueue));
    }
  }, [productionQueue]);
  
  // Credit costs based on settings - uses new tiered system
  const getCreditCost = () => {
    return getProductionCreditCost(outputType, duration);
  };
  
  // Check if user has access to the selected output type
  const hasAccessToOutputType = () => {
    if (outputType === 'image') return hasProductionAccess('images');
    if (outputType === 'audio') return hasProductionAccess('audio');
    if (outputType === 'video') return hasProductionAccess('video');
    return false;
  };
  
  // Get required tier for output type
  const getRequiredTier = () => {
    if (outputType === 'video') return 'Pro+ (Enterprise)';
    return 'Pro';
  };
  
  // Calculate wallet utilization
  const getWalletUtilization = () => {
    const total = creditBalance.credits + creditBalance.used;
    if (total === 0) return 0;
    return Math.round((creditBalance.used / total) * 100);
  };
  
  // Format time ago
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays}d ago`;
  };
  
  // Handle request submission
  const handleRequest = async () => {
    const cost = getCreditCost();
    
    // Check feature access first
    if (!hasAccessToOutputType()) {
      alert(`${outputType.charAt(0).toUpperCase() + outputType.slice(1)} production requires ${getRequiredTier()} subscription. Please upgrade to access this feature.`);
      return;
    }
    
    // Check credits
    const balance = getCreditBalance();
    if (balance.credits < cost) {
      alert(`Insufficient credits. You need ${cost} credits but only have ${balance.credits}.`);
      return;
    }
    
    setIsRequesting(true);
    
    try {
      // Determine the correct credit action key
      const creditKey = `${outputType.toUpperCase()}_${duration.toUpperCase()}` as keyof typeof CREDIT_COSTS;
      
      // Create new request
      const newRequest: ProductionRequest = {
        id: `req_${Date.now()}`,
        title: `New ${outputType.charAt(0).toUpperCase() + outputType.slice(1)} - ${visualStyle}`,
        type: outputType,
        duration,
        style: visualStyle,
        aspectRatio: outputType === 'audio' ? 'N/A' : aspectRatio,
        status: 'queued',
        description: `${duration === 'short' ? 'Short' : duration === 'mid' ? 'Mid-length' : 'Long-form'} ${outputType}, ${visualStyle.toLowerCase()} style. Cost: ${cost} credits`,
        createdAt: new Date()
      };
      
      // Add to queue
      setProductionQueue(prev => [newRequest, ...prev]);
      
      // Deduct credits using the correct key
      deductCredits(creditKey in CREDIT_COSTS ? creditKey : 'IMAGE_GENERATION');
      
      // Update balance
      const newBalance = getCreditBalance();
      setCreditBalance({ credits: newBalance.credits, used: (newBalance.used || 0) + cost });
      
      // Add to inbox for admin review - THIS IS THE KEY WORKFLOW
      // Request goes to admin panel, admin completes content, sends back via inbox
      addToInbox({
        type: outputType,
        title: newRequest.title,
        description: `Production request: ${newRequest.description}. User: ${localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!).email : 'unknown'}`,
        preview: null,
        cost,
        status: 'pending_review' // Admin will review and complete
      });
      
      // Show user that request is queued for admin review
      alert(`Request submitted! Your ${outputType} request has been queued for production. You'll receive it in your inbox once completed. Cost: ${cost} credits.`);
      
      // Update status to show it's being processed by team
      setTimeout(() => {
        setProductionQueue(prev => prev.map(item => 
          item.id === newRequest.id ? { ...item, status: 'processing' } : item
        ));
      }, 1000);
      
    } catch (error) {
      console.error('Error creating request:', error);
      alert('Failed to create request. Please try again.');
    } finally {
      setIsRequesting(false);
    }
  };
  
  const visualStyles = [
    'Animation',
    'News',
    'Reality',
    'Storybook',
    'Cinematic',
    'Documentary',
    'Hand-Drawn',
    'Corporate',
    'Minimalist',
    'Retro'
  ];
  
  return (
    <div className="w-full h-full overflow-y-auto p-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Page Header */}
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Production Room</h1>
            <p className="text-base text-white/50">Configure new assets and allocate monthly credits for production.</p>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-8">
          
          {/* Left Column: Request Configuration */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            
            {/* Output Type Selection */}
            <div className="bg-[#111] border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-medium text-white tracking-tight">Output Type</h2>
                <span className="text-xs text-white/40 uppercase tracking-wider font-medium">Select One</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Audio Option */}
                <button 
                  onClick={() => setOutputType('audio')}
                  className={`relative h-32 rounded-lg border transition-all flex flex-col items-center justify-center gap-3 ${
                    outputType === 'audio'
                      ? 'border-orange-500/50 bg-[#0A0A0A]'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  {outputType === 'audio' && (
                    <div className="absolute inset-0 bg-gradient-to-b from-orange-500/10 to-transparent rounded-lg"></div>
                  )}
                  <div className={`p-3 rounded-full transition-colors ${
                    outputType === 'audio' ? 'bg-orange-500 text-white' : 'bg-white/10 text-white/60'
                  }`}>
                    <Mic className="w-5 h-5" />
                  </div>
                  <span className={`text-sm font-medium ${outputType === 'audio' ? 'text-white' : 'text-white/60'}`}>Audio</span>
                </button>

                {/* Image Option */}
                <button 
                  onClick={() => setOutputType('image')}
                  className={`relative h-32 rounded-lg border transition-all flex flex-col items-center justify-center gap-3 ${
                    outputType === 'image'
                      ? 'border-orange-500/50 bg-[#0A0A0A]'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  {outputType === 'image' && (
                    <div className="absolute inset-0 bg-gradient-to-b from-orange-500/10 to-transparent rounded-lg"></div>
                  )}
                  <div className={`p-3 rounded-full transition-colors ${
                    outputType === 'image' ? 'bg-orange-500 text-white' : 'bg-white/10 text-white/60'
                  }`}>
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <span className={`text-sm font-medium ${outputType === 'image' ? 'text-white' : 'text-white/60'}`}>Image</span>
                </button>

                {/* Video Option */}
                <button 
                  onClick={() => setOutputType('video')}
                  className={`relative h-32 rounded-lg border transition-all flex flex-col items-center justify-center gap-3 ${
                    outputType === 'video'
                      ? 'border-orange-500/50 bg-[#0A0A0A]'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  {outputType === 'video' && (
                    <div className="absolute inset-0 bg-gradient-to-b from-orange-500/10 to-transparent rounded-lg"></div>
                  )}
                  <div className={`p-3 rounded-full transition-colors ${
                    outputType === 'video' ? 'bg-orange-500 text-white' : 'bg-white/10 text-white/60'
                  }`}>
                    <Video className="w-5 h-5" />
                  </div>
                  <span className={`text-sm font-medium ${outputType === 'video' ? 'text-white' : 'text-white/60'}`}>Video</span>
                </button>
              </div>
            </div>

            {/* Parameters Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Duration Selection */}
              <div className="bg-[#111] border border-white/10 rounded-xl p-6">
                <h2 className="text-lg font-medium text-white tracking-tight mb-4">Duration</h2>
                <div className="space-y-3">
                  {/* Short */}
                  <button 
                    onClick={() => setDuration('short')}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                      duration === 'short'
                        ? 'border-orange-500/30 bg-orange-500/5'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        duration === 'short' ? 'border-orange-500' : 'border-white/30'
                      }`}>
                        {duration === 'short' && <div className="w-2 h-2 rounded-full bg-orange-500"></div>}
                      </div>
                      <span className={`text-sm ${duration === 'short' ? 'text-white' : 'text-white/60'}`}>Short</span>
                    </div>
                    <span className={`text-xs font-mono ${duration === 'short' ? 'text-orange-400' : 'text-white/40'}`}>
                      {outputType === 'video' ? '2 Credits' : '1 Credit'}
                    </span>
                  </button>

                  {/* Mid Length */}
                  <button 
                    onClick={() => setDuration('mid')}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                      duration === 'mid'
                        ? 'border-orange-500/30 bg-orange-500/5'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        duration === 'mid' ? 'border-orange-500' : 'border-white/30'
                      }`}>
                        {duration === 'mid' && <div className="w-2 h-2 rounded-full bg-orange-500"></div>}
                      </div>
                      <span className={`text-sm ${duration === 'mid' ? 'text-white' : 'text-white/60'}`}>Mid Length</span>
                    </div>
                    <span className={`text-xs font-mono ${duration === 'mid' ? 'text-orange-400' : 'text-white/40'}`}>
                      {outputType === 'video' ? '4 Credits' : '2 Credits'}
                    </span>
                  </button>

                  {/* Long Form */}
                  <button 
                    onClick={() => setDuration('long')}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                      duration === 'long'
                        ? 'border-orange-500/30 bg-orange-500/5'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        duration === 'long' ? 'border-orange-500' : 'border-white/30'
                      }`}>
                        {duration === 'long' && <div className="w-2 h-2 rounded-full bg-orange-500"></div>}
                      </div>
                      <span className={`text-sm ${duration === 'long' ? 'text-white' : 'text-white/60'}`}>Long Form</span>
                    </div>
                    <span className={`text-xs font-mono ${duration === 'long' ? 'text-orange-400' : 'text-white/40'}`}>
                      {outputType === 'video' ? '10 Credits' : '5 Credits'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Aesthetic Configuration */}
              <div className="bg-[#111] border border-white/10 rounded-xl p-6 flex flex-col">
                <h2 className="text-lg font-medium text-white tracking-tight mb-4">Aesthetic</h2>
                <div className="space-y-4 flex-1">
                  {/* Visual Style Dropdown */}
                  <div>
                    <label className="text-xs text-white/40 uppercase font-medium mb-2 block">Visual Style</label>
                    <div className="relative">
                      <select 
                        value={visualStyle}
                        onChange={(e) => setVisualStyle(e.target.value)}
                        className="w-full bg-[#050505] border border-white/10 text-white text-sm rounded-lg p-3 appearance-none focus:outline-none focus:border-white/30 transition-colors cursor-pointer"
                      >
                        {visualStyles.map(style => (
                          <option key={style} value={style}>{style}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
                    </div>
                  </div>
                  
                  {/* Aspect Ratio - Only show for image/video */}
                  {outputType !== 'audio' && (
                    <div>
                      <label className="text-xs text-white/40 uppercase font-medium mb-2 block">Aspect Ratio</label>
                      <div className="flex gap-2">
                        {['16:9', '4:3', '1:1', '9:16'].map(ratio => (
                          <button 
                            key={ratio}
                            onClick={() => setAspectRatio(ratio)}
                            className={`flex-1 py-2 text-sm border rounded-md transition-all ${
                              aspectRatio === ratio
                                ? 'border-white/30 bg-white/10 text-white'
                                : 'border-white/10 bg-[#050505] text-white/50 hover:border-white/20'
                            }`}
                          >
                            {ratio}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Audio-specific options */}
                  {outputType === 'audio' && (
                    <div>
                      <label className="text-xs text-white/40 uppercase font-medium mb-2 block">Audio Format</label>
                      <div className="flex gap-2">
                        {['MP3', 'WAV', 'AAC'].map(format => (
                          <button 
                            key={format}
                            className={`flex-1 py-2 text-sm border rounded-md transition-all ${
                              format === 'MP3'
                                ? 'border-white/30 bg-white/10 text-white'
                                : 'border-white/10 bg-[#050505] text-white/50 hover:border-white/20'
                            }`}
                          >
                            {format}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="bg-[#111] border border-white/10 rounded-xl p-6 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs text-white/40 mb-1">Estimated Cost</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-medium text-white tracking-tight">{getCreditCost()} Credits</span>
                  <span className="text-sm text-white/40">/ request</span>
                </div>
              </div>
              <button 
                onClick={handleRequest}
                disabled={isRequesting || creditBalance.credits < getCreditCost()}
                className="bg-white text-black hover:bg-white/90 disabled:bg-white/20 disabled:text-white/40 disabled:cursor-not-allowed px-8 py-3 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors shadow-lg shadow-white/5"
              >
                {isRequesting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <span>Request</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

          </div>

          {/* Right Column: Stats & Queue */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            
            {/* Credit Visualization */}
            <div className="bg-[#111] border border-white/10 rounded-xl p-6">
              <h3 className="text-base font-medium text-white mb-6">Wallet Overview</h3>
              
              <div className="relative w-48 h-48 mx-auto mb-6 flex items-center justify-center">
                {/* SVG Circle Progress */}
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="96" cy="96" r="88" stroke="#1f1f1f" strokeWidth="12" fill="none" />
                  <circle 
                    cx="96" 
                    cy="96" 
                    r="88" 
                    stroke="#ea580c" 
                    strokeWidth="12" 
                    fill="none" 
                    strokeDasharray="552" 
                    strokeDashoffset={552 - (552 * getWalletUtilization()) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-medium tracking-tighter text-white">{getWalletUtilization()}%</span>
                  <span className="text-xs text-white/40 mt-1 uppercase tracking-wide">Utilized</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-600"></div>
                    <span className="text-white/60">Spent</span>
                  </div>
                  <span className="text-white font-medium">{creditBalance.used} Credits</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-white/30"></div>
                    <span className="text-white/60">Available</span>
                  </div>
                  <span className="text-white font-medium">{creditBalance.credits} Credits</span>
                </div>
              </div>
            </div>

            {/* Production Queue */}
            <div className="bg-[#111] border border-white/10 rounded-xl p-6 flex-1 max-h-[500px] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-medium text-white">Production Queue</h3>
                <button className="text-white/40 hover:text-white transition-colors">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1 overflow-y-auto pr-2 flex-1">
                {productionQueue.length === 0 ? (
                  <div className="text-center py-8">
                    <Sparkles className="w-8 h-8 text-white/20 mx-auto mb-3" />
                    <p className="text-sm text-white/40">No requests yet</p>
                    <p className="text-xs text-white/30 mt-1">Configure and submit a request to get started</p>
                  </div>
                ) : (
                  productionQueue.slice(0, 10).map((item) => (
                    <div 
                      key={item.id}
                      className={`group p-3 rounded-lg border border-transparent hover:border-white/10 hover:bg-white/5 transition-all cursor-pointer ${
                        item.status === 'completed' ? 'opacity-60 hover:opacity-100' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex items-center gap-2">
                          {item.status === 'processing' ? (
                            <>
                              <Loader2 className="w-3 h-3 text-orange-500 animate-spin" />
                              <span className="text-xs font-medium text-orange-500">Processing</span>
                            </>
                          ) : item.status === 'queued' ? (
                            <>
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                              <span className="text-xs font-medium text-blue-500">Queued</span>
                            </>
                          ) : item.status === 'completed' ? (
                            <>
                              <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                              <span className="text-xs font-medium text-green-500">Completed</span>
                            </>
                          ) : (
                            <>
                              <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                              <span className="text-xs font-medium text-red-500">Failed</span>
                            </>
                          )}
                        </div>
                        <span className="text-[10px] text-white/40">{formatTimeAgo(item.createdAt)}</span>
                      </div>
                      <h4 className="text-sm text-white font-medium mb-1">{item.title}</h4>
                      <p className="text-xs text-white/40 line-clamp-1">{item.description}</p>
                      
                      {/* Action buttons for completed items */}
                      {item.status === 'completed' && (
                        <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="flex items-center gap-1 px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-xs text-white transition-colors">
                            <Play className="w-3 h-3" />
                            Preview
                          </button>
                          <button className="flex items-center gap-1 px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-xs text-white transition-colors">
                            <Download className="w-3 h-3" />
                            Download
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
              
              {productionQueue.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/10 text-center">
                  <button 
                    onClick={() => {
                      // Navigate to inbox
                      window.dispatchEvent(new CustomEvent('navigateToPage', { detail: { page: 'inbox' } }));
                    }}
                    className="text-xs text-white/40 hover:text-white transition-colors"
                  >
                    View All Activity
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductionRoomView;
