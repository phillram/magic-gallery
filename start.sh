#!/bin/bash

# Magic Card Browser - Quick Start Script for macOS/Linux

echo ""
echo "================================"
echo "Magic Card Browser - Setup"
echo "================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "✓ Node.js is installed"
node --version
npm --version
echo ""

# Install dependencies
echo "Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install dependencies"
    exit 1
fi

echo ""
echo "✓ Installation complete!"
echo ""
echo "================================"
echo "Starting development server..."
echo "================================"
echo ""
echo "Open your browser to: http://localhost:3000"
echo "Press Ctrl+C to stop the server"
echo ""

npm run dev
