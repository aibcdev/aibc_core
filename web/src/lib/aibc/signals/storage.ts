/**
 * AIBC Signal Storage Service (Supabase)
 * Production-Ready: Handles Signals, Memories, Tasks, Decisions
 */
/// <reference types="vite/client" />

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Signal, AgentId } from '../../types/marketing-os';
import { DEFAULT_PERSONALITY } from './agents';
import type { AgentOutput, PersonalityProfile } from './agents';
import type { Task } from './types';

// Environment variables should be loaded by dotenv or Vite
const SUPABASE_URL = (typeof process !== 'undefined' ? process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL : undefined) || (import.meta as any).env?.VITE_SUPABASE_URL;
const SUPABASE_KEY = (typeof process !== 'undefined' ? process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY : undefined) || (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

let supabase: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
    if (supabase) return supabase;
    if (!SUPABASE_URL || !SUPABASE_KEY) {
        console.warn('Supabase credentials missing.');
        return null;
    }
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    return supabase;
}

/**
 * Save signals to Supabase
 */
export async function saveSignals(signals: Signal[]) {
    const client = getSupabaseClient();
    if (!client || signals.length === 0) return;

    const records = signals.map(s => ({
        source: s.source,
        category: s.classification,
        title: s.topic,
        content: s.summary,
        url: s.url,
        confidence: s.confidence,
        relevance: s.confidence, // Map confidence to relevance
        payload: { tags: s.tags, urgency: s.urgency, processed: s.processed },
        created_at: s.timestamp.toISOString(),
    }));

    const { error } = await client.from('signals').insert(records);
    if (error) console.error('Error saving signals:', error);
}

/**
 * Fetch recent signals for dashboard
 */
export async function fetchRecentSignals(limit = 20) {
    const client = getSupabaseClient();
    if (!client) return [];

    const { data, error } = await client
        .from('signals')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching signals:', error);
        return [];
    }
    return data;
}

/**
 * Save agent outputs to Supabase
 */
export async function saveAgentOutputs(outputs: AgentOutput[]) {
    const client = getSupabaseClient();
    if (!client || outputs.length === 0) return;

    // Look up agent IDs by type
    const { data: agents } = await client.from('agents').select('id, type');
    const agentMap = new Map(agents?.map(a => [a.type, a.id]) || []);

    const records: any[] = [];

    for (const o of outputs) {
        const agentId = agentMap.get(o.agentType);
        if (!agentId) {
            continue;
        }

        records.push({
            agent_id: agentId,
            output_type: o.outputType,
            title: o.title,
            content: o.content,
            confidence: o.confidence,
            payload: { actions: o.actions, evidence: o.evidence },
        });
    }

    if (records.length > 0) {
        const { error } = await client.from('agent_outputs').insert(records);
        if (error) console.error('Error saving agent outputs:', error);
    }
}

/**
 * Fetch recent structured outputs for dashboard
 */
export async function fetchStructuredOutputs(limit = 10) {
    const client = getSupabaseClient();
    if (!client) return [];

    const { data, error } = await client
        .from('agent_outputs')
        .select('*, agents(type, name, personality_profile)')
        .in('output_type', ['insight', 'recommendation'])
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching outputs:', error);
        return [];
    }
    // Transform formatting to match UI needs if necessary
    return data;
}

// --- NEW MEMORY & TASK functions (Placeholders for now) ---

export async function fetchAgentTasks(_agentType: AgentId): Promise<Task[]> {
    // Placeholder: Need to join with agents table to get agent_owner ID from type
    return [];
}

export async function fetchGlobalDecisionQueue(): Promise<any[]> {
    // Placeholder
    return [];
}

// ... Rest of existing imports like generateExecutiveBrief can stay or be updated if needed ...

/**
 * Fetch chat history for an agent
 */
export async function fetchChatHistory(agentType: AgentId) {
    const client = getSupabaseClient();
    if (!client) return [];

    // Get agent ID
    const { data: agents } = await client.from('agents').select('id').eq('type', agentType).single();
    if (!agents) return [];

    const { data, error } = await client
        .from('chat_messages')
        .select('*')
        .eq('agent_id', agents.id)
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching chat:', error);
        return [];
    }
    return data;
}

/**
 * Save a chat message
 */
export async function saveChatMessage(agentType: AgentId, role: 'user' | 'agent', content: string) {
    const client = getSupabaseClient();
    if (!client) return;

    // Get agent ID
    const { data: agents } = await client.from('agents').select('id').eq('type', agentType).single();
    if (!agents) return;

    const { error } = await client.from('chat_messages').insert({
        agent_id: agents.id,
        role,
        content
    });

    if (error) console.error('Error saving chat message:', error);
}

/**
 * Fetch All Agents (and their personalities)
 */
export async function fetchAgents() {
    const client = getSupabaseClient();
    if (!client) return [];

    const { data, error } = await client.from('agents').select('*');
    if (error) {
        console.error("Error fetching agents:", error);
        return [];
    }
    return data;
}

/**
 * Initialize Default Agents (Helper to ensure agents table is populated)
 */
export async function ensureAgentsExist(brandId: string) {
    const client = getSupabaseClient();
    if (!client) return;

    const agentTypes: AgentId[] = [
        'echo',
        'sage',
        'pulse',
        'vantage',
        'oracle'
    ];

    const { data: existing } = await client.from('agents').select('type').eq('brand_id', brandId);
    const existingTypes = new Set(existing?.map(e => e.type));

    const toInsert = agentTypes
        .filter(t => !existingTypes.has(t))
        .map(t => ({
            brand_id: brandId,
            type: t,
            name: t.replace('_', ' ').toUpperCase(), // Simple name gen
            role: 'system_defined', // Placeholder
            personality_profile: DEFAULT_PERSONALITY,
        }));

    if (toInsert.length > 0) {
        await client.from('agents').insert(toInsert);
    }
}

/**
 * Create a default brand (MVP Helper)
 */
export async function ensureDefaultBrand(): Promise<string | null> {
    const client = getSupabaseClient();
    if (!client) return null;

    const { data: brands } = await client.from('brands').select('id').limit(1);

    if (brands && brands.length > 0) {
        return brands[0].id;
    }

    const { data, error } = await client.from('brands').insert({
        name: 'My AIBC Brand',
        industry: 'Tech',
        tone_profile: {},
        positioning: {}
    }).select('id').single();

    if (error || !data) {
        console.error('Failed to create default brand:', error);
        return null;
    }

    return data.id;
}

/**
 * Update Agent Personality
 */
export async function updateAgentPersonality(agentType: AgentId, personality: PersonalityProfile) {
    const client = getSupabaseClient();
    if (!client) return;

    // In a real app, we update the DB row
    const { error } = await client
        .from('agents')
        .update({ personality_profile: personality })
        .eq('type', agentType);

    if (error) {
        console.error('Error updating personality:', error);
    }
}
