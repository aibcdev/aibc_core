# LLM Options Research: Qwen & Together AI

## Summary

Both **Qwen** (Alibaba) and **Together AI** offer competitive alternatives to Gemini, OpenAI, and Claude. However, **pricing information for free tiers is limited**, and most services require paid API access.

## Qwen (Alibaba Cloud)

### Models Available
- **Qwen3-Max**: 1+ trillion parameters, excels in code generation
- **Qwen2.5-Max**: Competitive with GPT-4o, DeepSeek-V3, LLaMA 3.1-405B
- **Qwen3-Next**: Hybrid attention mechanism, efficient resource usage

### Performance
- **Coding**: Qwen3-Coder leads with 67% on SWE-bench (vs GPT-5's 44.7%)
- **General**: Competitive with leading models on various benchmarks
- **Efficiency**: Qwen3-Next achieves comparable performance with fewer resources

### Pricing
- **Free Tier**: Not clearly documented
- **Access**: Requires Alibaba Cloud account
- **Recommendation**: Contact Alibaba Cloud for pricing details

## Together AI

### Models Available
- Supports **200+ open-source models** including:
  - Meta's Llama models
  - DeepSeek models (including DeepSeek-V3.1)
  - Qwen models
  - Many others

### Performance
- **Inference Speed**: 85 tokens/second for DeepSeek-V3.1 queries
- **ATLAS Adaptive Speculator**: 400% inference speedup
- **Infrastructure**: Recently raised $305M Series B ($3.3B valuation)

### Pricing
- **Free Tier**: Limited documentation
- **Access**: Requires Together AI account
- **Recommendation**: Check Together AI pricing page for current rates

## Comparison with Current Setup (Gemini 2.0 Flash)

### Gemini 2.0 Flash Advantages
- ✅ **Free tier available** (with rate limits)
- ✅ **Well-documented API**
- ✅ **Good performance** for content analysis
- ✅ **Already integrated** in codebase
- ✅ **Multimodal capabilities** (text, images, video)

### Qwen/Together AI Advantages
- ✅ **Potentially better coding performance** (Qwen3-Coder)
- ✅ **More model options** (Together AI)
- ✅ **Fast inference** (Together AI infrastructure)
- ❌ **Pricing unclear** (may not have free tier)
- ❌ **Requires new integration** (additional development time)

## Recommendation

**For now, stick with Gemini 2.0 Flash** because:
1. **Free tier available** - critical for cost management
2. **Already working** - no integration overhead
3. **Good enough performance** - meets current needs
4. **Multimodal** - future-proof for image/video analysis

**Consider Together AI or Qwen later** if:
- Gemini free tier becomes insufficient
- Need better coding-specific performance
- Budget allows for paid API access
- Want to experiment with multiple models

## Next Steps

1. **Monitor Gemini 2.0 Flash usage** - track costs and performance
2. **Set up Together AI account** (if free tier exists) - test performance
3. **Contact Alibaba Cloud** - get Qwen pricing details
4. **Benchmark comparison** - test Qwen/Together AI vs Gemini on actual scans
5. **Cost analysis** - compare per-scan costs across providers

## Current Implementation

- **Basic Scans**: Gemini 2.0 Flash (free tier)
- **Deep Scans**: Gemini 2.0 Flash (same model, more comprehensive prompts)
- **Difference**: Amount of information returned, not the LLM model

This approach maximizes cost efficiency while maintaining quality through prompt engineering.


## Summary

Both **Qwen** (Alibaba) and **Together AI** offer competitive alternatives to Gemini, OpenAI, and Claude. However, **pricing information for free tiers is limited**, and most services require paid API access.

## Qwen (Alibaba Cloud)

### Models Available
- **Qwen3-Max**: 1+ trillion parameters, excels in code generation
- **Qwen2.5-Max**: Competitive with GPT-4o, DeepSeek-V3, LLaMA 3.1-405B
- **Qwen3-Next**: Hybrid attention mechanism, efficient resource usage

### Performance
- **Coding**: Qwen3-Coder leads with 67% on SWE-bench (vs GPT-5's 44.7%)
- **General**: Competitive with leading models on various benchmarks
- **Efficiency**: Qwen3-Next achieves comparable performance with fewer resources

### Pricing
- **Free Tier**: Not clearly documented
- **Access**: Requires Alibaba Cloud account
- **Recommendation**: Contact Alibaba Cloud for pricing details

## Together AI

### Models Available
- Supports **200+ open-source models** including:
  - Meta's Llama models
  - DeepSeek models (including DeepSeek-V3.1)
  - Qwen models
  - Many others

### Performance
- **Inference Speed**: 85 tokens/second for DeepSeek-V3.1 queries
- **ATLAS Adaptive Speculator**: 400% inference speedup
- **Infrastructure**: Recently raised $305M Series B ($3.3B valuation)

### Pricing
- **Free Tier**: Limited documentation
- **Access**: Requires Together AI account
- **Recommendation**: Check Together AI pricing page for current rates

## Comparison with Current Setup (Gemini 2.0 Flash)

### Gemini 2.0 Flash Advantages
- ✅ **Free tier available** (with rate limits)
- ✅ **Well-documented API**
- ✅ **Good performance** for content analysis
- ✅ **Already integrated** in codebase
- ✅ **Multimodal capabilities** (text, images, video)

### Qwen/Together AI Advantages
- ✅ **Potentially better coding performance** (Qwen3-Coder)
- ✅ **More model options** (Together AI)
- ✅ **Fast inference** (Together AI infrastructure)
- ❌ **Pricing unclear** (may not have free tier)
- ❌ **Requires new integration** (additional development time)

## Recommendation

**For now, stick with Gemini 2.0 Flash** because:
1. **Free tier available** - critical for cost management
2. **Already working** - no integration overhead
3. **Good enough performance** - meets current needs
4. **Multimodal** - future-proof for image/video analysis

**Consider Together AI or Qwen later** if:
- Gemini free tier becomes insufficient
- Need better coding-specific performance
- Budget allows for paid API access
- Want to experiment with multiple models

## Next Steps

1. **Monitor Gemini 2.0 Flash usage** - track costs and performance
2. **Set up Together AI account** (if free tier exists) - test performance
3. **Contact Alibaba Cloud** - get Qwen pricing details
4. **Benchmark comparison** - test Qwen/Together AI vs Gemini on actual scans
5. **Cost analysis** - compare per-scan costs across providers

## Current Implementation

- **Basic Scans**: Gemini 2.0 Flash (free tier)
- **Deep Scans**: Gemini 2.0 Flash (same model, more comprehensive prompts)
- **Difference**: Amount of information returned, not the LLM model

This approach maximizes cost efficiency while maintaining quality through prompt engineering.



