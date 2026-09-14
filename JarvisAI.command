#!/usr/bin/env bash

# J.A.R.V.I.S. AI - macOS Launcher
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

clear
echo -e "\033[1;36m"
echo "================================================================"
echo "   J.A.R.V.I.S. AI • AUTONOMOUS NEURAL COMPUTER AGENT (macOS)  "
echo "================================================================"
echo -e "\033[0m"

echo "[*] Working directory: $DIR"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "\033[1;31m[!] Node.js topilmadi. Iltimos Node.js 18+ ni o'rnating: https://nodejs.org\033[0m"
    exit 1
fi

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "\033[1;31m[!] npm topilmadi.\033[0m"
    exit 1
fi

# Install dependencies if node_modules missing
if [ ! -d "node_modules" ]; then
    echo "[*] Bog'liqliklar o'rnatilmoqda (npm install)..."
    npm install
fi

# Check if Jarvis local computer agent is already running on port 4141
AGENT_RUNNING=0
if curl -s -f "http://127.0.0.1:4141/ping" > /dev/null 2>&1; then
    AGENT_RUNNING=1
    echo -e "\033[1;32m[✓] Mahalliy Mac kompyuter agenti faol (Port 4141).\033[0m"
else
    echo "[*] Mahalliy Mac kompyuter agenti ishga tushirilmoqda (Port 4141)..."
    node local-agent/agent.js &
    AGENT_PID=$!
    
    # Wait up to 3 seconds for agent to respond
    for i in {1..15}; do
        if curl -s -f "http://127.0.0.1:4141/ping" > /dev/null 2>&1; then
            echo -e "\033[1;32m[✓] Mahalliy Mac kompyuter agenti tayyor (PID: $AGENT_PID).\033[0m"
            break
        fi
        sleep 0.2
    done
fi

echo -e "\033[1;32m[✓] J.A.R.V.I.S. tizimi ishga tushirilmoqda: http://localhost:3000\033[0m"

# Open browser after a slight delay
(sleep 2 && open "http://localhost:3000") &

# Handle graceful exit
cleanup() {
    echo ""
    echo "[*] J.A.R.V.I.S. to'xtatilmoqda..."
    if [ ! -z "$AGENT_PID" ]; then
        kill "$AGENT_PID" 2>/dev/null || true
    fi
    exit 0
}
trap cleanup SIGINT SIGTERM

npm run dev
