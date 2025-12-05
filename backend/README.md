# AIBC Backend API

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   npm run install-playwright
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env and add your GEMINI_API_KEY
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

## Environment Variables

- `PORT` - Server port (default: 3001)
- `FRONTEND_URL` - Frontend URL for CORS (default: http://localhost:5173)
- `GEMINI_API_KEY` - Google Gemini API key

## API Endpoints

### POST /api/scan/start
Start a new digital footprint scan.

**Request:**
```json
{
  "username": "elonmusk",
  "platforms": ["twitter", "youtube", "linkedin", "instagram"],
  "scanType": "standard"
}
```

**Response:**
```json
{
  "success": true,
  "scanId": "scan_1234567890_abc123",
  "message": "Scan started successfully"
}
```

### GET /api/scan/:id/status
Get scan status and progress.

**Response:**
```json
{
  "success": true,
  "scan": {
    "id": "scan_1234567890_abc123",
    "status": "scanning",
    "progress": 45,
    "logs": ["[SYSTEM] Initializing...", "..."],
    "error": null
  }
}
```

### GET /api/scan/:id/results
Get scan results (only when status is "complete").

**Response:**
```json
{
  "success": true,
  "data": {
    "extractedContent": { ... },
    "brandDNA": { ... }
  }
}
```

## Development

The server runs on `http://localhost:3001` by default.

Frontend should be configured to call this API (set `VITE_API_URL=http://localhost:3001` in frontend `.env`).

