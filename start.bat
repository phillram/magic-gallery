@echo off
REM Magic Card Browser - Quick Start Script for Windows

echo.
echo ================================
echo Magic Card Browser - Setup
echo ================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo ✓ Node.js is installed
node --version
npm --version
echo.

REM Install dependencies
echo Installing dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo ✓ Installation complete!
echo.
echo ================================
echo Starting development server...
echo ================================
echo.
echo Open your browser to: http://localhost:3000
echo Press Ctrl+C to stop the server
echo.

call npm run dev
pause
