import React, { useState, useRef } from 'react';
import { 
  Upload, FileText, Mic, Video, Link2, Plus, X, Check,
  ArrowRight, FolderOpen, MessageSquare, StickyNote
} from 'lucide-react';
import { ViewState, NavProps } from '../types';

interface UploadedFile {
  id: string;
  name: string;
  type: 'notion' | 'slack' | 'voice' | 'video' | 'document';
  size: string;
  status: 'uploading' | 'complete' | 'error';
}

const VectorsView: React.FC<NavProps> = ({ onNavigate }) => {
  const [notionUrl, setNotionUrl] = useState('');
  const [slackUrl, setSlackUrl] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const voiceInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (files: FileList | null, type: 'voice' | 'video' | 'document') => {
    if (!files) return;
    
    Array.from(files).forEach(file => {
      const newFile: UploadedFile = {
        id: Date.now().toString() + Math.random(),
        name: file.name,
        type,
        size: formatFileSize(file.size),
        status: 'complete'
      };
      setUploadedFiles(prev => [...prev, newFile]);
    });
  };

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const addNotionLink = () => {
    if (!notionUrl.trim()) return;
    const newFile: UploadedFile = {
      id: Date.now().toString(),
      name: notionUrl,
      type: 'notion',
      size: 'Link',
      status: 'complete'
    };
    setUploadedFiles(prev => [...prev, newFile]);
    setNotionUrl('');
  };

  const addSlackLink = () => {
    if (!slackUrl.trim()) return;
    const newFile: UploadedFile = {
      id: Date.now().toString(),
      name: slackUrl,
      type: 'slack',
      size: 'Link',
      status: 'complete'
    };
    setUploadedFiles(prev => [...prev, newFile]);
    setSlackUrl('');
  };

  return (
    <div id="vectors-view" className="fixed inset-0 z-[90] bg-[#050505] overflow-y-auto">
      <div className="min-h-screen flex flex-col p-6 md:p-12 relative max-w-5xl mx-auto">
        
        {/* Step Indicator */}
        <div className="absolute top-12 left-0 right-0 flex flex-col items-center gap-6 z-10">
          <div className="px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-[10px] font-mono text-white/40 tracking-widest">
            STEP 04 / 04
          </div>
        </div>
        
        {/* Header */}
        <div className="mb-8 mt-20">
          <h1 className="text-3xl md:text-4xl font-sans font-black text-white mb-2">Connect Your Content</h1>
          <p className="text-white/50 text-sm">
            We've scanned your public profiles. Now add your private content sources.
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-6 mb-12">
          
          {/* Notion Integration */}
          <div className="rounded-xl border border-white/10 bg-[#080808] p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                <StickyNote className="w-5 h-5 text-white/70" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Notion</h2>
                <p className="text-xs text-white/40">Connect your workspace or paste page links</p>
              </div>
            </div>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={notionUrl}
                onChange={(e) => setNotionUrl(e.target.value)}
                placeholder="Paste Notion page URL..." 
                className="flex-1 bg-[#050505] border border-white/10 rounded-lg py-3 px-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/30"
              />
              <button 
                onClick={addNotionLink}
                className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
              >
                <Plus className="w-4 h-4 text-white/70" />
              </button>
            </div>
          </div>

          {/* Slack Integration */}
          <div className="rounded-xl border border-white/10 bg-[#080808] p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                <MessageSquare className="w-5 h-5 text-white/70" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Slack</h2>
                <p className="text-xs text-white/40">Export channel history or paste shared links</p>
              </div>
            </div>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={slackUrl}
                onChange={(e) => setSlackUrl(e.target.value)}
                placeholder="Paste Slack export URL or channel link..." 
                className="flex-1 bg-[#050505] border border-white/10 rounded-lg py-3 px-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/30"
              />
              <button 
                onClick={addSlackLink}
                className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
              >
                <Plus className="w-4 h-4 text-white/70" />
              </button>
            </div>
          </div>

          {/* File Uploads */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Voice Memos */}
            <div 
              onClick={() => voiceInputRef.current?.click()}
              className="rounded-xl border border-dashed border-white/20 bg-[#080808] p-6 cursor-pointer hover:border-white/40 hover:bg-white/[0.02] transition-all group"
            >
              <input 
                ref={voiceInputRef}
                type="file" 
                accept="audio/*"
                multiple
                className="hidden"
                onChange={(e) => handleFileUpload(e.target.files, 'voice')}
              />
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mb-3 group-hover:bg-purple-500/20 transition-colors">
                  <Mic className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="text-sm font-bold text-white mb-1">Voice Memos</h3>
                <p className="text-xs text-white/40">Upload audio files</p>
              </div>
            </div>

            {/* Video Uploads */}
            <div 
              onClick={() => videoInputRef.current?.click()}
              className="rounded-xl border border-dashed border-white/20 bg-[#080808] p-6 cursor-pointer hover:border-white/40 hover:bg-white/[0.02] transition-all group"
            >
              <input 
                ref={videoInputRef}
                type="file" 
                accept="video/*"
                multiple
                className="hidden"
                onChange={(e) => handleFileUpload(e.target.files, 'video')}
              />
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-3 group-hover:bg-red-500/20 transition-colors">
                  <Video className="w-5 h-5 text-red-400" />
                </div>
                <h3 className="text-sm font-bold text-white mb-1">Videos</h3>
                <p className="text-xs text-white/40">Upload video files</p>
              </div>
            </div>

            {/* Documents */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="rounded-xl border border-dashed border-white/20 bg-[#080808] p-6 cursor-pointer hover:border-white/40 hover:bg-white/[0.02] transition-all group"
            >
              <input 
                ref={fileInputRef}
                type="file" 
                accept=".pdf,.doc,.docx,.txt,.md"
                multiple
                className="hidden"
                onChange={(e) => handleFileUpload(e.target.files, 'document')}
              />
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-3 group-hover:bg-blue-500/20 transition-colors">
                  <FileText className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-sm font-bold text-white mb-1">Documents</h3>
                <p className="text-xs text-white/40">PDF, DOC, TXT, MD</p>
              </div>
            </div>
          </div>

          {/* Uploaded Files List */}
          {uploadedFiles.length > 0 && (
            <div className="rounded-xl border border-white/10 bg-[#080808] p-6">
              <h3 className="text-sm font-bold text-white mb-4">Connected Sources ({uploadedFiles.length})</h3>
              <div className="space-y-2">
                {uploadedFiles.map(file => (
                  <div key={file.id} className="flex items-center gap-3 p-3 bg-white/[0.02] rounded-lg border border-white/5">
                    {file.type === 'notion' && <StickyNote className="w-4 h-4 text-white/50" />}
                    {file.type === 'slack' && <MessageSquare className="w-4 h-4 text-white/50" />}
                    {file.type === 'voice' && <Mic className="w-4 h-4 text-purple-400" />}
                    {file.type === 'video' && <Video className="w-4 h-4 text-red-400" />}
                    {file.type === 'document' && <FileText className="w-4 h-4 text-blue-400" />}
                    <span className="flex-1 text-sm text-white/80 truncate">{file.name}</span>
                    <span className="text-xs text-white/30">{file.size}</span>
                    {file.status === 'complete' && <Check className="w-4 h-4 text-green-500" />}
                    <button onClick={() => removeFile(file.id)} className="p-1 hover:bg-white/10 rounded">
                      <X className="w-3 h-3 text-white/30 hover:text-white" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Info Note */}
          <div className="bg-white/[0.02] border border-white/10 rounded-lg p-4">
            <p className="text-xs text-white/50">
              <span className="text-white/70 font-medium">Note:</span> Public profiles (Twitter, YouTube, LinkedIn, Instagram) 
              are automatically scanned. This page is for connecting private content sources that aren't publicly accessible.
            </p>
          </div>
        </div>

        {/* Footer Action Bar */}
        <div className="flex items-center justify-between border-t border-white/10 pt-8 mt-auto sticky bottom-0 bg-[#050505] pb-6 z-10">
          <button 
            onClick={() => onNavigate(ViewState.AUDIT)}
            className="px-6 py-3 rounded border border-white/20 text-xs font-bold uppercase tracking-widest text-white hover:bg-white/5 transition-colors"
          >
            Back
          </button>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => onNavigate(ViewState.DASHBOARD)}
              className="px-6 py-3 rounded border border-white/20 text-xs font-medium text-white/50 hover:text-white hover:bg-white/5 transition-colors"
            >
              Skip for now
            </button>
            <button 
              onClick={() => {
                // Ensure lastScannedUsername is set before navigating
                const lastUsername = localStorage.getItem('lastScannedUsername');
                if (!lastUsername) {
                  // If no username, try to get it from the scan results
                  const scanResults = localStorage.getItem('lastScanResults');
                  if (scanResults) {
                    try {
                      const results = JSON.parse(scanResults);
                      if (results.username) {
                        localStorage.setItem('lastScannedUsername', results.username);
                      }
                    } catch (e) {
                      console.error('Error parsing scan results:', e);
                    }
                  }
                }
                // Navigate to dashboard
                onNavigate(ViewState.DASHBOARD);
              }}
              className="px-8 py-3 rounded bg-[#10B981] hover:bg-[#059669] text-[#050505] text-xs font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all flex items-center gap-2"
            >
              Continue <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VectorsView;
