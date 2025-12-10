import React from 'react';
import { Lock, Zap } from 'lucide-react';
import { SubscriptionTier, hasFeatureAccess } from '../services/subscriptionService';
import { ViewState, NavProps } from '../types';
import { isAdmin } from '../services/adminService';

interface FeatureLockProps {
  feature: string;
  requiredTier: SubscriptionTier;
  children: React.ReactNode;
  onUpgrade?: () => void;
  onNavigate?: (view: ViewState) => void;
}

const FeatureLock: React.FC<FeatureLockProps> = ({ 
  feature, 
  requiredTier, 
  children, 
  onUpgrade,
  onNavigate 
}) => {
  // Admins always have access
  const adminAccess = isAdmin();
  const hasAccess = adminAccess || hasFeatureAccess(feature);
  
  const tierNames = {
    [SubscriptionTier.FREE]: 'Free',
    [SubscriptionTier.PRO]: 'Pro',
    [SubscriptionTier.ENTERPRISE]: 'Enterprise',
  };

  if (hasAccess) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      {/* Blurred content */}
      <div className="blur-sm pointer-events-none opacity-50">
        {children}
      </div>
      
      {/* Lock overlay */}
      <div className="absolute inset-0 flex items-start justify-center bg-[#050505]/80 backdrop-blur-sm rounded-lg z-50 pt-20">
        <div className="text-center p-8 max-w-md">
          <div className="w-16 h-16 rounded-full bg-orange-500 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Upgrade to Pro to view this page</h3>
          <p className="text-white/60 mb-6">
            This feature is available on the <strong className="text-orange-400">{tierNames[requiredTier]}</strong> plan.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => {
                if (onNavigate) {
                  onNavigate(ViewState.DASHBOARD);
                }
              }}
              className="px-6 py-3 bg-white/10 border border-white/20 rounded-lg text-sm font-semibold text-white hover:bg-white/20 transition-all"
            >
              Ok
            </button>
            {onNavigate ? (
              <button
                onClick={() => onNavigate(ViewState.PRICING)}
                className="px-6 py-3 bg-orange-500 rounded-lg text-sm font-semibold text-white hover:bg-orange-600 transition-all flex items-center gap-2"
              >
                <Zap className="w-4 h-4" />
                Upgrade
              </button>
            ) : (
              <a
                href="#pricing"
                className="px-6 py-3 bg-orange-500 rounded-lg text-sm font-semibold text-white hover:bg-orange-600 transition-all flex items-center gap-2"
              >
                <Zap className="w-4 h-4" />
                Upgrade
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureLock;

