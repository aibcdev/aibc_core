import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

/**
 * Verify a social media handle
 */
export async function verifyHandle(handle: string, platform: string): Promise<{
  verified: boolean;
  profile?: { name: string; bio?: string; followers?: string };
  error?: string;
}> {
  // Basic validation
  const cleanHandle = handle.replace('@', '').trim();
  
  if (!cleanHandle || cleanHandle.length < 2) {
    return { verified: false, error: 'Invalid handle format' };
  }

  // Check for valid characters
  const isValidFormat = /^[a-zA-Z0-9._-]{2,30}$/.test(cleanHandle);
  if (!isValidFormat) {
    return { verified: false, error: 'Invalid handle format' };
  }

  // Try to verify using LLM if available
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      const prompt = `Is "@${cleanHandle}" a real, active ${platform} account? 
      
      If YES, provide their name and a brief bio (1 sentence).
      If NO or you can't verify, say so.
      
      Return ONLY valid JSON:
      {"verified": true/false, "name": "...", "bio": "..."}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]);
        return {
          verified: data.verified === true,
          profile: data.verified ? { name: data.name || cleanHandle, bio: data.bio } : undefined,
          error: data.verified ? undefined : 'Could not verify account'
        };
      }
    } catch (err) {
      console.error('LLM verification error:', err);
    }
  }

  // Fallback: accept if format is valid
  return {
    verified: true,
    profile: { name: cleanHandle }
  };
}

/**
 * Verify a competitor name/brand
 */
export async function verifyCompetitor(name: string, industry?: string): Promise<{
  verified: boolean;
  profile?: { name: string; bio?: string; followers?: string; industry?: string; url?: string };
  error?: string;
  isRelated?: boolean;
}> {
  if (!name || name.trim().length < 2) {
    return { verified: false, error: 'Invalid name' };
  }

  const cleanName = name.trim();
  
  // Check if it's a URL
  const isURL = cleanName.includes('http://') || cleanName.includes('https://') || 
                (cleanName.includes('.') && (cleanName.includes('.com') || cleanName.includes('.io') || 
                 cleanName.includes('.co') || cleanName.includes('.net') || cleanName.includes('.org')));
  
  // If it's a URL, validate it
  if (isURL) {
    try {
      const url = cleanName.startsWith('http') ? cleanName : `https://${cleanName}`;
      new URL(url); // This will throw if invalid
      // URL is valid format
    } catch {
      return { verified: false, error: 'Invalid URL format' };
    }
  }

  // Try to verify using LLM if available
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      const industryHint = industry ? ` in the ${industry} industry` : '';
      const prompt = `Is "${cleanName}" a real, active company, brand, or creator${industryHint}? 
      
      Check if this is a valid business/creator with an online presence.
      
      If YES, provide:
      - Their full name
      - What industry/space they operate in (1-2 words)
      - A brief description (1 sentence)
      
      If NO or you can't verify, return verified: false.
      
      Return ONLY valid JSON:
      {"verified": true/false, "name": "...", "bio": "...", "industry": "..."}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]);
        
        if (data.verified === true) {
          // Check if competitor is related to our industry
          const competitorIndustry = data.industry?.toLowerCase() || '';
          const ourIndustry = industry?.toLowerCase() || '';
          const isRelated = !ourIndustry || !competitorIndustry || 
                           competitorIndustry.includes(ourIndustry) || 
                           ourIndustry.includes(competitorIndustry) ||
                           competitorIndustry === ourIndustry;
          
          return {
            verified: true,
            profile: { 
              name: data.name || cleanName, 
              bio: data.bio,
              industry: data.industry
            },
            isRelated: isRelated
          };
        } else {
          return {
            verified: false,
            error: 'Could not verify this competitor. Please ensure it is a valid brand/creator.'
          };
        }
      }
    } catch (err) {
      console.error('LLM verification error:', err);
    }
  }

  // No fallback - require real verification
  return {
    verified: false,
    error: 'Could not verify competitor. Please ensure the name is a valid brand/creator.'
  };
}

