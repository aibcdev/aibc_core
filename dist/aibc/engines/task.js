import { PromptGenerator } from './prompt.js';
import { BrandEngine } from './brand.js';
class GeminiClient {
    apiKey;
    model;
    baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
    constructor(apiKey = '', model = 'gemini-1.5-flash') {
        this.apiKey = apiKey;
        this.model = model;
    }
    async generateContent(request) {
        if (!this.apiKey) {
            // Return mock response for testing
            const mockResponse = this.generateMockResponse(request);
            return {
                candidates: [{
                        content: { parts: [{ text: mockResponse }] },
                        finishReason: 'STOP',
                    }],
                usageMetadata: {
                    promptTokenCount: 500,
                    candidatesTokenCount: 400,
                    totalTokenCount: 900,
                },
            };
        }
        // Real Gemini API call
        const url = `${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
        });
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Gemini API error: ${response.status} - ${error}`);
        }
        return await response.json();
    }
    generateMockResponse(request) {
        // Extract task type from content
        const userContent = request.contents.map(c => c.parts.map(p => p.text).join('')).join('\n');
        const isCompetitorAnalysis = userContent.toLowerCase().includes('competitor');
        const isThoughtLeadership = userContent.toLowerCase().includes('thought_leadership');
        if (isCompetitorAnalysis) {
            return `## Executive Summary
Based on our analysis, the client has significant opportunities to differentiate in the market.

## Key Insights
- Competitors focus heavily on feature parity
- Market gap exists in personalized solutions
- Price sensitivity varies by segment

## Recommendations
1. Lead with value-based messaging
2. Emphasize unique differentiators
3. Target underserved segments

## Content Angles
- Authority positioning through thought leadership
- Case studies highlighting unique outcomes
- Comparison content focused on value, not features`;
        }
        if (isThoughtLeadership) {
            return `## Title
The Future of Strategic Marketing: Moving Beyond the Noise

## Main Content
In today's saturated market, brands that win are those that lead with insight rather than volume. The most successful companies aren't just marketing—they're educating, challenging assumptions, and providing genuine value.

## Key Takeaways
- Quality over quantity in content strategy
- Build authority through expert-level insights
- Focus on solving real problems, not selling features

## CTA
Ready to transform your marketing approach? Let's start with a strategic audit.`;
        }
        return `## Generated Content

This is a mock response generated without an API key.

The actual Gemini API integration will produce real, contextual content based on:
- Character persona
- Brand overlay
- Task requirements

To enable real responses, set GEMINI_API_KEY environment variable.`;
    }
    setModel(model) {
        this.model = model;
    }
}
export class TaskEngine {
    promptGenerator;
    brandEngine;
    geminiClient;
    model = 'gemini-1.5-flash';
    constructor(options = {}) {
        this.promptGenerator = new PromptGenerator();
        this.brandEngine = new BrandEngine();
        this.geminiClient = new GeminiClient(options.apiKey, options.model ?? this.model);
        if (options.model)
            this.model = options.model;
    }
    /**
     * Execute a task with character, overlay, and task definition
     */
    async executeTask(snapshot, overlay, task) {
        const startTime = Date.now();
        try {
            // Validate compatibility
            const validation = this.brandEngine.validateCompatibility(snapshot, overlay);
            if (!validation.valid && validation.errors.length > 0) {
                return {
                    success: false,
                    error: `Validation failed: ${validation.errors.join('; ')}`,
                    duration_ms: Date.now() - startTime,
                };
            }
            // Generate prompts
            const prompts = this.promptGenerator.composeSingle(snapshot, overlay, task);
            // Call Gemini
            const response = await this.geminiClient.generateContent({
                systemInstruction: {
                    parts: [{ text: prompts.system }],
                },
                contents: [{
                        role: 'user',
                        parts: [{ text: prompts.user }],
                    }],
                generationConfig: {
                    maxOutputTokens: this.calculateMaxTokens(task),
                    temperature: 0.7,
                    topP: 0.95,
                },
            });
            // Parse response
            const content = response.candidates[0]?.content.parts[0]?.text ?? '';
            const sections = this.parseOutputSections(content, task.outputs_required);
            const output = {
                character_snapshot_id: snapshot.character_snapshot_id,
                overlay_id: overlay.overlay_id,
                task_id: task.task_id,
                timestamp: new Date().toISOString(),
                content,
                sections,
            };
            return {
                success: true,
                output,
                usage: response.usageMetadata ? {
                    input_tokens: response.usageMetadata.promptTokenCount,
                    output_tokens: response.usageMetadata.candidatesTokenCount,
                } : undefined,
                duration_ms: Date.now() - startTime,
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error),
                duration_ms: Date.now() - startTime,
            };
        }
    }
    /**
     * Calculate max tokens based on task constraints
     */
    calculateMaxTokens(task) {
        if (task.constraints.max_words) {
            // Rough estimate: 1 word ≈ 1.3 tokens
            return Math.ceil(task.constraints.max_words * 1.3);
        }
        return 2048; // Default
    }
    /**
     * Parse output into sections based on required outputs
     */
    parseOutputSections(content, requiredOutputs) {
        const sections = {};
        // Try to find sections by common headings
        for (const output of requiredOutputs) {
            const heading = output.replace(/_/g, ' ');
            const patterns = [
                new RegExp(`##\\s*${heading}[:\\s]*\\n([\\s\\S]*?)(?=##|$)`, 'i'),
                new RegExp(`\\*\\*${heading}[:\\*]*\\*\\*[:\\s]*([\\s\\S]*?)(?=\\*\\*|##|$)`, 'i'),
                new RegExp(`${heading}:[\\s]*([\\s\\S]*?)(?=\\n\\n|$)`, 'i'),
            ];
            for (const pattern of patterns) {
                const match = content.match(pattern);
                if (match?.[1]) {
                    sections[output] = match[1].trim();
                    break;
                }
            }
            // If not found, assign empty
            if (!sections[output]) {
                sections[output] = '';
            }
        }
        return sections;
    }
    /**
     * Set Gemini model
     */
    setModel(model) {
        this.model = model;
        this.geminiClient.setModel(model);
    }
    /**
     * Get the brand engine for overlay management
     */
    getBrandEngine() {
        return this.brandEngine;
    }
    /**
     * Get the prompt generator for inspection
     */
    getPromptGenerator() {
        return this.promptGenerator;
    }
}
// Export factory function
export function createTaskEngine(options) {
    return new TaskEngine(options);
}
export default TaskEngine;
//# sourceMappingURL=task.js.map