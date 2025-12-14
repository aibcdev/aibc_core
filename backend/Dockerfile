# Backend Dockerfile for Cloud Run
FROM node:20-alpine

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
# Set browsers path explicitly before installation
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
RUN mkdir -p /ms-playwright
RUN npx playwright install chromium
RUN npx playwright install chromium-headless-shell

# Verify browsers are installed
RUN ls -la /ms-playwright/ || echo "Checking alternative location..."
RUN find /ms-playwright -name "chrome-headless-shell" -type f 2>/dev/null | head -1 || (echo "Browsers not found in /ms-playwright, checking cache..." && find ~/.cache/ms-playwright -name "chrome-headless-shell" -type f 2>/dev/null | head -1)

# Remove dev dependencies (but keep playwright package for runtime)
RUN npm prune --production --no-audit

# Set environment variables
ENV NODE_ENV=production
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
ENV PORT=8080

# Expose port
EXPOSE 8080

# Start server
CMD ["node", "dist/server.js"]

