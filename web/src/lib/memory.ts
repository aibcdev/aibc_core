/**
 * Agent Memory Service
 * Handles semantic storage and retrieval using vector embeddings.
 * Stores data in localStorage for persistence without external DBs.
 */

import { getEmbedding } from './gemini';

export interface MemoryItem {
    id: string;
    content: string;
    embedding: number[];
    type: 'campaign' | 'brand_voice' | 'rule' | 'content_pattern';
    timestamp: number;
    metadata?: Record<string, any>;
}

const STORAGE_KEY = 'agent_long_term_memory';

class MemoryService {
    private memories: MemoryItem[] = [];

    constructor() {
        this.load();
    }

    private load() {
        if (typeof localStorage === 'undefined') return;
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            this.memories = data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('Failed to load memory:', e);
            this.memories = [];
        }
    }

    private save() {
        if (typeof localStorage === 'undefined') return;
        try {
            // Cap memory at 100 items for basic localStorage performance
            if (this.memories.length > 100) {
                // Remove oldest, keep newest
                this.memories = this.memories.sort((a, b) => b.timestamp - a.timestamp).slice(0, 100);
            }
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.memories));
        } catch (e) {
            console.error('Failed to save memory:', e);
        }
    }

    /**
     * Store a new item in memory
     */
    async store(
        content: string,
        type: MemoryItem['type'],
        metadata: Record<string, any> = {}
    ): Promise<void> {
        try {
            const embedding = await getEmbedding(content);

            const newItem: MemoryItem = {
                id: crypto.randomUUID(),
                content,
                embedding,
                type,
                timestamp: Date.now(),
                metadata
            };

            this.memories.push(newItem);
            this.save();
            console.log(`[Memory] Stored ${type}: "${content.slice(0, 50)}..."`);
        } catch (error) {
            console.error('Failed to store memory:', error);
        }
    }

    /**
     * Retrieve relevant memories based on semantic similarity
     */
    async recall(query: string, limit: number = 3): Promise<MemoryItem[]> {
        if (this.memories.length === 0) return [];

        try {
            const queryEmbedding = await getEmbedding(query);

            // Calculate cosine similarity for all items
            const scored = this.memories.map(item => ({
                item,
                score: this.cosineSimilarity(queryEmbedding, item.embedding)
            }));

            // Sort by score desc
            scored.sort((a, b) => b.score - a.score);

            // Filter for minimum relevance (0.6 is a reasonable threshold for strong matches)
            const relevant = scored.filter(s => s.score > 0.65).slice(0, limit);

            if (relevant.length > 0) {
                console.log(`[Memory] Recalled ${relevant.length} items for query: "${query.slice(0, 30)}..."`);
            }

            return relevant.map(s => s.item);
        } catch (error) {
            console.error('Failed to recall memory:', error);
            return [];
        }
    }

    /**
     * Calculate cosine similarity between two vectors
     */
    private cosineSimilarity(vecA: number[], vecB: number[]): number {
        let dotProduct = 0;
        let magnitudeA = 0;
        let magnitudeB = 0;

        for (let i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
            magnitudeA += vecA[i] * vecA[i];
            magnitudeB += vecB[i] * vecB[i];
        }

        magnitudeA = Math.sqrt(magnitudeA);
        magnitudeB = Math.sqrt(magnitudeB);

        if (magnitudeA === 0 || magnitudeB === 0) return 0;

        return dotProduct / (magnitudeA * magnitudeB);
    }

    /**
     * Clear all memory (debug helper)
     */
    clear() {
        this.memories = [];
        localStorage.removeItem(STORAGE_KEY);
    }
}

export const agentMemory = new MemoryService();
