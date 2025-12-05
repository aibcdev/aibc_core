import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import scanRoutes from './routes/scan';
import podcastRoutes from './routes/podcast';
import analyticsRoutes from './routes/analytics';
import authRoutes from './routes/auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001; // Default to 3001 for local dev

// Middleware
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:3003',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/scan', scanRoutes);
app.use('/api/podcast', podcastRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/auth', authRoutes);

// Verify handle endpoint (quick verification for integrations)
app.post('/api/verify-handle', async (req, res) => {
  const { handle, platform } = req.body;
  
  if (!handle || !platform) {
    return res.status(400).json({ verified: false, error: 'Handle and platform required' });
  }
  
  try {
    const { verifyHandle } = await import('./services/verifyService');
    const result = await verifyHandle(handle, platform);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ verified: false, error: error.message });
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

// Generate image for social content
app.post('/api/generate-image', async (req, res) => {
  const { content, platform, brandDNA } = req.body;
  
  if (!content || !platform) {
    return res.status(400).json({ success: false, error: 'Content and platform required' });
  }
  
  try {
    const { generateImageForContent } = await import('./services/imageGenerationService');
    const result = await generateImageForContent(content, platform, brandDNA);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Generate content matching brand voice
app.post('/api/generate-content', async (req, res) => {
  const { platform, contentType, topic, brandDNA, extractedContent } = req.body;
  
  if (!platform || !topic || !brandDNA) {
    return res.status(400).json({ success: false, error: 'Platform, topic, and brandDNA required' });
  }
  
  try {
    const { generateBrandVoiceContent } = await import('./services/contentGenerationService');
    const result = await generateBrandVoiceContent({
      platform,
      contentType: contentType || 'post',
      topic,
      brandDNA,
      extractedContent
    });
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Enhanced Analytics Endpoints
app.post('/api/analytics/dashboard', async (req, res) => {
  const { dateRange, competitors, brandDNA, gaAccessToken, gaViewId, competitorApiKey } = req.body;
  
  try {
    const { AggregatedAnalyticsService } = await import('./services/analyticsService');
    
    // Use provided tokens or fallback to mock data
    const accessToken = gaAccessToken || 'mock-token';
    const viewId = gaViewId || 'mock-view';
    
    const service = new AggregatedAnalyticsService(accessToken, viewId, competitorApiKey);
    const result = await service.getDashboardAnalytics(
      dateRange || { startDate: '30daysAgo', endDate: 'today' },
      competitors || [],
      brandDNA
    );
    
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/analytics/competitors', async (req, res) => {
  const { competitors, competitorApiKey } = req.body;
  
  if (!competitors || !Array.isArray(competitors)) {
    return res.status(400).json({ success: false, error: 'Competitors array required' });
  }
  
  try {
    const { CompetitorAnalyticsService } = await import('./services/analyticsService');
    const service = new CompetitorAnalyticsService(competitorApiKey);
    const result = await service.compareCompetitors(competitors);
    
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Credit Management Endpoints
app.post('/api/credits/check-access', async (req, res) => {
  const { userId, feature, userTier, userCredits } = req.body;
  
  try {
    const { checkFeatureAccess } = await import('./services/creditService');
    const access = checkFeatureAccess(userId, feature, userTier, userCredits);
    res.json(access);
  } catch (error: any) {
    res.status(500).json({ 
      feature, 
      allowed: false, 
      error: error.message 
    });
  }
});

app.post('/api/credits/use', async (req, res) => {
  const { userId, feature, creditsUsed, newBalance } = req.body;
  
  try {
    // In production, this would update database
    // For now, just acknowledge
    res.json({ 
      success: true, 
      userId, 
      feature, 
      creditsUsed, 
      newBalance 
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/credits/balance/:userId', async (req, res) => {
  const { userId } = req.params;
  const userTier = req.query.tier as string || 'free';
  
  try {
    const { getCreditBalance } = await import('./services/creditService');
    const balance = getCreditBalance(userId, userTier as any);
    res.json({ success: true, balance });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin Endpoints
app.get('/api/admin/users', async (req, res) => {
  try {
    // In production, fetch from database
    // For now, return mock data or empty array
    res.json({ success: true, users: [] });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/admin/requests', async (req, res) => {
  try {
    // In production, fetch from database
    // For now, return empty array
    res.json({ success: true, requests: [] });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/admin/analytics', async (req, res) => {
  try {
    // In production, fetch from analytics database
    res.json({ 
      success: true, 
      analytics: {
        totalUsers: 0,
        activeUsers: 0,
        totalRequests: 0,
        pendingRequests: 0,
        totalTimeOnSite: 0,
        totalClicks: 0
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/admin/requests/:id/process', async (req, res) => {
  const { id } = req.params;
  const { action, contentUrl, thumbnailUrl } = req.body;
  
  try {
    // In production, update database
    // action: 'approve' | 'reject'
    res.json({ 
      success: true, 
      requestId: id,
      action,
      status: action === 'approve' ? 'ready' : 'rejected'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
});

