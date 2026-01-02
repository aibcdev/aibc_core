# OpenManus Quick Start

## ✅ Integration Complete

All OpenManus integration code has been implemented and is ready to use.

## 🚀 Quick Start

### 1. Install Rust (Required for some dependencies)

```bash
brew install rust
```

### 2. Start OpenManus Service

```bash
cd openmanus-service
./start.sh
```

The script will:
- Create virtual environment if needed
- Install dependencies
- Start API server on port 8000

### 3. Verify Service is Running

```bash
curl http://localhost:8000/health
```

Expected: `{"status":"healthy","version":"1.0.0"}`

### 4. Configure Node.js Backend

Add to `.env`:

```bash
OPENMANUS_ENABLED=true
OPENMANUS_API_URL=http://localhost:8000
USE_OPENMANUS_SCAN=false  # Enable after testing
```

### 5. Test Integration

Start your Node.js backend and test a scan with OpenManus enabled.

## ⚠️ Troubleshooting

### Dependency Installation Fails

If `pydantic_core` or `tiktoken` fail to build:
1. Install Rust: `brew install rust`
2. Retry: `cd openmanus-service && rm venv/.deps_installed && ./start.sh`

### Service Starts But Agent Disabled

The API server will run in "limited mode" if some dependencies are missing. This is OK for testing the integration. Install all dependencies for full functionality.

### Health Check Returns "limited"

This means the API server is running but the OpenManus agent is not fully available. Install missing dependencies or use the API in limited mode for testing.

## 📚 Documentation

- `OPENMANUS_SETUP.md` - Detailed setup guide
- `OPENMANUS_MIGRATION.md` - Migration strategy
- `OPENMANUS_INTEGRATION.md` - Architecture details
- `openmanus-service/DEPENDENCY_STATUS.md` - Dependency status
- `openmanus-service/QUICK_START.md` - Quick start guide

## 🎯 Next Steps

1. Install Rust if not already installed
2. Run `./start.sh` in `openmanus-service/`
3. Verify health check works
4. Enable feature flags in `.env`
5. Test with a scan or strategy request
