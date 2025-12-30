/**
 * Poster Agent
 * SIMPLIFIED: Storage only (Notion DB) - NO posting/distribution
 * Focus: Content storage for reference
 */

interface PosterContext {
  content?: any;
  databaseId?: string;
  brandId?: string;
}

/**
 * Poster Agent implementation
 */
export const posterAgent = {
  /**
   * Execute poster task
   * SIMPLIFIED: Only storage tasks
   */
  async execute(task: string, context: PosterContext): Promise<any> {
    console.log(`[Poster Agent] Executing task: ${task}`);

    switch (task) {
      case 'store-in-notion':
        return await storeInNotion(context);
      default:
        throw new Error(`Unknown poster task: ${task}`);
    }
  },
};

/**
 * Store content in Notion database (for reference only)
 */
async function storeInNotion(context: PosterContext): Promise<any> {
  const { content, databaseId } = context;

  if (!content) {
    throw new Error('Content required');
  }

  // Check if Notion is configured
  if (!process.env.NOTION_API_KEY) {
    console.warn('[Poster Agent] Notion not configured, skipping');
    return {
      success: false,
      message: 'Notion not configured',
      content,
    };
  }

  try {
    const notionDatabaseId = databaseId || process.env.NOTION_DATABASE_ID;
    if (!notionDatabaseId) {
      throw new Error('Notion database ID required');
    }

    // Notion API integration - return error if not properly configured
    console.log('[Poster Agent] Notion integration not fully configured');
    
    // Return error instead of mock data
    return {
      success: false,
      error: 'Notion integration not configured. Please set up Notion API credentials.',
      pageId: `notion_${Date.now()}`,
      databaseId: notionDatabaseId,
      content,
      storedAt: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error('[Poster Agent] Notion storage error:', error);
    throw error;
  }
}
