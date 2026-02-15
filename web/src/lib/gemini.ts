/**
 * Gemini Flash API Client
 * Wired to agent system prompts with memory and confidence context
 */

import { getAgentPrompt, type AgentPromptId } from './agents/system-prompts';
import { useMarketingOS } from './store';

import { agentMemory } from './memory';

// Gemini API Configuration
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
const EMBEDDING_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent';

interface GeminiMessage {
    role: 'user' | 'model';
    parts: { text: string }[];
}

interface GeminiResponse {
    candidates: {
        content: {
            parts: { text: string }[];
        };
    }[];
}

/**
 * Get API key from environment or localStorage
 */
function getApiKey(): string | null {
    // Check Vite environment
    try {
        const apiKey = import.meta.env?.VITE_GEMINI_API_KEY;
        if (apiKey) return apiKey;
    } catch {
        // Environment not available
    }

    // Fall back to localStorage
    if (typeof localStorage !== 'undefined') {
        return localStorage.getItem('gemini_api_key');
    }

    return null;
}

/**
 * Get vector embedding for text using Gemini Embeddings API
 */
export async function getEmbedding(text: string): Promise<number[]> {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error('No API Key found');

    const response = await fetch(`${EMBEDDING_API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            content: { parts: [{ text }] }
        })
    });

    if (!response.ok) {
        console.warn('Embedding failed, skipping memory storage');
        return [];
    }

    const data = await response.json();
    return data.embedding.values;
}

/**
 * Call Gemini Flash with agent context and RAG memory
 */
export async function callGemini(
    agentId: AgentPromptId,
    userMessage: string,
    conversationHistory: GeminiMessage[] = []
): Promise<string> {
    const apiKey = getApiKey();

    if (!apiKey) {
        throw new Error('Gemini API key not configured. Set VITE_GEMINI_API_KEY or use localStorage.');
    }

    // RAG: Retrieve relevant memories
    let contextInjection = '';
    try {
        const memories = await agentMemory.recall(userMessage);
        if (memories.length > 0) {
            contextInjection = `\n\nRELEVANT MEMORIES FROM PAST SUCCESSES:\n${memories.map(m => `- ${m.content}`).join('\n')}\n(Use these patterns to guide your current task)`;
        }
    } catch (e) {
        console.warn('Memory recall failed:', e);
    }

    // Get agent context from store
    const store = useMarketingOS.getState();
    const agentConfidence = store.agentConfidence[agentId]?.confidence || 70;
    const agentTasks = store.tasks.filter(t => t.assigned_to === agentId);
    const recentTaskTitles = agentTasks.slice(-5).map(t => t.title);

    // Get system prompt with dynamic context
    const systemPrompt = getAgentPrompt(agentId, {
        confidence: agentConfidence,
        recentTasks: recentTaskTitles
    }) + contextInjection;

    // Build request
    const contents: GeminiMessage[] = [
        // System instruction as first "user" message (Gemini pattern)
        { role: 'user', parts: [{ text: `SYSTEM INSTRUCTIONS:\n${systemPrompt}` }] },
        { role: 'model', parts: [{ text: 'Understood. I am ready to operate as this agent.' }] },
        ...conversationHistory,
        { role: 'user', parts: [{ text: userMessage }] }
    ];

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents,
            generationConfig: {
                temperature: getTemperatureForConfidence(agentConfidence),
                maxOutputTokens: 2048,
                topP: 0.95
            },
            safetySettings: [
                { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
                { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
                { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
                { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
            ]
        })
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Gemini API error: ${error}`);
    }

    const data: GeminiResponse = await response.json();
    return data.candidates[0]?.content?.parts[0]?.text || 'No response generated.';
}

/**
 * Temperature based on agent confidence
 * Higher confidence = more deterministic
 * Lower confidence = more exploratory
 */
function getTemperatureForConfidence(confidence: number): number {
    if (confidence >= 80) return 0.3;  // Very confident = focused
    if (confidence >= 60) return 0.5;  // Normal
    if (confidence >= 40) return 0.7;  // Uncertain = more options
    return 0.9;  // Low confidence = exploratory
}

/**
 * Generate structured output from agent (for artifacts)
 */
export async function generateAgentArtifact(
    agentId: AgentPromptId,
    taskDescription: string,
    outputType: string
): Promise<unknown> {
    const prompt = `
TASK: ${taskDescription}

OUTPUT TYPE: ${outputType}

Respond with a valid JSON object that represents this ${outputType}.
No markdown formatting, just the JSON.
`;

    const response = await callGemini(agentId, prompt);

    try {
        // Extract JSON from response (handle potential markdown wrapping)
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return { raw: response };
    } catch {
        return { raw: response };
    }
}

/**
 * Agent-specific generation functions
 */
export const AgentAI = {
    /**
     * Echo: Analyze a signal and assess relevance
     */
    async analyzeSignal(signalText: string) {
        return generateAgentArtifact('echo', `
            Analyze this market signal:
            "${signalText}"
            
            Assess: relevance (0-100), urgency (low/medium/high), 
            impact on content strategy, impact on growth, 
            recommended actions for other agents.
        `, 'SignalAssessment');
    },

    /**
     * Sage: Generate content draft
     */
    async draftContent(topic: string, platform: string, brandContext?: string) {
        return generateAgentArtifact('sage', `
            Create a ${platform} post about: "${topic}"
            ${brandContext ? `Brand context: ${brandContext}` : ''}
            
            Include: headline, body copy, call-to-action, 
            suggested visuals, estimated engagement.
        `, 'ContentDraft');
    },

    /**
     * Pulse: Score content for brand alignment
     */
    async scoreBrandAlignment(content: string, brandRules?: string[]) {
        return generateAgentArtifact('pulse', `
            Score this content for brand alignment:
            "${content}"
            
            ${brandRules ? `Brand rules to check:\n${brandRules.join('\n')}` : ''}
            
            Score dimensions: tone (0-100), language (0-100), 
            visual consistency (0-100), risk level (low/medium/high).
            List any violations with specific quotes.
        `, 'BrandScorecard');
    },

    /**
     * Vantage: Create campaign hypothesis
     */
    async proposeCampaign(context: string, budget?: string) {
        return generateAgentArtifact('vantage', `
            Propose a campaign based on:
            "${context}"
            ${budget ? `Budget constraint: ${budget}` : ''}
            
            Include: hypothesis, target audience, timeline, 
            expected ROI, success metrics, risks.
        `, 'CampaignProposal');
    },

    /**
     * Oracle: Generate executive summary
     */
    async summarizeForExec(activities: string[]) {
        return generateAgentArtifact('oracle', `
            Summarize these activities for executive review:
            ${activities.map((a, i) => `${i + 1}. ${a}`).join('\n')}
            
            Include: key changes, top risks (with severity), 
            recommended decisions, metrics snapshot.
            Maximum 5 bullet points in summary.
        `, 'ExecutiveSummary');
    }
};

export default AgentAI;
