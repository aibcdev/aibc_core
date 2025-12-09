import React, { useState, useEffect } from 'react';
import { Inbox, CheckCircle, X, Play, Download, Clock, FileText, Video, Mic2, Image as ImageIcon, Send } from 'lucide-react';
import { ViewState, NavProps } from '../types';
import { acceptContent, getCreditBalance } from '../services/subscriptionService';
import { getInboxItems, updateInboxItemStatus } from '../services/inboxService';

interface InboxItem {
  id: string;
  type: 'audio' | 'video' | 'text' | 'image';
  title: string;
  description?: string;
  content?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  cost: number;
  metadata?: Record<string, any>;
}

const InboxView: React.FC<NavProps> = ({ onNavigate }) => {
  const [inboxItems, setInboxItems] = useState<InboxItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<InboxItem | null>(null);
  const [creditBalance, setCreditBalance] = useState(getCreditBalance());

  useEffect(() => {
    // Load inbox items
    loadInboxItems();
    
    // Refresh credit balance
    const interval = setInterval(() => {
      setCreditBalance(getCreditBalance());
      loadInboxItems(); // Refresh inbox items too
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);

  const loadInboxItems = () => {
    const items = getInboxItems();
    setInboxItems(items);
  };

  const handleAccept = (item: InboxItem) => {
    // Check if user has enough credits
    const balance = getCreditBalance();
    if (balance.credits < item.cost) {
      alert(`Insufficient credits. Need ${item.cost}, have ${balance.credits}. Please upgrade or purchase credits.`);
      return;
    }

    // Deduct credits only when accepted
    const success = acceptContent(item.id, item.type as 'audio' | 'video');
    
    if (!success) {
      alert('Failed to accept content. Insufficient credits.');
      return;
    }

    // Update item status
    updateInboxItemStatus(item.id, 'accepted');
    loadInboxItems();
    setCreditBalance(getCreditBalance());
    
    // Show success message
    alert(`Content accepted! ${item.cost} credits deducted.`);
  };

  const handleReject = (item: InboxItem) => {
    // No credits deducted on rejection
    updateInboxItemStatus(item.id, 'rejected');
    loadInboxItems();
  };

  const pendingItems = inboxItems.filter(item => item.status === 'pending');
  const acceptedItems = inboxItems.filter(item => item.status === 'accepted');
  const rejectedItems = inboxItems.filter(item => item.status === 'rejected');

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'audio': return <Mic2 className="w-5 h-5" />;
      case 'video': return <Video className="w-5 h-5" />;
      case 'image': return <ImageIcon className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'audio': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'video': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'image': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-white/10 text-white/60 border-white/10';
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-[#050505] overflow-y-auto">
      <div className="min-h-screen max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => onNavigate(ViewState.DASHBOARD)}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
              <Inbox className="w-8 h-8 text-orange-500" />
              <div>
                <h1 className="text-3xl font-bold text-white">Inbox</h1>
                <p className="text-sm text-white/40">Review and accept content from your team</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="px-4 py-2 bg-gradient-to-r from-orange-500/10 to-purple-600/10 border border-orange-500/20 rounded-lg">
                <div className="text-xs text-white/60">Available Credits</div>
                <div className="text-xl font-bold text-white">{creditBalance.credits}</div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-white/10">
            {[
              { id: 'pending', label: `Pending (${pendingItems.length})`, count: pendingItems.length },
              { id: 'accepted', label: `Accepted (${acceptedItems.length})`, count: acceptedItems.length },
              { id: 'rejected', label: `Rejected (${rejectedItems.length})`, count: rejectedItems.length },
            ].map(tab => (
              <button
                key={tab.id}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  selectedItem === null || (selectedItem.status === tab.id.slice(0, -1) as any)
                    ? 'text-orange-500 border-orange-500'
                    : 'text-white/40 border-transparent hover:text-white/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {pendingItems.length === 0 && acceptedItems.length === 0 && rejectedItems.length === 0 ? (
          <div className="text-center py-20">
            <Inbox className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No items in inbox</h3>
            <p className="text-white/40">Content from your team will appear here</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Pending Items */}
            {pendingItems.length > 0 && (
              <div className="lg:col-span-2 space-y-4">
                <h2 className="text-lg font-bold text-white mb-4">Pending Review</h2>
                {pendingItems.map(item => (
                  <div
                    key={item.id}
                    className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6 hover:border-white/20 transition-colors cursor-pointer"
                    onClick={() => setSelectedItem(item)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg ${getTypeColor(item.type)} flex items-center justify-center border`}>
                          {getTypeIcon(item.type)}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white">{item.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-white/40">
                              {item.createdAt.toLocaleDateString()}
                            </span>
                            <span className="text-xs px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded">
                              {item.cost} credits
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {item.description && (
                      <p className="text-sm text-white/60 mb-4 line-clamp-2">{item.description}</p>
                    )}

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAccept(item);
                        }}
                        disabled={creditBalance.credits < item.cost}
                        className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-400 disabled:bg-white/10 disabled:text-white/30 disabled:cursor-not-allowed text-black text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Accept ({item.cost} credits)
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReject(item);
                        }}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/60 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Selected Item Detail */}
            {selectedItem && (
              <div className="lg:col-span-1">
                <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6 sticky top-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">Details</h3>
                    <button
                      onClick={() => setSelectedItem(null)}
                      className="text-white/40 hover:text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className={`w-12 h-12 rounded-lg ${getTypeColor(selectedItem.type)} flex items-center justify-center border mb-4`}>
                    {getTypeIcon(selectedItem.type)}
                  </div>

                  <h4 className="text-xl font-bold text-white mb-2">{selectedItem.title}</h4>
                  
                  {selectedItem.description && (
                    <p className="text-sm text-white/60 mb-4">{selectedItem.description}</p>
                  )}

                  {selectedItem.content && (
                    <div className="mb-4 p-4 bg-[#050505] rounded-lg border border-white/5">
                      <p className="text-sm text-white/80 whitespace-pre-wrap">{selectedItem.content}</p>
                    </div>
                  )}

                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Cost:</span>
                      <span className="text-white font-bold">{selectedItem.cost} credits</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Status:</span>
                      <span className={`font-bold ${
                        selectedItem.status === 'accepted' ? 'text-green-400' :
                        selectedItem.status === 'rejected' ? 'text-red-400' :
                        'text-orange-400'
                      }`}>
                        {selectedItem.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Created:</span>
                      <span className="text-white/80">
                        {selectedItem.createdAt.toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {selectedItem.status === 'pending' && (
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          handleAccept(selectedItem);
                          setSelectedItem(null);
                        }}
                        disabled={creditBalance.credits < selectedItem.cost}
                        className="w-full px-4 py-3 bg-green-500 hover:bg-green-400 disabled:bg-white/10 disabled:text-white/30 disabled:cursor-not-allowed text-black text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-5 h-5" />
                        Accept & Deduct {selectedItem.cost} Credits
                      </button>
                      <button
                        onClick={() => {
                          handleReject(selectedItem);
                          setSelectedItem(null);
                        }}
                        className="w-full px-4 py-3 bg-white/5 hover:bg-white/10 text-white/60 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <X className="w-5 h-5" />
                        Reject (No Charge)
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Accepted/Rejected Lists */}
            {(acceptedItems.length > 0 || rejectedItems.length > 0) && !selectedItem && (
              <div className="lg:col-span-3 space-y-6 mt-8">
                {acceptedItems.length > 0 && (
                  <div>
                    <h2 className="text-lg font-bold text-white mb-4">Accepted</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {acceptedItems.map(item => (
                        <div
                          key={item.id}
                          className="bg-[#0A0A0A] border border-green-500/20 rounded-xl p-4"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            {getTypeIcon(item.type)}
                            <h4 className="text-sm font-bold text-white">{item.title}</h4>
                          </div>
                          <div className="text-xs text-green-400">Accepted</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {rejectedItems.length > 0 && (
                  <div>
                    <h2 className="text-lg font-bold text-white mb-4">Rejected</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {rejectedItems.map(item => (
                        <div
                          key={item.id}
                          className="bg-[#0A0A0A] border border-red-500/20 rounded-xl p-4"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            {getTypeIcon(item.type)}
                            <h4 className="text-sm font-bold text-white">{item.title}</h4>
                          </div>
                          <div className="text-xs text-red-400">Rejected</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default InboxView;

