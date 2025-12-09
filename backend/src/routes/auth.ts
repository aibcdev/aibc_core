/**
 * Authentication Routes
 */

import express from 'express';
import {
  verifyGoogleCredential,
  getOrCreateGoogleUser,
  createUser,
  verifyUser,
  generateResetToken,
  verifyResetToken,
  resetUserPassword,
  generateToken,
  sendPasswordResetEmail,
} from '../services/authService';

const router = express.Router();

/**
 * POST /api/auth/google
 * Sign in with Google
 */
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ error: 'Google credential required' });
    }

    // Verify Google credential
    const googleUser = await verifyGoogleCredential(credential);

    // Get or create user
    const user = await getOrCreateGoogleUser(googleUser);

    // Generate token
    const token = generateToken(user);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error: any) {
    console.error('Google auth error:', error);
    res.status(401).json({ error: error.message || 'Google authentication failed' });
  }
});

/**
 * POST /api/auth/signup
 * Sign up with email and password
 */
router.post('/signup', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Create user
    const user = createUser(email, password, firstName, lastName);

    // Generate token
    const token = generateToken(user);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    res.status(400).json({ error: error.message || 'Signup failed' });
  }
});

/**
 * POST /api/auth/signin
 * Sign in with email and password
 */
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Verify user
    const user = verifyUser(email, password);

    // Generate token
    const token = generateToken(user);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error: any) {
    console.error('Signin error:', error);
    res.status(401).json({ error: error.message || 'Invalid email or password' });
  }
});

/**
 * POST /api/auth/forgot-password
 * Request password reset
 */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }

    // Generate reset token
    const token = generateResetToken(email);

    // Send reset email
    await sendPasswordResetEmail(email, token);

    res.json({
      success: true,
      message: 'Password reset email sent',
      resetToken: process.env.NODE_ENV === 'development' ? token : undefined, // Only in dev
    });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    // Don't reveal if email exists
    res.json({
      success: true,
      message: 'If that email exists, a password reset link has been sent',
    });
  }
});

/**
 * POST /api/auth/reset-password
 * Reset password with token
 */
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Reset password
    resetUserPassword(token, newPassword);

    res.json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error: any) {
    console.error('Reset password error:', error);
    res.status(400).json({ error: error.message || 'Failed to reset password' });
  }
});

export default router;

