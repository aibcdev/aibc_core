"""
Cognee Memory Service - FastAPI wrapper for Cognee (Graph RAG)

This service provides a REST API for the Next.js character-chat app
to store and retrieve character memories using Cognee's knowledge graph.
"""

import os
import asyncio
from typing import Optional, List
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

import cognee

load_dotenv()

app = FastAPI(
    title="Cognee Memory Service",
    description="Graph RAG memory for AI characters",
    version="1.0.0"
)

# Allow CORS for local Next.js dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =====================
# Request/Response Models
# =====================

class AddMemoryRequest(BaseModel):
    """Request to add a memory to the knowledge graph"""
    user_id: str
    character_id: str
    content: str
    role: str  # 'user' or 'assistant'
    metadata: Optional[dict] = None


class SearchMemoryRequest(BaseModel):
    """Request to search memories"""
    user_id: str
    character_id: str
    query: str
    limit: Optional[int] = 5


class MemoryResult(BaseModel):
    """A single memory search result"""
    content: str
    score: float
    metadata: Optional[dict] = None


class SearchMemoryResponse(BaseModel):
    """Response from memory search"""
    results: List[MemoryResult]
    context_prompt: str  # Pre-formatted context for LLM injection


class HealthResponse(BaseModel):
    status: str
    version: str


# =====================
# Utility Functions
# =====================

def get_dataset_name(user_id: str, character_id: str) -> str:
    """Generate a unique dataset name for user-character pair"""
    # Cognee uses datasets to namespace data
    return f"user_{user_id[:8]}_char_{character_id[:8]}"


async def ensure_dataset(dataset_name: str):
    """Ensure the dataset exists"""
    # Cognee auto-creates datasets, but we can set it as active
    pass  # Cognee handles this implicitly


# =====================
# API Endpoints
# =====================

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(status="ok", version="1.0.0")


@app.post("/memory/add")
async def add_memory(request: AddMemoryRequest):
    """
    Add a new memory to the knowledge graph.
    
    This will:
    1. Add the content to Cognee
    2. Run cognify() to extract entities and relationships
    3. Store in the knowledge graph
    """
    try:
        dataset = get_dataset_name(request.user_id, request.character_id)
        
        # Format content with metadata for better graph extraction
        formatted_content = f"""
[{request.role.upper()} MESSAGE]
Character: {request.character_id}
User: {request.user_id}
Content: {request.content}
"""
        
        # Add to Cognee
        await cognee.add(formatted_content, dataset_name=dataset)
        
        # Process into knowledge graph
        await cognee.cognify(datasets=[dataset])
        
        return {"status": "success", "dataset": dataset}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/memory/search", response_model=SearchMemoryResponse)
async def search_memory(request: SearchMemoryRequest):
    """
    Search the knowledge graph for relevant memories.
    
    Returns both raw results and a formatted context string
    for injection into LLM prompts.
    """
    try:
        dataset = get_dataset_name(request.user_id, request.character_id)
        
        # Search the knowledge graph
        results = await cognee.search(
            query_text=request.query,
            datasets=[dataset]
        )
        
        # Format results
        memory_results = []
        for i, result in enumerate(results[:request.limit]):
            # Cognee returns different formats, normalize
            content = str(result) if not hasattr(result, 'content') else result.content
            score = 1.0 - (i * 0.1)  # Approximate score based on ranking
            
            memory_results.append(MemoryResult(
                content=content,
                score=score,
                metadata={}
            ))
        
        # Build context prompt for LLM
        if memory_results:
            context_lines = [
                "\n[COGNEE MEMORY - KNOWLEDGE GRAPH CONTEXT]",
                "The following information is retrieved from the structured knowledge graph:",
                ""
            ]
            for mem in memory_results:
                context_lines.append(f"• {mem.content}")
            context_lines.append("\n[END COGNEE MEMORY]\n")
            context_prompt = "\n".join(context_lines)
        else:
            context_prompt = ""
        
        return SearchMemoryResponse(
            results=memory_results,
            context_prompt=context_prompt
        )
        
    except Exception as e:
        # Return empty results on error (don't block chat)
        return SearchMemoryResponse(results=[], context_prompt="")


@app.post("/memory/prune")
async def prune_memory(user_id: str, character_id: str):
    """
    Clear all memories for a user-character pair.
    Use with caution.
    """
    try:
        dataset = get_dataset_name(user_id, character_id)
        await cognee.prune.prune_data(datasets=[dataset])
        return {"status": "pruned", "dataset": dataset}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.on_event("startup")
async def startup_event():
    """Initialize Cognee on startup"""
    print("🧠 Cognee Memory Service starting...")
    
    # Force reload config or check it
    from cognee.infrastructure.llm.config import get_llm_config
    config = get_llm_config()
    print(f"DEBUG: Current LLM Provider in Config: {config.llm_provider}")
    print(f"DEBUG: Env LLM_PROVIDER: {os.getenv('LLM_PROVIDER')}")
    
    # Force set if Env says custom but config says gemini (persistence issue)
    if os.getenv("LLM_PROVIDER") == "custom" and config.llm_provider != "custom":
        print("WARN: Config mismatch. Forcing custom provider.")
        config.llm_provider = "custom"
        config.llm_endpoint = os.getenv("LLM_ENDPOINT")
        config.llm_model = os.getenv("LLM_MODEL")

    print(f"✅ Cognee ready! Provider: {config.llm_provider}")


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8001))
    uvicorn.run(app, host="0.0.0.0", port=port)
