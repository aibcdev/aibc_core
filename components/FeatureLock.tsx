import React from 'react';
import { Lock, Zap } from 'lucide-react';
import { SubscriptionTier, hasFeatureAccess } from '../services/subscriptionService';
import { ViewState, NavProps } from '../types';

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
  const hasAccess = hasFeatureAccess(feature);
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
      <div className="absolute inset-0 flex items-center justify-center bg-[#050505]/80 backdrop-blur-sm rounded-lg">
        <div className="text-center p-8 max-w-md">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-orange-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Feature Locked</h3>
          <p className="text-white/60 mb-6">
            This feature is available on the <strong className="text-orange-400">{tierNames[requiredTier]}</strong> plan.
          </p>
          <div className="flex gap-3 justify-center">
            {onUpgrade ? (
              <button
                onClick={onUpgrade}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-purple-600 rounded-lg text-sm font-semibold text-white hover:from-orange-600 hover:to-purple-700 transition-all flex items-center gap-2"
              >
                <Zap className="w-4 h-4" />
                Upgrade to {tierNames[requiredTier]}
              </button>
            ) : onNavigate ? (
              <button
                onClick={() => onNavigate(ViewState.PRICING)}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-purple-600 rounded-lg text-sm font-semibold text-white hover:from-orange-600 hover:to-purple-700 transition-all flex items-center gap-2"
              >
                <Zap className="w-4 h-4" />
                View Plans
              </button>
            ) : (
              <a
                href="#pricing"
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-purple-600 rounded-lg text-sm font-semibold text-white hover:from-orange-600 hover:to-purple-700 transition-all flex items-center gap-2"
              >
                <Zap className="w-4 h-4" />
                View Plans
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureLock;

