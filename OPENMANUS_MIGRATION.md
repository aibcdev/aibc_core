# OpenManus Migration Guide

This guide explains how to migrate from the legacy agent system to OpenManus, and how to use the hybrid approach during transition.

## Overview

OpenManus integration allows you to gradually migrate from the current agent system to OpenManus-powered agents. The system supports feature flags to enable OpenManus for specific areas while maintaining backward compatibility.

## Setup

### 1. Install OpenManus Service

Follow the instructions in `OPENMANUS_SETUP.md` to set up the OpenManus Python service.

### 2. Configure Environment Variables

Add these to your `.env` file:

```bash
# OpenManus Configuration
OPENMANUS_ENABLED=true
OPENMANUS_API_URL=http://localhost:8000
OPENMANUS_API_KEY=  # Optional, if required by your OpenManus setup

# Feature Flags - Enable OpenManus for specific features
USE_OPENMANUS_SCAN=false          # Start with false, enable after testing
USE_OPENMANUS_STRATEGY=false      # Start with false, enable after testing
USE_OPENMANUS_COMPETITOR=false    # Start with false, enable after testing
USE_OPENMANUS_CONTENT=false       # Start with false, enable after testing
USE_OPENMANUS_ORCHESTRATION=false # Start with false, enables full orchestration
```

### 3. Start OpenManus Service

```bash
cd openmanus-service
./start.sh
```

Verify it's running:

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

## Migration Strategy

### Phase 1: Testing (Week 1)

1. **Start with one feature**: Enable `USE_OPENMANUS_SCAN=true` only
2. **Run test scans**: Execute a few test scans and compare results
3. **Monitor logs**: Check both OpenManus service logs and Node.js backend logs
4. **Compare outputs**: Verify that OpenManus produces similar or better results

### Phase 2: Gradual Rollout (Week 2-3)

1. **Enable strategy hub**: Set `USE_OPENMANUS_STRATEGY=true`
2. **Enable competitor analysis**: Set `USE_OPENMANUS_COMPETITOR=true`
3. **Test each feature independently**: Enable one at a time, test, then enable the next

### Phase 3: Content Generation (Week 4)

1. **Enable content generation**: Set `USE_OPENMANUS_CONTENT=true`
2. **Test blog post generation**: Verify quality and brand voice matching
3. **Test social content**: Verify platform-specific formatting

### Phase 4: Full Orchestration (Optional, Week 5+)

1. **Enable full orchestration**: Set `USE_OPENMANUS_ORCHESTRATION=true`
2. **This routes ALL agent tasks through OpenManus**
3. **Legacy agents remain as fallback**: If OpenManus fails, system falls back automatically

## Feature Flags Explained

### OPENMANUS_ENABLED

Master switch. Must be `true` for any OpenManus features to work.

### USE_OPENMANUS_SCAN

- **What it does**: Routes footprint scanning to OpenManus
- **Impact**: Affects `/api/scan/start` endpoint
- **Fallback**: Legacy `scanService.ts` if OpenManus fails or is unavailable

### USE_OPENMANUS_STRATEGY

- **What it does**: Routes strategy suggestions to OpenManus
- **Impact**: Affects `/api/strategy/process` and `/api/strategy/suggest` endpoints
- **Fallback**: Legacy LLM-based suggestion generation

### USE_OPENMANUS_COMPETITOR

- **What it does**: Routes competitor analysis to OpenManus
- **Impact**: Affects competitor intelligence gathering during scans
- **Fallback**: Legacy competitor scraping and analysis

### USE_OPENMANUS_CONTENT

- **What it does**: Routes content generation to OpenManus
- **Impact**: Affects blog post and social content generation
- **Fallback**: Legacy content generator service

### USE_OPENMANUS_ORCHESTRATION

- **What it does**: Routes ALL agent tasks through OpenManus in masterCMOAgent
- **Impact**: Complete agent orchestration via OpenManus
- **Fallback**: Individual legacy agents if OpenManus fails

## Rollback Procedures

### Immediate Rollback (All Features)

Set all feature flags to `false`:

```bash
OPENMANUS_ENABLED=false
USE_OPENMANUS_SCAN=false
USE_OPENMANUS_STRATEGY=false
USE_OPENMANUS_COMPETITOR=false
USE_OPENMANUS_CONTENT=false
USE_OPENMANUS_ORCHESTRATION=false
```

The system will immediately revert to legacy agents.

### Partial Rollback (Specific Feature)

Disable the problematic feature:

```bash
USE_OPENMANUS_SCAN=false  # Disable only scanning
```

Other OpenManus features remain active.

### Service Failure Handling

If OpenManus service crashes or becomes unavailable:

1. **Automatic fallback**: The system automatically falls back to legacy agents
2. **Health checks**: Each request checks if OpenManus is available
3. **Error logging**: Errors are logged but don't break the workflow

## Performance Comparison

### Expected Improvements

- **More accurate brand discovery**: OpenManus uses browser automation for real data
- **Better competitor analysis**: Advanced web scraping and analysis
- **Improved content quality**: More context-aware generation
- **Faster execution**: Parallel task execution (if orchestration enabled)

### Monitoring

Monitor these metrics:

1. **Response times**: Compare OpenManus vs legacy execution times
2. **Success rates**: Track error rates for each approach
3. **Content quality**: User feedback on generated content
4. **Resource usage**: CPU and memory usage of OpenManus service

## Troubleshooting

### OpenManus Service Not Starting

**Symptoms**: Health check fails, `isOpenManusAvailable()` returns false

**Solutions**:
1. Check if port 8000 is already in use: `lsof -i :8000`
2. Verify Python virtual environment is activated
3. Check OpenManus service logs: `tail -f openmanus-service/logs/*.log`
4. Verify config file exists: `openmanus-service/config/config.toml`

### Feature Flag Not Working

**Symptoms**: Legacy agents still being used despite flag being `true`

**Solutions**:
1. Verify `OPENMANUS_ENABLED=true` is set
2. Restart Node.js backend after changing flags
3. Check feature flag validation: `backend/src/config/featureFlags.ts`
4. Verify OpenManus service is healthy

### Performance Issues

**Symptoms**: Slow responses, timeouts

**Solutions**:
1. Check OpenManus service resource usage
2. Reduce `max_steps` in task requests
3. Monitor OpenManus service logs for bottlenecks
4. Consider increasing OpenManus service resources

### Quality Issues

**Symptoms**: Poor results compared to legacy system

**Solutions**:
1. Verify OpenManus configuration (LLM API keys, model selection)
2. Check prompt quality in service files (e.g., `openmanusScanService.ts`)
3. Compare OpenManus output with legacy output side-by-side
4. Adjust prompts based on results

## Best Practices

1. **Always test in development first**: Enable flags in dev environment before production
2. **Monitor during migration**: Watch logs and metrics closely during initial rollout
3. **Keep legacy system available**: Don't remove legacy code until migration is proven stable
4. **Document issues**: Track any quality or performance differences
5. **Gradual rollout**: Enable one feature at a time, not all at once

## Next Steps

After successful migration:

1. **Monitor for 2-4 weeks**: Ensure stability and quality
2. **Collect user feedback**: Compare satisfaction metrics
3. **Optimize prompts**: Fine-tune OpenManus task prompts based on results
4. **Consider full migration**: Once all features are stable, consider removing legacy fallbacks
5. **Performance tuning**: Optimize OpenManus configuration for your use case

## Support

For issues or questions:

1. Check OpenManus logs: `openmanus-service/logs/`
2. Check Node.js backend logs: Console output
3. Review feature flag configuration: `backend/src/config/featureFlags.ts`
4. Verify service health: `curl http://localhost:8000/health`
