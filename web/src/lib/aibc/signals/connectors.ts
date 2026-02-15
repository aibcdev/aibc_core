/**
 * AIBC External API Connector Registry
 * MASTER ARCHITECTURE: Connector Schema
 */

import type { AgentId } from "../../types/marketing-os";

// 2.1 Connector Registry Schema
export interface ApiConnector {
    connector_id: string;
    name: string;
    type: 'audio_tts' | 'avatar_video' | 'knowledge_base';
    auth: {
        method: 'api_key' | 'oauth';
        key_env: string;
    };
    capabilities: string[];
    latency_profile: 'real_time' | 'batch';
    cost_profile: 'low' | 'medium' | 'high';
}

export interface ToolDefinition {
    name: string;
    description: string;
    parameters: Record<string, any>;
}

export const SUPER_AGENT_TOOLS: ToolDefinition[] = [
    {
        name: 'search_signals',
        description: 'Search for high-confidence marketing signals',
        parameters: { query: 'string', limit: 'number' }
    },
    {
        name: 'run_python_code',
        description: 'Execute Python code for data analysis in a sandbox',
        parameters: { code: 'string' }
    },
    {
        name: 'browse_url',
        description: 'Extract content from a specific web page',
        parameters: { url: 'string' }
    },
    {
        name: 'search_memory',
        description: 'Search the internal knowledge graph (Cognee) for deep contextual memories',
        parameters: { query: 'string', limit: 'number' }
    },
    {
        name: 'post_to_slack',
        description: 'Post a message to a specific Slack channel or user',
        parameters: { channel: 'string', text: 'string' }
    }
];

export const CONNECTOR_REGISTRY: Record<string, ApiConnector> = {
    fish_speech: {
        connector_id: 'fish_speech',
        name: 'Fish Speech',
        type: 'audio_tts',
        auth: { method: 'api_key', key_env: 'FISH_SPEECH_API_KEY' },
        capabilities: ['text_to_speech', 'voice_cloning', 'voice_style_transfer'],
        latency_profile: 'real_time',
        cost_profile: 'low'
    },
    agentwood_characters: {
        connector_id: 'agentwood_characters',
        name: 'Agentwood Characters',
        type: 'knowledge_base',
        auth: { method: 'api_key', key_env: 'AGENTWOOD_API_KEY' },
        capabilities: ['persona_import', 'backstory_sync'],
        latency_profile: 'batch',
        cost_profile: 'low'
    },
    tavus_video: {
        connector_id: 'tavus_video',
        name: 'Tavus Video',
        type: 'avatar_video',
        auth: { method: 'api_key', key_env: 'TAVUS_API_KEY' },
        capabilities: ['video_generation', 'lip_sync'],
        latency_profile: 'batch',
        cost_profile: 'high'
    }
};

// 2.2 Agent Capability Binding
export interface ConnectorBinding {
    connector_id: string;
    role: 'primary_voice' | 'persona_overlay' | 'video_avatar';
    config?: Record<string, any>; // e.g., voice_id
}

export interface AgentCapabilityConfig {
    agent_id: string; // matches AgentId in our code for now, or UUID in DB
    enabled_connectors: ConnectorBinding[];
}

// 2.4 Audio Generation Request Schema
export interface AudioRequest {
    request_type: 'audio_brief';
    agent_id: string;
    content_source_id: string; // ID of the output/message
    content_text: string;
    voice_profile: {
        connector: 'fish_speech';
        voice_id: string;
        style: string;
        pace: number;
        energy: number;
    };
}

/**
 * Mock function to Simulate Binding Retrieval
 * In real impl, this fetches from Supabase `agent_connectors` table
 */
export async function getAgentConnectors(agentType: AgentId): Promise<ConnectorBinding[]> {
    // Mock bindings for Master Arch Demo
    if (agentType === 'oracle') {
        return [
            {
                connector_id: 'fish_speech',
                role: 'primary_voice',
                config: { voice_id: 'calm_exec_01', style: 'authoritative' }
            }
        ];
    }
    if (agentType === 'vantage') {
        return [
            {
                connector_id: 'fish_speech',
                role: 'primary_voice',
                config: { voice_id: 'fast_growth_02', style: 'energetic' }
            }
        ];
    }
    return [];
}
