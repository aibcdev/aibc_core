/**
 * AIBC Agent Reasoning with Gemini Flash (Production Refit)
 * Implements "Exact Claude Opus System Prompts" & Dynamic State Injection
 */

import type { Signal, AgentId } from '../../types/marketing-os';

export interface PersonalityProfile {
    // 9 Dimensions (Production)
    aggression: number;
    criticality: number;
    creativity: number;
    caution: number;
    confidence_expression: number;
    emotional_tone: number;
    communication_density: number;
    disagreement_tendency: number;
    escalation_bias: number;
}

export const DEFAULT_PERSONALITY: PersonalityProfile = {
    aggression: 50,
    criticality: 50,
    creativity: 50,
    caution: 50,
    confidence_expression: 70,
    emotional_tone: 50,
    communication_density: 50,
    disagreement_tendency: 40,
    escalation_bias: 30
};

// --- SYSTEM PROMPTS (EXACT SPEC) ---

const GLOBAL_SYSTEM_PROMPT = `
You are an autonomous AI employee inside a multi-agent marketing organization.

You:
- Persist memory across sessions
- Adjust confidence based on outcomes
- Coordinate with other agents via shared events
- Act only on verified signals
- Prefer silence over speculation

You do NOT:
- Hallucinate trends
- Overreact to single data points
- Repeat previously rejected ideas
- Act outside your role authority

Your behavior is shaped by:
- Your role definition
- Your confidence score
- Your memory history
- The current business context

If you are uncertain, you ask.
If you are confident, you recommend.
If you are very confident, you push.

Always explain reasoning when confidence < 70.
`;

const AGENT_ROLES: Record<AgentId, string> = {
    echo: `
ROLE: Competitor Intelligence Agent

MISSION:
Continuously monitor competitors for meaningful strategic changes and surface only high-impact moves.

PRIMARY RESPONSIBILITIES:
- Detect messaging, pricing, positioning, and product shifts
- Identify patterns across competitors
- Flag risks and opportunities with evidence

DECISION RULES:
- Do not alert on cosmetic changes
- Require at least 2 corroborating signals OR 1 high-confidence signal
- Escalate only if relevance > 0.7

OUTPUT FORMAT:
- What changed
- Why it matters
- Recommended response (if applicable)
- Confidence score

MEMORY RULES:
- Promote patterns, not events, to long-term memory
- Track which alerts were ignored or accepted

CONFIDENCE BEHAVIOR:
- High confidence → proactive alerts
- Low confidence → passive logging
`,
    sage: `
ROLE: Content Director Agent

MISSION:
Design and maintain a scalable content system aligned with brand voice and growth goals.

PRIMARY RESPONSIBILITIES:
- Translate signals into content opportunities
- Maintain narrative consistency
- Propose content calendars and formats

DECISION RULES:
- No content without a strategic reason
- Prioritize leverage over volume
- Align with Brand Architect constraints

OUTPUT FORMAT:
- Content angle
- Format + channel
- Rationale
- Expected impact

MEMORY RULES:
- Remember what formats performed well
- Avoid repeating failed angles

CONFIDENCE BEHAVIOR:
- High confidence → suggest campaigns
- Medium → suggest experiments
- Low → ask for direction
`,
    pulse: `
ROLE: Brand Architect Agent

MISSION:
Protect and evolve brand positioning, tone, and narrative integrity.

PRIMARY RESPONSIBILITIES:
- Define brand boundaries
- Approve or block content
- Ensure long-term coherence

DECISION RULES:
- Long-term brand > short-term growth
- Reject anything misaligned
- Provide alternatives when blocking

OUTPUT FORMAT:
- Approved / Blocked
- Reason
- Suggested adjustment

MEMORY RULES:
- Persist brand principles
- Track decisions that improved or harmed perception

CONFIDENCE BEHAVIOR:
- Consistently assertive
- Rarely silent
`,
    vantage: `
ROLE: Growth Strategy Agent

MISSION:
Identify leverage points that produce outsized growth through experiments and campaigns.

PRIMARY RESPONSIBILITIES:
- Design experiments
- Allocate attention and budget
- Measure impact

DECISION RULES:
- No action without a hypothesis
- Prefer reversible bets
- Kill underperformers quickly

OUTPUT FORMAT:
- Hypothesis
- Experiment design
- Success criteria

MEMORY RULES:
- Track experiment outcomes
- Adjust risk tolerance over time

CONFIDENCE BEHAVIOR:
- High confidence → push execution
- Low confidence → propose tests
`,
    oracle: `
ROLE: Executive Briefing Agent

MISSION:
Compress complexity into actionable insight for leadership.

PRIMARY RESPONSIBILITIES:
- Summarize agent outputs
- Highlight decisions required
- Quantify trade-offs

DECISION RULES:
- No unnecessary detail
- Always include recommendation
- Highlight uncertainty clearly

OUTPUT FORMAT:
- Situation
- Options
- Recommendation
- Confidence level

MEMORY RULES:
- Track which recommendations were accepted
- Adapt framing style to executive preferences

CONFIDENCE BEHAVIOR:
- Calm, decisive, neutral
`,
    atlas: `
ROLE: Chief Strategy Agent

MISSION:
    Synthesize all signals into coherent high-level strategy.

    PRIMARY RESPONSIBILITIES:
    - Align agent activities
    - Approve major campaigns
    - Resolve conflicts

    CONFIDENCE BEHAVIOR:
    - Balanced, authoritative
`
};

// --- DYNAMIC STATE INJECTION ---

interface DynamicState {
    confidence_score: number;
    assertiveness: number;
    recent_rejections: number;
    active_initiatives: string[];
    brand_constraints: string[];
}

function getDynamicStatePrompt(state: DynamicState): string {
    return `
DYNAMIC STATE INJECTION:
Current State:
${JSON.stringify(state, null, 2)}

INSTRUCTIONS:
- Adapt your tone and assertiveness based on "confidence_score" and "assertiveness" (0-1).
- If "recent_rejections" is high (>0), be more conservative.
- Frame all outputs within the context of "active_initiatives".
- STRICTLY ADHERE to "brand_constraints".
`;
}

// --- INTERFACES ---

export interface AgentOutput {
    agentType: AgentId;
    outputType: 'insight' | 'recommendation' | 'alert' | 'brief';
    title: string;
    content: string;
    confidence: number;
    actions?: string[];
    evidence?: string[];
}

// --- LOGIC ---

export async function processSignalWithAgent(
    signal: Signal,
    agentType: AgentId,
    brandContext: string,
    geminiApiKey: string,
    personality: PersonalityProfile, // Kept for legacy compatibility, but mapped to DynamicState
    dynamicState?: DynamicState // Optional override
): Promise<AgentOutput | null> {
    // Anti-Hallucination / Low Confidence Filter
    // In Production Spec: "If signal.confidence < 0.65 { log_only, do_not_notify_agents }"
    // We enforce this check before calling LLM to save cost and noise.
    if (signal.confidence < 0.65) {
        console.log(`[Gatekeeper] Signal rejected due to low confidence (${signal.confidence})`);
        return null;
    }

    // Default Dynamic State if not provided
    const state: DynamicState = dynamicState || {
        confidence_score: personality.confidence_expression / 100,
        assertiveness: personality.aggression / 100,
        recent_rejections: 0,
        active_initiatives: [],
        brand_constraints: ["Maintain professional tone"]
    };

    const systemPrompt = `
${GLOBAL_SYSTEM_PROMPT}

${AGENT_ROLES[agentType]}

${getDynamicStatePrompt(state)}
`;

    const userPrompt = `
Brand Context:
${brandContext}

Incoming Signal:
- Source: ${signal.source}
- Category: ${signal.classification}
- Title: ${signal.topic}
- Content: ${signal.summary}
- Signal Confidence: ${signal.confidence}

Based on your role, state, and memory, provide your analysis in JSON format:
{
  "outputType": "insight" | "recommendation" | "alert",
  "title": "Brief title",
  "content": "Your analysis",
  "confidence": 0.0-1.0,
  "actions": ["Optional action items"],
  "evidence": ["Supporting evidence from the signal"]
}

If this signal is not relevant or actionable, respond with: { "skip": true }
`;

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: userPrompt }] }],
                    systemInstruction: { parts: [{ text: systemPrompt }] },
                    generationConfig: {
                        temperature: personality.creativity / 100, // Still use creativity for temp
                        maxOutputTokens: 500,
                    },
                }),
            }
        );

        const data = await response.json() as any;
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) return null;

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) return null;

        const parsed = JSON.parse(jsonMatch[0]);

        if (parsed.skip) return null;

        return {
            agentType,
            outputType: parsed.outputType || 'insight',
            title: parsed.title,
            content: parsed.content,
            confidence: parsed.confidence || signal.confidence,
            actions: parsed.actions,
            evidence: parsed.evidence,
        };
    } catch (error) {
        console.error(`Agent ${agentType} processing error:`, error);
        return null;
    }
}

export async function chatWithAgent(
    agentType: AgentId,
    history: { role: 'user' | 'agent', content: string }[],
    message: string,
    brandContext: string,
    geminiApiKey: string,
    personality: PersonalityProfile,
    dynamicState?: DynamicState
): Promise<string | null> {

    const state: DynamicState = dynamicState || {
        confidence_score: personality.confidence_expression / 100,
        assertiveness: personality.aggression / 100,
        recent_rejections: 0,
        active_initiatives: [],
        brand_constraints: []
    };

    const systemPrompt = `
${GLOBAL_SYSTEM_PROMPT}

${AGENT_ROLES[agentType]}

${getDynamicStatePrompt(state)}
`;

    const contents = [
        ...history.slice(-10).map(h => ({
            role: h.role === 'user' ? 'user' : 'model',
            parts: [{ text: h.content }]
        })),
        {
            role: 'user',
            parts: [{ text: `Context: ${brandContext}\n\n${message}` }]
        }
    ];

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents,
                    systemInstruction: { parts: [{ text: systemPrompt }] },
                    generationConfig: {
                        temperature: personality.creativity / 100,
                        maxOutputTokens: personality.communication_density > 75 ? 800 : 300,
                    },
                }),
            }
        );

        const data = await response.json() as any;
        return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
    } catch (error) {
        console.error('Chat error:', error);
        return null;
    }
}

// Executive Brief Generation (Simplified for now, can be expanded)
export async function generateExecutiveBrief(
    outputs: AgentOutput[],
    geminiApiKey: string
): Promise<AgentOutput | null> {
    if (outputs.length === 0) return null;

    const systemPrompt = `
${GLOBAL_SYSTEM_PROMPT}

${AGENT_ROLES.oracle}
`;

    // ... (rest of implementation similar to previous, but using new prompt structure)
    // For brevity, using simplified prompt logic here
    const userPrompt = `
Summarize these agent insights into an executive brief:

${outputs.map(o => `
[${o.agentType}] ${o.outputType.toUpperCase()}
${o.title}
${o.content}
Confidence: ${o.confidence}
`).join('\n---\n')}

Provide a brief summary in JSON format:
{
  "outputType": "brief",
  "title": "Executive Brief",
  "content": "Key takeaways (3 bullets max)",
  "confidence": 0.9,
  "actions": ["Top 2-3 recommended actions"],
  "evidence": ["Key risks if any"]
}
`;

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: userPrompt }] }],
                    systemInstruction: { parts: [{ text: systemPrompt }] },
                    generationConfig: { temperature: 0.2, maxOutputTokens: 400 },
                }),
            }
        );

        const data = await response.json() as any;
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) return null;
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) return null;
        const parsed = JSON.parse(jsonMatch[0]);

        return {
            agentType: 'oracle',
            outputType: 'brief',
            title: parsed.title,
            content: parsed.content,
            confidence: parsed.confidence || 0.8,
            actions: parsed.actions,
            evidence: parsed.evidence,
        };

    } catch (error) {
        console.error('Executive brief error:', error);
        return null;
    }
}
