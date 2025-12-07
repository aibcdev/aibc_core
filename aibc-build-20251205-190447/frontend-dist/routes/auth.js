"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authService_1 = require("../services/authService");
const router = (0, express_1.Router)();
// Sign up with email/password
router.post('/signup', async (req, res) => {
    try {
        const { email, password, firstName, lastName } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email and password are required'
            });
        }
        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                error: 'Password must be at least 8 characters'
            });
        }
        const { user, token } = (0, authService_1.createUser)(email, password, firstName, lastName);
        // Remove sensitive data
        const { passwordHash, resetPasswordToken, resetPasswordExpires, ...userResponse } = user;
        res.json({
            success: true,
            user: userResponse,
            token
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error.message || 'Failed to create account'
        });
    }
});
// Sign in with email/password
router.post('/signin', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email and password are required'
            });
        }
        const { user, token } = (0, authService_1.signInWithEmail)(email, password);
        // Remove sensitive data
        const { passwordHash, resetPasswordToken, resetPasswordExpires, ...userResponse } = user;
        res.json({
            success: true,
            user: userResponse,
            token
        });
    }
    catch (error) {
        res.status(401).json({
            success: false,
            error: error.message || 'Invalid credentials'
        });
    }
});
// Sign in with Google OAuth
router.post('/google', async (req, res) => {
    try {
        const { googleId, email, name, picture } = req.body;
        if (!googleId || !email) {
            return res.status(400).json({
                success: false,
                error: 'Google ID and email are required'
            });
        }
        // In production, verify the Google token server-side
        // For now, we trust the client-provided data
        const { user, token, isNewUser } = (0, authService_1.signInWithGoogle)(googleId, email, name, picture);
        // Remove sensitive data
        const { passwordHash, resetPasswordToken, resetPasswordExpires, ...userResponse } = user;
        res.json({
            success: true,
            user: userResponse,
            token,
            isNewUser
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error.message || 'Failed to sign in with Google'
        });
    }
});
// Request password reset
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({
                success: false,
                error: 'Email is required'
            });
        }
        // Generate reset token
        const resetToken = (0, authService_1.generatePasswordResetToken)(email);
        // In production, send email with reset link
        // For now, return token (remove in production!)
        console.log(`Password reset token for ${email}: ${resetToken}`);
        res.json({
            success: true,
            message: 'Password reset email sent',
            // Remove this in production - only for development
            resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
        });
    }
    catch (error) {
        // Don't reveal if email exists or not (security best practice)
        res.json({
            success: true,
            message: 'If an account exists, a password reset email has been sent'
        });
    }
});
// Reset password with token
router.post('/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) {
            return res.status(400).json({
                success: false,
                error: 'Token and new password are required'
            });
        }
        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                error: 'Password must be at least 8 characters'
            });
        }
        (0, authService_1.resetPassword)(token, newPassword);
        res.json({
            success: true,
            message: 'Password reset successfully'
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error.message || 'Failed to reset password'
        });
    }
});
// Get current user (requires authentication)
router.get('/me', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }
        const token = authHeader.substring(7);
        const decoded = (0, authService_1.verifyToken)(token);
        if (!decoded) {
            return res.status(401).json({
                success: false,
                error: 'Invalid or expired token'
            });
        }
        const user = (0, authService_1.getUserById)(decoded.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        // Remove sensitive data
        const { passwordHash, resetPasswordToken, resetPasswordExpires, ...userResponse } = user;
        res.json({
            success: true,
            user: userResponse
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get user'
        });
    }
});
exports.default = router;
