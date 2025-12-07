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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const scanService_1 = require("../services/scanService");
const storage_1 = require("../services/storage");
const router = (0, express_1.Router)();
// Start a new scan
router.post('/start', async (req, res) => {
    try {
        const { username, platforms, scanType = 'standard' } = req.body;
        if (!username || !platforms || platforms.length === 0) {
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
        storage_1.storage.saveScan(scan);
        // Start scan asynchronously
        (0, scanService_1.startScan)(scanId, username, platforms, scanType).catch(err => {
            console.error('Scan error:', err);
            storage_1.storage.updateScan(scanId, {
                status: 'error',
                error: err.message
            });
        });
        res.json({
            success: true,
            scanId,
            message: 'Scan started successfully'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to start scan'
        });
    }
});
// Get scan status
router.get('/:id/status', (req, res) => {
    const { id } = req.params;
    const scan = storage_1.storage.getScan(id);
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
    const scan = storage_1.storage.getScan(id);
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
    const scans = storage_1.storage.getUserScans(username);
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
    const scans = storage_1.storage.getUserScans(username);
    // Get the most recent completed scan
    const completedScans = scans.filter(scan => scan.status === 'complete');
    const latestScan = completedScans[0]; // Already sorted by date desc
    if (!latestScan || !latestScan.results) {
        return res.json({
            success: true,
            data: null
        });
    }
    res.json({
        success: true,
        data: latestScan.results
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
        const { verifyHandle } = await Promise.resolve().then(() => __importStar(require('../services/verifyService')));
        const result = await verifyHandle(username, platform);
        res.json(result);
    }
    catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({
            success: false,
            verified: false,
            error: error.message || 'Verification failed'
        });
    }
});
exports.default = router;
