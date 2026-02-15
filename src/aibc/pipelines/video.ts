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
import type { CharacterSnapshot, BrandOverlay, TaskDefinition, TextOutput } from '../../shared/types.js';

// ============================================
// VIDEO JOB TYPES
// ============================================

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

// ============================================
// TAVUS CLIENT (STUB)
// ============================================

interface TavusRequest {
    script: string;
    voice_id?: string;
    avatar_id?: string;
    background?: string;
    duration_limit?: number;
}

interface TavusResponse {
    video_id: string;
    status: 'processing' | 'completed' | 'failed';
    video_url?: string;
    duration_seconds?: number;
    error?: string;
}

class TavusClient {
    private apiKey: string;
    private baseUrl = 'https://api.tavus.io/v1';

    constructor(apiKey: string = '') {
        this.apiKey = apiKey;
    }

    async createVideo(request: TavusRequest): Promise<TavusResponse> {
        if (!this.apiKey) {
            // Stub response for testing
            console.log('[Tavus] Creating video (stub mode)...');
            console.log(`[Tavus] Script length: ${request.script.length} chars`);
            return {
                video_id: `vid_${Date.now().toString(36)}`,
                status: 'processing',
            };
        }

        // Real Tavus API call would go here
        const response = await fetch(`${this.baseUrl}/videos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': this.apiKey,
            },
            body: JSON.stringify(request),
        });

        if (!response.ok) {
            throw new Error(`Tavus API error: ${response.status}`);
        }

        return await response.json() as TavusResponse;
    }

    async getVideoStatus(videoId: string): Promise<TavusResponse> {
        if (!this.apiKey) {
            // Stub: simulate completion after some time
            return {
                video_id: videoId,
                status: 'completed',
                video_url: `https://cdn.tavus.io/videos/${videoId}.mp4`,
                duration_seconds: 90,
            };
        }

        const response = await fetch(`${this.baseUrl}/videos/${videoId}`, {
            headers: { 'x-api-key': this.apiKey },
        });

        return await response.json() as TavusResponse;
    }
}

// ============================================
// VIDEO FULFILLMENT ENGINE
// ============================================

export class VideoFulfillmentEngine {
    private tavusClient: TavusClient;
    private jobs: Map<string, VideoJob> = new Map();
    private quotas: Map<string, VideoQuota> = new Map();

    constructor(options: { tavusApiKey?: string } = {}) {
        this.tavusClient = new TavusClient(options.tavusApiKey);
    }

    /**
     * Check if user has video access (Elite tier)
     */
    checkVideoAccess(userId: string): { allowed: boolean; reason?: string; quota?: VideoQuota } {
        const quota = this.quotas.get(userId) ?? this.createDefaultQuota('basic');

        if (quota.tier !== 'elite') {
            return {
                allowed: false,
                reason: 'Video generation requires Elite tier ($499/month)',
                quota,
            };
        }

        if (quota.remaining <= 0) {
            return {
                allowed: false,
                reason: 'Monthly video quota exhausted',
                quota,
            };
        }

        return { allowed: true, quota };
    }

    /**
     * Create a video job (gated by tier)
     */
    async createVideoJob(
        userId: string,
        request: VideoJobRequest
    ): Promise<{ success: boolean; job?: VideoJob; error?: string }> {
        // Gate check
        const access = this.checkVideoAccess(userId);
        if (!access.allowed) {
            return { success: false, error: access.reason };
        }

        // Create job
        const jobId = `vid_${Date.now().toString(36)}`;
        const job: VideoJob = {
            video_job_id: jobId,
            source_task_id: request.source_task_id,
            status: 'queued',
            provider: 'tavus',
            sla_hours: 24,
            created_at: new Date().toISOString(),
            inputs: {
                script: request.script,
                persona_profile: request.persona_profile.character_snapshot_id,
                brand_overlay: request.brand_overlay.overlay_id,
                visual_style: request.visual_style,
            },
        };

        this.jobs.set(jobId, job);

        // Decrement quota
        const quota = access.quota!;
        quota.used++;
        quota.remaining--;
        this.quotas.set(userId, quota);

        console.log(`[VideoEngine] Created job ${jobId} for user ${userId}`);
        console.log(`[VideoEngine] Quota remaining: ${quota.remaining}/${quota.monthly_limit}`);

        return { success: true, job };
    }

    /**
     * Process queued job (called by worker)
     */
    async processJob(jobId: string): Promise<{ success: boolean; error?: string }> {
        const job = this.jobs.get(jobId);
        if (!job) {
            return { success: false, error: 'Job not found' };
        }

        if (job.status !== 'queued') {
            return { success: false, error: `Job is ${job.status}, not queued` };
        }

        // Update status
        job.status = 'processing';
        this.jobs.set(jobId, job);

        try {
            // Call Tavus
            const tavusResponse = await this.tavusClient.createVideo({
                script: job.inputs.script,
            });

            // In real implementation, we'd poll for completion
            // For now, simulate immediate completion in stub mode
            const statusResponse = await this.tavusClient.getVideoStatus(tavusResponse.video_id);

            if (statusResponse.status === 'completed') {
                job.status = 'completed';
                job.completed_at = new Date().toISOString();
                job.output = {
                    video_url: statusResponse.video_url!,
                    duration_seconds: statusResponse.duration_seconds!,
                };
            } else if (statusResponse.status === 'failed') {
                job.status = 'failed';
                job.error = statusResponse.error;
            }

            this.jobs.set(jobId, job);
            return { success: true };
        } catch (error) {
            job.status = 'failed';
            job.error = error instanceof Error ? error.message : String(error);
            this.jobs.set(jobId, job);
            return { success: false, error: job.error };
        }
    }

    /**
     * Get job status
     */
    getJob(jobId: string): VideoJob | undefined {
        return this.jobs.get(jobId);
    }

    /**
     * List jobs for a task
     */
    getJobsByTask(taskId: string): VideoJob[] {
        return Array.from(this.jobs.values()).filter(j => j.source_task_id === taskId);
    }

    /**
     * Set user quota (for tier management)
     */
    setUserQuota(userId: string, tier: 'basic' | 'pro' | 'elite'): void {
        this.quotas.set(userId, this.createDefaultQuota(tier));
    }

    private createDefaultQuota(tier: 'basic' | 'pro' | 'elite'): VideoQuota {
        const limits = { basic: 0, pro: 0, elite: 50 };
        return {
            tier,
            monthly_limit: limits[tier],
            used: 0,
            remaining: limits[tier],
        };
    }
}

// Export factory
export function createVideoFulfillmentEngine(options?: { tavusApiKey?: string }): VideoFulfillmentEngine {
    return new VideoFulfillmentEngine(options);
}

export default VideoFulfillmentEngine;
