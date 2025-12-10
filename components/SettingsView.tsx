import React, { useState, useEffect } from 'react';
import { User, Bell, Shield, CreditCard, Globe, Moon, Sun, LogOut, Save, Eye, EyeOff, Trash2, Download, HelpCircle, Mail, Key, Smartphone, Zap } from 'lucide-react';
import { getUserSubscription, getCreditBalance, SubscriptionTier } from '../services/subscriptionService';
import { getCustomerPortalUrl, createCheckoutSession } from '../services/stripeService';
import { ViewState } from '../types';

interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
  plan: string;
  timezone: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  contentPublished: boolean;
  weeklyDigest: boolean;
  competitorAlerts: boolean;
  newFeatures: boolean;
}

const SettingsView: React.FC<{ onLogout?: () => void; onNavigate?: (view: ViewState) => void }> = ({ onLogout, onNavigate }) => {
  const [activeSection, setActiveSection] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [subscription, setSubscription] = useState(getUserSubscription());
  const [creditBalance, setCreditBalance] = useState(getCreditBalance());
  const [loadingPortal, setLoadingPortal] = useState(false);
  
  useEffect(() => {
    // Refresh subscription and credits periodically
    const interval = setInterval(() => {
      setSubscription(getUserSubscription());
      setCreditBalance(getCreditBalance());
    }, 5000);
    return () => clearInterval(interval);
  }, []);
  
  const [profile, setProfile] = useState<UserProfile>({
    name: localStorage.getItem('userName') || '',
    email: localStorage.getItem('userEmail') || '',
    plan: subscription.tier === SubscriptionTier.PRO ? 'Pro' : subscription.tier === SubscriptionTier.ENTERPRISE ? 'Enterprise' : 'Free',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });
  
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    contentPublished: true,
    weeklyDigest: true,
    competitorAlerts: true,
    newFeatures: false
  });
  
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>('dark');

  const handleSaveProfile = () => {
    setSaveStatus('saving');
    localStorage.setItem('userName', profile.name);
    localStorage.setItem('userEmail', profile.email);
    
    // Update user object in localStorage for DashboardView
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        user.name = profile.name;
        user.email = profile.email;
        localStorage.setItem('user', JSON.stringify(user));
      } catch (e) {
        console.error('Error updating user object:', e);
      }
    }
    
    // Dispatch custom event to notify DashboardView of name change
    window.dispatchEvent(new CustomEvent('userNameUpdated', { detail: { name: profile.name, email: profile.email } }));
    
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 500);
  };

  const handleSaveNotifications = () => {
    setSaveStatus('saving');
    localStorage.setItem('notificationSettings', JSON.stringify(notifications));
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 500);
  };

  const handleChangePassword = () => {
    if (passwords.new !== passwords.confirm) {
      alert('Passwords do not match');
      return;
    }
    if (passwords.new.length < 8) {
      alert('Password must be at least 8 characters');
      return;
    }
    setSaveStatus('saving');
    setTimeout(() => {
      setSaveStatus('saved');
      setPasswords({ current: '', new: '', confirm: '' });
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 500);
  };

  const handleExportData = () => {
    const data = {
      profile,
      notifications,
      brandAssets: localStorage.getItem('brandProfile'),
      brandVoice: localStorage.getItem('brandVoice'),
      scanResults: localStorage.getItem('lastScanResults'),
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'aibc-export.json';
    a.click();
  };

  const handleDeleteAccount = () => {
    // In production, this would call the backend
    localStorage.clear();
    if (onLogout) onLogout();
  };

  const sections = [
    { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { id: 'security', label: 'Security', icon: <Shield className="w-4 h-4" /> },
    { id: 'billing', label: 'Billing', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'data', label: 'Data & Privacy', icon: <Globe className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-5xl mx-auto p-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black uppercase tracking-tighter text-white mb-2">Settings</h1>
        <p className="text-white/40 text-sm">Manage your account and preferences</p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar Navigation */}
        <div className="w-48 flex-shrink-0">
          <nav className="space-y-1">
            {sections.map(section => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all ${
                  activeSection === section.id
                    ? 'bg-white/10 text-white font-medium'
                    : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}
              >
                {section.icon}
                {section.label}
              </button>
            ))}
          </nav>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-all mt-8"
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {/* Profile Section */}
          {activeSection === 'profile' && (
            <div className="space-y-6">
              <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-white mb-6">Profile Information</h2>
                
                {/* Avatar */}
                <div className="flex items-center gap-6 mb-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-2xl font-bold text-white">
                    {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <button 
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/jpeg,image/png';
                        input.onchange = (e: any) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 2 * 1024 * 1024) {
                              alert('File size must be less than 2MB');
                              return;
                            }
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              const avatarUrl = event.target?.result as string;
                              localStorage.setItem('userAvatar', avatarUrl);
                              // Update profile state
                              setProfile({...profile, avatar: avatarUrl});
                              alert('Avatar updated successfully!');
                            };
                            reader.readAsDataURL(file);
                          }
                        };
                        input.click();
                      }}
                      className="px-4 py-2 bg-white/10 hover:bg-white/15 rounded-lg text-sm text-white transition-colors"
                    >
                      Change Avatar
                    </button>
                    <p className="text-xs text-white/30 mt-2">JPG or PNG. Max 2MB.</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-white/40 uppercase tracking-wider mb-1.5">Full Name</label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile({...profile, name: e.target.value})}
                      placeholder="Your name"
                      className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/30"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/40 uppercase tracking-wider mb-1.5">Email</label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({...profile, email: e.target.value})}
                      placeholder="you@example.com"
                      className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/30"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/40 uppercase tracking-wider mb-1.5">Timezone</label>
                    <select
                      value={profile.timezone}
                      onChange={(e) => setProfile({...profile, timezone: e.target.value})}
                      className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none appearance-none"
                    >
                      <option value="America/New_York">Eastern Time (ET)</option>
                      <option value="America/Chicago">Central Time (CT)</option>
                      <option value="America/Denver">Mountain Time (MT)</option>
                      <option value="America/Los_Angeles">Pacific Time (PT)</option>
                      <option value="Europe/London">London (GMT)</option>
                      <option value="Europe/Paris">Paris (CET)</option>
                      <option value="Asia/Tokyo">Tokyo (JST)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-white/40 uppercase tracking-wider mb-1.5">Plan</label>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-2.5 bg-green-500/20 text-green-400 rounded-xl text-sm font-medium">{profile.plan}</span>
                      <button 
                        onClick={() => onNavigate?.(ViewState.PRICING)}
                        className="text-xs text-white/40 hover:text-white underline"
                      >
                        Upgrade
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <button
                    onClick={handleSaveProfile}
                    disabled={saveStatus === 'saving'}
                    className="flex items-center gap-2 px-4 py-2.5 bg-green-500 hover:bg-green-400 disabled:opacity-50 text-black text-sm font-bold rounded-xl transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Section */}
          {activeSection === 'notifications' && (
            <div className="space-y-6">
              <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-white mb-6">Notification Preferences</h2>
                
                <div className="space-y-4">
                  {[
                    { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive updates via email', icon: <Mail className="w-4 h-4" /> },
                    { key: 'pushNotifications', label: 'Push Notifications', desc: 'Browser push notifications', icon: <Bell className="w-4 h-4" /> },
                    { key: 'contentPublished', label: 'Content Published', desc: 'When your content goes live', icon: <Globe className="w-4 h-4" /> },
                    { key: 'weeklyDigest', label: 'Weekly Digest', desc: 'Summary of your performance', icon: <Mail className="w-4 h-4" /> },
                    { key: 'competitorAlerts', label: 'Competitor Alerts', desc: 'When competitors post content', icon: <Shield className="w-4 h-4" /> },
                    { key: 'newFeatures', label: 'New Features', desc: 'Product updates and announcements', icon: <HelpCircle className="w-4 h-4" /> },
                  ].map(item => (
                    <div key={item.key} className="flex items-center justify-between p-4 bg-white/[0.02] rounded-xl border border-white/5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-white/40">
                          {item.icon}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{item.label}</p>
                          <p className="text-xs text-white/40">{item.desc}</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications[item.key as keyof NotificationSettings]}
                          onChange={(e) => setNotifications({...notifications, [item.key]: e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                      </label>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end mt-6">
                  <button
                    onClick={handleSaveNotifications}
                    className="flex items-center gap-2 px-4 py-2.5 bg-green-500 hover:bg-green-400 text-black text-sm font-bold rounded-xl transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    Save Preferences
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Security Section */}
          {activeSection === 'security' && (
            <div className="space-y-6">
              <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-white mb-6">Change Password</h2>
                
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-xs text-white/40 uppercase tracking-wider mb-1.5">Current Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={passwords.current}
                        onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                        className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 pr-10"
                      />
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-white/40 uppercase tracking-wider mb-1.5">New Password</label>
                    <input
                      type="password"
                      value={passwords.new}
                      onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                      className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/30"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/40 uppercase tracking-wider mb-1.5">Confirm New Password</label>
                    <input
                      type="password"
                      value={passwords.confirm}
                      onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                      className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/30"
                    />
                  </div>
                  <button
                    onClick={handleChangePassword}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white text-sm font-medium rounded-xl transition-colors"
                  >
                    <Key className="w-4 h-4" />
                    Update Password
                  </button>
                </div>
              </div>

              <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-white mb-4">Two-Factor Authentication</h2>
                <p className="text-sm text-white/40 mb-4">Add an extra layer of security to your account</p>
                <button 
                  onClick={() => {
                    alert('2FA setup coming soon! This feature will be available in a future update.');
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white text-sm font-medium rounded-xl transition-colors"
                >
                  <Smartphone className="w-4 h-4" />
                  Enable 2FA
                </button>
              </div>
            </div>
          )}

          {/* Billing Section */}
          {activeSection === 'billing' && (
            <div className="space-y-6">
              <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-white mb-6">Current Plan</h2>
                
                <div className={`flex items-center justify-between p-4 rounded-xl mb-6 ${
                  subscription.tier === SubscriptionTier.PRO 
                    ? 'bg-green-500/10 border border-green-500/20' 
                    : subscription.tier === SubscriptionTier.ENTERPRISE
                    ? 'bg-purple-500/10 border border-purple-500/20'
                    : 'bg-white/5 border border-white/10'
                }`}>
                  <div>
                    <p className="text-lg font-bold text-white">
                      {subscription.tier === SubscriptionTier.PRO ? 'Pro Plan' : 
                       subscription.tier === SubscriptionTier.ENTERPRISE ? 'Enterprise Plan' : 'Free Plan'}
                    </p>
                    {subscription.currentPeriodEnd ? (
                      <p className="text-sm text-white/40">
                        {subscription.status === 'active' 
                          ? `Renews ${subscription.currentPeriodEnd.toLocaleDateString()}`
                          : `Expires ${subscription.currentPeriodEnd.toLocaleDateString()}`}
                      </p>
                    ) : (
                      <p className="text-sm text-white/40">No active subscription</p>
                    )}
                  </div>
                  {subscription.tier !== SubscriptionTier.FREE ? (
                    <button 
                      onClick={async () => {
                        setLoadingPortal(true);
                        try {
                          const url = await getCustomerPortalUrl();
                          window.location.href = url;
                        } catch (error: any) {
                          alert(error.message || 'Failed to open customer portal');
                        } finally {
                          setLoadingPortal(false);
                        }
                      }}
                      disabled={loadingPortal}
                      className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                    >
                      {loadingPortal ? 'Loading...' : 'Manage Plan'}
                    </button>
                  ) : (
                    <button 
                      onClick={() => onNavigate?.(ViewState.PRICING)}
                      className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-all"
                    >
                      Upgrade
                    </button>
                  )}
                </div>

                {/* Credit Balance */}
                <div className="mb-6 p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center">
                        <Zap className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-white/60">Available Credits</p>
                        <p className="text-2xl font-bold text-white">{creditBalance.credits}</p>
                      </div>
                    </div>
                    {subscription.tier === SubscriptionTier.FREE && (
                      <button 
                        onClick={() => onNavigate?.(ViewState.PRICING)}
                        className="px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-all"
                      >
                        Buy Credits
                      </button>
                    )}
                  </div>
                </div>

                {/* Payment Method - Only show if subscribed */}
                {subscription.tier !== SubscriptionTier.FREE && subscription.stripeCustomerId && (
                  <>
                    <h3 className="text-sm font-bold text-white mb-4">Payment Method</h3>
                    <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/10 rounded-xl mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-8 bg-white/10 rounded flex items-center justify-center text-white/60 text-xs font-bold">
                          CARD
                        </div>
                        <div>
                          <p className="text-sm text-white">Manage payment method in customer portal</p>
                          <p className="text-xs text-white/40">Click "Manage Plan" above to update</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Billing History */}
                <h2 className="text-lg font-bold text-white mb-4">Billing History</h2>
                <div className="space-y-3">
                  <div className="text-center py-8 text-white/40 text-sm">
                    No billing history yet
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Data & Privacy Section */}
          {activeSection === 'data' && (
            <div className="space-y-6">
              <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-white mb-4">Export Your Data</h2>
                <p className="text-sm text-white/40 mb-4">Download a copy of all your data including brand assets, content, and settings.</p>
                <button
                  onClick={handleExportData}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white text-sm font-medium rounded-xl transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export Data
                </button>
              </div>

              <div className="bg-[#0A0A0A] border border-red-500/20 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-red-400 mb-4">Danger Zone</h2>
                <p className="text-sm text-white/40 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
                
                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-medium rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Account
                  </button>
                ) : (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <p className="text-sm text-red-300 mb-4">Are you absolutely sure? This action cannot be undone.</p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="px-4 py-2 bg-white/10 text-white text-sm rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleDeleteAccount}
                        className="px-4 py-2 bg-red-500 text-white text-sm font-bold rounded-lg"
                      >
                        Yes, Delete My Account
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsView;

