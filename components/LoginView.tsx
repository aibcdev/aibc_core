import React, { useState } from 'react';
import { ArrowLeft, Loader2, X } from 'lucide-react';
import { ViewState, NavProps } from '../types';
import { signUp, signInWithGoogle } from '../services/authClient';

const LoginView: React.FC<NavProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showLegal, setShowLegal] = useState<'terms' | 'privacy' | null>(null);

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!email || !password) {
      setError('Email and password are required');
      setLoading(false);
      return;
    }

    try {
      const result = await signUp(email, password, firstName, lastName);
      if (result.success) {
        // Check if user has completed onboarding
        const hasCompletedOnboarding = localStorage.getItem('lastScannedUsername');
        onNavigate(hasCompletedOnboarding ? ViewState.DASHBOARD : ViewState.INGESTION);
      } else {
        setError(result.error || 'Sign up failed. Please try again.');
        setLoading(false);
      }
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message || 'Sign up failed. Please try again.');
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithGoogle('');
      // Navigation will happen via redirect or callback
    } catch (err: any) {
      console.error('Google signup error:', err);
      setError(err.message || 'Google sign-up failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div id="login-view" className="fixed inset-0 z-[60] bg-[#050505] overflow-y-auto">
      {/* Step Indicator */}
      <div className="absolute top-12 left-0 right-0 flex flex-col items-center gap-6 z-10">
        <div className="px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-[10px] font-mono text-white/40 tracking-widest">
          STEP 01 / 04
        </div>
      </div>
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative">
        {/* Back link */}
        <button 
          onClick={() => onNavigate(ViewState.LANDING)}
          className="absolute top-6 left-6 flex items-center gap-2 text-xs font-medium text-white/40 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {/* Logo */}
        <div className="mb-8 flex items-center gap-2">
          <div className="h-8 w-8 flex items-center justify-center text-white">
             <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="48" stroke="currentColor" strokeWidth="4" />
                <circle cx="50" cy="50" r="34" stroke="currentColor" strokeWidth="4" />
                <circle cx="50" cy="50" r="20" stroke="currentColor" strokeWidth="4" />
                <circle cx="50" cy="50" r="6" fill="currentColor" />
             </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">AIBC</span>
        </div>

        {/* Content */}
        <div className="w-full max-w-[400px]">
          <h1 className="text-3xl font-serif font-medium tracking-tight text-center text-white mb-2">Create your free account</h1>
          <p className="text-center text-white/50 mb-8 text-sm">Try AIBC free for 7 days.</p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Google Sign-In Button */}
          <div className="mb-4">
            <button
              onClick={handleGoogleSignUp}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 py-2.5 text-sm font-medium text-white hover:bg-white/10 transition-all hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M23.52 12.29C23.52 11.43 23.44 10.61 23.3 9.82H12V14.45H18.45C18.17 15.93 17.32 17.18 16.05 18.03V21.01H19.92C22.18 18.93 23.52 15.86 23.52 12.29Z" fill="#4285F4"></path>
                      <path d="M12 24C15.24 24 17.96 22.92 19.92 21.01L16.05 18.03C14.98 18.75 13.61 19.17 12 19.17C8.87 19.17 6.22 17.06 5.27 14.21H1.27V17.31C3.25 21.24 7.31 24 12 24Z" fill="#34A853"></path>
                      <path d="M5.27 14.21C5.03 13.49 4.9 12.74 4.9 12C4.9 11.26 5.03 10.51 5.27 9.79V6.69H1.27C0.46 8.3 0 10.1 0 12C0 13.9 0.46 15.7 1.27 17.31L5.27 14.21Z" fill="#FBBC05"></path>
                      <path d="M12 4.83C13.76 4.83 15.34 5.44 16.58 6.63L20.01 3.2C17.96 1.29 15.24 0 12 0C7.31 0 3.25 2.76 1.27 6.69L5.27 9.79C6.22 6.94 8.87 4.83 12 4.83Z" fill="#EA4335"></path>
                    </svg>
                    Continue with Google
                  </>
                )}
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
          </div>

          <form className="space-y-5" onSubmit={handleEmailSignUp}>
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1.5 ml-1">Email</label>
              <input 
                type="email" 
                placeholder="jenny@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg bg-[#0A0A0A] border border-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/10 transition-all" 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1.5 ml-1">First name</label>
                <input 
                  type="text" 
                  placeholder="Jenny" 
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full rounded-lg bg-[#0A0A0A] border border-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/10 transition-all" 
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1.5 ml-1">Last name</label>
                <input 
                  type="text" 
                  placeholder="Smith" 
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full rounded-lg bg-[#0A0A0A] border border-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/10 transition-all" 
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-white/70 mb-1.5 ml-1">Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full rounded-lg bg-[#0A0A0A] border border-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/10 transition-all" 
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full rounded-lg bg-[#FF5E1E] py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 hover:bg-[#FF5E1E]/90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing up...
                </>
              ) : (
                'Continue with email'
              )}
            </button>
          </form>

          <div className="mt-8 text-center space-y-4">
            <p className="text-[11px] text-white/30 leading-relaxed max-w-xs mx-auto">
              By continuing, you agree to AIBC's <button onClick={() => setShowLegal('terms')} className="text-white/50 hover:text-white underline decoration-white/20 underline-offset-2">Terms of Service</button>. Read our <button onClick={() => setShowLegal('privacy')} className="text-white/50 hover:text-white underline decoration-white/20 underline-offset-2">Privacy Policy</button>.
            </p>
            <p className="text-xs text-white/40">
              Already have an account? <button onClick={() => onNavigate(ViewState.SIGNIN)} className="text-orange-500 hover:text-orange-400 font-medium transition-colors">Log in</button>.
            </p>
          </div>
        </div>
      </div>
      
      {/* Legal Modal */}
      {showLegal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowLegal(null)}></div>
          <div className="relative w-full max-w-2xl bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-xl font-bold text-white">{showLegal === 'terms' ? 'Terms of Service' : 'Privacy Policy'}</h2>
              <button onClick={() => setShowLegal(null)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm text-white/70 font-sans leading-relaxed">
                {showLegal === 'terms' ? `AIBC Media Terms of Service

Last Updated: December 2024

1. Acceptance of Terms
By accessing or using AIBC Media, you agree to be bound by these Terms of Service.

2. Use of Service
You may use our service for lawful purposes only. You are responsible for all content you create using our platform.

3. Account Responsibilities
You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.

4. Intellectual Property
Content you create using AIBC Media belongs to you. Our platform, including its design and technology, remains our intellectual property.

5. Subscription and Payments
Paid subscriptions are billed in advance. Refunds are available within 14 days of purchase for annual plans.

6. Limitation of Liability
AIBC Media is provided "as is" without warranties of any kind.

7. Contact
For questions about these Terms, contact us at legal@aibcmedia.com.` : `AIBC Media Privacy Policy

Last Updated: December 2024

1. Information We Collect
We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support.

2. How We Use Your Information
We use the information we collect to provide, maintain, and improve our services.

3. Information Sharing
We do not sell or rent your personal information to third parties.

4. Data Security
We implement appropriate technical and organizational measures to protect your personal information.

5. Your Rights
You have the right to access, correct, or delete your personal information.

6. Contact Us
For any questions about this Privacy Policy, please contact us at privacy@aibcmedia.com.`}
              </pre>
            </div>
            <div className="p-6 border-t border-white/10 flex justify-end">
              <button 
                onClick={() => setShowLegal(null)}
                className="px-4 py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-white/90 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginView;