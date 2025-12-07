/**
 * Admin Service - Authorization and Admin Functions
 */

const ADMIN_EMAILS = ['watchaibc@gmail.com'];

/**
 * Check if current user is an admin
 */
export function isAdmin(): boolean {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return false;
    
    const user = JSON.parse(userStr);
    return ADMIN_EMAILS.includes(user.email?.toLowerCase());
  } catch (e) {
    console.error('Error checking admin status:', e);
    return false;
  }
}

/**
 * Get admin emails list
 */
export function getAdminEmails(): string[] {
  return [...ADMIN_EMAILS];
}

/**
 * Add admin email (only if current user is admin)
 */
export function addAdminEmail(email: string): boolean {
  if (!isAdmin()) {
    throw new Error('Unauthorized: Only admins can add admin emails');
  }
  
  const normalizedEmail = email.toLowerCase().trim();
  if (!ADMIN_EMAILS.includes(normalizedEmail)) {
    ADMIN_EMAILS.push(normalizedEmail);
    // In production, this would be saved to database
    return true;
  }
  
  return false;
}

/**
 * Get all users (admin only)
 */
export async function getAllUsers(): Promise<any[]> {
  if (!isAdmin()) {
    throw new Error('Unauthorized: Admin access required');
  }
  
  try {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }

    const data = await response.json();
    return data.users || [];
  } catch (error: any) {
    console.error('Get users error:', error);
    // Fallback: return empty array
    return [];
  }
}

/**
 * Get admin dashboard stats
 */
export async function getAdminStats(): Promise<any> {
  if (!isAdmin()) {
    throw new Error('Unauthorized: Admin access required');
  }
  
  try {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    const response = await fetch(`${API_BASE_URL}/api/admin/stats`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch admin stats');
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Get admin stats error:', error);
    // Fallback stats
    return {
      totalUsers: 0,
      activeSubscriptions: 0,
      totalRevenue: 0,
      scansToday: 0,
    };
  }
}

