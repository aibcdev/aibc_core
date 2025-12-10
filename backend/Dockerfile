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

# Install Playwright browsers BEFORE removing dev dependencies
# (playwright is needed for browser installation)
RUN npx playwright install chromium
RUN npx playwright install chromium-headless-shell

# Remove dev dependencies (but keep playwright for runtime)
RUN npm prune --production

# Set environment variables
ENV NODE_ENV=production
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

# Expose port
EXPOSE 8080

# Start server
CMD ["node", "dist/server.js"]

