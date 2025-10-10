#!/bin/bash

# Clean Restart Script for Deal Library
# This prevents the "funky" behavior after major updates

echo "🧹 Cleaning up and restarting Deal Library..."

# Kill any existing processes on our ports
echo "🔴 Stopping existing services..."
lsof -ti:3000,3001,3002 | xargs kill -9 2>/dev/null || true

# Wait for ports to be released
sleep 2

# Clean Next.js cache and build artifacts
echo "🗑️ Cleaning build cache..."
cd "/Users/cgeorge/Deal Library/deal-library-frontend"
rm -rf .next
rm -rf node_modules/.cache

# Clean TypeScript cache
echo "🧽 Cleaning TypeScript cache..."
rm -rf tsconfig.tsbuildinfo

# Start backend
echo "🚀 Starting backend..."
cd "/Users/cgeorge/Deal Library/deal-library-backend"
npm start &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start frontend
echo "🎨 Starting frontend..."
cd "/Users/cgeorge/Deal Library/deal-library-frontend"
npm run dev &
FRONTEND_PID=$!

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 5

# Run health check
echo "🏥 Running health check..."
"/Users/cgeorge/Deal Library/demo-health-check.sh"

echo "✅ Clean restart complete!"
echo "📝 To stop services: kill $BACKEND_PID $FRONTEND_PID"


