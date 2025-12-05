import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

export interface PodcastGenerationRequest {
  topic: string;
  duration: number; // 2-5 minutes
  brandVoice?: any; // Brand DNA from scan
  style?: 'conversational' | 'narrative' | 'educational' | 'entertaining';
  includeMusic?: boolean;
  voiceCloneId?: string; // For AI voice cloning
}

export interface PodcastGenerationResult {
  success: boolean;
  podcastId?: string;
  script?: string;
  audioUrl?: string;
  duration?: number;
  status?: 'generating' | 'processing' | 'complete' | 'error';
  error?: string;
}

/**
 * Generate podcast script using LLM
 */
export async function generatePodcastScript(
  request: PodcastGenerationRequest
): Promise<string> {
  if (!genAI) {
    throw new Error('Gemini API not configured');
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const brandVoiceContext = request.brandVoice
      ? `\n\nBrand Voice Guidelines:\n- Style: ${request.brandVoice.voice?.style || 'professional'}\n- Tone: ${(request.brandVoice.voice?.tones || []).join(', ')}\n- Core Pillars: ${(request.brandVoice.corePillars || []).join(', ')}`
      : '';

    const prompt = `Generate a ${request.duration}-minute podcast script (approximately ${Math.round(request.duration * 150)} words) on the topic: "${request.topic}"

Style: ${request.style || 'conversational'}
${brandVoiceContext}

Requirements:
- Engaging opening hook (first 30 seconds)
- Clear structure with 3-5 main points
- Natural, conversational language
- Include transitions between sections
- Strong closing with call-to-action or key takeaway
- Word count: approximately ${Math.round(request.duration * 150)} words
- Duration: ${request.duration} minutes when spoken at natural pace

Format the script with:
- [INTRO] section
- [MAIN] sections with clear points
- [OUTRO] section
- Include speaker notes in parentheses where helpful

Return ONLY the script text, no markdown formatting.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error: any) {
    console.error('Podcast script generation error:', error);
    throw new Error(`Failed to generate podcast script: ${error.message}`);
  }
}

/**
 * Generate podcast with AI voice clone
 * Note: This is a placeholder - actual voice cloning would integrate with services like:
 * - ElevenLabs API
 * - Play.ht API
 * - Azure Neural TTS
 * - Google Cloud Text-to-Speech (with voice cloning)
 */
export async function generatePodcastWithVoice(
  request: PodcastGenerationRequest
): Promise<PodcastGenerationResult> {
  try {
    // Step 1: Generate script
    const script = await generatePodcastScript(request);

    // Step 2: Generate audio with voice clone
    // TODO: Integrate with voice cloning service
    // For now, return script with placeholder audio URL
    const podcastId = `podcast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      success: true,
      podcastId,
      script,
      audioUrl: `https://storage.googleapis.com/aibc-podcasts/${podcastId}.mp3`, // Placeholder
      duration: request.duration,
      status: 'complete'
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to generate podcast',
      status: 'error'
    };
  }
}

/**
 * Check if user has Premium tier access
 */
export function checkPremiumAccess(userTier: string): boolean {
  return userTier === 'premium';
}

