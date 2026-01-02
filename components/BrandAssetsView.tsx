import React, { useState, useRef, useEffect } from 'react';
import { Upload, Palette, Type, Image as ImageIcon, FileText, Video, Music, X, Plus, Check, Globe, Trash2, Edit3, Link2, Sparkles, RefreshCw, Save, Clock, Megaphone, Target, Compass, Info, Lock, ChevronDown, Cloud, Bot, Linkedin } from 'lucide-react';
import { getScanResults } from '../services/apiClient';

interface BrandAsset {
  id: string;
  name: string;
  type: 'logo' | 'image' | 'video' | 'document' | 'website' | 'text';
  url?: string;
  fileType?: string;
  addedAt: string;
  lastUpdated: string;
  content?: string;
}

interface BrandColor {
  id: string;
  name: string;
  hex: string;
  usage: string;
}

interface BrandFont {
  id: string;
  name: string;
  style: string;
  usage: string;
}

const BrandAssetsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'materials' | 'media' | 'profile' | 'styles' | 'voice' | 'preferences'>('materials');
  const [preferencesCategory, setPreferencesCategory] = useState<'video' | 'image' | 'social' | 'blog' | 'general'>('video');
  
  // Brand DNA State - Load from scan results
  const [brandDNA, setBrandDNA] = useState<{
    archetype: string;
    voiceTone: string;
    corePillars: string[];
    voice?: any;
    loading: boolean;
  }>({
    archetype: '',
    voiceTone: '',
    corePillars: [],
    loading: true
  });
  const [showAddContextModal, setShowAddContextModal] = useState(false);
  const [showAddColorModal, setShowAddColorModal] = useState(false);
  const [showAddFontModal, setShowAddFontModal] = useState(false);
  const [showWebpageModal, setShowWebpageModal] = useState(false);
  const [showTextModal, setShowTextModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<BrandAsset | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  
  // Add video input handler
  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach((file: File) => {
        const newMaterial: BrandAsset = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: 'video',
          fileType: file.name.split('.').pop()?.toUpperCase() || 'VIDEO',
          addedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          lastUpdated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        };
        setMaterials(prev => [...prev, newMaterial]);
      });
    }
  };

  // Load Brand DNA from scan results
  useEffect(() => {
    const loadBrandDNA = async () => {
      try {
        // Try to get scan ID from localStorage
        const lastScanId = localStorage.getItem('lastScanId');
        if (lastScanId) {
          const results = await getScanResults(lastScanId);
          if (results.success && results.data?.brandDNA) {
            const dna = results.data.brandDNA;
            
            // Extract archetype
            const archetype = dna.archetype || 'The Creator';
            
            // Extract voice tone from voice object
            let voiceTone = 'Professional';
            if (dna.voice) {
              // Use the primary tone from voice.tones array or tone field
              if (dna.voice.tones && dna.voice.tones.length > 0) {
                voiceTone = dna.voice.tones[0];
              } else if (dna.voice.tone) {
                voiceTone = dna.voice.tone;
              } else if (dna.voice.style) {
                voiceTone = dna.voice.style;
              }
            }
            
            // Extract core pillars - make them actionable
            let corePillars: string[] = [];
            if (dna.corePillars && Array.isArray(dna.corePillars) && dna.corePillars.length > 0) {
              corePillars = dna.corePillars.map((pillar: string) => {
                // Make pillars actionable by adding action verbs
                if (!pillar.toLowerCase().startsWith('drive') && 
                    !pillar.toLowerCase().startsWith('build') &&
                    !pillar.toLowerCase().startsWith('create') &&
                    !pillar.toLowerCase().startsWith('empower') &&
                    !pillar.toLowerCase().startsWith('champion') &&
                    !pillar.toLowerCase().startsWith('enhance') &&
                    !pillar.toLowerCase().startsWith('promote')) {
                  // Add action verb based on pillar content
                  if (pillar.toLowerCase().includes('innovation') || pillar.toLowerCase().includes('technology')) {
                    return `Drive ${pillar}`;
                  } else if (pillar.toLowerCase().includes('community') || pillar.toLowerCase().includes('audience')) {
                    return `Build ${pillar}`;
                  } else if (pillar.toLowerCase().includes('experience') || pillar.toLowerCase().includes('travel')) {
                    return `Create ${pillar}`;
                  } else if (pillar.toLowerCase().includes('inclusivity') || pillar.toLowerCase().includes('diversity')) {
                    return `Champion ${pillar}`;
                  } else {
                    return `Strengthen ${pillar}`;
                  }
                }
                return pillar;
              });
            } else if (dna.themes && Array.isArray(dna.themes) && dna.themes.length > 0) {
              // Fallback to themes if corePillars not available
              corePillars = dna.themes.slice(0, 5).map((theme: string) => {
                if (!theme.toLowerCase().startsWith('drive') && 
                    !theme.toLowerCase().startsWith('build') &&
                    !theme.toLowerCase().startsWith('create')) {
                  return `Focus on ${theme}`;
                }
                return theme;
              });
            }
            
            setBrandDNA({
              archetype,
              voiceTone,
              corePillars: corePillars.length > 0 ? corePillars : ['Building brand presence', 'Engaging with audience', 'Creating valuable content'],
              voice: dna.voice,
              loading: false
            });
            return;
          }
        }
        
        // Fallback: Try to get from localStorage scan results
        const scanResultsStr = localStorage.getItem('lastScanResults');
        if (scanResultsStr) {
          try {
            const scanResults = JSON.parse(scanResultsStr);
            if (scanResults.brandDNA) {
              const dna = scanResults.brandDNA;
              const archetype = dna.archetype || 'The Creator';
              let voiceTone = 'Professional';
              if (dna.voice?.tones?.[0]) {
                voiceTone = dna.voice.tones[0];
              } else if (dna.voice?.tone) {
                voiceTone = dna.voice.tone;
              }
              const corePillars = dna.corePillars || dna.themes || ['Building brand presence', 'Engaging with audience', 'Creating valuable content'];
              
              setBrandDNA({
                archetype,
                voiceTone,
                corePillars: corePillars.map((p: string) => {
                  if (!p.toLowerCase().match(/^(drive|build|create|empower|champion|enhance|promote|strengthen|focus)/)) {
                    return `Strengthen ${p}`;
                  }
                  return p;
                }),
                voice: dna.voice,
                loading: false
              });
              return;
            }
          } catch (e) {
            console.error('Error parsing scan results:', e);
          }
        }
        
        // No scan data available
        setBrandDNA({
          archetype: 'Not Scanned',
          voiceTone: 'Unknown',
          corePillars: ['Run a digital footprint scan to discover your Brand DNA'],
          loading: false
        });
      } catch (error) {
        console.error('Error loading Brand DNA:', error);
        setBrandDNA({
          archetype: 'Error Loading',
          voiceTone: 'Unknown',
          corePillars: ['Unable to load Brand DNA. Please run a scan.'],
          loading: false
        });
      }
    };
    
    loadBrandDNA();
  }, []);
  
  // Form states
  const [newWebpage, setNewWebpage] = useState('');
  const [newText, setNewText] = useState('');
  const [newColor, setNewColor] = useState({ name: '', hex: '#10B981', usage: '' });
  const [newFont, setNewFont] = useState({ name: '', style: 'Sans-serif', usage: '' });
  
  // Brand Materials
  const [materials, setMaterials] = useState<BrandAsset[]>([]);
  
  // Brand Profile
  const [brandProfile, setBrandProfile] = useState({
    name: '',
    industry: '',
    description: '',
    website: '',
    targetAudience: '',
    logoUrl: ''
  });
  
  // Brand Colors
  const [colors, setColors] = useState<BrandColor[]>([
    { id: '1', name: 'Primary', hex: '#10B981', usage: 'CTA buttons, highlights' },
    { id: '2', name: 'Secondary', hex: '#8B5CF6', usage: 'Accents, links' },
    { id: '3', name: 'Background', hex: '#050505', usage: 'Main background' },
    { id: '4', name: 'Text', hex: '#FFFFFF', usage: 'Primary text' },
  ]);
  
  // Brand Fonts
  const [fonts, setFonts] = useState<BrandFont[]>([
    { id: '1', name: 'Inter', style: 'Sans-serif', usage: 'Headlines, UI' },
    { id: '2', name: 'Space Grotesk', style: 'Sans-serif', usage: 'Body text' },
  ]);
  
  // Brand Voice
  const [voiceSettings, setVoiceSettings] = useState({
    tone: 'Professional yet approachable',
    personality: ['Confident', 'Knowledgeable', 'Direct', 'Helpful'],
    doThis: ['Use active voice', 'Be specific with numbers', 'Address the reader directly'],
    dontDoThis: ['Use jargon without explanation', 'Be condescending', 'Make empty promises'],
    sampleCopy: 'We help creators build their brand through strategic content that actually works.',
    newTrait: '',
    newDo: '',
    newDont: ''
  });

  // Content Preferences
  const [contentPreferences, setContentPreferences] = useState({
    video: {
      includeInPosts: true,
      includeNarrations: false,
      includeMusic: true,
      brandKitPriority: 'brandKitFirst' as 'brandKitOnly' | 'brandKitFirst' | 'stockOnly',
      reusingVideo: '2weeks' as 'never' | '2weeks' | '1month' | '3months',
      videoCount: 13
    },
    image: {
      includeInPosts: true,
      brandKitPriority: 'brandKitFirst' as 'brandKitOnly' | 'brandKitFirst' | 'stockOnly',
      reusingImages: '2weeks' as 'never' | '2weeks' | '1month' | '3months',
      imageCount: 0
    },
    social: {
      platformSpecific: true,
      includeHashtags: true,
      includeMentions: false
    },
    blog: {
      includeImages: true,
      includeVideos: false,
      wordCount: 'medium' as 'short' | 'medium' | 'long'
    },
    general: {
      autoSave: true,
      notifications: true
    }
  });

  // Load materials and brand assets from localStorage on mount
  // AUTO-POPULATE brand profile from scan results (brandIdentity)
  useEffect(() => {
    try {
      const savedMaterials = localStorage.getItem('brandMaterials');
      if (savedMaterials) {
        setMaterials(JSON.parse(savedMaterials));
      }
      const savedColors = localStorage.getItem('brandColors');
      if (savedColors) {
        setColors(JSON.parse(savedColors));
      }
      const savedFonts = localStorage.getItem('brandFonts');
      if (savedFonts) {
        setFonts(JSON.parse(savedFonts));
      }
      
      // AUTO-POPULATE: Load from scan results first (brandIdentity)
      const scanResultsStr = localStorage.getItem('lastScanResults');
      let autoPopulatedProfile = null;
      
      if (scanResultsStr) {
        try {
          const scanResults = JSON.parse(scanResultsStr);
          const brandIdentity = scanResults.brandIdentity;
          const brandDNA = scanResults.brandDNA;
          
          if (brandIdentity) {
            // Auto-populate from brandIdentity (extracted from website scan)
            autoPopulatedProfile = {
              name: brandIdentity.name || '',
              industry: brandIdentity.industry || '',
              description: brandIdentity.description || brandDNA?.description || '',
              website: scanResults.brandIdentity?.website || localStorage.getItem('lastScannedWebsite') || '',
              targetAudience: brandIdentity.niche || brandDNA?.niche || '',
              logoUrl: brandIdentity.logoUrl || brandDNA?.logoUrl || '' // Logo extracted from website
            };
            console.log('✅ Auto-populated brand profile from scan results:', autoPopulatedProfile);
          }
        } catch (e) {
          console.warn('Error parsing scan results for auto-population:', e);
        }
      }
      
      // Use auto-populated profile if available, otherwise use saved profile
      const savedProfile = localStorage.getItem('brandProfile');
      if (autoPopulatedProfile && Object.values(autoPopulatedProfile).some(v => v)) {
        // Merge with saved profile (saved takes precedence for manual overrides)
        const saved = savedProfile ? JSON.parse(savedProfile) : {};
        setBrandProfile({
          ...autoPopulatedProfile,
          ...saved, // Manual overrides take precedence
          // But if saved is empty, use auto-populated
          name: saved.name || autoPopulatedProfile.name,
          industry: saved.industry || autoPopulatedProfile.industry,
          description: saved.description || autoPopulatedProfile.description,
          website: saved.website || autoPopulatedProfile.website,
          targetAudience: saved.targetAudience || autoPopulatedProfile.targetAudience,
          logoUrl: saved.logoUrl || autoPopulatedProfile.logoUrl,
        });
      } else if (savedProfile) {
        setBrandProfile(JSON.parse(savedProfile));
      }
      
      const savedVoice = localStorage.getItem('brandVoice');
      if (savedVoice) {
        setVoiceSettings(JSON.parse(savedVoice));
      }
    } catch (e) {
      console.error('Error loading brand assets:', e);
    }
  }, []);
  
  // Save materials to localStorage and trigger n8n workflow to update Content Hub
  useEffect(() => {
    if (materials.length >= 0) {
      localStorage.setItem('brandMaterials', JSON.stringify(materials));
      localStorage.setItem('brandColors', JSON.stringify(colors));
      localStorage.setItem('brandFonts', JSON.stringify(fonts));
      
      // Dispatch event to notify Content Hub (local update)
      const event = new CustomEvent('brandAssetsUpdated', {
        detail: {
          materials,
          colors,
          fonts,
          voiceSettings,
          brandProfile,
          contentPreferences
        }
      });
      window.dispatchEvent(event);
      
      // Trigger n8n workflow to update Content Hub (ALL roads lead to Content Hub)
      const username = localStorage.getItem('lastScannedUsername');
      if (username) {
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';
        fetch(`${API_BASE_URL}/api/brand-assets/update`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            materials,
            colors,
            fonts,
            voiceSettings,
            brandProfile,
            contentPreferences,
            username
          })
        }).catch(err => console.warn('[Brand Assets] Failed to trigger Content Hub update:', err));
      }
    }
  }, [materials, colors, fonts, voiceSettings, brandProfile, contentPreferences]);

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'logo': return <ImageIcon className="w-4 h-4 text-amber-400" />;
      case 'image': return <ImageIcon className="w-4 h-4 text-blue-400" />;
      case 'video': return <Video className="w-4 h-4 text-red-400" />;
      case 'document': return <FileText className="w-4 h-4 text-green-400" />;
      case 'website': return <Globe className="w-4 h-4 text-purple-400" />;
      case 'text': return <Type className="w-4 h-4 text-white/60" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'image' | 'video' | 'document') => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const newMaterial: BrandAsset = {
        id: Date.now().toString(),
        name: file.name,
        type: type,
        fileType: file.name.split('.').pop()?.toUpperCase() || 'FILE',
        addedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        lastUpdated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      };
      const updatedMaterials = [...materials, newMaterial];
      setMaterials(updatedMaterials);
      localStorage.setItem('brandMaterials', JSON.stringify(updatedMaterials));
      // Notify Content Hub immediately
      const event = new CustomEvent('brandAssetsUpdated', {
        detail: {
          materials: updatedMaterials,
          colors,
          fonts,
          voiceSettings,
          brandProfile,
          contentPreferences
        }
      });
      window.dispatchEvent(event);
      setShowAddContextModal(false);
    }
  };

  const handleAddWebpage = () => {
    if (newWebpage.trim()) {
      const newMaterial: BrandAsset = {
        id: Date.now().toString(),
        name: newWebpage,
        type: 'website',
        url: newWebpage.startsWith('http') ? newWebpage : `https://${newWebpage}`,
        fileType: 'URL',
        addedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        lastUpdated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      };
      const updatedMaterials = [...materials, newMaterial];
      setMaterials(updatedMaterials);
      localStorage.setItem('brandMaterials', JSON.stringify(updatedMaterials));
      // Notify Content Hub immediately
      const event = new CustomEvent('brandAssetsUpdated', {
        detail: {
          materials: updatedMaterials,
          colors,
          fonts,
          voiceSettings,
          brandProfile,
          contentPreferences
        }
      });
      window.dispatchEvent(event);
      setNewWebpage('');
      setShowWebpageModal(false);
      setShowAddContextModal(false);
    }
  };

  const handleAddText = () => {
    if (newText.trim()) {
      const newMaterial: BrandAsset = {
        id: Date.now().toString(),
        name: `Text - ${newText.substring(0, 30)}...`,
        type: 'text',
        content: newText,
        fileType: 'TEXT',
        addedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        lastUpdated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      };
      const updatedMaterials = [...materials, newMaterial];
      setMaterials(updatedMaterials);
      localStorage.setItem('brandMaterials', JSON.stringify(updatedMaterials));
      // Notify Content Hub immediately
      const event = new CustomEvent('brandAssetsUpdated', {
        detail: {
          materials: updatedMaterials,
          colors,
          fonts,
          voiceSettings,
          brandProfile,
          contentPreferences
        }
      });
      window.dispatchEvent(event);
      setNewText('');
      setShowTextModal(false);
      setShowAddContextModal(false);
    }
  };

  const handleDeleteMaterial = (id: string) => {
    const updatedMaterials = materials.filter(m => m.id !== id);
    setMaterials(updatedMaterials);
    localStorage.setItem('brandMaterials', JSON.stringify(updatedMaterials));
    // Notify Content Hub
    const event = new CustomEvent('brandAssetsUpdated', {
      detail: {
        materials: updatedMaterials,
        colors,
        fonts,
        voiceSettings,
        brandProfile,
        contentPreferences
      }
    });
    window.dispatchEvent(event);
  };

  const handleAddColor = () => {
    if (newColor.name && newColor.hex) {
      const updatedColors = [...colors, { ...newColor, id: Date.now().toString() }];
      setColors(updatedColors);
      localStorage.setItem('brandColors', JSON.stringify(updatedColors));
      // Notify Content Hub
      const event = new CustomEvent('brandAssetsUpdated', {
        detail: {
          materials,
          colors: updatedColors,
          fonts,
          voiceSettings,
          brandProfile,
          contentPreferences
        }
      });
      window.dispatchEvent(event);
      setNewColor({ name: '', hex: '#10B981', usage: '' });
      setShowAddColorModal(false);
    }
  };

  const handleDeleteColor = (id: string) => {
    setColors(colors.filter(c => c.id !== id));
  };

  const handleAddFont = () => {
    if (newFont.name) {
      const updatedFonts = [...fonts, { ...newFont, id: Date.now().toString() }];
      setFonts(updatedFonts);
      localStorage.setItem('brandFonts', JSON.stringify(updatedFonts));
      // Notify Content Hub
      const event = new CustomEvent('brandAssetsUpdated', {
        detail: {
          materials,
          colors,
          fonts: updatedFonts,
          voiceSettings,
          brandProfile,
          contentPreferences
        }
      });
      window.dispatchEvent(event);
      setNewFont({ name: '', style: 'Sans-serif', usage: '' });
      setShowAddFontModal(false);
    }
  };

  const handleDeleteFont = (id: string) => {
    setFonts(fonts.filter(f => f.id !== id));
  };

  const handleAddTrait = () => {
    if (voiceSettings.newTrait.trim()) {
      setVoiceSettings({
        ...voiceSettings,
        personality: [...voiceSettings.personality, voiceSettings.newTrait.trim()],
        newTrait: ''
      });
    }
  };

  const handleRemoveTrait = (trait: string) => {
    setVoiceSettings({
      ...voiceSettings,
      personality: voiceSettings.personality.filter(t => t !== trait)
    });
  };

  const handleSaveProfile = () => {
    localStorage.setItem('brandProfile', JSON.stringify(brandProfile));
    // Notify Content Hub
    const event = new CustomEvent('brandAssetsUpdated', {
      detail: {
        materials,
        colors,
        fonts,
        voiceSettings,
        brandProfile,
        contentPreferences
      }
    });
    window.dispatchEvent(event);
    alert('Brand profile saved! Content Hub will update with new context.');
  };

  const handleSaveVoice = () => {
    localStorage.setItem('brandVoice', JSON.stringify(voiceSettings));
    // Notify Content Hub and trigger content regeneration
    const event = new CustomEvent('brandAssetsUpdated', {
      detail: {
        materials,
        colors,
        fonts,
        voiceSettings,
        brandProfile,
        contentPreferences,
        forceContentRegenerate: true // Force content regeneration when voice changes
      }
    });
    window.dispatchEvent(event);
    
    // Also dispatch strategy update to trigger n8n workflow with new brand voice
    const activeStrategy = JSON.parse(localStorage.getItem('activeContentStrategy') || 'null');
    if (activeStrategy) {
      window.dispatchEvent(new CustomEvent('strategyUpdated', {
        detail: {
          strategy: activeStrategy,
          activeStrategy: activeStrategy,
          forceContentRegenerate: true,
          brandVoice: voiceSettings,
          timestamp: Date.now(),
          source: 'BrandAssetsView',
        }
      }));
    }
    
    alert('Brand voice settings saved! Content Hub will regenerate content with new voice.');
  };

  // Connected accounts state (loaded from localStorage)
  const [connectedAccounts, setConnectedAccounts] = useState<Record<string, boolean>>({
    linkedin: false,
    instagram: false,
    facebook: false,
    x: false,
    youtube: false,
    tiktok: false,
    wordpress: false,
    email: false
  });
  
  // Load connected accounts
  useEffect(() => {
    try {
      const integrations = JSON.parse(localStorage.getItem('integrations') || '{}');
      const connected: Record<string, boolean> = {
        linkedin: integrations.linkedin?.connected || false,
        instagram: integrations.instagram?.connected || false,
        facebook: integrations.facebook?.connected || false,
        x: integrations.x?.connected || integrations.twitter?.connected || false,
        youtube: integrations.youtube?.connected || false,
        tiktok: integrations.tiktok?.connected || false,
        wordpress: integrations.wordpress?.connected || false,
        email: integrations.email?.connected || false
      };
      setConnectedAccounts(connected);
    } catch (e) {
      console.error('Error loading integrations:', e);
    }
  }, []);
  
  const connectedCount = Object.values(connectedAccounts).filter(Boolean).length;
  const totalAccounts = 8;
  
  const navigateToIntegrations = () => {
    window.dispatchEvent(new CustomEvent('navigateToPage', { detail: { page: 'integrations' } }));
  };
  
  // Get brand name from scan results
  const getBrandName = () => {
    try {
      const scanResults = JSON.parse(localStorage.getItem('lastScanResults') || '{}');
      return scanResults.brandDNA?.name || localStorage.getItem('lastScannedUsername') || 'Your Brand';
    } catch (e) {
      return 'Your Brand';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
            {getBrandName().substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{getBrandName()}</h1>
            <p className="text-white/40 text-sm">Brand Profile & Source Materials</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={navigateToIntegrations}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white text-sm font-medium transition-colors"
          >
            <span className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center text-xs text-green-400">{connectedCount}</span>
            Connected Integrations
          </button>
          <button 
            onClick={() => setShowAddContextModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-500 hover:bg-green-400 text-black text-sm font-bold transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add More Context
          </button>
        </div>
      </div>

      {/* Brand Voice Section - Top of Page */}
      <div className="mb-8">
        <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">BRAND VOICE</h2>
          <div className="bg-[#111111] border border-white/10 rounded-xl p-5">
            <p className="text-base text-white/80 leading-relaxed">
              {brandDNA.voice?.description || brandDNA.voice?.summary || (
                brandDNA.archetype && brandDNA.archetype !== 'Not Scanned' && brandDNA.archetype !== 'Error Loading' ? (
                  `The brand voice utilizes a '${brandDNA.archetype}' style. ` +
                  `Communication is characterized by ${brandDNA.voiceTone?.toLowerCase() || 'professional'} messaging ` +
                  `that drives audience engagement. The tone is direct yet accessible, ` +
                  `emphasizing ${brandDNA.corePillars?.[0]?.toLowerCase() || 'value'} and ${brandDNA.corePillars?.[1]?.toLowerCase() || 'innovation'}.`
                ) : 'Run a digital footprint scan to discover your brand voice and communication style.'
              )}
            </p>
          </div>
          
          {/* Brand DNA Quick View */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <div className="text-[10px] font-bold text-white/30 uppercase tracking-wider mb-2">ARCHETYPE</div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                <span className="text-sm text-white">• {brandDNA.archetype || 'Unknown'}</span>
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-white/30 uppercase tracking-wider mb-2">VOICE TONE</div>
              <div className="flex flex-wrap gap-2">
                {(brandDNA.voice?.tones || [brandDNA.voiceTone || 'Professional']).slice(0, 3).map((tone: string, i: number) => (
                  <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-sm text-white/80">
                    {tone}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Source Materials Section - Blaze Style */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Source Materials</h2>
        
        {/* Feature Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white mb-1">AIBC learns your brand weekly</h3>
                <p className="text-xs text-white/40">We scan your site, accounts, and files weekly to keep your brand fresh and content personalized.</p>
              </div>
            </div>
          </div>
          <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center flex-shrink-0">
                <RefreshCw className="w-5 h-5 text-pink-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white mb-1">Keep content fresh</h3>
                <p className="text-xs text-white/40">Keep adding new materials to stay relevant. AI will refine your Brand Profile and suggest new campaigns.</p>
              </div>
            </div>
          </div>
          <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <Cloud className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-bold text-white">Cloud Storage</h3>
                  <button className="text-xs text-green-400 hover:text-green-300 flex items-center gap-1">
                    Connect <Link2 className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-xs text-white/40">Bulk import files as documents in Source Materials, and images & videos in Media Library.</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Connected Accounts Bar */}
        <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-4 flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full border-4 border-green-500/30 flex items-center justify-center">
                <span className="text-xs font-bold text-white">{connectedCount}/{totalAccounts}</span>
              </div>
              <span className="text-sm text-white/60">accounts connected</span>
            </div>
            <div className="flex items-center gap-2">
              {/* LinkedIn */}
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${connectedAccounts.linkedin ? 'bg-blue-500/20' : 'bg-white/5'}`}>
                <Linkedin className={`w-4 h-4 ${connectedAccounts.linkedin ? 'text-blue-400' : 'text-white/30'}`} />
              </div>
              {/* Instagram */}
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${connectedAccounts.instagram ? 'bg-pink-500/20' : 'bg-white/5'}`}>
                <svg className={`w-4 h-4 ${connectedAccounts.instagram ? 'text-pink-400' : 'text-white/30'}`} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </div>
              {/* Facebook */}
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${connectedAccounts.facebook ? 'bg-blue-600/20' : 'bg-white/5'}`}>
                <span className={`font-bold text-sm ${connectedAccounts.facebook ? 'text-blue-500' : 'text-white/30'}`}>f</span>
              </div>
              {/* X/Twitter */}
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${connectedAccounts.x ? 'bg-white/10' : 'bg-white/5'}`}>
                <span className={`font-bold text-sm ${connectedAccounts.x ? 'text-white' : 'text-white/30'}`}>𝕏</span>
              </div>
              {/* YouTube */}
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${connectedAccounts.youtube ? 'bg-red-500/20' : 'bg-white/5'}`}>
                <svg className={`w-4 h-4 ${connectedAccounts.youtube ? 'text-red-500' : 'text-white/30'}`} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </div>
              {/* TikTok */}
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${connectedAccounts.tiktok ? 'bg-white/10' : 'bg-white/5'}`}>
                <Music className={`w-4 h-4 ${connectedAccounts.tiktok ? 'text-white' : 'text-white/30'}`} />
              </div>
              {/* WordPress */}
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${connectedAccounts.wordpress ? 'bg-blue-400/20' : 'bg-white/5'}`}>
                <Globe className={`w-4 h-4 ${connectedAccounts.wordpress ? 'text-blue-400' : 'text-white/30'}`} />
              </div>
              {/* Email */}
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${connectedAccounts.email ? 'bg-amber-500/20' : 'bg-white/5'}`}>
                <span className={`text-sm ${connectedAccounts.email ? 'text-amber-400' : 'text-white/30'}`}>✉</span>
              </div>
            </div>
          </div>
          <button 
            onClick={navigateToIntegrations}
            className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
          >
            Connect Integrations <Link2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tab Navigation - Blaze Style */}
      <div className="flex gap-6 border-b border-white/10 mb-6">
        {[
          { id: 'materials', label: 'Source Materials' },
          { id: 'media', label: 'Images & Video' },
          { id: 'profile', label: 'Brand Profile' },
          { id: 'voice', label: 'Styles & Voice' },
          { id: 'preferences', label: 'Content Preferences' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 text-sm font-medium transition-all border-b-2 -mb-[1px] ${
              activeTab === tab.id 
                ? 'border-orange-500 text-white' 
                : 'border-transparent text-white/40 hover:text-white/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'preferences' && (
        <div className="flex gap-6">
          {/* Left Sidebar */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-2">
              {[
                { id: 'video', label: 'Video', icon: Video },
                { id: 'image', label: 'Image', icon: ImageIcon },
                { id: 'social', label: 'Social Media', icon: Megaphone },
                { id: 'blog', label: 'Blog & Email', icon: FileText },
                { id: 'general', label: 'General', icon: Globe },
              ].map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setPreferencesCategory(cat.id as any)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all mb-1 ${
                      preferencesCategory === cat.id
                        ? 'bg-white/10 text-white border-l-2 border-white'
                        : 'text-white/60 hover:text-white/80 hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {preferencesCategory === 'video' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Video</h2>
                  <button className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 rounded-lg text-sm text-white transition-colors">
                    <Cloud className="w-4 h-4" />
                    Add More Videos
                  </button>
                </div>

                {/* Include video in posts */}
                <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-white">Include video in posts</label>
                    <div className="flex gap-1 bg-white/5 rounded-lg p-1">
                      <button
                        onClick={() => setContentPreferences({
                          ...contentPreferences,
                          video: { ...contentPreferences.video, includeInPosts: true }
                        })}
                        className={`px-4 py-2 rounded-md text-xs font-medium transition-all ${
                          contentPreferences.video.includeInPosts
                            ? 'bg-white text-black'
                            : 'text-white/60 hover:text-white'
                        }`}
                      >
                        On
                      </button>
                      <button
                        onClick={() => setContentPreferences({
                          ...contentPreferences,
                          video: { ...contentPreferences.video, includeInPosts: false }
                        })}
                        className={`px-4 py-2 rounded-md text-xs font-medium transition-all ${
                          !contentPreferences.video.includeInPosts
                            ? 'bg-white text-black'
                            : 'text-white/60 hover:text-white'
                        }`}
                      >
                        Off
                      </button>
                    </div>
                  </div>
                </div>

                {/* Include narrations */}
                <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-white">Include narrations</label>
                    <div className="flex gap-1 bg-white/5 rounded-lg p-1">
                      <button
                        disabled
                        className="px-4 py-2 rounded-md text-xs font-medium text-white/40 cursor-not-allowed flex items-center gap-1"
                      >
                        On
                        <Lock className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => setContentPreferences({
                          ...contentPreferences,
                          video: { ...contentPreferences.video, includeNarrations: false }
                        })}
                        className={`px-4 py-2 rounded-md text-xs font-medium transition-all ${
                          !contentPreferences.video.includeNarrations
                            ? 'bg-white text-black'
                            : 'text-white/60 hover:text-white'
                        }`}
                      >
                        Off
                      </button>
                    </div>
                  </div>
                </div>

                {/* Include music */}
                <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-white">Include music</label>
                    <div className="flex gap-1 bg-white/5 rounded-lg p-1">
                      <button
                        onClick={() => setContentPreferences({
                          ...contentPreferences,
                          video: { ...contentPreferences.video, includeMusic: true }
                        })}
                        className={`px-4 py-2 rounded-md text-xs font-medium transition-all ${
                          contentPreferences.video.includeMusic
                            ? 'bg-white text-black'
                            : 'text-white/60 hover:text-white'
                        }`}
                      >
                        On
                      </button>
                      <button
                        onClick={() => setContentPreferences({
                          ...contentPreferences,
                          video: { ...contentPreferences.video, includeMusic: false }
                        })}
                        className={`px-4 py-2 rounded-md text-xs font-medium transition-all ${
                          !contentPreferences.video.includeMusic
                            ? 'bg-white text-black'
                            : 'text-white/60 hover:text-white'
                        }`}
                      >
                        Off
                      </button>
                    </div>
                  </div>
                </div>

                {/* Brand Kit video priority */}
                <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <label className="text-sm font-medium text-white">Brand Kit video priority</label>
                    <Info className="w-4 h-4 text-white/40" />
                  </div>
                  <p className="text-xs text-white/40 mb-4">Choose between Brand Kit and stock media in content</p>
                  <div className="flex gap-2">
                    {[
                      { value: 'brandKitOnly', label: 'Brand Kit only' },
                      { value: 'brandKitFirst', label: 'Brand Kit first' },
                      { value: 'stockOnly', label: 'Only stock' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setContentPreferences({
                          ...contentPreferences,
                          video: { ...contentPreferences.video, brandKitPriority: option.value as any }
                        })}
                        className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                          contentPreferences.video.brandKitPriority === option.value
                            ? 'bg-white text-black'
                            : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reusing video */}
                <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <label className="text-sm font-medium text-white">Reusing video</label>
                    <Info className="w-4 h-4 text-white/40" />
                  </div>
                  <p className="text-xs text-white/40 mb-4">Set video re-use frequency ({contentPreferences.video.videoCount} videos)</p>
                  <div className="flex gap-2">
                    {[
                      { value: 'never', label: 'Never re-use' },
                      { value: '2weeks', label: 'Re-use after 2 weeks' },
                      { value: '1month', label: 'Re-use after 1 month' },
                      { value: '3months', label: 'Re-use after 3 months' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setContentPreferences({
                          ...contentPreferences,
                          video: { ...contentPreferences.video, reusingVideo: option.value as any }
                        })}
                        className={`px-4 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                          contentPreferences.video.reusingVideo === option.value
                            ? 'bg-white text-black'
                            : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {option.label}
                        {contentPreferences.video.reusingVideo === option.value && (
                          <ChevronDown className="w-3 h-3" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {preferencesCategory === 'image' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Image</h2>
                  <button className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 rounded-lg text-sm text-white transition-colors">
                    <Cloud className="w-4 h-4" />
                    Add More Images
                  </button>
                </div>
                
                <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-white">Include image in posts</label>
                    <div className="flex gap-1 bg-white/5 rounded-lg p-1">
                      <button
                        onClick={() => setContentPreferences({
                          ...contentPreferences,
                          image: { ...contentPreferences.image, includeInPosts: true }
                        })}
                        className={`px-4 py-2 rounded-md text-xs font-medium transition-all ${
                          contentPreferences.image.includeInPosts
                            ? 'bg-white text-black'
                            : 'text-white/60 hover:text-white'
                        }`}
                      >
                        On
                      </button>
                      <button
                        onClick={() => setContentPreferences({
                          ...contentPreferences,
                          image: { ...contentPreferences.image, includeInPosts: false }
                        })}
                        className={`px-4 py-2 rounded-md text-xs font-medium transition-all ${
                          !contentPreferences.image.includeInPosts
                            ? 'bg-white text-black'
                            : 'text-white/60 hover:text-white'
                        }`}
                      >
                        Off
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <label className="text-sm font-medium text-white">Brand Kit image priority</label>
                    <Info className="w-4 h-4 text-white/40" />
                  </div>
                  <p className="text-xs text-white/40 mb-4">Choose between Brand Kit and stock media in content</p>
                  <div className="flex gap-2">
                    {[
                      { value: 'brandKitOnly', label: 'Brand Kit only' },
                      { value: 'brandKitFirst', label: 'Brand Kit first' },
                      { value: 'stockOnly', label: 'Only stock' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setContentPreferences({
                          ...contentPreferences,
                          image: { ...contentPreferences.image, brandKitPriority: option.value as any }
                        })}
                        className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                          contentPreferences.image.brandKitPriority === option.value
                            ? 'bg-white text-black'
                            : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <label className="text-sm font-medium text-white">Reusing images</label>
                    <Info className="w-4 h-4 text-white/40" />
                  </div>
                  <p className="text-xs text-white/40 mb-4">Set image re-use frequency ({contentPreferences.image.imageCount} images)</p>
                  <div className="flex gap-2">
                    {[
                      { value: 'never', label: 'Never re-use' },
                      { value: '2weeks', label: 'Re-use after 2 weeks' },
                      { value: '1month', label: 'Re-use after 1 month' },
                      { value: '3months', label: 'Re-use after 3 months' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setContentPreferences({
                          ...contentPreferences,
                          image: { ...contentPreferences.image, reusingImages: option.value as any }
                        })}
                        className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                          contentPreferences.image.reusingImages === option.value
                            ? 'bg-white text-black'
                            : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {preferencesCategory === 'social' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white mb-6">Social Media</h2>
                
                <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-white">Platform-specific content</label>
                    <div className="flex gap-1 bg-white/5 rounded-lg p-1">
                      <button
                        onClick={() => setContentPreferences({
                          ...contentPreferences,
                          social: { ...contentPreferences.social, platformSpecific: true }
                        })}
                        className={`px-4 py-2 rounded-md text-xs font-medium transition-all ${
                          contentPreferences.social.platformSpecific
                            ? 'bg-white text-black'
                            : 'text-white/60 hover:text-white'
                        }`}
                      >
                        On
                      </button>
                      <button
                        onClick={() => setContentPreferences({
                          ...contentPreferences,
                          social: { ...contentPreferences.social, platformSpecific: false }
                        })}
                        className={`px-4 py-2 rounded-md text-xs font-medium transition-all ${
                          !contentPreferences.social.platformSpecific
                            ? 'bg-white text-black'
                            : 'text-white/60 hover:text-white'
                        }`}
                      >
                        Off
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-white">Include hashtags</label>
                    <div className="flex gap-1 bg-white/5 rounded-lg p-1">
                      <button
                        onClick={() => setContentPreferences({
                          ...contentPreferences,
                          social: { ...contentPreferences.social, includeHashtags: true }
                        })}
                        className={`px-4 py-2 rounded-md text-xs font-medium transition-all ${
                          contentPreferences.social.includeHashtags
                            ? 'bg-white text-black'
                            : 'text-white/60 hover:text-white'
                        }`}
                      >
                        On
                      </button>
                      <button
                        onClick={() => setContentPreferences({
                          ...contentPreferences,
                          social: { ...contentPreferences.social, includeHashtags: false }
                        })}
                        className={`px-4 py-2 rounded-md text-xs font-medium transition-all ${
                          !contentPreferences.social.includeHashtags
                            ? 'bg-white text-black'
                            : 'text-white/60 hover:text-white'
                        }`}
                      >
                        Off
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-white">Include mentions</label>
                    <div className="flex gap-1 bg-white/5 rounded-lg p-1">
                      <button
                        onClick={() => setContentPreferences({
                          ...contentPreferences,
                          social: { ...contentPreferences.social, includeMentions: true }
                        })}
                        className={`px-4 py-2 rounded-md text-xs font-medium transition-all ${
                          contentPreferences.social.includeMentions
                            ? 'bg-white text-black'
                            : 'text-white/60 hover:text-white'
                        }`}
                      >
                        On
                      </button>
                      <button
                        onClick={() => setContentPreferences({
                          ...contentPreferences,
                          social: { ...contentPreferences.social, includeMentions: false }
                        })}
                        className={`px-4 py-2 rounded-md text-xs font-medium transition-all ${
                          !contentPreferences.social.includeMentions
                            ? 'bg-white text-black'
                            : 'text-white/60 hover:text-white'
                        }`}
                      >
                        Off
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {preferencesCategory === 'blog' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white mb-6">Blog & Email</h2>
                
                <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-white">Include images</label>
                    <div className="flex gap-1 bg-white/5 rounded-lg p-1">
                      <button
                        onClick={() => setContentPreferences({
                          ...contentPreferences,
                          blog: { ...contentPreferences.blog, includeImages: true }
                        })}
                        className={`px-4 py-2 rounded-md text-xs font-medium transition-all ${
                          contentPreferences.blog.includeImages
                            ? 'bg-white text-black'
                            : 'text-white/60 hover:text-white'
                        }`}
                      >
                        On
                      </button>
                      <button
                        onClick={() => setContentPreferences({
                          ...contentPreferences,
                          blog: { ...contentPreferences.blog, includeImages: false }
                        })}
                        className={`px-4 py-2 rounded-md text-xs font-medium transition-all ${
                          !contentPreferences.blog.includeImages
                            ? 'bg-white text-black'
                            : 'text-white/60 hover:text-white'
                        }`}
                      >
                        Off
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-white">Include videos</label>
                    <div className="flex gap-1 bg-white/5 rounded-lg p-1">
                      <button
                        onClick={() => setContentPreferences({
                          ...contentPreferences,
                          blog: { ...contentPreferences.blog, includeVideos: true }
                        })}
                        className={`px-4 py-2 rounded-md text-xs font-medium transition-all ${
                          contentPreferences.blog.includeVideos
                            ? 'bg-white text-black'
                            : 'text-white/60 hover:text-white'
                        }`}
                      >
                        On
                      </button>
                      <button
                        onClick={() => setContentPreferences({
                          ...contentPreferences,
                          blog: { ...contentPreferences.blog, includeVideos: false }
                        })}
                        className={`px-4 py-2 rounded-md text-xs font-medium transition-all ${
                          !contentPreferences.blog.includeVideos
                            ? 'bg-white text-black'
                            : 'text-white/60 hover:text-white'
                        }`}
                      >
                        Off
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
                  <label className="block text-sm font-medium text-white mb-4">Word count preference</label>
                  <div className="flex gap-2">
                    {[
                      { value: 'short', label: 'Short (300-500 words)' },
                      { value: 'medium', label: 'Medium (500-1000 words)' },
                      { value: 'long', label: 'Long (1000+ words)' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setContentPreferences({
                          ...contentPreferences,
                          blog: { ...contentPreferences.blog, wordCount: option.value as any }
                        })}
                        className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                          contentPreferences.blog.wordCount === option.value
                            ? 'bg-white text-black'
                            : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {preferencesCategory === 'general' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white mb-6">General</h2>
                
                <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-white">Auto-save</label>
                    <div className="flex gap-1 bg-white/5 rounded-lg p-1">
                      <button
                        onClick={() => setContentPreferences({
                          ...contentPreferences,
                          general: { ...contentPreferences.general, autoSave: true }
                        })}
                        className={`px-4 py-2 rounded-md text-xs font-medium transition-all ${
                          contentPreferences.general.autoSave
                            ? 'bg-white text-black'
                            : 'text-white/60 hover:text-white'
                        }`}
                      >
                        On
                      </button>
                      <button
                        onClick={() => setContentPreferences({
                          ...contentPreferences,
                          general: { ...contentPreferences.general, autoSave: false }
                        })}
                        className={`px-4 py-2 rounded-md text-xs font-medium transition-all ${
                          !contentPreferences.general.autoSave
                            ? 'bg-white text-black'
                            : 'text-white/60 hover:text-white'
                        }`}
                      >
                        Off
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-white">Notifications</label>
                    <div className="flex gap-1 bg-white/5 rounded-lg p-1">
                      <button
                        onClick={() => setContentPreferences({
                          ...contentPreferences,
                          general: { ...contentPreferences.general, notifications: true }
                        })}
                        className={`px-4 py-2 rounded-md text-xs font-medium transition-all ${
                          contentPreferences.general.notifications
                            ? 'bg-white text-black'
                            : 'text-white/60 hover:text-white'
                        }`}
                      >
                        On
                      </button>
                      <button
                        onClick={() => setContentPreferences({
                          ...contentPreferences,
                          general: { ...contentPreferences.general, notifications: false }
                        })}
                        className={`px-4 py-2 rounded-md text-xs font-medium transition-all ${
                          !contentPreferences.general.notifications
                            ? 'bg-white text-black'
                            : 'text-white/60 hover:text-white'
                        }`}
                      >
                        Off
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'materials' && (
        <div className="space-y-6">
          {/* Materials Table - Blaze Style */}
          <div className="bg-[#0A0A0A] border border-white/10 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Materials</h3>
                <span className="px-2 py-0.5 bg-white/10 rounded text-xs text-white/60">{materials.length}</span>
              </div>
              <button 
                onClick={() => setShowAddContextModal(true)}
                className="text-xs text-green-400 hover:text-green-300 flex items-center gap-1 transition-colors font-medium"
              >
                <Plus className="w-3 h-3" /> Add More Context
              </button>
            </div>
            
            {/* Table Header */}
            <div className="grid grid-cols-12 px-5 py-3 border-b border-white/5 text-xs font-medium text-white/40">
              <span className="col-span-5">Name</span>
              <span className="col-span-2">File Type</span>
              <span className="col-span-2">Last Updated</span>
              <span className="col-span-2">Added ↑</span>
              <span className="col-span-1"></span>
            </div>
            
            {/* Table Rows */}
            {materials.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <Upload className="w-10 h-10 text-white/20 mx-auto mb-3" />
                <p className="text-sm text-white/40 mb-1">No materials uploaded yet</p>
                <p className="text-xs text-white/20">Add brand assets to improve AI content quality</p>
              </div>
            ) : (
              materials.map((material) => (
                <div key={material.id} className="grid grid-cols-12 px-5 py-3 border-b border-white/5 hover:bg-white/[0.02] group items-center">
                  <div className="col-span-5 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                      {getAssetIcon(material.type)}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm text-white font-medium truncate">{material.name.split('/').pop() || material.name}</span>
                      {material.url && (
                        <span className="text-xs text-white/30 truncate">{material.url}</span>
                      )}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <span className="text-xs text-white bg-white/10 rounded-lg px-3 py-1">{material.fileType || 'Website'}</span>
                  </div>
                  <span className="col-span-2 text-xs text-white/40">{material.lastUpdated}</span>
                  <span className="col-span-2 text-xs text-white/40">{material.addedAt}</span>
                  <div className="col-span-1 flex items-center justify-end gap-1">
                    <button 
                      onClick={() => setEditingMaterial(material)}
                      className="p-1.5 hover:bg-white/10 rounded transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-white/40" />
                    </button>
                    <button 
                      onClick={() => handleDeleteMaterial(material.id)}
                      className="p-1.5 hover:bg-red-500/20 rounded transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-white/40 hover:text-red-400" />
                    </button>
                  </div>
                </div>
              ))
            )}
            
            {/* Add More Row */}
            <button 
              onClick={() => setShowAddContextModal(true)}
              className="w-full px-5 py-3 text-left flex items-center gap-2 text-white/40 hover:text-white hover:bg-white/[0.02] transition-all border-t border-white/5"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm">Add More</span>
            </button>
          </div>
        </div>
      )}

      {activeTab === 'media' && (
        <div className="space-y-6">
          {/* Images Section */}
          <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white">Images</h3>
              <button 
                onClick={() => imageInputRef.current?.click()}
                className="text-xs text-green-400 hover:text-green-300 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Upload Images
              </button>
            </div>
            
            {materials.filter(m => m.type === 'image' || m.type === 'logo').length === 0 ? (
              <div className="border-2 border-dashed border-white/10 rounded-xl p-12 text-center">
                <ImageIcon className="w-12 h-12 text-white/20 mx-auto mb-3" />
                <p className="text-sm text-white/40 mb-2">No images uploaded yet</p>
                <p className="text-xs text-white/30 mb-4">Upload brand images for AI to use in content</p>
                <button 
                  onClick={() => imageInputRef.current?.click()}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-colors"
                >
                  Upload Images
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-4">
                {materials.filter(m => m.type === 'image' || m.type === 'logo').map((img) => (
                  <div key={img.id} className="relative group">
                    <div className="aspect-square bg-white/5 rounded-xl flex items-center justify-center overflow-hidden">
                      <ImageIcon className="w-8 h-8 text-white/20" />
                    </div>
                    <button 
                      onClick={() => handleDeleteMaterial(img.id)}
                      className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3 text-white" />
                    </button>
                    <p className="text-xs text-white/40 mt-2 truncate">{img.name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Videos Section */}
          <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white">Videos</h3>
              <button 
                onClick={() => videoInputRef.current?.click()}
                className="text-xs text-green-400 hover:text-green-300 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Upload Videos
              </button>
            </div>
            
            {materials.filter(m => m.type === 'video').length === 0 ? (
              <div className="border-2 border-dashed border-white/10 rounded-xl p-12 text-center">
                <Video className="w-12 h-12 text-white/20 mx-auto mb-3" />
                <p className="text-sm text-white/40 mb-2">No videos uploaded yet</p>
                <p className="text-xs text-white/30 mb-4">Upload brand videos for AI to use in content</p>
                <button 
                  onClick={() => videoInputRef.current?.click()}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-colors"
                >
                  Upload Videos
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-4">
                {materials.filter(m => m.type === 'video').map((vid) => (
                  <div key={vid.id} className="relative group">
                    <div className="aspect-video bg-white/5 rounded-xl flex items-center justify-center overflow-hidden">
                      <Video className="w-8 h-8 text-white/20" />
                    </div>
                    <button 
                      onClick={() => handleDeleteMaterial(vid.id)}
                      className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3 text-white" />
                    </button>
                    <p className="text-xs text-white/40 mt-2 truncate">{vid.name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
            <h3 className="text-sm font-bold text-white mb-4">Brand Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-white/40 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  Brand Name
                  <Lock className="w-3 h-3 text-white/20" title="Auto-filled from website scan" />
                </label>
                <input 
                  type="text" 
                  value={brandProfile.name}
                  readOnly
                  placeholder="Auto-filled from website scan"
                  className="w-full bg-[#050505] border border-white/10 rounded-lg py-2.5 px-3 text-sm text-white/60 placeholder:text-white/30 cursor-not-allowed"
                />
                <p className="text-[10px] text-white/30 mt-1">Automatically extracted from your website</p>
              </div>
              <div>
                <label className="block text-[10px] text-white/40 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  Industry
                  <Lock className="w-3 h-3 text-white/20" title="Auto-filled from website scan" />
                </label>
                <input 
                  type="text" 
                  value={brandProfile.industry}
                  readOnly
                  placeholder="Auto-filled from website scan"
                  className="w-full bg-[#050505] border border-white/10 rounded-lg py-2.5 px-3 text-sm text-white/60 placeholder:text-white/30 cursor-not-allowed"
                />
                <p className="text-[10px] text-white/30 mt-1">Automatically detected from your website</p>
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] text-white/40 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  Brand Description
                  <Lock className="w-3 h-3 text-white/20" title="Auto-filled from website scan" />
                </label>
                <textarea 
                  rows={3}
                  value={brandProfile.description}
                  readOnly
                  placeholder="Auto-filled from website scan"
                  className="w-full bg-[#050505] border border-white/10 rounded-lg py-2.5 px-3 text-sm text-white/60 placeholder:text-white/30 resize-none cursor-not-allowed"
                />
                <p className="text-[10px] text-white/30 mt-1">Automatically extracted from your website content</p>
              </div>
              <div>
                <label className="block text-[10px] text-white/40 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  Website
                  <Lock className="w-3 h-3 text-white/20" title="Auto-filled from scan" />
                </label>
                <input 
                  type="url" 
                  value={brandProfile.website}
                  readOnly
                  placeholder="Auto-filled from scan"
                  className="w-full bg-[#050505] border border-white/10 rounded-lg py-2.5 px-3 text-sm text-white/60 placeholder:text-white/30 cursor-not-allowed"
                />
                <p className="text-[10px] text-white/30 mt-1">From your digital footprint scan</p>
              </div>
              <div>
                <label className="block text-[10px] text-white/40 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  Target Audience
                  <Lock className="w-3 h-3 text-white/20" title="Auto-filled from website scan" />
                </label>
                <input 
                  type="text" 
                  value={brandProfile.targetAudience}
                  readOnly
                  placeholder="Auto-filled from website scan"
                  className="w-full bg-[#050505] border border-white/10 rounded-lg py-2.5 px-3 text-sm text-white/60 placeholder:text-white/30 cursor-not-allowed"
                />
                <p className="text-[10px] text-white/30 mt-1">Automatically detected niche/audience</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <div className="flex items-center gap-2 text-xs text-white/40">
                <Info className="w-3 h-3" />
                <span>Brand profile is auto-filled from your website scan. Run a new scan to update.</span>
              </div>
            </div>
          </div>

          {/* Logo - Auto-extracted from website */}
          <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              Brand Logo
              <Lock className="w-3 h-3 text-white/20" title="Auto-extracted from website" />
            </h3>
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 rounded-xl bg-white/5 border border-dashed border-white/20 flex items-center justify-center overflow-hidden">
                {brandProfile.logoUrl ? (
                  <img src={brandProfile.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <div className="text-center">
                    <ImageIcon className="w-8 h-8 text-white/20 mx-auto mb-1" />
                    <p className="text-[10px] text-white/30">Auto-extracted from website</p>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="text-xs text-white/40 mb-2">Logo is automatically extracted from your website during the scan.</p>
                <p className="text-[10px] text-white/30">Run a new scan to update the logo if it's missing or outdated.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'styles' && (
        <div className="space-y-6">
          {/* Colors */}
          <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white">Brand Colors</h3>
              <button 
                onClick={() => setShowAddColorModal(true)}
                className="text-xs text-white/40 hover:text-white flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add Color
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {colors.map((color) => (
                <div key={color.id} className="group relative">
                  <div 
                    className="w-full h-20 rounded-xl mb-2 border border-white/10 group-hover:ring-2 group-hover:ring-white/20 transition-all cursor-pointer"
                    style={{ backgroundColor: color.hex }}
                  />
                  <button 
                    onClick={() => handleDeleteColor(color.id)}
                    className="absolute top-2 right-2 p-1 bg-black/50 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">{color.name}</p>
                      <p className="text-xs text-white/40">{color.hex}</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-white/30 mt-1">{color.usage}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Fonts */}
          <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white">Brand Fonts</h3>
              <button 
                onClick={() => setShowAddFontModal(true)}
                className="text-xs text-white/40 hover:text-white flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add Font
              </button>
            </div>
            <div className="space-y-4">
              {fonts.map((font) => (
                <div key={font.id} className="flex items-center justify-between p-4 bg-white/[0.02] rounded-xl border border-white/5 hover:border-white/10 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center">
                      <Type className="w-5 h-5 text-white/40" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{font.name}</p>
                      <p className="text-xs text-white/40">{font.style} • {font.usage}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDeleteFont(font.id)}
                    className="p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20 rounded"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'voice' && (
        <div className="space-y-6">
          {/* Tone */}
          <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
            <h3 className="text-sm font-bold text-white mb-4">Brand Voice</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] text-white/40 uppercase tracking-wider mb-1.5">Overall Tone</label>
                <input 
                  type="text" 
                  value={voiceSettings.tone}
                  onChange={(e) => setVoiceSettings({...voiceSettings, tone: e.target.value})}
                  className="w-full bg-[#050505] border border-white/10 rounded-lg py-2.5 px-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/30"
                />
              </div>
              <div>
                <label className="block text-[10px] text-white/40 uppercase tracking-wider mb-2">Personality Traits</label>
                <div className="flex flex-wrap gap-2">
                  {voiceSettings.personality.map((trait, i) => (
                    <span 
                      key={i} 
                      className="px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full text-xs text-green-400 flex items-center gap-2 group"
                    >
                      {trait}
                      <button 
                        onClick={() => handleRemoveTrait(trait)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={voiceSettings.newTrait}
                      onChange={(e) => setVoiceSettings({...voiceSettings, newTrait: e.target.value})}
                      placeholder="Add trait"
                      className="w-24 bg-transparent border border-dashed border-white/20 rounded-full px-3 py-1.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-white/40"
                      onKeyDown={(e) => e.key === 'Enter' && handleAddTrait()}
                    />
                    <button 
                      onClick={handleAddTrait}
                      className="p-1 text-white/40 hover:text-white"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Do's and Don'ts */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
              <h3 className="text-sm font-bold text-green-400 mb-4 flex items-center gap-2">
                <Check className="w-4 h-4" /> Do This
              </h3>
              <ul className="space-y-2 mb-4">
                {voiceSettings.doThis.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-white/60 group">
                    <span className="text-green-400 mt-0.5">•</span>
                    <span className="flex-1">{item}</span>
                    <button 
                      onClick={() => setVoiceSettings({
                        ...voiceSettings, 
                        doThis: voiceSettings.doThis.filter((_, idx) => idx !== i)
                      })}
                      className="opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-3 h-3 text-white/30" />
                    </button>
                  </li>
                ))}
              </ul>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={voiceSettings.newDo}
                  onChange={(e) => setVoiceSettings({...voiceSettings, newDo: e.target.value})}
                  placeholder="Add new..."
                  className="flex-1 bg-[#050505] border border-white/10 rounded-lg py-2 px-3 text-xs text-white placeholder:text-white/30 focus:outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && voiceSettings.newDo.trim()) {
                      setVoiceSettings({
                        ...voiceSettings,
                        doThis: [...voiceSettings.doThis, voiceSettings.newDo.trim()],
                        newDo: ''
                      });
                    }
                  }}
                />
                <button 
                  onClick={() => {
                    if (voiceSettings.newDo.trim()) {
                      setVoiceSettings({
                        ...voiceSettings,
                        doThis: [...voiceSettings.doThis, voiceSettings.newDo.trim()],
                        newDo: ''
                      });
                    }
                  }}
                  className="p-2 bg-green-500/20 text-green-400 rounded-lg"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
              <h3 className="text-sm font-bold text-red-400 mb-4 flex items-center gap-2">
                <X className="w-4 h-4" /> Don't Do This
              </h3>
              <ul className="space-y-2 mb-4">
                {voiceSettings.dontDoThis.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-white/60 group">
                    <span className="text-red-400 mt-0.5">•</span>
                    <span className="flex-1">{item}</span>
                    <button 
                      onClick={() => setVoiceSettings({
                        ...voiceSettings, 
                        dontDoThis: voiceSettings.dontDoThis.filter((_, idx) => idx !== i)
                      })}
                      className="opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-3 h-3 text-white/30" />
                    </button>
                  </li>
                ))}
              </ul>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={voiceSettings.newDont}
                  onChange={(e) => setVoiceSettings({...voiceSettings, newDont: e.target.value})}
                  placeholder="Add new..."
                  className="flex-1 bg-[#050505] border border-white/10 rounded-lg py-2 px-3 text-xs text-white placeholder:text-white/30 focus:outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && voiceSettings.newDont.trim()) {
                      setVoiceSettings({
                        ...voiceSettings,
                        dontDoThis: [...voiceSettings.dontDoThis, voiceSettings.newDont.trim()],
                        newDont: ''
                      });
                    }
                  }}
                />
                <button 
                  onClick={() => {
                    if (voiceSettings.newDont.trim()) {
                      setVoiceSettings({
                        ...voiceSettings,
                        dontDoThis: [...voiceSettings.dontDoThis, voiceSettings.newDont.trim()],
                        newDont: ''
                      });
                    }
                  }}
                  className="p-2 bg-red-500/20 text-red-400 rounded-lg"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Sample Copy */}
          <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
            <h3 className="text-sm font-bold text-white mb-4">Sample Brand Copy</h3>
            <textarea 
              rows={3}
              value={voiceSettings.sampleCopy}
              onChange={(e) => setVoiceSettings({...voiceSettings, sampleCopy: e.target.value})}
              className="w-full bg-[#050505] border border-white/10 rounded-lg py-2.5 px-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 resize-none"
            />
            <p className="text-xs text-white/30 mt-2">AI will learn from this example to match your writing style</p>
            <div className="mt-4 flex justify-end">
              <button 
                onClick={handleSaveVoice}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-400 text-black text-sm font-bold rounded-lg transition-colors"
              >
                <Save className="w-4 h-4" />
                Save Voice Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'agent' && (
        <div className="space-y-6">
          {/* Brand DNA Card */}
          <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-8 max-w-4xl">
            <h2 className="text-2xl font-black uppercase tracking-tighter text-white mb-8">Brand DNA</h2>

            {brandDNA.loading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-6 h-6 text-white/40 animate-spin" />
                <span className="ml-3 text-sm text-white/60">Loading Brand DNA...</span>
              </div>
            ) : (
              <>
                {/* ARCHETYPE */}
                <div className="mb-8">
                  <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-4">ARCHETYPE</label>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                    <span className="text-sm text-white">• {brandDNA.archetype || 'Not Identified'}</span>
                  </div>
                  {brandDNA.archetype && brandDNA.archetype !== 'Not Scanned' && brandDNA.archetype !== 'Error Loading' && (
                    <p className="text-xs text-white/40 mt-2 ml-4">
                      Your brand's core personality archetype, identified from your content patterns
                    </p>
                  )}
                </div>

                {/* VOICE TONE */}
                <div className="mb-8">
                  <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-4">VOICE TONE</label>
                  {brandDNA.voice && brandDNA.voice.tones && brandDNA.voice.tones.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {brandDNA.voice.tones.map((tone: string) => (
                        <button
                          key={tone}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            brandDNA.voiceTone === tone
                              ? 'bg-white/10 border border-white/30 text-white'
                              : 'bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/[0.07]'
                          }`}
                        >
                          {tone}
                        </button>
                      ))}
                    </div>
                  ) : brandDNA.voiceTone ? (
                    <div className="flex gap-2">
                      <button className="px-4 py-2 rounded-lg text-sm font-medium bg-white/10 border border-white/30 text-white">
                        {brandDNA.voiceTone}
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm text-white/40">Run a scan to identify your voice tone</p>
                  )}
                  {brandDNA.voice && (
                    <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10">
                      <p className="text-xs text-white/60 mb-2">Voice Style: <span className="text-white">{brandDNA.voice.style || 'Not specified'}</span></p>
                      <p className="text-xs text-white/60 mb-2">Formality: <span className="text-white">{brandDNA.voice.formality || 'Not specified'}</span></p>
                      {brandDNA.voice.vocabulary && brandDNA.voice.vocabulary.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-white/60 mb-1">Key Vocabulary:</p>
                          <div className="flex flex-wrap gap-1">
                            {brandDNA.voice.vocabulary.slice(0, 8).map((word: string, i: number) => (
                              <span key={i} className="px-2 py-1 bg-white/5 rounded text-xs text-white/80">{word}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* CORE PILLARS */}
                <div>
                  <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-4">CORE PILLARS</label>
                  {brandDNA.corePillars.length > 0 ? (
                    <ul className="space-y-3">
                      {brandDNA.corePillars.map((pillar, index) => (
                        <li key={index} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/[0.07] transition-colors group">
                          <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-bold text-purple-400">{index + 1}</span>
                          </div>
                          <div className="flex-1">
                            <span className="text-sm text-white font-medium">{pillar}</span>
                            <p className="text-xs text-white/40 mt-1">
                              {pillar.toLowerCase().includes('innovation') && 'Focus on cutting-edge solutions and technological advancement'}
                              {pillar.toLowerCase().includes('community') && 'Build and nurture engaged audiences'}
                              {pillar.toLowerCase().includes('experience') && 'Create memorable and meaningful interactions'}
                              {pillar.toLowerCase().includes('inclusivity') && 'Ensure representation and accessibility for all'}
                              {pillar.toLowerCase().includes('travel') && 'Connect people with unique destinations and experiences'}
                              {pillar.toLowerCase().includes('athlete') && 'Inspire and empower through athletic achievement'}
                              {pillar.toLowerCase().includes('host') && 'Support and empower hosts to create exceptional stays'}
                              {!pillar.toLowerCase().match(/innovation|community|experience|inclusivity|travel|athlete|host/) && 'Core brand value that guides all content and messaging'}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-white/40">Run a digital footprint scan to discover your core pillars</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Hidden File Inputs */}
      <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'logo')} accept="image/*" />
      <input ref={imageInputRef} type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'image')} accept="image/*" multiple />
      <input ref={videoInputRef} type="file" className="hidden" onChange={handleVideoUpload} accept="video/*" multiple />
      <input ref={documentInputRef} type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'document')} accept=".pdf,.doc,.docx,.txt,.ppt,.pptx" />

      {/* Add More Context Modal */}
      {showAddContextModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowAddContextModal(false)}></div>
          <div className="relative w-full max-w-3xl bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Add More Context</h2>
              <button onClick={() => setShowAddContextModal(false)} className="p-2 text-white/40 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {/* Add Images & Video */}
              <button 
                onClick={() => imageInputRef.current?.click()}
                className="p-6 bg-white/[0.02] border border-white/10 rounded-xl hover:border-white/20 hover:bg-white/[0.04] transition-all text-left group"
              >
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mb-4">
                  <ImageIcon className="w-8 h-8 text-white/40" />
                </div>
                <h3 className="text-sm font-bold text-white mb-1">Add Images & Video</h3>
                <p className="text-xs text-white/40">Visual references help craft specific content</p>
              </button>

              {/* Add Webpage */}
              <button 
                onClick={() => setShowWebpageModal(true)}
                className="p-6 bg-white/[0.02] border border-white/10 rounded-xl hover:border-white/20 hover:bg-white/[0.04] transition-all text-left group"
              >
                <div className="w-16 h-16 rounded-xl bg-green-500/10 flex items-center justify-center mb-4">
                  <Globe className="w-8 h-8 text-green-400/60" />
                </div>
                <h3 className="text-sm font-bold text-white mb-1">Add Webpage</h3>
                <p className="text-xs text-white/40">Extra web pages for deeper insights</p>
              </button>

              {/* Upload Documents */}
              <button 
                onClick={() => documentInputRef.current?.click()}
                className="p-6 bg-white/[0.02] border border-white/10 rounded-xl hover:border-white/20 hover:bg-white/[0.04] transition-all text-left group"
              >
                <div className="w-16 h-16 rounded-xl bg-amber-500/10 flex items-center justify-center mb-4">
                  <Upload className="w-8 h-8 text-amber-400/60" />
                </div>
                <h3 className="text-sm font-bold text-white mb-1">Upload Documents</h3>
                <p className="text-xs text-white/40">Brochures, presentations, or sales sheets</p>
              </button>

              {/* Paste Text */}
              <button 
                onClick={() => setShowTextModal(true)}
                className="p-6 bg-white/[0.02] border border-white/10 rounded-xl hover:border-white/20 hover:bg-white/[0.04] transition-all text-left group"
              >
                <div className="w-16 h-16 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4">
                  <Type className="w-8 h-8 text-purple-400/60" />
                </div>
                <h3 className="text-sm font-bold text-white mb-1">Paste Text</h3>
                <p className="text-xs text-white/40">Copy and paste plain text for AI to understand</p>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Webpage Modal */}
      {showWebpageModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowWebpageModal(false)}></div>
          <div className="relative w-full max-w-md bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-lg font-bold text-white mb-4">Add Webpage</h2>
            <input
              type="url"
              value={newWebpage}
              onChange={(e) => setNewWebpage(e.target.value)}
              placeholder="https://example.com/page"
              className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button onClick={() => setShowWebpageModal(false)} className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white/60 text-sm rounded-xl">Cancel</button>
              <button onClick={handleAddWebpage} className="flex-1 py-2.5 bg-green-500 hover:bg-green-400 text-black text-sm font-bold rounded-xl">Add</button>
            </div>
          </div>
        </div>
      )}

      {/* Text Modal */}
      {showTextModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowTextModal(false)}></div>
          <div className="relative w-full max-w-lg bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-lg font-bold text-white mb-4">Paste Text</h2>
            <textarea
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="Paste your brand copy, content examples, or any text that represents your brand voice..."
              rows={6}
              className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 mb-4 resize-none"
              autoFocus
            />
            <div className="flex gap-3">
              <button onClick={() => setShowTextModal(false)} className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white/60 text-sm rounded-xl">Cancel</button>
              <button onClick={handleAddText} className="flex-1 py-2.5 bg-green-500 hover:bg-green-400 text-black text-sm font-bold rounded-xl">Add</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Color Modal */}
      {showAddColorModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowAddColorModal(false)}></div>
          <div className="relative w-full max-w-md bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-lg font-bold text-white mb-4">Add Brand Color</h2>
            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-xs text-white/40 mb-1">Color Name</label>
                <input type="text" value={newColor.name} onChange={(e) => setNewColor({...newColor, name: e.target.value})} placeholder="e.g., Accent" className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-1">Hex Code</label>
                <div className="flex gap-2">
                  <input type="color" value={newColor.hex} onChange={(e) => setNewColor({...newColor, hex: e.target.value})} className="w-12 h-12 rounded-lg border border-white/10 cursor-pointer" />
                  <input type="text" value={newColor.hex} onChange={(e) => setNewColor({...newColor, hex: e.target.value})} className="flex-1 bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-1">Usage (optional)</label>
                <input type="text" value={newColor.usage} onChange={(e) => setNewColor({...newColor, usage: e.target.value})} placeholder="e.g., Hover states" className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none" />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowAddColorModal(false)} className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white/60 text-sm rounded-xl">Cancel</button>
              <button onClick={handleAddColor} className="flex-1 py-2.5 bg-green-500 hover:bg-green-400 text-black text-sm font-bold rounded-xl">Add Color</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Font Modal */}
      {showAddFontModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowAddFontModal(false)}></div>
          <div className="relative w-full max-w-md bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-lg font-bold text-white mb-4">Add Brand Font</h2>
            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-xs text-white/40 mb-1">Font Name</label>
                <input type="text" value={newFont.name} onChange={(e) => setNewFont({...newFont, name: e.target.value})} placeholder="e.g., Montserrat" className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-1">Style</label>
                <select value={newFont.style} onChange={(e) => setNewFont({...newFont, style: e.target.value})} className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none appearance-none">
                  <option value="Sans-serif">Sans-serif</option>
                  <option value="Serif">Serif</option>
                  <option value="Monospace">Monospace</option>
                  <option value="Display">Display</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-1">Usage</label>
                <input type="text" value={newFont.usage} onChange={(e) => setNewFont({...newFont, usage: e.target.value})} placeholder="e.g., Headings" className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none" />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowAddFontModal(false)} className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white/60 text-sm rounded-xl">Cancel</button>
              <button onClick={handleAddFont} className="flex-1 py-2.5 bg-green-500 hover:bg-green-400 text-black text-sm font-bold rounded-xl">Add Font</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandAssetsView;
