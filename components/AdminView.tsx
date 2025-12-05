import React, { useState, useEffect } from 'react';
import { 
  Users, Video, Mic2, Clock, CheckCircle, XCircle, 
  Search, Filter, Download, Eye, Send, RefreshCw,
  TrendingUp, Activity, BarChart2, Calendar, Zap,
  ArrowUp, ArrowDown, MoreHorizontal, Play, Pause
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  name: string;
  tier: 'free' | 'pro' | 'business' | 'premium';
  joinedAt: string;
  lastActive: string;
  totalTimeOnSite: number; // minutes
  totalClicks: number;
  requestsCount: number;
  creditsUsed: number;
  status: 'active' | 'inactive' | 'suspended';
}

interface Request {
  id: string;
  userId: string;
  userName: string;
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
}

interface UserActivity {
  userId: string;
  timestamp: string;
  action: string;
  page: string;
  duration?: number;
}

const AdminView: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [selectedTab, setSelectedTab] = useState<'users' | 'requests' | 'analytics'>('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTier, setFilterTier] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Load data from localStorage (in production, this would be API calls)
  useEffect(() => {
    loadUsers();
    loadRequests();
    loadActivities();
  }, []);

  const loadUsers = () => {
    // In production, fetch from API
    const storedUsers = localStorage.getItem('admin_users');
    if (storedUsers) {
      try {
        setUsers(JSON.parse(storedUsers));
      } catch (e) {
        console.error('Error loading users:', e);
      }
    } else {
      // Mock data for demo
      setUsers([
        {
          id: '1',
          email: 'user1@example.com',
          name: 'John Doe',
          tier: 'premium',
          joinedAt: '2024-01-15T10:00:00Z',
          lastActive: new Date().toISOString(),
          totalTimeOnSite: 245,
          totalClicks: 1234,
          requestsCount: 5,
          creditsUsed: 150,
          status: 'active'
        },
        {
          id: '2',
          email: 'user2@example.com',
          name: 'Jane Smith',
          tier: 'business',
          joinedAt: '2024-02-20T14:30:00Z',
          lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          totalTimeOnSite: 180,
          totalClicks: 890,
          requestsCount: 3,
          creditsUsed: 75,
          status: 'active'
        }
      ]);
    }
  };

  const loadRequests = () => {
    const stored = localStorage.getItem('videoAudioRequests');
    if (stored) {
      try {
        const allRequests = JSON.parse(stored);
        // Enrich with user data
        const enrichedRequests = allRequests.map((req: any) => ({
          ...req,
          userId: req.userId || 'anonymous',
          userName: req.userName || 'Unknown User'
        }));
        setRequests(enrichedRequests);
      } catch (e) {
        console.error('Error loading requests:', e);
      }
    }
  };

  const loadActivities = () => {
    // In production, fetch from analytics API
    const stored = localStorage.getItem('admin_activities');
    if (stored) {
      try {
        setActivities(JSON.parse(stored));
      } catch (e) {
        setActivities([]);
      }
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTier = filterTier === 'all' || user.tier === filterTier;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesTier && matchesStatus;
  });

  const filteredRequests = requests.filter(req => {
    if (filterStatus === 'all') return true;
    return req.status === filterStatus;
  });

  const handleProcessRequest = (requestId: string, action: 'approve' | 'reject') => {
    const updated = requests.map(r => {
      if (r.id === requestId) {
        if (action === 'approve') {
          return {
            ...r,
            status: 'ready' as const,
            completedAt: new Date().toISOString(),
            content: {
              url: `https://example.com/content/${requestId}.mp4`,
              thumbnail: `https://example.com/thumbnails/${requestId}.jpg`,
              duration: 120
            }
          };
        } else {
          return {
            ...r,
            status: 'rejected' as const
          };
        }
      }
      return r;
    });

    setRequests(updated);
    
    // Update localStorage
    const allRequests = JSON.parse(localStorage.getItem('videoAudioRequests') || '[]');
    const updatedAll = allRequests.map((r: any) => 
      r.id === requestId ? updated.find(ur => ur.id === requestId) : r
    );
    localStorage.setItem('videoAudioRequests', JSON.stringify(updatedAll));
    
    // Trigger update event
    window.dispatchEvent(new CustomEvent('videoAudioRequestAdded'));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'processing': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'ready': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'completed': return 'text-white/60 bg-white/5 border-white/10';
      case 'rejected': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'active': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'inactive': return 'text-white/40 bg-white/5 border-white/10';
      case 'suspended': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-white/40 bg-white/5 border-white/10';
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'premium': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
      case 'business': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
      case 'pro': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'free': return 'text-white/60 bg-white/5 border-white/10';
      default: return 'text-white/40 bg-white/5 border-white/10';
    }
  };

  // Calculate analytics
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'active').length;
  const totalRequests = requests.length;
  const pendingRequests = requests.filter(r => r.status === 'pending' || r.status === 'processing').length;
  const totalTimeOnSite = users.reduce((sum, u) => sum + u.totalTimeOnSite, 0);
  const totalClicks = users.reduce((sum, u) => sum + u.totalClicks, 0);

  return (
    <div className="max-w-[1800px] mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="text-sm text-white/40 mb-1">Admin / Dashboard</div>
          <h1 className="text-3xl font-black tracking-tight text-white">Admin Panel</h1>
          <p className="text-sm text-white/60 mt-2">
            Manage users, requests, and view analytics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-sm text-white hover:bg-white/10 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Data
          </button>
          <button className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-sm text-white hover:bg-white/10 transition-colors flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-white/40 uppercase tracking-wider">Total Users</div>
            <Users className="w-4 h-4 text-white/40" />
          </div>
          <div className="text-2xl font-black text-white">{totalUsers}</div>
          <div className="text-xs text-green-400 mt-1">{activeUsers} active</div>
        </div>
        
        <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-white/40 uppercase tracking-wider">Pending Requests</div>
            <Clock className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="text-2xl font-black text-white">{pendingRequests}</div>
          <div className="text-xs text-white/40 mt-1">of {totalRequests} total</div>
        </div>
        
        <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-white/40 uppercase tracking-wider">Total Time</div>
            <Activity className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white">{formatDuration(totalTimeOnSite)}</div>
          <div className="text-xs text-white/40 mt-1">across all users</div>
        </div>
        
        <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-white/40 uppercase tracking-wider">Total Clicks</div>
            <BarChart2 className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white">{totalClicks.toLocaleString()}</div>
          <div className="text-xs text-white/40 mt-1">all interactions</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-white/10">
        {(['users', 'requests', 'analytics'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={`px-4 py-2 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${
              selectedTab === tab
                ? 'text-white border-white'
                : 'text-white/40 border-transparent hover:text-white/60'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Users Tab */}
      {selectedTab === 'users' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/30"
              />
            </div>
            <select
              value={filterTier}
              onChange={(e) => setFilterTier(e.target.value)}
              className="bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-white/30"
            >
              <option value="all">All Tiers</option>
              <option value="free">Free</option>
              <option value="pro">Pro</option>
              <option value="business">Business</option>
              <option value="premium">Premium</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-white/30"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          {/* Users Table */}
          <div className="bg-[#0A0A0A] border border-white/10 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-bold text-white/60 uppercase tracking-wider">User</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-white/60 uppercase tracking-wider">Tier</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-white/60 uppercase tracking-wider">Time on Site</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-white/60 uppercase tracking-wider">Clicks</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-white/60 uppercase tracking-wider">Requests</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-white/60 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-white/60 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr
                    key={user.id}
                    className="border-b border-white/5 hover:bg-white/5 cursor-pointer"
                    onClick={() => setSelectedUser(user)}
                  >
                    <td className="px-4 py-3">
                      <div>
                        <div className="text-sm font-bold text-white">{user.name}</div>
                        <div className="text-xs text-white/40">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase border ${getTierColor(user.tier)}`}>
                        {user.tier}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-white">{formatDuration(user.totalTimeOnSite)}</td>
                    <td className="px-4 py-3 text-sm text-white">{user.totalClicks.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-white">{user.requestsCount}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase border ${getStatusColor(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button className="text-white/40 hover:text-white transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Requests Tab */}
      {selectedTab === 'requests' && (
        <div className="space-y-4">
          <div className="flex gap-4 mb-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-white/30"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="ready">Ready</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="grid gap-4">
            {filteredRequests.map(request => (
              <div
                key={request.id}
                className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6 hover:border-white/20 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
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

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-white">{request.title}</h3>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                      </div>
                      <p className="text-sm text-white/60 mb-3">{request.description}</p>
                      <div className="flex items-center gap-4 text-xs text-white/40">
                        <div>User: {request.userName}</div>
                        <div>Requested: {formatDate(request.requestedAt)}</div>
                        <div>Drafts: {request.draftsRemaining} remaining</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {request.status === 'pending' || request.status === 'processing' ? (
                      <>
                        <button
                          onClick={() => handleProcessRequest(request.id, 'approve')}
                          className="px-4 py-2 rounded-lg bg-green-500 hover:bg-green-400 text-black text-sm font-bold transition-colors flex items-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleProcessRequest(request.id, 'reject')}
                          className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-400 text-white text-sm font-bold transition-colors flex items-center gap-2"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                      </>
                    ) : request.status === 'ready' && request.content?.url ? (
                      <button
                        onClick={() => window.open(request.content.url, '_blank')}
                        className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-400 text-white text-sm font-bold transition-colors flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {selectedTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">User Growth</h3>
              <div className="text-3xl font-black text-white mb-2">{totalUsers}</div>
              <div className="text-sm text-green-400 flex items-center gap-1">
                <ArrowUp className="w-4 h-4" />
                +12% this month
              </div>
            </div>
            
            <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Request Volume</h3>
              <div className="text-3xl font-black text-white mb-2">{totalRequests}</div>
              <div className="text-sm text-blue-400 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                {pendingRequests} pending
              </div>
            </div>
          </div>

          <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Tier Distribution</h3>
            <div className="space-y-3">
              {(['premium', 'business', 'pro', 'free'] as const).map(tier => {
                const count = users.filter(u => u.tier === tier).length;
                const percentage = totalUsers > 0 ? (count / totalUsers) * 100 : 0;
                return (
                  <div key={tier}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-white capitalize">{tier}</span>
                      <span className="text-sm text-white/60">{count} ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          tier === 'premium' ? 'bg-orange-500' :
                          tier === 'business' ? 'bg-purple-500' :
                          tier === 'pro' ? 'bg-blue-500' :
                          'bg-white/20'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminView;


