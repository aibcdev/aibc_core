/**
 * Localization Service
 * Handles multi-language content generation and cultural adaptation
 */

export interface LocalizationConfig {
  defaultLanguage: string;
  supportedLanguages: string[];
  autoTranslate: boolean;
  culturalAdaptation: boolean;
}

export const SUPPORTED_LANGUAGES = [
  'en', 'es', 'fr', 'de', 'it', 'pt', 'nl', 'pl', 'ru', 'ja', 'zh', 'ko', 'ar', 'hi', 'tr'
];

export const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  it: 'Italian',
  pt: 'Portuguese',
  nl: 'Dutch',
  pl: 'Polish',
  ru: 'Russian',
  ja: 'Japanese',
  zh: 'Chinese',
  ko: 'Korean',
  ar: 'Arabic',
  hi: 'Hindi',
  tr: 'Turkish',
};

/**
 * Generate content in multiple languages
 */
export async function generateMultilingualContent(
  content: string,
  targetLanguages: string[],
  brandDNA?: any
): Promise<Record<string, string>> {
  const { generateText, isLLMConfigured } = await import('./llmService');
  
  if (!isLLMConfigured()) {
    // Fallback: return original content for all languages
    const result: Record<string, string> = {};
    targetLanguages.forEach(lang => {
      result[lang] = content;
    });
    return result;
  }

  const results: Record<string, string> = {};

  for (const lang of targetLanguages) {
    if (lang === 'en') {
      results[lang] = content;
      continue;
    }

    const languageName = LANGUAGE_NAMES[lang] || lang;
    
    const prompt = `Translate and culturally adapt the following content to ${languageName} (${lang}).

ORIGINAL CONTENT (English):
${content}

${brandDNA ? `BRAND CONTEXT:
- Brand Voice: ${brandDNA.voice?.tone || 'professional'}
- Brand Style: ${brandDNA.voice?.style || 'authentic'}
- Cultural Context: Adapt to ${languageName} cultural norms while maintaining brand voice
` : ''}

REQUIREMENTS:
1. Translate accurately while maintaining the original meaning
2. Adapt cultural references to ${languageName} culture
3. Maintain brand voice and tone
4. Use natural ${languageName} expressions
5. Ensure SEO keywords are translated appropriately
6. Keep formatting (HTML tags, structure) intact

Return ONLY the translated content, no explanations.`;

    try {
      const translated = await generateText(prompt, undefined, { tier: 'basic' });
      results[lang] = translated.trim();
    } catch (error) {
      console.error(`[Localization] Translation error for ${lang}:`, error);
      results[lang] = content; // Fallback to original
    }
  }

  return results;
}

/**
 * Generate culturally adapted content
 */
export async function generateCulturallyAdaptedContent(
  content: string,
  targetRegion: string,
  brandDNA?: any
): Promise<string> {
  const { generateText, isLLMConfigured } = await import('./llmService');
  
  if (!isLLMConfigured()) {
    return content;
  }

  const culturalContext: Record<string, string> = {
    'US': 'American English, direct communication style',
    'UK': 'British English, formal yet approachable',
    'EU': 'European style, GDPR-aware, formal',
    'APAC': 'Asia-Pacific style, respectful, relationship-focused',
    'LATAM': 'Latin American style, warm, relationship-oriented',
    'MEA': 'Middle East & Africa style, respectful, relationship-focused',
  };

  const context = culturalContext[targetRegion] || 'International style';

  const prompt = `Adapt the following content for ${targetRegion} region (${context}).

ORIGINAL CONTENT:
${content}

${brandDNA ? `BRAND CONTEXT:
- Brand Voice: ${brandDNA.voice?.tone || 'professional'}
- Brand Style: ${brandDNA.voice?.style || 'authentic'}
` : ''}

REQUIREMENTS:
1. Adapt cultural references and examples to ${targetRegion}
2. Adjust tone and formality level for ${context}
3. Use region-appropriate examples and case studies
4. Maintain brand voice while respecting cultural norms
5. Ensure compliance with regional regulations (GDPR for EU, etc.)
6. Keep SEO optimization intact

Return ONLY the adapted content, no explanations.`;

  try {
    const adapted = await generateText(prompt, undefined, { tier: 'basic' });
    return adapted.trim();
  } catch (error) {
    console.error(`[Localization] Cultural adaptation error for ${targetRegion}:`, error);
    return content;
  }
}

/**
 * Detect content language
 */
export function detectLanguage(content: string): string {
  // Simple language detection (in production, use a proper library)
  // This is a placeholder - implement proper detection
  return 'en';
}

/**
 * Get language-specific SEO keywords
 */
export async function translateKeywords(
  keywords: string[],
  targetLanguage: string
): Promise<string[]> {
  const { generateJSON, isLLMConfigured } = await import('./llmService');
  
  if (!isLLMConfigured() || targetLanguage === 'en') {
    return keywords;
  }

  const languageName = LANGUAGE_NAMES[targetLanguage] || targetLanguage;

  const prompt = `Translate the following SEO keywords to ${languageName} (${targetLanguage}).

Keywords: ${keywords.join(', ')}

Return JSON array of translated keywords that are:
1. Natural ${languageName} translations
2. SEO-optimized for ${languageName} search engines
3. Maintain search intent

Return format: { "keywords": ["translated1", "translated2", ...] }`;

  try {
    const result = await generateJSON<{ keywords: string[] }>(prompt, undefined, { tier: 'basic' });
    return result.keywords || keywords;
  } catch (error) {
    console.error(`[Localization] Keyword translation error:`, error);
    return keywords;
  }
}





