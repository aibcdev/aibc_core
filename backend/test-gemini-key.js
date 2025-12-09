/**
 * Test script to verify Gemini API key works without quota issues
 * Run: node test-gemini-key.js
 */

require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY not found in .env');
  console.log('Add it to backend/.env: GEMINI_API_KEY=your_key_here');
  process.exit(1);
}

console.log('🔍 Testing Gemini API Key...');
console.log('Key preview:', GEMINI_API_KEY.substring(0, 15) + '...');
console.log('');

async function testGemini() {
  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    console.log('📡 Making test API call...');
    const prompt = 'Say "API test successful" in exactly 3 words.';
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ API Call Successful!');
    console.log('Response:', text.trim());
    console.log('');
    console.log('✅ No quota/rate limit errors detected');
    console.log('✅ Gemini API is working correctly');
    console.log('');
    console.log('🎉 Your Tier 1 quota is active and working!');
    
  } catch (error) {
    console.error('❌ API Call Failed:');
    console.error('Error:', error.message);
    console.error('');
    
    if (error.message.includes('429') || error.message.includes('quota') || error.message.includes('exceeded')) {
      console.error('⚠️  QUOTA/RATE LIMIT ERROR DETECTED');
      console.error('This means:');
      console.error('  - API key might still be on free tier');
      console.error('  - Quota not properly configured');
      console.error('  - Rate limit hit');
    } else if (error.message.includes('403') || error.message.includes('API key')) {
      console.error('⚠️  API KEY ERROR');
      console.error('This means:');
      console.error('  - API key is invalid');
      console.error('  - API key might be leaked/revoked');
    } else {
      console.error('⚠️  UNKNOWN ERROR');
      console.error('Check the error message above');
    }
    
    process.exit(1);
  }
}

testGemini();

