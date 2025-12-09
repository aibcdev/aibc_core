# 🔄 DeepSeek Fallback Setup

## ✅ Automatic Fallback Implemented

The backend now **automatically falls back to DeepSeek** when Gemini API fails with:
- Quota exceeded (429 errors)
- Rate limit errors
- Any quota-related issues

## Setup DeepSeek API Key

### 1. Get DeepSeek API Key
1. Go to: https://platform.deepseek.com/api_keys
2. Sign up or log in
3. Create a new API key
4. Copy the key

### 2. Add to Local Backend
```bash
cd backend
echo "DEEPSEEK_API_KEY=your_deepseek_key_here" >> .env
```

### 3. Add to Production (Google Cloud)
```bash
# Store in Secret Manager
echo -n "your_deepseek_key_here" | gcloud secrets create deepseek-api-key --data-file=-

# Update Cloud Run service
gcloud run services update aibc-backend \
  --region us-central1 \
  --update-secrets DEEPSEEK_API_KEY=deepseek-api-key:latest
```

## How It Works

1. **Primary**: Tries Gemini 2.0 Flash (free tier)
2. **On Quota Error**: Automatically switches to DeepSeek
3. **Logs**: Shows `⚠️ Gemini quota exceeded, falling back to DeepSeek...`
4. **Model Selection**:
   - Basic scans → DeepSeek Chat
   - Deep scans → DeepSeek R1 (reasoning model)

## Cost

- **DeepSeek Chat**: ~$0.001 per 1K tokens (~$0.02 per scan)
- **DeepSeek R1**: ~$0.002 per 1K tokens (~$0.04 per scan)
- Very affordable fallback option

## Testing

1. Try a scan with Gemini (should work if quota is fixed)
2. If Gemini fails with quota error, it will automatically use DeepSeek
3. Check backend logs for fallback messages

## Current Status

- ✅ Automatic fallback code added
- ⏳ DeepSeek API key needs to be configured
- ✅ Ready to use once key is added

