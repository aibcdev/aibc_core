/**
 * AIBC Task Definition Schema
 * 
 * Tasks are the specific jobs that characters execute with brand overlays applied.
 */
import { z } from 'zod';
import type { TaskDefinition, TaskConstraints } from '../../shared/types.js';

// ============================================
// ZOD SCHEMAS FOR VALIDATION
// ============================================

export const TaskConstraintsSchema = z.object({
    max_words: z.number().positive().optional(),
    avoid_jargon: z.boolean().optional(),
    format: z.string().optional(),
});

export const TaskDefinitionSchema = z.object({
    task_id: z.string().regex(/^task_[a-z0-9]+$/, 'Must start with task_'),
    task_type: z.string().min(1),
    objective: z.string().min(1),
    inputs: z.record(z.any()),
    outputs_required: z.array(z.string()).min(1),
    constraints: TaskConstraintsSchema,
});

// ============================================
// VALIDATION FUNCTIONS
// ============================================

export function validateTaskDefinition(data: unknown): TaskDefinition {
    return TaskDefinitionSchema.parse(data) as TaskDefinition;
}

export function isValidTaskDefinition(data: unknown): data is TaskDefinition {
    return TaskDefinitionSchema.safeParse(data).success;
}

// ============================================
// FACTORY FUNCTIONS
// ============================================

let taskCounter = 0;

export function createTaskDefinition(options: {
    task_type: string;
    objective: string;
    inputs: Record<string, unknown>;
    outputs_required: string[];
    constraints?: Partial<TaskConstraints>;
}): TaskDefinition {
    taskCounter++;
    const taskId = `task_${taskCounter.toString(36)}${Date.now().toString(36)}`;

    return {
        task_id: taskId,
        task_type: options.task_type,
        objective: options.objective,
        inputs: options.inputs,
        outputs_required: options.outputs_required,
        constraints: {
            max_words: options.constraints?.max_words,
            avoid_jargon: options.constraints?.avoid_jargon,
            format: options.constraints?.format,
        },
    };
}

// ============================================
// TASK TYPE TEMPLATES
// ============================================

export const TASK_TEMPLATES = {
    competitor_analysis: {
        task_type: 'competitor_analysis',
        outputs_required: ['summary', 'key_insights', 'recommendations', 'content_angles'],
        default_constraints: { max_words: 900, avoid_jargon: false, format: 'executive_brief' },
    },
    thought_leadership: {
        task_type: 'thought_leadership',
        outputs_required: ['title', 'main_content', 'key_takeaways', 'cta'],
        default_constraints: { max_words: 1200, avoid_jargon: true, format: 'blog_post' },
    },
    product_positioning: {
        task_type: 'product_positioning',
        outputs_required: ['positioning_statement', 'differentiators', 'messaging_pillars', 'proof_points'],
        default_constraints: { max_words: 600, avoid_jargon: false, format: 'framework' },
    },
    social_campaign: {
        task_type: 'social_campaign',
        outputs_required: ['campaign_theme', 'post_series', 'hashtags', 'engagement_hooks'],
        default_constraints: { max_words: 400, avoid_jargon: true, format: 'social_posts' },
    },
    email_sequence: {
        task_type: 'email_sequence',
        outputs_required: ['subject_lines', 'email_bodies', 'ctas', 'sequence_logic'],
        default_constraints: { max_words: 1500, avoid_jargon: true, format: 'email_series' },
    },
    executive_summary: {
        task_type: 'executive_summary',
        outputs_required: ['summary', 'key_metrics', 'recommendations', 'next_steps'],
        default_constraints: { max_words: 500, avoid_jargon: false, format: 'executive_brief' },
    },
    case_study: {
        task_type: 'case_study',
        outputs_required: ['challenge', 'solution', 'results', 'testimonial_angles'],
        default_constraints: { max_words: 800, avoid_jargon: false, format: 'narrative' },
    },
    crisis_response: {
        task_type: 'crisis_response',
        outputs_required: ['statement', 'q_and_a', 'talking_points', 'next_actions'],
        default_constraints: { max_words: 600, avoid_jargon: true, format: 'pr_response' },
    },
};

export type TaskTemplateType = keyof typeof TASK_TEMPLATES;

export function createTaskFromTemplate(
    template: TaskTemplateType,
    options: {
        objective: string;
        inputs: Record<string, unknown>;
        constraintOverrides?: Partial<TaskConstraints>;
    }
): TaskDefinition {
    const t = TASK_TEMPLATES[template];
    return createTaskDefinition({
        task_type: t.task_type,
        objective: options.objective,
        inputs: options.inputs,
        outputs_required: t.outputs_required,
        constraints: {
            ...t.default_constraints,
            ...options.constraintOverrides,
        },
    });
}
