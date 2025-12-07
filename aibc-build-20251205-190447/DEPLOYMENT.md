# AIBC Deployment Guide

## Frontend Deployment

The frontend is built and ready in `frontend-dist/`. You can deploy this to:
- Vercel
- Netlify
- AWS S3 + CloudFront
- Any static hosting service

### Vercel
```bash
npm install -g vercel
cd frontend-dist
vercel
```

### Netlify
```bash
npm install -g netlify-cli
cd frontend-dist
netlify deploy --prod
```

## Backend Deployment

The backend is built and ready in `backend/dist/`. 

### Environment Variables
Copy `backend/.env.example` to `backend/.env` and fill in:
- `PORT` - Server port (default: 3001)
- `JWT_SECRET` - Secret for JWT tokens
- `PASSWORD_SALT` - Salt for password hashing
- `GEMINI_API_KEY` - Google Gemini API key
- `FRONTEND_URL` - Frontend URL for CORS

### Run Backend
```bash
cd backend
npm install --production
npm start
```

### Docker Deployment
```bash
cd backend
docker build -t aibc-backend .
docker run -p 3001:3001 --env-file .env aibc-backend
```

## Full Stack Deployment

### Option 1: Separate Services
- Deploy frontend to Vercel/Netlify
- Deploy backend to Railway/Render/Heroku
- Update frontend `VITE_API_URL` to point to backend

### Option 2: Single Server
- Serve frontend from backend (Express static files)
- Deploy to single server (Railway, Render, etc.)

## Features Included

✅ Authentication (Sign up, Sign in, Google OAuth, Forgot password)
✅ Digital Footprint Scanning
✅ Content Generation (Text, Images, Video/Audio requests)
✅ Analytics Dashboard
✅ Competitor Analysis
✅ Credit Management System
✅ Admin Panel
✅ Calendar & Scheduling
✅ Inbox for Video/Audio Requests

## Support

For issues or questions, refer to the documentation in the source code.
