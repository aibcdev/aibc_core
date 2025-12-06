import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

interface VerifyResult {
  success: boolean;
  verified: boolean;
  profile?: {
    name: string;
    avatar?: string;
    followers?: string;
    bio?: string;
    url?: string;
  };
  error?: string;
}

/**
 * Verify a handle/username exists on a given platform using LLM research
 */
export async function verifyHandle(username: string, platform: string): Promise<VerifyResult> {
  const cleanUsername = username.replace('@', '').trim().toLowerCase();
  
  // Basic validation
  if (!cleanUsername || cleanUsername.length < 2) {
    return {
      success: false,
      verified: false,
      error: 'Username must be at least 2 characters'
    };
  }

  // Check for invalid characters
  if (!/^[a-zA-Z0-9._-]+$/.test(cleanUsername)) {
    return {
      success: false,
      verified: false,
      error: 'Username contains invalid characters'
    };
  }

  // If no API key, use simulated verification
  if (!genAI) {
    console.log('No Gemini API key, using simulated verification');
    return simulateVerification(cleanUsername, platform);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const platformInfo = getPlatformInfo(platform);
    
    const prompt = `You are a social media research assistant. Verify if the account "${cleanUsername}" exists on ${platformInfo.name}.

Research this account and provide information about it. If the account exists, return their display name, approximate follower count, and a brief bio/description.

IMPORTANT: 
- Only confirm accounts that actually exist with real public presence
- If you're uncertain or the account doesn't exist, say so
- Provide accurate information based on your knowledge

Return ONLY a valid JSON response in this exact format:
{
  "exists": true or false,
  "confidence": "high" or "medium" or "low",
  "profile": {
    "name": "Display Name",
    "followers": "10K" or "1.2M" or exact number,
    "bio": "Brief description of the account",
    "accountType": "personal" or "business" or "creator"
  },
  "reason": "Why you believe this account exists or doesn't exist"
}

If the account doesn't exist or you're not confident, set exists to false.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return simulateVerification(cleanUsername, platform);
    }

    const data = JSON.parse(jsonMatch[0]);
    
    if (data.exists && (data.confidence === 'high' || data.confidence === 'medium')) {
      // Ensure name is never empty
      const profileName = data.profile?.name || cleanUsername;
      if (!profileName || profileName.trim().length === 0) {
        return {
          success: true,
          verified: false,
          error: `Could not retrieve name for @${cleanUsername}. Please check the username.`
        };
      }
      
      return {
        success: true,
        verified: true,
        profile: {
          name: profileName.trim(),
          followers: data.profile?.followers || 'Unknown',
          bio: data.profile?.bio || `${platformInfo.name} account`,
          url: platformInfo.getUrl(cleanUsername)
        }
      };
    } else {
      return {
        success: true,
        verified: false,
        error: data.reason || `Could not verify @${cleanUsername} on ${platformInfo.name}`
      };
    }
  } catch (error: any) {
    console.error('LLM verification error:', error);
    // Fall back to simulated verification
    return simulateVerification(cleanUsername, platform);
  }
}

/**
 * Verify a competitor/company name using LLM research
 */
export async function verifyCompetitor(name: string, industry?: string): Promise<VerifyResult> {
  const cleanName = name.trim();
  
  if (!cleanName || cleanName.length < 2) {
    return {
      success: false,
      verified: false,
      error: 'Name must be at least 2 characters'
    };
  }

  if (!genAI) {
    return simulateCompetitorVerification(cleanName, industry);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const prompt = `You are a business research assistant. Verify if "${cleanName}" is a real company, brand, or content creator${industry ? ` in the ${industry} industry` : ''}.

Research this entity and provide information about it. Look for:
- Companies, brands, or organizations with this name
- Content creators, influencers, or public figures with this name
- YouTubers, streamers, or social media personalities

IMPORTANT:
- Only confirm entities that actually exist with real public presence
- If you're uncertain or multiple entities exist with this name, ask for clarification
- Provide accurate information based on your knowledge

Return ONLY a valid JSON response in this exact format:
{
  "exists": true or false,
  "type": "company" or "creator" or "brand" or "unknown",
  "confidence": "high" or "medium" or "low",
  "profile": {
    "name": "Full/Display Name",
    "description": "Brief description of what they do",
    "industry": "Their industry or niche",
    "platforms": ["List of platforms they're active on"],
    "size": "Small" or "Medium" or "Large" or follower count
  },
  "reason": "Why you believe this entity exists or doesn't exist"
}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return simulateCompetitorVerification(cleanName, industry);
    }

    const data = JSON.parse(jsonMatch[0]);
    
    if (data.exists && (data.confidence === 'high' || data.confidence === 'medium')) {
      // Ensure name is never empty
      const profileName = data.profile?.name || cleanName;
      if (!profileName || profileName.trim().length === 0) {
        return {
          success: true,
          verified: false,
          error: `Could not retrieve name for "${cleanName}". Please try a different name.`
        };
      }
      
      return {
        success: true,
        verified: true,
        profile: {
          name: profileName.trim(),
          bio: data.profile?.description || '',
          followers: data.profile?.size || 'Unknown'
        }
      };
    } else {
      return {
        success: true,
        verified: false,
        error: data.reason || `Could not verify "${cleanName}" as a known entity`
      };
    }
  } catch (error: any) {
    console.error('Competitor verification error:', error);
    return simulateCompetitorVerification(cleanName, industry);
  }
}

// Platform-specific information
function getPlatformInfo(platform: string) {
  const platforms: Record<string, { name: string; getUrl: (u: string) => string }> = {
    'instagram': { name: 'Instagram', getUrl: (u) => `https://instagram.com/${u}` },
    'x': { name: 'X (Twitter)', getUrl: (u) => `https://x.com/${u}` },
    'twitter': { name: 'X (Twitter)', getUrl: (u) => `https://x.com/${u}` },
    'linkedin': { name: 'LinkedIn', getUrl: (u) => `https://linkedin.com/in/${u}` },
    'youtube': { name: 'YouTube', getUrl: (u) => `https://youtube.com/@${u}` },
    'tiktok': { name: 'TikTok', getUrl: (u) => `https://tiktok.com/@${u}` },
    'facebook': { name: 'Facebook', getUrl: (u) => `https://facebook.com/${u}` },
    'threads': { name: 'Threads', getUrl: (u) => `https://threads.net/@${u}` },
  };
  
  return platforms[platform.toLowerCase()] || { name: platform, getUrl: (u) => '' };
}

// Simulated verification for when LLM is unavailable - returns error instead of fake data
function simulateVerification(username: string, platform: string): VerifyResult {
  // Check if it's an email address (not a valid social media handle)
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(username);
  
  if (isEmail) {
    return {
      success: false,
      verified: false,
      error: 'Please enter a username or handle, not an email address. For Instagram, use @username format.'
    };
  }

  // Basic format validation
  const isValidFormat = /^[a-zA-Z0-9._-]{2,30}$/.test(username);
  
  if (!isValidFormat) {
    return {
      success: false,
      verified: false,
      error: 'Invalid username format. Use only letters, numbers, dots, underscores, or hyphens.'
    };
  }

  const platformInfo = getPlatformInfo(platform);
  
  // Don't generate fake data - return error that account couldn't be verified
  return {
    success: true,
    verified: false,
    error: `Could not verify this ${platformInfo.name} account. Please check the username and ensure the account exists and is public. Backend verification service is unavailable.`
  };
}

function simulateCompetitorVerification(name: string, industry?: string): VerifyResult {
  const cleanName = name.trim();
  
  if (cleanName.length < 2) {
    return {
      success: false,
      verified: false,
      error: 'Name too short'
    };
  }

  // Ensure name is never empty
  if (!cleanName || cleanName.length === 0) {
    return {
      success: false,
      verified: false,
      error: 'Name cannot be empty'
    };
  }

  return {
    success: true,
    verified: true,
    profile: {
      name: cleanName,
      bio: industry ? `${industry} competitor` : 'Competitor',
      followers: 'Unknown'
    }
  };
}

