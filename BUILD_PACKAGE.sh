#!/bin/bash

# AIBC Build Package Script
# Creates a production-ready build package

echo "📦 Creating AIBC Build Package..."
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Build frontend
echo -e "${YELLOW}Building frontend...${NC}"
cd /Users/akeemojuko/Documents/aibc_core-1
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed"
    exit 1
fi
echo -e "${GREEN}✅ Frontend built${NC}"
echo ""

# Build backend
echo -e "${YELLOW}Building backend...${NC}"
cd backend
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Backend build failed"
    exit 1
fi
echo -e "${GREEN}✅ Backend built${NC}"
echo ""

# Create package directory
PACKAGE_NAME="aibc-build-$(date +%Y%m%d-%H%M%S)"
PACKAGE_DIR="/Users/akeemojuko/Documents/aibc_core-1/$PACKAGE_NAME"

echo -e "${YELLOW}Creating package directory...${NC}"
mkdir -p "$PACKAGE_DIR"

# Copy frontend build
echo "📁 Copying frontend build..."
cp -r dist "$PACKAGE_DIR/frontend-dist"

# Copy backend build
echo "📁 Copying backend build..."
mkdir -p "$PACKAGE_DIR/backend"
cp -r backend/dist "$PACKAGE_DIR/backend/dist"
cp backend/package.json "$PACKAGE_DIR/backend/"
cp backend/tsconfig.json "$PACKAGE_DIR/backend/" 2>/dev/null || true

# Copy essential files
echo "📁 Copying configuration files..."
cp backend/.env.example "$PACKAGE_DIR/backend/.env.example" 2>/dev/null || true
cp package.json "$PACKAGE_DIR/"
cp README.md "$PACKAGE_DIR/" 2>/dev/null || true

# Create deployment instructions
cat > "$PACKAGE_DIR/DEPLOYMENT.md" << 'EOF'
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
EOF

# Create zip file
echo ""
echo -e "${YELLOW}Creating zip archive...${NC}"
cd /Users/akeemojuko/Documents/aibc_core-1
zip -r "${PACKAGE_NAME}.zip" "$PACKAGE_NAME" -x "*.git*" "*.DS_Store*" "node_modules/*" > /dev/null 2>&1

# Summary
echo ""
echo -e "${GREEN}✅ Build package created!${NC}"
echo ""
echo "📦 Package: $PACKAGE_NAME"
echo "📁 Directory: $PACKAGE_DIR"
echo "📦 Zip file: ${PACKAGE_NAME}.zip"
echo ""
echo "📋 Contents:"
echo "  - frontend-dist/ (Frontend build)"
echo "  - backend/dist/ (Backend build)"
echo "  - backend/package.json"
echo "  - DEPLOYMENT.md (Deployment instructions)"
echo ""
echo "🚀 Ready to deploy!"

