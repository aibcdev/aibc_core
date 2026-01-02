/**
 * Feature Flags Configuration
 * Centralized feature flag management for OpenManus integration
 */

/**
 * Master switch for OpenManus integration
 */
export function isOpenManusEnabled(): boolean {
  return process.env.OPENMANUS_ENABLED === 'true';
}

/**
 * Feature flag: Use OpenManus for footprint scanning
 */
export function useOpenManusScan(): boolean {
  return isOpenManusEnabled() && process.env.USE_OPENMANUS_SCAN === 'true';
}

/**
 * Feature flag: Use OpenManus for strategy hub
 */
export function useOpenManusStrategy(): boolean {
  return isOpenManusEnabled() && process.env.USE_OPENMANUS_STRATEGY === 'true';
}

/**
 * Feature flag: Use OpenManus for competitor analysis
 */
export function useOpenManusCompetitor(): boolean {
  return isOpenManusEnabled() && process.env.USE_OPENMANUS_COMPETITOR === 'true';
}

/**
 * Feature flag: Use OpenManus for content generation
 */
export function useOpenManusContent(): boolean {
  return isOpenManusEnabled() && process.env.USE_OPENMANUS_CONTENT === 'true';
}

/**
 * Feature flag: Use OpenManus for full orchestration
 */
export function useOpenManusOrchestration(): boolean {
  return isOpenManusEnabled() && process.env.USE_OPENMANUS_ORCHESTRATION === 'true';
}

/**
 * Get all active feature flags
 */
export function getFeatureFlags(): Record<string, boolean> {
  return {
    OPENMANUS_ENABLED: isOpenManusEnabled(),
    USE_OPENMANUS_SCAN: useOpenManusScan(),
    USE_OPENMANUS_STRATEGY: useOpenManusStrategy(),
    USE_OPENMANUS_COMPETITOR: useOpenManusCompetitor(),
    USE_OPENMANUS_CONTENT: useOpenManusContent(),
    USE_OPENMANUS_ORCHESTRATION: useOpenManusOrchestration(),
  };
}

/**
 * Validate feature flag configuration
 */
export function validateFeatureFlags(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const flags = getFeatureFlags();

  // If OpenManus is enabled, at least one feature should be enabled
  if (flags.OPENMANUS_ENABLED) {
    const hasAnyFeature = 
      flags.USE_OPENMANUS_SCAN ||
      flags.USE_OPENMANUS_STRATEGY ||
      flags.USE_OPENMANUS_COMPETITOR ||
      flags.USE_OPENMANUS_CONTENT ||
      flags.USE_OPENMANUS_ORCHESTRATION;

    if (!hasAnyFeature) {
      errors.push('OPENMANUS_ENABLED is true but no specific features are enabled');
    }
  }

  // If orchestration is enabled, it should override individual features
  if (flags.USE_OPENMANUS_ORCHESTRATION && !flags.OPENMANUS_ENABLED) {
    errors.push('USE_OPENMANUS_ORCHESTRATION requires OPENMANUS_ENABLED to be true');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
