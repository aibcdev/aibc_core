# API Key Rotation Setup Guide

## ✅ Current Status

**Key #1**: `YOUR_API_KEY_HERE` (configured in environment variables)
- Status: Configured
- Quota: Waiting for activation (can take 10-30 minutes)

## 🔄 Rotation Options

### Option 1: Single Key (Current - Recommended for Now)
**Best for**: Getting started, testing, low volume

**Setup**:
```bash
# backend/.env
GEMINI_API_KEY=YOUR_API_KEY_HERE
```

**Pros**:
- ✅ Simple setup
- ✅ Easy to manage
- ✅ No code changes needed

**Cons**:
- ❌ Limited by single key quota
- ❌ No failover if key fails

---

### Option 2: Multiple Keys with Rotation (Ready to Use)
**Best for**: High volume, production, redundancy

**Setup Method A: Comma-separated list**
```bash
# backend/.env
GEMINI_API_KEYS=key1,key2,key3,key4,key5
```

**Setup Method B: Individual keys**
```bash
# backend/.env
GEMINI_API_KEY_1=YOUR_API_KEY_HERE
GEMINI_API_KEY_2=your_second_key_here
GEMINI_API_KEY_3=your_third_key_here
GEMINI_API_KEY_4=your_fourth_key_here
GEMINI_API_KEY_5=your_fifth_key_here
```

**How it works**:
- ✅ **Round-robin**: Requests distributed evenly across keys
- ✅ **Automatic failover**: If a key fails 5+ times, rotates to next
- ✅ **Usage tracking**: Monitors requests/errors per key
- ✅ **No code changes**: Already implemented!

**Pros**:
- ✅ 5x quota capacity (if each key has 250/day = 1,250/day total)
- ✅ Automatic failover
- ✅ Load distribution
- ✅ Redundancy

**Cons**:
- ⚠️ Need to manage multiple keys
- ⚠️ Each key needs billing/API activation

---

## 📊 Quota Math

### Single Key
- Free tier: 250 requests/day (if available)
- Scans per day: 250 ÷ 5 calls = **50 scans/day**

### 5 Keys with Rotation
- Free tier: 250 requests/day × 5 = 1,250 requests/day
- Scans per day: 1,250 ÷ 5 calls = **250 scans/day**

---

## 🚀 Recommendation

### For Now: **Stick with Single Key**
**Why**:
1. Quota still activating (wait 10-30 minutes)
2. Need to verify first key works
3. Easier to debug issues
4. Can add more keys later

### Later: **Add Rotation When Needed**
**When to add**:
- ✅ First key is working reliably
- ✅ Approaching quota limits
- ✅ Ready for production scale
- ✅ Have all 5 keys ready

---

## 🔧 How to Add More Keys Later

1. **Get 4 more keys** from [Google AI Studio](https://aistudio.google.com/)
2. **Enable billing & API** for each key (same process as key #1)
3. **Update `backend/.env`**:
   ```bash
   GEMINI_API_KEY_1=YOUR_API_KEY_HERE
   GEMINI_API_KEY_2=new_key_2
   GEMINI_API_KEY_3=new_key_3
   GEMINI_API_KEY_4=new_key_4
   GEMINI_API_KEY_5=new_key_5
   ```
4. **Restart backend**: `cd backend && npm run dev`
5. **Done!** Rotation is automatic

---

## 📝 Current Configuration

**File**: `backend/src/services/keyRotation.ts`
- ✅ Round-robin rotation implemented
- ✅ Automatic failover on errors
- ✅ Usage tracking per key
- ✅ Backward compatible (works with single key)

**File**: `backend/src/services/llmService.ts`
- ✅ Integrated with key rotation
- ✅ Automatic key selection
- ✅ Error handling with failover

---

## ⏰ Next Steps

1. **Wait 10-30 minutes** for quota to activate
2. **Test single key** to verify it works
3. **If quota is still 0**: Check billing/API activation in Google Cloud Console
4. **Once working**: Decide if you need rotation (probably not yet)
5. **Add more keys later** when approaching limits

---

## 🐛 Troubleshooting

**Quota still 0?**
- Check: https://aistudio.google.com/usage?tab=rate-limit
- Verify billing is enabled
- Verify Generative Language API is enabled
- Wait 10-30 minutes for propagation

**Rotation not working?**
- Check `backend/.env` has multiple keys
- Check backend logs for `[KEY ROTATION]` messages
- Verify keys are comma-separated or numbered correctly

