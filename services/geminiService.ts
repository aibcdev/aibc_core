import { GoogleGenAI } from "@google/genai";

export const generateAuditLogs = async (username: string): Promise<string[]> => {
  // Access environment variables via Vite's import.meta.env
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY || '';
  
  if (!apiKey) {
    // Return mock data if no key available to prevent crash in preview without keys
    return [
      "[ANALYSIS] Pattern recognition engaged on target historical data.",
      "[CROSS-REF] 42 data points correlated with known growth vectors.",
      "[SENTIMENT] Audience reception trending positive (0.84 confidence).",
      "[OPTIMIZATION] Identified 3 high-impact content gaps."
    ];
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `Generate 4 futuristic, technical sounding forensic digital audit log lines for a user named "${username}". 
They should sound like a high-tech AI agent analyzing social media footprint. 
Format: Just the log message text, one per line. Do not include timestamps or brackets at the start.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: prompt,
    });
    
    const text = response.text || '';
    
    return text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .slice(0, 4);
  } catch (error) {
    console.error("Gemini API Error:", error);
    return [
      "Connection to Neural Net unstable. Using cached heuristics...",
      "Resuming local analysis of digital footprint.",
      "Scraping public repositories for sentiment analysis.",
      "Compiling user interaction graph."
    ];
  }
};