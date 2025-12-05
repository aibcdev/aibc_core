# Backend Server Start Instructions

## Issue
The backend server may not be starting automatically. Here's how to start it manually.

## Manual Start

### Option 1: Using npm run dev (Recommended)
```bash
cd backend
npm run dev
```

### Option 2: Using ts-node directly
```bash
cd backend
npx ts-node src/server.ts
```

### Option 3: Using node with ts-node register
```bash
cd backend
node -r ts-node/register src/server.ts
```

## Verify Backend is Running

Once started, you should see:
```
🚀 Server running on port 3001
📡 Health check: http://localhost:3001/health
```

Test it:
```bash
curl http://localhost:3001/health
```

Should return:
```json
{"status":"ok","timestamp":"..."}
```

## Common Issues

### Port Already in Use
If port 3001 is already in use:
```bash
# Find and kill the process
lsof -ti:3001 | xargs kill -9

# Or change PORT in backend/.env
PORT=3002
```

### Missing Dependencies
```bash
cd backend
npm install
```

### TypeScript Errors
The server should still run with `ts-node` even if there are type errors. If it doesn't start, check:
```bash
cd backend
npx tsc --noEmit
```

## Authentication Endpoints

Once running, these endpoints are available:
- `POST /api/auth/signup` - Sign up
- `POST /api/auth/signin` - Sign in
- `POST /api/auth/google` - Google OAuth
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/me` - Get current user (requires Bearer token)

## Frontend Connection

The frontend is configured to connect to `http://localhost:3001` by default. If you change the backend port, update:
- `services/authClient.ts`
- `services/apiClient.ts`
- Or set `VITE_API_URL` environment variable

