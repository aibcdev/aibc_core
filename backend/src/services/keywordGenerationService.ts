/**
 * Keyword Generation Service - Generate millions of keywords for programmatic SEO
 * Targets: content as a service, AI marketing, and location-based keywords
 */

export interface Keyword {
  keyword: string;
  searchVolume?: number;
  difficulty?: number;
  intent: 'informational' | 'commercial' | 'transactional' | 'navigational';
  category: string;
  location?: string;
  parentKeyword?: string;
  priority?: number;
}

export interface KeywordCluster {
  topic: string;
  keywords: Keyword[];
  priority: number;
}

/**
 * Core topics for content as a service and AI marketing
 */
const CORE_TOPICS = [
  'content as a service',
  'ai marketing',
  'ai content generation',
  'automated content creation',
  'content marketing automation',
  'ai copywriting',
  'content strategy',
  'content marketing tools',
  'ai writing assistant',
  'content creation platform',
  'marketing automation',
  'ai content writer',
  'content management',
  'content production',
  'content services',
  'ai marketing tools',
  'content marketing ai',
  'automated marketing',
  'ai content marketing',
  'content generation service',
];

/**
 * Easy-to-win locations (cities with lower competition)
 */
export const TARGET_LOCATIONS = [
  // US Cities
  'Austin', 'Portland', 'Nashville', 'Denver', 'Seattle', 'Atlanta', 'Miami', 'Phoenix',
  'Charlotte', 'Raleigh', 'Indianapolis', 'Columbus', 'Minneapolis', 'Kansas City',
  'Milwaukee', 'Cincinnati', 'Pittsburgh', 'Baltimore', 'Detroit', 'Cleveland',
  // International
  'Toronto', 'Vancouver', 'Montreal', 'London', 'Manchester', 'Birmingham', 'Sydney',
  'Melbourne', 'Brisbane', 'Auckland', 'Dublin', 'Amsterdam', 'Berlin', 'Munich',
  // Emerging Markets
  'Dubai', 'Singapore', 'Bangkok', 'Manila', 'Jakarta', 'Ho Chi Minh City', 'Bangalore',
  'Mumbai', 'Delhi', 'Hyderabad', 'São Paulo', 'Mexico City', 'Buenos Aires',
];

/**
 * Question modifiers for long-tail keywords
 */
const QUESTION_MODIFIERS = [
  'what is', 'how to', 'why', 'when', 'where', 'who', 'which', 'can you',
  'should you', 'do you need', 'is it', 'are there', 'what are', 'how do',
  'how can', 'what does', 'how much', 'how many', 'what makes', 'how does',
];

/**
 * Intent modifiers
 */
const INTENT_MODIFIERS = {
  informational: ['guide', 'tutorial', 'explained', 'overview', 'introduction', 'basics', '101', 'tips', 'best practices'],
  commercial: ['best', 'top', 'review', 'comparison', 'vs', 'alternative', 'software', 'tool', 'platform', 'service'],
  transactional: ['buy', 'pricing', 'cost', 'price', 'cheap', 'affordable', 'discount', 'deal', 'free trial'],
  navigational: ['login', 'sign up', 'register', 'dashboard', 'account', 'help', 'support', 'contact'],
};

/**
 * Generate base keywords from core topics
 */
export function generateBaseKeywords(): Keyword[] {
  const keywords: Keyword[] = [];

  // Core topic keywords
  for (const topic of CORE_TOPICS) {
    keywords.push({
      keyword: topic,
      intent: 'informational',
      category: 'core',
      priority: 1,
    });

    // Add variations
    keywords.push({
      keyword: `${topic} guide`,
      intent: 'informational',
      category: 'core',
      parentKeyword: topic,
    });

    keywords.push({
      keyword: `best ${topic}`,
      intent: 'commercial',
      category: 'core',
      parentKeyword: topic,
    });

    keywords.push({
      keyword: `${topic} tools`,
      intent: 'commercial',
      category: 'core',
      parentKeyword: topic,
    });
  }

  return keywords;
}

/**
 * Generate location-based keywords
 */
export function generateLocationKeywords(baseKeyword: string): Keyword[] {
  const keywords: Keyword[] = [];

  for (const location of TARGET_LOCATIONS) {
    // Direct location keywords
    keywords.push({
      keyword: `${baseKeyword} ${location}`,
      intent: 'informational',
      category: 'location',
      location: location,
      parentKeyword: baseKeyword,
    });

    keywords.push({
      keyword: `${baseKeyword} in ${location}`,
      intent: 'informational',
      category: 'location',
      location: location,
      parentKeyword: baseKeyword,
    });

    keywords.push({
      keyword: `${location} ${baseKeyword}`,
      intent: 'informational',
      category: 'location',
      location: location,
      parentKeyword: baseKeyword,
    });

    // Best in location
    keywords.push({
      keyword: `best ${baseKeyword} ${location}`,
      intent: 'commercial',
      category: 'location',
      location: location,
      parentKeyword: baseKeyword,
    });

    // Services in location
    keywords.push({
      keyword: `${baseKeyword} service ${location}`,
      intent: 'commercial',
      category: 'location',
      location: location,
      parentKeyword: baseKeyword,
    });
  }

  return keywords;
}

/**
 * Generate question-based keywords
 */
export function generateQuestionKeywords(baseKeyword: string): Keyword[] {
  const keywords: Keyword[] = [];

  for (const question of QUESTION_MODIFIERS) {
    keywords.push({
      keyword: `${question} ${baseKeyword}`,
      intent: 'informational',
      category: 'question',
      parentKeyword: baseKeyword,
    });
  }

  return keywords;
}

/**
 * Generate intent-based keywords
 */
export function generateIntentKeywords(baseKeyword: string, intent: keyof typeof INTENT_MODIFIERS): Keyword[] {
  const keywords: Keyword[] = [];
  const modifiers = INTENT_MODIFIERS[intent];

  for (const modifier of modifiers) {
    keywords.push({
      keyword: `${modifier} ${baseKeyword}`,
      intent: intent,
      category: 'intent',
      parentKeyword: baseKeyword,
    });

    keywords.push({
      keyword: `${baseKeyword} ${modifier}`,
      intent: intent,
      category: 'intent',
      parentKeyword: baseKeyword,
    });
  }

  return keywords;
}

/**
 * Generate keyword combinations (exponential growth)
 */
export function generateKeywordCombinations(baseKeywords: Keyword[]): Keyword[] {
  const allKeywords: Keyword[] = [...baseKeywords];
  const processed = new Set<string>();

  for (const base of baseKeywords) {
    const baseKeyword = base.keyword;

    // Skip if already processed
    if (processed.has(baseKeyword)) continue;
    processed.add(baseKeyword);

    // Generate location variations
    const locationKeywords = generateLocationKeywords(baseKeyword);
    allKeywords.push(...locationKeywords);

    // Generate question variations
    const questionKeywords = generateQuestionKeywords(baseKeyword);
    allKeywords.push(...questionKeywords);

    // Generate intent variations
    for (const intent of Object.keys(INTENT_MODIFIERS) as Array<keyof typeof INTENT_MODIFIERS>) {
      const intentKeywords = generateIntentKeywords(baseKeyword, intent);
      allKeywords.push(...intentKeywords);
    }

    // Generate year-based keywords
    const currentYear = new Date().getFullYear();
    for (let year = currentYear - 2; year <= currentYear + 1; year++) {
      allKeywords.push({
        keyword: `${baseKeyword} ${year}`,
        intent: 'informational',
        category: 'temporal',
        parentKeyword: baseKeyword,
      });
    }

    // Generate industry-specific keywords
    const industries = ['SaaS', 'ecommerce', 'healthcare', 'finance', 'real estate', 'education', 'legal', 'restaurant', 'fitness', 'beauty'];
    for (const industry of industries) {
      allKeywords.push({
        keyword: `${baseKeyword} ${industry}`,
        intent: 'informational',
        category: 'industry',
        parentKeyword: baseKeyword,
      });

      allKeywords.push({
        keyword: `${industry} ${baseKeyword}`,
        intent: 'informational',
        category: 'industry',
        parentKeyword: baseKeyword,
      });
    }
  }

  return allKeywords;
}

/**
 * Generate all keywords (targeting 1M+)
 */
export function generateAllKeywords(): Keyword[] {
  console.log('🚀 Generating keywords for 1M+ pages...');
  
  // Start with base keywords
  const baseKeywords = generateBaseKeywords();
  console.log(`✅ Generated ${baseKeywords.length} base keywords`);

  // Generate combinations
  const allKeywords = generateKeywordCombinations(baseKeywords);
  console.log(`✅ Generated ${allKeywords.length} total keywords`);

  // Remove duplicates
  const uniqueKeywords = Array.from(
    new Map(allKeywords.map(k => [k.keyword.toLowerCase(), k])).values()
  );

  console.log(`✅ ${uniqueKeywords.length} unique keywords after deduplication`);

  return uniqueKeywords;
}

/**
 * Get keywords for a specific location
 */
export function getKeywordsForLocation(location: string): Keyword[] {
  const allKeywords = generateAllKeywords();
  return allKeywords.filter(k => k.location?.toLowerCase() === location.toLowerCase());
}

/**
 * Get keywords by category
 */
export function getKeywordsByCategory(category: string): Keyword[] {
  const allKeywords = generateAllKeywords();
  return allKeywords.filter(k => k.category === category);
}

/**
 * Get top priority keywords (for initial content generation)
 */
export function getTopPriorityKeywords(limit: number = 1000): Keyword[] {
  const allKeywords = generateAllKeywords();
  
  // Prioritize: core > location > question > intent > others
  const priorityOrder = ['core', 'location', 'question', 'intent', 'industry', 'temporal'];
  
  return allKeywords
    .sort((a, b) => {
      const aPriority = priorityOrder.indexOf(a.category) !== -1 ? priorityOrder.indexOf(a.category) : 999;
      const bPriority = priorityOrder.indexOf(b.category) !== -1 ? priorityOrder.indexOf(b.category) : 999;
      return aPriority - bPriority;
    })
    .slice(0, limit);
}


