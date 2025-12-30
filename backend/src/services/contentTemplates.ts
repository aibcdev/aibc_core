/**
 * Content Templates - Pre-defined article structures for different content types
 */

import { ContentTemplate } from '../types/seo';

export const CONTENT_TEMPLATES: Record<ContentTemplate['type'], ContentTemplate> = {
  'how-to': {
    id: 'how-to',
    type: 'how-to',
    name: 'How-To Guide',
    example_keywords: ['how to create video content', 'how to start content marketing'],
    structure: `
# {TITLE}

{Opening hook - 2-3 paragraphs. Start with why this matters or a relatable scenario. Clearly state what they'll learn.}

## What You'll Need
{2-3 paragraphs listing prerequisites, tools, or resources with brief explanations of why each matters}

## Step-by-Step Instructions

### Step 1: {Action}
{2-3 paragraphs with detailed instructions. Include why this step matters and what to watch out for.}

### Step 2: {Action}
{2-3 paragraphs with detailed instructions. Build naturally on step 1.}

### Step 3: {Action}
{2-3 paragraphs with detailed instructions. Continue the natural flow.}

{Continue with additional steps - each should be 2-3 paragraphs with natural transitions}

## Tips for Success
{3-4 paragraphs with key tips and best practices. Explain why each tip matters.}

## Common Mistakes to Avoid
{2-3 paragraphs on what not to do and why. Use examples to illustrate.}

{Natural conclusion - 2-3 paragraphs summarizing key points without using "In conclusion"}

## Frequently Asked Questions

<p><strong>Q: {Common question}?</strong></p>
<p>A: {Natural, conversational answer - 2-3 sentences}</p>

<p><strong>Q: {Another question}?</strong></p>
<p>A: {Natural, conversational answer - 2-3 sentences}</p>
`,
  },
  'list': {
    id: 'list',
    type: 'list',
    name: 'List Post',
    example_keywords: ['best video marketing tools', 'top content ideas for brands'],
    structure: `
# {TITLE}

{Opening hook - 2-3 paragraphs. Explain why this list matters and how it was curated. Mention the target keyword naturally.}

## {Title Item 1}
{3-4 paragraphs: Description, why it's on the list, who it's best for, and what makes it stand out. Use examples.}

## {Title Item 2}
{3-4 paragraphs: Description, why it's on the list, who it's best for, and what makes it stand out. Flow naturally from item 1.}

## {Title Item 3}
{3-4 paragraphs: Description, why it's on the list, who it's best for, and what makes it stand out. Continue the narrative.}

{Continue with additional items - each should be 3-4 paragraphs with depth}

## How to Choose the Right Option
{3-4 paragraphs guiding readers to make a decision based on their needs. Include decision framework.}

{Natural conclusion - 2-3 paragraphs summarizing key points and recommendations}

## Frequently Asked Questions

<p><strong>Q: {Common question}?</strong></p>
<p>A: {Natural, conversational answer - 2-3 sentences}</p>
`,
  },
  'guide': {
    id: 'guide',
    type: 'guide',
    name: 'Ultimate Guide',
    example_keywords: ['complete guide to video marketing', 'ultimate content marketing strategy'],
    structure: `
# {TITLE}

{Opening hook - 2-3 paragraphs that immediately engage. Start with a question, surprising fact, or relatable scenario. Clearly state what they'll learn.}

## {Main Topic 1}
{3-5 paragraphs covering the first major topic. Flow naturally, use examples, tell mini-stories. End with a takeaway.}

## {Main Topic 2}
{3-5 paragraphs covering the second major topic. Build on previous section naturally.}

### {Sub-topic}
{2-3 paragraphs diving deeper into a specific aspect}

## {Main Topic 3}
{3-5 paragraphs covering the third major topic. Keep the narrative flowing.}

{Continue with additional main topics as needed - each should be 3-5 paragraphs with natural flow}

## Putting It All Together
{2-3 paragraphs that synthesize the key concepts and show how they connect}

## Common Mistakes to Avoid
{2-3 paragraphs on what not to do, with explanations of why}

## Next Steps
{2-3 paragraphs on actionable next steps readers can take immediately}

{Natural conclusion - 2-3 paragraphs summarizing key takeaways without using "In conclusion"}

## Frequently Asked Questions

<p><strong>Q: {Common question}?</strong></p>
<p>A: {Natural, conversational answer - 2-3 sentences}</p>

<p><strong>Q: {Another question}?</strong></p>
<p>A: {Natural, conversational answer - 2-3 sentences}</p>
`,
  },
  'comparison': {
    id: 'comparison',
    type: 'comparison',
    name: 'Comparison Post',
    example_keywords: ['content marketing vs video marketing', 'instagram vs tiktok for brands'],
    structure: `
# {TITLE}: Which is Better?

{Opening hook - 2-3 paragraphs. Explain what's being compared and why it matters. Include the target keyword. Set up the comparison naturally.}

## {Option 1} Overview
{3-4 paragraphs describing the first option. Explain what it is, who it's for, and its core characteristics.}

### Pros
{2-3 paragraphs on advantages. Explain why each matters with examples.}

### Cons
{2-3 paragraphs on disadvantages. Be honest and balanced.}

## {Option 2} Overview
{3-4 paragraphs describing the second option. Flow naturally from option 1.}

### Pros
{2-3 paragraphs on advantages. Compare contextually to option 1.}

### Cons
{2-3 paragraphs on disadvantages. Be honest and balanced.}

## Side-by-Side Comparison
{2-3 paragraphs introducing the comparison, then use a table format}

| Feature | {Option 1} | {Option 2} |
|---------|-----------|-----------|
| {Feature 1} | {Value} | {Value} |
| {Feature 2} | {Value} | {Value} |
{Continue with more rows}

## When to Choose {Option 1}
{3-4 paragraphs on situations where the first option is better. Use specific scenarios.}

## When to Choose {Option 2}
{3-4 paragraphs on situations where the second option is better. Use specific scenarios.}

## Real-World Examples
{3-4 paragraphs with examples of each option in action. Tell mini-stories.}

{Natural conclusion - 2-3 paragraphs with recommendations based on different use cases}

## Frequently Asked Questions

<p><strong>Q: {Question}?</strong></p>
<p>A: {Natural, conversational answer - 2-3 sentences}</p>
`,
  },
  'case-study': {
    id: 'case-study',
    type: 'case-study',
    name: 'Case Study',
    example_keywords: ['successful video marketing campaign', 'brand storytelling example'],
    structure: `
# {TITLE}: A Case Study

{Opening hook - 2-3 paragraphs. Set up the case study with a compelling story. Explain why it's relevant. Include the target keyword.}

## The Challenge
{3-4 paragraphs describing the problem or goal. Make it relatable and specific.}

## Background
{3-4 paragraphs providing context about the brand, situation, or company. Set the stage for the story.}

## Strategy Overview
{3-4 paragraphs explaining the approach that was taken. Why this strategy? What was the thinking?}

## Implementation
{2-3 paragraphs introducing how the strategy was executed}

### Phase 1: {Stage}
{2-3 paragraphs with details. What happened? What challenges arose?}

### Phase 2: {Stage}
{2-3 paragraphs with details. Build on phase 1 naturally.}

### Phase 3: {Stage}
{2-3 paragraphs with details. Continue the narrative.}

## Results
{3-4 paragraphs on measurable outcomes and achievements. Tell the story of success.}

### Key Metrics
{2-3 paragraphs on specific numbers and improvements. Explain what they mean.}

## Lessons Learned
{3-4 paragraphs on what worked well and what could be improved. Be honest and insightful.}

## Takeaways for Your Brand
{3-4 paragraphs on how readers can apply these insights. Make it actionable.}

{Natural conclusion - 2-3 paragraphs summarizing key points and final thoughts}

## Frequently Asked Questions

<p><strong>Q: {Question}?</strong></p>
<p>A: {Natural, conversational answer - 2-3 sentences}</p>
`,
  },
  'tools': {
    id: 'tools',
    type: 'tools',
    name: 'Tools & Resources',
    example_keywords: ['best content marketing tools', 'video editing software for marketers'],
    structure: `
# {TITLE}: Complete Resource Guide

{Opening hook - 2-3 paragraphs. Explain the purpose of the tools/resources list and who it's for. Include the target keyword.}

## {Category 1} Tools

### {Tool 1}
{3-4 paragraphs covering: What it is, who it's best for, pricing context, and why it's recommended. Use examples and real use cases.}

### {Tool 2}
{3-4 paragraphs with same structure. Flow naturally from tool 1.}

## {Category 2} Tools

### {Tool 1}
{3-4 paragraphs with same structure. Continue the narrative.}

{Continue with additional categories and tools - each tool should be 3-4 paragraphs}

## How to Choose the Right Tools
{3-4 paragraphs guiding selection based on needs and budget. Include decision framework.}

## Free vs Paid Options
{3-4 paragraphs comparing and making recommendations. When is free enough? When is paid worth it?}

## Getting Started
{3-4 paragraphs with step-by-step guide to start using these tools. Make it actionable.}

{Natural conclusion - 2-3 paragraphs summarizing key points and recommendations}

## Frequently Asked Questions

<p><strong>Q: {Question}?</strong></p>
<p>A: {Natural, conversational answer - 2-3 sentences}</p>
`,
  },
};

/**
 * Get template by type
 */
export function getTemplate(type: ContentTemplate['type']): ContentTemplate {
  return CONTENT_TEMPLATES[type];
}

/**
 * Get all templates
 */
export function getAllTemplates(): ContentTemplate[] {
  return Object.values(CONTENT_TEMPLATES);
}

/**
 * Get template suggestions based on keyword
 */
export function suggestTemplateForKeyword(keyword: string): ContentTemplate['type'] {
  const lowerKeyword = keyword.toLowerCase();
  
  if (lowerKeyword.includes('how to') || lowerKeyword.includes('how-to')) {
    return 'how-to';
  }
  
  if (lowerKeyword.includes('best') || lowerKeyword.includes('top') || lowerKeyword.includes('vs') || lowerKeyword.includes('versus')) {
    if (lowerKeyword.includes('vs') || lowerKeyword.includes('versus')) {
      return 'comparison';
    }
    return 'list';
  }
  
  if (lowerKeyword.includes('guide') || lowerKeyword.includes('complete') || lowerKeyword.includes('ultimate')) {
    return 'guide';
  }
  
  if (lowerKeyword.includes('tool') || lowerKeyword.includes('software') || lowerKeyword.includes('platform')) {
    return 'tools';
  }
  
  if (lowerKeyword.includes('case study') || lowerKeyword.includes('example') || lowerKeyword.includes('success')) {
    return 'case-study';
  }
  
  // Default to guide for comprehensive content
  return 'guide';
}

