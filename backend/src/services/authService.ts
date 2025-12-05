import crypto from 'crypto';
import jwt from 'jsonwebtoken';

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  passwordHash?: string; // Only for email/password users
  googleId?: string; // Only for Google OAuth users
  tier: 'free' | 'pro' | 'business' | 'premium';
  credits: number;
  createdAt: string;
  lastLoginAt?: string;
  emailVerified: boolean;
  resetPasswordToken?: string;
  resetPasswordExpires?: string;
}

// In-memory storage (replace with database in production)
const users: Map<string, User> = new Map();
const usersByEmail: Map<string, User> = new Map();
const usersByGoogleId: Map<string, User> = new Map();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

/**
 * Hash password using SHA-256 (use bcrypt in production)
 */
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + (process.env.PASSWORD_SALT || 'salt')).digest('hex');
}

/**
 * Generate JWT token
 */
export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): { userId: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Create user account with email/password
 */
export function createUser(
  email: string,
  password: string,
  firstName?: string,
  lastName?: string
): { user: User; token: string } {
  // Check if user already exists
  if (usersByEmail.has(email.toLowerCase())) {
    throw new Error('User with this email already exists');
  }

  const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const passwordHash = hashPassword(password);
  
  const user: User = {
    id: userId,
    email: email.toLowerCase(),
    firstName,
    lastName,
    name: firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName || email.split('@')[0],
    passwordHash,
    tier: 'free',
    credits: 100, // Starting credits for free tier
    createdAt: new Date().toISOString(),
    emailVerified: false
  };

  users.set(userId, user);
  usersByEmail.set(email.toLowerCase(), user);

  const token = generateToken(userId);

  return { user, token };
}

/**
 * Sign in with email/password
 */
export function signInWithEmail(email: string, password: string): { user: User; token: string } {
  const user = usersByEmail.get(email.toLowerCase());
  
  if (!user || !user.passwordHash) {
    throw new Error('Invalid email or password');
  }

  const passwordHash = hashPassword(password);
  if (passwordHash !== user.passwordHash) {
    throw new Error('Invalid email or password');
  }

  // Update last login
  user.lastLoginAt = new Date().toISOString();
  users.set(user.id, user);

  const token = generateToken(user.id);

  return { user, token };
}

/**
 * Sign in or create user with Google OAuth
 */
export function signInWithGoogle(
  googleId: string,
  email: string,
  name?: string,
  picture?: string
): { user: User; token: string; isNewUser: boolean } {
  // Check if user exists by Google ID
  let user = usersByGoogleId.get(googleId);

  if (user) {
    // Existing user - update last login
    user.lastLoginAt = new Date().toISOString();
    users.set(user.id, user);
    const token = generateToken(user.id);
    return { user, token, isNewUser: false };
  }

  // Check if user exists by email (account merge scenario)
  user = usersByEmail.get(email.toLowerCase());
  
  if (user) {
    // Link Google account to existing email account
    user.googleId = googleId;
    user.lastLoginAt = new Date().toISOString();
    user.emailVerified = true;
    users.set(user.id, user);
    usersByGoogleId.set(googleId, user);
    const token = generateToken(user.id);
    return { user, token, isNewUser: false };
  }

  // New user - create account
  const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  user = {
    id: userId,
    email: email.toLowerCase(),
    name: name || email.split('@')[0],
    googleId,
    tier: 'free',
    credits: 100,
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    emailVerified: true
  };

  users.set(userId, user);
  usersByEmail.set(email.toLowerCase(), user);
  usersByGoogleId.set(googleId, user);

  const token = generateToken(userId);

  return { user, token, isNewUser: true };
}

/**
 * Generate password reset token
 */
export function generatePasswordResetToken(email: string): string {
  const user = usersByEmail.get(email.toLowerCase());
  
  if (!user || !user.passwordHash) {
    throw new Error('User not found or account uses Google sign-in');
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetExpires = new Date(Date.now() + 3600000).toISOString(); // 1 hour

  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = resetExpires;
  users.set(user.id, user);

  return resetToken;
}

/**
 * Reset password with token
 */
export function resetPassword(token: string, newPassword: string): void {
  // Find user by reset token
  let user: User | undefined;
  
  for (const u of users.values()) {
    if (u.resetPasswordToken === token && u.resetPasswordExpires) {
      const expires = new Date(u.resetPasswordExpires);
      if (expires > new Date()) {
        user = u;
        break;
      }
    }
  }

  if (!user) {
    throw new Error('Invalid or expired reset token');
  }

  user.passwordHash = hashPassword(newPassword);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  users.set(user.id, user);
}

/**
 * Get user by ID
 */
export function getUserById(userId: string): User | undefined {
  return users.get(userId);
}

/**
 * Get user by email
 */
export function getUserByEmail(email: string): User | undefined {
  return usersByEmail.get(email.toLowerCase());
}

/**
 * Update user
 */
export function updateUser(userId: string, updates: Partial<User>): User | null {
  const user = users.get(userId);
  if (!user) return null;

  const updated = { ...user, ...updates };
  users.set(userId, updated);
  usersByEmail.set(user.email.toLowerCase(), updated);
  if (user.googleId) {
    usersByGoogleId.set(user.googleId, updated);
  }

  return updated;
}

