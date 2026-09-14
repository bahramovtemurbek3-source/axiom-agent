@echo off
setlocal enabledelayedexpansion

title JARVIS AI - Autonomous Computer Agent
color 0B

echo ================================================================
echo    J.A.R.V.I.S. AI - AUTONOMOUS NEURAL COMPUTER AGENT
echo ================================================================
echo.

cd /d "%~dp0"
echo [*] Working directory: %cd%

:: Check for Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [!] ERROR: Node.js is not installed or not in PATH.
    echo Please install Node.js 18+ from https://nodejs.org
    pause
    exit /b 1
)

:: Check for npm
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [!] ERROR: npm is not installed.
    pause
    exit /b 1
)

:: Check if node_modules exists, install if missing
if not exist "node_modules\" (
    echo [*] Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo [!] npm install failed.
        pause
        exit /b 1
    )
)

echo [*] Starting JARVIS AI server on http://localhost:3000 ...
start "" http://localhost:3000
npm run dev

pause
