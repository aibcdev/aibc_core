import React, { useEffect, useState } from 'react';
import { Lock, ArrowRight } from 'lucide-react';
import { checkFeatureAccess, type UserTier } from '../services/creditClient';
import UpgradePrompt from './UpgradePrompt';

interface FeatureLockProps {
  feature: string;
  userTier: UserTier;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const FeatureLock: React.FC<FeatureLockProps> = ({ 
  feature, 
  userTier, 
  children, 
  fallback 
}) => {
  const [access, setAccess] = useState<{ allowed: boolean; reason?: string; creditsRequired?: number; creditsAvailable?: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUpgrade, setShowUpgrade] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      setLoading(true);
      try {
        const result = await checkFeatureAccess(feature, userTier);
        setAccess(result);
        if (!result.allowed) {
          setShowUpgrade(true);
        }
      } catch (error) {
        console.error('Error checking feature access:', error);
        setAccess({ allowed: false, reason: 'Error checking access' });
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [feature, userTier]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!access?.allowed) {
    if (fallback) {
      return <>{fallback}</>;
    }

    // Determine required tier
    let requiredTier: UserTier = 'premium';
    if (feature.includes('video') || feature.includes('audio') || feature.includes('podcast')) {
      requiredTier = 'premium';
    } else if (feature.includes('custom') || feature.includes('deep')) {
      requiredTier = 'business';
    } else if (feature.includes('image')) {
      requiredTier = 'pro';
    }

    return (
      <>
        <div className="flex flex-col items-center justify-center p-12 bg-[#0A0A0A] border border-white/10 rounded-xl">
          <div className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-orange-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Feature Locked</h3>
          <p className="text-white/60 text-center max-w-md mb-6">
            {access?.reason || `This feature requires a ${requiredTier} tier subscription.`}
          </p>
          <button
            onClick={() => setShowUpgrade(true)}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Upgrade to {requiredTier.charAt(0).toUpperCase() + requiredTier.slice(1)}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        {showUpgrade && access && (
          <UpgradePrompt
            feature={feature}
            requiredTier={requiredTier}
            currentTier={userTier}
            creditsRequired={access.creditsRequired}
            creditsAvailable={access.creditsAvailable}
            onClose={() => setShowUpgrade(false)}
            onUpgrade={() => {
              window.location.href = '#pricing';
            }}
          />
        )}
      </>
    );
  }

  return <>{children}</>;
};

export default FeatureLock;

