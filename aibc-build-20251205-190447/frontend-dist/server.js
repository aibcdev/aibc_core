"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const scan_1 = __importDefault(require("./routes/scan"));
const podcast_1 = __importDefault(require("./routes/podcast"));
const analytics_1 = __importDefault(require("./routes/analytics"));
const auth_1 = __importDefault(require("./routes/auth"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001; // Default to 3001 for local dev
// Middleware
app.use((0, cors_1.default)({
    origin: [
        process.env.FRONTEND_URL || 'http://localhost:5173',
        'http://localhost:3003',
        'http://localhost:5173',
        'http://localhost:3000'
    ],
    credentials: true
}));
app.use(express_1.default.json());
// Routes
app.use('/api/scan', scan_1.default);
app.use('/api/podcast', podcast_1.default);
app.use('/api/analytics', analytics_1.default);
app.use('/api/auth', auth_1.default);
// Verify handle endpoint (quick verification for integrations)
app.post('/api/verify-handle', async (req, res) => {
    const { handle, platform } = req.body;
    if (!handle || !platform) {
        return res.status(400).json({ verified: false, error: 'Handle and platform required' });
    }
    try {
        const { verifyHandle } = await Promise.resolve().then(() => __importStar(require('./services/verifyService')));
        const result = await verifyHandle(handle, platform);
        res.json(result);
    }
    catch (error) {
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
        const { verifyCompetitor } = await Promise.resolve().then(() => __importStar(require('./services/verifyService')));
        const result = await verifyCompetitor(name, industry);
        res.json(result);
    }
    catch (error) {
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
        const { generateImageForContent } = await Promise.resolve().then(() => __importStar(require('./services/imageGenerationService')));
        const result = await generateImageForContent(content, platform, brandDNA);
        res.json(result);
    }
    catch (error) {
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
        const { generateBrandVoiceContent } = await Promise.resolve().then(() => __importStar(require('./services/contentGenerationService')));
        const result = await generateBrandVoiceContent({
            platform,
            contentType: contentType || 'post',
            topic,
            brandDNA,
            extractedContent
        });
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// Enhanced Analytics Endpoints
app.post('/api/analytics/dashboard', async (req, res) => {
    const { dateRange, competitors, brandDNA, gaAccessToken, gaViewId, competitorApiKey } = req.body;
    try {
        const { AggregatedAnalyticsService } = await Promise.resolve().then(() => __importStar(require('./services/analyticsService')));
        // Use provided tokens or fallback to mock data
        const accessToken = gaAccessToken || 'mock-token';
        const viewId = gaViewId || 'mock-view';
        const service = new AggregatedAnalyticsService(accessToken, viewId, competitorApiKey);
        const result = await service.getDashboardAnalytics(dateRange || { startDate: '30daysAgo', endDate: 'today' }, competitors || [], brandDNA);
        res.json({ success: true, data: result });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
app.post('/api/analytics/competitors', async (req, res) => {
    const { competitors, competitorApiKey } = req.body;
    if (!competitors || !Array.isArray(competitors)) {
        return res.status(400).json({ success: false, error: 'Competitors array required' });
    }
    try {
        const { CompetitorAnalyticsService } = await Promise.resolve().then(() => __importStar(require('./services/analyticsService')));
        const service = new CompetitorAnalyticsService(competitorApiKey);
        const result = await service.compareCompetitors(competitors);
        res.json({ success: true, data: result });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// Credit Management Endpoints
app.post('/api/credits/check-access', async (req, res) => {
    const { userId, feature, userTier, userCredits } = req.body;
    try {
        const { checkFeatureAccess } = await Promise.resolve().then(() => __importStar(require('./services/creditService')));
        const access = checkFeatureAccess(userId, feature, userTier, userCredits);
        res.json(access);
    }
    catch (error) {
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
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
app.get('/api/credits/balance/:userId', async (req, res) => {
    const { userId } = req.params;
    const userTier = req.query.tier || 'free';
    try {
        const { getCreditBalance } = await Promise.resolve().then(() => __importStar(require('./services/creditService')));
        const balance = getCreditBalance(userId, userTier);
        res.json({ success: true, balance });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// Admin Endpoints
app.get('/api/admin/users', async (req, res) => {
    try {
        // In production, fetch from database
        // For now, return mock data or empty array
        res.json({ success: true, users: [] });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
app.get('/api/admin/requests', async (req, res) => {
    try {
        // In production, fetch from database
        // For now, return empty array
        res.json({ success: true, requests: [] });
    }
    catch (error) {
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
    }
    catch (error) {
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
    }
    catch (error) {
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
