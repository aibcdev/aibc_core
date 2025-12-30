/**
 * Test Script: 5-Agent Video Analysis Test
 * Tests digital footprint scans with video analysis on creators and companies
 * CRITICAL: Only analyzes OUTPUT (their own content), not mentions/retweets
 */

import { startScan } from '../src/services/scanService';
import { storage } from '../src/services/storage';
import * as fs from 'fs';
import * as path from 'path';

// Test subjects: Mix of creators and companies known to have video content
const TEST_SUBJECTS = [
  {
    name: 'MrBeast',
    username: 'MrBeast',
    type: 'creator',
    platforms: ['youtube', 'twitter', 'instagram', 'tiktok'],
    expectedVideos: true,
    description: 'Top YouTube creator with extensive video content'
  },
  {
    name: 'Airbnb',
    username: 'airbnb.com',
    type: 'company',
    platforms: ['youtube', 'twitter', 'instagram', 'linkedin'],
    expectedVideos: true,
    description: 'Travel company with video marketing content'
  },
  {
    name: 'Nike',
    username: 'nike.com',
    type: 'company',
    platforms: ['youtube', 'twitter', 'instagram', 'tiktok'],
    expectedVideos: true,
    description: 'Athletic brand with video campaigns'
  },
  {
    name: 'Gary Vaynerchuk',
    username: 'garyvee',
    type: 'creator',
    platforms: ['youtube', 'twitter', 'instagram', 'linkedin'],
    expectedVideos: true,
    description: 'Entrepreneur/creator with video content'
  },
  {
    name: 'Tesla',
    username: 'tesla.com',
    type: 'company',
    platforms: ['youtube', 'twitter', 'instagram', 'linkedin'],
    expectedVideos: true,
    description: 'Tech company with product videos'
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
  videoAnalysis: {
    executed: boolean;
    videosAnalyzed: number;
    insightsGenerated: boolean;
    topPerformers: number;
    successFactors: number;
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
 * Verify OUTPUT only - ensure we're analyzing their own content, not mentions
 */
function verifyOutputOnly(scanResults: any, username: string): { verified: boolean; issues: string[]; postsAnalyzed: number; videosFound: number } {
  const issues: string[] = [];
  const posts = scanResults?.extractedContent?.posts || [];
  const videos: string[] = [];
  
  let postsAnalyzed = 0;
  let videosFound = 0;
  
  // Check posts for OUTPUT only
  for (const post of posts) {
    const content = (post.content || '').toLowerCase();
    const author = post.author || '';
    const platform = post.platform || '';
    
    // Check for retweets/shares (should be filtered out)
    if (content.startsWith('rt @') || content.startsWith('retweeting')) {
      issues.push(`Found retweet/share: "${content.substring(0, 50)}..."`);
      continue;
    }
    
    // Check for mentions of others (should be filtered if not from brand)
    if (content.includes('@') && !content.includes(`@${username.toLowerCase()}`)) {
      // This might be okay if it's a reply or mention, but should be minimal
      // Only flag if it's clearly not from the brand
      if (!author.toLowerCase().includes(username.toLowerCase()) && 
          !post.author_id?.toLowerCase().includes(username.toLowerCase())) {
        issues.push(`Possible mention of others: "${content.substring(0, 50)}..."`);
      }
    }
    
    // Check if post has video URLs
    if (post.media_urls && Array.isArray(post.media_urls)) {
      post.media_urls.forEach((url: string) => {
        if (url && (
          url.includes('youtube.com') || url.includes('youtu.be') ||
          url.includes('tiktok.com') || url.includes('instagram.com/reel') ||
          url.includes('facebook.com/watch') || url.includes('vimeo.com') ||
          url.match(/\.(mp4|mov|avi|webm|mkv|m4v)(\?|$)/i)
        )) {
          videos.push(url);
          videosFound++;
        }
      });
    }
    
    postsAnalyzed++;
  }
  
  // Check if we have any posts at all
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
 * Analyze video analysis results
 */
function analyzeVideoAnalysis(scanResults: any): {
  executed: boolean;
  videosAnalyzed: number;
  insightsGenerated: boolean;
  topPerformers: number;
  successFactors: number;
} {
  const videoAnalysis = scanResults?.videoAnalysis;
  
  if (!videoAnalysis) {
    return {
      executed: false,
      videosAnalyzed: 0,
      insightsGenerated: false,
      topPerformers: 0,
      successFactors: 0
    };
  }
  
  const videoInsights = videoAnalysis.videoInsights || [];
  const aggregatedInsights = videoAnalysis.aggregatedInsights || {};
  
  return {
    executed: true,
    videosAnalyzed: videoInsights.length,
    insightsGenerated: videoInsights.length > 0,
    topPerformers: aggregatedInsights.topPerformingVideos?.length || 0,
    successFactors: aggregatedInsights.commonSuccessFactors?.length || 0
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
  
  // Check if competitors have video insights
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
  const scanId = `test_${Date.now()}_${subject.name.replace(/\s+/g, '_').toLowerCase()}`;
  
  console.log(`\n${'='.repeat(80)}`);
  console.log(`Testing: ${subject.name} (${subject.type})`);
  console.log(`Username: ${subject.username}`);
  console.log(`Platforms: ${subject.platforms.join(', ')}`);
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
    videoAnalysis: {
      executed: false,
      videosAnalyzed: 0,
      insightsGenerated: false,
      topPerformers: 0,
      successFactors: 0
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
    
    // Wait for scan to complete (poll status)
    let attempts = 0;
    const maxAttempts = 300; // 5 minutes max (1 second intervals)
    
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
          console.log(`[${subject.name}]   Videos Found: ${result.outputOnly.videosFound}`);
          if (result.outputOnly.issues.length > 0) {
            console.log(`[${subject.name}]   Issues: ${result.outputOnly.issues.length}`);
            result.outputOnly.issues.forEach(issue => console.log(`[${subject.name}]     - ${issue}`));
          }
          
          // Analyze video analysis
          result.videoAnalysis = analyzeVideoAnalysis(currentScan.results);
          console.log(`[${subject.name}] Video Analysis: ${result.videoAnalysis.executed ? '✅ EXECUTED' : '❌ NOT EXECUTED'}`);
          if (result.videoAnalysis.executed) {
            console.log(`[${subject.name}]   Videos Analyzed: ${result.videoAnalysis.videosAnalyzed}`);
            console.log(`[${subject.name}]   Top Performers: ${result.videoAnalysis.topPerformers}`);
            console.log(`[${subject.name}]   Success Factors: ${result.videoAnalysis.successFactors}`);
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
      
      // Wait 1 second before checking again
      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
      
      // Log progress every 30 seconds
      if (attempts % 30 === 0) {
        console.log(`[${subject.name}] ⏳ Still scanning... (${attempts}s elapsed, progress: ${currentScan.progress}%)`);
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
  report.push('5-AGENT VIDEO ANALYSIS TEST REPORT');
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
  
  const totalVideosFound = successful.reduce((sum, r) => sum + r.outputOnly.videosFound, 0);
  const totalVideosAnalyzed = successful.reduce((sum, r) => sum + r.videoAnalysis.videosAnalyzed, 0);
  const outputOnlyPassed = successful.filter(r => r.outputOnly.verified).length;
  const videoAnalysisExecuted = successful.filter(r => r.videoAnalysis.executed).length;
  const competitorsEnriched = successful.filter(r => r.competitorIntelligence.videoInsightsAdded).length;
  
  report.push('SUMMARY STATISTICS');
  report.push('-'.repeat(80));
  report.push(`Average Scan Duration: ${avgDuration.toFixed(2)}s`);
  report.push(`Total Videos Found: ${totalVideosFound}`);
  report.push(`Total Videos Analyzed: ${totalVideosAnalyzed}`);
  report.push(`OUTPUT Only Verification: ${outputOnlyPassed}/${successful.length} passed`);
  report.push(`Video Analysis Executed: ${videoAnalysisExecuted}/${successful.length}`);
  report.push(`Competitors Enriched: ${competitorsEnriched}/${successful.length}`);
  report.push('');
  
  // Detailed results for each subject
  report.push('DETAILED RESULTS');
  report.push('='.repeat(80));
  
  results.forEach((result, index) => {
    report.push(`\n${index + 1}. ${result.subject.name} (${result.subject.type})`);
    report.push('-'.repeat(80));
    report.push(`Status: ${result.success ? '✅ SUCCESS' : '❌ FAILED'}`);
    report.push(`Duration: ${(result.duration / 1000).toFixed(2)}s`);
    report.push(`Platforms: ${result.subject.platforms.join(', ')}`);
    report.push('');
    
    report.push('OUTPUT Only Verification:');
    report.push(`  Verified: ${result.outputOnly.verified ? '✅ YES' : '❌ NO'}`);
    report.push(`  Posts Analyzed: ${result.outputOnly.postsAnalyzed}`);
    report.push(`  Videos Found: ${result.outputOnly.videosFound}`);
    if (result.outputOnly.issues.length > 0) {
      report.push(`  Issues: ${result.outputOnly.issues.length}`);
      result.outputOnly.issues.forEach(issue => report.push(`    - ${issue}`));
    }
    report.push('');
    
    report.push('Video Analysis:');
    report.push(`  Executed: ${result.videoAnalysis.executed ? '✅ YES' : '❌ NO'}`);
    if (result.videoAnalysis.executed) {
      report.push(`  Videos Analyzed: ${result.videoAnalysis.videosAnalyzed}`);
      report.push(`  Insights Generated: ${result.videoAnalysis.insightsGenerated ? '✅ YES' : '❌ NO'}`);
      report.push(`  Top Performers: ${result.videoAnalysis.topPerformers}`);
      report.push(`  Success Factors: ${result.videoAnalysis.successFactors}`);
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
    report.push('   Recommendation: Review OUTPUT validation logic');
  }
  
  if (videoAnalysisExecuted < successful.length) {
    report.push('⚠️  Video Analysis: Not all scans executed video analysis');
    report.push('   Recommendation: Check video extraction and analysis logic');
  }
  
  if (competitorsEnriched < successful.length) {
    report.push('⚠️  Competitor Enrichment: Not all competitors enriched with video insights');
    report.push('   Recommendation: Verify video insights are being added to competitors');
  }
  
  if (totalVideosFound === 0) {
    report.push('⚠️  No videos found in any scans');
    report.push('   Recommendation: Check video URL detection logic');
  }
  
  report.push('\n' + '='.repeat(80));
  
  return report.join('\n');
}

/**
 * Main test execution
 */
async function runTests() {
  console.log('\n🚀 Starting 5-Agent Video Analysis Test');
  console.log(`Testing ${TEST_SUBJECTS.length} subjects (creators and companies)`);
  console.log('CRITICAL: Only analyzing OUTPUT (their own content), not mentions/retweets\n');
  
  // Run tests sequentially to avoid overwhelming the system
  for (const subject of TEST_SUBJECTS) {
    const result = await runTestScan(subject);
    results.push(result);
    
    // Wait a bit between tests to avoid rate limiting
    if (subject !== TEST_SUBJECTS[TEST_SUBJECTS.length - 1]) {
      console.log('\n⏸️  Waiting 5 seconds before next test...\n');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
  
  // Generate and save report
  const report = generateReport(results);
  console.log(report);
  
  // Save report to file
  const reportPath = path.join(__dirname, `../test-reports/video-analysis-test-${Date.now()}.txt`);
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

