/**
 * Quick Test: Single subject video analysis test
 * Tests one creator/company to verify video analysis is working
 */

import { startScan } from '../src/services/scanService';
import { storage } from '../src/services/storage';

const TEST_SUBJECT = {
  name: 'MrBeast',
  username: 'MrBeast',
  type: 'creator',
  platforms: ['youtube', 'twitter'],
  description: 'Top YouTube creator with extensive video content'
};

async function quickTest() {
  console.log('\n🚀 Quick Video Analysis Test');
  console.log(`Testing: ${TEST_SUBJECT.name}`);
  console.log(`Platforms: ${TEST_SUBJECT.platforms.join(', ')}\n`);
  
  const scanId = `quick_test_${Date.now()}`;
  
  // Initialize scan
  const scan = {
    id: scanId,
    username: TEST_SUBJECT.username,
    platforms: TEST_SUBJECT.platforms,
    scanType: 'standard',
    status: 'starting',
    progress: 0,
    logs: [],
    results: null,
    error: null,
    createdAt: new Date().toISOString()
  };
  
  storage.saveScan(scan);
  
  console.log(`[${TEST_SUBJECT.name}] Starting scan (ID: ${scanId})...`);
  
  try {
    await startScan(scanId, TEST_SUBJECT.username, TEST_SUBJECT.platforms, 'standard');
    
    // Poll for completion
    let attempts = 0;
    while (attempts < 300) {
      const currentScan = storage.getScan(scanId);
      
      if (!currentScan) {
        console.log(`[${TEST_SUBJECT.name}] ❌ Scan not found`);
        break;
      }
      
      if (currentScan.status === 'complete') {
        console.log(`\n[${TEST_SUBJECT.name}] ✅ Scan completed!\n`);
        
        if (currentScan.results) {
          const results = currentScan.results;
          
          // Check OUTPUT only
          const posts = results.extractedContent?.posts || [];
          console.log(`📊 Posts Analyzed: ${posts.length}`);
          
          // Check for videos
          let videosFound = 0;
          posts.forEach((post: any) => {
            if (post.media_urls) {
              post.media_urls.forEach((url: string) => {
                if (url && (
                  url.includes('youtube.com') || url.includes('youtu.be') ||
                  url.includes('tiktok.com') || url.includes('instagram.com/reel')
                )) {
                  videosFound++;
                  console.log(`  🎥 Video found: ${url.substring(0, 60)}...`);
                }
              });
            }
            // Also check content text
            if (post.content) {
              const videoMatches = post.content.match(/(?:youtube\.com|youtu\.be|tiktok\.com)/gi);
              if (videoMatches) {
                videosFound += videoMatches.length;
                console.log(`  🎥 Video URL in content: ${post.content.substring(0, 60)}...`);
              }
            }
          });
          
          console.log(`\n🎬 Total Videos Found: ${videosFound}`);
          
          // Check video analysis
          const videoAnalysis = results.videoAnalysis;
          if (videoAnalysis) {
            console.log(`\n✅ Video Analysis Executed:`);
            console.log(`   Videos Analyzed: ${videoAnalysis.videoInsights?.length || 0}`);
            console.log(`   Top Performers: ${videoAnalysis.aggregatedInsights?.topPerformingVideos?.length || 0}`);
            console.log(`   Success Factors: ${videoAnalysis.aggregatedInsights?.commonSuccessFactors?.length || 0}`);
          } else {
            console.log(`\n❌ Video Analysis NOT executed`);
          }
          
          // Check competitor intelligence
          const competitors = results.competitorIntelligence || [];
          console.log(`\n🏢 Competitors: ${competitors.length}`);
          if (competitors.length > 0) {
            const hasVideoInsights = competitors.some((c: any) => c.videoInsights);
            console.log(`   Video Insights Added: ${hasVideoInsights ? '✅ YES' : '❌ NO'}`);
          }
          
          // Show scan stats
          const stats = results.scanStats;
          if (stats) {
            console.log(`\n📈 Scan Stats:`);
            console.log(`   Posts: ${stats.postsAnalyzed}`);
            console.log(`   Competitors: ${stats.competitorsFound}`);
            console.log(`   Videos Analyzed: ${stats.videosAnalyzed}`);
            console.log(`   Has Video Analysis: ${stats.hasVideoAnalysis ? '✅ YES' : '❌ NO'}`);
          }
          
          // Show recent logs
          console.log(`\n📋 Recent Logs (last 10):`);
          const recentLogs = currentScan.logs.slice(-10);
          recentLogs.forEach((log: string) => {
            if (log.includes('VIDEO') || log.includes('video')) {
              console.log(`   ${log}`);
            }
          });
        }
        
        break;
      } else if (currentScan.status === 'error') {
        console.log(`\n[${TEST_SUBJECT.name}] ❌ Scan failed: ${currentScan.error}`);
        break;
      }
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      attempts++;
      
      if (attempts % 15 === 0) {
        console.log(`⏳ Still scanning... (${attempts * 2}s, progress: ${currentScan.progress}%)`);
      }
    }
    
    if (attempts >= 300) {
      console.log(`\n⏰ Scan timeout`);
    }
    
  } catch (error: any) {
    console.error(`\n❌ Error: ${error.message}`);
    console.error(error.stack);
  }
}

quickTest().catch(console.error);






