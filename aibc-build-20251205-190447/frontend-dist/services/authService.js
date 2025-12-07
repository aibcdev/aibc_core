"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = generateToken;
exports.verifyToken = verifyToken;
exports.createUser = createUser;
exports.signInWithEmail = signInWithEmail;
exports.signInWithGoogle = signInWithGoogle;
exports.generatePasswordResetToken = generatePasswordResetToken;
exports.resetPassword = resetPassword;
exports.getUserById = getUserById;
exports.getUserByEmail = getUserByEmail;
exports.updateUser = updateUser;
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// In-memory storage (replace with database in production)
const users = new Map();
const usersByEmail = new Map();
const usersByGoogleId = new Map();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';
/**
 * Hash password using SHA-256 (use bcrypt in production)
 */
function hashPassword(password) {
    return crypto_1.default.createHash('sha256').update(password + (process.env.PASSWORD_SALT || 'salt')).digest('hex');
}
/**
 * Generate JWT token
 */
function generateToken(userId) {
    return jsonwebtoken_1.default.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}
/**
 * Verify JWT token
 */
function verifyToken(token) {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        return decoded;
    }
    catch (error) {
        return null;
    }
}
/**
 * Create user account with email/password
 */
function createUser(email, password, firstName, lastName) {
    // Check if user already exists
    if (usersByEmail.has(email.toLowerCase())) {
        throw new Error('User with this email already exists');
    }
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const passwordHash = hashPassword(password);
    const user = {
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
function signInWithEmail(email, password) {
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
function signInWithGoogle(googleId, email, name, picture) {
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
function generatePasswordResetToken(email) {
    const user = usersByEmail.get(email.toLowerCase());
    if (!user || !user.passwordHash) {
        throw new Error('User not found or account uses Google sign-in');
    }
    const resetToken = crypto_1.default.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000).toISOString(); // 1 hour
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetExpires;
    users.set(user.id, user);
    return resetToken;
}
/**
 * Reset password with token
 */
function resetPassword(token, newPassword) {
    // Find user by reset token
    let user;
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
function getUserById(userId) {
    return users.get(userId);
}
/**
 * Get user by email
 */
function getUserByEmail(email) {
    return usersByEmail.get(email.toLowerCase());
}
/**
 * Update user
 */
function updateUser(userId, updates) {
    const user = users.get(userId);
    if (!user)
        return null;
    const updated = { ...user, ...updates };
    users.set(userId, updated);
    usersByEmail.set(user.email.toLowerCase(), updated);
    if (user.googleId) {
        usersByGoogleId.set(user.googleId, updated);
    }
    return updated;
}
