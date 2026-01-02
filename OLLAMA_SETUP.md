# Ollama Setup Guide

Ollama is a free, local LLM runtime that allows you to run large language models on your machine without any API costs. This guide will help you set up Ollama for use with OpenManus.

## What is Ollama?

- **Free**: No API costs, completely free to use
- **Local**: Runs on your machine, no internet required after setup
- **Unlimited**: No rate limits or daily quotas
- **Private**: All data stays on your machine

## Installation

### macOS

```bash
# Using Homebrew (recommended)
brew install ollama

# Or download from https://ollama.ai/download
```

### Linux

```bash
# Install using the official script
curl -fsSL https://ollama.ai/install.sh | sh

# Or download from https://ollama.ai/download
```

### Windows

Download the installer from https://ollama.ai/download

## Starting Ollama

After installation, start the Ollama service:

```bash
# Start Ollama (runs in background by default)
ollama serve

# Or run in foreground to see logs
ollama serve
```

The service will start on `http://localhost:11434` by default.

## Installing Models

Ollama requires you to "pull" (download) models before use. Here are recommended models:

### For General Use (Recommended)

```bash
# Llama 3.2 (3B parameters - fast, good quality)
ollama pull llama3.2

# Llama 3.1 (8B parameters - better quality, slower)
ollama pull llama3.1

# Mistral (7B parameters - excellent quality)
ollama pull mistral
```

### For Vision Tasks

```bash
# Llama 3.2 Vision (for image analysis)
ollama pull llama3.2-vision

# Llama 3.1 Vision
ollama pull llama3.1-vision
```

### Model Sizes

- **Small models (3-7B)**: Fast, good for most tasks, lower memory usage
- **Large models (13B+)**: Better quality, slower, higher memory usage

**Recommendation**: Start with `llama3.2` (3B) - it's fast and works well for most tasks.

## Verifying Installation

### Check Ollama is Running

```bash
# Test the API
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.2",
  "prompt": "Hello, how are you?",
  "stream": false
}'
```

### List Installed Models

```bash
ollama list
```

### Test a Model

```bash
ollama run llama3.2 "What is 2+2?"
```

## Configuration for OpenManus

OpenManus is already configured to use Ollama. The configuration file is at:

```
openmanus-service/config/config.toml
```

The default configuration uses:
- **Model**: `llama3.2`
- **Base URL**: `http://localhost:11434/v1`
- **API Key**: `ollama` (not used, but required by the config format)

### Changing the Model

To use a different model, edit `openmanus-service/config/config.toml`:

```toml
[llm]
model = "mistral"  # Change to your preferred model
```

Make sure you've pulled the model first:
```bash
ollama pull mistral
```

## System Requirements

### Minimum Requirements

- **RAM**: 8GB (for 3B models)
- **Storage**: 2-4GB per model
- **CPU**: Any modern CPU (GPU optional but recommended)

### Recommended Requirements

- **RAM**: 16GB+ (for larger models)
- **GPU**: NVIDIA GPU with 6GB+ VRAM (for faster inference)
- **Storage**: 10GB+ free space

### GPU Support

Ollama automatically uses GPU if available. To check:

```bash
# Check if GPU is detected
ollama ps
```

## Troubleshooting

### Ollama Not Starting

```bash
# Check if port 11434 is in use
lsof -i :11434

# Kill any existing Ollama processes
pkill ollama

# Restart Ollama
ollama serve
```

### Model Not Found

```bash
# List available models
ollama list

# Pull the model if not installed
ollama pull llama3.2
```

### Out of Memory

If you get out of memory errors:
1. Use a smaller model (e.g., `llama3.2` instead of `llama3.1`)
2. Close other applications
3. Reduce `max_tokens` in config

### Slow Performance

1. **Use GPU**: Install CUDA/ROCm drivers for GPU acceleration
2. **Use smaller model**: 3B models are much faster than 8B+
3. **Reduce max_tokens**: Lower token limits = faster responses

## Integration with OpenManus

Once Ollama is set up:

1. **Start Ollama**: `ollama serve` (or it may auto-start)
2. **Pull a model**: `ollama pull llama3.2`
3. **Verify config**: Check `openmanus-service/config/config.toml`
4. **Start OpenManus**: The service will automatically use Ollama

## Benefits Over Paid APIs

| Feature | Ollama | Gemini/DeepSeek |
|---------|--------|-----------------|
| Cost | Free | Free/Paid |
| Rate Limits | None | Yes (250/day for Gemini) |
| Privacy | 100% local | Data sent to API |
| Internet Required | No (after setup) | Yes |
| Speed | Fast (local) | Depends on API |
| Customization | Full control | Limited |

## Next Steps

1. ✅ Install Ollama
2. ✅ Pull a model (`ollama pull llama3.2`)
3. ✅ Verify it works (`ollama run llama3.2 "test"`)
4. ✅ Start OpenManus service
5. ✅ Test OpenManus with Ollama

## Additional Resources

- **Ollama Website**: https://ollama.ai
- **Model Library**: https://ollama.ai/library
- **Documentation**: https://github.com/ollama/ollama
- **Community**: https://discord.gg/ollama

---

**Note**: OpenManus uses Ollama for agent orchestration, while the legacy scan system uses Gemini (free tier). Both can coexist and serve different purposes.
