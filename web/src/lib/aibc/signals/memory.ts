/**
 * AIBC Agent Memory System
 * Implements 4-Layer Memory Architecture (Short, Working, Long, Performance)
 */

import { getSupabaseClient } from './storage';
import type { MemoryItem, MemoryType, AgentType } from './types';

// --- CONSTANTS ---

const SHORT_TERM_TTL_HOURS = 72; // "24-72h" from spec

// --- MEMORY OPERATIONS ---

/**
 * Add a new memory item
 */
export async function addMemory(
    agentType: AgentType,
    type: MemoryType,
    content: string,
    confidence: number = 0.5,
    metadata: any = {}
): Promise<string | null> {
    const client = getSupabaseClient();
    if (!client) return null;

    // Resolve Agent ID
    const { data: agent } = await client
        .from('agents')
        .select('id')
        .eq('type', agentType)
        .single();

    if (!agent) {
        console.error(`Memory Error: Agent ${agentType} not found.`);
        return null;
    }

    // Calculate Expiry for Short Term
    let expiresAt: string | null = null;
    if (type === 'short_term') {
        const d = new Date();
        d.setHours(d.getHours() + SHORT_TERM_TTL_HOURS);
        expiresAt = d.toISOString();
    }

    const { data, error } = await client
        .from('memory_items')
        .insert({
            agent_id: agent.id,
            type,
            content,
            confidence,
            metadata,
            expires_at: expiresAt
        })
        .select('id')
        .single();

    if (error) {
        console.error('Error adding memory:', error);
        return null;
    }

    return data.id;
}

/**
 * Promote a memory (Short -> Long)
 * Rule: if (event_repeats >= 3 && outcome_positive) { promote }
 */
export async function promoteMemory(memoryId: string): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;

    // 1. Fetch original memory
    const { data: mem, error: fetchError } = await client
        .from('memory_items')
        .select('*')
        .eq('id', memoryId)
        .single();

    if (fetchError || !mem) return false;

    // 2. Insert new Long Term memory
    const { error: insertError } = await client
        .from('memory_items')
        .insert({
            agent_id: mem.agent_id,
            type: 'long_term',
            content: mem.content,
            confidence: Math.min(mem.confidence + 0.2, 1.0), // Boost confidence on promotion
            metadata: { ...mem.metadata, promoted_from: memoryId, promoted_at: new Date().toISOString() }
        });

    if (insertError) {
        console.error('Promotion failed:', insertError);
        return false;
    }

    // 3. Mark old memory as promoted (or deleted? Spec implies movement, but keeping record often safer)
    // For now, let's just leave it to expire naturally or we can update metadata
    await client
        .from('memory_items')
        .update({ metadata: { ...mem.metadata, extracted_to_long_term: true } })
        .eq('id', memoryId);

    return true;
}

/**
 * Retrieve active memories for Agent Context
 */
export async function getAgentContext(agentType: AgentType): Promise<{
    short_term: MemoryItem[];
    working: MemoryItem[];
    long_term: MemoryItem[];
}> {
    const client = getSupabaseClient();
    if (!client) return { short_term: [], working: [], long_term: [] };

    // Get Agent ID
    const { data: agent } = await client.from('agents').select('id').eq('type', agentType).single();
    if (!agent) return { short_term: [], working: [], long_term: [] };

    // Fetch all active memories
    const { data: memories } = await client
        .from('memory_items')
        .select('*')
        .eq('agent_id', agent.id)
        .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
        .order('created_at', { ascending: false })
        .limit(50); // Sanity limit for prompt context

    if (!memories) return { short_term: [], working: [], long_term: [] };

    return {
        short_term: memories.filter((m: MemoryItem) => m.type === 'short_term'),
        working: memories.filter((m: MemoryItem) => m.type === 'working'),
        long_term: memories.filter((m: MemoryItem) => m.type === 'long_term').slice(0, 10) // Only top long-term
    };
}

/**
 * Fetch dialogue history for a specific channel
 */
export async function getDialogueHistory(
    channelId: string,
    limit: number = 10
): Promise<MemoryItem[]> {
    const client = getSupabaseClient();
    if (!client) return [];

    const { data: memories, error } = await client
        .from('memory_items')
        .select('*')
        .eq('type', 'short_term')
        .filter('metadata->>channelId', 'eq', channelId)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('[Memory] Error fetching dialogue history:', error);
        return [];
    }

    // Return in chronological order
    return (memories || []).reverse();
}

/**
 * Archive a Working Context (Project Closed)
 */
export async function archiveWorkingContext(memoryId: string) {
    const client = getSupabaseClient();
    if (!client) return;

    await client
        .from('memory_items')
        .update({ expires_at: new Date().toISOString() }) // Expire immediately
        .eq('id', memoryId)
        .eq('type', 'working');
}
