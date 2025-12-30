/**
 * Helper Agent
 * SIMPLIFIED: Focuses on content delivery only (no email/Slack/Calendar)
 * Delivers reviewed content to Content Hub
 */

interface HelperContext {
  reviewedContent?: any;
  contentHubItem?: any;
}

/**
 * Helper Agent implementation
 */
export const helperAgent = {
  /**
   * Execute helper task
   * SIMPLIFIED: Only content delivery tasks
   */
  async execute(task: string, context: HelperContext): Promise<any> {
    console.log(`[Helper Agent] Executing task: ${task}`);

    switch (task) {
      case 'send-to-content-hub':
        return await sendToContentHub(context);
      default:
        throw new Error(`Unknown helper task: ${task}`);
    }
  },
};

/**
 * Send reviewed content to Content Hub for company review
 * Note: This runs on backend, so we store in a way Content Hub can access
 */
async function sendToContentHub(context: HelperContext): Promise<any> {
  const { reviewedContent } = context as any;

  console.log(`[Helper Agent] ========================================`);
  console.log(`[Helper Agent] sendToContentHub called`);
  console.log(`[Helper Agent] Has reviewedContent: ${!!reviewedContent}`);
  console.log(`[Helper Agent] Type: ${Array.isArray(reviewedContent) ? 'array' : typeof reviewedContent}`);

  if (!reviewedContent) {
    console.error(`[Helper Agent] ❌ ERROR: Reviewed content required`);
    throw new Error('Reviewed content required');
  }

  try {
    // Handle both single content item and array of content ideas
    const contentItems = Array.isArray(reviewedContent) ? reviewedContent : [reviewedContent];
    
    const contentHubItems = contentItems.map((content: any, index: number) => ({
      id: `reviewed_${Date.now()}_${index}`,
      content: {
        title: content.title || content.text?.substring(0, 50) || 'Reviewed Content',
        description: content.description || content.text,
        text: content.text || content.description,
        platform: content.platform || 'twitter',
        type: content.type || 'document',
        theme: content.theme,
        imageUrl: content.imageUrl || content.mediaUrl,
        videoUrl: content.videoUrl,
        ...content,
      },
      status: 'reviewed', // Ready for company review before calendar
      reviewedAt: new Date().toISOString(),
      qualityScore: content.qualityScore || reviewedContent.qualityScore || 100,
      approved: content.approved !== false && reviewedContent.approved !== false,
      source: 'n8n-workflow',
      reviewIssues: content.reviewIssues || [],
      reviewImprovements: content.reviewImprovements || [],
    }));

    // Store in file for Content Hub API to access
    const fs = require('fs');
    const path = require('path');
    const contentHubPath = path.join(__dirname, '../../.content-hub-reviewed.json');
    
    console.log(`[Helper Agent] Content Hub path: ${contentHubPath}`);
    console.log(`[Helper Agent] Creating ${contentHubItems.length} content item(s)`);
    
    const existing = fs.existsSync(contentHubPath) 
      ? JSON.parse(fs.readFileSync(contentHubPath, 'utf8') || '[]')
      : [];
    
    console.log(`[Helper Agent] Existing items: ${existing.length}`);
    existing.push(...contentHubItems);
    
    // Keep only last 100 items
    const recentItems = existing.slice(-100);
    
    try {
      fs.writeFileSync(contentHubPath, JSON.stringify(recentItems, null, 2));
      console.log(`[Helper Agent] ✅ Successfully wrote ${recentItems.length} items to Content Hub file`);
      console.log(`[Helper Agent] File exists: ${fs.existsSync(contentHubPath)}`);
    } catch (writeError: any) {
      console.error(`[Helper Agent] ❌ ERROR writing file:`, writeError.message);
      throw writeError;
    }

    console.log(`[Helper Agent] ✅ Sent ${contentHubItems.length} reviewed content items to Content Hub`);
    console.log(`[Helper Agent] ========================================`);

    return {
      success: true,
      contentHubItems,
      totalItems: contentHubItems.length,
      status: 'ready-for-review',
      sentAt: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error('[Helper Agent] Content Hub send error:', error);
    throw error;
  }
}
