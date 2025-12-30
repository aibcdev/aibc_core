/**
 * n8n Integration Service
 * Handles communication between AIBC backend and n8n workflows
 */

interface N8nWorkflowTrigger {
  workflowId: string;
  data: any;
  webhookId?: string;
}

interface N8nWebhookPayload {
  webhookId: string;
  payload: any;
  headers?: Record<string, string>;
}

interface AgentCallback {
  agentId: string;
  callbackUrl: string;
  workflowId?: string;
}

interface WorkflowStatus {
  workflowId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: any;
  error?: string;
}

// In-memory storage for workflow status and callbacks
const workflowStatuses = new Map<string, WorkflowStatus>();
const agentCallbacks = new Map<string, AgentCallback>();

/**
 * Trigger an n8n workflow from the backend
 */
export async function triggerN8nWorkflow(
  workflowId: string,
  data: any,
  webhookId?: string
): Promise<{ success: boolean; executionId?: string; error?: string }> {
  const n8nBaseUrl = process.env.N8N_BASE_URL || 'http://localhost:5678';
  const n8nApiKey = process.env.N8N_API_KEY;

  try {
    // Register workflow status
    workflowStatuses.set(workflowId, {
      workflowId,
      status: 'pending',
    });

    // If webhookId is provided, use webhook trigger
    if (webhookId) {
      const webhookUrl = `${n8nBaseUrl}/webhook/${webhookId}`;
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(n8nApiKey && { 'X-N8N-API-KEY': n8nApiKey }),
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.text();
        workflowStatuses.set(workflowId, {
          workflowId,
          status: 'failed',
          error: `Webhook trigger failed: ${error}`,
        });
        return { success: false, error: `Webhook trigger failed: ${error}` };
      }

      const result = await response.json() as any;
      workflowStatuses.set(workflowId, {
        workflowId,
        status: 'running',
        result: result,
      });

      return { success: true, executionId: result.executionId || webhookId };
    }

    // Otherwise, use API to trigger workflow by ID
    const apiUrl = `${n8nBaseUrl}/api/v1/workflows/${workflowId}/activate`;
    
    // First, ensure workflow is active
    const activateResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(n8nApiKey && { 'X-N8N-API-KEY': n8nApiKey }),
      },
    });

    if (!activateResponse.ok) {
      const error = await activateResponse.text();
      workflowStatuses.set(workflowId, {
        workflowId,
        status: 'failed',
        error: `Workflow activation failed: ${error}`,
      });
      return { success: false, error: `Workflow activation failed: ${error}` };
    }

    // Trigger workflow execution
    const executeUrl = `${n8nBaseUrl}/api/v1/workflows/${workflowId}/execute`;
    const executeResponse = await fetch(executeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(n8nApiKey && { 'X-N8N-API-KEY': n8nApiKey }),
      },
      body: JSON.stringify({ data }),
    });

    if (!executeResponse.ok) {
      const error = await executeResponse.text();
      workflowStatuses.set(workflowId, {
        workflowId,
        status: 'failed',
        error: `Workflow execution failed: ${error}`,
      });
      return { success: false, error: `Workflow execution failed: ${error}` };
    }

    const result = await executeResponse.json() as any;
    workflowStatuses.set(workflowId, {
      workflowId,
      status: 'running',
      result: result,
    });

    return { success: true, executionId: result.executionId || workflowId };
  } catch (error: any) {
    workflowStatuses.set(workflowId, {
      workflowId,
      status: 'failed',
      error: error.message || 'Unknown error',
    });
    console.error('Error triggering n8n workflow:', error);
    return { success: false, error: error.message || 'Unknown error' };
  }
}

/**
 * Handle incoming webhook from n8n
 */
export async function handleN8nWebhook(
  webhookId: string,
  payload: any,
  headers?: Record<string, string>
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    // Store webhook payload for processing
    // In a real implementation, this would route to appropriate agent handlers
    
    console.log(`[n8n] Received webhook ${webhookId}:`, payload);
    
    // Check if there's a registered callback for this webhook
    const callback = agentCallbacks.get(webhookId);
    if (callback) {
      // Forward to registered callback
      try {
        const response = await fetch(callback.callbackUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            webhookId,
            payload,
            headers,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          return { success: true, data: result };
        }
      } catch (error: any) {
        console.error(`Error forwarding webhook to callback:`, error);
      }
    }

    return { success: true, data: payload };
  } catch (error: any) {
    console.error('Error handling n8n webhook:', error);
    return { success: false, error: error.message || 'Unknown error' };
  }
}

/**
 * Register a callback URL for agent completion
 */
export function registerAgentCallback(
  agentId: string,
  callbackUrl: string,
  workflowId?: string
): void {
  agentCallbacks.set(agentId, {
    agentId,
    callbackUrl,
    workflowId,
  });
  console.log(`[n8n] Registered callback for agent ${agentId}: ${callbackUrl}`);
}

/**
 * Get workflow status
 */
export function getWorkflowStatus(workflowId: string): WorkflowStatus | null {
  return workflowStatuses.get(workflowId) || null;
}

/**
 * Update workflow status
 */
export function updateWorkflowStatus(
  workflowId: string,
  status: WorkflowStatus['status'],
  result?: any,
  error?: string
): void {
  const current = workflowStatuses.get(workflowId);
  workflowStatuses.set(workflowId, {
    workflowId,
    status,
    result: result || current?.result,
    error: error || current?.error,
  });
}

/**
 * Send agent result back to n8n workflow
 */
export async function sendAgentResultToN8n(
  workflowId: string,
  agentId: string,
  result: any,
  success: boolean = true
): Promise<{ success: boolean; error?: string }> {
  const n8nBaseUrl = process.env.N8N_BASE_URL || 'http://localhost:5678';
  const callbackUrl = process.env.N8N_CALLBACK_URL;

  if (!callbackUrl) {
    console.warn('[n8n] N8N_CALLBACK_URL not set, cannot send agent result');
    return { success: false, error: 'N8N_CALLBACK_URL not configured' };
  }

  try {
    const response = await fetch(callbackUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        workflowId,
        agentId,
        result,
        success,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Callback failed: ${error}` };
    }

    updateWorkflowStatus(workflowId, success ? 'completed' : 'failed', result);
    return { success: true };
  } catch (error: any) {
    console.error('Error sending agent result to n8n:', error);
    return { success: false, error: error.message || 'Unknown error' };
  }
}

/**
 * Check if n8n is configured
 */
export function isN8nConfigured(): boolean {
  return !!(process.env.N8N_BASE_URL || process.env.N8N_WEBHOOK_URL);
}

