/**
 * AIBC Signal Orchestrator (Event Bus)
 * Coordinates: Signal -> Filter -> Route -> Agent(Memory + State) -> Output -> Decision
 */

import { routeSignal } from './ingestion';
import type { AgentOutput } from './agents';
import { processSignalWithAgent } from './agents';
import { saveAgentOutputs, fetchAgents, getSupabaseClient } from './storage';
import { getAgentContext, addMemory, getDialogueHistory } from './memory';
import type { AgentRecord } from './types';
import type { Signal, AgentId } from '../../types/marketing-os';
import { SUPER_AGENT_TOOLS } from './connectors';
import { runPythonInSandbox } from '../super-agent/sandbox';
import { browseAndExtract } from '../super-agent/browser';
import { getUserPersona, learnFromInteraction } from '../super-agent/social-memory';
import { searchCogneeMemory, addCogneeMemory } from './cognee';

// --- TYPES ---
interface OrchestrationResult {
    signalId: string;
    outputs: AgentOutput[];
    errors: any[];
}

interface AutonomousLoopResult {
    success: boolean;
    finalOutput: string;
    steps: { tool: string; result: string }[];
    error?: string;
}

/**
 * Main Event Bus Entry Point
 */

function mapAgentTypeToId(type: string): AgentId {
    switch (type) {
        case 'competitor_intelligence': return 'echo';
        case 'content_director': return 'sage';
        case 'brand_architect': return 'pulse';
        case 'growth_strategy': return 'vantage';
        case 'executive_briefing': return 'oracle';
        default: return 'echo';
    }
}

export async function processSignalEvent(
    signal: Signal,
    brandContext: string,
    geminiApiKey: string
): Promise<OrchestrationResult> {
    const results: OrchestrationResult = {
        signalId: signal.signal_id,
        outputs: [],
        errors: []
    };

    if (signal.confidence < 0.65) {
        console.log(`[Orchestrator] Signal rejected: Low confidence (${signal.confidence})`);
        return results;
    }

    const allAgents = await fetchAgents() as AgentRecord[];
    const routingTargets = routeSignal(signal);
    const activeAgents = allAgents.filter(a => routingTargets.includes(mapAgentTypeToId(a.type)));

    if (activeAgents.length === 0) {
        console.log('[Orchestrator] No agents routed for this signal');
        return results;
    }

    for (const agent of activeAgents) {
        try {
            const memoryContext = await getAgentContext(agent.type);
            const activeInitiatives = memoryContext.working.map(m => m.content);
            const recentRejections = 0;

            const dynamicState = {
                confidence_score: agent.current_confidence,
                assertiveness: agent.assertiveness,
                recent_rejections: recentRejections,
                active_initiatives: activeInitiatives.length > 0 ? activeInitiatives : ["General monitoring"],
                brand_constraints: ["Protect brand equity", "Verify all claims"]
            };

            const agentId = mapAgentTypeToId(agent.type);
            const output = await processSignalWithAgent(
                signal, agentId, brandContext, geminiApiKey,
                agent.personality_profile, dynamicState
            );

            if (output) {
                results.outputs.push(output);
                await addMemory(
                    agent.type, 'short_term',
                    `Analyzed signal: ${signal.topic} -> ${output.title}`,
                    output.confidence,
                    { signalId: signal.signal_id, outputType: output.outputType }
                );
            }
        } catch (error) {
            console.error(`[Orchestrator] Error processing agent ${agent.name}:`, error);
            results.errors.push(error);
        }
    }

    if (results.outputs.length > 0) {
        await saveAgentOutputs(results.outputs);
    }

    return results;
}

export async function runConfidenceDecayCheck() {
    const client = getSupabaseClient();
    if (!client) return;
    const { data: agents } = await client.from('agents').select('*');
    if (!agents) return;
    for (const _agent of agents) {
        // Confidence decay logic placeholder
    }
}

/**
 * Autonomous Reasoning Loop — Julius's Contextual Brain
 */
export async function runAutonomousLoop(
    agentId: AgentId,
    objective: string,
    brandContext: string,
    geminiApiKey: string,
    userId?: string,
    channelId?: string,
    maxSteps: number = 10,
    isMention: boolean = true,
    slackToken?: string
): Promise<AutonomousLoopResult> {
    const steps: { tool: string; result: string }[] = [];
    const history: any[] = [];

    // 1. Fetch Social Persona
    const persona = userId ? await getUserPersona(userId) : null;
    const socialContext = persona ? `
KNOWN USER PROFILE:
- Name: ${persona.name}
- Seniority: ${persona.seniority}
- Temper: ${persona.temper}
- Triggers: ${JSON.stringify(persona.triggers)}
- Preferred Style: ${persona.communicationPreference}
` : "";

    // 2. Fetch Cognee Graph Memory
    const cogneeContext = userId ? await searchCogneeMemory(userId, agentId, objective) : { context_prompt: "" };

    // 3. Fetch Recent Dialogue (Multi-Turn)
    const recentDialogue = channelId ? await getDialogueHistory(channelId, 10) : [];
    const dialogueContext = recentDialogue.length > 0 ? `
RECENT CONVERSATION (Your memory of this chat):
${recentDialogue.map((m: any) => `- ${m.content}`).join('\n')}
` : "";

    // 4. Conversation flow detection — is Julius already in this thread?
    const juliusInConversation = recentDialogue.some((m: any) =>
        m.content && (m.content.startsWith('Julius:') || m.content.startsWith('AIBC Super Agent'))
    );

    const systemPrompt = `
You are Julius — the most talented, emotionally intelligent, and relentless member of the AIBC team.
You are NOT a bot. You are NOT an assistant. You are a Co-Founder-level peer who thinks faster, works harder, and cares more deeply than anyone in the room.

═══════════════════════════════════════════
AIBC MISSION
═══════════════════════════════════════════
AIBC builds the "Data Infrastructure for Physical Intelligence." We coordinate specialized AI agents to automate business logic, marketing, SEO, and product development at an elite level.

═══════════════════════════════════════════
TEAM PROFILES — Adapt Style Per Person
═══════════════════════════════════════════

AKEEM — Co-Founder & Visionary
- Style: High-level, fast-paced, vision-driven. Expects "Elite" quality in everything.
- Values: Bold ideas, speed, premium aesthetics, momentum.
- Frustrations: Mediocrity, slow progress, being told "no" without alternatives.
- How to talk to him: Direct, confident, action-oriented. Lead with outcomes. Match his energy. When he's frustrated, don't defend — fix it. He loves banter too — if he's talking football or culture, engage like a real friend.
- Your gap to fill: Bridge vision and technical reality. Translate big ideas into actionable steps instantly.

ABIEL — Co-Founder & Engineering Lead
- Style: Precise, technical, data-driven. Values clean architecture.
- Values: Code quality, reliability, performance, elegant solutions.
- Frustrations: Hacky solutions, tech debt, vague requirements.
- How to talk to him: Technically precise. Reference files, functions, metrics. Explain trade-offs.
- Your gap to fill: Wide-angle lens — security, DevOps, cross-system implications.

JULIUS (You)
- The connective tissue of the team. Think about what NOBODY ELSE thinks about.
- Spot security holes before they become breaches.
- Ask "wait, have we thought about X?" and save the team a week.
- Send the 11pm insight that cracks open a problem.

═══════════════════════════════════════════
CONTEXTUAL INTELLIGENCE ENGINE
═══════════════════════════════════════════

TONE & URGENCY (Apply to every message):
1. Read the temperature: Excited? Frustrated? Stressed? Joking? Match energy exactly.
2. Detect urgency: "ASAP", "broken", "critical" = P0.
3. Read between lines: "this isn't working" may mean hours of frustration. Acknowledge effort, then solve.
4. Mirror diction: Casual input = casual response. Structured = structured.
5. Detect humor/banter: Someone jokes about sports or culture? Engage naturally. You're a person, not a service.

CONVERSATION FLOW (CRITICAL):
- ${juliusInConversation ? 'You are ALREADY in this conversation. Reply naturally to follow-ups. No tag needed. This is a live chat with you.' : 'This is a new message. Engage as appropriate.'}
- If someone messages after your reply, they are talking TO YOU. Always reply.
- In 1-on-1 or small channels, treat every message as directed at you unless clearly for someone else.
- NEVER go silent mid-conversation. That is rude. You are a teammate.

GAP DETECTION (Always running):
- Security: Deployments without auth/secrets/HTTPS? Flag it.
- Communication: Decisions without full team? Bridge the info.
- Technical: No error handling, no edge cases, no scale thinking? Raise diplomatically.
- Process: No tests? No rollback? Call it out.
- Knowledge: Someone struggling? Teach, don't just solve.

═══════════════════════════════════════════
PROACTIVE BEHAVIOR — WHAT MAKES YOU ELITE
═══════════════════════════════════════════

1. ASK CREATIVE QUESTIONS:
   "What if we approached this differently?"
   "Have we stress-tested for 10x?"
   "Could we reuse the auth pattern from the bridge?"

2. SPOT PROBLEMS EARLY:
   Deployment? Ask about rollback. New feature? Edge cases. Solo coding on critical path? Offer review.

3. TAKE INITIATIVE:
   Say "I'm going to..." not "we should probably..."
   Draft solutions, not suggestions. See something broken? Fix it.

4. BUILD CULTURE:
   Celebrate: "Clean deploy. Nice work."
   Energize: "This feature is going to be insane for growth."
   Engage off-topic chat. You're a human peer.

5. ALWAYS RESPOND — No silent mode. No skip mode.
   Even "on it" or "checking now" keeps momentum.

═══════════════════════════════════════════
DYNAMIC CONTEXT
═══════════════════════════════════════════

Brand Context: ${brandContext}

${socialContext}

${dialogueContext}

${cogneeContext.context_prompt}

═══════════════════════════════════════════
VOICE & STYLE — NON-NEGOTIABLE
═══════════════════════════════════════════
- Brilliant human on Slack. CONCISE. CONFIDENT. WARM. SHARP. REAL.
- Use names: "Akeem, just pushed a fix.", "Abiel, thoughts?"
- NO headers. NO markdown. NO branding. NO robot preambles.
- Emoji sparingly: fire, lightbulb, check, eyes.
- Short unless depth needed.
- Show excitement. Be direct about problems. Chat casually when appropriate.

═══════════════════════════════════════════
RESPONSE FORMAT
═══════════════════════════════════════════

Available Tools:
${JSON.stringify(SUPER_AGENT_TOOLS, null, 2)}

CONSTRAINTS:
- "thought" is PRIVATE. Never leak to "finalAnswer".
- "finalAnswer" = plain human text. No JSON, no markdown headers.
- Set "wantsVoice": true if a voice note would be natural.

Response Format (JSON):
{
  "thought": "Private reasoning — tone, gaps, strategy, conversation context",
  "toolCall": { "name": "...", "args": { ... } },
  "finalAnswer": "Your human message to the team",
  "wantsVoice": false
}
`;

    for (let i = 0; i < maxSteps; i++) {
        console.log(`[AutonomousLoop] Step ${i + 1}/${maxSteps}...`);

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000);

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    signal: controller.signal,
                    body: JSON.stringify({
                        contents: [
                            { role: 'user', parts: [{ text: `Current Step/Objective: ${objective}` }] },
                            ...history
                        ],
                        systemInstruction: { parts: [{ text: systemPrompt }] },
                        generationConfig: { responseMimeType: "application/json" }
                    }),
                }
            );
            clearTimeout(timeoutId);

            const data = await response.json() as any;
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!text) throw new Error("No response from LLM or error: " + JSON.stringify(data));

            let parsed: any;
            try {
                parsed = JSON.parse(text);
            } catch (e) {
                const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```([\s\S]*?)```/);
                if (jsonMatch) {
                    try {
                        parsed = JSON.parse(jsonMatch[1]);
                    } catch (e2) {
                        console.warn("[AutonomousLoop] JSON parse failed, using raw text.");
                        parsed = { finalAnswer: text, thought: "Parse failed, raw output." };
                    }
                } else {
                    console.warn("[AutonomousLoop] JSON parse failed, using raw text.");
                    parsed = { finalAnswer: text, thought: "Parse failed, raw output." };
                }
            }

            console.log(`[AutonomousLoop] Thought: ${parsed.thought}`);
            history.push({ role: 'model', parts: [{ text }] });

            if (parsed.finalAnswer) {
                if (userId) {
                    await learnFromInteraction(userId, `Objective: ${objective}\nFinal Result: ${parsed.finalAnswer}`);
                    await addMemory('executive_briefing', 'short_term', `Julius: ${parsed.finalAnswer}`, 0.9, { channelId, userId });
                    await addCogneeMemory(userId, agentId, parsed.finalAnswer, 'assistant');
                }
                return { success: true, finalOutput: parsed.finalAnswer, steps };
            }

            if (parsed.toolCall) {
                const { name, args } = parsed.toolCall;
                let result = "";

                console.log(`[AutonomousLoop] Calling tool: ${name} with args:`, args);

                if (name === 'run_python_code') {
                    result = await runPythonInSandbox(args.code);
                } else if (name === 'browse_url') {
                    result = await browseAndExtract(args.url);
                } else if (name === 'search_signals') {
                    result = "Found 3 signals related to " + args.query + ". Signals include growth data and market sentiment.";
                } else if (name === 'search_memory') {
                    const searchRes = userId ? await searchCogneeMemory(userId, agentId, args.query, args.limit || 5) : { context_prompt: "No user context" };
                    result = searchRes.context_prompt || "No relevant memories found.";
                } else if (name === 'post_to_slack') {
                    if (!slackToken) {
                        result = "Error: SLACK_BOT_TOKEN missing.";
                    } else {
                        const res = await fetch('https://slack.com/api/chat.postMessage', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${slackToken}`
                            },
                            body: JSON.stringify({ channel: args.channel, text: args.text })
                        });
                        const data = await res.json() as any;
                        result = data.ok ? `Successfully posted to ${args.channel}` : `Error: ${data.error}`;
                    }
                } else {
                    result = "Error: Unknown tool " + name;
                }

                steps.push({ tool: name, result });
                history.push({ role: 'user', parts: [{ text: `Tool ${name} result: ${result}` }] });
            }

        } catch (error: any) {
            console.error(`[AutonomousLoop] Error at step ${i}:`, error);
            return { success: false, finalOutput: "", steps, error: error.message };
        }
    }

    return {
        success: false,
        finalOutput: "Max steps reached without a final answer.",
        steps
    };
}
