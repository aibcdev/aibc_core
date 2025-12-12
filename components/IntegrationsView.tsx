import React, { useState, useEffect, useCallback } from 'react';
import { Link2, Check, HelpCircle, Plus, ChevronRight, BarChart2, Linkedin, Instagram, Play, Mic2, Globe, Mail, ShoppingBag, Sparkles, Heart, Zap, ExternalLink, X, Save, Loader2, AlertCircle, CheckCircle, Search } from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  icon: React.ReactNode;
  category: 'analytics' | 'social' | 'blog' | 'email' | 'ads' | 'other';
  connected: boolean;
  handle?: string;
  verifiedName?: string;
  verifiedAvatar?: string;
  description?: string;
  comingSoon?: boolean;
  placeholder?: string;
  syncStatus?: 'syncing' | 'synced' | 'error';
  syncStartedAt?: number;
}

interface VerificationResult {
  verified: boolean;
  name?: string;
  avatar?: string;
  followers?: string;
  bio?: string;
  error?: string;
}

const IntegrationsView: React.FC = () => {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/62bd50d3-9960-40ff-8da7-b4d57e001c2d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'IntegrationsView.tsx:27',message:'IntegrationsView RENDER',data:{timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H6'})}).catch(()=>{});
  // #endregion
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [inputHandle, setInputHandle] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  // Load integrations from localStorage on mount
  const defaultIntegrations: Integration[] = [
    { id: 'ga', name: 'Google Analytics', icon: <BarChart2 className="w-5 h-5 text-amber-400" />, category: 'analytics', connected: false, description: 'Track website traffic and user behavior', placeholder: 'GA Tracking ID (e.g., UA-XXXXXXXX-X)' },
    { id: 'instagram', name: 'Instagram', icon: <Instagram className="w-5 h-5 text-pink-400" />, category: 'social', connected: false, description: 'Post Reels, Stories, and feed content', placeholder: '@username' },
    { id: 'facebook', name: 'Facebook', icon: <span className="text-lg text-blue-500 font-bold">f</span>, category: 'social', connected: false, description: 'Share posts and manage your page', placeholder: 'Page name or URL' },
    { id: 'linkedin', name: 'LinkedIn', icon: <Linkedin className="w-5 h-5 text-blue-400" />, category: 'social', connected: false, description: 'Publish professional content', placeholder: 'Profile URL or username' },
    { id: 'x', name: 'X / Twitter', icon: <span className="text-lg font-bold">𝕏</span>, category: 'social', connected: false, description: 'Post tweets and threads', placeholder: '@username' },
    { id: 'youtube', name: 'YouTube', icon: <Play className="w-5 h-5 text-red-500" />, category: 'social', connected: false, description: 'Upload videos and manage your channel', placeholder: 'Channel name or URL' },
    { id: 'tiktok', name: 'TikTok', icon: <span className="text-lg font-bold">♪</span>, category: 'social', connected: false, description: 'Post short-form videos', placeholder: '@username' },
    { id: 'wordpress', name: 'WordPress', icon: <Globe className="w-5 h-5 text-blue-400" />, category: 'blog', connected: false, description: 'Publish blog posts directly', placeholder: 'Site URL (e.g., yoursite.com)' },
    { id: 'mailchimp', name: 'Mailchimp', icon: <Mail className="w-5 h-5 text-amber-400" />, category: 'email', connected: false, description: 'Send email newsletters', placeholder: 'Account email or list ID' },
    { id: 'threads', name: 'Threads', icon: <span className="text-lg">@</span>, category: 'social', connected: false, comingSoon: true },
    { id: 'pinterest', name: 'Pinterest', icon: <span className="text-red-500 text-lg">P</span>, category: 'social', connected: false, comingSoon: true },
    { id: 'meta-ads', name: 'Meta Ads', icon: <ShoppingBag className="w-5 h-5 text-blue-400" />, category: 'ads', connected: false, comingSoon: true },
  ];

  const loadStoredIntegrations = (): Integration[] => {
    try {
      const stored = localStorage.getItem('integrations');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with defaults to ensure all integrations exist
        // CRITICAL: Always use icon from defaults - icons can't be serialized to JSON
        return defaultIntegrations.map(def => {
          const storedIntegration = parsed.find((p: any) => p.id === def.id);
          if (storedIntegration) {
            // Only copy serializable properties, keep icon from default
            return { 
              ...def, 
              connected: storedIntegration.connected ?? def.connected,
              handle: storedIntegration.handle,
              verifiedName: storedIntegration.verifiedName,
              verifiedAvatar: storedIntegration.verifiedAvatar,
              syncStatus: storedIntegration.syncStatus,
              syncStartedAt: storedIntegration.syncStartedAt
              // icon is NOT copied from stored - always use default
            };
          }
          return def;
        });
      }
    } catch (e) {
      console.error('Error loading stored integrations:', e);
    }
    return defaultIntegrations;
  };

  const [integrations, setIntegrations] = useState<Integration[]>(loadStoredIntegrations());
  
  // Save integrations to localStorage whenever they change
  // CRITICAL: Don't save icon property - React elements can't be serialized
  useEffect(() => {
    const serializableIntegrations = integrations.map(({ icon, ...rest }) => rest);
    localStorage.setItem('integrations', JSON.stringify(serializableIntegrations));
  }, [integrations]);

  const connectedCount = integrations.filter(i => i.connected).length;
  const totalConnectable = integrations.filter(i => !i.comingSoon).length;

  // LLM-based verification fallback (not used, but kept for reference)
  const verifyWithLLM = useCallback(async (handle: string, platform: string) => {
    // This function is not currently used - verifyHandle is used instead
    // Keeping for potential future use
    try {
      const cleanHandle = handle.replace('@', '').trim();
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_BASE_URL}/api/verify-handle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          handle: cleanHandle, 
          platform
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.verified && data.profile) {
          setVerificationResult({
            verified: true,
            name: data.profile.name || data.name || cleanHandle,
            avatar: data.profile.avatar,
            followers: data.profile.followers,
            bio: data.profile.bio
          });
        } else {
          setVerificationResult({
            verified: false,
            error: data.error || 'Could not verify this account. Please check the username.'
          });
        }
      } else {
        simulateVerification(cleanHandle, platform);
      }
    } catch (error) {
      simulateVerification(handle.replace('@', '').trim(), platform);
    }
  }, []);

  // Simulated verification for demo purposes
  const simulateVerification = useCallback((handle: string, platform: string) => {
    // Basic format validation
    const isValidFormat = /^[a-zA-Z0-9._-]{2,30}$/.test(handle);
    
    if (!isValidFormat) {
      setVerificationResult({
        verified: false,
        error: 'Invalid username format. Use only letters, numbers, dots, underscores, or hyphens.'
      });
      return;
    }

    // Simulate finding the account
    const platformNames: Record<string, string> = {
      'instagram': 'Instagram',
      'linkedin': 'LinkedIn',
      'x': 'X (Twitter)',
      'youtube': 'YouTube',
      'tiktok': 'TikTok',
      'facebook': 'Facebook'
    };

    setVerificationResult({
      verified: true,
      name: handle.charAt(0).toUpperCase() + handle.slice(1),
      followers: Math.floor(Math.random() * 50000 + 1000).toLocaleString(),
      bio: `${platformNames[platform] || 'Social'} creator`
    });
  }, []);

  // Verify handle using LLM/API
  const verifyHandle = useCallback(async (handle: string, platform: string) => {
    if (!handle || handle.length < 2) {
      setVerificationResult(null);
      return;
    }

    setIsVerifying(true);
    setVerificationResult(null);

    try {
      // Call backend to verify the handle
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_BASE_URL}/api/verify-handle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handle: handle.replace('@', ''), platform })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.verified && (data.name || data.profile?.name)) {
          setVerificationResult({
            verified: true,
            name: data.name || data.profile?.name || handle,
            avatar: data.avatar || data.profile?.avatar,
            followers: data.followers || data.profile?.followers,
            bio: data.bio || data.profile?.bio
          });
        } else if (data.error) {
          setVerificationResult({
            verified: false,
            error: data.error || 'Could not verify this account. Please check the username.'
          });
        } else {
          // Fallback: Use simulated verification only if format is valid
          const cleanHandle = handle.replace('@', '').trim();
          if (cleanHandle.length >= 2) {
            simulateVerification(cleanHandle, platform);
          } else {
            setVerificationResult({
              verified: false,
              error: 'Please enter a valid username (at least 2 characters)'
            });
          }
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        // Fallback: Use simulated verification only if format is valid
        const cleanHandle = handle.replace('@', '').trim();
        if (cleanHandle.length >= 2 && /^[a-zA-Z0-9._-]+$/.test(cleanHandle)) {
          simulateVerification(cleanHandle, platform);
        } else {
          setVerificationResult({
            verified: false,
            error: errorData.error || 'Could not verify this account. Please check the username.'
          });
        }
      }
    } catch (error) {
      console.error('Verification error:', error);
      // Fallback to simulated verification (don't show error to user)
      simulateVerification(handle.replace('@', '').trim(), platform);
    }

    setIsVerifying(false);
  }, [simulateVerification]);


  // Debounced handle verification
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    if (inputHandle && selectedIntegration && inputHandle.length >= 2) {
      const timeout = setTimeout(() => {
        verifyHandle(inputHandle, selectedIntegration.id);
      }, 800); // Wait 800ms after user stops typing
      setSearchTimeout(timeout);
    } else {
      setVerificationResult(null);
    }

    return () => {
      if (searchTimeout) clearTimeout(searchTimeout);
    };
  }, [inputHandle, selectedIntegration, verifyHandle]);

  const handleConnect = (integration: Integration) => {
    if (integration.comingSoon) return;
    setSelectedIntegration(integration);
    setInputHandle(integration.handle || '');
    setVerificationResult(integration.handle ? {
      verified: true,
      name: integration.verifiedName || integration.handle
    } : null);
    setShowConnectModal(true);
  };

  const handleConfirmConnect = () => {
    if (selectedIntegration && verificationResult?.verified) {
      const now = Date.now();
      const updatedIntegrations = integrations.map(i => 
        i.id === selectedIntegration.id 
          ? { 
              ...i, 
              connected: true, 
              handle: inputHandle.trim(),
              verifiedName: verificationResult.name,
              verifiedAvatar: verificationResult.avatar,
              syncStatus: 'syncing' as const,
              syncStartedAt: now
            } 
          : i
      );
      setIntegrations(updatedIntegrations);
      
      // Store connected accounts in localStorage for scanning
      const connectedAccounts: Record<string, { handle: string; syncStartedAt: number }> = {};
      updatedIntegrations
        .filter(i => i.connected && i.handle)
        .forEach(i => {
          // Map integration IDs to platform names used by scan
          const platformMap: Record<string, string> = {
            'x': 'twitter',
            'instagram': 'instagram',
            'linkedin': 'linkedin',
            'youtube': 'youtube',
            'tiktok': 'tiktok',
            'facebook': 'facebook'
          };
          const platformName = platformMap[i.id] || i.id;
          if (platformName) {
            connectedAccounts[platformName] = {
              handle: i.handle!.replace('@', '').trim(),
              syncStartedAt: i.syncStartedAt || now
            };
          }
        });
      localStorage.setItem('connectedAccounts', JSON.stringify(connectedAccounts));
      
      // Dispatch event so other components know about the integration
      window.dispatchEvent(new CustomEvent('integrationChanged', { 
        detail: { platform: selectedIntegration.id, handle: inputHandle.trim(), action: 'connected' }
      }));
      
      setShowConnectModal(false);
      setSelectedIntegration(null);
      setInputHandle('');
      setVerificationResult(null);
    }
  };

  const handleDisconnect = () => {
    if (selectedIntegration) {
      setIntegrations(integrations.map(i => 
        i.id === selectedIntegration.id 
          ? { ...i, connected: false, handle: undefined, verifiedName: undefined, verifiedAvatar: undefined } 
          : i
      ));
      setShowConnectModal(false);
      setSelectedIntegration(null);
      setInputHandle('');
      setVerificationResult(null);
    }
  };

  const handleCloseModal = () => {
    setShowConnectModal(false);
    setSelectedIntegration(null);
    setInputHandle('');
    setVerificationResult(null);
    setIsVerifying(false);
  };

  const categorizedIntegrations = {
    analytics: integrations.filter(i => i.category === 'analytics'),
    social: integrations.filter(i => i.category === 'social' && !i.comingSoon),
    blog: integrations.filter(i => i.category === 'blog'),
    email: integrations.filter(i => i.category === 'email'),
    comingSoon: integrations.filter(i => i.comingSoon),
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-white mb-2">Integrations</h1>
          <p className="text-white/40 text-sm">Connect your accounts to autopost content</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full border-4 border-green-500/30 flex items-center justify-center bg-[#0A0A0A]">
            <div className="text-center">
              <span className="text-2xl font-bold text-white">{connectedCount}/{totalConnectable}</span>
              <p className="text-[8px] text-white/40 uppercase">Connected</p>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Pills */}
      <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
        <div className="flex items-center gap-2 px-4 py-2 bg-[#0A0A0A] border border-white/10 rounded-xl flex-shrink-0">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-xs text-white/60">Learns from every post to grow your audience</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-[#0A0A0A] border border-white/10 rounded-xl flex-shrink-0">
          <Heart className="w-4 h-4 text-pink-400" />
          <span className="text-xs text-white/60">Handles posting so you stay consistent</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-[#0A0A0A] border border-white/10 rounded-xl flex-shrink-0">
          <Zap className="w-4 h-4 text-green-400" />
          <span className="text-xs text-white/60">Delivers AI insights to grow your reach</span>
        </div>
      </div>

      {/* Website Traffic Section */}
      <div className="mb-8">
        <h2 className="text-sm font-bold text-white mb-4">Website Traffic</h2>
        <div className="space-y-3">
          {categorizedIntegrations.analytics.map((integration, index) => (
            <IntegrationRow 
              key={integration.id}
              integration={integration}
              index={index + 1}
              onConnect={handleConnect}
              isFirst={true}
            />
          ))}
        </div>
      </div>

      {/* Content Plan Section */}
      <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-6 h-6 rounded bg-purple-500/20 flex items-center justify-center">
            <span className="text-purple-400 text-xs">≡</span>
          </div>
          <h2 className="text-sm font-bold text-white">In your Content Plan</h2>
        </div>
        <p className="text-xs text-white/40 mb-6">Autopilot will create and autopost content for these channels</p>

        {/* Social Media */}
        <div className="mb-6">
          <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">Social Media</h3>
          <div className="space-y-2">
            {categorizedIntegrations.social.map((integration, index) => (
              <IntegrationRow 
                key={integration.id}
                integration={integration}
                index={index + 2}
                onConnect={handleConnect}
              />
            ))}
          </div>
        </div>

        {/* Blog */}
        <div className="mb-6">
          <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">Blog</h3>
          <div className="space-y-2">
            {categorizedIntegrations.blog.map((integration, index) => (
              <IntegrationRow 
                key={integration.id}
                integration={integration}
                index={categorizedIntegrations.social.length + index + 2}
                onConnect={handleConnect}
              />
            ))}
          </div>
        </div>

        {/* Email */}
        <div>
          <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">Email</h3>
          <div className="space-y-2">
            {categorizedIntegrations.email.map((integration, index) => (
              <IntegrationRow 
                key={integration.id}
                integration={integration}
                index={categorizedIntegrations.social.length + categorizedIntegrations.blog.length + index + 2}
                onConnect={handleConnect}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Available to Add Section */}
      <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <ExternalLink className="w-5 h-5 text-white/40" />
          <h2 className="text-sm font-bold text-white">Coming Soon</h2>
        </div>

        <div className="flex flex-wrap gap-3">
          {categorizedIntegrations.comingSoon.map((integration) => (
            <div 
              key={integration.id}
              className="flex items-center gap-2 px-4 py-2 bg-white/[0.02] border border-white/10 rounded-xl opacity-50"
            >
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                {integration.icon}
              </div>
              <span className="text-sm text-white/60">{integration.name}</span>
              <span className="text-[10px] text-white/30 bg-white/5 px-2 py-0.5 rounded">Soon</span>
            </div>
          ))}
        </div>
      </div>

      {/* Connect Modal */}
      {showConnectModal && selectedIntegration && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleCloseModal}></div>
          <div className="relative w-full max-w-md bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <button 
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
                {selectedIntegration.icon}
              </div>
              <h2 className="text-xl font-bold text-white mb-2">
                {selectedIntegration.connected ? 'Edit' : 'Connect'} {selectedIntegration.name}
              </h2>
              <p className="text-sm text-white/40">
                {selectedIntegration.description}
              </p>
            </div>

            {/* Input Field with Search Icon */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">
                {selectedIntegration.name} Handle / ID
              </label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="text"
                  value={inputHandle}
                  onChange={(e) => setInputHandle(e.target.value)}
                  placeholder={selectedIntegration.placeholder || 'Enter username to search...'}
                  className="w-full bg-[#050505] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none"
                  autoFocus
                />
                {isVerifying && (
                  <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 animate-spin" />
                )}
              </div>
            </div>

            {/* Verification Result */}
            {verificationResult && (
              <div className={`mb-4 p-4 rounded-xl border ${
                verificationResult.verified 
                  ? 'bg-green-500/10 border-green-500/20' 
                  : 'bg-red-500/10 border-red-500/20'
              }`}>
                {verificationResult.verified ? (
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                      {verificationResult.avatar ? (
                        <img src={verificationResult.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        verificationResult.name?.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-white">{verificationResult.name}</p>
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      </div>
                      {verificationResult.followers && (
                        <p className="text-xs text-white/40">{verificationResult.followers} followers</p>
                      )}
                      {verificationResult.bio && (
                        <p className="text-xs text-white/50 mt-1 line-clamp-1">{verificationResult.bio}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <p className="text-sm text-red-300">{verificationResult.error}</p>
                  </div>
                )}
              </div>
            )}

            {/* Searching indicator */}
            {isVerifying && (
              <div className="mb-4 flex items-center gap-3 text-white/40">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Searching for account...</span>
              </div>
            )}

            {/* Help text */}
            {!verificationResult && !isVerifying && inputHandle.length > 0 && inputHandle.length < 2 && (
              <p className="text-xs text-white/30 mb-4">
                Type at least 2 characters to search
              </p>
            )}

            <div className="flex gap-3">
              {selectedIntegration.connected && (
                <button
                  onClick={handleDisconnect}
                  className="flex-1 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm font-medium rounded-xl transition-colors"
                >
                  Disconnect
                </button>
              )}
              <button
                onClick={handleCloseModal}
                className={`${selectedIntegration.connected ? '' : 'flex-1'} py-3 px-4 bg-white/5 hover:bg-white/10 text-white/60 text-sm font-medium rounded-xl transition-colors`}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmConnect}
                disabled={!verificationResult?.verified}
                className="flex-1 py-3 bg-green-500 hover:bg-green-400 disabled:bg-white/10 disabled:text-white/30 disabled:cursor-not-allowed text-black text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                {selectedIntegration.connected ? 'Update' : 'Connect'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Integration Row Component
const IntegrationRow: React.FC<{
  integration: Integration;
  index: number;
  onConnect: (integration: Integration) => void;
  isFirst?: boolean;
}> = ({ integration, index, onConnect, isFirst }) => {
  // Calculate sync time remaining
  const getSyncStatus = () => {
    if (!integration.connected) return null;
    if (!integration.syncStartedAt) return { status: 'synced', text: 'Synced' };
    
    const elapsed = Date.now() - integration.syncStartedAt;
    const fifteenMins = 15 * 60 * 1000;
    
    if (elapsed < fifteenMins) {
      const remaining = Math.ceil((fifteenMins - elapsed) / 60000);
      return { status: 'syncing', text: `Syncing (~${remaining} min remaining)` };
    }
    return { status: 'synced', text: 'Synced' };
  };
  
  const syncInfo = getSyncStatus();
  
  return (
    <div className={`flex items-center justify-between p-4 rounded-xl transition-all ${
      isFirst
        ? 'bg-purple-500/10 border-2 border-purple-500/30'
        : 'bg-white/[0.02] border border-white/10 hover:border-white/20'
    }`}>
      <div className="flex items-center gap-4">
        <span className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
          isFirst ? 'bg-green-500 text-black' : 'bg-white/10 text-white/40'
        }`}>
          {index}
        </span>
        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
          {integration.icon}
        </div>
        <div>
          <span className="text-sm font-medium text-white block">{integration.name}</span>
          {integration.connected && integration.handle && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/50">@{integration.handle}</span>
              {syncInfo?.status === 'syncing' ? (
                <span className="text-xs text-amber-400 flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  {syncInfo.text}
                </span>
              ) : (
                <span className="text-xs text-green-400 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  {syncInfo?.text || 'Connected'}
                </span>
              )}
            </div>
          )}
        </div>
        {isFirst && !integration.connected && (
          <span className="text-xs text-purple-400 flex items-center gap-1">
            Next up <ChevronRight className="w-3 h-3" />
          </span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onConnect(integration)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
            integration.connected
              ? 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30'
              : 'bg-orange-500 text-white hover:bg-orange-400'
          }`}
        >
          {integration.connected ? (
            <>
              <CheckCircle className="w-3 h-3" />
              Manage
            </>
          ) : (
            <>
              <Link2 className="w-3 h-3" />
              Connect
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default IntegrationsView;
