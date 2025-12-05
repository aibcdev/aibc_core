import { Router, Request, Response } from 'express';
import {
  createUser,
  signInWithEmail,
  signInWithGoogle,
  generatePasswordResetToken,
  resetPassword,
  getUserById,
  verifyToken
} from '../services/authService';

const router = Router();

// Sign up with email/password
router.post('/signup', async (req: Request, res: Response) => {
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

    const { user, token } = createUser(email, password, firstName, lastName);

    // Remove sensitive data
    const { passwordHash, resetPasswordToken, resetPasswordExpires, ...userResponse } = user;

    res.json({
      success: true,
      user: userResponse,
      token
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to create account'
    });
  }
});

// Sign in with email/password
router.post('/signin', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    const { user, token } = signInWithEmail(email, password);

    // Remove sensitive data
    const { passwordHash, resetPasswordToken, resetPasswordExpires, ...userResponse } = user;

    res.json({
      success: true,
      user: userResponse,
      token
    });
  } catch (error: any) {
    res.status(401).json({
      success: false,
      error: error.message || 'Invalid credentials'
    });
  }
});

// Sign in with Google OAuth
router.post('/google', async (req: Request, res: Response) => {
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
    const { user, token, isNewUser } = signInWithGoogle(googleId, email, name, picture);

    // Remove sensitive data
    const { passwordHash, resetPasswordToken, resetPasswordExpires, ...userResponse } = user;

    res.json({
      success: true,
      user: userResponse,
      token,
      isNewUser
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to sign in with Google'
    });
  }
});

// Request password reset
router.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    // Generate reset token
    const resetToken = generatePasswordResetToken(email);

    // In production, send email with reset link
    // For now, return token (remove in production!)
    console.log(`Password reset token for ${email}: ${resetToken}`);

    res.json({
      success: true,
      message: 'Password reset email sent',
      // Remove this in production - only for development
      resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
    });
  } catch (error: any) {
    // Don't reveal if email exists or not (security best practice)
    res.json({
      success: true,
      message: 'If an account exists, a password reset email has been sent'
    });
  }
});

// Reset password with token
router.post('/reset-password', async (req: Request, res: Response) => {
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

    resetPassword(token, newPassword);

    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to reset password'
    });
  }
});

// Get current user (requires authentication)
router.get('/me', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    const user = getUserById(decoded.userId);
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
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get user'
    });
  }
});

export default router;

