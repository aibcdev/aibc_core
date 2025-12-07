import express from 'express';

const router = express.Router();

// Admin emails (in production, store in database)
const ADMIN_EMAILS = ['watchaibc@gmail.com'];

/**
 * Middleware to check admin access
 */
function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  // In production, verify JWT token and check user email
  const userEmail = req.headers['x-user-email'] as string;
  
  if (!userEmail || !ADMIN_EMAILS.includes(userEmail.toLowerCase())) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  next();
}

/**
 * Get all users (admin only)
 */
router.get('/users', requireAdmin, async (req, res) => {
  try {
    // In production, fetch from database
    // For now, return empty array
    res.json({ users: [] });
  } catch (error: any) {
    console.error('Get users error:', error);
    res.status(500).json({ error: error.message || 'Failed to get users' });
  }
});

/**
 * Get admin dashboard stats
 */
router.get('/stats', requireAdmin, async (req, res) => {
  try {
    // In production, calculate from database
    const stats = {
      totalUsers: 0,
      activeSubscriptions: 0,
      totalRevenue: 0,
      scansToday: 0,
    };
    
    res.json(stats);
  } catch (error: any) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ error: error.message || 'Failed to get stats' });
  }
});

export default router;

