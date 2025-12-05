import React, { useState, useRef } from 'react';
import { Upload, Palette, Type, Image as ImageIcon, FileText, Video, Music, X, Plus, Check, Globe, Trash2, Edit3, Link2, Sparkles, RefreshCw, Save } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'materials' | 'profile' | 'styles' | 'voice'>('materials');
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
      setMaterials([...materials, newMaterial]);
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
      setMaterials([...materials, newMaterial]);
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
      setMaterials([...materials, newMaterial]);
      setNewText('');
      setShowTextModal(false);
      setShowAddContextModal(false);
    }
  };

  const handleDeleteMaterial = (id: string) => {
    setMaterials(materials.filter(m => m.id !== id));
  };

  const handleAddColor = () => {
    if (newColor.name && newColor.hex) {
      setColors([...colors, { ...newColor, id: Date.now().toString() }]);
      setNewColor({ name: '', hex: '#10B981', usage: '' });
      setShowAddColorModal(false);
    }
  };

  const handleDeleteColor = (id: string) => {
    setColors(colors.filter(c => c.id !== id));
  };

  const handleAddFont = () => {
    if (newFont.name) {
      setFonts([...fonts, { ...newFont, id: Date.now().toString() }]);
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
    alert('Brand profile saved!');
  };

  const handleSaveVoice = () => {
    localStorage.setItem('brandVoice', JSON.stringify(voiceSettings));
    alert('Brand voice settings saved!');
  };

  return (
    <div className="max-w-6xl mx-auto p-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-white mb-2">Brand Assets</h1>
          <p className="text-white/40 text-sm">Upload your brand materials to enhance AI-generated content</p>
        </div>
        <button 
          onClick={() => setShowAddContextModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-500 hover:bg-green-400 text-black text-sm font-bold transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add More Context
        </button>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-5">
          <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center mb-3">
            <Sparkles className="w-5 h-5 text-amber-400" />
          </div>
          <h3 className="text-sm font-bold text-white mb-1">Learns from every asset</h3>
          <p className="text-xs text-white/40">Uploads help AI match your brand perfectly</p>
        </div>
        <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-5">
          <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center mb-3">
            <RefreshCw className="w-5 h-5 text-pink-400" />
          </div>
          <h3 className="text-sm font-bold text-white mb-1">Auto-refines content</h3>
          <p className="text-xs text-white/40">Brand voice improves with each upload</p>
        </div>
        <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-5 relative overflow-hidden">
          <div className="absolute top-4 right-4 w-16 h-16 rounded-full border-4 border-green-500/30 flex items-center justify-center">
            <span className="text-lg font-bold text-white">{materials.length}</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center mb-3">
            <Check className="w-5 h-5 text-green-400" />
          </div>
          <h3 className="text-sm font-bold text-white mb-1">Assets</h3>
          <p className="text-xs text-white/40">uploaded</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 bg-white/5 rounded-xl mb-6 w-fit">
        {[
          { id: 'materials', label: 'Source Materials' },
          { id: 'profile', label: 'Brand Profile' },
          { id: 'styles', label: 'Styles & Colors' },
          { id: 'voice', label: 'Voice & Tone' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === tab.id 
                ? 'bg-white/10 text-white' 
                : 'text-white/40 hover:text-white/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'materials' && (
        <div className="space-y-6">
          {/* Materials Table */}
          <div className="bg-[#0A0A0A] border border-white/10 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Materials</h3>
                <span className="text-xs text-white/30">{materials.length}</span>
              </div>
              <button 
                onClick={() => setShowAddContextModal(true)}
                className="text-xs text-white/40 hover:text-white flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3 h-3" /> Add More Context
              </button>
            </div>
            
            {/* Table Header */}
            <div className="grid grid-cols-4 px-5 py-2 border-b border-white/5 text-[10px] font-bold text-white/30 uppercase tracking-wider">
              <span>Name</span>
              <span>File Type</span>
              <span>Added</span>
              <span>Last Updated</span>
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
                <div key={material.id} className="grid grid-cols-4 px-5 py-3 border-b border-white/5 hover:bg-white/[0.02] group items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center">
                      {getAssetIcon(material.type)}
                    </div>
                    <span className="text-sm text-white truncate">{material.name}</span>
                  </div>
                  <span className="text-xs text-white/40 bg-white/5 rounded px-2 py-0.5 w-fit">{material.fileType}</span>
                  <span className="text-xs text-white/40">{material.addedAt}</span>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/40">{material.lastUpdated}</span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleDeleteMaterial(material.id)}
                        className="p-1.5 hover:bg-red-500/20 rounded transition-colors"
                      >
                        <Trash2 className="w-3 h-3 text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
            
            {/* Add More Row */}
            <button 
              onClick={() => setShowAddContextModal(true)}
              className="w-full px-5 py-3 text-left flex items-center gap-2 text-white/40 hover:text-white hover:bg-white/[0.02] transition-all"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm">Add More</span>
            </button>
          </div>
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
            <h3 className="text-sm font-bold text-white mb-4">Brand Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-white/40 uppercase tracking-wider mb-1.5">Brand Name</label>
                <input 
                  type="text" 
                  value={brandProfile.name}
                  onChange={(e) => setBrandProfile({...brandProfile, name: e.target.value})}
                  placeholder="Your brand name"
                  className="w-full bg-[#050505] border border-white/10 rounded-lg py-2.5 px-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/30"
                />
              </div>
              <div>
                <label className="block text-[10px] text-white/40 uppercase tracking-wider mb-1.5">Industry</label>
                <input 
                  type="text" 
                  value={brandProfile.industry}
                  onChange={(e) => setBrandProfile({...brandProfile, industry: e.target.value})}
                  placeholder="e.g., Content Creation, Technology"
                  className="w-full bg-[#050505] border border-white/10 rounded-lg py-2.5 px-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/30"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] text-white/40 uppercase tracking-wider mb-1.5">Brand Description</label>
                <textarea 
                  rows={3}
                  value={brandProfile.description}
                  onChange={(e) => setBrandProfile({...brandProfile, description: e.target.value})}
                  placeholder="Brief description of your brand..."
                  className="w-full bg-[#050505] border border-white/10 rounded-lg py-2.5 px-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 resize-none"
                />
              </div>
              <div>
                <label className="block text-[10px] text-white/40 uppercase tracking-wider mb-1.5">Website</label>
                <input 
                  type="url" 
                  value={brandProfile.website}
                  onChange={(e) => setBrandProfile({...brandProfile, website: e.target.value})}
                  placeholder="https://yourbrand.com"
                  className="w-full bg-[#050505] border border-white/10 rounded-lg py-2.5 px-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/30"
                />
              </div>
              <div>
                <label className="block text-[10px] text-white/40 uppercase tracking-wider mb-1.5">Target Audience</label>
                <input 
                  type="text" 
                  value={brandProfile.targetAudience}
                  onChange={(e) => setBrandProfile({...brandProfile, targetAudience: e.target.value})}
                  placeholder="e.g., Content creators, SMBs"
                  className="w-full bg-[#050505] border border-white/10 rounded-lg py-2.5 px-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/30"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button 
                onClick={handleSaveProfile}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-400 text-black text-sm font-bold rounded-lg transition-colors"
              >
                <Save className="w-4 h-4" />
                Save Profile
              </button>
            </div>
          </div>

          {/* Logo Upload */}
          <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
            <h3 className="text-sm font-bold text-white mb-4">Brand Logo</h3>
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 rounded-xl bg-white/5 border border-dashed border-white/20 flex items-center justify-center overflow-hidden">
                {brandProfile.logoUrl ? (
                  <img src={brandProfile.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-white/20" />
                )}
              </div>
              <div className="flex-1">
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 rounded-lg text-sm text-white cursor-pointer transition-colors">
                  <Upload className="w-4 h-4" />
                  Upload Logo
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const url = URL.createObjectURL(file);
                        setBrandProfile({...brandProfile, logoUrl: url});
                      }
                    }}
                  />
                </label>
                <p className="text-xs text-white/30 mt-2">SVG, PNG, or JPG. Max 2MB.</p>
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

      {/* Hidden File Inputs */}
      <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'logo')} accept="image/*" />
      <input ref={imageInputRef} type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'image')} accept="image/*,video/*" />
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
