import { Router } from 'express';
import { generateAnalyticsReport, checkBusinessPlusAccess } from '../services/analyticsService';

const router = Router();

// Generate custom analytics report (Business+ tier only)
router.post('/report', async (req, res) => {
  try {
    const { dateRange, parameters, brandDNA, contentData } = req.body;
    const userTier = req.headers['x-user-tier'] as string || 'free'; // In production, get from auth

    // Check tier access
    if (!checkBusinessPlusAccess(userTier)) {
      return res.status(403).json({
        success: false,
        error: 'Custom analytics reports are only available for Business+ tier users'
      });
    }

    if (!dateRange || !dateRange.start || !dateRange.end) {
      return res.status(400).json({
        success: false,
        error: 'Date range is required'
      });
    }

    if (!parameters || Object.keys(parameters).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'At least one analysis parameter is required'
      });
    }

    const report = await generateAnalyticsReport({
      dateRange,
      parameters,
      brandDNA,
      contentData
    });

    if (report.success) {
      res.json(report);
    } else {
      res.status(500).json(report);
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate analytics report'
    });
  }
});

export default router;

