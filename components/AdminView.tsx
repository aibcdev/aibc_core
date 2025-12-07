import React, { useState, useEffect } from 'react';
import { Shield, Users, DollarSign, Activity, TrendingUp, CreditCard, UserCheck, UserX, Search, Download } from 'lucide-react';
import { isAdmin, getAllUsers, getAdminStats } from '../services/adminService';
import { ViewState, NavProps } from '../types';

const AdminView: React.FC<NavProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'subscriptions' | 'analytics'>('overview');
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!isAdmin()) {
      onNavigate(ViewState.DASHBOARD);
      return;
    }

    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersData, statsData] = await Promise.all([
        getAllUsers(),
        getAdminStats(),
      ]);
      setUsers(usersData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      user.email?.toLowerCase().includes(query) ||
      user.name?.toLowerCase().includes(query) ||
      user.id?.toLowerCase().includes(query)
    );
  });

  if (!isAdmin()) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[60] bg-[#050505] overflow-y-auto">
      <div className="min-h-screen">
        {/* Header */}
        <header className="border-b border-white/10 bg-[#080808] sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Shield className="w-6 h-6 text-orange-500" />
                <div>
                  <h1 className="text-xl font-bold text-white">Admin Panel</h1>
                  <p className="text-xs text-white/40">Manage users, subscriptions, and platform</p>
                </div>
              </div>
              <button
                onClick={() => onNavigate(ViewState.DASHBOARD)}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm font-medium text-white hover:bg-white/10 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </header>

        {/* Tabs */}
        <div className="border-b border-white/10 bg-[#080808]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex gap-1">
              {[
                { id: 'overview', label: 'Overview', icon: Activity },
                { id: 'users', label: 'Users', icon: Users },
                { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
                { id: 'analytics', label: 'Analytics', icon: TrendingUp },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                    activeTab === id
                      ? 'text-orange-500 border-orange-500'
                      : 'text-white/40 border-transparent hover:text-white/60'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    {label}
                  </div>
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
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-[#0A0A0A] border border-white/10 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-white/40">Total Users</span>
                        <Users className="w-4 h-4 text-white/20" />
                      </div>
                      <div className="text-2xl font-bold text-white">{stats?.totalUsers || 0}</div>
                    </div>
                    <div className="bg-[#0A0A0A] border border-white/10 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-white/40">Active Subscriptions</span>
                        <CreditCard className="w-4 h-4 text-white/20" />
                      </div>
                      <div className="text-2xl font-bold text-white">{stats?.activeSubscriptions || 0}</div>
                    </div>
                    <div className="bg-[#0A0A0A] border border-white/10 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-white/40">Total Revenue</span>
                        <DollarSign className="w-4 h-4 text-white/20" />
                      </div>
                      <div className="text-2xl font-bold text-white">${(stats?.totalRevenue || 0).toLocaleString()}</div>
                    </div>
                    <div className="bg-[#0A0A0A] border border-white/10 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-white/40">Scans Today</span>
                        <Activity className="w-4 h-4 text-white/20" />
                      </div>
                      <div className="text-2xl font-bold text-white">{stats?.scansToday || 0}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Users Tab */}
              {activeTab === 'users' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <input
                        type="text"
                        placeholder="Search users by email, name, or ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-orange-500/50"
                      />
                    </div>
                    <button
                      onClick={loadData}
                      className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm font-medium text-white hover:bg-white/10 transition-colors"
                    >
                      Refresh
                    </button>
                  </div>

                  <div className="bg-[#0A0A0A] border border-white/10 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-[#080808] border-b border-white/10">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Plan</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Joined</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {filteredUsers.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="px-6 py-8 text-center text-white/40">
                                {searchQuery ? 'No users found' : 'No users yet'}
                              </td>
                            </tr>
                          ) : (
                            filteredUsers.map((user) => (
                              <tr key={user.id} className="hover:bg-white/5">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                                      {user.name?.[0] || user.email?.[0] || 'U'}
                                    </div>
                                    <div>
                                      <div className="text-sm font-medium text-white">{user.name || 'No name'}</div>
                                      <div className="text-xs text-white/40">ID: {user.id?.substring(0, 8)}...</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80">{user.email || 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="px-2 py-1 text-xs font-medium rounded bg-orange-500/20 text-orange-400">
                                    {user.subscription?.tier || 'Free'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {user.subscription?.status === 'active' ? (
                                    <span className="flex items-center gap-1 text-xs text-green-400">
                                      <UserCheck className="w-3 h-3" />
                                      Active
                                    </span>
                                  ) : (
                                    <span className="flex items-center gap-1 text-xs text-white/40">
                                      <UserX className="w-3 h-3" />
                                      Inactive
                                    </span>
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-white/60">
                                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  <button className="text-orange-400 hover:text-orange-300">View Details</button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Subscriptions Tab */}
              {activeTab === 'subscriptions' && (
                <div className="space-y-4">
                  <div className="bg-[#0A0A0A] border border-white/10 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Subscription Management</h3>
                    <p className="text-sm text-white/60">View and manage user subscriptions</p>
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
    </div>
  );
};

export default AdminView;

