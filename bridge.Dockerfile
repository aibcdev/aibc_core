FROM node:20-slim

# Install dependencies for Playwright if needed (optional but good for future proofing)
RUN apt-get update && apt-get install -y \
    libglib2.0-0 \
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libdbus-1-3 \
    libxcb1 \
    libxkbcommon0 \
    libx11-6 \
    libxcomposite1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libpangocairo-1.0-0 \
    libpango-1.0-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (ignoring peer deps to prevent build failures)
RUN npm install --legacy-peer-deps

# Copy the rest of the code
COPY . .

# Run build (TSC)
RUN npm run build

# Expose bridge port
EXPOSE 3000

# Start command
CMD ["npm", "run", "start"]
