/**
 * Quick test for signal pipeline
 */
import { testPipeline } from './src/aibc/signals';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error('Missing GEMINI_API_KEY environment variable');
    process.exit(1);
}

console.log('Starting pipeline test...');
testPipeline(apiKey);
