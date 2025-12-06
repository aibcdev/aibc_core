import React, { useEffect } from 'react';

interface GoogleSignInButtonProps {
  onSuccess: (credential: string) => void;
  onError?: (error: string) => void;
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  width?: string;
}

/**
 * Google Sign-In Button Component
 * Uses Google Identity Services (gsi) for OAuth
 */
const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  onSuccess,
  onError,
  text = 'signin_with',
  theme = 'outline',
  size = 'large',
  width = '100%'
}) => {
  useEffect(() => {
    // Load Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if ((window as any).google) {
        (window as any).google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
          callback: (response: any) => {
            if (response.credential) {
              onSuccess(response.credential);
            } else {
              onError?.('Failed to get Google credential');
            }
          },
        });
      }
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [onSuccess, onError]);

  return (
    <div
      id="g_id_onload"
      data-client_id={import.meta.env.VITE_GOOGLE_CLIENT_ID || ''}
      data-callback={(response: any) => {
        if (response.credential) {
          onSuccess(response.credential);
        }
      }}
      style={{ width }}
    >
      <div
        className="g_id_signin"
        data-type={theme}
        data-size={size}
        data-text={text}
        data-width={width}
      />
    </div>
  );
};

export default GoogleSignInButton;

