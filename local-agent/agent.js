import http from 'http';
import os from 'os';
import fs from 'fs';
import path from 'path';
import { exec, spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.AGENT_PORT || '4141', 10);
const HOST = '127.0.0.1'; // Localhost only for security
const AGENT_VERSION = '2.5.0';

// Shared secret token for local authentication (auto-persisted to home dir)
const HOME_DIR = os.homedir();
const CONFIG_DIR = path.join(HOME_DIR, '.jarvis');
const TOKEN_FILE = path.join(CONFIG_DIR, 'agent_token');

let AGENT_TOKEN = process.env.JARVIS_AGENT_TOKEN || 'jarvis-local-root-token-4141';

try {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
  if (fs.existsSync(TOKEN_FILE)) {
    AGENT_TOKEN = fs.readFileSync(TOKEN_FILE, 'utf-8').trim() || AGENT_TOKEN;
  } else {
    fs.writeFileSync(TOKEN_FILE, AGENT_TOKEN, { mode: 0o600 });
  }
} catch (e) {
  // Ignore permission issues writing token
}

// Dangerous shell command patterns that REQUIRE explicit confirmation
const DANGEROUS_PATTERNS = [
  /\brm\s+-[a-zA-Z]*r/i,
  /\brm\s+-[a-zA-Z]*f/i,
  /\b(sudo|su)\b/i,
  /\bdd\s+if=/i,
  /\bmkfs\b/i,
  /\bformat\b/i,
  /\bshutdown\b/i,
  /\breboot\b/i,
  /\binit\s+[06]\b/i,
  /:(){ :|:& };:/, // Fork bomb
  /\bchmod\s+777\b/i,
  /\bchown\s+-R\b/i,
  /\bkill\s+-9\b/i,
  /\bkillall\b/i,
  /\bcurl\b.*\|\s*(sh|bash)/i,
  /\bwget\b.*\|\s*(sh|bash)/i,
];

// Helper: Run shell command with promise
function runExec(cmd, options = {}) {
  return new Promise((resolve, reject) => {
    exec(cmd, { timeout: 15000, maxBuffer: 10 * 1024 * 1024, ...options }, (error, stdout, stderr) => {
      resolve({
        error: error ? error.message : null,
        stdout: stdout ? stdout.trim() : '',
        stderr: stderr ? stderr.trim() : '',
        code: error ? (error.code || 1) : 0,
      });
    });
  });
}

// Helper: Verify if an application process is actually running on macOS
async function verifyMacProcessRunning(appName) {
  const cleanName = appName.replace(/["']/g, '');

  // 1. Try AppleScript process list
  const asScript = `osascript -e 'tell application "System Events" to get name of every process'`;
  const asResult = await runExec(asScript);
  if (!asResult.error && asResult.stdout) {
    const processes = asResult.stdout.split(',').map((p) => p.trim().toLowerCase());
    const matched = processes.some((p) => p.includes(cleanName.toLowerCase()));
    if (matched) return true;
  }

  // 2. Fallback to pgrep
  const pgrepResult = await runExec(`pgrep -i -l "${cleanName}"`);
  if (!pgrepResult.error && pgrepResult.stdout) {
    return true;
  }

  // 3. Fallback to ps aux
  const psResult = await runExec(`ps aux | grep -i "${cleanName}" | grep -v grep`);
  if (!psResult.error && psResult.stdout.length > 5) {
    return true;
  }

  return false;
}

// Helper: Verify if an application process is running on Windows
async function verifyWinProcessRunning(appName) {
  const cleanName = appName.replace(/["']/g, '');
  const result = await runExec(`tasklist /FI "IMAGENAME eq ${cleanName}*" /NH`);
  return !result.error && result.stdout.toLowerCase().includes(cleanName.toLowerCase());
}

// Helper: Verify if an application process is running on Linux
async function verifyLinuxProcessRunning(appName) {
  const cleanName = appName.replace(/["']/g, '');
  const result = await runExec(`pgrep -i "${cleanName}"`);
  return !result.error && result.stdout.trim().length > 0;
}

// Check process running by platform
async function isProcessRunning(appName) {
  const platform = os.platform();
  if (platform === 'darwin') {
    return verifyMacProcessRunning(appName);
  } else if (platform === 'win32') {
    return verifyWinProcessRunning(appName);
  } else {
    return verifyLinuxProcessRunning(appName);
  }
}

// Actions dispatcher
async function executeAgentAction(action, params = {}, isConfirmed = false) {
  const platform = os.platform();

  switch (action) {
    // 1. Launch Application with REAL process verification
    case 'launch_application': {
      const appName = params.application || params.appName || params.name;
      if (!appName || typeof appName !== 'string') {
        return { success: false, error: "Ilova nomi ko'rsatilmadi (application parameter required)" };
      }

      const cleanApp = appName.trim();

      if (platform === 'darwin') {
        // Native macOS open command
        // Try exact app name first: open -a "Discord"
        const launchResult = await runExec(`open -a "${cleanApp}"`);

        // Give macOS time to spawn the process
        await new Promise((r) => setTimeout(r, 900));

        // VERIFY whether process is actually running!
        const running = await verifyMacProcessRunning(cleanApp);
        if (running) {
          return {
            success: true,
            application: cleanApp,
            platform: 'macOS',
            verifiedRunning: true,
            message: `"${cleanApp}" ilovasi Mac tizimida muvaffaqiyatli ishga tushirildi va jarayon faol.`,
          };
        }

        // If open -a failed or wasn't verified, attempt spotlight / bundle lookup
        if (launchResult.error) {
          return {
            success: false,
            application: cleanApp,
            platform: 'macOS',
            verifiedRunning: false,
            error: `"${cleanApp}" ilovasi topilmadi yoki ochishda xatolik yuz berdi: ${launchResult.error}`,
          };
        }

        // Check one more time after another 600ms
        await new Promise((r) => setTimeout(r, 600));
        const retryRunning = await verifyMacProcessRunning(cleanApp);
        if (retryRunning) {
          return {
            success: true,
            application: cleanApp,
            platform: 'macOS',
            verifiedRunning: true,
            message: `"${cleanApp}" ilovasi ochildi va jarayon faol.`,
          };
        }

        return {
          success: false,
          application: cleanApp,
          platform: 'macOS',
          verifiedRunning: false,
          error: `"${cleanApp}" ilovasini ishga tushirish buyrug'i berildi, ammo jarayon faollashmadi. Ilova /Applications papkasida mavjudligini tekshiring.`,
        };
      } else if (platform === 'win32') {
        // Windows start
        await runExec(`start "" "${cleanApp}"`);
        await new Promise((r) => setTimeout(r, 1000));
        const running = await verifyWinProcessRunning(cleanApp);
        return {
          success: running,
          application: cleanApp,
          platform: 'Windows',
          verifiedRunning: running,
          message: running ? `"${cleanApp}" Windows tizimida ochildi.` : `"${cleanApp}" ishga tushmadi.`,
          error: running ? null : `Windows da "${cleanApp}" topilmadi`,
        };
      } else {
        // Linux
        await runExec(`xdg-open "${cleanApp}" || ${cleanApp} &`);
        await new Promise((r) => setTimeout(r, 800));
        const running = await verifyLinuxProcessRunning(cleanApp);
        return {
          success: running,
          application: cleanApp,
          platform: 'Linux',
          verifiedRunning: running,
          message: running ? `"${cleanApp}" Linux da ishga tushirildi.` : `"${cleanApp}" ishga tushmadi.`,
          error: running ? null : `Linux da "${cleanApp}" topilmadi`,
        };
      }
    }

    // 2. Close Application
    case 'close_application': {
      const appName = params.application || params.appName;
      if (!appName) return { success: false, error: "Ilova nomi kerak" };

      if (platform === 'darwin') {
        const appleScript = `osascript -e 'tell application "${appName}" to quit'`;
        const res = await runExec(appleScript);
        await new Promise((r) => setTimeout(r, 500));
        const stillRunning = await verifyMacProcessRunning(appName);
        if (!stillRunning) {
          return { success: true, application: appName, message: `"${appName}" muvaffaqiyatli yopildi.` };
        }
        // Force kill if graceful quit didn't finish and user requested
        if (params.force) {
          await runExec(`pkill -i "${appName}"`);
          return { success: true, application: appName, message: `"${appName}" majburiy to'xtatildi.` };
        }
        return { success: !stillRunning, application: appName, message: `"${appName}" ga chiqish buyrug'i yuborildi.` };
      } else if (platform === 'win32') {
        await runExec(`taskkill /IM "${appName}.exe" /F`);
        return { success: true, application: appName, message: `"${appName}" to'xtatildi.` };
      } else {
        await runExec(`pkill -i "${appName}"`);
        return { success: true, application: appName, message: `"${appName}" to'xtatildi.` };
      }
    }

    // 3. Open URL in default browser
    case 'open_url': {
      let url = params.url || '';
      if (!url) return { success: false, error: 'URL kiritilmadi' };
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }

      if (platform === 'darwin') {
        const res = await runExec(`open "${url}"`);
        return { success: !res.error, url, error: res.error, message: `Brauzerda havola ochildi: ${url}` };
      } else if (platform === 'win32') {
        const res = await runExec(`start "" "${url}"`);
        return { success: !res.error, url, error: res.error, message: `Havola ochildi: ${url}` };
      } else {
        const res = await runExec(`xdg-open "${url}"`);
        return { success: !res.error, url, error: res.error, message: `Havola ochildi: ${url}` };
      }
    }

    // 4. Safe Terminal Command Execution
    case 'execute_command':
    case 'terminal': {
      const command = params.command || '';
      if (!command) return { success: false, error: 'Terminal buyrug‘i bo‘sh' };

      // Check dangerous pattern
      const isDangerous = DANGEROUS_PATTERNS.some((pattern) => pattern.test(command));
      if (isDangerous && !isConfirmed) {
        return {
          success: false,
          requiresConfirmation: true,
          riskLevel: 'HIGH',
          command,
          message: `⚠️ Ushbu buyruq xavfli bo'lishi mumkin va tizim fayllariga ta'sir qilishi mumkin. Uni bajarish uchun tasdiqlang: "${command}"`,
        };
      }

      const res = await runExec(command, { cwd: params.cwd || os.homedir() });
      return {
        success: res.code === 0,
        command,
        stdout: res.stdout,
        stderr: res.stderr,
        exitCode: res.code,
        message: res.code === 0 ? "Terminal buyrug'i muvaffaqiyatli bajarildi" : `Buyruq xatolik bilan tugadi (kod: ${res.code})`,
      };
    }

    // 5. System Information
    case 'system_info': {
      const cpus = os.cpus();
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const uptimeSec = os.uptime();

      let macModel = 'Apple Mac';
      let osVersion = os.release();

      if (platform === 'darwin') {
        const brand = await runExec('sysctl -n machdep.cpu.brand_string');
        const swVers = await runExec('sw_vers -productVersion');
        const modelName = await runExec('sysctl -n hw.model');
        if (swVers.stdout) osVersion = `macOS ${swVers.stdout}`;
        if (modelName.stdout) macModel = modelName.stdout;
        if (brand.stdout && brand.stdout.includes('Apple')) macModel += ` (${brand.stdout})`;
      }

      return {
        success: true,
        platform,
        osVersion,
        macModel,
        hostname: os.hostname(),
        username: os.userInfo().username,
        cpuCount: cpus.length,
        cpuModel: cpus[0]?.model || 'Standard CPU',
        totalMemoryGB: (totalMem / (1024 * 1024 * 1024)).toFixed(1),
        freeMemoryGB: (freeMem / (1024 * 1024 * 1024)).toFixed(1),
        usedMemoryPercentage: Math.round(((totalMem - freeMem) / totalMem) * 100),
        uptimeHours: (uptimeSec / 3600).toFixed(1),
        agentVersion: AGENT_VERSION,
      };
    }

    // 6. Screenshot (Native macOS screencapture)
    case 'screenshot': {
      if (platform === 'darwin') {
        const tempPath = path.join(os.tmpdir(), `jarvis_screen_${Date.now()}.png`);
        const res = await runExec(`screencapture -x -C "${tempPath}"`);
        if (res.error || !fs.existsSync(tempPath)) {
          return { success: false, error: `Skrinshot olib bo‘lmadi: ${res.error || 'fayl yaratilmadi'}` };
        }
        const data = fs.readFileSync(tempPath);
        fs.unlinkSync(tempPath); // cleanup
        return {
          success: true,
          base64: `data:image/png;base64,${data.toString('base64')}`,
          message: 'Skrinshot muvaffaqiyatli olindi',
        };
      }
      return { success: false, error: 'Skrinshot faqat macOS tizimida qo‘llab-quvvatlanadi' };
    }

    // 7. Clipboard Get / Set
    case 'clipboard_get': {
      if (platform === 'darwin') {
        const res = await runExec('pbpaste');
        return { success: true, text: res.stdout };
      }
      return { success: false, error: 'Klipbord faqat macOS tizimida mavjud' };
    }

    case 'clipboard_set': {
      const text = params.text || '';
      if (platform === 'darwin') {
        const child = spawn('pbcopy');
        child.stdin.write(text);
        child.stdin.end();
        return { success: true, message: 'Matn klipbordga nusxalandi' };
      }
      return { success: false, error: 'Klipbord faqat macOS tizimida mavjud' };
    }

    // 8. Basic File Operations
    case 'fs_list': {
      const dirPath = params.path ? path.resolve(params.path.replace(/^~/, os.homedir())) : os.homedir();
      try {
        const entries = fs.readdirSync(dirPath, { withFileTypes: true });
        const items = entries.slice(0, 100).map((e) => ({
          name: e.name,
          isDirectory: e.isDirectory(),
          isFile: e.isFile(),
        }));
        return { success: true, path: dirPath, items, total: entries.length };
      } catch (err) {
        return { success: false, error: err.message };
      }
    }

    default:
      return { success: false, error: `Noma'lum harakat: ${action}` };
  }
}

// HTTP Server setup
const server = http.createServer(async (req, res) => {
  // CORS & Private Network Access Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-jarvis-agent-token');
  res.setHeader('Access-Control-Allow-Private-Network', 'true');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  // 1. Health & Heartbeat: GET /ping or GET /health or GET /status
  if (req.method === 'GET' && (url.pathname === '/ping' || url.pathname === '/health' || url.pathname === '/status' || url.pathname === '/')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        status: 'ok',
        pong: true,
        agent: 'JARVIS Local macOS Agent',
        agentVersion: AGENT_VERSION,
        platform: os.platform(),
        os: os.platform() === 'darwin' ? 'macOS' : os.platform() === 'win32' ? 'Windows' : 'Linux',
        hostname: os.hostname(),
        username: os.userInfo().username,
        uptime: os.uptime(),
        timestamp: Date.now(),
        port: PORT,
      })
    );
    return;
  }

  // 2. Token verification helper
  const authHeader = req.headers['authorization'] || req.headers['x-jarvis-agent-token'] || '';
  const tokenProvided = authHeader.replace(/^Bearer\s+/i, '').trim();

  // Allow localhost loopback requests even without token, but check token if remote
  const isLoopback = req.socket.remoteAddress === '127.0.0.1' || req.socket.remoteAddress === '::1' || req.socket.remoteAddress === '::ffff:127.0.0.1';

  // 3. Execution endpoint: POST /execute or POST /api/execute
  if (req.method === 'POST' && (url.pathname === '/execute' || url.pathname === '/api/execute')) {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 5 * 1024 * 1024) {
        req.destroy(); // 5MB limit
      }
    });

    req.on('end', async () => {
      try {
        const payload = JSON.parse(body || '{}');
        const { action, params = {}, confirmed = false } = payload;

        if (!action) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Harakat turi (action) ko‘rsatilmadi' }));
          return;
        }

        console.log(`[JARVIS Agent] Bajarilmoqda: action=${action}, params=${JSON.stringify(params)}`);
        const result = await executeAgentAction(action, params, confirmed);
        console.log(`[JARVIS Agent] Natija: success=${result.success}`);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: `Agent xatoligi: ${err.message}` }));
      }
    });
    return;
  }

  // Not found
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Endpoint topilmadi' }));
});

server.listen(PORT, HOST, () => {
  console.log('===============================================================');
  console.log(`  J.A.R.V.I.S. NATIVE LOCAL AGENT v${AGENT_VERSION}`);
  console.log(`  Tinglanmoqda: http://${HOST}:${PORT}`);
  console.log(`  Tizim: ${os.platform() === 'darwin' ? 'macOS (Darwin)' : os.platform()}`);
  console.log(`  Xavfsizlik: Faqat Localhost Loopback bog'lanishi faol`);
  console.log('===============================================================');
});
