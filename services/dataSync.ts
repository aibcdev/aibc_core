/**
 * Data Sync Service
 * Centralizes data synchronization across Analytics, Strategy, and Content Hub
 * Ensures all views stay in sync when changes are made
 */

// Event types for cross-component communication
export type SyncEventType = 
  | 'scanComplete'
  | 'newScanStarted'
  | 'strategyUpdated'
  | 'contentHubUpdated'
  | 'brandAssetsUpdated'
  | 'competitorUpdated'
  | 'analyticsUpdated';

interface SyncEventDetail {
  timestamp: number;
  source: string;
  data?: any;
}

/**
 * Dispatch a sync event to all listening components
 */
export const dispatchSyncEvent = (eventType: SyncEventType, data?: any, source: string = 'unknown') => {
  const detail: SyncEventDetail = {
    timestamp: Date.now(),
    source,
    data
  };
  
  console.log(`📡 [DataSync] Dispatching ${eventType} from ${source}`);
  window.dispatchEvent(new CustomEvent(eventType, { detail }));
  
  // Also trigger a general 'dataChanged' event for components that want to react to any change
  window.dispatchEvent(new CustomEvent('dataChanged', { 
    detail: { ...detail, eventType } 
  }));
};

/**
 * Get all current brand data from localStorage
 */
export const getBrandData = () => {
  try {
    const lastScanResults = localStorage.getItem('lastScanResults');
    const scanData = lastScanResults ? JSON.parse(lastScanResults) : null;
    
    return {
      scanUsername: localStorage.getItem('lastScannedUsername'),
      brandDNA: scanData?.brandDNA || null,
      competitorIntelligence: scanData?.competitorIntelligence || [],
      strategicInsights: scanData?.strategicInsights || [],
      contentIdeas: scanData?.contentIdeas || [],
      brandMaterials: JSON.parse(localStorage.getItem('brandMaterials') || '[]'),
      brandProfile: JSON.parse(localStorage.getItem('brandProfile') || 'null'),
      brandVoice: JSON.parse(localStorage.getItem('brandVoice') || 'null'),
      brandColors: JSON.parse(localStorage.getItem('brandColors') || '[]'),
      brandFonts: JSON.parse(localStorage.getItem('brandFonts') || '[]'),
      activeStrategy: JSON.parse(localStorage.getItem('activeContentStrategy') || 'null'),
      strategyPlans: JSON.parse(localStorage.getItem('strategyPlans') || '[]'),
      timestamp: localStorage.getItem('lastScanTimestamp')
    };
  } catch (e) {
    console.error('Error loading brand data:', e);
    return null;
  }
};

/**
 * Update scan results and notify all components
 */
export const updateScanResults = (updates: Partial<{
  brandDNA: any;
  competitorIntelligence: any[];
  strategicInsights: any[];
  contentIdeas: any[];
}>, source: string = 'unknown') => {
  try {
    const lastScanResults = localStorage.getItem('lastScanResults');
    const scanData = lastScanResults ? JSON.parse(lastScanResults) : {};
    
    const updated = {
      ...scanData,
      ...updates,
      lastUpdated: Date.now()
    };
    
    localStorage.setItem('lastScanResults', JSON.stringify(updated));
    
    // Dispatch relevant events
    if (updates.strategicInsights) {
      dispatchSyncEvent('strategyUpdated', updates.strategicInsights, source);
    }
    if (updates.competitorIntelligence) {
      dispatchSyncEvent('competitorUpdated', updates.competitorIntelligence, source);
    }
    if (updates.contentIdeas) {
      dispatchSyncEvent('contentHubUpdated', updates.contentIdeas, source);
    }
    
    return true;
  } catch (e) {
    console.error('Error updating scan results:', e);
    return false;
  }
};

/**
 * Update brand assets and notify Content Hub
 */
export const updateBrandAssets = (assetType: 'materials' | 'profile' | 'voice' | 'colors' | 'fonts', data: any) => {
  try {
    const keyMap = {
      materials: 'brandMaterials',
      profile: 'brandProfile',
      voice: 'brandVoice',
      colors: 'brandColors',
      fonts: 'brandFonts'
    };
    
    localStorage.setItem(keyMap[assetType], JSON.stringify(data));
    dispatchSyncEvent('brandAssetsUpdated', { assetType, data }, 'BrandAssets');
    
    return true;
  } catch (e) {
    console.error('Error updating brand assets:', e);
    return false;
  }
};

/**
 * Update active strategy and notify all components
 */
export const updateActiveStrategy = (strategy: any) => {
  try {
    localStorage.setItem('activeContentStrategy', JSON.stringify({
      ...strategy,
      appliedAt: new Date().toISOString(),
      affectsContentGeneration: true
    }));
    
    dispatchSyncEvent('strategyUpdated', strategy, 'Strategy');
    
    return true;
  } catch (e) {
    console.error('Error updating active strategy:', e);
    return false;
  }
};

/**
 * Add or update a competitor and notify all components
 */
export const updateCompetitor = (competitor: any, action: 'add' | 'update' | 'remove') => {
  try {
    const lastScanResults = localStorage.getItem('lastScanResults');
    const scanData = lastScanResults ? JSON.parse(lastScanResults) : {};
    
    let competitors = scanData.competitorIntelligence || [];
    
    if (action === 'add') {
      competitors = [...competitors, competitor];
    } else if (action === 'update') {
      competitors = competitors.map((c: any) => 
        c.name === competitor.name ? { ...c, ...competitor } : c
      );
    } else if (action === 'remove') {
      competitors = competitors.filter((c: any) => c.name !== competitor.name);
    }
    
    scanData.competitorIntelligence = competitors;
    localStorage.setItem('lastScanResults', JSON.stringify(scanData));
    
    dispatchSyncEvent('competitorUpdated', { competitor, action, competitors }, 'Competitors');
    
    return true;
  } catch (e) {
    console.error('Error updating competitor:', e);
    return false;
  }
};

/**
 * Clear all cached data for a fresh scan
 * COMPREHENSIVE - clears everything except user auth and integrations
 */
export const clearAllCachedData = () => {
  const keysToRemove = [
    // Core scan data
    'lastScanResults',
    'lastScanId',
    'lastScanTimestamp',
    'lastScannedUsername',
    'lastScanType',
    
    // Content and production
    'productionAssets',
    'contentPreferences',
    
    // Strategy data - including conversation history
    'strategyPlans',
    'activeContentStrategy',
    'strategyConversation',
    'strategyMessages',
    'strategyHistory',
    
    // Brand assets
    'brandMaterials',
    'brandProfile',
    'brandVoice',
    'brandColors',
    'brandFonts',
    
    // Analytics
    'analyticsCache',
    'previousInsightsCount',
    
    // Inbox and calendar
    'inboxItems',
    'calendarEvents',
  ];
  
  keysToRemove.forEach(key => localStorage.removeItem(key));
  
  dispatchSyncEvent('newScanStarted', { cleared: true, isRescan: true }, 'DataSync');
};

/**
 * Listen for any data change across the app
 */
export const onDataChange = (callback: (event: CustomEvent<SyncEventDetail & { eventType: SyncEventType }>) => void) => {
  const handler = (e: Event) => callback(e as CustomEvent);
  window.addEventListener('dataChanged', handler);
  return () => window.removeEventListener('dataChanged', handler);
};

export default {
  dispatchSyncEvent,
  getBrandData,
  updateScanResults,
  updateBrandAssets,
  updateActiveStrategy,
  updateCompetitor,
  clearAllCachedData,
  onDataChange
};

