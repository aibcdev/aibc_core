#!/bin/bash

# AIBC Development Startup Script

echo "🚀 Starting AIBC Development Environment..."
echo ""

# Check if backend .env exists
if [ ! -f "backend/.env" ]; then
    echo "⚠️  Backend .env not found. Creating from example..."
    cp backend/.env.example backend/.env
    echo "📝 Please edit backend/.env and add your GEMINI_API_KEY"
    echo ""
fi

# Check if frontend .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  Frontend .env not found. Creating from example..."
    cp .env.example .env
    echo ""
fi

# Start both servers
echo "✅ Starting backend and frontend..."
echo "📡 Backend: http://localhost:3001"
echo "🌐 Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

npm run dev:all

