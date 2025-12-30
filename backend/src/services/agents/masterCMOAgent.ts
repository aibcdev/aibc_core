/**
 * Master CMO Agent - Central Orchestrator
 * Coordinates all specialized agents for content workflow
 */

import { triggerN8nWorkflow, sendAgentResultToN8n } from '../n8nService';
import { researchAgent } from './researchAgent';
import { helperAgent } from './helperAgent';
import { posterAgent } from './posterAgent';
import { mediaAgent } from './mediaAgent';
import { thinkAgent } from './thinkAgent';
import { reviewAgent } from './reviewAgent';
import { videoAnalysisAgent } from './videoAnalysisAgent';

export interface WorkflowContext {
  scanId?: string;
  brandDNA?: any;
  brandVoice?: any; // Brand voice from Styles & Voice settings
  brandAssets?: { // All brand assets (colors, fonts, materials, profile)
    voice?: any;
    colors?: any[];
    fonts?: any[];
    materials?: any[];
    profile?: any;
  };
  extractedContent?: any;
  competitorIntelligence?: any[];
  strategicInsights?: any[];
  brandIdentity?: any;
  username?: string;
  workflowType: 'scan-complete' | 'content-generation' | 'distribution' | 'research' | 'strategy-modification' | 'custom';
  strategyModification?: string; // User's strategy modification request
  userMessage?: string; // User message from strategy chat
}

export interface AgentTask {
  agentType: 'research' | 'helper' | 'poster' | 'media' | 'think' | 'review' | 'video-analysis';
  task: string;
  priority: 'high' | 'medium' | 'low';
  dependencies?: string[]; // Other agent tasks that must complete first
  params?: Record<string, any>;
}

export interface AgentResult {
  agentId: string;
  agentType: string;
  success: boolean;
  data?: any;
  error?: string;
  executionTime?: number;
}

/**
 * Main orchestration function
 */
export async function orchestrateWorkflow(
  context: WorkflowContext
): Promise<{ success: boolean; results: AgentResult[]; error?: string }> {
  const startTime = Date.now();
  const results: AgentResult[] = [];

  try {
    console.log(`[Master CMO] ========================================`);
    console.log(`[Master CMO] Starting workflow: ${context.workflowType}`);
    console.log(`[Master CMO] Username: ${context.username}`);
    console.log(`[Master CMO] Has Brand DNA: ${!!context.brandDNA}`);
    console.log(`[Master CMO] Has Brand Voice: ${!!context.brandVoice}`);
    console.log(`[Master CMO] Has Brand Assets: ${!!context.brandAssets}`);
    console.log(`[Master CMO] Has Content: ${!!context.extractedContent}`);
    console.log(`[Master CMO] Competitors: ${context.competitorIntelligence?.length || 0}`);
    console.log(`[Master CMO] ========================================`);

    // Determine which agents to invoke based on workflow type
    const tasks = determineAgentTasks(context);

    // Execute tasks in dependency order
    const executedTasks = new Set<string>();
    const taskResults = new Map<string, AgentResult>();

    // Sort tasks by priority and dependencies
    const sortedTasks = sortTasksByDependencies(tasks);

    for (const task of sortedTasks) {
      // Check dependencies
      if (task.dependencies && task.dependencies.length > 0) {
        const allDepsComplete = task.dependencies.every(dep => executedTasks.has(dep));
        if (!allDepsComplete) {
          console.log(`[Master CMO] Task ${task.agentType} waiting for dependencies`);
          continue;
        }
      }

      // Execute agent task
      const taskId = `${task.agentType}-${Date.now()}`;
      console.log(`[Master CMO] ┌─ Executing: ${task.agentType} → ${task.task} (${task.priority} priority)`);
      const taskStartTime = Date.now();
      const result = await routeToAgent(task.agentType, task, context);
      const taskDuration = Date.now() - taskStartTime;
      
      result.agentId = taskId;
      result.executionTime = taskDuration;
      
      console.log(`[Master CMO] └─ Completed: ${task.agentType} → ${task.task} (${taskDuration}ms, success: ${result.success})`);
      if (!result.success) {
        console.error(`[Master CMO]    ERROR: ${result.error}`);
      }
      
      results.push(result);
      taskResults.set(taskId, result);
      executedTasks.add(taskId);

      // If task failed and is high priority, stop workflow
      if (!result.success && task.priority === 'high') {
        console.error(`[Master CMO] High priority task failed: ${task.agentType}`);
        return {
          success: false,
          results,
          error: `High priority task failed: ${task.agentType} - ${result.error}`,
        };
      }
    }

    // Aggregate results
    const aggregated = aggregateResults(results);

    // If content was reviewed and sent to Content Hub, verify it was stored
    const contentHubResult = results.find(r => r.agentType === 'helper' && r.success);
    console.log(`[Master CMO] Looking for Content Hub result...`);
    console.log(`[Master CMO] Helper Agent results: ${results.filter(r => r.agentType === 'helper').length}`);
    if (contentHubResult) {
      console.log(`[Master CMO] Found Helper Agent result:`, {
        success: contentHubResult.success,
        hasData: !!contentHubResult.data,
        dataKeys: contentHubResult.data ? Object.keys(contentHubResult.data).join(', ') : 'none',
      });
    }
    
    // Helper Agent already writes to file, but we can verify here
    if (contentHubResult?.data?.contentHubItems) {
      console.log(`[Master CMO] ✅ Helper Agent created ${contentHubResult.data.contentHubItems.length} content hub items`);
      console.log(`[Master CMO] Content should be available at: backend/.content-hub-reviewed.json`);
    } else if (contentHubResult?.data?.contentHubItem) {
      console.log(`[Master CMO] ✅ Helper Agent created single content hub item`);
    } else {
      console.warn(`[Master CMO] ⚠️  Helper Agent did not create content hub items`);
      if (contentHubResult) {
        console.warn(`[Master CMO] Helper Agent data:`, JSON.stringify(contentHubResult.data, null, 2));
      }
    }

    const totalDuration = Date.now() - startTime;
    console.log(`[Master CMO] ========================================`);
    console.log(`[Master CMO] Workflow completed in ${totalDuration}ms`);
    console.log(`[Master CMO] Total agents executed: ${results.length}`);
    console.log(`[Master CMO] Successful: ${results.filter(r => r.success).length}`);
    console.log(`[Master CMO] Failed: ${results.filter(r => !r.success).length}`);
    
    if (contentHubResult?.data?.contentHubItem) {
      console.log(`[Master CMO] ✅ Content Hub item created: ${contentHubResult.data.contentHubItem.id}`);
    } else {
      console.log(`[Master CMO] ⚠️  No Content Hub item found in results`);
      console.log(`[Master CMO]    Helper Agent result:`, contentHubResult ? 'Found' : 'Not found');
    }
    console.log(`[Master CMO] ========================================`);

    const returnValue: any = {
      success: true,
      results,
    };

    // Add contentHubItem if available (for Content Hub delivery)
    if (contentHubResult?.data?.contentHubItem) {
      returnValue.contentHubItem = contentHubResult.data.contentHubItem;
    }

    return returnValue;
  } catch (error: any) {
    console.error('[Master CMO] Workflow error:', error);
    return {
      success: false,
      results,
      error: error.message || 'Unknown error',
    };
  }
}

/**
 * Determine which agent tasks are needed based on workflow context
 */
function determineAgentTasks(context: WorkflowContext): AgentTask[] {
  const tasks: AgentTask[] = [];

  switch (context.workflowType) {
    case 'scan-complete':
      // After scan completes, enhance with research and generate content
      // CRITICAL: Research filters low engagement, spots competitor successes
      // Video Analysis: Analyze client video outputs for insights
      tasks.push(
        {
          agentType: 'video-analysis',
          task: 'analyze-client-videos',
          priority: 'high',
          params: {
            extractedContent: context.extractedContent,
            brandName: context.username,
            industry: context.brandIdentity?.industry,
          },
        },
        {
          agentType: 'research',
          task: 'enhance-competitor-intelligence',
          priority: 'high',
          dependencies: ['video-analysis-analyze-client-videos'],
          params: {
            competitors: context.competitorIntelligence,
            brandName: context.username,
          },
        },
        {
          agentType: 'think',
          task: 'analyze-strategy',
          priority: 'high',
          dependencies: ['research-enhance-competitor-intelligence', 'video-analysis-analyze-client-videos'],
          params: {
            brandDNA: context.brandDNA,
            strategicInsights: context.strategicInsights,
            videoInsights: context.extractedContent?.videoInsights,
          },
        },
        {
          agentType: 'media',
          task: 'generate-content-assets',
          priority: 'high',
          dependencies: ['think-analyze-strategy'],
          params: {
            contentIdeas: context.extractedContent?.contentIdeas || [],
            brandDNA: context.brandDNA,
            extractedContent: context.extractedContent,
            competitorIntelligence: context.competitorIntelligence,
            strategicInsights: context.strategicInsights,
            brandIdentity: context.brandIdentity,
            username: context.username,
          },
        },
        {
          agentType: 'review',
          task: 'review-content-quality',
          priority: 'high',
          dependencies: ['media-generate-content-assets'],
          params: {
            content: context.extractedContent,
            brandDNA: context.brandDNA,
            competitorIntelligence: context.competitorIntelligence,
            strategicInsights: context.strategicInsights,
          },
        },
        {
          agentType: 'review',
          task: 'final-quality-check',
          priority: 'high',
          dependencies: ['review-review-content-quality'],
          params: {
            content: context.extractedContent,
            brandDNA: context.brandDNA,
          },
        },
        {
          agentType: 'helper',
          task: 'send-to-content-hub',
          priority: 'high',
          dependencies: ['review-final-quality-check'],
          params: {
            reviewedContent: context.extractedContent, // Will be updated by review agent with reviewedContent
          },
        }
      );
      break;

    case 'content-generation':
      // Generate content with media, review, and prepare for Content Hub
      tasks.push(
        {
          agentType: 'think',
          task: 'optimize-content-strategy',
          priority: 'high',
          params: {
            brandDNA: context.brandDNA,
            competitorIntelligence: context.competitorIntelligence,
          },
        },
        {
          agentType: 'media',
          task: 'create-media-assets',
          priority: 'high',
          dependencies: ['think-optimize-content-strategy'],
        },
        {
          agentType: 'review',
          task: 'review-text-content',
          priority: 'high',
          dependencies: ['media-create-media-assets'],
          params: {
            content: context.extractedContent,
            brandDNA: context.brandDNA,
          },
        },
        {
          agentType: 'review',
          task: 'review-image-content',
          priority: 'high',
          dependencies: ['media-create-media-assets'],
          params: {
            content: context.extractedContent,
          },
        },
        {
          agentType: 'review',
          task: 'final-quality-check',
          priority: 'high',
          dependencies: ['review-review-text-content', 'review-review-image-content'],
          params: {
            content: context.extractedContent,
            brandDNA: context.brandDNA,
            competitorIntelligence: context.competitorIntelligence,
            strategicInsights: context.strategicInsights,
          },
        },
        {
          agentType: 'poster',
          task: 'store-in-notion',
          priority: 'medium',
          dependencies: ['review-final-quality-check'],
          params: {
            content: context.extractedContent,
          },
        },
        {
          agentType: 'helper',
          task: 'send-to-content-hub',
          priority: 'high',
          dependencies: ['review-final-quality-check'],
          params: {
            reviewedContent: context.extractedContent, // Will be updated by review agent
          },
        }
      );
      break;

    case 'distribution':
      // Distribute content across platforms
      tasks.push(
        {
          agentType: 'poster',
          task: 'publish-content',
          priority: 'high',
        },
        {
          agentType: 'helper',
          task: 'notify-stakeholders',
          priority: 'low',
          dependencies: ['poster-publish-content'],
        }
      );
      break;

    case 'research':
      // Research-focused workflow
      tasks.push(
        {
          agentType: 'research',
          task: 'gather-market-intelligence',
          priority: 'high',
          params: {
            brandName: context.username,
            industry: context.brandIdentity?.industry,
          },
        },
        {
          agentType: 'think',
          task: 'analyze-research',
          priority: 'high',
          dependencies: ['research-gather-market-intelligence'],
        }
      );
      break;

    case 'strategy-modification':
      // User modifies strategy via messaging - create new plan
      tasks.push(
        {
          agentType: 'think',
          task: 'process-request',
          priority: 'high',
          params: {
            userMessage: context.userMessage || context.strategyModification,
            brandDNA: context.brandDNA,
            competitorIntelligence: context.competitorIntelligence,
            strategicInsights: context.strategicInsights,
          },
        },
        {
          agentType: 'think',
          task: 'optimize-content-strategy',
          priority: 'high',
          dependencies: ['think-process-request'],
          params: {
            brandDNA: context.brandDNA,
            competitorIntelligence: context.competitorIntelligence,
            modifiedStrategy: context.strategyModification,
          },
        },
        {
          agentType: 'research',
          task: 'enhance-competitor-intelligence',
          priority: 'medium',
          dependencies: ['think-optimize-content-strategy'],
          params: {
            competitors: context.competitorIntelligence,
            brandName: context.username,
            focusOn: context.strategyModification, // e.g., "comedy style like Competitor X"
          },
        }
      );
      break;

    default:
      // Custom workflow - minimal tasks
      tasks.push({
        agentType: 'think',
        task: 'process-request',
        priority: 'medium',
        params: context,
      });
  }

  return tasks;
}

/**
 * Sort tasks by dependencies (topological sort)
 */
function sortTasksByDependencies(tasks: AgentTask[]): AgentTask[] {
  const sorted: AgentTask[] = [];
  const visited = new Set<string>();
  const visiting = new Set<string>();

  const taskMap = new Map<string, AgentTask>();
  tasks.forEach(task => {
    const key = `${task.agentType}-${task.task}`;
    taskMap.set(key, task);
  });

  function visit(task: AgentTask) {
    const key = `${task.agentType}-${task.task}`;
    
    if (visited.has(key)) return;
    if (visiting.has(key)) {
      console.warn(`[Master CMO] Circular dependency detected: ${key}`);
      return;
    }

    visiting.add(key);

    // Visit dependencies first
    if (task.dependencies) {
      for (const dep of task.dependencies) {
        const depTask = taskMap.get(dep);
        if (depTask) {
          visit(depTask);
        }
      }
    }

    visiting.delete(key);
    visited.add(key);
    sorted.push(task);
  }

  tasks.forEach(task => visit(task));
  return sorted;
}

/**
 * Route task to appropriate agent
 */
async function routeToAgent(
  agentType: AgentTask['agentType'],
  task: AgentTask,
  context: WorkflowContext
): Promise<AgentResult> {
  const startTime = Date.now();

  try {
    console.log(`[Master CMO] Routing to ${agentType} agent: ${task.task}`);

    let result: any;

    switch (agentType) {
      case 'research':
        result = await researchAgent.execute(task.task, {
          brandName: context.username,
          industry: context.brandIdentity?.industry,
          competitors: context.competitorIntelligence,
          ...task.params,
        } as any);
        break;

      case 'helper':
        // CRITICAL: Use contentIdeas from extractedContent if available (from Media Agent)
        // Otherwise use reviewedContent from Review Agent, or fall back to extractedContent
        let helperInput = task.params?.reviewedContent;
        if (!helperInput && context.extractedContent) {
          // Check if we have contentIdeas (from Media Agent)
          if (context.extractedContent.contentIdeas && Array.isArray(context.extractedContent.contentIdeas)) {
            helperInput = context.extractedContent.contentIdeas;
            console.log(`[Master CMO] Helper Agent using contentIdeas: ${helperInput.length} items`);
          } else {
            // Use reviewedContent from Review Agent or extractedContent
            helperInput = context.extractedContent.reviewedContent || context.extractedContent;
          }
        }
        
        console.log(`[Master CMO] Helper Agent input type: ${Array.isArray(helperInput) ? 'array' : typeof helperInput}`);
        console.log(`[Master CMO] Helper Agent has content: ${!!helperInput}`);
        if (helperInput && typeof helperInput === 'object' && !Array.isArray(helperInput)) {
          console.log(`[Master CMO] Helper Agent input keys: ${Object.keys(helperInput).join(', ')}`);
          if (helperInput.contentIdeas) {
            console.log(`[Master CMO] Helper Agent found contentIdeas: ${Array.isArray(helperInput.contentIdeas) ? helperInput.contentIdeas.length : 'not array'}`);
            helperInput = helperInput.contentIdeas;
          }
        }
        
        result = await helperAgent.execute(task.task, {
          reviewedContent: helperInput,
          contentHubItem: task.params?.contentHubItem,
        } as any);
        
        console.log(`[Master CMO] Helper Agent result: success=${result.success}`);
        if (result.data) {
          console.log(`[Master CMO] Helper Agent data keys: ${Object.keys(result.data).join(', ')}`);
          if (result.data.contentHubItems) {
            console.log(`[Master CMO] Helper Agent created ${result.data.contentHubItems.length} content hub items`);
          }
        }
        break;

      case 'poster':
        result = await posterAgent.execute(task.task, {
          content: task.params?.content || context.extractedContent,
          platforms: task.params?.platforms,
          schedule: task.params?.schedule,
          databaseId: task.params?.databaseId,
          brandId: context.username,
        } as any);
        break;

      case 'media':
        const mediaResult = await mediaAgent.execute(task.task, {
          prompt: task.params?.prompt,
          style: task.params?.style,
          size: task.params?.size,
          duration: task.params?.duration,
          mediaUrl: task.params?.mediaUrl,
          platform: task.params?.platform,
          variations: task.params?.variations,
          contentIdeas: context.extractedContent?.contentIdeas,
          content: task.params?.content,
          // CRITICAL: Pass brand data for content regeneration
          brandDNA: task.params?.brandDNA || context.brandDNA,
          brandVoice: task.params?.brandVoice || context.brandVoice, // Include brand voice from Brand Assets
          brandAssets: task.params?.brandAssets || context.brandAssets, // Include all brand assets
          extractedContent: task.params?.extractedContent || context.extractedContent,
          competitorIntelligence: task.params?.competitorIntelligence || context.competitorIntelligence,
          strategicInsights: task.params?.strategicInsights || context.strategicInsights,
          brandIdentity: context.brandIdentity,
          username: task.params?.username || context.username,
        } as any);
        
        // CRITICAL: Update context.extractedContent with regenerated contentIdeas from Media Agent
        if (mediaResult && mediaResult.contentIdeas && Array.isArray(mediaResult.contentIdeas)) {
          context.extractedContent = {
            ...(context.extractedContent || {}),
            contentIdeas: mediaResult.contentIdeas,
          };
          console.log(`[Master CMO] ✅ Updated context.extractedContent with ${mediaResult.contentIdeas.length} REGENERATED contentIdeas from Media Agent`);
          console.log(`[Master CMO] Content ideas now match brand's actual style`);
        } else if (mediaResult && context.extractedContent?.contentIdeas) {
          // Keep existing contentIdeas if regeneration didn't return new ones
          console.log(`[Master CMO] Media Agent did not return new contentIdeas, keeping existing`);
        }
        
        result = mediaResult;
        break;

      case 'think':
        result = await thinkAgent.execute(task.task, {
          brandData: context.brandDNA,
          goals: task.params?.goals,
          data: task.params?.data || context.extractedContent,
          context: task.params?.context,
          content: task.params?.content,
          metrics: task.params?.metrics,
          options: task.params?.options,
          criteria: task.params?.criteria,
          brandDNA: context.brandDNA,
          competitorIntelligence: context.competitorIntelligence,
          strategicInsights: context.strategicInsights,
        } as any);
        break;

      case 'review':
        const reviewInput = task.params?.content || context.extractedContent;
        console.log(`[Master CMO] Review Agent input type: ${Array.isArray(reviewInput) ? 'array' : typeof reviewInput}`);
        console.log(`[Master CMO] Review Agent input keys: ${reviewInput ? Object.keys(reviewInput).join(', ') : 'none'}`);
        
        const reviewResult = await reviewAgent.execute(task.task, {
          content: reviewInput,
          brandDNA: context.brandDNA,
          competitorIntelligence: context.competitorIntelligence,
          strategicInsights: context.strategicInsights,
          contentType: task.params?.contentType,
          platform: task.params?.platform,
        } as any);
        
        console.log(`[Master CMO] Review Agent result: approved=${reviewResult.approved}, qualityScore=${reviewResult.qualityScore}`);
        
        // Update context with reviewed content for next tasks (especially send-to-content-hub)
        if (reviewResult.reviewedContent) {
          // If reviewedContent is an array (contentIdeas), use it directly
          // Otherwise merge into extractedContent
          if (Array.isArray(reviewResult.reviewedContent)) {
            context.extractedContent = {
              ...(context.extractedContent || {}),
              contentIdeas: reviewResult.reviewedContent,
              qualityScore: reviewResult.qualityScore,
              approved: reviewResult.approved,
              reviewIssues: reviewResult.issues,
              reviewImprovements: reviewResult.improvements,
            };
          } else {
            context.extractedContent = {
              ...(context.extractedContent || {}),
              ...reviewResult.reviewedContent,
              qualityScore: reviewResult.qualityScore,
              approved: reviewResult.approved,
              reviewIssues: reviewResult.issues,
              reviewImprovements: reviewResult.improvements,
            };
          }
          console.log(`[Master CMO] Updated context.extractedContent with reviewed content`);
        } else {
          console.warn(`[Master CMO] ⚠️  Review Agent did not return reviewedContent`);
          // Even if not approved, pass content through for Helper Agent to handle
          if (context.extractedContent) {
            context.extractedContent = {
              ...context.extractedContent,
              qualityScore: reviewResult.qualityScore,
              approved: reviewResult.approved,
              reviewIssues: reviewResult.issues,
              reviewImprovements: reviewResult.improvements,
            };
          }
        }
        
        result = reviewResult;
        break;

      case 'video-analysis':
        const videoResult = await videoAnalysisAgent.execute(task.task, {
          videos: task.params?.videos,
          brandName: context.username,
          industry: context.brandIdentity?.industry,
          extractedContent: task.params?.extractedContent || context.extractedContent,
          socialLinks: context.extractedContent?.socialLinks || task.params?.socialLinks,
        } as any);
        
        // Store video insights in context for other agents to use
        if (videoResult && videoResult.videoInsights) {
          context.extractedContent = {
            ...(context.extractedContent || {}),
            videoInsights: videoResult.videoInsights,
            videoAnalysis: videoResult.aggregatedInsights,
          };
          console.log(`[Master CMO] ✅ Video Analysis Agent analyzed ${videoResult.videoInsights.length} videos`);
        }
        
        result = videoResult;
        break;

      default:
        throw new Error(`Unknown agent type: ${agentType}`);
    }

    return {
      agentId: `${agentType}-${task.task}`,
      agentType,
      success: true,
      data: result,
      executionTime: Date.now() - startTime,
    };
  } catch (error: any) {
    console.error(`[Master CMO] Agent ${agentType} error:`, error);
    return {
      agentId: `${agentType}-${task.task}`,
      agentType,
      success: false,
      error: error.message || 'Unknown error',
      executionTime: Date.now() - startTime,
    };
  }
}

/**
 * Aggregate results from multiple agents
 */
function aggregateResults(results: AgentResult[]): any {
  const aggregated: any = {
    totalAgents: results.length,
    successfulAgents: results.filter(r => r.success).length,
    failedAgents: results.filter(r => !r.success).length,
    executionTime: Math.max(...results.map(r => r.executionTime || 0)),
    agentResults: {},
  };

  results.forEach(result => {
    aggregated.agentResults[result.agentType] = {
      success: result.success,
      data: result.data,
      error: result.error,
      executionTime: result.executionTime,
    };
  });

  return aggregated;
}

/**
 * Trigger n8n workflow for Master CMO orchestration
 */
export async function triggerMasterCMOWorkflow(
  context: WorkflowContext
): Promise<{ success: boolean; executionId?: string; error?: string }> {
  if (!process.env.N8N_WEBHOOK_URL && !process.env.N8N_BASE_URL) {
    console.log('[Master CMO] n8n not configured, running locally');
    // Run orchestration locally if n8n not configured
    const result = await orchestrateWorkflow(context);
    return {
      success: result.success,
      error: result.error,
    };
  }

  // Trigger n8n workflow
  const workflowId = process.env.N8N_MASTER_CMO_WORKFLOW_ID || 'master-cmo-workflow';
  return await triggerN8nWorkflow(workflowId, context);
}

