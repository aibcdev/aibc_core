"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateBrandVoiceContent = generateBrandVoiceContent;
const generative_ai_1 = require("@google/generative-ai");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const genAI = GEMINI_API_KEY ? new generative_ai_1.GoogleGenerativeAI(GEMINI_API_KEY) : null;
/**
 * Generate content that matches the brand's unique voice
 */
async function generateBrandVoiceContent(request) {
    if (!genAI) {
        return {
            success: false,
            error: 'Gemini API key not configured'
        };
    }
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        // Extract brand voice characteristics
        const brandVoice = request.brandDNA?.voice || {};
        const vocabulary = brandVoice.vocabulary || [];
        const tones = brandVoice.tones || [];
        const style = brandVoice.style || 'professional';
        const formality = brandVoice.formality || 'casual';
        const tone = brandVoice.tone || 'friendly';
        // Get actual content examples from their posts
        const actualPosts = (request.extractedContent?.posts || [])
            .slice(0, 10)
            .map((p) => p.content)
            .filter((c) => c && c.length > 20)
            .join('\n\n---EXAMPLE POST---\n\n');
        // Get their themes and pillars
        const themes = request.brandDNA?.themes || [];
        const corePillars = request.brandDNA?.corePillars || [];
        const archetype = request.brandDNA?.archetype || 'The Creator';
        // Build platform-specific prompt
        const platformPrompts = {
            'X': 'X (Twitter) post',
            'LINKEDIN': 'LinkedIn post',
            'INSTAGRAM': 'Instagram post',
            'TIKTOK': 'TikTok video script',
            'YOUTUBE': 'YouTube video script',
            'PODCAST': 'Podcast script',
            'AUDIO': 'Audio clip script'
        };
        const contentTypePrompts = {
            'thread': 'a Twitter thread (6-10 tweets)',
            'post': 'a single post',
            'reel': 'an Instagram Reel script (60 seconds)',
            'carousel': 'an Instagram Carousel (5-7 slides)',
            'video': 'a video script',
            'podcast': 'a podcast script (2-5 minutes)'
        };
        const platformDesc = platformPrompts[request.platform.toUpperCase()] || 'social media post';
        const contentTypeDesc = contentTypePrompts[request.contentType] || 'content';
        const prompt = `You are a content writer who perfectly mimics a brand's unique voice.

BRAND VOICE ANALYSIS:
- Archetype: ${archetype}
- Style: ${style}
- Formality: ${formality}
- Tone: ${tone}
- Key Tones: ${tones.join(', ')}
- Vocabulary: ${vocabulary.length > 0 ? vocabulary.join(', ') : 'Use their natural vocabulary from examples'}
- Core Themes: ${themes.join(', ')}
- Brand Pillars: ${corePillars.join(', ')}

ACTUAL EXAMPLES OF THEIR WRITING:
${actualPosts || 'No examples available - use the voice characteristics above'}

CRITICAL RULES:
1. Match their EXACT writing style - sentence length, punctuation, emoji usage
2. Use their vocabulary - if they don't say "unpopular opinion", don't use it
3. Match their tone - if they're direct, be direct. If they're conversational, be conversational
4. Use their sentence structure patterns
5. Match their emoji usage (or lack thereof)
6. Use their actual phrases and expressions
7. DO NOT use generic phrases they don't use
8. DO NOT sound like a generic AI - sound like THEM

TOPIC: ${request.topic}

Generate ${contentTypeDesc} for ${platformDesc} about "${request.topic}".

Write it EXACTLY as they would write it. Use their voice, their style, their words.

Return ONLY the content, no explanations, no meta-commentary.`;
        const result = await model.generateContent(prompt);
        const response = result.response;
        const content = response.text().trim();
        // Clean up the content (remove any markdown formatting if present)
        const cleanContent = content
            .replace(/```[\w]*\n?/g, '')
            .replace(/```/g, '')
            .trim();
        return {
            success: true,
            content: cleanContent
        };
    }
    catch (error) {
        console.error('Content generation error:', error);
        return {
            success: false,
            error: error.message || 'Failed to generate content'
        };
    }
}
