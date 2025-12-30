/**
 * Enterprise SSO Routes
 */

import express from 'express';
import {
  registerEnterpriseSSO,
  initiateSAMLSso,
  processSAMLResponse,
  initiateGoogleWorkspaceSSO,
  processGoogleWorkspaceCallback,
  initiateAzureADSSO,
  processAzureADCallback,
  hasSSOEnabled,
  getSSOProvider,
} from '../services/enterpriseSSOService';

const router = express.Router();

/**
 * POST /api/enterprise/sso/register
 * Register SSO configuration for an organization
 */
router.post('/register', async (req, res) => {
  try {
    const { organizationId, config } = req.body;

    if (!organizationId || !config || !config.provider) {
      return res.status(400).json({ error: 'Organization ID and SSO config required' });
    }

    registerEnterpriseSSO(organizationId, config);

    res.json({
      success: true,
      message: 'SSO configuration registered successfully',
    });
  } catch (error: any) {
    console.error('SSO registration error:', error);
    res.status(500).json({ error: error.message || 'Failed to register SSO' });
  }
});

/**
 * GET /api/enterprise/sso/initiate/:organizationId
 * Initiate SSO flow
 */
router.get('/initiate/:organizationId', async (req, res) => {
  try {
    const { organizationId } = req.params;
    const { provider, redirectUri } = req.query;

    if (!hasSSOEnabled(organizationId)) {
      return res.status(404).json({ error: 'SSO not configured for this organization' });
    }

    const ssoProvider = getSSOProvider(organizationId);

    if (ssoProvider === 'saml') {
      const { ssoUrl, samlRequest, relayState } = initiateSAMLSso(organizationId);
      return res.json({
        success: true,
        ssoUrl,
        samlRequest,
        relayState,
        method: 'POST', // SAML uses POST
      });
    } else if (ssoProvider === 'google-workspace') {
      if (!redirectUri) {
        return res.status(400).json({ error: 'Redirect URI required for Google Workspace SSO' });
      }
      const authUrl = await initiateGoogleWorkspaceSSO(organizationId, redirectUri as string);
      return res.json({
        success: true,
        authUrl,
        method: 'redirect',
      });
    } else if (ssoProvider === 'azure-ad') {
      if (!redirectUri) {
        return res.status(400).json({ error: 'Redirect URI required for Azure AD SSO' });
      }
      const authUrl = await initiateAzureADSSO(organizationId, redirectUri as string);
      return res.json({
        success: true,
        authUrl,
        method: 'redirect',
      });
    }

    res.status(400).json({ error: 'Unsupported SSO provider' });
  } catch (error: any) {
    console.error('SSO initiation error:', error);
    res.status(500).json({ error: error.message || 'Failed to initiate SSO' });
  }
});

/**
 * POST /api/enterprise/sso/saml/callback
 * Handle SAML response
 */
router.post('/saml/callback', async (req, res) => {
  try {
    const { SAMLResponse, RelayState, organizationId } = req.body;

    if (!SAMLResponse || !organizationId) {
      return res.status(400).json({ error: 'SAMLResponse and organizationId required' });
    }

    const user = processSAMLResponse(SAMLResponse, organizationId);

    // Generate session token
    const token = `sso_${Date.now()}_${crypto.randomBytes(16).toString('hex')}`;

    res.json({
      success: true,
      token,
      user,
      relayState: RelayState,
    });
  } catch (error: any) {
    console.error('SAML callback error:', error);
    res.status(401).json({ error: error.message || 'SAML authentication failed' });
  }
});

/**
 * GET /api/enterprise/sso/google-workspace/callback
 * Handle Google Workspace OAuth callback
 */
router.get('/google-workspace/callback', async (req, res) => {
  try {
    const { code, state, organizationId } = req.query;

    if (!code || !organizationId) {
      return res.status(400).json({ error: 'Code and organizationId required' });
    }

    const redirectUri = `${req.protocol}://${req.get('host')}/api/enterprise/sso/google-workspace/callback`;
    const user = await processGoogleWorkspaceCallback(
      code as string,
      organizationId as string,
      redirectUri
    );

    // Generate session token
    const token = `sso_${Date.now()}_${crypto.randomBytes(16).toString('hex')}`;

    // Redirect to frontend with token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/auth/sso/callback?token=${token}&email=${encodeURIComponent(user.email)}`);
  } catch (error: any) {
    console.error('Google Workspace callback error:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/auth/sso/error?error=${encodeURIComponent(error.message)}`);
  }
});

/**
 * GET /api/enterprise/sso/azure-ad/callback
 * Handle Azure AD OAuth callback
 */
router.get('/azure-ad/callback', async (req, res) => {
  try {
    const { code, state, organizationId } = req.query;

    if (!code || !organizationId) {
      return res.status(400).json({ error: 'Code and organizationId required' });
    }

    const redirectUri = `${req.protocol}://${req.get('host')}/api/enterprise/sso/azure-ad/callback`;
    const user = await processAzureADCallback(
      code as string,
      organizationId as string,
      redirectUri
    );

    // Generate session token
    const token = `sso_${Date.now()}_${crypto.randomBytes(16).toString('hex')}`;

    // Redirect to frontend with token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/auth/sso/callback?token=${token}&email=${encodeURIComponent(user.email)}`);
  } catch (error: any) {
    console.error('Azure AD callback error:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/auth/sso/error?error=${encodeURIComponent(error.message)}`);
  }
});

/**
 * GET /api/enterprise/sso/status/:organizationId
 * Check if SSO is enabled for an organization
 */
router.get('/status/:organizationId', (req, res) => {
  const { organizationId } = req.params;
  const enabled = hasSSOEnabled(organizationId);
  const provider = getSSOProvider(organizationId);

  res.json({
    enabled,
    provider,
  });
});

import crypto from 'crypto';

export default router;




