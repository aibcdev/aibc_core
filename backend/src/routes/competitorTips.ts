/**
 * Competitor Tips API Routes - Generate LLM-powered strategic tips
 */

import express from 'express';
import { generateJSON } from '../services/llmService';

const router = express.Router();

/**
 * POST /api/competitor-tips - Generate strategic summary tips based on competitor analysis
 */
router.post('/', async (req, res) => {
  try {
    const { competitorIntelligence, brandDNA, marketShare, userName } = req.body;

    if (!competitorIntelligence || !Array.isArray(competitorIntelligence) || competitorIntelligence.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'competitorIntelligence array is required'
      });
    }

    const competitorsSummary = competitorIntelligence.slice(0, 3).map((c: any, i: number) => 
      `${i + 1}. ${c.name || c.companyName || `Competitor ${i + 1}`}: ${c.theirAdvantage || 'Analyzing...'}`
    ).join('\n');

    const prompt = `You are a competitive intelligence analyst. Based on the following competitor analysis, provide 3-5 concise, actionable strategic tips for ${userName || 'the company'}.

Competitor Analysis:
${competitorsSummary}

Brand DNA Context:
${brandDNA ? JSON.stringify(brandDNA, null, 2) : 'Not available'}

Market Position: ${marketShare?.position || 'Unknown'} of ${marketShare?.total || 'Unknown'}

Provide 3-5 specific, actionable tips that:
1. Address competitive weaknesses
2. Leverage competitive advantages
3. Are specific to this company's brand voice and market position
4. Include concrete next steps
5. Use short, punchy sentences (avoid buzzwords like "revolutionary")
6. Start with outcome-based verbs when possible

Return JSON in this format:
{
  "tips": ["Tip 1", "Tip 2", "Tip 3", "Tip 4", "Tip 5"]
}`;

    const systemPrompt = `You are a competitive intelligence analyst. Return only valid JSON in this exact format:
{
  "tips": ["Tip 1", "Tip 2", "Tip 3"]
}

Tips should be:
- Specific and actionable
- Based on the competitor analysis provided
- Tailored to the company's brand voice
- Use short, punchy sentences
- Avoid generic advice`;

    // Set timeout for LLM call (15 seconds)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('LLM timeout')), 15000);
    });

    try {
      const result = await Promise.race([
        generateJSON<{ tips: string[] }>(prompt, systemPrompt),
        timeoutPromise
      ]) as any;

      if (result && result.tips && Array.isArray(result.tips)) {
        res.json({
          success: true,
          tips: result.tips
        });
      } else {
        throw new Error('Invalid response format from LLM');
      }
    } catch (llmError: any) {
      console.warn('LLM generation failed, returning fallback tips:', llmError.message);
      // Return fallback tips
      res.json({
        success: true,
        tips: [
          'Focus on mobile experience optimization to close the gap with competitors',
          'Leverage your superior API performance in marketing messaging',
          'Maintain user retention while improving mobile experience',
          'Identify and exploit competitor weaknesses in content strategy',
          'Double down on your competitive advantages in brand voice consistency'
        ],
        fallback: true
      });
    }
  } catch (error: any) {
    console.error('Error generating competitor tips:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate competitor tips'
    });
  }
});

export default router;


