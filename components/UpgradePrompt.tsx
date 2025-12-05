import React from 'react';
import { Zap, X, CheckCircle, ArrowRight } from 'lucide-react';
import { UserTier } from '../services/creditClient';

interface UpgradePromptProps {
  feature: string;
  requiredTier: UserTier;
  currentTier: UserTier;
  creditsRequired?: number;
  creditsAvailable?: number;
  onUpgrade?: () => void;
  onClose?: () => void;
}

const TIER_NAMES: Record<UserTier, string> = {
  free: 'Free',
  pro: 'Pro',
  business: 'Business',
  premium: 'Premium'
};

const TIER_COLORS: Record<UserTier, string> = {
  free: 'text-white/60',
  pro: 'text-blue-400',
  business: 'text-purple-400',
  premium: 'text-orange-400'
};

const FEATURE_NAMES: Record<string, string> = {
  'content.video': 'Video Generation',
  'content.audio': 'Audio Generation',
  'content.podcast': 'Podcast Generation',
  'content.image': 'Image Generation',
  'scan.deep': 'Deep Scan',
  'analytics.custom': 'Custom Analytics',
  'competitor.deep': 'Deep Competitor Analysis'
};

export const UpgradePrompt: React.FC<UpgradePromptProps> = ({
  feature,
  requiredTier,
  currentTier,
  creditsRequired,
  creditsAvailable,
  onUpgrade,
  onClose
}) => {
  const featureName = FEATURE_NAMES[feature] || feature;
  const isCreditIssue = creditsRequired && creditsAvailable !== undefined && creditsAvailable < creditsRequired;
  
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        {onClose && (
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        
        <div className="mb-6">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-500/20 to-red-500/20 flex items-center justify-center mb-4">
            <Zap className="w-6 h-6 text-orange-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {isCreditIssue ? 'Insufficient Credits' : 'Upgrade Required'}
          </h2>
          <p className="text-sm text-white/60">
            {isCreditIssue 
              ? `You need ${creditsRequired} credits to use ${featureName}, but you only have ${creditsAvailable}.`
              : `${featureName} is only available in the ${TIER_NAMES[requiredTier]} tier.`
            }
          </p>
        </div>
        
        {!isCreditIssue && (
          <div className="bg-white/5 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-white/60">Current Plan</span>
              <span className={`text-sm font-bold ${TIER_COLORS[currentTier]}`}>
                {TIER_NAMES[currentTier]}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/60">Required Plan</span>
              <span className={`text-sm font-bold ${TIER_COLORS[requiredTier]}`}>
                {TIER_NAMES[requiredTier]}
              </span>
            </div>
          </div>
        )}
        
        <div className="space-y-3">
          <button
            onClick={() => {
              if (onUpgrade) {
                onUpgrade();
              } else {
                window.location.href = '#pricing';
              }
              if (onClose) onClose();
            }}
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2"
          >
            {isCreditIssue ? 'Purchase Credits' : `Upgrade to ${TIER_NAMES[requiredTier]}`}
            <ArrowRight className="w-4 h-4" />
          </button>
          
          {onClose && (
            <button
              onClick={onClose}
              className="w-full py-3 bg-white/5 hover:bg-white/10 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Maybe Later
            </button>
          )}
        </div>
        
        {!isCreditIssue && (
          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="text-xs text-white/40 mb-2">What you'll get with {TIER_NAMES[requiredTier]}:</div>
            <div className="space-y-2">
              {requiredTier === 'premium' && (
                <>
                  <div className="flex items-center gap-2 text-xs text-white/60">
                    <CheckCircle className="w-3 h-3 text-green-400" />
                    <span>Video & Audio Generation</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/60">
                    <CheckCircle className="w-3 h-3 text-green-400" />
                    <span>Unlimited Scans</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/60">
                    <CheckCircle className="w-3 h-3 text-green-400" />
                    <span>2,000 Credits/Month</span>
                  </div>
                </>
              )}
              {requiredTier === 'business' && (
                <>
                  <div className="flex items-center gap-2 text-xs text-white/60">
                    <CheckCircle className="w-3 h-3 text-green-400" />
                    <span>Custom Analytics Reports</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/60">
                    <CheckCircle className="w-3 h-3 text-green-400" />
                    <span>Deep Competitor Analysis</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/60">
                    <CheckCircle className="w-3 h-3 text-green-400" />
                    <span>500 Credits/Month</span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpgradePrompt;


