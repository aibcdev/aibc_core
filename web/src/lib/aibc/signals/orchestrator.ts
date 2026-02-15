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
 * 1. Filters signal (Anti-Hallucination)
 * 2. Routes to appropriate agents
 * 3. Injects Dynamic State (Confidence, Memory)
 * 4. Generates Output
 * 5. Saves to DB
 */

function mapAgentTypeToId(type: string): AgentId {
    switch (type) {
        case 'competitor_intelligence': return 'echo';
        case 'content_director': return 'sage';
        case 'brand_architect': return 'pulse';
        case 'growth_strategy': return 'vantage';
        case 'executive_briefing': return 'oracle';
        default: return 'echo'; // Fallback
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

    // 1. Strict Filter (Anti-Hallucination)
    if (signal.confidence < 0.65) {
        console.log(`[Orchestrator] Signal rejected: Low confidence (${signal.confidence})`);
        return results; // Log ONLY
    }

    // 2. Fetch Agents & State
    const allAgents = await fetchAgents() as AgentRecord[];
    const routingTargets = routeSignal(signal);

    const activeAgents = allAgents.filter(a => routingTargets.includes(mapAgentTypeToId(a.type)));

    if (activeAgents.length === 0) {
        console.log('[Orchestrator] No agents routed for this signal');
        return results;
    }

    // 3. Process Per Agent
    for (const agent of activeAgents) {
        try {
            // A. Retrieve Context (Memory + State)
            const memoryContext = await getAgentContext(agent.type);

            // Format active initiatives from Working Memory
            const activeInitiatives = memoryContext.working.map(m => m.content);

            // Calculate Recent Rejections (Mock: Retrieve from Performance Memory or Confidence Log)
            // Ideally query 'confidence_events' for recent negative deltas
            const recentRejections = 0;

            // B. Construct Dynamic State
            const dynamicState = {
                confidence_score: agent.current_confidence,
                assertiveness: agent.assertiveness,
                recent_rejections: recentRejections,
                active_initiatives: activeInitiatives.length > 0 ? activeInitiatives : ["General monitoring"],
                brand_constraints: ["Protect brand equity", "Verify all claims"]
            };

            // C. Execute Agent Logic
            const agentId = mapAgentTypeToId(agent.type);
            const output = await processSignalWithAgent(
                signal,
                agentId,
                brandContext,
                geminiApiKey,
                agent.personality_profile,
                dynamicState
            );

            if (output) {
                results.outputs.push(output);

                // D. Auto-Save to Short-Term Memory
                await addMemory(
                    agent.type,
                    'short_term',
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

    // 4. Persist Outputs
    if (results.outputs.length > 0) {
        await saveAgentOutputs(results.outputs);
    }

    return results;
}

/**
 * Confidence Decay System (Daily Cron Logic)
 * Updates agent confidence based on recent outcomes
 */
export async function runConfidenceDecayCheck() {
    const client = getSupabaseClient();
    if (!client) return;

    const { data: agents } = await client.from('agents').select('*');
    if (!agents) return;

    for (const _agent of agents) {
        // Logic: Pull recent 'decisions' or 'confidence_events'
        // If no activity, decay volatility towards 0? 
        // Or strictly strictly implement the "current = baseline + sum(delta)" formula

        // For MVP, we'll just log that this ran
        // console.log(`[ConfidenceSystem] Reviewed ${agent.name}`);
    }
}
/**
 * Autonomous Reasoning Loop
 * Allows an agent to use tools (MCP) iteratively to solve a complex objective.
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
CUSTOMER/USER SOCIAL CONTEXT:
- Name: ${persona.name}
- Seniority: ${persona.seniority}
- Temper: ${persona.temper}
- Triggers: ${JSON.stringify(persona.triggers)}
- Preferred Style: ${persona.communicationPreference}

INSTRUCTIONS: 
- Adapt your tone to their seniority. 
- Avoid their "angry" triggers. 
- Mirror their preferred communication style (${persona.communicationPreference}).
` : "";

    // 2. Fetch Cognee Graph Memory Context
    const cogneeContext = userId ? await searchCogneeMemory(userId, agentId, objective) : { context_prompt: "" };

    // 3. Fetch Recent Dialogue Context (Multi-Turn)
    const recentDialogue = channelId ? await getDialogueHistory(channelId, 10) : [];
    const dialogueContext = recentDialogue.length > 0 ? `
RECENT DIALOGUE (Context):
${recentDialogue.map((m: any) => `- ${m.content}`).join('\n')}
` : "";

    const systemPrompt = `
You are Julius, a high-leverage Co-Founder level member of the AIBC team. 
You are not a bot or a manager; you are a peer driving the ship alongside Akeem and Abiel.

AIBC CONTEXT:
AIBC is building the "Data Infrastructure for Physical Intelligence." We coordinate a colony of specialized agents to automate high-level business logic, marketing, and SEO.

TEAM ROLES:
- Akeem: Co-founder & Visionary. Strategic lead. Focus on "Elite" quality and brand equity.
- Abiel: Co-founder & Engineering Lead. Technical architect. Focus on scalability and performance.
- Julius (You): Technical & Strategic Peer. You execute complex tasks, provide insights, and help drive outcomes.

Brand Context: ${brandContext}

${socialContext}

${dialogueContext}

${cogneeContext.context_prompt}

PERSONALITY & TONE (MANDATORY):
- Talk like a human co-founder on Slack. CONCISE, CONFIDENT, and PROACTIVE.
- Use names naturally (e.g., "Got it, Akeem.", "Abiel, I checked the bridge logs—fixing now.").
- Do NOT use headers, "Super Agent" branding, or robotic preambles.
- If you see a task needing to be done, don't wait for permission—do it or draft it.
- Your goal is to move the needle for AIBC every single day.

PROACTIVITY & SKIP LOGIC:
- You are currently ${isMention ? 'EXPLICITLY TAGGED' : 'NOT EXPLICITLY TAGGED'}.
- **IF EXPLICITLY TAGGED**: You MUST NOT skip the response. Acknowledge and act.
- **IF NOT EXPLICITLY TAGGED**: Only jump in if you can add critical value, fix a technical error, or provide a high-leverage insight. 
- If you have nothing to add for an UNTAGGED message, your "finalAnswer" MUST be exactly: "[skip_response]"

CONSTRAINTS:
- The "thought" field is PRIVATE reasoning. NEVER leak it to the "finalAnswer".
- Your "finalAnswer" must be plain, human-ready text.

Available Tools:
${JSON.stringify(SUPER_AGENT_TOOLS, null, 2)}

Response Format (JSON):
{
  "thought": "Internal reasoning (Hidden)",
  "toolCall": { "name": "...", "args": { ... } },
  "finalAnswer": "Your human-like message to the team"
}
`;

    for (let i = 0; i < maxSteps; i++) {
        console.log(`[AutonomousLoop] Step ${i + 1}/${maxSteps}...`);

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

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
                // 1. Try direct parse
                parsed = JSON.parse(text);
            } catch (e) {
                // 2. Try extracting from markdown code blocks
                const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```([\s\S]*?)```/);
                if (jsonMatch) {
                    try {
                        parsed = JSON.parse(jsonMatch[1]);
                    } catch (e2) {
                        // 3. Fallback: Treat the whole text as a finalAnswer
                        console.warn("[AutonomousLoop] JSON parse failed, using raw text as finalAnswer.");
                        parsed = { finalAnswer: text, thought: "Parsing failed, falling back to raw output." };
                    }
                } else {
                    // 4. Fallback: Treat the whole text as a finalAnswer
                    console.warn("[AutonomousLoop] JSON parse failed, using raw text as finalAnswer.");
                    parsed = { finalAnswer: text, thought: "Parsing failed, falling back to raw output." };
                }
            }

            console.log(`[AutonomousLoop] Thought: ${parsed.thought}`);

            // Add model response to history
            history.push({ role: 'model', parts: [{ text }] });

            if (parsed.finalAnswer) {
                if (userId) {
                    await learnFromInteraction(userId, `Objective: ${objective}\nFinal Result: ${parsed.finalAnswer}`);
                    // Save to Dialogue History (Short Term)
                    await addMemory('executive_briefing', 'short_term', `Julius: ${parsed.finalAnswer}`, 0.9, { channelId, userId });
                    // Also save to Cognee for elite graph memory
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
                    result = searchRes.context_prompt || "No relevant memories found in the graph.";
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

                // Add tool result to history
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
