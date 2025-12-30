/**
 * Localization Routes
 */

import express from 'express';
import {
  generateMultilingualContent,
  generateCulturallyAdaptedContent,
  translateKeywords,
  SUPPORTED_LANGUAGES,
} from '../services/localizationService';

const router = express.Router();

/**
 * POST /api/localization/translate
 * Generate content in multiple languages
 */
router.post('/translate', async (req, res) => {
  try {
    const { content, targetLanguages, brandDNA } = req.body;

    if (!content || !targetLanguages || !Array.isArray(targetLanguages)) {
      return res.status(400).json({ error: 'Content and targetLanguages array required' });
    }

    const translations = await generateMultilingualContent(content, targetLanguages, brandDNA);

    res.json({
      success: true,
      translations,
    });
  } catch (error: any) {
    console.error('Translation error:', error);
    res.status(500).json({ error: error.message || 'Translation failed' });
  }
});

/**
 * POST /api/localization/adapt
 * Culturally adapt content for a region
 */
router.post('/adapt', async (req, res) => {
  try {
    const { content, targetRegion, brandDNA } = req.body;

    if (!content || !targetRegion) {
      return res.status(400).json({ error: 'Content and targetRegion required' });
    }

    const adapted = await generateCulturallyAdaptedContent(content, targetRegion, brandDNA);

    res.json({
      success: true,
      adaptedContent: adapted,
    });
  } catch (error: any) {
    console.error('Cultural adaptation error:', error);
    res.status(500).json({ error: error.message || 'Adaptation failed' });
  }
});

/**
 * POST /api/localization/translate-keywords
 * Translate SEO keywords
 */
router.post('/translate-keywords', async (req, res) => {
  try {
    const { keywords, targetLanguage } = req.body;

    if (!keywords || !Array.isArray(keywords) || !targetLanguage) {
      return res.status(400).json({ error: 'Keywords array and targetLanguage required' });
    }

    const translated = await translateKeywords(keywords, targetLanguage);

    res.json({
      success: true,
      translatedKeywords: translated,
    });
  } catch (error: any) {
    console.error('Keyword translation error:', error);
    res.status(500).json({ error: error.message || 'Keyword translation failed' });
  }
});

/**
 * GET /api/localization/languages
 * Get supported languages
 */
router.get('/languages', (req, res) => {
  res.json({
    success: true,
    languages: SUPPORTED_LANGUAGES.map(code => ({
      code,
      name: require('../services/localizationService').LANGUAGE_NAMES[code] || code,
    })),
  });
});

export default router;




