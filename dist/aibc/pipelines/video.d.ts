/**
 * Video Fulfillment Pipeline
 *
 * Async video generation for Elite $499 tier using Tavus.
 * Video is scarce, intentional, premium.
 *
 * Flow:
 * 1. Gemini generates script + delivery instructions
 * 2. AIBC creates video job (queued)
 * 3. Tavus renders video async
 * 4. Video delivered back to AIBC (12-24h)
 */
import type { CharacterSnapshot, BrandOverlay } from '../../shared/types.js';
export interface VideoJobRequest {
    source_task_id: string;
    script: string;
    delivery_notes: DeliveryNotes;
    persona_profile: CharacterSnapshot;
    brand_overlay: BrandOverlay;
    visual_style: 'professional_talking_head' | 'dynamic_slides' | 'podcast_style';
    duration_seconds?: number;
}
export interface DeliveryNotes {
    tone: 'authoritative' | 'warm' | 'energetic' | 'measured';
    pacing: 'slow' | 'measured' | 'fast';
    energy: 'subdued' | 'controlled' | 'energetic';
    facial_expression: 'neutral_confident' | 'friendly' | 'serious';
}
export interface VideoJob {
    video_job_id: string;
    source_task_id: string;
    status: 'queued' | 'processing' | 'completed' | 'failed';
    provider: 'tavus';
    sla_hours: number;
    created_at: string;
    completed_at?: string;
    inputs: {
        script: string;
        persona_profile: string;
        brand_overlay: string;
        visual_style: string;
    };
    output?: {
        video_url: string;
        duration_seconds: number;
        thumbnail_url?: string;
    };
    error?: string;
}
export interface VideoQuota {
    tier: 'basic' | 'pro' | 'elite';
    monthly_limit: number;
    used: number;
    remaining: number;
}
export declare class VideoFulfillmentEngine {
    private tavusClient;
    private jobs;
    private quotas;
    constructor(options?: {
        tavusApiKey?: string;
    });
    /**
     * Check if user has video access (Elite tier)
     */
    checkVideoAccess(userId: string): {
        allowed: boolean;
        reason?: string;
        quota?: VideoQuota;
    };
    /**
     * Create a video job (gated by tier)
     */
    createVideoJob(userId: string, request: VideoJobRequest): Promise<{
        success: boolean;
        job?: VideoJob;
        error?: string;
    }>;
    /**
     * Process queued job (called by worker)
     */
    processJob(jobId: string): Promise<{
        success: boolean;
        error?: string;
    }>;
    /**
     * Get job status
     */
    getJob(jobId: string): VideoJob | undefined;
    /**
     * List jobs for a task
     */
    getJobsByTask(taskId: string): VideoJob[];
    /**
     * Set user quota (for tier management)
     */
    setUserQuota(userId: string, tier: 'basic' | 'pro' | 'elite'): void;
    private createDefaultQuota;
}
export declare function createVideoFulfillmentEngine(options?: {
    tavusApiKey?: string;
}): VideoFulfillmentEngine;
export default VideoFulfillmentEngine;
//# sourceMappingURL=video.d.ts.map