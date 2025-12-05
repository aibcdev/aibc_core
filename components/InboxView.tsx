import React, { useState, useEffect } from 'react';
import { Inbox, Video, Mic2, Clock, CheckCircle, XCircle, Loader2, Download, Eye, RefreshCw } from 'lucide-react';

interface Request {
  id: string;
  type: 'video' | 'audio';
  title: string;
  description: string;
  status: 'pending' | 'processing' | 'ready' | 'completed' | 'rejected';
  requestedAt: string;
  estimatedReadyAt?: string;
  completedAt?: string;
  draftsRemaining: number;
  content?: {
    url?: string;
    thumbnail?: string;
    duration?: number;
  };
  revisions: Array<{
    id: string;
    requestedAt: string;
    reason: string;
    status: 'pending' | 'completed';
  }>;
}

const InboxView: React.FC = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'ready' | 'completed'>('all');

  // Load requests from localStorage
  useEffect(() => {
    const loadRequests = () => {
      const stored = localStorage.getItem('videoAudioRequests');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setRequests(parsed);
        } catch (e) {
          console.error('Error loading requests:', e);
          setRequests([]);
        }
      } else {
        setRequests([]);
      }
    };

    loadRequests();
    
    // Listen for storage changes (cross-tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'videoAudioRequests') {
        loadRequests();
      }
    };
    
    // Listen for custom events (same-tab)
    const handleCustomStorage = () => {
      loadRequests();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('videoAudioRequestAdded', handleCustomStorage);
    
    // Also poll periodically for same-tab updates
    const interval = setInterval(loadRequests, 2000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('videoAudioRequestAdded', handleCustomStorage);
      clearInterval(interval);
    };
  }, []);

  const filteredRequests = requests.filter(req => {
    if (filter === 'all') return true;
    if (filter === 'pending') return req.status === 'pending' || req.status === 'processing';
    if (filter === 'ready') return req.status === 'ready';
    if (filter === 'completed') return req.status === 'completed';
    return true;
  });

  const handleRequestRevision = (requestId: string, reason: string) => {
    const request = requests.find(r => r.id === requestId);
    if (!request || request.draftsRemaining <= 0) return;

    const newRevision = {
      id: `rev-${Date.now()}`,
      requestedAt: new Date().toISOString(),
      reason,
      status: 'pending' as const
    };

    const updated = requests.map(r => 
      r.id === requestId 
        ? {
            ...r,
            revisions: [...r.revisions, newRevision],
            draftsRemaining: r.draftsRemaining - 1,
            status: 'pending' as const
          }
        : r
    );

    setRequests(updated);
    localStorage.setItem('videoAudioRequests', JSON.stringify(updated));
  };

  const handleMarkComplete = (requestId: string) => {
    const updated = requests.map(r => 
      r.id === requestId 
        ? { ...r, status: 'completed' as const, completedAt: new Date().toISOString() }
        : r
    );

    setRequests(updated);
    localStorage.setItem('videoAudioRequests', JSON.stringify(updated));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'processing': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'ready': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'completed': return 'text-white/60 bg-white/5 border-white/10';
      case 'rejected': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-white/40 bg-white/5 border-white/10';
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="text-sm text-white/40 mb-1">Production / Inbox</div>
          <h1 className="text-3xl font-black tracking-tight text-white">Video & Audio Requests</h1>
          <p className="text-sm text-white/60 mt-2">
            Your curated video and audio content will appear here once ready (up to 72 hours)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-sm text-white hover:bg-white/10 transition-colors flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {(['all', 'pending', 'ready', 'completed'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              filter === f 
                ? 'bg-white/10 text-white border border-white/20' 
                : 'text-white/40 hover:text-white/60'
            }`}
          >
            {f} {f !== 'all' && `(${requests.filter(r => {
              if (f === 'pending') return r.status === 'pending' || r.status === 'processing';
              if (f === 'ready') return r.status === 'ready';
              if (f === 'completed') return r.status === 'completed';
              return false;
            }).length})`}
          </button>
        ))}
      </div>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-12 text-center">
          <Inbox className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">No Requests Yet</h3>
          <p className="text-sm text-white/60 max-w-md mx-auto">
            When you request video or audio generation from the Production Room, your requests will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredRequests.map(request => (
            <div
              key={request.id}
              className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6 hover:border-white/20 transition-colors cursor-pointer"
              onClick={() => setSelectedRequest(request)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    request.type === 'video' 
                      ? 'bg-red-500/10 text-red-400' 
                      : 'bg-purple-500/10 text-purple-400'
                  }`}>
                    {request.type === 'video' ? (
                      <Video className="w-6 h-6" />
                    ) : (
                      <Mic2 className="w-6 h-6" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-white">{request.title}</h3>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                    </div>
                    <p className="text-sm text-white/60 mb-3">{request.description}</p>
                    
                    <div className="flex items-center gap-4 text-xs text-white/40">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Requested {formatDate(request.requestedAt)}
                      </div>
                      {request.estimatedReadyAt && request.status !== 'ready' && request.status !== 'completed' && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Ready by {formatDate(request.estimatedReadyAt)}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <span className="text-white/60">Drafts remaining:</span>
                        <span className={`font-bold ${request.draftsRemaining > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {request.draftsRemaining}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {request.status === 'ready' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRequest(request);
                      }}
                      className="px-4 py-2 rounded-lg bg-green-500 hover:bg-green-400 text-black text-sm font-bold transition-colors flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Review
                    </button>
                  )}
                  {request.status === 'completed' && request.content?.url && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(request.content?.url, '_blank');
                      }}
                      className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-bold transition-colors flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Request Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSelectedRequest(null)}></div>
          <div className="relative w-full max-w-2xl bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setSelectedRequest(null)} 
              className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
            >
              <XCircle className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  selectedRequest.type === 'video' 
                    ? 'bg-red-500/10 text-red-400' 
                    : 'bg-purple-500/10 text-purple-400'
                }`}>
                  {selectedRequest.type === 'video' ? (
                    <Video className="w-5 h-5" />
                  ) : (
                    <Mic2 className="w-5 h-5" />
                  )}
                </div>
                <h2 className="text-2xl font-bold text-white">{selectedRequest.title}</h2>
              </div>
              <p className="text-sm text-white/60">{selectedRequest.description}</p>
            </div>

            {/* Status Info */}
            <div className="bg-white/5 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-white/40 mb-1">Status</div>
                  <div className="text-white font-bold">{selectedRequest.status.toUpperCase()}</div>
                </div>
                <div>
                  <div className="text-white/40 mb-1">Drafts Remaining</div>
                  <div className={`font-bold ${selectedRequest.draftsRemaining > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {selectedRequest.draftsRemaining} / 3
                  </div>
                </div>
                <div>
                  <div className="text-white/40 mb-1">Requested</div>
                  <div className="text-white">{formatDate(selectedRequest.requestedAt)}</div>
                </div>
                {selectedRequest.estimatedReadyAt && (
                  <div>
                    <div className="text-white/40 mb-1">Estimated Ready</div>
                    <div className="text-white">{formatDate(selectedRequest.estimatedReadyAt)}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Content Preview */}
            {selectedRequest.content && selectedRequest.status === 'ready' && (
              <div className="mb-6">
                <div className="text-sm text-white/40 mb-2">Preview</div>
                {selectedRequest.type === 'video' && selectedRequest.content.thumbnail ? (
                  <div className="relative rounded-lg overflow-hidden bg-white/5">
                    <img 
                      src={selectedRequest.content.thumbnail} 
                      alt="Video thumbnail" 
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors">
                        <Video className="w-8 h-8 text-white" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white/5 rounded-lg p-8 text-center">
                    <Mic2 className="w-12 h-12 text-white/40 mx-auto mb-2" />
                    <div className="text-sm text-white/60">Audio content ready</div>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            {selectedRequest.status === 'ready' && (
              <div className="space-y-3">
                <button
                  onClick={() => {
                    if (selectedRequest.content?.url) {
                      window.open(selectedRequest.content.url, '_blank');
                    }
                  }}
                  className="w-full py-3 bg-green-500 hover:bg-green-400 text-black text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download {selectedRequest.type === 'video' ? 'Video' : 'Audio'}
                </button>
                
                {selectedRequest.draftsRemaining > 0 && (
                  <button
                    onClick={() => {
                      const reason = prompt('What would you like to change?');
                      if (reason) {
                        handleRequestRevision(selectedRequest.id, reason);
                        setSelectedRequest(null);
                      }
                    }}
                    className="w-full py-3 bg-white/10 hover:bg-white/20 text-white text-sm font-bold rounded-lg transition-colors"
                  >
                    Request Revision ({selectedRequest.draftsRemaining} remaining)
                  </button>
                )}
                
                <button
                  onClick={() => {
                    handleMarkComplete(selectedRequest.id);
                    setSelectedRequest(null);
                  }}
                  className="w-full py-3 bg-white/5 hover:bg-white/10 text-white text-sm font-bold rounded-lg transition-colors"
                >
                  Mark as Complete
                </button>
              </div>
            )}

            {/* Revisions History */}
            {selectedRequest.revisions.length > 0 && (
              <div className="mt-6 pt-6 border-t border-white/10">
                <div className="text-sm text-white/40 mb-3">Revision History</div>
                <div className="space-y-2">
                  {selectedRequest.revisions.map(rev => (
                    <div key={rev.id} className="bg-white/5 rounded-lg p-3 text-sm">
                      <div className="text-white/60 mb-1">{rev.reason}</div>
                      <div className="text-xs text-white/40">{formatDate(rev.requestedAt)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InboxView;

