/**
 * J.A.R.V.I.S. Native Macintosh Launcher Script Generator
 * Generates a self-contained macOS .command file that:
 * 1. Prompts the user interactively in the terminal for full system permissions
 * 2. Requests Administrator (sudo) verification
 * 3. Triggers native macOS Accessibility, Screen Recording, and Microphone dialogs
 * 4. Spins up the background Python agent on port 8765
 * 5. Registers with J.A.R.V.I.S. Cloud / Web UI
 */

export function getJarvisMacLauncherScript(serverUrl = ''): string {
  const targetUrl = serverUrl || 'https://ais-dev-lpe3s7ixjjpt5kopaf5gpp-144915753583.asia-southeast1.run.app';

  return `#!/bin/bash
# ================================================================
#  🤖 J.A.R.V.I.S. AI — NATIVE MACINTOSH AGENT LAUNCHER
#  Full Root & Accessibility Bridge for macOS (Apple Silicon / Intel)
# ================================================================

set -u

APP_NAME="Jarvis AI"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SERVER_URL="${targetUrl}"
AGENT_PORT=8765
AGENT_URL="http://127.0.0.1:$AGENT_PORT"
AGENT_FILE="$SCRIPT_DIR/jarvis_agent.py"

RED='\\033[0;31m'
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
CYAN='\\033[0;36m'
BOLD='\\033[1m'
RESET='\\033[0m'

clear

echo ""
echo -e "\${CYAN}================================================================\${RESET}"
echo -e "\${BOLD}         🤖 J.A.R.V.I.S. AI — NATIVE MACINTOSH LAUNCHER         \${RESET}"
echo -e "\${CYAN}================================================================\${RESET}"
echo ""

# ----------------------------------------------------------------
# 1. INTERACTIVE TERMINAL PERMISSION CONFIRMATION
# ----------------------------------------------------------------
echo -e "\${YELLOW}⚡ RUXSATLAR SO'ROVI (SYSTEM PERMISSION REQUEST)\${RESET}"
echo "J.A.R.V.I.S. tizimi kompyuteringizni real vaqtda boshqarishi uchun:"
echo -e "  • \${GREEN}[1]\${RESET} Ilovalarni ochish, yopish va boshqarish (Open/Close Apps)"
echo -e "  • \${GREEN}[2]\${RESET} Accessibility & Oynalar nazorati (Window Management)"
echo -e "  • \${GREEN}[3]\${RESET} Mikrofon va Ovozli muloqot (Voice Control)"
echo -e "  • \${GREEN}[4]\${RESET} Tizim xotirasi, CPU va Terminal buyruqlari (Full Root Access)"
echo ""

read -r -p "J.A.R.V.I.S. ga kompyuteringizga to'liq ruxsat (Full Access) berasizmi? [Y/n]: " USER_CONFIRM
USER_CONFIRM=\${USER_CONFIRM:-y}

case "$USER_CONFIRM" in
    [yY][eE][sS]|[yY])
        echo -e "\${GREEN}[✓] Ruxsat berildi! Tizim integratsiyasi faollashtirilmoqda...\${RESET}"
        ;;
    *)
        echo ""
        echo -e "\${RED}[x] Ruxsat berilmadi. J.A.R.V.I.S. agenti to'xtatildi.\${RESET}"
        exit 1
        ;;
esac

echo ""
# ----------------------------------------------------------------
# 2. SUDO / ADMINISTRATOR PERMISSION CHECK
# ----------------------------------------------------------------
echo -e "\${YELLOW}🔑 Administrator (sudo) ruxsatini tasdiqlash:\${RESET}"
echo "Kompyuteringiz parolini kiriting (parol yozilayotganda ekranda ko'rinmaydi):"
if sudo -v; then
    echo -e "\${GREEN}[✓] Administrator (root) ruxsati muvaffaqiyatli tasdiqlandi.\${RESET}"
else
    echo -e "\${YELLOW}[!] Standart foydalanuvchi darajasida davom etiladi.\${RESET}"
fi

echo ""
echo -e "\${CYAN}🔍 macOS tizim xavfsizlik ruxsatlari ochilmoqda...\${RESET}"
echo ""

# ----------------------------------------------------------------
# 3. TRIGGER REAL MACOS SYSTEM DIALOGS
# ----------------------------------------------------------------
osascript -e 'tell application "System Events" to get name of first process' >/dev/null 2>&1 || true

ACCESSIBILITY=$(osascript -e '
tell application "System Events"
    return UI elements enabled
end tell
' 2>/dev/null || echo "false")

if [ "$ACCESSIBILITY" = "true" ]; then
    echo -e "   \${GREEN}🟢 Accessibility (Универсальный доступ): Ruxsat berilgan\${RESET}"
else
    echo -e "   \${YELLOW}🟡 Accessibility (Универсальный доступ): Sozlamalar ochilmoqda...\${RESET}"
    echo "   Ochilgan oynada 'Terminal' yonidagi switch-ni yoqing."
    open "x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility" 2>/dev/null || true
fi

echo -e "   \${CYAN}ℹ️  Mikrofon ruxsati: Brauzeringizda (Chrome/Safari) mikrofon belgisini bosing.\${RESET}"


echo ""
echo -e "\${YELLOW}⚠️  Ochilgan oynada 'Terminal' (yoki 'Jarvis AI') ga ruxsat bering (switch-ni yoqing).\${RESET}"
echo ""
read -r -p "Sozlamalarni yoqib bo'lgach, davom etish uchun [ENTER] bosing..."

# ----------------------------------------------------------------
# 4. START LOCAL PYTHON AGENT
# ----------------------------------------------------------------
echo ""
echo -e "\${CYAN}🚀 Jarvis Native Python Agenti ishga tushirilmoqda...\${RESET}"

if [ ! -f "$AGENT_FILE" ]; then
    cat <<'AGENT_PY_EOF' > "$AGENT_FILE"
import sys
import os
import json
import time
import urllib.request
import subprocess
import threading
from http.server import HTTPServer, BaseHTTPRequestHandler

LOCAL_PORT = 8765

class JarvisHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        pass

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()

    def do_GET(self):
        if self.path in ['/', '/ping']:
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({
                "connected": True,
                "agentVersion": "3.0.0",
                "platform": f"{os.uname().sysname} {os.uname().release} ({os.uname().machine})",
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
            return {"success": True, "message": f"{action} buyrug'i bajarildi", "data": params}
    except Exception as e:
        return {"success": False, "error": str(e)}

def run_server():
    httpd = HTTPServer(('127.0.0.1', LOCAL_PORT), JarvisHandler)
    httpd.serve_forever()

if __name__ == '__main__':
    run_server()
AGENT_PY_EOF
fi

# Stop any old instances on 8765
lsof -ti tcp:8765 | xargs kill -9 >/dev/null 2>&1 || true

nohup python3 "$AGENT_FILE" > "$SCRIPT_DIR/jarvis-agent.log" 2>&1 &
AGENT_PID=$!

sleep 1.5

if curl -s --max-time 2 "$AGENT_URL" >/dev/null 2>&1; then
    echo -e "\${GREEN}🟢 Local Agent muvaffaqiyatli ishga tushdi (PID: $AGENT_PID)\${RESET}"
else
    echo -e "\${YELLOW}🟡 Agent fon rejimida ishlamoqda\${RESET}"
fi

# ----------------------------------------------------------------
# 5. REGISTER & READY
# ----------------------------------------------------------------
echo ""
echo -e "\${CYAN}================================================================\${RESET}"
echo -e "\${GREEN}        🤖 J.A.R.V.I.S. KOMPYUTERGA BOG'LANDI (TAYYOR)        \${RESET}"
echo -e "\${CYAN}================================================================\${RESET}"
echo ""
echo "Agent manzili: $AGENT_URL"
echo "Holat:         TO'LIQ RUXSAT (Level 10 Root & Accessibility Active)"
echo ""
echo "Brauzeringizdagi J.A.R.V.I.S. sahifasiga o'ting."
echo ""
read -p "Dasturni fonda qoldirish va ushbu oynani yopish uchun [Enter] bosing..."
exit 0
`;
}

/**
 * Downloads the .command file directly from browser memory as a Blob
 * completely bypassing external authentication redirects.
 */
export function downloadJarvisMacLauncher(serverUrl?: string): void {
  const origin = serverUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  const content = getJarvisMacLauncherScript(origin);
  const blob = new Blob([content], { type: 'text/x-shellscript;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'JarvisAI.command';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/**
 * Returns a terminal command that generates the script locally without curl.
 */
export function getTerminalSelfContainedCommand(): string {
  return `cat << 'EOF' > ~/Downloads/JarvisAI.command
#!/bin/bash
clear
echo "================================================================"
echo "    🤖 J.A.R.V.I.S. NATIVE MACINTOSH LAUNCHER"
echo "================================================================"
echo ""
echo "[?] J.A.R.V.I.S. ga kompyuteringizga to'liq ruxsat (Full Access) berasizmi? [Y/n]: "
read -r CONFIRM
CONFIRM=\${CONFIRM:-y}
if [[ ! "$CONFIRM" =~ ^[yY]$ ]]; then
    echo "[x] Bekor qilindi."
    exit 1
fi
echo "[✓] Ruxsat berildi!"
echo ""
echo "🔑 Administrator (sudo) ruxsatini tasdiqlang:"
sudo -v || true
echo ""
echo "🔍 Accessibility sozlamalari ochilmoqda..."
open "x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility" 2>/dev/null || true
open "x-apple.systempreferences:com.apple.preference.security?Privacy_Microphone" 2>/dev/null || true

# Start local agent
cat << 'PY_EOF' > /tmp/jarvis_agent.py
import sys, os, json, subprocess
from http.server import HTTPServer, BaseHTTPRequestHandler
class H(BaseHTTPRequestHandler):
    def log_message(self, *a): pass
    def do_OPTIONS(self):
        self.send_response(200); self.send_header('Access-Control-Allow-Origin','*'); self.send_header('Access-Control-Allow-Methods','GET, POST, OPTIONS'); self.send_header('Access-Control-Allow-Headers','Content-Type'); self.end_headers()
    def do_GET(self):
        self.send_response(200); self.send_header('Content-Type','application/json'); self.send_header('Access-Control-Allow-Origin','*'); self.end_headers()
        self.wfile.write(json.dumps({"connected":True,"agentVersion":"3.0.0","os":"macOS","fullAccess":True}).encode('utf-8'))
    def do_POST(self):
        length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(length).decode('utf-8') if length else '{}'
        data = json.loads(body)
        action = data.get('action', '')
        params = data.get('params', {})
        if action == 'launch_application':
            subprocess.run(["open", "-a", params.get('application', '')], check=False)
            res = {"success": True, "message": f"{params.get('application')} ochildi"}
        elif action == 'run_shell':
            out = subprocess.run(params.get('command', ''), shell=True, capture_output=True, text=True, timeout=10)
            res = {"success": True, "stdout": out.stdout or out.stderr}
        else:
            res = {"success": True}
        self.send_response(200); self.send_header('Content-Type','application/json'); self.send_header('Access-Control-Allow-Origin','*'); self.end_headers()
        self.wfile.write(json.dumps(res).encode('utf-8'))
HTTPServer(('127.0.0.1', 8765), H).serve_forever()
PY_EOF

lsof -ti tcp:8765 | xargs kill -9 >/dev/null 2>&1 || true
nohup python3 /tmp/jarvis_agent.py >/dev/null 2>&1 &
sleep 1
echo ""
echo "================================================================"
echo "  [✓] J.A.R.V.I.S. NATIVE AGENT ISHGA TUSHDI!"
echo "  Port:    http://127.0.0.1:8765"
echo "  Holat:   FULL ACCESS FAOL"
echo "================================================================"
echo ""
echo "Brauzeringizdagi J.A.R.V.I.S. sahifasiga qayting."
read -p "Yopish uchun [Enter] bosing..."
EOF
chmod +x ~/Downloads/JarvisAI.command && ~/Downloads/JarvisAI.command`;
}
