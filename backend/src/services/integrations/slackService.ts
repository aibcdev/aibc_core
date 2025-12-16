/**
 * Slack Integration Service
 * Handles Slack app integration for notifications and workflows
 */

export interface SlackConfig {
  workspaceId: string;
  teamId: string;
  accessToken: string;
  botToken?: string;
  webhookUrl?: string;
  channelId?: string;
}

const slackConfigs: Map<string, SlackConfig> = new Map();

/**
 * Register Slack integration for a user/organization
 */
export function registerSlackIntegration(
  userId: string,
  config: SlackConfig
): void {
  slackConfigs.set(userId, config);
  console.log(`[Slack] Registered integration for user: ${userId}, workspace: ${config.workspaceId}`);
}

/**
 * Get Slack configuration
 */
export function getSlackConfig(userId: string): SlackConfig | undefined {
  return slackConfigs.get(userId);
}

/**
 * Send notification to Slack channel
 */
export async function sendSlackNotification(
  userId: string,
  message: string,
  options?: {
    channel?: string;
    threadTs?: string;
    blocks?: any[];
  }
): Promise<boolean> {
  const config = slackConfigs.get(userId);
  if (!config) {
    throw new Error('Slack integration not configured');
  }

  const channel = options?.channel || config.channelId || '#general';
  const url = config.webhookUrl || `https://slack.com/api/chat.postMessage`;

  try {
    if (config.webhookUrl) {
      // Use webhook (simpler, no auth needed)
      const response = await fetch(config.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: message,
          channel,
          thread_ts: options?.threadTs,
          blocks: options?.blocks,
        }),
      });
      return response.ok;
    } else {
      // Use API with bot token
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.botToken || config.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channel,
          text: message,
          thread_ts: options?.threadTs,
          blocks: options?.blocks,
        }),
      });

      const data = await response.json() as { ok?: boolean };
      return data.ok === true;
    }
  } catch (error) {
    console.error('[Slack] Notification error:', error);
    return false;
  }
}

/**
 * Send scan completion notification
 */
export async function notifyScanComplete(
  userId: string,
  scanData: {
    username: string;
    scanId: string;
    brandDNA?: any;
    insightsCount?: number;
  }
): Promise<void> {
  const message = `✅ Digital footprint scan completed for *${scanData.username}*\n` +
    `Scan ID: \`${scanData.scanId}\`\n` +
    (scanData.insightsCount ? `Generated ${scanData.insightsCount} strategic insights\n` : '') +
    `View results: ${process.env.FRONTEND_URL || 'https://aibcmedia.com'}/dashboard`;

  const blocks = [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `✅ *Scan Complete*\n*Brand:* ${scanData.username}\n*Scan ID:* \`${scanData.scanId}\``,
      },
    },
  ];

  if (scanData.brandDNA?.archetype) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Brand Archetype:* ${scanData.brandDNA.archetype}`,
      },
    });
  }

  await sendSlackNotification(userId, message, { blocks });
}

/**
 * Send content generation notification
 */
export async function notifyContentGenerated(
  userId: string,
  contentData: {
    type: string;
    platform: string;
    title: string;
    url?: string;
  }
): Promise<void> {
  const message = `📝 New ${contentData.type} content generated for *${contentData.platform}*\n` +
    `*${contentData.title}*` +
    (contentData.url ? `\n${contentData.url}` : '');

  await sendSlackNotification(userId, message);
}

/**
 * Create Slack workflow trigger
 */
export async function triggerSlackWorkflow(
  userId: string,
  workflowId: string,
  inputs: Record<string, any>
): Promise<boolean> {
  const config = slackConfigs.get(userId);
  if (!config) {
    throw new Error('Slack integration not configured');
  }

  try {
    const response = await fetch(`https://slack.com/api/workflows.triggers.execute`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        workflow: {
          trigger: {
            url: workflowId,
          },
        },
        inputs,
      }),
    });

    const data = await response.json() as { ok?: boolean };
    return data.ok === true;
  } catch (error) {
    console.error('[Slack] Workflow trigger error:', error);
    return false;
  }
}

/**
 * Check if Slack is connected for user
 */
export function isSlackConnected(userId: string): boolean {
  return slackConfigs.has(userId);
}

