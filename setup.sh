#!/bin/bash

# Together - Quick Start Script for macOS/Linux
echo "Starting Together Game Setup..."
echo ""

echo "[1] Installing Backend Dependencies..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "Backend installation failed"
    exit 1
fi
echo "Backend dependencies installed successfully!"
echo ""

echo "[2] Installing Frontend Dependencies..."
cd ../frontend
npm install
if [ $? -ne 0 ]; then
    echo "Frontend installation failed"
    exit 1
fi
echo "Frontend dependencies installed successfully!"
echo ""

echo "[3] Setup Complete!"
echo ""
echo "To start the game:"
echo ""
echo "Terminal 1 (Backend):"
echo "  cd backend"
echo "  npm run dev"
echo ""
echo "Terminal 2 (Frontend):"
echo "  cd frontend"
echo "  npm run dev"
echo ""
echo "Then open: http://localhost:5173"
