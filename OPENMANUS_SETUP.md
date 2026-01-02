# OpenManus Setup Guide

This guide explains how to set up and run the OpenManus service for integration with the AIBC platform.

## Overview

**Important Understanding:**
- **OpenManus is NOT an LLM** - it's an agent framework that orchestrates tasks
- **OpenManus REQUIRES an LLM** to power its agents (just like our legacy system needs an LLM)
- **Ollama is a FREE, local LLM** that can run on your machine - perfect for OpenManus
- **Gemini 2.0 Flash** is used by the legacy scan system (free tier, 250/day)

OpenManus is an open-source Python framework for building AI agents. We run it as a local HTTP API service that the Node.js backend communicates with. The agents need an LLM to function - we recommend Ollama for free, unlimited local use.

## Prerequisites

- Python 3.12 or higher
- pip or uv package manager
- (Optional) Ollama for local LLM support

## Installation

### Step 1: Navigate to OpenManus Service Directory

```bash
cd openmanus-service
```

### Step 2: Create Virtual Environment

```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

Or using uv (faster):

```bash
uv venv --python 3.12
source .venv/bin/activate
uv pip install -r requirements.txt
```

### Step 4: Install Browser Automation (Optional but Recommended)

```bash
playwright install
```

### Step 5: Configure OpenManus

Copy the example configuration:

```bash
cp config/config.example.toml config/config.toml
```

Edit `config/config.toml` with your LLM API keys. **OpenManus is already configured to use Ollama by default** (see `config/config.toml`).

Options include:

- **Ollama** (FREE, local, unlimited - **RECOMMENDED**)
- **Anthropic Claude** (paid)
- **OpenAI GPT** (paid)
- **Azure OpenAI** (paid)
- **AWS Bedrock** (paid)

### Using Ollama (Recommended - Free, Local)

**OpenManus is pre-configured to use Ollama.** You just need to:

1. **Install Ollama** (if not already installed):
   ```bash
   # macOS
   brew install ollama
   
   # Or download from https://ollama.ai
   ```

2. **Start Ollama**:
   ```bash
   ollama serve
   ```

3. **Pull a model**:
   ```bash
   ollama pull llama3.2
   ```

4. **Verify configuration**: The `config/config.toml` file is already set up for Ollama:
   ```toml
   [llm]
   api_type = 'ollama'
   model = "llama3.2"
   base_url = "http://localhost:11434/v1"
   api_key = "ollama"
   ```

**See `OLLAMA_SETUP.md` for detailed Ollama installation and setup instructions.**

#### Example: Using Gemini (Free Tier Available)

```toml
[llm]
model = "gemini-2.0-flash-exp"
base_url = "https://generativelanguage.googleapis.com/v1beta"
api_key = "YOUR_GEMINI_API_KEY"
max_tokens = 8192
temperature = 0.0
```

## Running the Service

### Method 1: Using the Startup Script (Recommended)

```bash
./start.sh
```

The script will:
- Activate the virtual environment
- Install dependencies if needed
- Check for configuration
- Start the API server on port 8000 (configurable via `OPENMANUS_PORT`)

### Method 2: Manual Start

```bash
source venv/bin/activate
export OPENMANUS_PORT=8000
export OPENMANUS_HOST=0.0.0.0
python api_server.py
```

### Method 3: Using uvicorn directly

```bash
source venv/bin/activate
uvicorn api_server:app --host 0.0.0.0 --port 8000
```

## Environment Variables

- `OPENMANUS_PORT` - Port for the API server (default: 8000)
- `OPENMANUS_HOST` - Host address (default: 0.0.0.0)

## API Endpoints

The service exposes the following endpoints:

- `GET /health` - Health check
- `POST /task` - Execute a general task
- `POST /scan` - Execute a footprint scanning task
- `POST /strategy` - Execute a strategy analysis task
- `POST /competitor` - Execute a competitor analysis task
- `POST /content` - Execute a content generation task

## Testing the Service

### Health Check

```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "version": "1.0.0"
}
```

### Execute a Task

```bash
curl -X POST http://localhost:8000/task \
  -H "Content-Type: application/json" \
  -d '{
    "task": "Research information about OpenAI",
    "max_steps": 10
  }'
```

## Integration with Node.js Backend

The Node.js backend communicates with this service via HTTP. See `backend/src/services/openmanusService.ts` for the integration client.

Make sure the service is running before starting the Node.js backend:

```bash
# Terminal 1: Start OpenManus
cd openmanus-service
./start.sh

# Terminal 2: Start Node.js backend
cd backend
npm run dev
```

## Troubleshooting

### Issue: ModuleNotFoundError

**Solution**: Make sure the virtual environment is activated and dependencies are installed:
```bash
source venv/bin/activate
pip install -r requirements.txt
```

### Issue: Port already in use

**Solution**: Change the port:
```bash
export OPENMANUS_PORT=8001
./start.sh
```

### Issue: LLM API errors

**Solution**: 
1. Check your `config/config.toml` has valid API keys
2. Verify your API key has sufficient credits/quota
3. For Ollama, ensure it's running: `ollama serve`

### Issue: Browser automation fails

**Solution**: Install Playwright browsers:
```bash
playwright install
```

## Cost Considerations

### LLM Providers for OpenManus

- **Ollama (Local)**: **FREE**, unlimited, runs locally - **RECOMMENDED**
  - No API costs
  - No rate limits
  - 100% private (data stays local)
  - Requires local compute resources

- **Gemini Free Tier**: Free up to 250 requests/day
  - Used by legacy scan system
  - Not directly supported by OpenManus (would need custom integration)

- **Anthropic/OpenAI**: Pay-per-use
  - Check pricing on their websites
  - Better quality but costs money

### Architecture Summary

- **Legacy Scan System**: Uses Gemini 2.0 Flash (free tier, 250/day)
- **OpenManus Agents**: Uses Ollama (free, unlimited, local)

Both systems can coexist and serve different purposes. OpenManus provides advanced agent orchestration, while the legacy system provides direct LLM calls for scans.

## Next Steps

1. Configure your LLM provider in `config/config.toml`
2. Start the service using `./start.sh`
3. Verify health check endpoint responds
4. Enable OpenManus features in the Node.js backend via feature flags
