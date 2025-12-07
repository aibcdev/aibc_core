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

// Middleware
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:3003',
    'http://localhost:5173',
    'http://localhost:3000',
    'https://aibcmedia.com',
    'https://www.aibcmedia.com'
  ],
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

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
});

