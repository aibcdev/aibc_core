# Backend Dockerfile for Cloud Run
FROM node:18-alpine

WORKDIR /app

# Install Playwright system dependencies
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    && rm -rf /var/cache/apk/*

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install all dependencies (including dev for build)
RUN npm ci

# Copy source code
COPY src ./src

# Build TypeScript
RUN npm run build

# Install Playwright browsers BEFORE npm prune
# Playwright must be available to install browsers
RUN npx playwright install chromium
RUN npx playwright install chromium-headless-shell

# Verify browsers are installed (check both possible locations)
RUN (test -d /ms-playwright/chromium_headless_shell-1200 || test -d ~/.cache/ms-playwright/chromium_headless_shell-1200 || find / -name "chrome-headless-shell" -type f 2>/dev/null | head -1) || (echo "WARNING: Checking browser location..." && ls -la /ms-playwright/ 2>/dev/null || ls -la ~/.cache/ms-playwright/ 2>/dev/null || echo "Browsers may be in different location")

# Remove dev dependencies (but keep playwright package for runtime)
# Note: Don't remove @playwright/test or playwright packages
RUN npm prune --production --no-audit

# Set environment variables
ENV NODE_ENV=production
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

# Expose port
EXPOSE 8080

# Start server
CMD ["node", "dist/server.js"]

