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
# {TITLE} - Complete Guide

## Introduction
{Introduction paragraph that hooks the reader and mentions the target keyword. Explain what they'll learn and why it matters.}

## What You'll Need
{List of prerequisites, tools, or resources needed}

## Step-by-Step Instructions

### Step 1: {Action}
{Detailed instructions for the first step}

### Step 2: {Action}
{Detailed instructions for the second step}

### Step 3: {Action}
{Detailed instructions for the third step}

{Continue with additional steps as needed}

## Tips for Success
{Key tips and best practices}

## Common Mistakes to Avoid
{What not to do and why}

## Conclusion
{Summary of key points and call to action}

## Frequently Asked Questions

**Q: {Common question}**
A: {Answer}

**Q: {Another question}**
A: {Answer}
`,
  },
  'list': {
    id: 'list',
    type: 'list',
    name: 'List Post',
    example_keywords: ['best video marketing tools', 'top content ideas for brands'],
    structure: `
# {TITLE}

## Introduction
{Introduction that explains the value of the list and why these items were selected. Mention the target keyword naturally.}

## {Title Item 1}
{Description and why it's on the list}

## {Title Item 2}
{Description and why it's on the list}

## {Title Item 3}
{Description and why it's on the list}

{Continue with additional items}

## How to Choose the Right Option
{Guide for readers to make a decision based on their needs}

## Conclusion
{Summary and recommendation}

## Frequently Asked Questions

**Q: {Common question}**
A: {Answer}
`,
  },
  'guide': {
    id: 'guide',
    type: 'guide',
    name: 'Ultimate Guide',
    example_keywords: ['complete guide to video marketing', 'ultimate content marketing strategy'],
    structure: `
# {TITLE} - Ultimate Guide

## Table of Contents
1. {Section 1}
2. {Section 2}
3. {Section 3}
{Add more sections}

## Introduction
{Comprehensive introduction that covers what the guide will teach, who it's for, and why it matters. Naturally include the target keyword.}

## Chapter 1: {Topic}
{In-depth coverage of the first major topic}

### {Sub-topic}
{Detailed explanation}

### {Sub-topic}
{Detailed explanation}

## Chapter 2: {Topic}
{In-depth coverage of the second major topic}

## Chapter 3: {Topic}
{In-depth coverage of the third major topic}

{Continue with additional chapters as needed}

## Case Studies and Examples
{Real-world examples that illustrate the concepts}

## Best Practices
{Key recommendations based on industry standards and experience}

## Common Pitfalls
{What to avoid and why}

## Tools and Resources
{Recommended tools, software, or additional resources}

## Conclusion
{Summary of key takeaways and next steps}

## Frequently Asked Questions

**Q: {Question}**
A: {Answer}

**Q: {Question}**
A: {Answer}
`,
  },
  'comparison': {
    id: 'comparison',
    type: 'comparison',
    name: 'Comparison Post',
    example_keywords: ['content marketing vs video marketing', 'instagram vs tiktok for brands'],
    structure: `
# {TITLE}: Which is Better?

## Introduction
{Introduction that explains what's being compared and why it matters to the reader. Include the target keyword.}

## {Option 1} Overview
{Description of the first option}

### Pros
{Advantages}

### Cons
{Disadvantages}

## {Option 2} Overview
{Description of the second option}

### Pros
{Advantages}

### Cons
{Disadvantages}

## Side-by-Side Comparison

| Feature | {Option 1} | {Option 2} |
|---------|-----------|-----------|
| {Feature 1} | {Value} | {Value} |
| {Feature 2} | {Value} | {Value} |
{Continue with more rows}

## When to Choose {Option 1}
{Situations where the first option is better}

## When to Choose {Option 2}
{Situations where the second option is better}

## Real-World Examples
{Examples of each option in action}

## Conclusion
{Recommendation based on different use cases}

## Frequently Asked Questions

**Q: {Question}**
A: {Answer}
`,
  },
  'case-study': {
    id: 'case-study',
    type: 'case-study',
    name: 'Case Study',
    example_keywords: ['successful video marketing campaign', 'brand storytelling example'],
    structure: `
# {TITLE}: A Case Study

## Introduction
{Introduction that sets up the case study and explains why it's relevant. Include the target keyword.}

## The Challenge
{What problem or goal was being addressed}

## Background
{Context about the brand, situation, or company}

## Strategy Overview
{The approach that was taken}

## Implementation
{How the strategy was executed}

### Phase 1: {Stage}
{Details}

### Phase 2: {Stage}
{Details}

### Phase 3: {Stage}
{Details}

## Results
{Measurable outcomes and achievements}

### Key Metrics
{Specific numbers and improvements}

## Lessons Learned
{What worked well and what could be improved}

## Takeaways for Your Brand
{How readers can apply these insights}

## Conclusion
{Summary and final thoughts}

## Frequently Asked Questions

**Q: {Question}**
A: {Answer}
`,
  },
  'tools': {
    id: 'tools',
    type: 'tools',
    name: 'Tools & Resources',
    example_keywords: ['best content marketing tools', 'video editing software for marketers'],
    structure: `
# {TITLE}: Complete Resource Guide

## Introduction
{Introduction explaining the purpose of the tools/resources list and who it's for. Include the target keyword.}

## {Category 1} Tools

### {Tool 1}
- **What it is:** {Description}
- **Best for:** {Use case}
- **Price:** {Pricing}
- **Why we recommend it:** {Reasoning}

### {Tool 2}
{Same structure}

## {Category 2} Tools

### {Tool 1}
{Structure as above}

## How to Choose the Right Tools
{Guide for selecting tools based on needs and budget}

## Free vs Paid Options
{Comparison and recommendations}

## Getting Started
{Step-by-step guide to start using these tools}

## Conclusion
{Summary and recommendations}

## Frequently Asked Questions

**Q: {Question}**
A: {Answer}
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

