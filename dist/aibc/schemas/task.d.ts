/**
 * AIBC Task Definition Schema
 *
 * Tasks are the specific jobs that characters execute with brand overlays applied.
 */
import { z } from 'zod';
import type { TaskDefinition, TaskConstraints } from '../../shared/types.js';
export declare const TaskConstraintsSchema: z.ZodObject<{
    max_words: z.ZodOptional<z.ZodNumber>;
    avoid_jargon: z.ZodOptional<z.ZodBoolean>;
    format: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    max_words?: number | undefined;
    avoid_jargon?: boolean | undefined;
    format?: string | undefined;
}, {
    max_words?: number | undefined;
    avoid_jargon?: boolean | undefined;
    format?: string | undefined;
}>;
export declare const TaskDefinitionSchema: z.ZodObject<{
    task_id: z.ZodString;
    task_type: z.ZodString;
    objective: z.ZodString;
    inputs: z.ZodRecord<z.ZodString, z.ZodAny>;
    outputs_required: z.ZodArray<z.ZodString, "many">;
    constraints: z.ZodObject<{
        max_words: z.ZodOptional<z.ZodNumber>;
        avoid_jargon: z.ZodOptional<z.ZodBoolean>;
        format: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        max_words?: number | undefined;
        avoid_jargon?: boolean | undefined;
        format?: string | undefined;
    }, {
        max_words?: number | undefined;
        avoid_jargon?: boolean | undefined;
        format?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    task_id: string;
    task_type: string;
    objective: string;
    inputs: Record<string, any>;
    outputs_required: string[];
    constraints: {
        max_words?: number | undefined;
        avoid_jargon?: boolean | undefined;
        format?: string | undefined;
    };
}, {
    task_id: string;
    task_type: string;
    objective: string;
    inputs: Record<string, any>;
    outputs_required: string[];
    constraints: {
        max_words?: number | undefined;
        avoid_jargon?: boolean | undefined;
        format?: string | undefined;
    };
}>;
export declare function validateTaskDefinition(data: unknown): TaskDefinition;
export declare function isValidTaskDefinition(data: unknown): data is TaskDefinition;
export declare function createTaskDefinition(options: {
    task_type: string;
    objective: string;
    inputs: Record<string, unknown>;
    outputs_required: string[];
    constraints?: Partial<TaskConstraints>;
}): TaskDefinition;
export declare const TASK_TEMPLATES: {
    competitor_analysis: {
        task_type: string;
        outputs_required: string[];
        default_constraints: {
            max_words: number;
            avoid_jargon: boolean;
            format: string;
        };
    };
    thought_leadership: {
        task_type: string;
        outputs_required: string[];
        default_constraints: {
            max_words: number;
            avoid_jargon: boolean;
            format: string;
        };
    };
    product_positioning: {
        task_type: string;
        outputs_required: string[];
        default_constraints: {
            max_words: number;
            avoid_jargon: boolean;
            format: string;
        };
    };
    social_campaign: {
        task_type: string;
        outputs_required: string[];
        default_constraints: {
            max_words: number;
            avoid_jargon: boolean;
            format: string;
        };
    };
    email_sequence: {
        task_type: string;
        outputs_required: string[];
        default_constraints: {
            max_words: number;
            avoid_jargon: boolean;
            format: string;
        };
    };
    executive_summary: {
        task_type: string;
        outputs_required: string[];
        default_constraints: {
            max_words: number;
            avoid_jargon: boolean;
            format: string;
        };
    };
    case_study: {
        task_type: string;
        outputs_required: string[];
        default_constraints: {
            max_words: number;
            avoid_jargon: boolean;
            format: string;
        };
    };
    crisis_response: {
        task_type: string;
        outputs_required: string[];
        default_constraints: {
            max_words: number;
            avoid_jargon: boolean;
            format: string;
        };
    };
};
export type TaskTemplateType = keyof typeof TASK_TEMPLATES;
export declare function createTaskFromTemplate(template: TaskTemplateType, options: {
    objective: string;
    inputs: Record<string, unknown>;
    constraintOverrides?: Partial<TaskConstraints>;
}): TaskDefinition;
//# sourceMappingURL=task.d.ts.map