/**
 * Initialize target keywords in the database
 * Run this script to seed keywords for blog auto-generation
 */

import dotenv from 'dotenv';
import { initializeTargetKeywords } from '../src/services/keywordService';

dotenv.config();

async function main() {
  console.log('🌱 Initializing target keywords...');
  
  try {
    await initializeTargetKeywords();
    console.log('✅ Keywords initialized successfully!');
    console.log('📝 Blog posts will now auto-generate daily at 9 AM');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error initializing keywords:', error);
    process.exit(1);
  }
}

main();

