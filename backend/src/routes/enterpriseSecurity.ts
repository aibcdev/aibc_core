/**
 * Enterprise Security & Compliance Routes
 * Provides information about security certifications and compliance
 */

import express from 'express';

const router = express.Router();

/**
 * GET /api/enterprise/security/certifications
 * Get security certifications and compliance information
 */
router.get('/certifications', (req, res) => {
  res.json({
    success: true,
    certifications: {
      soc2: {
        status: 'in-progress',
        type: 'SOC 2 Type II',
        description: 'Security, availability, processing integrity, confidentiality, and privacy',
        expectedCompletion: 'Q2 2025',
      },
      gdpr: {
        status: 'compliant',
        description: 'General Data Protection Regulation compliance',
        features: [
          'Data encryption at rest and in transit',
          'Right to access and deletion',
          'Data processing agreements',
          'Privacy by design',
        ],
      },
      iso27001: {
        status: 'planned',
        description: 'Information security management system',
        expectedCompletion: 'Q3 2025',
      },
      hipaa: {
        status: 'available',
        description: 'Health Insurance Portability and Accountability Act compliance',
        availableFor: 'Enterprise plans',
      },
    },
    securityFeatures: {
      encryption: {
        atRest: 'AES-256 encryption',
        inTransit: 'TLS 1.3',
      },
      accessControl: {
        sso: 'SAML 2.0, OAuth 2.0',
        mfa: 'Multi-factor authentication available',
        rbac: 'Role-based access control',
      },
      dataResidency: {
        available: true,
        regions: ['US', 'EU', 'APAC'],
        description: 'Data can be stored in specific regions for compliance',
      },
      auditLogging: {
        available: true,
        retention: '7 years',
        description: 'Comprehensive audit logs for all actions',
      },
    },
    compliance: {
      gdpr: {
        compliant: true,
        features: [
          'Data export functionality',
          'Data deletion on request',
          'Privacy policy',
          'Cookie consent',
        ],
      },
      ccpa: {
        compliant: true,
        description: 'California Consumer Privacy Act compliance',
      },
      dataProcessingAgreements: {
        available: true,
        description: 'DPAs available for enterprise customers',
      },
    },
  });
});

/**
 * GET /api/enterprise/security/data-residency
 * Get data residency options
 */
router.get('/data-residency', (req, res) => {
  res.json({
    success: true,
    regions: [
      {
        code: 'US',
        name: 'United States',
        dataCenters: ['us-east-1', 'us-west-1'],
        compliance: ['SOC 2', 'GDPR (for EU data)'],
      },
      {
        code: 'EU',
        name: 'European Union',
        dataCenters: ['eu-west-1', 'eu-central-1'],
        compliance: ['GDPR', 'SOC 2'],
      },
      {
        code: 'APAC',
        name: 'Asia Pacific',
        dataCenters: ['ap-southeast-1'],
        compliance: ['SOC 2'],
      },
    ],
    defaultRegion: 'US',
    canSelectRegion: true,
  });
});

/**
 * POST /api/enterprise/security/request-dpa
 * Request Data Processing Agreement
 */
router.post('/request-dpa', async (req, res) => {
  try {
    const { organizationName, contactEmail, region } = req.body;

    if (!organizationName || !contactEmail) {
      return res.status(400).json({ error: 'OrganizationName and contactEmail required' });
    }

    // In production, this would send an email to legal/sales team
    console.log(`[Enterprise] DPA requested by ${organizationName} (${contactEmail}) for region: ${region || 'default'}`);

    res.json({
      success: true,
      message: 'DPA request received. Our team will contact you within 24 hours.',
      requestId: `dpa_${Date.now()}`,
    });
  } catch (error: any) {
    console.error('DPA request error:', error);
    res.status(500).json({ error: error.message || 'Failed to process DPA request' });
  }
});

export default router;
