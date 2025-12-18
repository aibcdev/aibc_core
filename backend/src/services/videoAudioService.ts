/**
 * Video & Audio Content Service
 * Handles video script generation, podcast scripts, and multimedia content
 */

import { generateText, generateJSON, isLLMConfigured } from './llmService';

export interface VideoScript {
  title: string;
  hook: string; // Opening hook (first 15 seconds)
  intro: string; // Introduction (15-30 seconds)
  mainContent: Array<{
    timestamp: string;
    scene: string;
    dialogue: string;
    visualCues: string[];
  }>;
  outro: string;
  callToAction: string;
  tags: string[];
  estimatedDuration: number; // in seconds
}

export interface PodcastScript {
  title: string;
  intro: string;
  segments: Array<{
    segment: string;
    talkingPoints: string[];
    duration: number; // in minutes
  }>;
  outro: string;
  showNotes: string;
  estimatedDuration: number; // in minutes
}

/**
 * Generate video script
 */
export async function generateVideoScript(
  topic: string,
  duration: number = 60, // seconds
  style: 'tutorial' | 'vlog' | 'explainer' | 'entertainment' = 'tutorial',
  brandDNA?: any
): Promise<VideoScript> {
  if (!isLLMConfigured()) {
    throw new Error('LLM service not configured');
  }

  const prompt = `Generate a complete video script for a ${duration}-second ${style} video about: "${topic}"

${brandDNA ? `BRAND CONTEXT:
- Brand Voice: ${brandDNA.voice?.tone || 'professional'}
- Brand Style: ${brandDNA.voice?.style || 'authentic'}
- Brand Archetype: ${brandDNA.archetype || 'The Creator'}
` : ''}

SCRIPT STRUCTURE:
1. HOOK (first 15 seconds) - Grab attention immediately
2. INTRO (15-30 seconds) - Introduce topic and what viewer will learn
3. MAIN CONTENT - Break into scenes with timestamps, dialogue, and visual cues
4. OUTRO (last 10 seconds) - Wrap up and thank viewer
5. CALL TO ACTION - Clear next step for viewer

REQUIREMENTS:
- Natural, conversational dialogue
- Visual cues for each scene
- Engaging and entertaining
- Educational and valuable
- Brand voice consistent throughout
- Optimized for ${style} style

Return JSON:
{
  "title": "Video title",
  "hook": "Opening hook text",
  "intro": "Introduction text",
  "mainContent": [
    {
      "timestamp": "0:15",
      "scene": "Scene description",
      "dialogue": "What to say",
      "visualCues": ["visual cue 1", "visual cue 2"]
    }
  ],
  "outro": "Outro text",
  "callToAction": "CTA text",
  "tags": ["tag1", "tag2"],
  "estimatedDuration": ${duration}
}`;

  const script = await generateJSON<VideoScript>(prompt, undefined, { tier: 'basic' });
  return script;
}

/**
 * Generate podcast script
 */
export async function generatePodcastScript(
  topic: string,
  duration: number = 30, // minutes
  format: 'interview' | 'solo' | 'panel' = 'solo',
  brandDNA?: any
): Promise<PodcastScript> {
  if (!isLLMConfigured()) {
    throw new Error('LLM service not configured');
  }

  const prompt = `Generate a complete podcast script for a ${duration}-minute ${format} podcast episode about: "${topic}"

${brandDNA ? `BRAND CONTEXT:
- Brand Voice: ${brandDNA.voice?.tone || 'professional'}
- Brand Style: ${brandDNA.voice?.style || 'authentic'}
` : ''}

SCRIPT STRUCTURE:
1. INTRO - Welcome listeners, introduce topic
2. SEGMENTS - Break into logical segments with talking points
3. OUTRO - Wrap up, thank listeners
4. SHOW NOTES - Summary and key takeaways

REQUIREMENTS:
- Natural, conversational tone
- Engaging talking points
- ${format === 'interview' ? 'Interview questions and answers' : format === 'panel' ? 'Panel discussion points' : 'Solo narrative flow'}
- Brand voice consistent
- Educational and entertaining

Return JSON:
{
  "title": "Podcast episode title",
  "intro": "Introduction script",
  "segments": [
    {
      "segment": "Segment name",
      "talkingPoints": ["point 1", "point 2"],
      "duration": 5
    }
  ],
  "outro": "Outro script",
  "showNotes": "Show notes summary",
  "estimatedDuration": ${duration}
}`;

  const script = await generateJSON<PodcastScript>(prompt, undefined, { tier: 'basic' });
  return script;
}

/**
 * Generate audio/podcast content ideas
 */
export async function generateAudioContentIdeas(
  brandDNA: any,
  count: number = 5
): Promise<string[]> {
  if (!isLLMConfigured()) {
    return [];
  }

  const prompt = `Generate ${count} podcast/audio content ideas for a brand with:
- Voice: ${brandDNA.voice?.tone || 'professional'}
- Themes: ${brandDNA.themes?.join(', ') || 'general'}
- Archetype: ${brandDNA.archetype || 'The Creator'}

Return JSON array: { "ideas": ["idea1", "idea2", ...] }`;

  const result = await generateJSON<{ ideas: string[] }>(prompt, undefined, { tier: 'basic' });
  return result.ideas || [];
}
