/**
 * Test Script: Channel-Based Video Analysis Test
 * Tests 3 companies of different sizes with channel video fetching
 * Verifies OUTPUT only and channel-based video analysis
 */

import { startScan } from '../src/services/scanService';
import { storage } from '../src/services/storage';
import * as fs from 'fs';
import * as path from 'path';

// Test subjects: 3 companies of different sizes
const TEST_SUBJECTS = [
  {
    name: 'Airbnb',
    username: 'airbnb.com',
    type: 'company',
    size: 'large',
    platforms: ['youtube', 'twitter', 'instagram', 'linkedin'],
    expectedChannels: ['youtube', 'instagram'],
    description: 'Large travel/hospitality company with extensive video content'
  },
  {
    name: 'Notion',
    username: 'notion.so',
    type: 'company',
    size: 'medium',
    platforms: ['youtube', 'twitter', 'instagram', 'linkedin'],
    expectedChannels: ['youtube'],
    description: 'Medium-sized SaaS company with product videos'
  },
  {
    name: 'Linear',
    username: 'linear.app',
    type: 'company',
    size: 'small',
    platforms: ['youtube', 'twitter', 'instagram', 'linkedin'],
    expectedChannels: ['youtube'],
    description: 'Smaller tech company with focused video content'
  }
];

interface TestResult {
  subject: typeof TEST_SUBJECTS[0];
  scanId: string;
  success: boolean;
  duration: number;
  outputOnly: {
    verified: boolean;
    issues: string[];
    postsAnalyzed: number;
    videosFound: number;
  };
  channelDetection: {
    channelsDetected: string[];
    videosFetched: number;
    channelsExpected: string[];
  };
  videoAnalysis: {
    executed: boolean;
    videosAnalyzed: number;
    insightsGenerated: boolean;
    topPerformers: number;
    successFactors: number;
    stylePatterns: number;
  };
  competitorIntelligence: {
    enriched: boolean;
    competitorsFound: number;
    videoInsightsAdded: boolean;
  };
  errors: string[];
}

const results: TestResult[] = [];

/**
 * Verify OUTPUT only - ensure we're analyzing their own content
 */
function verifyOutputOnly(scanResults: any, username: string): { verified: boolean; issues: string[]; postsAnalyzed: number; videosFound: number } {
  const issues: string[] = [];
  const posts = scanResults?.extractedContent?.posts || [];
  const videos: string[] = [];
  
  let postsAnalyzed = 0;
  let videosFound = 0;
  
  for (const post of posts) {
    const content = (post.content || '').toLowerCase();
    const author = post.author || '';
    
    // Check for retweets/shares
    if (content.startsWith('rt @') || content.startsWith('retweeting')) {
      issues.push(`Found retweet/share: "${content.substring(0, 50)}..."`);
      continue;
    }
    
    // Check for mentions of others
    if (content.includes('@') && !content.includes(`@${username.toLowerCase()}`)) {
      if (!author.toLowerCase().includes(username.toLowerCase()) && 
          !post.author_id?.toLowerCase().includes(username.toLowerCase())) {
        issues.push(`Possible mention of others: "${content.substring(0, 50)}..."`);
      }
    }
    
    // Check for videos
    if (post.media_urls) {
      post.media_urls.forEach((url: string) => {
        if (url && (
          url.includes('youtube.com') || url.includes('youtu.be') ||
          url.includes('tiktok.com') || url.includes('instagram.com/reel')
        )) {
          videos.push(url);
          videosFound++;
        }
      });
    }
    
    postsAnalyzed++;
  }
  
  if (postsAnalyzed === 0 && posts.length > 0) {
    issues.push('All posts were filtered out - may indicate OUTPUT validation too strict');
  }
  
  const verified = issues.length === 0 && postsAnalyzed > 0;
  
  return {
    verified,
    issues,
    postsAnalyzed,
    videosFound
  };
}

/**
 * Check channel detection and video fetching
 */
function checkChannelDetection(scanResults: any, expectedChannels: string[]): {
  channelsDetected: string[];
  videosFetched: number;
  channelsExpected: string[];
} {
  const socialLinks = scanResults?.socialLinks || {};
  const videoAnalysis = scanResults?.videoAnalysis;
  const channelsDetected: string[] = [];
  
  // Check which channels were detected
  if (socialLinks.youtube) channelsDetected.push('youtube');
  if (socialLinks.tiktok) channelsDetected.push('tiktok');
  if (socialLinks.instagram) channelsDetected.push('instagram');
  
  // Count videos fetched from channels
  let videosFetched = 0;
  if (videoAnalysis?.videoInsights) {
    videoAnalysis.videoInsights.forEach((insight: any) => {
      if (insight.metadata?.source === 'channel') {
        videosFetched++;
      }
    });
  }
  
  return {
    channelsDetected,
    videosFetched,
    channelsExpected: expectedChannels
  };
}

/**
 * Analyze video analysis results
 */
function analyzeVideoAnalysis(scanResults: any): {
  executed: boolean;
  videosAnalyzed: number;
  insightsGenerated: boolean;
  topPerformers: number;
  successFactors: number;
  stylePatterns: number;
} {
  const videoAnalysis = scanResults?.videoAnalysis;
  
  if (!videoAnalysis) {
    return {
      executed: false,
      videosAnalyzed: 0,
      insightsGenerated: false,
      topPerformers: 0,
      successFactors: 0,
      stylePatterns: 0
    };
  }
  
  const videoInsights = videoAnalysis.videoInsights || [];
  const aggregatedInsights = videoAnalysis.aggregatedInsights || {};
  
  return {
    executed: true,
    videosAnalyzed: videoInsights.length,
    insightsGenerated: videoInsights.length > 0,
    topPerformers: aggregatedInsights.topPerformingVideos?.length || 0,
    successFactors: aggregatedInsights.commonSuccessFactors?.length || 0,
    stylePatterns: aggregatedInsights.stylePatterns?.length || 0
  };
}

/**
 * Check competitor intelligence enrichment
 */
function checkCompetitorIntelligence(scanResults: any): {
  enriched: boolean;
  competitorsFound: number;
  videoInsightsAdded: boolean;
} {
  const competitors = scanResults?.competitorIntelligence || [];
  let videoInsightsAdded = false;
  
  for (const competitor of competitors) {
    if (competitor.videoInsights) {
      videoInsightsAdded = true;
      break;
    }
  }
  
  return {
    enriched: videoInsightsAdded,
    competitorsFound: competitors.length,
    videoInsightsAdded
  };
}

/**
 * Run scan for a test subject
 */
async function runTestScan(subject: typeof TEST_SUBJECTS[0]): Promise<TestResult> {
  const startTime = Date.now();
  const scanId = `channel_test_${Date.now()}_${subject.name.replace(/\s+/g, '_').toLowerCase()}`;
  
  console.log(`\n${'='.repeat(80)}`);
  console.log(`Testing: ${subject.name} (${subject.size} ${subject.type})`);
  console.log(`Username: ${subject.username}`);
  console.log(`Platforms: ${subject.platforms.join(', ')}`);
  console.log(`Expected Channels: ${subject.expectedChannels.join(', ')}`);
  console.log(`Scan ID: ${scanId}`);
  console.log(`${'='.repeat(80)}\n`);
  
  const result: TestResult = {
    subject,
    scanId,
    success: false,
    duration: 0,
    outputOnly: {
      verified: false,
      issues: [],
      postsAnalyzed: 0,
      videosFound: 0
    },
    channelDetection: {
      channelsDetected: [],
      videosFetched: 0,
      channelsExpected: subject.expectedChannels
    },
    videoAnalysis: {
      executed: false,
      videosAnalyzed: 0,
      insightsGenerated: false,
      topPerformers: 0,
      successFactors: 0,
      stylePatterns: 0
    },
    competitorIntelligence: {
      enriched: false,
      competitorsFound: 0,
      videoInsightsAdded: false
    },
    errors: []
  };
  
  try {
    // Initialize scan
    const scan = {
      id: scanId,
      username: subject.username,
      platforms: subject.platforms,
      scanType: 'standard',
      status: 'starting',
      progress: 0,
      logs: [],
      results: null,
      error: null,
      createdAt: new Date().toISOString()
    };
    
    storage.saveScan(scan);
    
    // Start scan
    console.log(`[${subject.name}] Starting scan...`);
    await startScan(scanId, subject.username, subject.platforms, 'standard');
    
    // Wait for scan to complete
    let attempts = 0;
    const maxAttempts = 300; // 5 minutes max
    
    while (attempts < maxAttempts) {
      const currentScan = storage.getScan(scanId);
      
      if (!currentScan) {
        result.errors.push('Scan not found in storage');
        break;
      }
      
      if (currentScan.status === 'complete') {
        result.success = true;
        result.duration = Date.now() - startTime;
        
        console.log(`[${subject.name}] ✅ Scan completed in ${(result.duration / 1000).toFixed(2)}s`);
        
        // Analyze results
        if (currentScan.results) {
          // Verify OUTPUT only
          result.outputOnly = verifyOutputOnly(currentScan.results, subject.username);
          console.log(`[${subject.name}] OUTPUT Verification: ${result.outputOnly.verified ? '✅ PASS' : '❌ FAIL'}`);
          console.log(`[${subject.name}]   Posts Analyzed: ${result.outputOnly.postsAnalyzed}`);
          console.log(`[${subject.name}]   Videos Found in Posts: ${result.outputOnly.videosFound}`);
          
          // Check channel detection
          result.channelDetection = checkChannelDetection(currentScan.results, subject.expectedChannels);
          console.log(`[${subject.name}] Channel Detection:`);
          console.log(`[${subject.name}]   Channels Detected: ${result.channelDetection.channelsDetected.join(', ') || 'none'}`);
          console.log(`[${subject.name}]   Videos Fetched from Channels: ${result.channelDetection.videosFetched}`);
          console.log(`[${subject.name}]   Expected Channels: ${result.channelDetection.channelsExpected.join(', ')}`);
          
          // Analyze video analysis
          result.videoAnalysis = analyzeVideoAnalysis(currentScan.results);
          console.log(`[${subject.name}] Video Analysis: ${result.videoAnalysis.executed ? '✅ EXECUTED' : '❌ NOT EXECUTED'}`);
          if (result.videoAnalysis.executed) {
            console.log(`[${subject.name}]   Total Videos Analyzed: ${result.videoAnalysis.videosAnalyzed}`);
            console.log(`[${subject.name}]   Top Performers: ${result.videoAnalysis.topPerformers}`);
            console.log(`[${subject.name}]   Success Factors: ${result.videoAnalysis.successFactors}`);
            console.log(`[${subject.name}]   Style Patterns: ${result.videoAnalysis.stylePatterns}`);
          }
          
          // Check competitor intelligence
          result.competitorIntelligence = checkCompetitorIntelligence(currentScan.results);
          console.log(`[${subject.name}] Competitor Intelligence: ${result.competitorIntelligence.competitorsFound} competitors`);
          console.log(`[${subject.name}]   Video Insights Added: ${result.competitorIntelligence.videoInsightsAdded ? '✅ YES' : '❌ NO'}`);
        }
        
        break;
      } else if (currentScan.status === 'error') {
        result.errors.push(currentScan.error || 'Unknown error');
        console.log(`[${subject.name}] ❌ Scan failed: ${currentScan.error}`);
        break;
      }
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      attempts++;
      
      if (attempts % 15 === 0) {
        console.log(`[${subject.name}] ⏳ Still scanning... (${attempts * 2}s elapsed, progress: ${currentScan.progress}%)`);
      }
    }
    
    if (attempts >= maxAttempts) {
      result.errors.push('Scan timeout - did not complete within 5 minutes');
      console.log(`[${subject.name}] ⏰ Scan timeout`);
    }
    
  } catch (error: any) {
    result.errors.push(error.message || 'Unknown error');
    result.duration = Date.now() - startTime;
    console.error(`[${subject.name}] ❌ Error: ${error.message}`);
  }
  
  return result;
}

/**
 * Generate test report
 */
function generateReport(results: TestResult[]): string {
  const report: string[] = [];
  
  report.push('\n' + '='.repeat(80));
  report.push('CHANNEL-BASED VIDEO ANALYSIS TEST REPORT');
  report.push('='.repeat(80));
  report.push(`Test Date: ${new Date().toISOString()}`);
  report.push(`Total Subjects: ${results.length}`);
  report.push(`Successful Scans: ${results.filter(r => r.success).length}`);
  report.push(`Failed Scans: ${results.filter(r => !r.success).length}`);
  report.push('');
  
  // Summary statistics
  const successful = results.filter(r => r.success);
  const avgDuration = successful.length > 0
    ? successful.reduce((sum, r) => sum + r.duration, 0) / successful.length / 1000
    : 0;
  
  const totalVideosFromChannels = successful.reduce((sum, r) => sum + r.channelDetection.videosFetched, 0);
  const totalVideosAnalyzed = successful.reduce((sum, r) => sum + r.videoAnalysis.videosAnalyzed, 0);
  const outputOnlyPassed = successful.filter(r => r.outputOnly.verified).length;
  const videoAnalysisExecuted = successful.filter(r => r.videoAnalysis.executed).length;
  const channelsDetected = successful.filter(r => r.channelDetection.channelsDetected.length > 0).length;
  const competitorsEnriched = successful.filter(r => r.competitorIntelligence.videoInsightsAdded).length;
  
  report.push('SUMMARY STATISTICS');
  report.push('-'.repeat(80));
  report.push(`Average Scan Duration: ${avgDuration.toFixed(2)}s`);
  report.push(`Total Videos Fetched from Channels: ${totalVideosFromChannels}`);
  report.push(`Total Videos Analyzed: ${totalVideosAnalyzed}`);
  report.push(`OUTPUT Only Verification: ${outputOnlyPassed}/${successful.length} passed`);
  report.push(`Channels Detected: ${channelsDetected}/${successful.length}`);
  report.push(`Video Analysis Executed: ${videoAnalysisExecuted}/${successful.length}`);
  report.push(`Competitors Enriched: ${competitorsEnriched}/${successful.length}`);
  report.push('');
  
  // Detailed results
  report.push('DETAILED RESULTS');
  report.push('='.repeat(80));
  
  results.forEach((result, index) => {
    report.push(`\n${index + 1}. ${result.subject.name} (${result.subject.size} ${result.subject.type})`);
    report.push('-'.repeat(80));
    report.push(`Status: ${result.success ? '✅ SUCCESS' : '❌ FAILED'}`);
    report.push(`Duration: ${(result.duration / 1000).toFixed(2)}s`);
    report.push(`Platforms: ${result.subject.platforms.join(', ')}`);
    report.push('');
    
    report.push('OUTPUT Only Verification:');
    report.push(`  Verified: ${result.outputOnly.verified ? '✅ YES' : '❌ NO'}`);
    report.push(`  Posts Analyzed: ${result.outputOnly.postsAnalyzed}`);
    report.push(`  Videos Found in Posts: ${result.outputOnly.videosFound}`);
    if (result.outputOnly.issues.length > 0) {
      report.push(`  Issues: ${result.outputOnly.issues.length}`);
      result.outputOnly.issues.forEach(issue => report.push(`    - ${issue}`));
    }
    report.push('');
    
    report.push('Channel Detection & Video Fetching:');
    report.push(`  Channels Detected: ${result.channelDetection.channelsDetected.join(', ') || 'none'}`);
    report.push(`  Videos Fetched from Channels: ${result.channelDetection.videosFetched}`);
    report.push(`  Expected Channels: ${result.channelDetection.channelsExpected.join(', ')}`);
    const channelsMatch = result.channelDetection.channelsDetected.length >= result.channelDetection.channelsExpected.length;
    report.push(`  Channels Match Expected: ${channelsMatch ? '✅ YES' : '❌ NO'}`);
    report.push('');
    
    report.push('Video Analysis:');
    report.push(`  Executed: ${result.videoAnalysis.executed ? '✅ YES' : '❌ NO'}`);
    if (result.videoAnalysis.executed) {
      report.push(`  Videos Analyzed: ${result.videoAnalysis.videosAnalyzed}`);
      report.push(`  Insights Generated: ${result.videoAnalysis.insightsGenerated ? '✅ YES' : '❌ NO'}`);
      report.push(`  Top Performers: ${result.videoAnalysis.topPerformers}`);
      report.push(`  Success Factors: ${result.videoAnalysis.successFactors}`);
      report.push(`  Style Patterns: ${result.videoAnalysis.stylePatterns}`);
    }
    report.push('');
    
    report.push('Competitor Intelligence:');
    report.push(`  Competitors Found: ${result.competitorIntelligence.competitorsFound}`);
    report.push(`  Video Insights Added: ${result.competitorIntelligence.videoInsightsAdded ? '✅ YES' : '❌ NO'}`);
    report.push('');
    
    if (result.errors.length > 0) {
      report.push('Errors:');
      result.errors.forEach(error => report.push(`  - ${error}`));
      report.push('');
    }
  });
  
  // Recommendations
  report.push('\n' + '='.repeat(80));
  report.push('RECOMMENDATIONS');
  report.push('='.repeat(80));
  
  if (outputOnlyPassed < successful.length) {
    report.push('⚠️  OUTPUT Only Verification: Some scans may be including mentions/retweets');
  }
  
  if (channelsDetected < successful.length) {
    report.push('⚠️  Channel Detection: Not all expected channels were detected');
    report.push('   Recommendation: Check social link extraction logic');
  }
  
  if (totalVideosFromChannels === 0) {
    report.push('⚠️  No videos fetched from channels');
    report.push('   Recommendation: Check channel video fetching logic');
  }
  
  if (videoAnalysisExecuted < successful.length) {
    report.push('⚠️  Video Analysis: Not all scans executed video analysis');
  }
  
  if (competitorsEnriched < successful.length) {
    report.push('⚠️  Competitor Enrichment: Not all competitors enriched with video insights');
  }
  
  report.push('\n' + '='.repeat(80));
  
  return report.join('\n');
}

/**
 * Main test execution
 */
async function runTests() {
  console.log('\n🚀 Starting Channel-Based Video Analysis Test');
  console.log(`Testing ${TEST_SUBJECTS.length} companies of different sizes`);
  console.log('CRITICAL: Only analyzing OUTPUT (their own content), not mentions/retweets');
  console.log('NEW: Testing channel-based video fetching (2-3 videos per channel)\n');
  
  // Run tests sequentially
  for (const subject of TEST_SUBJECTS) {
    const result = await runTestScan(subject);
    results.push(result);
    
    // Wait between tests
    if (subject !== TEST_SUBJECTS[TEST_SUBJECTS.length - 1]) {
      console.log('\n⏸️  Waiting 5 seconds before next test...\n');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
  
  // Generate and save report
  const report = generateReport(results);
  console.log(report);
  
  // Save report to file
  const reportPath = path.join(__dirname, `../test-reports/channel-video-analysis-test-${Date.now()}.txt`);
  const reportDir = path.dirname(reportPath);
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  fs.writeFileSync(reportPath, report);
  console.log(`\n📄 Report saved to: ${reportPath}`);
  
  // Summary
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log('\n' + '='.repeat(80));
  console.log('TEST SUMMARY');
  console.log('='.repeat(80));
  console.log(`✅ Successful: ${successful}/${results.length}`);
  console.log(`❌ Failed: ${failed}/${results.length}`);
  console.log(`📊 Report: ${reportPath}`);
  console.log('='.repeat(80) + '\n');
}

// Run tests if executed directly
if (require.main === module) {
  runTests().catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}

export { runTests, TEST_SUBJECTS };





