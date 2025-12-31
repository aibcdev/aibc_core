/**
 * Think Agent - Advanced Reasoning with LLM
 * Uses Anthropic Chat Model and memory management for strategic decisions
 */

import { generateText, generateJSON, getProviderForTier } from '../llmService';

interface ThinkContext {
  brandData?: any;
  brandDNA?: any;
  goals?: any;
  data?: any;
  context?: any;
  content?: any;
  metrics?: any;
  options?: any[];
  criteria?: any;
  competitorIntelligence?: any[];
  strategicInsights?: any[];
}

// Simple in-memory storage for agent memory
const agentMemory = new Map<string, any[]>();

import { browserAgent } from './browserAgent';
import { getFeedbackStats, getLearningInsights } from '../feedbackService';

/**
 * Think Agent implementation
 */
export const thinkAgent = {
  /**
   * Execute think task
   */
  async execute(task: string, context: ThinkContext): Promise<any> {
    console.log(`[Think Agent] Executing task: ${task}`);

    switch (task) {
      case 'analyze-strategy':
        return await analyzeStrategy(context);
      case 'generate-insights':
        return await generateInsights(context);
      case 'optimize-content':
        return await optimizeContent(context);
      case 'make-decision':
        return await makeDecision(context);
      case 'optimize-content-strategy':
        return await optimizeContentStrategy(context);
      case 'process-request':
        return await processRequest(context);
      case 'analyze-research':
        return await analyzeResearch(context);
      case 'plan-strategy-execution':
        return await planStrategyExecution(context);
      case 'evaluate-strategy-options':
        return await evaluateStrategyOptions(context);
      case 'refine-strategy-based-on-feedback':
        return await refineStrategyBasedOnFeedback(context);
      default:
        throw new Error(`Unknown think task: ${task}`);
    }
  },
};

/**
 * Analyze content strategy
 */
async function analyzeStrategy(context: ThinkContext): Promise<any> {
  const { brandData, goals } = context;

  if (!brandData) {
    throw new Error('Brand data required for strategy analysis');
  }

  try {
    const prompt = `Analyze the content strategy for this brand and provide strategic recommendations.

Brand Data:
${JSON.stringify(brandData, null, 2)}

Goals:
${goals ? JSON.stringify(goals, null, 2) : 'Not specified'}

Provide a comprehensive strategy analysis including:
1. Current content strengths and weaknesses
2. Recommended content themes and topics
3. Optimal posting frequency and timing
4. Platform-specific strategies
5. Competitive positioning recommendations

Return as JSON with keys: strengths, weaknesses, recommendations, themes, frequency, platforms, positioning.`;

    const systemPrompt = 'You are an expert content strategist. Provide detailed, actionable strategic recommendations.';

    const result = await generateJSON<any>(prompt, systemPrompt, { tier: 'deep' });

    // Store in memory
    storeMemory('strategy', {
      brandData,
      goals,
      analysis: result,
      timestamp: new Date().toISOString(),
    });

    return {
      success: true,
      analysis: result,
      generatedAt: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error('[Think Agent] Strategy analysis error:', error);
    throw error;
  }
}

/**
 * Generate strategic insights
 */
async function generateInsights(context: ThinkContext): Promise<any> {
  const { data, context: ctx } = context;

  if (!data) {
    throw new Error('Data required for insight generation');
  }

  try {
    const prompt = `Analyze the following data and generate strategic insights:

Data:
${JSON.stringify(data, null, 2)}

Context:
${ctx ? JSON.stringify(ctx, null, 2) : 'No additional context'}

Generate insights that include:
1. Key patterns and trends
2. Opportunities for improvement
3. Potential risks or challenges
4. Actionable recommendations

Return as JSON with keys: patterns, opportunities, risks, recommendations.`;

    const systemPrompt = 'You are an expert analyst. Provide deep, actionable insights.';

    const result = await generateJSON<any>(prompt, systemPrompt, { tier: 'deep' });

    // Store in memory
    storeMemory('insights', {
      data,
      insights: result,
      timestamp: new Date().toISOString(),
    });

    return {
      success: true,
      insights: result,
      generatedAt: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error('[Think Agent] Insight generation error:', error);
    throw error;
  }
}

/**
 * Optimize content based on metrics
 */
async function optimizeContent(context: ThinkContext): Promise<any> {
  const { content, metrics } = context;

  if (!content) {
    throw new Error('Content required for optimization');
  }

  try {
    const prompt = `Optimize the following content based on performance metrics:

Content:
${JSON.stringify(content, null, 2)}

Metrics:
${metrics ? JSON.stringify(metrics, null, 2) : 'No metrics provided'}

Provide optimized version with:
1. Improved headlines/hooks
2. Better structure and flow
3. Enhanced engagement elements
4. Platform-specific optimizations

Return as JSON with keys: optimizedContent, improvements, recommendations.`;

    const systemPrompt = 'You are an expert content optimizer. Improve content for maximum engagement.';

    const result = await generateJSON<any>(prompt, systemPrompt, { tier: 'deep' });

    return {
      success: true,
      optimized: result.optimizedContent || content,
      improvements: result.improvements || [],
      recommendations: result.recommendations || [],
      optimizedAt: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error('[Think Agent] Content optimization error:', error);
    throw error;
  }
}

/**
 * Make strategic decision
 */
async function makeDecision(context: ThinkContext): Promise<any> {
  const { options, criteria } = context;

  if (!options || options.length === 0) {
    throw new Error('Options required for decision making');
  }

  try {
    const prompt = `Make a strategic decision based on the following options and criteria:

Options:
${JSON.stringify(options, null, 2)}

Criteria:
${criteria ? JSON.stringify(criteria, null, 2) : 'Maximize value and minimize risk'}

Evaluate each option and provide:
1. Recommended option with reasoning
2. Pros and cons of each option
3. Risk assessment
4. Implementation considerations

Return as JSON with keys: recommendedOption, reasoning, prosCons, riskAssessment, implementation.`;

    const systemPrompt = 'You are an expert decision maker. Provide clear, well-reasoned decisions.';

    const result = await generateJSON<any>(prompt, systemPrompt, { tier: 'deep' });

    return {
      success: true,
      decision: result.recommendedOption,
      reasoning: result.reasoning,
      prosCons: result.prosCons || {},
      riskAssessment: result.riskAssessment || {},
      implementation: result.implementation || {},
      decidedAt: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error('[Think Agent] Decision making error:', error);
    throw error;
  }
}

/**
 * Optimize content strategy
 */
async function optimizeContentStrategy(context: ThinkContext): Promise<any> {
  const { brandDNA, competitorIntelligence } = context;

  if (!brandDNA) {
    throw new Error('Brand DNA required for content strategy optimization');
  }

  try {
    const prompt = `Optimize the content strategy based on brand DNA and competitor intelligence:

Brand DNA:
${JSON.stringify(brandDNA, null, 2)}

Competitor Intelligence:
${competitorIntelligence ? JSON.stringify(competitorIntelligence, null, 2) : 'Not available'}

Provide an optimized content strategy including:
1. Content themes and topics
2. Posting schedule and frequency
3. Platform mix and strategy
4. Content formats and types
5. Competitive differentiation

Return as JSON with keys: themes, schedule, platforms, formats, differentiation.`;

    const systemPrompt = 'You are an expert content strategist. Create winning content strategies.';

    const result = await generateJSON<any>(prompt, systemPrompt, { tier: 'deep' });

    return {
      success: true,
      strategy: result,
      optimizedAt: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error('[Think Agent] Content strategy optimization error:', error);
    throw error;
  }
}

/**
 * Process custom request
 */
async function processRequest(context: ThinkContext): Promise<any> {
  try {
    const prompt = `Process the following request:

${JSON.stringify(context, null, 2)}

Provide a comprehensive response that addresses the request.`;

    const systemPrompt = 'You are a helpful AI assistant. Provide detailed, useful responses.';

    const result = await generateText(prompt, systemPrompt, { tier: 'deep' });

    return {
      success: true,
      response: result,
      processedAt: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error('[Think Agent] Request processing error:', error);
    throw error;
  }
}

/**
 * Analyze research data
 */
async function analyzeResearch(context: ThinkContext): Promise<any> {
  const { data } = context;

  if (!data) {
    throw new Error('Research data required');
  }

  try {
    const prompt = `Analyze the following research data and provide key findings:

Research Data:
${JSON.stringify(data, null, 2)}

Provide analysis including:
1. Key findings and patterns
2. Important insights
3. Actionable recommendations
4. Strategic implications

Return as JSON with keys: findings, insights, recommendations, implications.`;

    const systemPrompt = 'You are an expert researcher. Provide deep analysis and actionable insights.';

    const result = await generateJSON<any>(prompt, systemPrompt, { tier: 'deep' });

    return {
      success: true,
      analysis: result,
      analyzedAt: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error('[Think Agent] Research analysis error:', error);
    throw error;
  }
}

/**
 * Store memory for context retention
 */
function storeMemory(key: string, value: any): void {
  if (!agentMemory.has(key)) {
    agentMemory.set(key, []);
  }
  const memories = agentMemory.get(key)!;
  memories.push(value);
  
  // Keep only last 100 memories per key
  if (memories.length > 100) {
    memories.shift();
  }
}

/**
 * Retrieve memory for context
 */
export function getMemory(key: string, limit: number = 10): any[] {
  const memories = agentMemory.get(key) || [];
  return memories.slice(-limit);
}

/**
 * Clear memory
 */
export function clearMemory(key?: string): void {
  if (key) {
    agentMemory.delete(key);
  } else {
    agentMemory.clear();
  }
}

/**
 * Plan multi-step strategy execution
 */
async function planStrategyExecution(context: ThinkContext): Promise<any> {
  const { brandData, goals, strategicInsights } = context;

  if (!brandData) {
    throw new Error('Brand data required for strategy planning');
  }

  try {
    const prompt = `Create a detailed multi-step execution plan for the following strategy goal.

BRAND DATA:
${JSON.stringify(brandData, null, 2)}

GOALS:
${goals ? JSON.stringify(goals, null, 2) : 'Not specified'}

STRATEGIC INSIGHTS:
${strategicInsights ? JSON.stringify(strategicInsights, null, 2) : 'Not specified'}

Create a step-by-step execution plan that:
1. Breaks down the strategy into actionable steps
2. Identifies dependencies between steps
3. Estimates time/resources needed
4. Identifies potential risks and mitigation strategies
5. Defines success metrics for each step

Return as JSON with keys: steps (array of {name, description, dependencies, estimatedTime, risks, successMetrics}), overallTimeline, criticalPath, riskMitigation.`;

    const systemPrompt = 'You are an expert strategy planner. Create detailed, executable multi-step plans.';

    const result = await generateJSON<any>(prompt, systemPrompt, { tier: 'deep' });

    return {
      success: true,
      plan: result,
      generatedAt: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error('[Think Agent] Strategy planning error:', error);
    throw error;
  }
}

/**
 * Evaluate strategy options with browser research
 */
async function evaluateStrategyOptions(context: ThinkContext): Promise<any> {
  const { options, criteria, brandData } = context;

  if (!options || options.length === 0) {
    throw new Error('Options required for strategy evaluation');
  }

  try {
    // Use browser agent to gather real-time market data if needed
    let marketData = null;
    if (brandData?.name) {
      try {
        const browserResult = await browserAgent.execute('gather-market-intelligence', {
          searchQuery: `${brandData.name} ${brandData.industry || ''} strategy`,
          username: brandData.name,
        });
        if (browserResult.success) {
          marketData = browserResult.data;
        }
      } catch (error: any) {
        console.warn('[Think Agent] Browser research failed, continuing without:', error.message);
      }
    }

    const prompt = `Evaluate the following strategy options with deep analysis.

OPTIONS:
${JSON.stringify(options, null, 2)}

CRITERIA:
${criteria ? JSON.stringify(criteria, null, 2) : 'Maximize value, minimize risk, align with brand'}

MARKET DATA:
${marketData ? JSON.stringify(marketData, null, 2) : 'No market data available'}

BRAND CONTEXT:
${brandData ? JSON.stringify(brandData, null, 2) : 'No brand data'}

For each option, provide:
1. Strengths and weaknesses
2. Alignment with brand and goals
3. Market feasibility (based on market data if available)
4. Risk assessment
5. Resource requirements
6. Expected outcomes
7. Recommendation score (0-1)

Return as JSON with keys: evaluations (array of {option, strengths, weaknesses, alignment, feasibility, risks, resources, outcomes, score}), recommendedOption, reasoning, comparison.`;

    const systemPrompt = 'You are an expert strategy evaluator. Provide thorough, data-driven evaluations.';

    const result = await generateJSON<any>(prompt, systemPrompt, { tier: 'deep' });

    return {
      success: true,
      evaluations: result.evaluations || [],
      recommendedOption: result.recommendedOption,
      reasoning: result.reasoning,
      comparison: result.comparison,
      marketDataUsed: !!marketData,
      evaluatedAt: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error('[Think Agent] Strategy evaluation error:', error);
    throw error;
  }
}

/**
 * Refine strategy based on feedback
 */
async function refineStrategyBasedOnFeedback(context: ThinkContext): Promise<any> {
  const { brandData, goals } = context;

  if (!brandData) {
    throw new Error('Brand data required for strategy refinement');
  }

  try {
    // Get learning insights from feedback
    const insights = getLearningInsights(brandData.name || brandData.username);
    const stats = getFeedbackStats(brandData.name || brandData.username);

    const prompt = `Refine the content strategy based on feedback and performance data.

BRAND DATA:
${JSON.stringify(brandData, null, 2)}

CURRENT GOALS:
${goals ? JSON.stringify(goals, null, 2) : 'Not specified'}

FEEDBACK STATISTICS:
- Total Feedback: ${stats.totalFeedback}
- Approval Rate: ${(stats.approvalRate * 100).toFixed(1)}%
- Average Quality: ${(stats.averageQuality * 100).toFixed(1)}%

SUCCESSFUL PATTERNS:
${insights.successfulPatterns.length > 0 ? insights.successfulPatterns.map(p => `- ${p}`).join('\n') : 'None identified'}

FAILED PATTERNS:
${insights.failedPatterns.length > 0 ? insights.failedPatterns.map(p => `- ${p}`).join('\n') : 'None identified'}

RECOMMENDATIONS:
${insights.recommendations.length > 0 ? insights.recommendations.map(r => `- ${r}`).join('\n') : 'None'}

Refine the strategy to:
1. Leverage successful patterns
2. Address failed patterns
3. Implement recommendations
4. Improve approval rates and quality scores
5. Better align with brand voice and goals

Return as JSON with keys: refinedStrategy, changes (array of changes made), expectedImprovements, implementationSteps.`;

    const systemPrompt = 'You are an expert strategy optimizer. Refine strategies based on data and feedback.';

    const result = await generateJSON<any>(prompt, systemPrompt, { tier: 'deep' });

    return {
      success: true,
      refinedStrategy: result.refinedStrategy,
      changes: result.changes || [],
      expectedImprovements: result.expectedImprovements,
      implementationSteps: result.implementationSteps || [],
      basedOnFeedback: {
        totalFeedback: stats.totalFeedback,
        approvalRate: stats.approvalRate,
        averageQuality: stats.averageQuality,
      },
      refinedAt: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error('[Think Agent] Strategy refinement error:', error);
    throw error;
  }
}

