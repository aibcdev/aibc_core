# OpenManus Integration Architecture

This document describes the technical architecture of the OpenManus integration.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Node.js Backend                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Feature Flags (featureFlags.ts)            │  │
│  └──────────────────────────────────────────────────────┘  │
│                          │                                   │
│        ┌─────────────────┴─────────────────┐                │
│        │                                   │                │
│  ┌─────▼──────────┐              ┌────────▼──────┐        │
│  │ OpenManus      │              │ Legacy        │        │
│  │ Services       │              │ Services      │        │
│  └─────┬──────────┘              └────────┬──────┘        │
│        │                                   │                │
│        │  ┌─────────────────────────────┐  │                │
│        └─►│  openmanusService.ts        │  │                │
│           │  (HTTP Client)              │  │                │
│           └──────────┬──────────────────┘  │                │
└──────────────────────┼──────────────────────┘                │
                       │                                         │
                       │ HTTP (REST API)                         │
                       │                                         │
┌──────────────────────▼──────────────────────┐                │
│         OpenManus Python Service            │                │
│  ┌──────────────────────────────────────┐  │                │
│  │     FastAPI Server (api_server.py)   │  │                │
│  └──────────┬───────────────────────────┘  │                │
│             │                                │                │
│  ┌──────────▼──────────────────────────┐   │                │
│  │      Manus Agent Framework          │   │                │
│  │  - Browser Automation               │   │                │
│  │  - Python Execution                 │   │                │
│  │  - File Editing                     │   │                │
│  │  - Tool Integration                 │   │                │
│  └─────────────────────────────────────┘   │                │
└─────────────────────────────────────────────┘

```

## Component Overview

### Node.js Backend Components

#### 1. Feature Flags (`backend/src/config/featureFlags.ts`)

Centralized configuration for enabling/disabling OpenManus features:

- `isOpenManusEnabled()`: Master switch check
- `useOpenManusScan()`: Scan feature flag
- `useOpenManusStrategy()`: Strategy feature flag
- `useOpenManusCompetitor()`: Competitor analysis flag
- `useOpenManusContent()`: Content generation flag
- `useOpenManusOrchestration()`: Full orchestration flag

#### 2. Integration Service (`backend/src/services/openmanusService.ts`)

HTTP client for communicating with OpenManus Python service:

- `checkOpenManusHealth()`: Health check
- `executeOpenManusTask()`: General task execution
- `executeScanTask()`: Scan-specific task
- `executeStrategyTask()`: Strategy-specific task
- `executeCompetitorTask()`: Competitor-specific task
- `executeContentTask()`: Content-specific task
- `executeWithRetry()`: Retry wrapper with exponential backoff

#### 3. Agent Mappings (`backend/src/services/openmanusMappings.ts`)

Maps current agent types to OpenManus capabilities:

- `AGENT_MAPPINGS`: Mapping configuration
- `getOpenManusCapability()`: Get capability for agent type
- `getMaxSteps()`: Get recommended max steps
- `buildOpenManusContext()`: Filter context fields
- `buildOpenManusTaskPrompt()`: Build task prompt from context

#### 4. Service Implementations

- **`openmanusScanService.ts`**: Footprint scanning
- **`openmanusStrategyService.ts`**: Strategy generation
- **`openmanusCompetitorService.ts`**: Competitor analysis
- **`openmanusContentService.ts`**: Content generation

#### 5. Route Updates

- **`backend/src/routes/scan.ts`**: Scan endpoint with OpenManus option
- **`backend/src/routes/strategy.ts`**: Strategy endpoints with OpenManus option
- **`backend/src/routes/competitorTips.ts`**: (Future) Competitor routes

#### 6. Master CMO Agent (`backend/src/services/agents/masterCMOAgent.ts`)

Orchestrator with OpenManus routing:

- Checks `useOpenManusOrchestration()` flag
- Routes tasks to OpenManus if enabled
- Falls back to legacy agents on failure

### OpenManus Python Service

#### 1. API Server (`openmanus-service/api_server.py`)

FastAPI server exposing HTTP endpoints:

- `GET /health`: Health check
- `POST /task`: General task execution
- `POST /scan`: Scan-specific endpoint
- `POST /strategy`: Strategy-specific endpoint
- `POST /competitor`: Competitor-specific endpoint
- `POST /content`: Content-specific endpoint

#### 2. Agent Framework

OpenManus agent framework (from FoundationAgents/OpenManus):

- Browser automation via Playwright
- Python code execution
- File editing capabilities
- Tool integration (MCP, custom tools)
- LLM integration (Ollama, Anthropic, OpenAI, etc.)

## Data Flow

### Scan Flow

```
User Request → /api/scan/start
    │
    ├─► Check: useOpenManusScan()?
    │   │
    │   ├─► YES: openmanusScanService.executeOpenManusScan()
    │   │       │
    │   │       └─► openmanusService.executeScanTask()
    │   │           │
    │   │           └─► HTTP POST → OpenManus /scan
    │   │                           │
    │   │                           └─► Manus Agent executes scan
    │   │                               │
    │   │                               └─► Returns scan results
    │   │
    │   └─► NO: scanService.startScan() (legacy)
    │
    └─► Store results → Response
```

### Strategy Flow

```
User Request → /api/strategy/suggest
    │
    ├─► Check: useOpenManusStrategy()?
    │   │
    │   ├─► YES: openmanusStrategyService.generateOpenManusSuggestions()
    │   │       │
    │   │       └─► openmanusService.executeStrategyTask()
    │   │           │
    │   │           └─► HTTP POST → OpenManus /strategy
    │   │
    │   └─► NO: generateMarketingSuggestions() (legacy)
    │
    └─► Return suggestions
```

### Orchestration Flow

```
Workflow Trigger → masterCMOAgent.orchestrateWorkflow()
    │
    ├─► Check: useOpenManusOrchestration()?
    │   │
    │   ├─► YES: Route all tasks to OpenManus
    │   │       │
    │   │       └─► routeToAgent() → executeOpenManusTask()
    │   │           │
    │   │           └─► HTTP POST → OpenManus /task
    │   │
    │   └─► NO: Route to legacy agents
    │
    └─► Collect results → Return
```

## Error Handling

### Health Check Failure

If OpenManus service is unavailable:

1. Health check returns `false`
2. Feature flag functions return `false`
3. System automatically falls back to legacy agents
4. Error logged but workflow continues

### Task Execution Failure

If OpenManus task fails:

1. Error caught in service layer
2. Error logged with details
3. Falls back to legacy agent (if in hybrid mode)
4. Returns error result to caller

### Retry Logic

OpenManus service includes retry logic:

- Exponential backoff (1s, 2s, 4s)
- Max 3 retries
- No retry on timeout or 4xx errors
- Automatic fallback after max retries

## Configuration

### Environment Variables

```bash
# OpenManus Service
OPENMANUS_ENABLED=true
OPENMANUS_API_URL=http://localhost:8000
OPENMANUS_API_KEY=  # Optional
OPENMANUS_TIMEOUT=300000  # 5 minutes

# Feature Flags
USE_OPENMANUS_SCAN=true
USE_OPENMANUS_STRATEGY=true
USE_OPENMANUS_COMPETITOR=true
USE_OPENMANUS_CONTENT=true
USE_OPENMANUS_ORCHESTRATION=false
```

### OpenManus Service Config

`openmanus-service/config/config.toml`:

```toml
[llm]
api_type = 'ollama'  # or 'anthropic', 'openai', etc.
model = "llama3.2"
base_url = "http://localhost:11434/v1"
api_key = "ollama"
max_tokens = 4096
temperature = 0.0
```

## Performance Considerations

### Latency

- **OpenManus overhead**: ~100-500ms for HTTP request/response
- **Agent execution**: Varies by task complexity (5-60 seconds)
- **Total**: Typically 5-60 seconds per task

### Resource Usage

- **OpenManus service**: Requires Python 3.12+, ~500MB-2GB RAM
- **Browser automation**: Additional memory for Playwright browsers
- **LLM costs**: Depends on configured provider (Ollama = free, others = pay-per-use)

### Optimization Tips

1. **Use local LLMs**: Ollama eliminates API costs
2. **Adjust max_steps**: Lower = faster but less thorough
3. **Parallel execution**: OpenManus can handle multiple tasks
4. **Caching**: Consider caching results for repeated requests

## Security Considerations

1. **Local service**: OpenManus runs locally, data stays on-premise
2. **API authentication**: Optional API key support
3. **Network isolation**: Service runs on localhost by default
4. **Input validation**: All inputs validated before sending to OpenManus
5. **Error sanitization**: Errors logged but sensitive data filtered

## Future Enhancements

1. **Streaming responses**: Real-time progress updates
2. **Batch processing**: Multiple tasks in one request
3. **Custom agents**: Define custom OpenManus agents
4. **Advanced orchestration**: Complex workflow support
5. **Performance monitoring**: Built-in metrics and dashboards

## Related Documentation

- `OPENMANUS_SETUP.md`: Setup and installation guide
- `OPENMANUS_MIGRATION.md`: Migration strategy and rollback procedures
- OpenManus GitHub: https://github.com/FoundationAgents/OpenManus
