# Google OAuth Setup Guide

## Frontend Implementation (Google Identity Services)

### Step 1: Add Google OAuth Script to index.html

Add this script tag to `index.html` before the closing `</head>` tag:

```html
<script src="https://accounts.google.com/gsi/client" async defer></script>
```

### Step 2: Create Google OAuth Service

Create `services/googleOAuth.ts`:

```typescript
declare global {
  interface Window {
    google?: any;
  }
}

export interface GoogleUser {
  credential: string; // JWT token
  select_by: string;
}

export function initializeGoogleSignIn(
  clientId: string,
  callback: (response: GoogleUser) => void,
  errorCallback?: (error: any) => void
) {
  if (!window.google) {
    console.error('Google Identity Services not loaded');
    return;
  }

  window.google.accounts.id.initialize({
    client_id: clientId,
    callback: callback,
    auto_select: false,
    cancel_on_tap_outside: true,
  });
}

export function renderGoogleButton(elementId: string) {
  if (!window.google) {
    console.error('Google Identity Services not loaded');
    return;
  }

  window.google.accounts.id.renderButton(
    document.getElementById(elementId),
    {
      theme: 'outline',
      size: 'large',
      text: 'signin_with',
      width: '100%',
    }
  );
}

export function promptGoogleSignIn() {
  if (!window.google) {
    console.error('Google Identity Services not loaded');
    return;
  }

  window.google.accounts.id.prompt();
}
```

### Step 3: Update LoginView.tsx

```typescript
import { useEffect, useRef } from 'react';
import { initializeGoogleSignIn, renderGoogleButton, GoogleUser } from '../services/googleOAuth';
import { signInWithGoogle } from '../services/authClient';

// In component:
const googleButtonRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (!clientId) {
    console.warn('VITE_GOOGLE_CLIENT_ID not set - Google sign-in disabled');
    return;
  }

  const handleGoogleResponse = async (response: GoogleUser) => {
    try {
      // Send JWT to backend for verification
      const result = await signInWithGoogle(response.credential);
      if (result.success && result.user && result.token) {
        storeAuthToken(result.token);
        storeUser(result.user);
        onNavigate(ViewState.INGESTION);
      }
    } catch (error) {
      setError('Failed to sign in with Google');
    }
  };

  initializeGoogleSignIn(clientId, handleGoogleResponse);
  
  // Render button after a short delay to ensure script is loaded
  setTimeout(() => {
    if (googleButtonRef.current) {
      renderGoogleButton(googleButtonRef.current.id);
    }
  }, 500);
}, []);

// In JSX, replace the Google button with:
<div id="google-signin-button" ref={googleButtonRef}></div>
```

### Step 4: Backend Verification

Update `backend/src/routes/auth.ts`:

```typescript
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post('/google', async (req, res) => {
  const { credential } = req.body; // JWT token from Google

  try {
    // Verify the token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(400).json({ error: 'Invalid token' });
    }

    const { sub: googleId, email, name, picture } = payload;

    // Find or create user
    // ... your user creation logic ...

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      user,
      token,
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid Google token' });
  }
});
```

### Step 5: Environment Variables

**Frontend `.env`:**
```
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

**Backend `.env`:**
```
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
JWT_SECRET=your-jwt-secret
```

## Getting Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable "Google+ API" (or "Google Identity Services")
4. Go to "Credentials" → "Create Credentials" → "OAuth client ID"
5. Application type: "Web application"
6. Authorized JavaScript origins:
   - `http://localhost:5173` (dev)
   - `https://aibcmedia.com` (production)
7. Authorized redirect URIs:
   - `http://localhost:5173` (dev)
   - `https://aibcmedia.com` (production)
8. Copy Client ID and Client Secret

## Testing

1. Set environment variables
2. Start backend: `cd backend && npm run dev`
3. Start frontend: `npm run dev`
4. Click "Continue with Google" button
5. Select Google account
6. Should redirect to dashboard after successful auth

