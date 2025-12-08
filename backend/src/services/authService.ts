/**
 * Authentication Service
 */

import { OAuth2Client } from 'google-auth-library';
import crypto from 'crypto';

// Initialize Google OAuth client (optional - only if GOOGLE_CLIENT_ID is set)
let googleClient: OAuth2Client | null = null;
if (process.env.GOOGLE_CLIENT_ID) {
  googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
}

// In-memory user store (replace with database in production)
const users: Map<string, any> = new Map();
const resetTokens: Map<string, { email: string; expires: number }> = new Map();

/**
 * Verify Google JWT credential
 */
export async function verifyGoogleCredential(credential: string): Promise<any> {
  try {
    if (!googleClient || !process.env.GOOGLE_CLIENT_ID) {
      throw new Error('Google OAuth not configured. Set GOOGLE_CLIENT_ID environment variable.');
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      throw new Error('Invalid token payload');
    }

    return {
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      sub: payload.sub,
    };
  } catch (error: any) {
    console.error('Google credential verification error:', error);
    throw new Error('Invalid Google credential');
  }
}

/**
 * Create or get user from Google auth
 */
export async function getOrCreateGoogleUser(googleUser: any): Promise<any> {
  const userId = `google_${googleUser.sub}`;
  
  if (users.has(userId)) {
    return users.get(userId);
  }

  const newUser = {
    id: userId,
    email: googleUser.email,
    name: googleUser.name,
    picture: googleUser.picture,
    provider: 'google',
    createdAt: new Date().toISOString(),
  };

  users.set(userId, newUser);
  return newUser;
}

/**
 * Create user with email/password
 */
export function createUser(
  email: string,
  password: string,
  firstName?: string,
  lastName?: string
): any {
  // Check if user exists
  for (const [_, user] of users) {
    if (user.email === email && user.provider === 'email') {
      throw new Error('User already exists');
    }
  }

  const userId = `email_${crypto.randomBytes(16).toString('hex')}`;
  const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

  const newUser = {
    id: userId,
    email,
    firstName,
    lastName,
    name: firstName && lastName ? `${firstName} ${lastName}` : firstName || email.split('@')[0],
    password: hashedPassword,
    provider: 'email',
    createdAt: new Date().toISOString(),
  };

  users.set(userId, newUser);
  return newUser;
}

/**
 * Verify email/password
 */
export function verifyUser(email: string, password: string): any {
  const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

  for (const [_, user] of users) {
    if (user.email === email && user.provider === 'email' && user.password === hashedPassword) {
      return user;
    }
  }

  throw new Error('Invalid email or password');
}

/**
 * Generate password reset token
 */
export function generateResetToken(email: string): string {
  // Check if user exists
  let userExists = false;
  for (const [_, user] of users) {
    if (user.email === email) {
      userExists = true;
      break;
    }
  }

  if (!userExists) {
    // Don't reveal if user exists for security
    // Still generate token but it won't work
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expires = Date.now() + 3600000; // 1 hour

  resetTokens.set(token, { email, expires });

  // Clean up expired tokens
  setTimeout(() => {
    resetTokens.delete(token);
  }, 3600000);

  return token;
}

/**
 * Verify reset token
 */
export function verifyResetToken(token: string): string {
  const tokenData = resetTokens.get(token);
  
  if (!tokenData) {
    throw new Error('Invalid or expired reset token');
  }

  if (Date.now() > tokenData.expires) {
    resetTokens.delete(token);
    throw new Error('Reset token has expired');
  }

  return tokenData.email;
}

/**
 * Reset password
 */
export function resetUserPassword(token: string, newPassword: string): void {
  const email = verifyResetToken(token);
  const hashedPassword = crypto.createHash('sha256').update(newPassword).digest('hex');

  // Find user and update password
  for (const [userId, user] of users) {
    if (user.email === email && user.provider === 'email') {
      user.password = hashedPassword;
      users.set(userId, user);
      resetTokens.delete(token);
      return;
    }
  }

  throw new Error('User not found');
}

/**
 * Generate JWT token (simplified - use proper JWT library in production)
 */
export function generateToken(user: any): string {
  const payload = {
    id: user.id,
    email: user.email,
    exp: Math.floor(Date.now() / 1000) + 86400, // 24 hours
  };

  // In production, use proper JWT signing
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

/**
 * Send password reset email (mock - replace with real email service)
 */
export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  // In production, use SendGrid, AWS SES, or similar
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
  
  console.log('📧 Password reset email (mock):');
  console.log(`To: ${email}`);
  console.log(`Reset URL: ${resetUrl}`);
  console.log(`Token: ${token}`);
  
  // TODO: Integrate with email service
  // await emailService.send({
  //   to: email,
  //   subject: 'Reset your AIBC password',
  //   html: `Click here to reset your password: <a href="${resetUrl}">${resetUrl}</a>`
  // });
}


 */

import { OAuth2Client } from 'google-auth-library';
import crypto from 'crypto';

// Initialize Google OAuth client (optional - only if GOOGLE_CLIENT_ID is set)
let googleClient: OAuth2Client | null = null;
if (process.env.GOOGLE_CLIENT_ID) {
  googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
}

// In-memory user store (replace with database in production)
const users: Map<string, any> = new Map();
const resetTokens: Map<string, { email: string; expires: number }> = new Map();

/**
 * Verify Google JWT credential
 */
export async function verifyGoogleCredential(credential: string): Promise<any> {
  try {
    if (!googleClient || !process.env.GOOGLE_CLIENT_ID) {
      throw new Error('Google OAuth not configured. Set GOOGLE_CLIENT_ID environment variable.');
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      throw new Error('Invalid token payload');
    }

    return {
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      sub: payload.sub,
    };
  } catch (error: any) {
    console.error('Google credential verification error:', error);
    throw new Error('Invalid Google credential');
  }
}

/**
 * Create or get user from Google auth
 */
export async function getOrCreateGoogleUser(googleUser: any): Promise<any> {
  const userId = `google_${googleUser.sub}`;
  
  if (users.has(userId)) {
    return users.get(userId);
  }

  const newUser = {
    id: userId,
    email: googleUser.email,
    name: googleUser.name,
    picture: googleUser.picture,
    provider: 'google',
    createdAt: new Date().toISOString(),
  };

  users.set(userId, newUser);
  return newUser;
}

/**
 * Create user with email/password
 */
export function createUser(
  email: string,
  password: string,
  firstName?: string,
  lastName?: string
): any {
  // Check if user exists
  for (const [_, user] of users) {
    if (user.email === email && user.provider === 'email') {
      throw new Error('User already exists');
    }
  }

  const userId = `email_${crypto.randomBytes(16).toString('hex')}`;
  const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

  const newUser = {
    id: userId,
    email,
    firstName,
    lastName,
    name: firstName && lastName ? `${firstName} ${lastName}` : firstName || email.split('@')[0],
    password: hashedPassword,
    provider: 'email',
    createdAt: new Date().toISOString(),
  };

  users.set(userId, newUser);
  return newUser;
}

/**
 * Verify email/password
 */
export function verifyUser(email: string, password: string): any {
  const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

  for (const [_, user] of users) {
    if (user.email === email && user.provider === 'email' && user.password === hashedPassword) {
      return user;
    }
  }

  throw new Error('Invalid email or password');
}

/**
 * Generate password reset token
 */
export function generateResetToken(email: string): string {
  // Check if user exists
  let userExists = false;
  for (const [_, user] of users) {
    if (user.email === email) {
      userExists = true;
      break;
    }
  }

  if (!userExists) {
    // Don't reveal if user exists for security
    // Still generate token but it won't work
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expires = Date.now() + 3600000; // 1 hour

  resetTokens.set(token, { email, expires });

  // Clean up expired tokens
  setTimeout(() => {
    resetTokens.delete(token);
  }, 3600000);

  return token;
}

/**
 * Verify reset token
 */
export function verifyResetToken(token: string): string {
  const tokenData = resetTokens.get(token);
  
  if (!tokenData) {
    throw new Error('Invalid or expired reset token');
  }

  if (Date.now() > tokenData.expires) {
    resetTokens.delete(token);
    throw new Error('Reset token has expired');
  }

  return tokenData.email;
}

/**
 * Reset password
 */
export function resetUserPassword(token: string, newPassword: string): void {
  const email = verifyResetToken(token);
  const hashedPassword = crypto.createHash('sha256').update(newPassword).digest('hex');

  // Find user and update password
  for (const [userId, user] of users) {
    if (user.email === email && user.provider === 'email') {
      user.password = hashedPassword;
      users.set(userId, user);
      resetTokens.delete(token);
      return;
    }
  }

  throw new Error('User not found');
}

/**
 * Generate JWT token (simplified - use proper JWT library in production)
 */
export function generateToken(user: any): string {
  const payload = {
    id: user.id,
    email: user.email,
    exp: Math.floor(Date.now() / 1000) + 86400, // 24 hours
  };

  // In production, use proper JWT signing
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

/**
 * Send password reset email (mock - replace with real email service)
 */
export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  // In production, use SendGrid, AWS SES, or similar
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
  
  console.log('📧 Password reset email (mock):');
  console.log(`To: ${email}`);
  console.log(`Reset URL: ${resetUrl}`);
  console.log(`Token: ${token}`);
  
  // TODO: Integrate with email service
  // await emailService.send({
  //   to: email,
  //   subject: 'Reset your AIBC password',
  //   html: `Click here to reset your password: <a href="${resetUrl}">${resetUrl}</a>`
  // });
}

