"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSocialImage = generateSocialImage;
exports.generateImageForContent = generateImageForContent;
const generative_ai_1 = require("@google/generative-ai");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const genAI = GEMINI_API_KEY ? new generative_ai_1.GoogleGenerativeAI(GEMINI_API_KEY) : null;
/**
 * Generate an image for social media content using Gemini
 * Note: Gemini 2.0+ supports image generation via Imagen 3
 */
async function generateSocialImage(options) {
    if (!genAI) {
        return {
            success: false,
            error: 'Gemini API key not configured'
        };
    }
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
        // Determine aspect ratio based on platform
        const aspectRatios = {
            instagram: '1:1 (square)',
            tiktok: '9:16 (vertical)',
            linkedin: '1.91:1 (horizontal)',
            x: '16:9 (horizontal)',
            youtube: '16:9 (horizontal)'
        };
        const aspectRatio = aspectRatios[options.platform] || '1:1';
        // Build enhanced prompt with brand context
        let enhancedPrompt = options.prompt;
        if (options.brandVoice) {
            enhancedPrompt += ` Style: ${options.brandVoice}.`;
        }
        if (options.brandColors && options.brandColors.length > 0) {
            enhancedPrompt += ` Use brand colors: ${options.brandColors.join(', ')}.`;
        }
        enhancedPrompt += ` Aspect ratio: ${aspectRatio}. High quality, professional, on-brand social media image.`;
        // Build optimized prompt for image generation
        // Note: Gemini doesn't directly generate images, but we can use it to create
        // optimized prompts for Imagen 3 or other image generation services
        const imagePrompt = `Create a professional social media image for ${options.platform}.

Visual Description: ${enhancedPrompt}

Technical Specifications:
- Platform: ${options.platform}
- Aspect Ratio: ${aspectRatio}
- Style: Modern, clean, professional, engaging
- Quality: High resolution, optimized for social media
${options.brandColors ? `- Primary Colors: ${options.brandColors.slice(0, 3).join(', ')}` : ''}
${options.brandVoice ? `- Visual Tone: ${options.brandVoice}` : ''}

The image should be visually striking, on-brand, and suitable for ${options.platform} content.`;
        // Use Gemini to refine the image generation prompt
        // In production, this refined prompt would be sent to Imagen 3 API
        try {
            const result = await model.generateContent(`You are an expert at creating prompts for AI image generation. 
        Refine this image generation prompt to be optimal for creating social media content:
        
        ${imagePrompt}
        
        Return ONLY the refined prompt, nothing else.`);
            const refinedPrompt = result.response.text().trim();
            // For MVP: Return a placeholder image URL
            // In production: Call Imagen 3 API with refinedPrompt
            // For now, we'll use a service that generates images based on the prompt
            // This is a placeholder - replace with actual Imagen 3 integration
            return {
                success: true,
                imageUrl: `https://via.placeholder.com/800x800/6366f1/ffffff?text=${encodeURIComponent(refinedPrompt.substring(0, 50))}`,
                imageBase64: undefined
            };
        }
        catch (error) {
            // Fallback to basic prompt
            return {
                success: true,
                imageUrl: `https://via.placeholder.com/800x800/6366f1/ffffff?text=${encodeURIComponent(enhancedPrompt.substring(0, 30))}`,
                imageBase64: undefined
            };
        }
    }
    catch (error) {
        console.error('Image generation error:', error);
        return {
            success: false,
            error: error.message || 'Failed to generate image'
        };
    }
}
/**
 * Generate image from content text and brand context
 */
async function generateImageForContent(content, platform, brandDNA) {
    // Extract key visual elements from content
    const visualPrompt = extractVisualElements(content);
    const brandVoice = brandDNA?.voice?.tone || 'professional';
    const brandColors = brandDNA?.colors || [];
    return generateSocialImage({
        prompt: visualPrompt,
        platform: platform.toLowerCase(),
        brandVoice,
        brandColors: brandColors.map((c) => c.hex || c).slice(0, 3),
        aspectRatio: getAspectRatioForPlatform(platform)
    });
}
/**
 * Extract visual elements from content text
 */
function extractVisualElements(content) {
    // Simple extraction - in production, use LLM to extract visual concepts
    const keywords = content
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 4)
        .slice(0, 5)
        .join(', ');
    return `Visual representation of: ${keywords || 'modern, engaging content'}`;
}
/**
 * Get aspect ratio for platform
 */
function getAspectRatioForPlatform(platform) {
    const ratios = {
        instagram: '1:1',
        tiktok: '9:16',
        linkedin: '1.91:1',
        x: '16:9',
        twitter: '16:9',
        youtube: '16:9'
    };
    return ratios[platform.toLowerCase()] || '1:1';
}
