/**
 * Google OAuth Service using Google Identity Services
 */

declare global {
  interface Window {
    google?: any;
  }
}

let googleLoaded = false;
let googleClient: any = null;

/**
 * Load Google Identity Services script
 */
export function loadGoogleScript(clientId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (googleLoaded && window.google) {
      resolve();
      return;
    }

    // Check if script already exists
    const existingScript = document.querySelector('script[src*="accounts.google.com/gsi/client"]');
    if (existingScript) {
      // Wait for it to load
      const checkInterval = setInterval(() => {
        if (window.google) {
          googleLoaded = true;
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
      
      setTimeout(() => {
        clearInterval(checkInterval);
        if (!window.google) {
          reject(new Error('Google script timeout'));
        }
      }, 10000);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      googleLoaded = true;
      resolve();
    };
    script.onerror = () => {
      reject(new Error('Failed to load Google Identity Services'));
    };
    document.head.appendChild(script);
  });
}

/**
 * Initialize Google Sign-In
 */
export async function initializeGoogleSignIn(
  clientId: string,
  callback: (credential: string) => void,
  errorCallback?: (error: string) => void
): Promise<void> {
  try {
    await loadGoogleScript(clientId);
    
    if (!window.google) {
      throw new Error('Google Identity Services not loaded');
    }

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response: any) => {
        if (response.credential) {
          callback(response.credential);
        } else {
          errorCallback?.('No credential received');
        }
      },
    });

    googleClient = window.google.accounts.id;
  } catch (error: any) {
    console.error('Failed to initialize Google Sign-In:', error);
    errorCallback?.(error.message || 'Failed to initialize Google Sign-In');
  }
}

/**
 * Render Google Sign-In button
 */
export function renderGoogleButton(
  elementId: string,
  options?: {
    theme?: 'outline' | 'filled_blue' | 'filled_black';
    size?: 'large' | 'medium' | 'small';
    text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
    shape?: 'rectangular' | 'pill' | 'circle' | 'square';
    logo_alignment?: 'left' | 'center';
  }
): void {
  if (!googleClient || !window.google) {
    console.error('Google Sign-In not initialized');
    return;
  }

  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id "${elementId}" not found`);
    return;
  }

  // Clear existing content
  element.innerHTML = '';

  try {
    window.google.accounts.id.renderButton(
      element,
      {
        theme: options?.theme || 'outline',
        size: options?.size || 'large',
        text: options?.text || 'continue_with',
        shape: options?.shape || 'rectangular',
        logo_alignment: options?.logo_alignment || 'left',
        width: '100%',
      }
    );
  } catch (error) {
    console.error('Failed to render Google button:', error);
  }
}

/**
 * Check if Google is loaded
 */
export function isGoogleLoaded(): boolean {
  return googleLoaded && !!window.google;
}

/**
 * Get Google Client ID from environment
 */
export function getGoogleClientId(): string | null {
  return import.meta.env.VITE_GOOGLE_CLIENT_ID || null;
}

