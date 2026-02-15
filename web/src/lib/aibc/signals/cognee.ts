/**
 * Cognee Memory Connector
 * Interface for the Cognee Graph RAG Service (Port 8001)
 */

const COGNEE_URL = (typeof process !== 'undefined' ? process.env.VITE_COGNEE_URL || process.env.COGNEE_URL : undefined) || (import.meta as any).env?.VITE_COGNEE_URL || 'http://localhost:8001';

console.log(`[Cognee] Connector initialized with URL: ${COGNEE_URL}`);

export interface CogneeMemory {
    content: string;
    score: number;
    metadata?: any;
}

export interface CogneeSearchResponse {
    results: CogneeMemory[];
    context_prompt: string;
}

/**
 * Add a memory to the Cognee Knowledge Graph
 */
export async function addCogneeMemory(
    userId: string,
    agentId: string,
    content: string,
    role: 'user' | 'assistant' = 'assistant'
): Promise<boolean> {
    try {
        const response = await fetch(`${COGNEE_URL}/memory/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: userId,
                character_id: agentId,
                content: content,
                role: role
            })
        });

        if (!response.ok) {
            console.error('[Cognee] Failed to add memory:', await response.text());
            return false;
        }

        return true;
    } catch (error) {
        console.error('[Cognee] Error connecting to service:', error);
        return false;
    }
}

/**
 * Search the Cognee Knowledge Graph
 */
export async function searchCogneeMemory(
    userId: string,
    agentId: string,
    query: string,
    limit: number = 5
): Promise<CogneeSearchResponse> {
    try {
        const response = await fetch(`${COGNEE_URL}/memory/search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: userId,
                character_id: agentId,
                query: query,
                limit: limit
            })
        });

        if (!response.ok) {
            console.warn('[Cognee] Search failed:', await response.text());
            return { results: [], context_prompt: "" };
        }

        return await response.json() as CogneeSearchResponse;
    } catch (error) {
        console.error('[Cognee] Error connecting to search service:', error);
        return { results: [], context_prompt: "" };
    }
}
