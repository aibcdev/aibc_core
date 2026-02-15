/**
 * AIBC Signal Pipeline Orchestrator
 * Coordinates signal ingestion → routing → agent processing → output
 */
import { fetchNewsSignals, fetchRedditSignals, filterSignals, routeSignal, } from './ingestion';
import { processSignalWithAgent, generateExecutiveBrief, } from './agents';
import { saveSignals, saveAgentOutputs } from './storage';
/**
 * Run the full signal pipeline
 */
export async function runSignalPipeline(config) {
    const errors = [];
    let allSignals = [];
    // 1. Ingest signals from all sources
    console.log('[Pipeline] Ingesting signals...');
    // News
    if (config.newsApiKey && config.newsQueries) {
        for (const query of config.newsQueries) {
            try {
                const newsSignals = await fetchNewsSignals(query, config.newsApiKey);
                allSignals = [...allSignals, ...newsSignals];
            }
            catch (e) {
                errors.push(`News fetch failed for "${query}": ${e}`);
            }
        }
    }
    // Reddit
    const subreddits = config.subreddits || ['marketing', 'business', 'startups'];
    for (const subreddit of subreddits) {
        try {
            const redditSignals = await fetchRedditSignals(subreddit);
            allSignals = [...allSignals, ...redditSignals];
        }
        catch (e) {
            errors.push(`Reddit fetch failed for r/${subreddit}: ${e}`);
        }
    }
    console.log(`[Pipeline] Ingested ${allSignals.length} raw signals`);
    // 2. Filter by confidence threshold
    const filteredSignals = filterSignals(allSignals);
    console.log(`[Pipeline] ${filteredSignals.length} signals above threshold`);
    // Persist signals
    await saveSignals(filteredSignals);
    // 3. Route and process through agents
    const outputs = [];
    for (const signal of filteredSignals.slice(0, 10)) { // Limit for API rate
        const targetAgents = routeSignal(signal);
        for (const agentType of targetAgents) {
            try {
                const output = await processSignalWithAgent(signal, agentType, config.brandContext, config.geminiApiKey);
                if (output) {
                    outputs.push(output);
                    console.log(`[Pipeline] ${agentType} generated output: ${output.title}`);
                }
            }
            catch (e) {
                errors.push(`Agent ${agentType} failed: ${e}`);
            }
        }
    }
    // Persist outputs
    await saveAgentOutputs(outputs);
    // 4. Generate executive brief
    let executiveBrief = null;
    if (outputs.length > 0) {
        try {
            executiveBrief = await generateExecutiveBrief(outputs, config.geminiApiKey);
            console.log('[Pipeline] Executive brief generated');
            // Persist brief (needs brand UUID, assume hardcoded or lookup for MVP)
            // For MVP, if brands table is empty, we might fail. 
            // Ideally we pass brand UUID in config.
            // await saveExecutiveBrief('UUID', executiveBrief); 
        }
        catch (e) {
            errors.push(`Executive brief failed: ${e}`);
        }
    }
    return {
        signalsProcessed: filteredSignals.length,
        outputs,
        executiveBrief,
        errors,
    };
}
/**
 * Quick test function
 */
export async function testPipeline(geminiApiKey) {
    console.log('[Test] Running pipeline test...');
    const result = await runSignalPipeline({
        geminiApiKey,
        brandContext: 'AIBC Media is an AI marketing operating system for SMB marketers.',
        subreddits: ['marketing'],
    });
    console.log(`[Test] Processed ${result.signalsProcessed} signals`);
    console.log(`[Test] Generated ${result.outputs.length} outputs`);
    if (result.executiveBrief) {
        console.log(`[Test] Brief: ${result.executiveBrief.title}`);
        console.log(result.executiveBrief.content);
    }
    if (result.errors.length > 0) {
        console.log('[Test] Errors:', result.errors);
    }
}
//# sourceMappingURL=pipeline.js.map