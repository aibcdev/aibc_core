/**
 * Task Planning Service - OpenManus-Style
 * Breaks down high-level goals into multi-step plans with dependency management
 */

import { generateJSON } from './llmService';

export interface Task {
  id: string;
  name: string;
  description: string;
  agentType: 'research' | 'helper' | 'poster' | 'media' | 'think' | 'review' | 'video-analysis' | 'browser';
  priority: 'high' | 'medium' | 'low';
  dependencies: string[]; // IDs of tasks that must complete first
  estimatedDuration?: number; // in seconds
  params?: Record<string, any>;
}

export interface TaskPlan {
  id: string;
  goal: string;
  tasks: Task[];
  executionOrder: string[]; // Task IDs in execution order
  parallelGroups: string[][]; // Groups of tasks that can run in parallel
  status: 'pending' | 'executing' | 'completed' | 'failed' | 'adapted';
  createdAt: string;
  updatedAt: string;
  context?: Record<string, any>;
}

export interface PlanExecutionResult {
  taskId: string;
  success: boolean;
  result?: any;
  error?: string;
  executionTime: number;
}

export interface PlanFeedback {
  taskId: string;
  success: boolean;
  quality?: number; // 0-1 score
  feedback?: string;
  suggestions?: string[];
}

// In-memory storage for plans and execution state
const activePlans = new Map<string, TaskPlan>();
const executionResults = new Map<string, Map<string, PlanExecutionResult>>();
const planFeedback = new Map<string, PlanFeedback[]>();

/**
 * Generate a multi-step task plan from a high-level goal
 */
export async function generateTaskPlan(
  goal: string,
  context: Record<string, any>,
  existingPlanId?: string
): Promise<TaskPlan> {
  try {
    console.log(`[Task Planning] Generating plan for goal: ${goal}`);

    const prompt = `You are a task planning AI. Break down the following goal into a detailed, executable multi-step plan.

GOAL: ${goal}

CONTEXT:
${JSON.stringify(context, null, 2)}

Create a plan with the following structure:
1. Break the goal into 3-8 specific, actionable tasks
2. Identify dependencies between tasks (which tasks must complete before others)
3. Determine which tasks can run in parallel vs sequentially
4. Assign appropriate agent types to each task
5. Set priorities (high/medium/low)

Available agent types:
- research: Research and data gathering
- think: Strategic analysis and decision making
- media: Content and media generation
- review: Quality checking and validation
- browser: Web automation and scraping
- helper: Utility tasks (scheduling, notifications)
- poster: Content publishing and distribution
- video-analysis: Video content analysis

Return a JSON object with this structure:
{
  "tasks": [
    {
      "name": "Task name",
      "description": "Detailed description",
      "agentType": "research|think|media|review|browser|helper|poster|video-analysis",
      "priority": "high|medium|low",
      "dependencies": ["task-id-1", "task-id-2"],
      "params": {}
    }
  ],
  "executionOrder": ["task-id-1", "task-id-2", ...],
  "parallelGroups": [["task-id-1", "task-id-2"], ["task-id-3"]]
}`;

    const systemPrompt = 'You are an expert task planner. Create detailed, executable plans with clear dependencies and optimal execution order.';

    const result = await generateJSON<{
      tasks: Array<{
        name: string;
        description: string;
        agentType: string;
        priority: string;
        dependencies?: string[];
        params?: Record<string, any>;
      }>;
      executionOrder: string[];
      parallelGroups: string[][];
    }>(prompt, systemPrompt, { tier: 'deep' });

    // Generate unique IDs for tasks
    const tasks: Task[] = result.tasks.map((task, index) => ({
      id: `task-${Date.now()}-${index}`,
      name: task.name,
      description: task.description,
      agentType: task.agentType as Task['agentType'],
      priority: task.priority as Task['priority'],
      dependencies: task.dependencies || [],
      params: task.params || {},
    }));

    // Build execution order with task IDs
    const executionOrder = result.executionOrder.map((orderItem, index) => {
      // If it's a task name, find the matching task
      const task = tasks.find(t => t.name === orderItem || t.id === orderItem);
      return task?.id || `task-${Date.now()}-${index}`;
    });

    // Build parallel groups with task IDs
    const parallelGroups = result.parallelGroups.map(group =>
      group.map(item => {
        const task = tasks.find(t => t.name === item || t.id === item);
        return task?.id || item;
      })
    );

    const planId = existingPlanId || `plan-${Date.now()}`;
    const plan: TaskPlan = {
      id: planId,
      goal,
      tasks,
      executionOrder,
      parallelGroups,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      context,
    };

    activePlans.set(planId, plan);
    console.log(`[Task Planning] Generated plan ${planId} with ${tasks.length} tasks`);

    return plan;
  } catch (error: any) {
    console.error('[Task Planning] Error generating plan:', error);
    throw new Error(`Failed to generate task plan: ${error.message}`);
  }
}

/**
 * Get the next tasks ready for execution (dependencies satisfied)
 */
export function getReadyTasks(planId: string, completedTaskIds: string[]): Task[] {
  const plan = activePlans.get(planId);
  if (!plan) {
    throw new Error(`Plan ${planId} not found`);
  }

  const readyTasks: Task[] = [];

  for (const task of plan.tasks) {
    // Skip if already completed
    if (completedTaskIds.includes(task.id)) {
      continue;
    }

    // Check if all dependencies are satisfied
    const allDepsSatisfied = task.dependencies.every(depId => completedTaskIds.includes(depId));

    if (allDepsSatisfied) {
      readyTasks.push(task);
    }
  }

  return readyTasks;
}

/**
 * Get tasks that can run in parallel
 */
export function getParallelTasks(planId: string, completedTaskIds: string[]): Task[][] {
  const plan = activePlans.get(planId);
  if (!plan) {
    throw new Error(`Plan ${planId} not found`);
  }

  const parallelGroups: Task[][] = [];

  for (const group of plan.parallelGroups) {
    const tasks = group
      .map(taskId => plan.tasks.find(t => t.id === taskId))
      .filter((t): t is Task => t !== undefined && !completedTaskIds.includes(t.id));

    if (tasks.length > 0) {
      // Verify all dependencies are satisfied
      const readyTasks = tasks.filter(task =>
        task.dependencies.every(depId => completedTaskIds.includes(depId))
      );

      if (readyTasks.length > 0) {
        parallelGroups.push(readyTasks);
      }
    }
  }

  return parallelGroups;
}

/**
 * Record task execution result
 */
export function recordTaskResult(
  planId: string,
  taskId: string,
  result: PlanExecutionResult
): void {
  if (!executionResults.has(planId)) {
    executionResults.set(planId, new Map());
  }

  const planResults = executionResults.get(planId)!;
  planResults.set(taskId, result);

  // Update plan status
  const plan = activePlans.get(planId);
  if (plan) {
    plan.updatedAt = new Date().toISOString();
    
    const allTasks = plan.tasks.map(t => t.id);
    const completedTasks = Array.from(planResults.keys()).filter(
      id => planResults.get(id)?.success
    );

    if (completedTasks.length === allTasks.length) {
      plan.status = 'completed';
    } else if (completedTasks.length > 0) {
      plan.status = 'executing';
    }
  }
}

/**
 * Adapt plan based on intermediate results and feedback
 */
export async function adaptPlan(
  planId: string,
  feedback: PlanFeedback[]
): Promise<TaskPlan | null> {
  const plan = activePlans.get(planId);
  if (!plan) {
    throw new Error(`Plan ${planId} not found`);
  }

  const results = executionResults.get(planId);
  if (!results || results.size === 0) {
    return null; // No results to adapt from
  }

  // Store feedback
  planFeedback.set(planId, feedback);

  // Analyze results and feedback
  const failedTasks = Array.from(results.values())
    .filter(r => !r.success)
    .map(r => {
      const task = plan.tasks.find(t => t.id === r.taskId);
      return { task, result: r };
    });

  const lowQualityTasks = feedback
    .filter(f => f.quality !== undefined && f.quality < 0.5)
    .map(f => {
      const task = plan.tasks.find(t => t.id === f.taskId);
      return { task, feedback: f };
    });

  // If no failures or quality issues, no adaptation needed
  if (failedTasks.length === 0 && lowQualityTasks.length === 0) {
    return null;
  }

  console.log(`[Task Planning] Adapting plan ${planId} based on ${failedTasks.length} failures and ${lowQualityTasks.length} quality issues`);

  // Generate adapted plan
  const adaptationPrompt = `Adapt the following task plan based on execution results and feedback.

ORIGINAL GOAL: ${plan.goal}

COMPLETED TASKS:
${Array.from(results.values())
  .filter(r => r.success)
  .map(r => {
    const task = plan.tasks.find(t => t.id === r.taskId);
    return `- ${task?.name}: Completed successfully`;
  })
  .join('\n')}

FAILED TASKS:
${failedTasks.map(({ task, result }) => `- ${task?.name}: ${result.error}`).join('\n')}

QUALITY ISSUES:
${lowQualityTasks.map(({ task, feedback }) => `- ${task?.name}: ${feedback.feedback || 'Low quality'}`).join('\n')}

FEEDBACK SUGGESTIONS:
${feedback.map(f => `- ${f.suggestions?.join(', ') || 'No suggestions'}`).join('\n')}

CONTEXT:
${JSON.stringify(plan.context, null, 2)}

Create an adapted plan that:
1. Keeps successful tasks as-is
2. Replaces or fixes failed tasks
3. Improves low-quality tasks based on feedback
4. Adds any new tasks suggested by feedback
5. Maintains proper dependencies

Return the same structure as the original plan generation.`;

  try {
    const adaptedPlan = await generateTaskPlan(
      plan.goal,
      {
        ...plan.context,
        originalPlan: plan,
        failedTasks: failedTasks.map(({ task, result }) => ({
          task: task?.name,
          error: result.error,
        })),
        qualityIssues: lowQualityTasks.map(({ task, feedback }) => ({
          task: task?.name,
          feedback: feedback.feedback,
          suggestions: feedback.suggestions,
        })),
      },
      `${planId}-adapted-${Date.now()}`
    );

    adaptedPlan.status = 'adapted';
    plan.status = 'adapted';
    activePlans.set(adaptedPlan.id, adaptedPlan);

    console.log(`[Task Planning] Created adapted plan ${adaptedPlan.id}`);
    return adaptedPlan;
  } catch (error: any) {
    console.error('[Task Planning] Error adapting plan:', error);
    return null;
  }
}

/**
 * Get plan by ID
 */
export function getPlan(planId: string): TaskPlan | null {
  return activePlans.get(planId) || null;
}

/**
 * Get all active plans
 */
export function getActivePlans(): TaskPlan[] {
  return Array.from(activePlans.values());
}

/**
 * Get execution results for a plan
 */
export function getPlanResults(planId: string): Map<string, PlanExecutionResult> {
  return executionResults.get(planId) || new Map();
}

/**
 * Get feedback for a plan
 */
export function getPlanFeedback(planId: string): PlanFeedback[] {
  return planFeedback.get(planId) || [];
}

/**
 * Add feedback to a plan
 */
export function addPlanFeedback(planId: string, feedback: PlanFeedback): void {
  if (!planFeedback.has(planId)) {
    planFeedback.set(planId, []);
  }
  planFeedback.get(planId)!.push(feedback);
}

/**
 * Check if plan is complete
 */
export function isPlanComplete(planId: string): boolean {
  const plan = activePlans.get(planId);
  if (!plan) {
    return false;
  }

  const results = executionResults.get(planId);
  if (!results) {
    return false;
  }

  const allTasks = plan.tasks.map(t => t.id);
  const completedTasks = Array.from(results.keys()).filter(
    id => results.get(id)?.success
  );

  return completedTasks.length === allTasks.length;
}

/**
 * Clear completed plans (cleanup)
 */
export function clearCompletedPlans(olderThanDays: number = 7): void {
  const cutoff = Date.now() - olderThanDays * 24 * 60 * 60 * 1000;

  for (const [planId, plan] of activePlans.entries()) {
    if (plan.status === 'completed' || plan.status === 'failed') {
      const planDate = new Date(plan.updatedAt).getTime();
      if (planDate < cutoff) {
        activePlans.delete(planId);
        executionResults.delete(planId);
        planFeedback.delete(planId);
      }
    }
  }
}

