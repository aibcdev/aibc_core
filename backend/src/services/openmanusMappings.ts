/**
 * OpenManus Agent Mappings
 * Maps current agent types to OpenManus agent capabilities
 */

export type AgentType = 
  | 'research' 
  | 'think' 
  | 'media' 
  | 'review' 
  | 'browser' 
  | 'helper' 
  | 'poster' 
  | 'video-analysis';

export interface AgentMapping {
  openmanusCapability: string;
  description: string;
  maxSteps: number;
  contextFields?: string[];
}

/**
 * Agent type to OpenManus capability mappings
 */
export const AGENT_MAPPINGS: Record<AgentType, AgentMapping> = {
  research: {
    openmanusCapability: 'research',
    description: 'Research and data gathering using web search, browser automation, and data analysis',
    maxSteps: 25,
    contextFields: ['brandName', 'industry', 'keywords', 'competitors', 'timeframe'],
  },
  think: {
    openmanusCapability: 'strategic-analysis',
    description: 'Strategic analysis, decision making, and content optimization',
    maxSteps: 20,
    contextFields: ['brandDNA', 'competitorIntelligence', 'strategicInsights', 'userMessage'],
  },
  media: {
    openmanusCapability: 'content-generation',
    description: 'Content and media generation including text, images, and video scripts',
    maxSteps: 15,
    contextFields: ['brandDNA', 'extractedContent', 'brandAssets', 'platform', 'format'],
  },
  review: {
    openmanusCapability: 'quality-assurance',
    description: 'Quality checking, validation, and content review',
    maxSteps: 10,
    contextFields: ['content', 'brandVoice', 'qualityCriteria'],
  },
  browser: {
    openmanusCapability: 'web-automation',
    description: 'Web automation, scraping, and browser interaction',
    maxSteps: 30,
    contextFields: ['url', 'action', 'selectors', 'data'],
  },
  helper: {
    openmanusCapability: 'utility',
    description: 'Utility tasks, scheduling, and content delivery',
    maxSteps: 10,
    contextFields: ['action', 'data', 'target'],
  },
  poster: {
    openmanusCapability: 'content-distribution',
    description: 'Content publishing and distribution across platforms',
    maxSteps: 15,
    contextFields: ['content', 'platform', 'schedule'],
  },
  'video-analysis': {
    openmanusCapability: 'video-analysis',
    description: 'Video content analysis and insight extraction',
    maxSteps: 20,
    contextFields: ['videoUrl', 'transcript', 'platform'],
  },
};

/**
 * Get OpenManus capability for an agent type
 */
export function getOpenManusCapability(agentType: AgentType): string {
  return AGENT_MAPPINGS[agentType]?.openmanusCapability || 'general';
}

/**
 * Get recommended max steps for an agent type
 */
export function getMaxSteps(agentType: AgentType): number {
  return AGENT_MAPPINGS[agentType]?.maxSteps || 20;
}

/**
 * Build context object for OpenManus task from agent context
 */
export function buildOpenManusContext(
  agentType: AgentType,
  context: Record<string, any>
): Record<string, any> {
  const mapping = AGENT_MAPPINGS[agentType];
  if (!mapping?.contextFields) {
    return context;
  }

  // Filter context to only include relevant fields
  const filteredContext: Record<string, any> = {};
  for (const field of mapping.contextFields) {
    if (context[field] !== undefined) {
      filteredContext[field] = context[field];
    }
  }

  return filteredContext;
}

/**
 * Convert agent task to OpenManus task prompt
 */
export function buildOpenManusTaskPrompt(
  agentType: AgentType,
  task: string,
  context: Record<string, any>
): string {
  const mapping = AGENT_MAPPINGS[agentType];
  
  let prompt = task;
  
  // Add context information to prompt
  const contextObj = buildOpenManusContext(agentType, context);
  if (Object.keys(contextObj).length > 0) {
    const contextStr = JSON.stringify(contextObj, null, 2);
    prompt = `${task}\n\nContext:\n${contextStr}`;
  }

  return prompt;
}
