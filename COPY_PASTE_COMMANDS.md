# 📋 Copy-Paste Commands (Ready to Use)

## ✅ Step 1: Start Backend (Terminal 1)

Copy and paste these commands one by one:

```bash
cd backend
npm install
npm run install-playwright
npm run dev
```

**You should see:**
```
🚀 Server running on port 3001
📡 Health check: http://localhost:3001/health
```

**Keep this terminal open!**

---

## ✅ Step 2: Start Frontend (Terminal 2 - NEW TERMINAL)

Open a **NEW terminal window** and paste:

```bash
cd /Users/akeemojuko/Documents/aibc_core-1
npm run dev
```

**You should see:**
```
  ➜  Local:   http://localhost:5173/
```

**Keep this terminal open too!**

---

## ✅ Step 3: Open Browser

Open this URL in your browser:
```
http://localhost:5173
```

---

## ✅ Step 4: Test It

1. Click **"Get Started"**
2. Enter a username (e.g., `elonmusk`)
3. Click **"Scan Digital Footprint"**
4. Watch it work!

---

## 🔧 If Backend Won't Start

If you see errors, try:

```bash
cd backend
rm -rf node_modules package-lock.json
npm install
npm run install-playwright
npm run dev
```

---

## 🔧 If Frontend Won't Start

If you see errors, try:

```bash
cd /Users/akeemojuko/Documents/aibc_core-1
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

## ✅ Your API Key is Already Set!

Your Gemini API key is already configured in `backend/.env`:
```
GEMINI_API_KEY=AIzaSyBjy_D8nYNgQ9XymEARDCQvAXIN6ApA25g
```

No need to edit anything - just run the commands above!

---

## 🎯 Quick Test

Once both are running, test the backend:
```bash
curl http://localhost:3001/health
```

Should return: `{"status":"ok",...}`

---

## That's It! 🚀

Just follow the 4 steps above and you're good to go!

