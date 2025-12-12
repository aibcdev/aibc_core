import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import scanRoutes from './routes/scan';
import podcastRoutes from './routes/podcast';
import analyticsRoutes from './routes/analytics';
import authRoutes from './routes/auth';
import stripeRoutes from './routes/stripe';
import adminRoutes from './routes/admin';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001; // Default to 3001 for local dev

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

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
});

