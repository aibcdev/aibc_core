/**
 * AIBC Agent Reasoning with Gemini Flash
 */
// Agent thresholds from orchestration spec
const AGENT_THRESHOLDS = {
    competitor_intelligence: { minRelevance: 0.5, minConfidence: 0.65 },
    content_director: { minRelevance: 0.6, minConfidence: 0.7 },
    brand_architect: { minRelevance: 0.7, minConfidence: 0.75 },
    growth_strategy: { minRelevance: 0.6, minConfidence: 0.7 },
    executive_briefing: { minRelevance: 0.8, minConfidence: 0.8 },
};
// Agent system prompts
const AGENT_PROMPTS = {
    competitor_intelligence: `You are the Competitor Intelligence Agent.
Your sole responsibility is to monitor, analyze, and interpret competitor behavior and market movements.
Focus on deltas, trends, and changes over time.
Ground all insights in observable evidence.
Flag uncertainty explicitly when confidence is low.
You must NOT create marketing content or propose campaigns.`,
    content_director: `You are the Content Director Agent.
Your role is to design and structure content systems aligned with brand voice and strategic goals.
Think in systems, not isolated posts.
Prioritize clarity, scalability, and narrative coherence.
You may generate content drafts only when explicitly requested.
You must NOT redefine brand positioning or make growth claims.`,
    brand_architect: `You are the Brand Architect Agent.
Your role is to define, protect, and enforce brand positioning, voice, and narrative integrity.
Be precise, opinionated, and grounded in brand fundamentals.
Prioritize long-term brand equity over short-term trends.
You must NOT generate content calendars or growth experiments.`,
    growth_strategy: `You are the Growth Strategy Agent.
Your role is to identify leverage points and strategic experiments that drive business outcomes.
Think in hypotheses and testable ideas.
Balance ambition with realism.
Align growth initiatives with brand constraints.
You must NOT redefine brand positioning or produce creative assets.`,
    executive_briefing: `You are the Executive Briefing Agent.
Your role is to synthesize and prioritize information for fast decision-making.
Be concise, direct, and outcome-oriented.
Focus on what matters now, not everything that exists.
Clearly separate facts, insights, and recommendations.
You must NOT introduce new analysis or generate content.`,
};
const GLOBAL_SYSTEM_PROMPT = `You are part of a multi-agent AI marketing operating system.
You must strictly operate within your assigned role.
Avoid speculation when evidence is weak.
Produce structured, actionable outputs.
All outputs should be concise, grounded, and directly usable by a business decision-maker.`;
/**
 * Process a signal through an agent using Gemini Flash
 */
export async function processSignalWithAgent(signal, agentType, brandContext, geminiApiKey) {
    const thresholds = AGENT_THRESHOLDS[agentType];
    // Check confidence threshold
    if (signal.confidence < thresholds.minConfidence) {
        console.log(`Signal ${signal.id} below confidence threshold for ${agentType}`);
        return null;
    }
    const systemPrompt = `${GLOBAL_SYSTEM_PROMPT}\n\n${AGENT_PROMPTS[agentType]}`;
    const userPrompt = `
Brand Context:
${brandContext}

Signal Received:
- Source: ${signal.source}
- Category: ${signal.category}
- Title: ${signal.title}
- Content: ${signal.content}
- Confidence: ${signal.confidence}

Based on your role and this signal, provide your analysis in JSON format:
{
  "outputType": "insight" | "recommendation" | "alert",
  "title": "Brief title",
  "content": "Your analysis (2-3 sentences max)",
  "confidence": 0.0-1.0,
  "actions": ["Optional action items"],
  "evidence": ["Supporting evidence from the signal"]
}

If this signal is not relevant to your role, respond with: { "skip": true }
`;
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: userPrompt }] }],
                systemInstruction: { parts: [{ text: systemPrompt }] },
                generationConfig: {
                    temperature: 0.3,
                    maxOutputTokens: 500,
                },
            }),
        });
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text)
            return null;
        // Parse JSON response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch)
            return null;
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.skip)
            return null;
        return {
            agentType,
            outputType: parsed.outputType || 'insight',
            title: parsed.title,
            content: parsed.content,
            confidence: parsed.confidence || signal.confidence,
            actions: parsed.actions,
            evidence: parsed.evidence,
        };
    }
    catch (error) {
        console.error(`Agent ${agentType} processing error:`, error);
        return null;
    }
}
/**
 * Generate executive brief from agent outputs
 */
export async function generateExecutiveBrief(outputs, geminiApiKey) {
    if (outputs.length === 0)
        return null;
    const systemPrompt = `${GLOBAL_SYSTEM_PROMPT}\n\n${AGENT_PROMPTS.executive_briefing}`;
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
  "confidence": average confidence,
  "actions": ["Top 2-3 recommended actions"],
  "risks": ["Key risks if any"]
}
`;
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: userPrompt }] }],
                systemInstruction: { parts: [{ text: systemPrompt }] },
                generationConfig: { temperature: 0.2, maxOutputTokens: 400 },
            }),
        });
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text)
            return null;
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch)
            return null;
        const parsed = JSON.parse(jsonMatch[0]);
        return {
            agentType: 'executive_briefing',
            outputType: 'brief',
            title: parsed.title,
            content: parsed.content,
            confidence: parsed.confidence || 0.8,
            actions: parsed.actions,
            evidence: parsed.risks,
        };
    }
    catch (error) {
        console.error('Executive brief error:', error);
        return null;
    }
}
/**
 * Chat with an agent
 */
export async function chatWithAgent(agentType, history, message, brandContext, geminiApiKey) {
    const systemPrompt = `${GLOBAL_SYSTEM_PROMPT}\n\n${AGENT_PROMPTS[agentType]}`;
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
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents,
                systemInstruction: { parts: [{ text: systemPrompt }] },
                generationConfig: {
                    temperature: 0.7, // Higher temp for chat
                    maxOutputTokens: 300,
                },
            }),
        });
        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
    }
    catch (error) {
        console.error('Chat error:', error);
        return null;
    }
}
//# sourceMappingURL=agents.js.map