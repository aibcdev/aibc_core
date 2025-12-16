/**
 * Enterprise SSO Service
 * Supports SAML 2.0 and OAuth 2.0 for enterprise customers
 */

import { OAuth2Client } from 'google-auth-library';
import crypto from 'crypto';

export interface SSOConfig {
  provider: 'saml' | 'google-workspace' | 'azure-ad' | 'okta';
  entityId?: string; // SAML Entity ID
  ssoUrl?: string; // SAML SSO URL
  certificate?: string; // SAML certificate
  clientId?: string; // OAuth client ID
  clientSecret?: string; // OAuth client secret
  tenantId?: string; // Azure AD tenant ID
  domain?: string; // Domain for domain-based SSO
}

export interface SSOUser {
  id: string;
  email: string;
  name?: string;
  groups?: string[];
  roles?: string[];
  domain?: string;
}

/**
 * Enterprise SSO configurations (stored per organization)
 */
const enterpriseSSOConfigs: Map<string, SSOConfig> = new Map();

/**
 * Register enterprise SSO configuration
 */
export function registerEnterpriseSSO(
  organizationId: string,
  config: SSOConfig
): void {
  enterpriseSSOConfigs.set(organizationId, config);
  console.log(`[Enterprise SSO] Registered SSO for organization: ${organizationId}, provider: ${config.provider}`);
}

/**
 * Get enterprise SSO configuration
 */
export function getEnterpriseSSOConfig(organizationId: string): SSOConfig | undefined {
  return enterpriseSSOConfigs.get(organizationId);
}

/**
 * Initiate SAML SSO flow
 */
export function initiateSAMLSso(organizationId: string, relayState?: string): {
  ssoUrl: string;
  samlRequest: string;
  relayState: string;
} {
  const config = enterpriseSSOConfigs.get(organizationId);
  if (!config || config.provider !== 'saml' || !config.ssoUrl) {
    throw new Error('SAML SSO not configured for this organization');
  }

  // Generate SAML AuthnRequest
  const requestId = `_${crypto.randomBytes(16).toString('hex')}`;
  const issueInstant = new Date().toISOString();
  
  const samlRequest = Buffer.from(`
    <samlp:AuthnRequest xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
                        xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion"
                        ID="${requestId}"
                        Version="2.0"
                        IssueInstant="${issueInstant}"
                        AssertionConsumerServiceURL="${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/saml/callback"
                        ProtocolBinding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST">
      <saml:Issuer>${config.entityId || 'aibc-media'}</saml:Issuer>
    </samlp:AuthnRequest>
  `).toString('base64');

  return {
    ssoUrl: config.ssoUrl,
    samlRequest,
    relayState: relayState || crypto.randomBytes(16).toString('hex'),
  };
}

/**
 * Process SAML response
 */
export function processSAMLResponse(
  samlResponse: string,
  organizationId: string
): SSOUser {
  const config = enterpriseSSOConfigs.get(organizationId);
  if (!config || config.provider !== 'saml') {
    throw new Error('SAML SSO not configured');
  }

  // In production, use a proper SAML library like 'samlify' or 'passport-saml'
  // This is a simplified version for demonstration
  try {
    const decoded = Buffer.from(samlResponse, 'base64').toString('utf-8');
    
    // Extract email from SAML response (simplified - use proper XML parsing in production)
    const emailMatch = decoded.match(/<saml:Attribute Name="email">.*?<saml:AttributeValue>(.*?)<\/saml:AttributeValue>/s);
    const nameMatch = decoded.match(/<saml:Attribute Name="name">.*?<saml:AttributeValue>(.*?)<\/saml:AttributeValue>/s);
    
    if (!emailMatch) {
      throw new Error('Email not found in SAML response');
    }

    return {
      id: `saml_${crypto.createHash('sha256').update(emailMatch[1]).digest('hex').substring(0, 16)}`,
      email: emailMatch[1],
      name: nameMatch ? nameMatch[1] : undefined,
      domain: emailMatch[1].split('@')[1],
    };
  } catch (error: any) {
    throw new Error(`Failed to process SAML response: ${error.message}`);
  }
}

/**
 * Initiate Google Workspace SSO
 */
export async function initiateGoogleWorkspaceSSO(
  organizationId: string,
  redirectUri: string
): Promise<string> {
  const config = enterpriseSSOConfigs.get(organizationId);
  if (!config || config.provider !== 'google-workspace' || !config.clientId) {
    throw new Error('Google Workspace SSO not configured');
  }

  const oauth2Client = new OAuth2Client(
    config.clientId,
    config.clientSecret,
    redirectUri
  );

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ],
    prompt: 'consent',
    hd: config.domain, // Hosted domain restriction
  });

  return authUrl;
}

/**
 * Process Google Workspace OAuth callback
 */
export async function processGoogleWorkspaceCallback(
  code: string,
  organizationId: string,
  redirectUri: string
): Promise<SSOUser> {
  const config = enterpriseSSOConfigs.get(organizationId);
  if (!config || config.provider !== 'google-workspace' || !config.clientId) {
    throw new Error('Google Workspace SSO not configured');
  }

  const oauth2Client = new OAuth2Client(
    config.clientId,
    config.clientSecret,
    redirectUri
  );

  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  const ticket = await oauth2Client.verifyIdToken({
    idToken: tokens.id_token!,
    audience: config.clientId,
  });

  const payload = ticket.getPayload();
  if (!payload) {
    throw new Error('Invalid token payload');
  }

  // Verify domain if configured
  if (config.domain && payload.hd !== config.domain) {
    throw new Error(`User domain ${payload.hd} does not match required domain ${config.domain}`);
  }

  return {
    id: `google_workspace_${payload.sub}`,
    email: payload.email!,
    name: payload.name,
    domain: payload.hd || payload.email!.split('@')[1],
  };
}

/**
 * Initiate Azure AD SSO
 */
export async function initiateAzureADSSO(
  organizationId: string,
  redirectUri: string
): Promise<string> {
  const config = enterpriseSSOConfigs.get(organizationId);
  if (!config || config.provider !== 'azure-ad' || !config.tenantId || !config.clientId) {
    throw new Error('Azure AD SSO not configured');
  }

  const authUrl = `https://login.microsoftonline.com/${config.tenantId}/oauth2/v2.0/authorize?` +
    `client_id=${config.clientId}` +
    `&response_type=code` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_mode=query` +
    `&scope=openid profile email` +
    `&state=${crypto.randomBytes(16).toString('hex')}`;

  return authUrl;
}

/**
 * Process Azure AD OAuth callback
 */
export async function processAzureADCallback(
  code: string,
  organizationId: string,
  redirectUri: string
): Promise<SSOUser> {
  const config = enterpriseSSOConfigs.get(organizationId);
  if (!config || config.provider !== 'azure-ad' || !config.tenantId || !config.clientId || !config.clientSecret) {
    throw new Error('Azure AD SSO not configured');
  }

  // Exchange code for token
  const tokenResponse = await fetch(
    `https://login.microsoftonline.com/${config.tenantId}/oauth2/v2.0/token`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret!,
        code,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    }
  );

  const tokens = await tokenResponse.json() as { error?: string; error_description?: string; access_token?: string };
  if (tokens.error) {
    throw new Error(`Azure AD token exchange failed: ${tokens.error_description}`);
  }

  // Get user info
  const userResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
    headers: {
      Authorization: `Bearer ${tokens.access_token}`,
    },
  });

  const userInfo = await userResponse.json() as { id?: string; mail?: string; userPrincipalName?: string; displayName?: string };

  const email = userInfo.mail || userInfo.userPrincipalName || '';
  return {
    id: `azure_ad_${userInfo.id || ''}`,
    email: email,
    name: userInfo.displayName || '',
    domain: email.split('@')[1] || '',
  };
}

/**
 * Check if organization has SSO enabled
 */
export function hasSSOEnabled(organizationId: string): boolean {
  return enterpriseSSOConfigs.has(organizationId);
}

/**
 * Get SSO provider for organization
 */
export function getSSOProvider(organizationId: string): string | null {
  const config = enterpriseSSOConfigs.get(organizationId);
  return config ? config.provider : null;
}

