import React, { useState, useEffect } from 'react';
import { Shield, Users, Clock, MousePointerClick, Search, Download, RefreshCw, MoreHorizontal, Plus, X, CreditCard } from 'lucide-react';
import { isAdmin, getAllUsers, getAdminStats } from '../services/adminService';
import { ViewState, NavProps } from '../types';
import { SubscriptionTier, getUserSubscription, TIER_LIMITS } from '../services/subscriptionService';

interface UserData {
  id: string;
  name: string;
  email: string;
  subscription?: {
    tier: SubscriptionTier;
    status: string;
  };
  timeOnSite?: string;
  clicks?: number;
  requests?: number;
  createdAt?: string;
  onboardingData?: {
    selectedOptions: string[];
    package: string;
    companyCreatorName: string;
    timestamp: string;
  };
}

const AdminView: React.FC<NavProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'requests' | 'analytics'>('users');
  const [users, setUsers] = useState<UserData[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('All Tiers');
  const [statusFilter, setStatusFilter] = useState<string>('All Status');
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [teamMemberEmail, setTeamMemberEmail] = useState('');
  const [currentUserTier, setCurrentUserTier] = useState<SubscriptionTier>(SubscriptionTier.FREE);
  const [showAddTeamMember, setShowAddTeamMember] = useState(false);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);

  useEffect(() => {
    if (!isAdmin()) {
      onNavigate(ViewState.DASHBOARD);
      return;
    }

    loadData();
    const subscription = getUserSubscription();
    setCurrentUserTier(subscription.tier);
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersData, statsData] = await Promise.all([
        getAllUsers(),
        getAdminStats(),
      ]);
      
      // Load onboarding data from localStorage
      const allOnboardingData = JSON.parse(localStorage.getItem('allOnboardingData') || '[]');
      
      // Enhance user data with analytics and onboarding data
      const enhancedUsers = usersData.map((user: any) => {
        // Find onboarding data for this user by email
        const onboardingData = allOnboardingData.find((od: any) => od.email === user.email);
        
        return {
          ...user,
          timeOnSite: calculateTimeOnSite(user.id),
          clicks: calculateClicks(user.id),
          requests: calculateRequests(user.id),
          onboardingData: onboardingData || undefined,
        };
      });
      
      setUsers(enhancedUsers);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate time on site from localStorage analytics
  const calculateTimeOnSite = (userId: string): string => {
    try {
      const analytics = localStorage.getItem(`user_analytics_${userId}`);
      if (analytics) {
        const data = JSON.parse(analytics);
        const totalMinutes = data.totalTimeMinutes || 0;
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return `${hours}h ${minutes}m`;
      }
    } catch (e) {
      console.error('Error calculating time on site:', e);
    }
    return '0h 0m';
  };

  // Calculate clicks from localStorage analytics
  const calculateClicks = (userId: string): number => {
    try {
      const analytics = localStorage.getItem(`user_analytics_${userId}`);
      if (analytics) {
        const data = JSON.parse(analytics);
        return data.totalClicks || 0;
      }
    } catch (e) {
      console.error('Error calculating clicks:', e);
    }
    return 0;
  };

  // Calculate requests (scans, content generations, etc.)
  const calculateRequests = (userId: string): number => {
    try {
      const scans = JSON.parse(localStorage.getItem(`user_scans_${userId}`) || '[]');
      const content = JSON.parse(localStorage.getItem(`user_content_${userId}`) || '[]');
      return scans.length + content.length;
    } catch (e) {
      console.error('Error calculating requests:', e);
    }
    return 0;
  };

  const filteredUsers = users.filter(user => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!user.email?.toLowerCase().includes(query) && 
          !user.name?.toLowerCase().includes(query) &&
          !user.id?.toLowerCase().includes(query)) {
        return false;
      }
    }
    if (tierFilter !== 'All Tiers') {
      if (user.subscription?.tier !== tierFilter.toLowerCase()) {
        return false;
      }
    }
    if (statusFilter !== 'All Status') {
      const status = user.subscription?.status || 'inactive';
      if (status.toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }
    }
    return true;
  });

  const getTierLimit = (tier: SubscriptionTier): number => {
    // Free: 1, Standard: 1, Business: 3, Enterprise: 10+
    const limits: Record<SubscriptionTier, number> = {
      [SubscriptionTier.FREE]: 1,
      [SubscriptionTier.PRO]: 1,
      [SubscriptionTier.ENTERPRISE]: 10,
    };
    return limits[tier] || 1;
  };

  useEffect(() => {
    // Load team members from localStorage
    try {
      const stored = localStorage.getItem('teamMembers');
      if (stored) {
        setTeamMembers(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Error loading team members:', e);
    }
  }, []);

  const handleAddTeamMember = () => {
    if (!teamMemberEmail || !teamMemberEmail.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }
    
    const subscription = getUserSubscription();
    const tierLimit = getTierLimit(subscription.tier);
    const currentSeats = teamMembers.length + 1; // +1 for current user
    
    if (currentSeats >= tierLimit) {
      setShowBillingModal(true);
      return;
    }
    
    // Add team member
    const newMember = {
      id: `team_${Date.now()}`,
      email: teamMemberEmail,
      addedAt: new Date().toISOString(),
      status: 'pending',
    };
    
    const updated = [...teamMembers, newMember];
    setTeamMembers(updated);
    localStorage.setItem('teamMembers', JSON.stringify(updated));
    
    setTeamMemberEmail('');
    setShowAddTeamMember(false);
    alert(`Team member invitation sent to ${teamMemberEmail}`);
  };

  const getTierColor = (tier: string) => {
    switch (tier?.toUpperCase()) {
      case 'PREMIUM':
      case 'PRO':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'BUSINESS':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'ENTERPRISE':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-white/10 text-white/60 border-white/20';
    }
  };

  if (!isAdmin()) {
    return null;
  }

  // Calculate real stats
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.subscription?.status === 'active').length;
  const totalTime = users.reduce((sum, u) => {
    const timeStr = u.timeOnSite || '0h 0m';
    const match = timeStr.match(/(\d+)h\s*(\d+)m/);
    if (match) {
      return sum + parseInt(match[1]) * 60 + parseInt(match[2]);
    }
    return sum;
  }, 0);
  const totalClicks = users.reduce((sum, u) => sum + (u.clicks || 0), 0);
  const totalRequests = users.reduce((sum, u) => sum + (u.requests || 0), 0);

  const formattedTotalTime = `${Math.floor(totalTime / 60)}h ${totalTime % 60}m`;

  return (
    <div className="fixed inset-0 z-[60] bg-[#050505] overflow-y-auto">
      <div className="min-h-screen">
        {/* Header */}
        <header className="border-b border-white/10 bg-[#080808] sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-white/40 mb-1">Admin / Dashboard</div>
                <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
                <p className="text-xs text-white/40 mt-1">Manage users, requests, and view analytics</p>
              </div>
              <div className="flex items-center gap-3">
                <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm font-medium text-white hover:bg-white/10 transition-colors flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export Data
                </button>
                <button
                  onClick={loadData}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm font-medium text-white hover:bg-white/10 transition-colors flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* KPIs */}
        <div className="border-b border-white/10 bg-[#080808]">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-white/40 uppercase tracking-wider">TOTAL USERS</span>
                  <Users className="w-5 h-5 text-white/20" />
                </div>
                <div className="text-3xl font-bold text-white">{totalUsers}</div>
                <div className="text-xs text-white/40 mt-1">{activeUsers} active</div>
              </div>
              
              <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-white/40 uppercase tracking-wider">PENDING REQUESTS</span>
                  <Clock className="w-5 h-5 text-white/20" />
                </div>
                <div className="text-3xl font-bold text-white">{totalRequests}</div>
                <div className="text-xs text-white/40 mt-1">of {totalRequests} total</div>
              </div>
              
              <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-white/40 uppercase tracking-wider">TOTAL TIME</span>
                  <Clock className="w-5 h-5 text-white/20" />
                </div>
                <div className="text-3xl font-bold text-white">{formattedTotalTime}</div>
                <div className="text-xs text-white/40 mt-1">across all users</div>
              </div>
              
              <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-white/40 uppercase tracking-wider">TOTAL CLICKS</span>
                  <MousePointerClick className="w-5 h-5 text-white/20" />
                </div>
                <div className="text-3xl font-bold text-white">{totalClicks.toLocaleString()}</div>
                <div className="text-xs text-white/40 mt-1">all interactions</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-white/10 bg-[#080808]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex gap-1">
              {[
                { id: 'users', label: 'USERS' },
                { id: 'requests', label: 'REQUESTS' },
                { id: 'analytics', label: 'ANALYTICS' },
              ].map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={`px-4 py-3 text-sm font-bold transition-colors border-b-2 ${
                    activeTab === id
                      ? 'text-white border-white'
                      : 'text-white/40 border-transparent hover:text-white/60'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          {loading ? (
            <div className="text-center py-12 text-white/40">Loading admin data...</div>
          ) : (
            <>
              {/* Users Tab */}
              {activeTab === 'users' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <input
                        type="text"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-orange-500/50"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setTierFilter(tierFilter === 'All Tiers' ? 'Free' : tierFilter === 'Free' ? 'Pro' : tierFilter === 'Pro' ? 'Business' : 'All Tiers')}
                        className="px-4 py-2 bg-[#0A0A0A] border border-white/10 rounded-lg text-sm font-medium text-white hover:bg-white/5 transition-colors flex items-center gap-2"
                      >
                        {tierFilter}
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setStatusFilter(statusFilter === 'All Status' ? 'Active' : 'All Status')}
                        className="px-4 py-2 bg-[#0A0A0A] border border-white/10 rounded-lg text-sm font-medium text-white hover:bg-white/5 transition-colors flex items-center gap-2"
                      >
                        {statusFilter}
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => {
                          const subscription = getUserSubscription();
                          const tierLimit = getTierLimit(subscription.tier);
                          const currentSeats = teamMembers.length + 1;
                          
                          if (currentSeats >= tierLimit) {
                            setShowBillingModal(true);
                          } else {
                            setShowAddTeamMember(true);
                          }
                        }}
                        className="px-4 py-2 bg-orange-500 rounded-lg text-sm font-bold text-white hover:bg-orange-600 transition-colors flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add Team Member
                      </button>
                    </div>
                  </div>

                  <div className="bg-[#0A0A0A] border border-white/10 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-[#080808] border-b border-white/10">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-white/60 uppercase tracking-wider">USER</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-white/60 uppercase tracking-wider">TIER</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-white/60 uppercase tracking-wider">COMPANY/CREATOR</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-white/60 uppercase tracking-wider">ONBOARDING</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-white/60 uppercase tracking-wider">TIME ON SITE</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-white/60 uppercase tracking-wider">CLICKS</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-white/60 uppercase tracking-wider">REQUESTS</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-white/60 uppercase tracking-wider">STATUS</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-white/60 uppercase tracking-wider">ACTIONS</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {filteredUsers.length === 0 ? (
                            <tr>
                              <td colSpan={9} className="px-6 py-8 text-center text-white/40">
                                {searchQuery ? 'No users found' : 'No users yet'}
                              </td>
                            </tr>
                          ) : (
                            filteredUsers.map((user) => {
                              const onboardingOptions = user.onboardingData?.selectedOptions || [];
                              const optionLabels: Record<string, string> = {
                                'no-time': "No time",
                                'inconsistent': "Inconsistent",
                                'more-leads': "More leads",
                                'video': "Video",
                                'competitors': "Competitors",
                                'exploring': "Exploring"
                              };
                              
                              return (
                                <tr key={user.id} className="hover:bg-white/5">
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-xs font-bold text-white">
                                        {user.name?.[0] || user.email?.[0] || 'U'}
                                      </div>
                                      <div>
                                        <div className="text-sm font-medium text-white">{user.name || 'No name'}</div>
                                        <div className="text-xs text-white/40">{user.email || 'N/A'}</div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 text-xs font-bold rounded border ${getTierColor(user.subscription?.tier || 'free')}`}>
                                      {(user.subscription?.tier || 'Free').toUpperCase()}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 text-sm text-white/80">
                                    {user.onboardingData?.companyCreatorName || 'N/A'}
                                  </td>
                                  <td className="px-6 py-4">
                                    {onboardingOptions.length > 0 ? (
                                      <div className="flex flex-wrap gap-1">
                                        {onboardingOptions.slice(0, 2).map((opt: string) => (
                                          <span key={opt} className="px-2 py-1 text-xs font-medium rounded bg-white/10 text-white/80 border border-white/20">
                                            {optionLabels[opt] || opt}
                                          </span>
                                        ))}
                                        {onboardingOptions.length > 2 && (
                                          <span className="px-2 py-1 text-xs font-medium rounded bg-white/10 text-white/80 border border-white/20">
                                            +{onboardingOptions.length - 2}
                                          </span>
                                        )}
                                      </div>
                                    ) : (
                                      <span className="text-xs text-white/40">Not completed</span>
                                    )}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80">{user.timeOnSite || '0h 0m'}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80">{user.clicks?.toLocaleString() || '0'}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80">{user.requests || 0}</td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    {user.subscription?.status === 'active' ? (
                                      <span className="px-2 py-1 text-xs font-bold rounded bg-green-500/20 text-green-400 border border-green-500/30">
                                        ACTIVE
                                      </span>
                                    ) : (
                                      <span className="px-2 py-1 text-xs font-bold rounded bg-white/10 text-white/60 border border-white/20">
                                        INACTIVE
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <button className="p-2 hover:bg-white/5 rounded transition-colors">
                                      <MoreHorizontal className="w-4 h-4 text-white/40" />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Requests Tab */}
              {activeTab === 'requests' && (
                <div className="space-y-4">
                  <div className="bg-[#0A0A0A] border border-white/10 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Pending Requests</h3>
                    <p className="text-sm text-white/60">No pending requests at this time</p>
                  </div>
                </div>
              )}

              {/* Analytics Tab */}
              {activeTab === 'analytics' && (
                <div className="space-y-4">
                  <div className="bg-[#0A0A0A] border border-white/10 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Platform Analytics</h3>
                    <p className="text-sm text-white/60">View platform-wide analytics and metrics</p>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Add Team Member Modal */}
      {showAddTeamMember && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Add Team Member</h3>
              <button
                onClick={() => {
                  setShowAddTeamMember(false);
                  setTeamMemberEmail('');
                }}
                className="p-2 hover:bg-white/5 rounded transition-colors"
              >
                <X className="w-5 h-5 text-white/40" />
              </button>
            </div>
            <p className="text-sm text-white/60 mb-4">
              Invite a team member to join your workspace. They'll receive an email invitation.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-white/80 mb-2">Email Address</label>
              <input
                type="email"
                value={teamMemberEmail}
                onChange={(e) => setTeamMemberEmail(e.target.value)}
                placeholder="team@example.com"
                className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-orange-500/50"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAddTeamMember(false);
                  setTeamMemberEmail('');
                }}
                className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm font-medium text-white hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTeamMember}
                className="flex-1 px-4 py-2 bg-orange-500 rounded-lg text-sm font-bold text-white hover:bg-orange-600 transition-colors"
              >
                Send Invitation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Billing Modal */}
      {showBillingModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Upgrade Required</h3>
              <button
                onClick={() => setShowBillingModal(false)}
                className="p-2 hover:bg-white/5 rounded transition-colors"
              >
                <X className="w-5 h-5 text-white/40" />
              </button>
            </div>
            <p className="text-sm text-white/60 mb-6">
              You've reached the team member limit for your current plan ({getTierLimit(currentUserTier)} seat{getTierLimit(currentUserTier) > 1 ? 's' : ''}). 
              Upgrade to add more team members.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowBillingModal(false)}
                className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm font-medium text-white hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowBillingModal(false);
                  onNavigate(ViewState.PRICING);
                }}
                className="flex-1 px-4 py-2 bg-orange-500 rounded-lg text-sm font-bold text-white hover:bg-orange-600 transition-colors"
              >
                Upgrade Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminView;
