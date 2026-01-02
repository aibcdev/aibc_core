import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import scanRoutes from './routes/scan';
import podcastRoutes from './routes/podcast';
import analyticsRoutes from './routes/analytics';
import authRoutes from './routes/auth';
import stripeRoutes from './routes/stripe';
import adminRoutes from './routes/admin';
import blogRoutes from './routes/blog';
import contentGeneratorRoutes from './routes/contentGenerator';
import sitemapRoutes from './routes/sitemap';
import seoAnalyticsRoutes from './routes/seoAnalytics';
import seoOptimizeRoutes from './routes/seoOptimize';
import learningRoutes from './routes/learning';
import blogSchedulerRoutes from './routes/blogScheduler';
import socialContentRoutes from './routes/socialContent';
import enterpriseSSORoutes from './routes/enterpriseSSO';
import apiDocsRoutes from './routes/apiDocs';
import integrationsRoutes from './routes/integrations';
import localizationRoutes from './routes/localization';
import videoAudioRoutes from './routes/videoAudio';
import ecommerceRoutes from './routes/ecommerce';
import enterpriseSecurityRoutes from './routes/enterpriseSecurity';
import platformsRoutes from './routes/platforms';
import n8nRoutes from './routes/n8n';
import strategyRoutes from './routes/strategy';
import contentHubRoutes from './routes/contentHub';
import scrapingRoutes from './routes/scraping';
import massContentRoutes from './routes/massContent';
import organicTrafficRoutes from './routes/organicTraffic';
import contentQualityRoutes from './routes/contentQuality';
import keywordsRoutes from './routes/keywords';
import competitorTipsRoutes from './routes/competitorTips';
import brandAssetsRoutes from './routes/brandAssets';

dotenv.config();

// Validate Stripe configuration (warn if not set, but don't block startup)
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('⚠️  STRIPE_SECRET_KEY not set. Stripe payment features will be disabled.');
} else {
  console.log('✅ Stripe configured (Secret Key found)');
}

if (!process.env.STRIPE_WEBHOOK_SECRET) {
  console.warn('⚠️  STRIPE_WEBHOOK_SECRET not set. Webhook verification will fail.');
} else {
  console.log('✅ Stripe webhook secret configured');
}

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10); // Default to 3001 for local dev, Cloud Run sets PORT=8080

// Middleware - Allow all origins for API access
// This is safe because we use authentication for protected routes
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    // Allow all localhost variants
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    
    // Allow all Netlify domains
    if (origin.includes('.netlify.app') || origin.includes('.netlify.com')) {
      return callback(null, true);
    }
    
    // Allow production domains
    if (origin.includes('aibcmedia.com') || origin.includes('aibc')) {
      return callback(null, true);
    }
    
    // Allow any origin for now (API is authenticated anyway)
    return callback(null, true);
  },
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/scan', scanRoutes);
app.use('/api/podcast', podcastRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/blog', contentGeneratorRoutes);
app.use('/api', sitemapRoutes);
app.use('/api/seo/analytics', seoAnalyticsRoutes);
app.use('/api/seo/optimize', seoOptimizeRoutes);
app.use('/api/learning', learningRoutes);
app.use('/api/blog', blogSchedulerRoutes);
app.use('/api/social', socialContentRoutes);
app.use('/api/enterprise/sso', enterpriseSSORoutes);
app.use('/api/docs', apiDocsRoutes);
app.use('/api/integrations', integrationsRoutes);
app.use('/api/localization', localizationRoutes);
app.use('/api/video', videoAudioRoutes);
app.use('/api/audio', videoAudioRoutes);
app.use('/api/ecommerce', ecommerceRoutes);
app.use('/api/enterprise/security', enterpriseSecurityRoutes);
app.use('/api/platforms', platformsRoutes);
app.use('/api/n8n', n8nRoutes);
app.use('/api/strategy', strategyRoutes);
app.use('/api/content-hub', contentHubRoutes);
app.use('/api/scraping', scrapingRoutes);
app.use('/api/mass-content', massContentRoutes);
app.use('/api/organic-traffic', organicTrafficRoutes);
app.use('/api/content-quality', contentQualityRoutes);
app.use('/api/keywords', keywordsRoutes);
app.use('/api/competitor-tips', competitorTipsRoutes);
app.use('/api/brand-assets', brandAssetsRoutes);

// Gemini API routes
import geminiRoutes from './routes/gemini';
app.use('/api/gemini', geminiRoutes);

// Verify handle endpoint (quick verification for integrations)
app.post('/api/verify-handle', async (req, res) => {
  const { handle, platform } = req.body;
  
  if (!handle || !platform) {
    return res.status(400).json({ verified: false, error: 'Handle and platform required' });
  }
  
  try {
    const { verifyHandle } = await import('./services/verifyService');
    const result = await verifyHandle(handle, platform);
    // Return in format expected by frontend
    res.json({
      success: result.verified,
      verified: result.verified,
      profile: result.profile,
      error: result.error,
      name: result.profile?.name,
      followers: result.profile?.followers,
      bio: result.profile?.bio
    });
  } catch (error: any) {
    console.error('Verify handle error:', error);
    res.status(500).json({ 
      success: false,
      verified: false, 
      error: error.message || 'Verification failed' 
    });
  }
});

// Verify competitor endpoint
app.post('/api/verify-competitor', async (req, res) => {
  const { name, industry } = req.body;
  
  if (!name) {
    return res.status(400).json({ verified: false, error: 'Name required' });
  }
  
  try {
    const { verifyCompetitor } = await import('./services/verifyService');
    const result = await verifyCompetitor(name, industry);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ verified: false, error: error.message });
  }
});

// Content generation endpoint
app.post('/api/generate/content', async (req, res) => {
  try {
    const { asset, brandDNA, examplePosts, username } = req.body;
    
    if (!asset || !brandDNA) {
      return res.status(400).json({ error: 'Asset and brandDNA required' });
    }
    
    const { generateJSON, isLLMConfigured } = await import('./services/llmService');
    
    if (!isLLMConfigured()) {
      return res.status(503).json({ error: 'LLM service not configured' });
    }
    
    // Build prompt for brand-specific content generation
    const voice = brandDNA.voice || {};
    const tone = voice.tone || voice.style || 'professional';
    const style = voice.style || 'authentic';
    const vocabulary = voice.vocabulary || [];
    const themes = brandDNA.themes || [];
    
    const prompt = `You are a content creator for ${username || 'this brand'}. Generate ${asset.type} content for ${asset.platform} about "${asset.theme || asset.title}".

BRAND VOICE:
- Tone: ${tone}
- Style: ${style}
${vocabulary.length > 0 ? `- Key vocabulary: ${vocabulary.join(', ')}` : ''}
${themes.length > 0 ? `- Brand themes: ${themes.join(', ')}` : ''}

${examplePosts.length > 0 ? `EXAMPLE POSTS (match this style):\n${examplePosts.map((p: string, i: number) => `${i + 1}. ${p}`).join('\n')}\n\n` : ''}

REQUIREMENTS:
- Match the brand's ${tone} tone exactly
- Use ${style} style
- Platform: ${asset.platform}
- Type: ${asset.type}
- Topic: ${asset.theme || asset.title}

Generate the complete content now (not a template, actual content):`;

    const result = await generateJSON<{ content: string }>(prompt, undefined, { tier: 'basic' });
    
    res.json({
      success: true,
      content: result.content || 'Content generation failed'
    });
  } catch (error: any) {
    console.error('Content generation error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate content' });
  }
});

// Strategy processing endpoint
app.post('/api/strategy/process', async (req, res) => {
  try {
    const { message, username, brandDNA, competitors } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message required' });
    }
    
    const { generateJSON, isLLMConfigured } = await import('./services/llmService');
    
    if (!isLLMConfigured()) {
      return res.json({ 
        response: `Strategy noted: "${message}". I'll adjust content recommendations based on this direction.`,
        contentUpdates: { strategy: message }
      });
    }
    
    const prompt = `You are an AI content strategist for ${username || 'a brand'}. The user has requested:
"${message}"

Brand context:
- Name: ${brandDNA?.name || username || 'Unknown'}
- Industry: ${brandDNA?.industry || 'Unknown'}
- Current competitors being tracked: ${competitors?.join(', ') || 'None'}

TASK: Respond helpfully to their strategy request. If they want to:
1. Add competitors - acknowledge and confirm
2. Change content focus - confirm the new direction
3. Target specific platforms - acknowledge the platform focus

Keep response concise (2-3 sentences). Be actionable.

Return JSON: { "response": "your helpful response", "actions": ["action1", "action2"], "newCompetitors": ["if any new competitors mentioned"], "platformFocus": "if platform mentioned" }`;

    const result = await generateJSON<{ response: string; actions?: string[]; newCompetitors?: string[]; platformFocus?: string }>(prompt, undefined, { tier: 'basic' });
    
    res.json({
      response: result.response || `Strategy noted: "${message}". I'll adjust content recommendations accordingly.`,
      contentUpdates: {
        strategy: message,
        actions: result.actions,
        newCompetitors: result.newCompetitors,
        platformFocus: result.platformFocus
      }
    });
  } catch (error: any) {
    console.error('Strategy processing error:', error);
    res.json({ 
      response: `Strategy noted: "${req.body.message}". I'll work on adjusting the content recommendations.`,
      contentUpdates: { strategy: req.body.message }
    });
  }
});

// Root route - API server info
app.get('/', (req, res) => {
  res.json({ 
    message: 'AIBC Media API Server',
    status: 'running',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      scan: '/api/scan',
      analytics: '/api/analytics',
      blog: '/api/blog',
      docs: '/api/docs'
    },
    timestamp: new Date().toISOString()
  });
});

// Health check (early in the file for quick startup detection)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    port: PORT,
    nodeVersion: process.version
  });
});

// Initialize content scheduler (generate content at 9 AM daily)
// Run asynchronously after server starts to avoid blocking startup
if (process.env.ENABLE_CONTENT_SCHEDULER !== 'false') {
  setImmediate(async () => {
    try {
      // #region agent log
      const fs = require('fs');
      const logPath = '/Users/akeemojuko/Documents/aibc_core-1/.cursor/debug.log';
      try {
        fs.appendFileSync(logPath, JSON.stringify({location:'server.ts:305',message:'INITIALIZING SCHEDULER',data:{enabled:process.env.ENABLE_CONTENT_SCHEDULER,time:process.env.CONTENT_GENERATION_TIME||'09:00',timezone:process.env.TIMEZONE||'America/New_York'},timestamp:Date.now(),sessionId:'debug-session',runId:'scheduler-init',hypothesisId:'H1'})+'\n');
      } catch(e){}
      // #endregion
      const { scheduleDailyContentGeneration } = await import('./cron/seoContentScheduler');
      scheduleDailyContentGeneration(
        process.env.CONTENT_GENERATION_TIME || '09:00',
        process.env.TIMEZONE || 'America/New_York'
      );
      console.log('✅ Content scheduler initialized');
      
      // Initialize blog maintenance scheduler (runs at 10 AM, after content generation)
      const { scheduleBlogMaintenance } = await import('./cron/blogMaintenanceScheduler');
      scheduleBlogMaintenance(
        process.env.BLOG_MAINTENANCE_TIME || '10:00',
        process.env.TIMEZONE || 'America/New_York'
      );
      console.log('✅ Blog maintenance scheduler initialized');
      // #region agent log
      try {
        fs.appendFileSync(logPath, JSON.stringify({location:'server.ts:312',message:'SCHEDULER INITIALIZED',data:{success:true},timestamp:Date.now(),sessionId:'debug-session',runId:'scheduler-init',hypothesisId:'H1'})+'\n');
      } catch(e){}
      // #endregion
    } catch (error: any) {
      console.warn('⚠️ Content scheduler not available (node-cron may not be installed)');
      // #region agent log
      const fs = require('fs');
      const logPath = '/Users/akeemojuko/Documents/aibc_core-1/.cursor/debug.log';
      try {
        fs.appendFileSync(logPath, JSON.stringify({location:'server.ts:315',message:'SCHEDULER INIT FAILED',data:{error:error?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'scheduler-init',hypothesisId:'H1'})+'\n');
      } catch(e){}
      // #endregion
    }
  });
} else {
  // #region agent log
  const fs = require('fs');
  const logPath = '/Users/akeemojuko/Documents/aibc_core-1/.cursor/debug.log';
  try {
    fs.appendFileSync(logPath, JSON.stringify({location:'server.ts:304',message:'SCHEDULER DISABLED',data:{enableContentScheduler:process.env.ENABLE_CONTENT_SCHEDULER},timestamp:Date.now(),sessionId:'debug-session',runId:'scheduler-init',hypothesisId:'H1'})+'\n');
  } catch(e){}
  // #endregion
}

// Initialize mass content scheduler (AGGRESSIVE: 5000+ posts daily for 1M pages)
if (process.env.ENABLE_MASS_CONTENT_SCHEDULER !== 'false') {
  setImmediate(async () => {
    try {
      const { scheduleMassContentGeneration, scheduleLocationContentGeneration } = await import('./cron/massContentScheduler');
      const postsPerDay = parseInt(process.env.MASS_CONTENT_POSTS_PER_DAY || '5000', 10); // AGGRESSIVE default
      
      scheduleMassContentGeneration(
        process.env.MASS_CONTENT_TIME || '02:00',
        process.env.TIMEZONE || 'America/New_York',
        postsPerDay
      );
      
      scheduleLocationContentGeneration(
        0, // Sunday
        process.env.LOCATION_CONTENT_TIME || '03:00',
        process.env.TIMEZONE || 'America/New_York'
      );
      
      // Pre-generate templates for speed
      const { templateCache } = await import('./services/contentTemplateCache');
      templateCache.preGenerateTemplates().catch(err => {
        console.warn('Template pre-generation error:', err);
      });
      
      console.log(`✅ AGGRESSIVE mass content scheduler initialized: ${postsPerDay} posts/day`);
      console.log(`🚀 Parallel processing: 20 workers, bulk inserts, instant indexing`);
    } catch (error) {
      console.warn('⚠️ Mass content scheduler not available:', error);
    }
  });
}

// Add process error handlers
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start server with error handling
try {
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/health`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  });

  server.on('error', (err: any) => {
    console.error('❌ Server error:', err);
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use`);
    }
    process.exit(1);
  });
} catch (error) {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
}

