/**
 * E-commerce Content Routes
 */

import express from 'express';
import {
  generateProductContent,
  generateABTestVariants,
  generateProductComparison,
  generateConversionOptimizedDescription,
} from '../services/ecommerceService';

const router = express.Router();

/**
 * POST /api/ecommerce/generate-product-content
 * Generate product content
 */
router.post('/generate-product-content', async (req, res) => {
  try {
    const { productName, productCategory, productFeatures, brandDNA } = req.body;

    if (!productName || !productCategory) {
      return res.status(400).json({ error: 'ProductName and productCategory required' });
    }

    const content = await generateProductContent(
      productName,
      productCategory,
      productFeatures || [],
      brandDNA
    );

    res.json({
      success: true,
      content,
    });
  } catch (error: any) {
    console.error('Product content generation error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate product content' });
  }
});

/**
 * POST /api/ecommerce/generate-ab-variants
 * Generate A/B test variants
 */
router.post('/generate-ab-variants', async (req, res) => {
  try {
    const { baseContent, variantCount } = req.body;

    if (!baseContent) {
      return res.status(400).json({ error: 'BaseContent required' });
    }

    const variants = await generateABTestVariants(baseContent, variantCount || 3);

    res.json({
      success: true,
      variants,
    });
  } catch (error: any) {
    console.error('A/B variant generation error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate A/B variants' });
  }
});

/**
 * POST /api/ecommerce/generate-comparison
 * Generate product comparison
 */
router.post('/generate-comparison', async (req, res) => {
  try {
    const { products, brandDNA } = req.body;

    if (!products || !Array.isArray(products) || products.length < 2) {
      return res.status(400).json({ error: 'At least 2 products required' });
    }

    const comparison = await generateProductComparison(products, brandDNA);

    res.json({
      success: true,
      comparison,
    });
  } catch (error: any) {
    console.error('Product comparison generation error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate comparison' });
  }
});

/**
 * POST /api/ecommerce/generate-conversion-description
 * Generate conversion-optimized description
 */
router.post('/generate-conversion-description', async (req, res) => {
  try {
    const { productName, targetAudience, brandDNA } = req.body;

    if (!productName || !targetAudience) {
      return res.status(400).json({ error: 'ProductName and targetAudience required' });
    }

    const description = await generateConversionOptimizedDescription(
      productName,
      targetAudience,
      brandDNA
    );

    res.json({
      success: true,
      description,
    });
  } catch (error: any) {
    console.error('Conversion description generation error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate description' });
  }
});

export default router;
