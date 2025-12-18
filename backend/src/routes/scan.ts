import { Router } from 'express';
import { startScan } from '../services/scanService';
import { storage } from '../services/storage';

const router = Router();

// Start a new scan
router.post('/start', async (req, res) => {
  // #region agent log
  const fs = require('fs');
  const logPath = '/Users/akeemojuko/Documents/aibc_core-1/.cursor/debug.log';
  try {
    fs.appendFileSync(logPath, JSON.stringify({location:'scan.ts:8',message:'POST /start CALLED',data:{hasUsername:!!req.body.username,hasPlatforms:!!req.body.platforms,platformsCount:req.body.platforms?.length||0,scanType:req.body.scanType},timestamp:Date.now(),sessionId:'debug-session',runId:'api-start',hypothesisId:'H7'})+'\n');
  } catch(e){}
  // #endregion
  
  try {
    const { username, platforms, scanType = 'standard', connectedAccounts } = req.body;

    if (!username || !platforms || platforms.length === 0) {
      // #region agent log
      try {
        fs.appendFileSync(logPath, JSON.stringify({location:'scan.ts:15',message:'POST /start VALIDATION ERROR',data:{hasUsername:!!username,hasPlatforms:!!platforms,platformsCount:platforms?.length||0},timestamp:Date.now(),sessionId:'debug-session',runId:'api-start',hypothesisId:'H6'})+'\n');
      } catch(e){}
      // #endregion
      return res.status(400).json({ 
        success: false, 
        error: 'Username and platforms are required' 
      });
    }

    const scanId = `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Initialize scan status
    const scan = {
      id: scanId,
      username,
      platforms,
      scanType,
      status: 'starting',
      progress: 0,
      logs: [],
      results: null,
      error: null,
      createdAt: new Date().toISOString()
    };

    storage.saveScan(scan);
    // #region agent log
    try {
      fs.appendFileSync(logPath, JSON.stringify({location:'scan.ts:35',message:'POST /start SCAN SAVED',data:{scanId,username,platforms:platforms.length,scanType},timestamp:Date.now(),sessionId:'debug-session',runId:'api-start',hypothesisId:'H7'})+'\n');
    } catch(e){}
    // #endregion

    // Start scan asynchronously - pass connected accounts if provided
    startScan(scanId, username, platforms, scanType, connectedAccounts).catch(err => {
      // #region agent log
      try {
        fs.appendFileSync(logPath, JSON.stringify({location:'scan.ts:38',message:'startScan ASYNC ERROR',data:{scanId,error:err?.message||'unknown',stack:err?.stack?.substring(0,200)},timestamp:Date.now(),sessionId:'debug-session',runId:'api-start',hypothesisId:'H3'})+'\n');
      } catch(e){}
      // #endregion
      console.error('Scan error:', err);
      storage.updateScan(scanId, {
        status: 'error',
        error: err.message
      });
    });

    // #region agent log
    try {
      fs.appendFileSync(logPath, JSON.stringify({location:'scan.ts:50',message:'POST /start SUCCESS RESPONSE',data:{scanId,username},timestamp:Date.now(),sessionId:'debug-session',runId:'api-start',hypothesisId:'H7'})+'\n');
    } catch(e){}
    // #endregion
    res.json({ 
      success: true, 
      scanId,
      message: 'Scan started successfully'
    });
  } catch (error: any) {
    // #region agent log
    try {
      fs.appendFileSync(logPath, JSON.stringify({location:'scan.ts:56',message:'POST /start CATCH ERROR',data:{error:error?.message||'unknown',stack:error?.stack?.substring(0,200)},timestamp:Date.now(),sessionId:'debug-session',runId:'api-start',hypothesisId:'H6'})+'\n');
    } catch(e){}
    // #endregion
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to start scan' 
    });
  }
});

// Get scan status
router.get('/:id/status', (req, res) => {
  const { id } = req.params;
  const scan = storage.getScan(id);

  if (!scan) {
    return res.status(404).json({ 
      success: false, 
      error: 'Scan not found' 
    });
  }

  res.json({
    success: true,
    scan: {
      id: scan.id,
      status: scan.status,
      progress: scan.progress,
      logs: scan.logs.slice(-20), // Last 20 logs
      error: scan.error
    }
  });
});

// Get scan results
router.get('/:id/results', (req, res) => {
  const { id } = req.params;
  const scan = storage.getScan(id);

  if (!scan) {
    return res.status(404).json({ 
      success: false, 
      error: 'Scan not found' 
    });
  }

  if (scan.status !== 'complete') {
    return res.status(400).json({ 
      success: false, 
      error: 'Scan not complete yet',
      status: scan.status
    });
  }

  res.json({
    success: true,
    data: scan.results
  });
});

// Get user's scan history
router.get('/user/:username', (req, res) => {
  const { username } = req.params;
  const scans = storage.getUserScans(username);

  res.json({
    success: true,
    scans: scans.map(scan => ({
      id: scan.id,
      username: scan.username,
      platforms: scan.platforms,
      scanType: scan.scanType,
      status: scan.status,
      createdAt: scan.createdAt,
      completedAt: scan.completedAt
    }))
  });
});

// Get latest scan results for a user (for dashboard)
router.get('/user/:username/latest', (req, res) => {
  const { username } = req.params;
  const scans = storage.getUserScans(username);
  
  // Get the most recent completed scan
  const completedScans = scans.filter(scan => scan.status === 'complete');
  const latestScan = completedScans[0]; // Already sorted by date desc

  if (!latestScan || !latestScan.results) {
    return res.json({
      success: true,
      data: null,
      requestedUsername: username // Always include requested username for verification
    });
  }

  // CRITICAL: Always include username in response for frontend validation
  const resultsWithUsername = {
    ...latestScan.results,
    scanUsername: latestScan.username,
    username: latestScan.username,
    scanId: latestScan.id,
    scanCompletedAt: latestScan.completedAt,
    scanCreatedAt: latestScan.createdAt
  };

  res.json({
    success: true,
    data: resultsWithUsername,
    requestedUsername: username // Include requested username for double-checking
  });
});

// Verify a handle/username exists on a platform
router.post('/verify', async (req, res) => {
  const { username, platform, verificationType = 'quick' } = req.body;

  if (!username || !platform) {
    return res.status(400).json({
      success: false,
      error: 'Username and platform are required'
    });
  }

  try {
    const { verifyHandle } = await import('../services/verifyService');
    const result = await verifyHandle(username, platform);
    res.json(result);
  } catch (error: any) {
    console.error('Verification error:', error);
    res.status(500).json({
      success: false,
      verified: false,
      error: error.message || 'Verification failed'
    });
  }
});

export default router;

