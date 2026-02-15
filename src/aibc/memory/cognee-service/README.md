# Cognee Memory Service

This is a Python microservice that provides **Graph RAG** memory for AI characters using [Cognee](https://github.com/topoteretes/cognee).

## Why Cognee?

Unlike traditional Vector RAG (which finds "similar" chunks via embeddings), Cognee uses a **Knowledge Graph** approach:

| Vector RAG (Old) | Graph RAG (Cognee) |
|---|---|
| Probabilistic similarity | Deterministic graph traversal |
| "Find chunks that sound like X" | "Find entities connected to X" |
| Hard to test | Easy to test (assert graph edges) |
| Good for "vibe" matching | Good for factual relationships |

## Setup

### 1. Create Virtual Environment

```bash
cd cognee-service
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env and add your Google API key
```

The service uses **Gemini** for both LLM and embeddings (same as the main app).

### 4. Run the Service

```bash
python main.py
# Or with uvicorn directly:
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

The service will be available at `http://localhost:8001`.

## API Endpoints

### Health Check
```
GET /health
```

### Add Memory
```
POST /memory/add
{
  "user_id": "user-123",
  "character_id": "char-456",
  "content": "My name is John and I have a brother named Mike.",
  "role": "user"
}
```

This extracts entities (John, Mike) and relationships (brother) into the knowledge graph.

### Search Memory
```
POST /memory/search
{
  "user_id": "user-123",
  "character_id": "char-456",
  "query": "What is the user's brother's name?"
}
```

Returns structured context ready for LLM prompts.

### Prune Memory
```
POST /memory/prune?user_id=xxx&character_id=yyy
```

## Integration with Next.js

The main app uses `lib/cogneeClient.ts` to communicate with this service.

**Important:** The Cognee service must be running for memory features to work. If it's unavailable, the app gracefully falls back to no memory augmentation.

## Production Deployment

For production, deploy this service to:
- Railway
- Render
- DigitalOcean App Platform
- Any Python hosting that supports FastAPI

Set `COGNEE_SERVICE_URL` in your Next.js environment to point to the deployed service.
