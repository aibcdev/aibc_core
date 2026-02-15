/**
 * AIBC Signal Storage Service (Supabase)
 */
import { createClient } from '@supabase/supabase-js';
// Environment variables should be loaded by dotenv
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
let supabase = null;
export function getSupabaseClient() {
    if (supabase)
        return supabase;
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
export async function saveSignals(signals) {
    const client = getSupabaseClient();
    if (!client || signals.length === 0)
        return;
    const records = signals.map(s => ({
        source: s.source,
        category: s.category,
        title: s.title,
        content: s.content,
        url: s.url,
        confidence: s.confidence,
        metadata: s.metadata,
        created_at: s.createdAt,
    }));
    const { error } = await client.from('signals').insert(records);
    if (error)
        console.error('Error saving signals:', error);
}
/**
 * Fetch recent signals for dashboard
 */
export async function fetchRecentSignals(limit = 20) {
    const client = getSupabaseClient();
    if (!client)
        return [];
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
export async function saveAgentOutputs(outputs) {
    const client = getSupabaseClient();
    if (!client || outputs.length === 0)
        return;
    // Look up agent IDs by type
    const { data: agents } = await client.from('agents').select('id, type');
    const agentMap = new Map(agents?.map(a => [a.type, a.id]) || []);
    const records = [];
    for (const o of outputs) {
        const agentId = agentMap.get(o.agentType);
        if (!agentId) {
            // If agent doesn't exist, we might want to create it or skip
            // For this demo, let's assume they exist or we skip
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
        if (error)
            console.error('Error saving agent outputs:', error);
    }
}
/**
 * Fetch recent structured outputs for dashboard
 */
export async function fetchStructuredOutputs(limit = 10) {
    const client = getSupabaseClient();
    if (!client)
        return [];
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
    return data;
}
/**
 * Save executive brief
 */
export async function saveExecutiveBrief(brandId, brief) {
    const client = getSupabaseClient();
    if (!client)
        return;
    const { error } = await client.from('executive_briefs').insert({
        brand_id: brandId,
        timeframe: 'daily',
        title: brief.title,
        content: brief.content,
        summary: { actions: brief.actions, risks: brief.evidence },
    });
    if (error)
        console.error('Error saving executive brief:', error);
}
/**
 * Fetch chat history for an agent
 */
export async function fetchChatHistory(agentType) {
    const client = getSupabaseClient();
    if (!client)
        return [];
    // Get agent ID
    const { data: agents } = await client.from('agents').select('id').eq('type', agentType).single();
    if (!agents)
        return [];
    const { data, error } = await client
        .from('chat_messages')
        .select('*')
        .eq('agent_id', agents.id)
        .order('created_at', { ascending: true }); // Oldest first for chat log
    if (error) {
        console.error('Error fetching chat:', error);
        return [];
    }
    return data;
}
/**
 * Save a chat message
 */
export async function saveChatMessage(agentType, role, content) {
    const client = getSupabaseClient();
    if (!client)
        return;
    // Get agent ID
    const { data: agents } = await client.from('agents').select('id').eq('type', agentType).single();
    if (!agents)
        return;
    const { error } = await client.from('chat_messages').insert({
        agent_id: agents.id,
        role,
        content
    });
    if (error)
        console.error('Error saving chat message:', error);
}
/**
 * Initialize Default Agents (Helper to ensure agents table is populated)
 */
export async function ensureAgentsExist(brandId) {
    const client = getSupabaseClient();
    if (!client)
        return;
    const agentTypes = [
        'competitor_intelligence',
        'content_director',
        'brand_architect',
        'growth_strategy',
        'executive_briefing'
    ];
    const { data: existing } = await client.from('agents').select('type').eq('brand_id', brandId);
    const existingTypes = new Set(existing?.map(e => e.type));
    const toInsert = agentTypes
        .filter(t => !existingTypes.has(t))
        .map(t => ({
        brand_id: brandId,
        type: t,
        personality_profile: {}, // Fill with defaults if needed
        thresholds: {}
    }));
    if (toInsert.length > 0) {
        await client.from('agents').insert(toInsert);
    }
}
/**
 * Create a default brand if none exists (For MVP)
 */
export async function ensureDefaultBrand() {
    const client = getSupabaseClient();
    if (!client)
        return null;
    // Check for any brand
    const { data: brands } = await client.from('brands').select('id').limit(1);
    if (brands && brands.length > 0) {
        return brands[0].id;
    }
    // Create default
    const { data, error } = await client.from('brands').insert({
        name: 'My AIBC Brand',
        industry: 'Tech',
    }).select('id').single();
    if (error || !data) {
        console.error('Failed to create default brand:', error);
        return null;
    }
    return data.id;
}
//# sourceMappingURL=storage.js.map