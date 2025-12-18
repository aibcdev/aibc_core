/**
 * API Documentation Routes
 * Provides comprehensive API documentation with examples
 */

import express from 'express';

const router = express.Router();

/**
 * GET /api/docs
 * Get comprehensive API documentation
 */
router.get('/', (req, res) => {
  res.json({
    title: 'AIBC Media API Documentation',
    version: '1.0.0',
    baseUrl: process.env.API_BASE_URL || 'https://api.aibcmedia.com',
    description: 'AIBC Media API for content generation, brand DNA extraction, and content management',
    authentication: {
      type: 'Bearer Token',
      header: 'Authorization: Bearer <token>',
      howToGet: 'Sign up at https://aibcmedia.com to get your API token',
    },
    rateLimits: {
      free: '100 requests/hour',
      pro: '1000 requests/hour',
      enterprise: '10000 requests/hour',
    },
    endpoints: {
      scan: {
        start: {
          method: 'POST',
          path: '/api/scan/start',
          description: 'Start a digital footprint scan',
          requestBody: {
            username: 'string (required) - Username or domain to scan',
            platforms: 'array (required) - Platforms to scan: ["twitter", "youtube", "linkedin", "instagram"]',
            scanType: 'string (optional) - "standard" or "deep"',
            connectedAccounts: 'object (optional) - Connected account credentials',
          },
          example: {
            username: 'elonmusk',
            platforms: ['twitter', 'youtube'],
            scanType: 'standard',
          },
          response: {
            success: true,
            scanId: 'scan_1234567890_abc123',
            message: 'Scan started successfully',
          },
        },
        status: {
          method: 'GET',
          path: '/api/scan/:id/status',
          description: 'Get scan status and progress',
          response: {
            success: true,
            scan: {
              id: 'scan_1234567890_abc123',
              status: 'scanning',
              progress: 45,
              logs: ['[SYSTEM] Initializing...'],
            },
          },
        },
        results: {
          method: 'GET',
          path: '/api/scan/:id/results',
          description: 'Get scan results (only when status is "complete")',
          response: {
            success: true,
            data: {
              extractedContent: {
                posts: [],
                content_themes: [],
              },
              brandDNA: {
                voice: {},
                archetype: 'The Creator',
              },
              strategicInsights: [],
              competitorIntelligence: [],
            },
          },
        },
        latest: {
          method: 'GET',
          path: '/api/scan/user/:username/latest',
          description: 'Get latest scan results for a username',
        },
      },
      content: {
        generate: {
          method: 'POST',
          path: '/api/blog/generate',
          description: 'Generate SEO-optimized blog post',
          requestBody: {
            keyword: 'string (required) - Primary keyword',
            template_type: 'string (optional) - "how-to", "list", "guide", "comparison", "case-study", "tools"',
            category: 'string (optional) - Content category',
            target_word_count: 'number (optional) - Target word count, default 2000',
          },
          example: {
            keyword: 'content marketing',
            template_type: 'how-to',
            category: 'Content Marketing',
            target_word_count: 2000,
          },
        },
        list: {
          method: 'GET',
          path: '/api/blog',
          description: 'List blog posts with filtering',
          queryParams: {
            page: 'number (optional) - Page number, default 1',
            limit: 'number (optional) - Items per page, default 10',
            category: 'string (optional) - Filter by category',
            tag: 'string (optional) - Filter by tag',
            status: 'string (optional) - Filter by status: "draft", "published", "scheduled"',
            search: 'string (optional) - Search in title and content',
          },
        },
      },
      enterprise: {
        sso: {
          register: {
            method: 'POST',
            path: '/api/enterprise/sso/register',
            description: 'Register SSO configuration for organization',
            requestBody: {
              organizationId: 'string (required)',
              config: {
                provider: 'string (required) - "saml", "google-workspace", "azure-ad", "okta"',
                entityId: 'string (optional) - SAML Entity ID',
                ssoUrl: 'string (optional) - SAML SSO URL',
                clientId: 'string (optional) - OAuth client ID',
                clientSecret: 'string (optional) - OAuth client secret',
                tenantId: 'string (optional) - Azure AD tenant ID',
                domain: 'string (optional) - Domain restriction',
              },
            },
          },
          initiate: {
            method: 'GET',
            path: '/api/enterprise/sso/initiate/:organizationId',
            description: 'Initiate SSO flow',
            queryParams: {
              redirectUri: 'string (required for OAuth) - OAuth redirect URI',
            },
          },
        },
      },
      integrations: {
        slack: {
          method: 'POST',
          path: '/api/integrations/slack/webhook',
          description: 'Slack webhook endpoint for notifications',
        },
        square: {
          method: 'POST',
          path: '/api/integrations/square/sync',
          description: 'Sync Square payment data',
        },
        linkedin: {
          method: 'POST',
          path: '/api/integrations/linkedin/publish',
          description: 'Publish content to LinkedIn',
        },
      },
    },
    codeExamples: {
      javascript: {
        scan: `
// Start a scan
const response = await fetch('https://api.aibcmedia.com/api/scan/start', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_TOKEN'
  },
  body: JSON.stringify({
    username: 'elonmusk',
    platforms: ['twitter', 'youtube'],
    scanType: 'standard'
  })
});

const { scanId } = await response.json();

// Poll for status
const statusResponse = await fetch(\`https://api.aibcmedia.com/api/scan/\${scanId}/status\`, {
  headers: {
    'Authorization': 'Bearer YOUR_API_TOKEN'
  }
});

const { scan } = await statusResponse.json();
console.log('Scan status:', scan.status, 'Progress:', scan.progress);
        `,
        generateContent: `
// Generate blog post
const response = await fetch('https://api.aibcmedia.com/api/blog/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_TOKEN'
  },
  body: JSON.stringify({
    keyword: 'content marketing',
    template_type: 'how-to',
    target_word_count: 2000
  })
});

const { post } = await response.json();
console.log('Generated post:', post.title);
        `,
      },
      python: {
        scan: `
import requests

# Start a scan
response = requests.post(
    'https://api.aibcmedia.com/api/scan/start',
    headers={
        'Authorization': 'Bearer YOUR_API_TOKEN',
        'Content-Type': 'application/json'
    },
    json={
        'username': 'elonmusk',
        'platforms': ['twitter', 'youtube'],
        'scanType': 'standard'
    }
)

scan_id = response.json()['scanId']

# Poll for status
status_response = requests.get(
    f'https://api.aibcmedia.com/api/scan/{scan_id}/status',
    headers={'Authorization': 'Bearer YOUR_API_TOKEN'}
)

scan = status_response.json()['scan']
print(f"Status: {scan['status']}, Progress: {scan['progress']}%")
        `,
      },
      curl: {
        scan: `
# Start a scan
curl -X POST https://api.aibcmedia.com/api/scan/start \\
  -H "Authorization: Bearer YOUR_API_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "username": "elonmusk",
    "platforms": ["twitter", "youtube"],
    "scanType": "standard"
  }'

# Get scan status
curl https://api.aibcmedia.com/api/scan/SCAN_ID/status \\
  -H "Authorization: Bearer YOUR_API_TOKEN"
        `,
      },
    },
    errorCodes: {
      400: 'Bad Request - Invalid request parameters',
      401: 'Unauthorized - Invalid or missing API token',
      403: 'Forbidden - Insufficient permissions',
      404: 'Not Found - Resource not found',
      429: 'Too Many Requests - Rate limit exceeded',
      500: 'Internal Server Error - Server error occurred',
      503: 'Service Unavailable - Service temporarily unavailable',
    },
    webhooks: {
      scanComplete: {
        description: 'Webhook fired when scan completes',
        url: 'POST to your webhook URL',
        payload: {
          scanId: 'string',
          username: 'string',
          status: 'complete',
          results: 'object',
        },
      },
    },
    sdk: {
      javascript: 'npm install @aibcmedia/api-client',
      python: 'pip install aibcmedia-api',
      go: 'go get github.com/aibcmedia/api-go',
    },
    support: {
      email: 'api@aibcmedia.com',
      documentation: 'https://docs.aibcmedia.com',
      status: 'https://status.aibcmedia.com',
    },
  });
});

/**
 * GET /api/docs/openapi
 * Get OpenAPI/Swagger specification
 */
router.get('/openapi', (req, res) => {
  res.json({
    openapi: '3.0.0',
    info: {
      title: 'AIBC Media API',
      version: '1.0.0',
      description: 'AIBC Media API for content generation and brand DNA extraction',
    },
    servers: [
      {
        url: process.env.API_BASE_URL || 'https://api.aibcmedia.com',
        description: 'Production server',
      },
    ],
    paths: {
      '/api/scan/start': {
        post: {
          summary: 'Start a digital footprint scan',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['username', 'platforms'],
                  properties: {
                    username: { type: 'string' },
                    platforms: { type: 'array', items: { type: 'string' } },
                    scanType: { type: 'string', enum: ['standard', 'deep'] },
                  },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Scan started successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      scanId: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });
});

export default router;
