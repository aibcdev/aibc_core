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
  profile?: { name: string; bio?: string; followers?: string };
  error?: string;
}> {
  if (!name || name.trim().length < 2) {
    return { verified: false, error: 'Invalid name' };
  }

  const cleanName = name.trim();

  // Try to verify using LLM if available
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      const industryHint = industry ? ` in the ${industry} space` : '';
      const prompt = `Is "${cleanName}" a real company, brand, or creator${industryHint}? 
      
      If YES, provide their full name and what they do (1 sentence).
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
          profile: data.verified ? { name: data.name || cleanName, bio: data.bio } : undefined,
          error: data.verified ? undefined : 'Could not verify competitor'
        };
      }
    } catch (err) {
      console.error('LLM verification error:', err);
    }
  }

  // Fallback: accept if name looks valid
  return {
    verified: cleanName.length >= 2,
    profile: { name: cleanName }
  };
}

