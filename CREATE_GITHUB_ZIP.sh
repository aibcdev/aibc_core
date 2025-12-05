#!/bin/bash

# Create GitHub-ready zip file with all source code
# Excludes node_modules, dist, build artifacts, and logs

echo "📦 Creating GitHub-ready zip package..."
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Package name with timestamp
PACKAGE_NAME="aibc-core-source-$(date +%Y%m%d-%H%M%S)"
ZIP_FILE="${PACKAGE_NAME}.zip"

# Create .gitignore if it doesn't exist
if [ ! -f .gitignore ]; then
    echo -e "${YELLOW}Creating .gitignore...${NC}"
    cat > .gitignore << 'EOF'
# Dependencies
node_modules/
backend/node_modules/

# Build outputs
dist/
backend/dist/
*.zip

# Environment variables
.env
backend/.env
.env.local
.env.*.local

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*
backend.log
frontend.log

# OS files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# Temporary files
*.tmp
*.temp
/tmp/
EOF
    echo -e "${GREEN}✅ .gitignore created${NC}"
fi

# Create README if it doesn't exist or is minimal
if [ ! -f README.md ] || [ ! -s README.md ]; then
    echo -e "${YELLOW}Creating README.md...${NC}"
    cat > README.md << 'EOF'
# AIBC - AI Brand Content Platform

A comprehensive AI-powered content creation and brand analysis platform.

## Features

- 🔐 **Authentication**: Sign up, sign in, Google OAuth, password reset
- 🔍 **Digital Footprint Scanning**: Analyze brand presence across platforms
- ✍️ **Content Generation**: AI-powered content creation (text, images, video/audio requests)
- 📊 **Analytics Dashboard**: Real-time analytics and insights
- 🎯 **Competitor Analysis**: Deep competitor intelligence
- 💳 **Credit Management**: Tier-based access control
- 👥 **Admin Panel**: User management and request processing
- 📅 **Calendar & Scheduling**: Content calendar management
- 📬 **Inbox**: Video/audio request management

## Tech Stack

### Frontend
- React 19
- TypeScript
- Vite
- Tailwind CSS
- Lucide React (Icons)

### Backend
- Node.js
- Express
- TypeScript
- Google Gemini AI
- Playwright (Web scraping)
- JWT Authentication

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd aibc_core-1
```

2. Install dependencies
```bash
# Frontend
npm install

# Backend
cd backend
npm install
cd ..
```

3. Set up environment variables

Create `backend/.env`:
```
PORT=3001
FRONTEND_URL=http://localhost:5173
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=your_jwt_secret
PASSWORD_SALT=your_password_salt
```

4. Start development servers

```bash
# Start both (recommended)
npm run dev:all

# Or separately:
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
npm run dev
```

5. Open http://localhost:5173

## Project Structure

```
aibc_core-1/
├── components/          # React components
├── services/            # Frontend API clients
├── types.ts             # TypeScript types
├── backend/
│   ├── src/
│   │   ├── routes/      # API routes
│   │   └── services/    # Business logic
│   └── dist/            # Compiled backend
└── dist/                # Frontend build
```

## Build for Production

```bash
# Frontend
npm run build

# Backend
cd backend
npm run build
```

## Deployment

See `DEPLOYMENT.md` in the build package for deployment instructions.

## License

ISC

## Support

For issues or questions, please open an issue on GitHub.
EOF
    echo -e "${GREEN}✅ README.md created${NC}"
fi

# Create the zip file, excluding common unwanted files
echo -e "${YELLOW}Creating zip file (this may take a moment)...${NC}"

cd /Users/akeemojuko/Documents/aibc_core-1

# Use zip with exclusion patterns
zip -r "$ZIP_FILE" . \
    -x "*.zip" \
    -x "node_modules/*" \
    -x "backend/node_modules/*" \
    -x "dist/*" \
    -x "backend/dist/*" \
    -x "*.log" \
    -x ".git/*" \
    -x ".DS_Store" \
    -x "*/.DS_Store" \
    -x "*.tmp" \
    -x "*.temp" \
    -x ".env" \
    -x "backend/.env" \
    -x ".env.local" \
    -x "*.swp" \
    -x "*.swo" \
    -x ".vscode/*" \
    -x ".idea/*" \
    > /dev/null 2>&1

if [ $? -eq 0 ]; then
    ZIP_SIZE=$(du -h "$ZIP_FILE" | cut -f1)
    echo ""
    echo -e "${GREEN}✅ GitHub-ready zip created!${NC}"
    echo ""
    echo "📦 File: $ZIP_FILE"
    echo "📊 Size: $ZIP_SIZE"
    echo "📍 Location: $(pwd)/$ZIP_FILE"
    echo ""
    echo "📋 Included:"
    echo "  ✅ All source code"
    echo "  ✅ Configuration files"
    echo "  ✅ Package.json files"
    echo "  ✅ Documentation"
    echo ""
    echo "❌ Excluded:"
    echo "  - node_modules/"
    echo "  - dist/ (build outputs)"
    echo "  - .env files"
    echo "  - Log files"
    echo "  - .git/"
    echo ""
    echo "🚀 Ready to upload to GitHub!"
    echo ""
    echo "To upload:"
    echo "  1. Go to your GitHub repository"
    echo "  2. Click 'Add file' > 'Upload files'"
    echo "  3. Drag and drop $ZIP_FILE"
    echo "  4. Or extract and push via git"
else
    echo "❌ Failed to create zip file"
    exit 1
fi

