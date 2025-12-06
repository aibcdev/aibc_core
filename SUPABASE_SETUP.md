# Supabase Authentication Setup

## Why Supabase?

✅ **Built-in Google OAuth** - No need to configure Google Identity Services manually
✅ **Email/Password Auth** - Ready to use
✅ **User Management** - Automatic user profiles
✅ **Database Included** - PostgreSQL for free
✅ **Real-time** - Built-in subscriptions
✅ **Free Tier** - Generous limits for MVP
✅ **Simple Integration** - Just a few lines of code

## Setup Steps

### 1. Create Supabase Project

1. Go to https://supabase.com
2. Sign up / Sign in
3. Click "New Project"
4. Choose organization
5. Set project name: `aibc-media`
6. Set database password (save it!)
7. Choose region closest to you
8. Wait ~2 minutes for setup

### 2. Get Your Credentials

After project is created:

1. Go to **Settings** → **API**
2. Copy:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

### 3. Enable Google OAuth

1. Go to **Authentication** → **Providers**
2. Click **Google**
3. Enable Google provider
4. You'll need:
   - **Client ID** from Google Cloud Console
   - **Client Secret** from Google Cloud Console
5. Add authorized redirect URL: `https://xxxxx.supabase.co/auth/v1/callback`

### 4. Get Google OAuth Credentials (if you don't have them)

1. Go to https://console.cloud.google.com
2. Create new project or select existing
3. Go to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Authorized redirect URIs: `https://xxxxx.supabase.co/auth/v1/callback`
7. Copy **Client ID** and **Client Secret**

### 5. Add Environment Variables

**Frontend `.env`:**
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Backend `.env` (optional, if you need server-side access):**
```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 6. Install Supabase Client

```bash
npm install @supabase/supabase-js
```

## Integration Code

### Frontend Auth Service (`services/supabaseAuth.ts`)

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Sign in with Google
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  });
  return { data, error };
}

// Sign up with email
export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
}

// Sign in with email
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

// Sign out
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

// Get current user
export function getCurrentUser() {
  return supabase.auth.getUser();
}

// Listen to auth changes
export function onAuthStateChange(callback: (user: any) => void) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });
}
```

### Update Login Components

Replace the mock Google sign-in with:

```typescript
import { signInWithGoogle } from '../services/supabaseAuth';

const handleGoogleSignUp = async () => {
  const { error } = await signInWithGoogle();
  if (error) {
    setError(error.message);
  }
  // Supabase handles redirect automatically
};
```

## Benefits Over Current Setup

| Feature | Current (Custom) | Supabase |
|---------|-----------------|----------|
| Google OAuth | Manual setup | ✅ Built-in |
| Email Auth | Custom backend | ✅ Built-in |
| User Database | localStorage | ✅ PostgreSQL |
| Session Management | Manual | ✅ Automatic |
| Password Reset | Custom | ✅ Built-in |
| User Profiles | Custom | ✅ Built-in |
| Real-time Updates | Polling | ✅ WebSockets |
| Security | Manual | ✅ Built-in RLS |

## Migration Path

1. ✅ Install Supabase client
2. ✅ Replace auth functions
3. ✅ Update login/signup components
4. ✅ Add auth callback handler
5. ✅ Migrate user data (if any)
6. ✅ Test all flows
7. ✅ Remove old auth code

## Cost

**Free Tier:**
- 50,000 monthly active users
- 500MB database
- 1GB file storage
- 2GB bandwidth

**Pro Tier ($25/month):**
- Unlimited users
- 8GB database
- 100GB storage
- 250GB bandwidth

Perfect for MVP! 🎉

