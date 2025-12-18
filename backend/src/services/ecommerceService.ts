/**
 * E-commerce Content Service
 * Handles product content generation, A/B testing, and e-commerce features
 */

import { generateText, generateJSON, isLLMConfigured } from './llmService';

export interface ProductContent {
  title: string;
  description: string;
  shortDescription: string;
  features: string[];
  benefits: string[];
  seoKeywords: string[];
  metaDescription: string;
  variants?: Array<{
    name: string;
    description: string;
  }>;
}

export interface ABTestVariant {
  id: string;
  title: string;
  description: string;
  conversionRate?: number;
  impressions?: number;
}

/**
 * Generate product content
 */
export async function generateProductContent(
  productName: string,
  productCategory: string,
  productFeatures: string[],
  brandDNA?: any
): Promise<ProductContent> {
  if (!isLLMConfigured()) {
    throw new Error('LLM service not configured');
  }

  const prompt = `Generate comprehensive e-commerce product content for:
- Product: ${productName}
- Category: ${productCategory}
- Features: ${productFeatures.join(', ')}

${brandDNA ? `BRAND CONTEXT:
- Brand Voice: ${brandDNA.voice?.tone || 'professional'}
- Brand Style: ${brandDNA.voice?.style || 'authentic'}
` : ''}

REQUIREMENTS:
1. Compelling product title (50-60 characters, SEO-optimized)
2. Detailed product description (200-300 words)
3. Short description for listings (100-150 characters)
4. Key features list (5-7 items)
5. Benefits list (5-7 items, customer-focused)
6. SEO keywords (10-15 relevant keywords)
7. Meta description (150-155 characters)

Return JSON:
{
  "title": "Product title",
  "description": "Full description",
  "shortDescription": "Short description",
  "features": ["feature1", "feature2"],
  "benefits": ["benefit1", "benefit2"],
  "seoKeywords": ["keyword1", "keyword2"],
  "metaDescription": "Meta description"
}`;

  const content = await generateJSON<ProductContent>(prompt, undefined, { tier: 'basic' });
  return content;
}

/**
 * Generate A/B test variants for product content
 */
export async function generateABTestVariants(
  baseContent: ProductContent,
  variantCount: number = 3
): Promise<ABTestVariant[]> {
  if (!isLLMConfigured()) {
    return [];
  }

  const prompt = `Generate ${variantCount} A/B test variants for this product content:

BASE CONTENT:
Title: ${baseContent.title}
Description: ${baseContent.description}

Create ${variantCount} variations that:
1. Test different value propositions
2. Use different emotional appeals
3. Vary urgency and scarcity messaging
4. Test different benefit focuses
5. Optimize for conversion

Return JSON:
{
  "variants": [
    {
      "id": "variant_1",
      "title": "Variant title",
      "description": "Variant description"
    }
  ]
}`;

  const result = await generateJSON<{ variants: ABTestVariant[] }>(prompt, undefined, { tier: 'basic' });
  return result.variants || [];
}

/**
 * Generate product comparison content
 */
export async function generateProductComparison(
  products: Array<{ name: string; features: string[] }>,
  brandDNA?: any
): Promise<string> {
  if (!isLLMConfigured()) {
    return '';
  }

  const productsList = products.map((p, i) => 
    `${i + 1}. ${p.name}\n   Features: ${p.features.join(', ')}`
  ).join('\n\n');

  const prompt = `Generate a product comparison article comparing:
${productsList}

${brandDNA ? `BRAND CONTEXT:
- Brand Voice: ${brandDNA.voice?.tone || 'professional'}
` : ''}

Create a comprehensive comparison that:
1. Highlights key differences
2. Helps readers make informed decisions
3. Maintains brand voice
4. Is SEO-optimized
5. Includes recommendations

Return the full comparison article (500-800 words).`;

  const comparison = await generateText(prompt, undefined, { tier: 'basic' });
  return comparison.trim();
}

/**
 * Generate conversion-optimized product descriptions
 */
export async function generateConversionOptimizedDescription(
  productName: string,
  targetAudience: string,
  brandDNA?: any
): Promise<string> {
  if (!isLLMConfigured()) {
    return '';
  }

  const prompt = `Generate a conversion-optimized product description for:
- Product: ${productName}
- Target Audience: ${targetAudience}

${brandDNA ? `BRAND CONTEXT:
- Brand Voice: ${brandDNA.voice?.tone || 'professional'}
` : ''}

REQUIREMENTS:
1. Lead with biggest benefit
2. Address pain points
3. Create urgency/scarcity
4. Include social proof elements
5. Clear call-to-action
6. Optimized for conversions

Return the description (150-200 words).`;

  const description = await generateText(prompt, undefined, { tier: 'basic' });
  return description.trim();
}
