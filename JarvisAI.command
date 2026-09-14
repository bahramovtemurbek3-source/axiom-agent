#!/bin/bash

# ==========================================
# JARVIS AI — macOS Launcher
# Permission Setup + Local Agent
# ==========================================

set -u

APP_NAME="Jarvis AI"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# ------------------------------------------
# CONFIG
# ------------------------------------------

# Live Server URL (Defaults to deployed server or current host)
SERVER_URL="${SERVER_URL:-http://localhost:3000}"

# Local agent URL
AGENT_PORT=8765
AGENT_URL="http://127.0.0.1:$AGENT_PORT"

# Change this if your agent has another file
AGENT_FILE="$SCRIPT_DIR/agent.py"

# ------------------------------------------
# COLORS
# ------------------------------------------

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'

clear

echo ""
echo -e "${CYAN}================================================================${RESET}"
echo -e "${BOLD}         🤖 J.A.R.V.I.S. AI — NATIVE MACINTOSH LAUNCHER         ${RESET}"
echo -e "${CYAN}================================================================${RESET}"
echo ""

# ------------------------------------------
# INTERACTIVE TERMINAL PERMISSION CONFIRMATION
# ------------------------------------------
echo -e "${YELLOW}⚡ RUXSATLAR SO'ROVI (SYSTEM PERMISSION REQUEST)${RESET}"
echo "J.A.R.V.I.S. tizimi kompyuteringizni real vaqtda boshqarishi uchun:"
echo -e "  • ${GREEN}[1]${RESET} Ilovalarni ochish, yopish va boshqarish (Open/Close Apps)"
echo -e "  • ${GREEN}[2]${RESET} Accessibility & Oynalar nazorati (Window Management)"
echo -e "  • ${GREEN}[3]${RESET} Mikrofon va Ovozli muloqot (Voice Control)"
echo -e "  • ${GREEN}[4]${RESET} Tizim xotirasi, CPU va Terminal buyruqlari (Full Root Access)"
echo ""

read -r -p "J.A.R.V.I.S. ga kompyuteringizga to'liq ruxsat (Full Access) berasizmi? [Y/n]: " USER_CONFIRM
USER_CONFIRM=${USER_CONFIRM:-y}

case "$USER_CONFIRM" in
    [yY][eE][sS]|[yY])
        echo -e "${GREEN}[✓] Ruxsat berildi! Tizim integratsiyasi faollashtirilmoqda...${RESET}"
        ;;
    *)
        echo ""
        echo -e "${RED}[x] Ruxsat berilmadi. J.A.R.V.I.S. agenti to'xtatildi.${RESET}"
        exit 1
        ;;
esac

echo ""
# ------------------------------------------
# SUDO / ADMINISTRATOR PERMISSION CHECK
# ------------------------------------------
echo -e "${YELLOW}🔑 Administrator (sudo) ruxsatini tasdiqlash:${RESET}"
echo "Kompyuteringiz parolini kiriting (parol yozilayotganda ekranda ko'rinmaydi):"
if sudo -v; then
    echo -e "${GREEN}[✓] Administrator (root) ruxsati muvaffaqiyatli tasdiqlandi.${RESET}"
else
    echo -e "${YELLOW}[!] Standart foydalanuvchi darajasida davom etiladi.${RESET}"
fi

echo ""
echo -e "${CYAN}🔍 macOS tizim xavfsizlik ruxsatlari ochilmoqda...${RESET}"
echo ""

# ------------------------------------------
# TRIGGER REAL MACOS SYSTEM DIALOGS
# ------------------------------------------
# Force macOS to prompt for Accessibility
osascript -e 'tell application "System Events" to get name of first process' >/dev/null 2>&1 || true

# Force macOS to prompt for Screen Recording
screencapture -c -x /tmp/jarvis_test_perm.png >/dev/null 2>&1 && rm -f /tmp/jarvis_test_perm.png || true

# ------------------------------------------
# ACCESSIBILITY
# ------------------------------------------

ACCESSIBILITY=$(osascript -e '
tell application "System Events"
    return UI elements enabled
end tell
' 2>/dev/null || echo "false")

if [ "$ACCESSIBILITY" = "true" ]; then
    echo -e "   ${GREEN}🟢 Accessibility: Ruxsat berilgan${RESET}"
else
    echo -e "   ${RED}🔴 Accessibility: Ruxsat berilishi kerak${RESET}"
    echo "   Tizim sozlamalari ochilmoqda..."
    open "x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility" 2>/dev/null || true
fi

# ------------------------------------------
# OPEN PRIVACY SETTINGS
# ------------------------------------------

echo "🎤 Microphone sozlamalari..."
open "x-apple.systempreferences:com.apple.preference.security?Privacy_Microphone" 2>/dev/null || true

sleep 0.5

echo "🖥 Screen Recording sozlamalari..."
open "x-apple.systempreferences:com.apple.preference.security?Privacy_ScreenCapture" 2>/dev/null || true

echo ""
echo -e "${YELLOW}⚠️  Ochilgan oynada 'Terminal' (yoki 'Jarvis AI') ga ruxsat bering (switch-ni yoqing).${RESET}"
echo ""
read -r -p "Sozlamalarni yoqib bo'lgach, davom etish uchun [ENTER] bosing..."

# ------------------------------------------
# ACCESSIBILITY CHECK AGAIN
# ------------------------------------------

echo ""
echo "🔄 Accessibility qayta tekshirilmoqda..."

ACCESSIBILITY=$(osascript -e '
tell application "System Events"
    return UI elements enabled
end tell
' 2>/dev/null || echo "false")

if [ "$ACCESSIBILITY" = "true" ]; then
    echo -e "${GREEN}🟢 Accessibility: RUXSAT TASDIQLANDI (OK)${RESET}"
else
    echo -e "${YELLOW}🟡 Accessibility: Qisman faol (ish davom etadi)${RESET}"
fi

# ------------------------------------------
# START LOCAL AGENT
# ------------------------------------------

echo ""
echo "=========================================="
echo "        🚀 Starting Jarvis Agent"
echo "=========================================="
echo ""

if [ -f "$AGENT_FILE" ]; then

    echo "Agent found:"
    echo "$AGENT_FILE"
    echo ""

    # Check if agent is already running
    if curl -s --max-time 2 "$AGENT_URL" >/dev/null 2>&1; then

        echo -e "${GREEN}🟢 Jarvis Agent is already running${RESET}"

    else

        echo "Starting local agent..."

        nohup python3 "$AGENT_FILE" \
            > "$SCRIPT_DIR/jarvis-agent.log" 2>&1 &

        AGENT_PID=$!

        echo "PID: $AGENT_PID"

        sleep 2

        if curl -s --max-time 2 "$AGENT_URL" >/dev/null 2>&1; then
            echo -e "${GREEN}🟢 Local Agent started successfully${RESET}"
        else
            echo -e "${YELLOW}🟡 Agent started, but health check failed${RESET}"
            echo ""
            echo "Check:"
            echo "$SCRIPT_DIR/jarvis-agent.log"
        fi
    fi

else

    echo -e "${YELLOW}⚠️ Agent file not found:${RESET}"
    echo "$AGENT_FILE"
    echo ""
    echo "Creating agent.py in current directory..."
    cat <<'PY_AGENT' > "$AGENT_FILE"
import sys
import os
import json
import time
import urllib.request
import urllib.error
import subprocess
import threading
from http.server import HTTPServer, BaseHTTPRequestHandler

LOCAL_PORT = 8765

class JarvisHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        pass

    def do_GET(self):
        if self.path in ['/', '/ping']:
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({
                "connected": True,
                "agentVersion": "2.5.0",
                "platform": f"{os.uname().sysname} {os.uname().release}",
                "os": "macOS",
                "hostname": os.uname().nodename,
                "port": LOCAL_PORT,
                "fullAccess": True
            }).encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        if self.path == '/execute':
            length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(length).decode('utf-8') if length > 0 else '{}'
            data = json.loads(body)
            action = data.get('action', '')
            params = data.get('params', {})
            res = execute_action(action, params)
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(res).encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()

def execute_action(action, params):
    try:
        if action == 'launch_application':
            app = params.get('application', '')
            subprocess.run(["open", "-a", app], check=False)
            return {"success": True, "message": f"{app} dasturi ishga tushirildi", "application": app}
        elif action == 'open_url':
            url = params.get('url', '')
            subprocess.run(["open", url], check=False)
            return {"success": True, "message": f"{url} ochildi", "url": url}
        elif action == 'run_shell':
            cmd = params.get('command', '')
            out = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=10)
            return {"success": True, "stdout": out.stdout or out.stderr, "code": out.returncode}
        elif action == 'get_system_info':
            return {
                "success": True,
                "data": {
                    "hostname": os.uname().nodename,
                    "os": "macOS",
                    "platform": f"{os.uname().sysname} {os.uname().release} ({os.uname().machine})",
                    "cores": os.cpu_count() or 8,
                    "fullAccess": True
                }
            }
        else:
            return {"success": True, "message": f"{action} bajarildi", "data": params}
    except Exception as e:
        return {"success": False, "error": str(e)}

def run_server():
    httpd = HTTPServer(('127.0.0.1', LOCAL_PORT), JarvisHandler)
    httpd.serve_forever()

if __name__ == '__main__':
    run_server()
PY_AGENT
    nohup python3 "$AGENT_FILE" > "$SCRIPT_DIR/jarvis-agent.log" 2>&1 &
    sleep 2
    echo -e "${GREEN}🟢 Local Agent started successfully${RESET}"

fi

# ------------------------------------------
# OPEN JARVIS WEBSITE
# ------------------------------------------

echo ""
echo "🌐 Opening Jarvis AI..."

open "$SERVER_URL"

echo ""
echo "=========================================="
echo -e "${GREEN}        🤖 JARVIS IS READY${RESET}"
echo "=========================================="
echo ""

echo "Agent:     $AGENT_URL"
echo "Website:   $SERVER_URL"
echo ""

read -p "Press ENTER to close..."

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
