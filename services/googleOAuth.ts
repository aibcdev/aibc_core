/**
 * Google OAuth Service
 * Handles Google Sign-In using Google Identity Services
 */

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: GoogleIdConfiguration) => void;
          renderButton: (element: HTMLElement | null, config?: ButtonConfig) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export interface GoogleIdConfiguration {
  client_id: string;
  callback: (response: GoogleCredentialResponse) => void;
  auto_select?: boolean;
  cancel_on_tap_outside?: boolean;
}

export interface GoogleCredentialResponse {
  credential: string; // JWT token
  select_by: string;
}

export interface ButtonConfig {
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  shape?: 'rectangular' | 'pill' | 'circle' | 'square';
  logo_alignment?: 'left' | 'center';
  width?: string | number;
  locale?: string;
}

let isInitialized = false;
let clientId: string | null = null;

/**
 * Initialize Google Sign-In
 */
export function initializeGoogleSignIn(
  googleClientId: string,
  callback: (credential: string) => void,
  errorCallback?: (error: any) => void
): void {
  if (!window.google) {
    console.error('Google Identity Services not loaded. Make sure script is in index.html');
    if (errorCallback) {
      errorCallback(new Error('Google Identity Services not loaded'));
    }
    return;
  }

  clientId = googleClientId;
  
  window.google.accounts.id.initialize({
    client_id: googleClientId,
    callback: (response: GoogleCredentialResponse) => {
      callback(response.credential);
    },
    auto_select: false,
    cancel_on_tap_outside: true,
  });

  isInitialized = true;
}

/**
 * Render Google Sign-In button
 */
export function renderGoogleButton(
  elementId: string,
  config?: ButtonConfig
): void {
  if (!window.google) {
    console.error('Google Identity Services not loaded');
    return;
  }

  if (!isInitialized) {
    console.error('Google Sign-In not initialized. Call initializeGoogleSignIn first.');
    return;
  }

  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id "${elementId}" not found`);
    return;
  }

  // Clear existing content
  element.innerHTML = '';

  window.google.accounts.id.renderButton(element, {
    theme: config?.theme || 'outline',
    size: config?.size || 'large',
    text: config?.text || 'signin_with',
    width: config?.width || '100%',
    ...config,
  });
}

/**
 * Prompt Google Sign-In (one-tap)
 */
export function promptGoogleSignIn(): void {
  if (!window.google) {
    console.error('Google Identity Services not loaded');
    return;
  }

  if (!isInitialized) {
    console.error('Google Sign-In not initialized');
    return;
  }

  window.google.accounts.id.prompt();
}

/**
 * Check if Google Identity Services is loaded
 */
export function isGoogleLoaded(): boolean {
  return typeof window.google !== 'undefined';
}

/**
 * Get client ID if initialized
 */
export function getClientId(): string | null {
  return clientId;
}

