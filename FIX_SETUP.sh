#!/bin/bash

echo "🔧 Fixing Setup..."
echo ""

# Create backend .env
echo "📝 Creating backend/.env..."
cd backend
if [ ! -f .env ]; then
    cat > .env << EOF
PORT=3001
FRONTEND_URL=http://localhost:5173
GEMINI_API_KEY=your_gemini_api_key_here
EOF
    echo "✅ Created backend/.env"
    echo "⚠️  IMPORTANT: Edit backend/.env and add your GEMINI_API_KEY"
else
    echo "✅ backend/.env already exists"
fi
cd ..

# Create frontend .env
echo "📝 Creating frontend .env..."
if [ ! -f .env ]; then
    echo "VITE_API_URL=http://localhost:3001" > .env
    echo "✅ Created frontend .env"
else
    echo "✅ frontend .env already exists"
fi

echo ""
echo "✅ Setup fixed!"
echo ""
echo "📋 Next steps:"
echo "1. Edit backend/.env and add your GEMINI_API_KEY"
echo "2. Start backend: cd backend && npm run dev"
echo "3. Start frontend: npm run dev (in root)"
echo ""
SUPABASE_URL= https://emlywpxvshknvdvziysc.supabase.co
SUPABASE_ANON_KEY= eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtbHl3cHh2c2hrbnZkdnppeXNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MzgwOTYsImV4cCI6MjA4MDUxNDA5Nn0.hoVMer5-gq4dLDLxEyfntBwbaWs7iOEz7Xc3gxiTku0
