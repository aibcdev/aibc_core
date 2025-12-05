#!/bin/bash

# AIBC Server Startup Script
# This script starts both frontend and backend servers

echo "🚀 Starting AIBC Servers..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Kill existing processes
echo "🧹 Cleaning up existing processes..."
pkill -f "vite" 2>/dev/null
pkill -f "ts-node.*server.ts" 2>/dev/null
pkill -f "nodemon.*server.ts" 2>/dev/null
sleep 2

# Check backend dependencies
echo "📦 Checking backend dependencies..."
cd backend
if [ ! -d "node_modules" ] || [ ! -f "node_modules/express/package.json" ]; then
    echo "⚠️  Installing backend dependencies..."
    npm install
fi
cd ..

# Check frontend dependencies
echo "📦 Checking frontend dependencies..."
if [ ! -d "node_modules" ] || [ ! -f "node_modules/vite/package.json" ]; then
    echo "⚠️  Installing frontend dependencies..."
    npm install
fi

# Start backend
echo ""
echo "🔧 Starting backend server..."
cd backend
npm run dev > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..
sleep 3

# Start frontend
echo "🌐 Starting frontend server..."
npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!

# Wait a bit for servers to start
sleep 5

# Check if servers are running
echo ""
echo "🔍 Checking server status..."
sleep 2

if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is running on http://localhost:3001${NC}"
else
    echo -e "${RED}❌ Backend failed to start. Check backend.log for errors${NC}"
fi

if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend is running on http://localhost:5173${NC}"
else
    echo -e "${RED}❌ Frontend failed to start. Check frontend.log for errors${NC}"
fi

echo ""
echo "📝 Logs:"
echo "  - Backend: tail -f backend.log"
echo "  - Frontend: tail -f frontend.log"
echo ""
echo "🛑 To stop servers: pkill -f 'vite|ts-node|nodemon'"
echo ""
echo "Press Ctrl+C to exit (servers will continue running in background)"

# Keep script running
wait

