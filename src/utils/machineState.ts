import { HostOS, VirtualDesktopState, VirtualFile, VirtualProcess } from '../types';

export const INITIAL_FILES_MACOS: Record<string, VirtualFile> = {
  '/Users/owner/logs/app.log': {
    name: 'app.log',
    path: '/Users/owner/logs/app.log',
    content: '[2026-09-13 13:00:01] INFO Application worker started\n[2026-09-13 13:02:44] WARN High memory spike on PID 4821\n[2026-09-13 13:10:11] INFO Background sync completed successfully',
    size: 240,
    updatedAt: '2026-09-13 13:10',
  },
  '/Users/owner/logs/nginx.log': {
    name: 'nginx.log',
    path: '/Users/owner/logs/nginx.log',
    content: '127.0.0.1 - - [13/Sep/2026:13:05:22] "GET /api/status HTTP/1.1" 200 482\n127.0.0.1 - - [13/Sep/2026:13:08:14] "POST /api/action HTTP/1.1" 200 128',
    size: 190,
    updatedAt: '2026-09-13 13:08',
  },
  '/Users/owner/Desktop/notes.txt': {
    name: 'notes.txt',
    path: '/Users/owner/Desktop/notes.txt',
    content: 'Meeting notes:\n- Deploy server update at 18:00\n- Check database connection pool\n- Clean up obsolete temporary files',
    size: 110,
    updatedAt: '2026-09-13 11:30',
  },
  '/Users/owner/.env': {
    name: '.env',
    path: '/Users/owner/.env',
    content: 'PORT=3000\nENV=production\nDATABASE_URL=postgres://localhost:5432/axiom_db',
    size: 78,
    updatedAt: '2026-09-12 18:40',
  },
  '/Users/owner/temp_cache/cache_01.tmp': {
    name: 'cache_01.tmp',
    path: '/Users/owner/temp_cache/cache_01.tmp',
    content: 'TEMP_STREAM_CHUNK_01',
    size: 64,
    updatedAt: '2026-09-13 09:00',
  },
  '/Users/owner/temp_cache/cache_02.tmp': {
    name: 'cache_02.tmp',
    path: '/Users/owner/temp_cache/cache_02.tmp',
    content: 'TEMP_STREAM_CHUNK_02',
    size: 64,
    updatedAt: '2026-09-13 09:00',
  },
  '/Users/owner/temp_cache/cache_03.tmp': {
    name: 'cache_03.tmp',
    path: '/Users/owner/temp_cache/cache_03.tmp',
    content: 'TEMP_STREAM_CHUNK_03',
    size: 64,
    updatedAt: '2026-09-13 09:00',
  },
  '/Users/owner/temp_cache/cache_04.tmp': {
    name: 'cache_04.tmp',
    path: '/Users/owner/temp_cache/cache_04.tmp',
    content: 'TEMP_STREAM_CHUNK_04',
    size: 64,
    updatedAt: '2026-09-13 09:00',
  },
  '/Users/owner/temp_cache/cache_05.tmp': {
    name: 'cache_05.tmp',
    path: '/Users/owner/temp_cache/cache_05.tmp',
    content: 'TEMP_STREAM_CHUNK_05',
    size: 64,
    updatedAt: '2026-09-13 09:00',
  },
  '/Users/owner/temp_cache/cache_06.tmp': {
    name: 'cache_06.tmp',
    path: '/Users/owner/temp_cache/cache_06.tmp',
    content: 'TEMP_STREAM_CHUNK_06',
    size: 64,
    updatedAt: '2026-09-13 09:00',
  },
  '/Users/owner/temp_cache/cache_07.tmp': {
    name: 'cache_07.tmp',
    path: '/Users/owner/temp_cache/cache_07.tmp',
    content: 'TEMP_STREAM_CHUNK_07',
    size: 64,
    updatedAt: '2026-09-13 09:00',
  },
  '/Users/owner/temp_cache/cache_08.tmp': {
    name: 'cache_08.tmp',
    path: '/Users/owner/temp_cache/cache_08.tmp',
    content: 'TEMP_STREAM_CHUNK_08',
    size: 64,
    updatedAt: '2026-09-13 09:00',
  },
  '/Users/owner/temp_cache/cache_09.tmp': {
    name: 'cache_09.tmp',
    path: '/Users/owner/temp_cache/cache_09.tmp',
    content: 'TEMP_STREAM_CHUNK_09',
    size: 64,
    updatedAt: '2026-09-13 09:00',
  },
  '/Users/owner/temp_cache/cache_10.tmp': {
    name: 'cache_10.tmp',
    path: '/Users/owner/temp_cache/cache_10.tmp',
    content: 'TEMP_STREAM_CHUNK_10',
    size: 64,
    updatedAt: '2026-09-13 09:00',
  },
  '/Users/owner/temp_cache/cache_11.tmp': {
    name: 'cache_11.tmp',
    path: '/Users/owner/temp_cache/cache_11.tmp',
    content: 'TEMP_STREAM_CHUNK_11',
    size: 64,
    updatedAt: '2026-09-13 09:00',
  },
  '/Users/owner/temp_cache/cache_12.tmp': {
    name: 'cache_12.tmp',
    path: '/Users/owner/temp_cache/cache_12.tmp',
    content: 'TEMP_STREAM_CHUNK_12',
    size: 64,
    updatedAt: '2026-09-13 09:00',
  },
  '/Users/owner/temp_cache/cache_13.tmp': {
    name: 'cache_13.tmp',
    path: '/Users/owner/temp_cache/cache_13.tmp',
    content: 'TEMP_STREAM_CHUNK_13',
    size: 64,
    updatedAt: '2026-09-13 09:00',
  },
  '/Users/owner/temp_cache/cache_14.tmp': {
    name: 'cache_14.tmp',
    path: '/Users/owner/temp_cache/cache_14.tmp',
    content: 'TEMP_STREAM_CHUNK_14',
    size: 64,
    updatedAt: '2026-09-13 09:00',
  },
};

export const INITIAL_FILES_WINDOWS: Record<string, VirtualFile> = {
  'C:\\Users\\owner\\logs\\app.log': {
    name: 'app.log',
    path: 'C:\\Users\\owner\\logs\\app.log',
    content: '[2026-09-13 13:00:01] INFO Windows Service Host started\n[2026-09-13 13:03:10] WARN Thread pool high wait time\n[2026-09-13 13:12:00] INFO Healthcheck 200 OK',
    size: 250,
    updatedAt: '2026-09-13 13:12',
  },
  'C:\\Users\\owner\\logs\\nginx.log': {
    name: 'nginx.log',
    path: 'C:\\Users\\owner\\logs\\nginx.log',
    content: '127.0.0.1 - - [13/Sep/2026:13:01:00] "GET / HTTP/1.1" 200\n127.0.0.1 - - [13/Sep/2026:13:04:12] "GET /api/v1/metrics HTTP/1.1" 200',
    size: 160,
    updatedAt: '2026-09-13 13:04',
  },
  'C:\\Users\\owner\\Desktop\\notes.txt': {
    name: 'notes.txt',
    path: 'C:\\Users\\owner\\Desktop\\notes.txt',
    content: 'Windows workstation notes:\n- Review system event logs\n- PowerShell scripts in C:\\Scripts\n- Confirm before any batch delete',
    size: 140,
    updatedAt: '2026-09-13 10:15',
  },
  'C:\\Users\\owner\\.env': {
    name: '.env',
    path: 'C:\\Users\\owner\\.env',
    content: 'PORT=3000\nENVIRONMENT=production\nDB_CONNECTION=SqlServer',
    size: 64,
    updatedAt: '2026-09-12 17:00',
  },
  'C:\\Users\\owner\\temp_cache\\cache_01.tmp': {
    name: 'cache_01.tmp',
    path: 'C:\\Users\\owner\\temp_cache\\cache_01.tmp',
    content: 'TEMP_CHUNK_WIN_01',
    size: 64,
    updatedAt: '2026-09-13 09:00',
  },
  'C:\\Users\\owner\\temp_cache\\cache_02.tmp': {
    name: 'cache_02.tmp',
    path: 'C:\\Users\\owner\\temp_cache\\cache_02.tmp',
    content: 'TEMP_CHUNK_WIN_02',
    size: 64,
    updatedAt: '2026-09-13 09:00',
  },
  'C:\\Users\\owner\\temp_cache\\cache_03.tmp': {
    name: 'cache_03.tmp',
    path: 'C:\\Users\\owner\\temp_cache\\cache_03.tmp',
    content: 'TEMP_CHUNK_WIN_03',
    size: 64,
    updatedAt: '2026-09-13 09:00',
  },
  'C:\\Users\\owner\\temp_cache\\cache_04.tmp': {
    name: 'cache_04.tmp',
    path: 'C:\\Users\\owner\\temp_cache\\cache_04.tmp',
    content: 'TEMP_CHUNK_WIN_04',
    size: 64,
    updatedAt: '2026-09-13 09:00',
  },
  'C:\\Users\\owner\\temp_cache\\cache_05.tmp': {
    name: 'cache_05.tmp',
    path: 'C:\\Users\\owner\\temp_cache\\cache_05.tmp',
    content: 'TEMP_CHUNK_WIN_05',
    size: 64,
    updatedAt: '2026-09-13 09:00',
  },
  'C:\\Users\\owner\\temp_cache\\cache_06.tmp': {
    name: 'cache_06.tmp',
    path: 'C:\\Users\\owner\\temp_cache\\cache_06.tmp',
    content: 'TEMP_CHUNK_WIN_06',
    size: 64,
    updatedAt: '2026-09-13 09:00',
  },
  'C:\\Users\\owner\\temp_cache\\cache_07.tmp': {
    name: 'cache_07.tmp',
    path: 'C:\\Users\\owner\\temp_cache\\cache_07.tmp',
    content: 'TEMP_CHUNK_WIN_07',
    size: 64,
    updatedAt: '2026-09-13 09:00',
  },
  'C:\\Users\\owner\\temp_cache\\cache_08.tmp': {
    name: 'cache_08.tmp',
    path: 'C:\\Users\\owner\\temp_cache\\cache_08.tmp',
    content: 'TEMP_CHUNK_WIN_08',
    size: 64,
    updatedAt: '2026-09-13 09:00',
  },
  'C:\\Users\\owner\\temp_cache\\cache_09.tmp': {
    name: 'cache_09.tmp',
    path: 'C:\\Users\\owner\\temp_cache\\cache_09.tmp',
    content: 'TEMP_CHUNK_WIN_09',
    size: 64,
    updatedAt: '2026-09-13 09:00',
  },
  'C:\\Users\\owner\\temp_cache\\cache_10.tmp': {
    name: 'cache_10.tmp',
    path: 'C:\\Users\\owner\\temp_cache\\cache_10.tmp',
    content: 'TEMP_CHUNK_WIN_10',
    size: 64,
    updatedAt: '2026-09-13 09:00',
  },
  'C:\\Users\\owner\\temp_cache\\cache_11.tmp': {
    name: 'cache_11.tmp',
    path: 'C:\\Users\\owner\\temp_cache\\cache_11.tmp',
    content: 'TEMP_CHUNK_WIN_11',
    size: 64,
    updatedAt: '2026-09-13 09:00',
  },
  'C:\\Users\\owner\\temp_cache\\cache_12.tmp': {
    name: 'cache_12.tmp',
    path: 'C:\\Users\\owner\\temp_cache\\cache_12.tmp',
    content: 'TEMP_CHUNK_WIN_12',
    size: 64,
    updatedAt: '2026-09-13 09:00',
  },
  'C:\\Users\\owner\\temp_cache\\cache_13.tmp': {
    name: 'cache_13.tmp',
    path: 'C:\\Users\\owner\\temp_cache\\cache_13.tmp',
    content: 'TEMP_CHUNK_WIN_13',
    size: 64,
    updatedAt: '2026-09-13 09:00',
  },
  'C:\\Users\\owner\\temp_cache\\cache_14.tmp': {
    name: 'cache_14.tmp',
    path: 'C:\\Users\\owner\\temp_cache\\cache_14.tmp',
    content: 'TEMP_CHUNK_WIN_14',
    size: 64,
    updatedAt: '2026-09-13 09:00',
  },
};

export const INITIAL_PROCESSES: VirtualProcess[] = [
  { pid: 1420, name: 'axiom-daemon', cpu: '0.8%', mem: '42 MB', status: 'running' },
  { pid: 3891, name: 'node (server)', cpu: '1.2%', mem: '128 MB', status: 'running' },
  { pid: 4821, name: 'dockerd', cpu: '2.4%', mem: '340 MB', status: 'running' },
  { pid: 5120, name: 'nginx: master', cpu: '0.1%', mem: '18 MB', status: 'sleeping' },
  { pid: 6712, name: 'postgres', cpu: '0.5%', mem: '210 MB', status: 'sleeping' },
  { pid: 8901, name: 'zsh / powershell', cpu: '0.0%', mem: '12 MB', status: 'running' },
];

export function getInitialState(os: HostOS = 'macOS'): VirtualDesktopState {
  const initialFiles = os === 'Windows' 
    ? { ...INITIAL_FILES_WINDOWS } 
    : { ...INITIAL_FILES_MACOS };

  return {
    os,
    activeWindow: 'terminal',
    mousePos: { x: 420, y: 320 },
    typedBuffer: '',
    terminalHistory: [
      {
        prompt: os === 'Windows' ? 'PS [ADMIN/ROOT] C:\\Users\\owner> ' : os === 'Linux' ? 'root@jarvis-core:~# ' : 'root@jarvis-macbook:~# ',
        command: os === 'Windows' ? '[System.Environment]::OSVersion.VersionString' : 'uname -srm',
        output: os === 'Windows' ? 'Microsoft Windows NT 10.0.22631.0 (Root Elevated)' : os === 'Linux' ? 'Linux 6.6.21-jarvis-rt x86_64' : 'Darwin 25.1.0 arm64',
      },
      {
        prompt: os === 'Windows' ? 'PS [ADMIN/ROOT] C:\\Users\\owner> ' : os === 'Linux' ? 'root@jarvis-core:~# ' : 'root@jarvis-macbook:~# ',
        command: 'jarvis status',
        output: `[J.A.R.V.I.S. OMNI-CLEARANCE LEVEL 10 ACTIVE]\nArc Reactor: 100% (3.2 GW) • Voice Synthesis: READY • Host: ${os}\nRoot Shell: ALL RESTRICTIONS BYPASSED • Type 'help' for commands`,
      }
    ],
    files: initialFiles,
    processes: [...INITIAL_PROCESSES],
    isLocked: false,
    killSwitchEngaged: false,
    fullAccessGranted: true,
    isRunning: false,
    cpuUsage: 14,
    memoryUsage: 38,
  };
}

export function killVirtualProcess(pid: number, state: VirtualDesktopState): VirtualDesktopState {
  const target = state.processes.find(p => p.pid === pid);
  const nextProcesses = state.processes.filter(p => p.pid !== pid);
  const prompt = state.os === 'Windows' ? 'PS [ADMIN] C:\\Users\\owner> ' : 'root@jarvis-core:~# ';
  
  return {
    ...state,
    processes: nextProcesses,
    terminalHistory: [
      ...state.terminalHistory,
      {
        prompt,
        command: `kill -9 ${pid}`,
        output: target ? `Process '${target.name}' [PID ${pid}] terminated by Root Authority.` : `PID ${pid} not found.`,
      }
    ].slice(-25)
  };
}

export function createVirtualFile(path: string, content: string, state: VirtualDesktopState): VirtualDesktopState {
  const parts = path.replace(/\\/g, '/').split('/');
  const name = parts[parts.length - 1] || 'new_file.txt';
  const prompt = state.os === 'Windows' ? 'PS [ADMIN] C:\\Users\\owner> ' : 'root@jarvis-core:~# ';
  
  const nextFiles = {
    ...state.files,
    [path]: {
      name,
      path,
      content,
      size: content.length,
      updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  };

  return {
    ...state,
    files: nextFiles,
    terminalHistory: [
      ...state.terminalHistory,
      {
        prompt,
        command: `touch "${path}"`,
        output: `Created '${path}' (${content.length} bytes).`,
      }
    ].slice(-25)
  };
}

export function deleteVirtualFile(path: string, state: VirtualDesktopState): VirtualDesktopState {
  const nextFiles = { ...state.files };
  const existed = !!nextFiles[path];
  delete nextFiles[path];
  const prompt = state.os === 'Windows' ? 'PS [ADMIN] C:\\Users\\owner> ' : 'root@jarvis-core:~# ';

  return {
    ...state,
    files: nextFiles,
    terminalHistory: [
      ...state.terminalHistory,
      {
        prompt,
        command: `rm -f "${path}"`,
        output: existed ? `Removed file: ${path}` : `File not found: ${path}`,
      }
    ].slice(-25)
  };
}

export function executeVirtualShell(
  command: string,
  state: VirtualDesktopState
): { output: string; nextState: VirtualDesktopState } {
  const trimmed = command.trim();
  const lower = trimmed.toLowerCase();
  let nextFiles = { ...state.files };
  let nextProcesses = [...state.processes];
  const prompt = state.os === 'Windows'
    ? 'PS [ADMIN/ROOT] C:\\Users\\owner> '
    : state.os === 'Linux'
    ? 'root@jarvis-core:~# '
    : 'root@jarvis-macbook:~# ';

  let output = '';

  if (lower === 'clear' || lower === 'cls') {
    return {
      output: '',
      nextState: {
        ...state,
        terminalHistory: [],
      }
    };
  }

  if (lower === 'help') {
    output = `[J.A.R.V.I.S. ROOT COMMAND DIRECTORY]
Available commands:
  jarvis status        - Complete neural core & Arc Reactor diagnostics
  clearance            - Security permissions matrix & hardware bus status
  whoami               - Print current user identity & privilege
  neofetch             - Display system overview and Stark OS banner
  ps aux / get-process - List active running processes
  kill <pid>           - Force terminate process by PID
  ls -la / dir         - List files in current directory or target path
  cat <file>           - Display file content
  touch <file>         - Create empty file
  echo "<text>" > file - Write text to file
  rm <file>            - Delete specified file or directory
  clean / sweep        - Purge all temporary cache files
  free -m / top        - Real-time memory and CPU statistics
  uptime / date        - System runtime and local clock
  netstat / ping       - Network socket inspection
  clear                - Clear terminal screen buffer`;
  } else if (lower.startsWith('jarvis') || lower.includes('jarvis status') || lower.includes('diagnostics')) {
    output = `[J.A.R.V.I.S. NEURAL CORE ONLINE]
Arc Reactor Output   : 100% (Stable 3.2 GW, 28°C Core)
Security Clearance   : LEVEL 10 [OMNI-ROOT ACCESS ACTIVE]
Sub-systems          : Vision Recon [ONLINE], Voice STT/TTS [ACTIVE]
Hardware Intercept   : Direct System Bus (DMA Unrestricted)
Active Sockets       : 8 Established (127.0.0.1:3000 WSS Bridge)
Host Target          : ${state.os} Kernel Verified`;
  } else if (lower === 'neofetch') {
    output = `   ____.    _____   __________ ____   ____.___  _________
  |    |   /  _  \\  \\______   \\\\   \\ /   /|   |/   _____/
  |    |  /  /_\\  \\  |       _/ \\   Y   / |   |\\_____  \\ 
/\\__|    | /    |    \\ |    |   \\  \\     /  |   |/        \\
\\________| \\____|__  / |____|_  /   \\___/   |___/_______  /
                   \\/         \\/                        \\/ 
Host        : Stark Industries Mark VII Terminal
OS          : JARVIS OS / ${state.os} Kernel 6.6.21-root
Clearance   : Level 10 (Full Administrative Authority)
Uptime      : 4 days, 18 hours, 32 mins
Shell       : zsh / PowerShell 7 (Privileged)
CPU         : Quantum Neural Arc Core @ 4.8 GHz (16 Cores)
Memory      : 6.7 GB / 16.0 GB (42%)
Arc Reactor : 100% Output [3.2 GW]`;
  } else if (lower.startsWith('sudo su') || lower.startsWith('whoami')) {
    output = 'root (OMNI-PRIVILEGE 0x00 - UNRESTRICTED)';
  } else if (lower.startsWith('clearance') || lower.includes('permissions')) {
    output = `[JARVIS SECURITY MATRIX - LEVEL 10 ALL-ACCESS]
✓ Filesystem Storage : FULL READ / WRITE / PURGE [GRANTED]
✓ Terminal Shell     : ROOT PRIVILEGE (UID 0) [GRANTED]
✓ Network Sockets    : UNRESTRICTED PACKET INJECTION [GRANTED]
✓ Hardware Sensors   : DIRECT DMA / BUS ACCESS [GRANTED]
✓ Process Lifecycle  : SIGKILL / ELEVATION WITHOUT PROMPT [GRANTED]
✓ Audio & Voice STT  : BIOMETRIC RECOGNITION ONLINE [GRANTED]`;
  } else if (lower.startsWith('kill ') || lower.startsWith('stop-process')) {
    const pidStr = trimmed.split(/\s+/)[1];
    const pidNum = parseInt(pidStr, 10);
    if (!isNaN(pidNum)) {
      const p = nextProcesses.find(x => x.pid === pidNum);
      if (p) {
        nextProcesses = nextProcesses.filter(x => x.pid !== pidNum);
        output = `SIGKILL sent to PID ${pidNum} ('${p.name}'). Process halted successfully.`;
      } else {
        output = `kill: PID ${pidNum}: No such process.`;
      }
    } else {
      output = `kill: missing or invalid PID. Usage: kill <pid>`;
    }
  } else if (lower.startsWith('touch ')) {
    const filename = trimmed.replace(/^touch\s+/i, '').replace(/["']/g, '');
    const fullPath = filename.includes('/') || filename.includes('\\')
      ? filename
      : state.os === 'Windows'
      ? `C:\\Users\\owner\\Desktop\\${filename}`
      : `/Users/owner/Desktop/${filename}`;
    nextFiles[fullPath] = {
      name: filename,
      path: fullPath,
      content: `# Created by Root Shell on ${new Date().toLocaleString()}`,
      size: 48,
      updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    output = `Created file '${fullPath}'`;
  } else if (lower.includes('clean') || lower.includes('sweep') || lower.includes('tozala')) {
    const cacheKeys = Object.keys(nextFiles).filter(k => k.includes('temp_cache') || k.endsWith('.tmp'));
    cacheKeys.forEach(k => delete nextFiles[k]);
    output = `[CLEANUP PROTOCOL EXECUTED] Purged ${cacheKeys.length} temporary and cache files from disk.`;
  } else if (lower.startsWith('ls') || lower.startsWith('dir') || lower.includes('get-childitem')) {
    const fileEntries = Object.keys(nextFiles);
    if (lower.includes('temp_cache')) {
      const cacheEntries = fileEntries.filter((p) => p.includes('temp_cache'));
      if (lower.includes('wc -l') || lower.includes('measure-object')) {
        output = `${cacheEntries.length}`;
      } else {
        output = cacheEntries
          .map((p) => {
            const f = nextFiles[p];
            return `${f.name.padEnd(22)} ${f.size.toString().padStart(6)} B   ${f.updatedAt}`;
          })
          .join('\n');
      }
    } else if (lower.includes('logs')) {
      const logEntries = fileEntries.filter((p) => p.includes('logs'));
      output = logEntries
        .map((p) => {
          const f = nextFiles[p];
          return `${f.name.padEnd(22)} ${f.size.toString().padStart(6)} B   ${f.updatedAt}`;
        })
        .join('\n');
    } else {
      output = fileEntries
        .slice(0, 15)
        .map((p) => {
          const f = nextFiles[p];
          return `${f.name.padEnd(24)} ${f.size.toString().padStart(6)} B   ${f.updatedAt}`;
        })
        .join('\n');
    }
  } else if (lower.startsWith('pwd') || lower.startsWith('get-location')) {
    output = state.os === 'Windows' ? 'C:\\Users\\owner' : '/Users/owner';
  } else if (lower.includes('ps aux') || lower.includes('get-process') || lower === 'top' || lower === 'htop') {
    output =
      'PID    PROCESS NAME         CPU      MEM        STATUS\n' +
      nextProcesses
        .map(
          (p) =>
            `${p.pid.toString().padEnd(6)} ${p.name.padEnd(20)} ${p.cpu.padEnd(8)} ${p.mem.padEnd(10)} ${p.status.toUpperCase()}`
        )
        .join('\n');
  } else if (lower.startsWith('cat ') || lower.startsWith('get-content ')) {
    const filePath = trimmed.replace(/^(cat|get-content)\s+/i, '').replace(/["']/g, '');
    const found = Object.values(nextFiles).find(
      (f) => f.path.toLowerCase().endsWith(filePath.toLowerCase()) || f.name.toLowerCase() === filePath.toLowerCase()
    );
    if (found) {
      output = found.content;
    } else {
      output = `cat: ${filePath}: No such file or directory`;
    }
  } else if (lower.startsWith('rm ') || lower.startsWith('remove-item')) {
    const target = trimmed.replace(/^(rm|remove-item)\s+(-f|-r|-rf)?\s*/i, '').replace(/["']/g, '');
    if (target.includes('*') || target.includes('temp_cache') || !target) {
      const targets = Object.keys(nextFiles).filter((k) => k.includes('temp_cache'));
      targets.forEach((k) => delete nextFiles[k]);
      output = `Removed ${targets.length} items from temp_cache.`;
    } else {
      const foundKey = Object.keys(nextFiles).find(k => k.toLowerCase().endsWith(target.toLowerCase()));
      if (foundKey) {
        delete nextFiles[foundKey];
        output = `Deleted file: ${foundKey}`;
      } else {
        output = `rm: cannot remove '${target}': No such file or directory`;
      }
    }
  } else if (lower.startsWith('echo ')) {
    if (trimmed.includes('>')) {
      const [textPart, filePart] = trimmed.replace(/^echo\s+/i, '').split('>');
      const content = textPart.trim().replace(/^["']|["']$/g, '');
      const filePath = filePart.trim().replace(/^["']|["']$/g, '');
      const fullPath = filePath.includes('/') || filePath.includes('\\')
        ? filePath
        : state.os === 'Windows'
        ? `C:\\Users\\owner\\Desktop\\${filePath}`
        : `/Users/owner/Desktop/${filePath}`;
      nextFiles[fullPath] = {
        name: filePath,
        path: fullPath,
        content,
        size: content.length,
        updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      output = `Wrote ${content.length} bytes to ${fullPath}`;
    } else {
      output = trimmed.replace(/^echo\s+/i, '').replace(/["']/g, '');
    }
  } else if (lower.startsWith('free') || lower.includes('ram') || lower.includes('memory')) {
    output = `               total        used        free      shared  buff/cache   available
Mem:           16384        6860        8120         312        1404        9212
Swap:           4096           0        4096`;
  } else if (lower.startsWith('df') || lower.includes('disk')) {
    output = `Filesystem      Size  Used Avail Use% Mounted on
/dev/nvme0n1p2  512G  148G  364G  29% /
/dev/nvme0n1p1  512M   48M  464M  10% /boot/efi
tmpfs           8.0G  4.0K  8.0G   1% /run/user/1000`;
  } else if (lower.startsWith('uptime')) {
    output = ` 13:26:45 up 4 days, 18:32,  2 users,  load average: 0.28, 0.44, 0.38`;
  } else if (lower.startsWith('date')) {
    output = new Date().toUTCString();
  } else if (lower.startsWith('ping ')) {
    const host = trimmed.split(/\s+/)[1] || '8.8.8.8';
    output = `PING ${host} (${host}): 56 data bytes
64 bytes from ${host}: icmp_seq=0 ttl=118 time=12.4 ms
64 bytes from ${host}: icmp_seq=1 ttl=118 time=11.9 ms
64 bytes from ${host}: icmp_seq=2 ttl=118 time=12.1 ms
--- ${host} ping statistics ---
3 packets transmitted, 3 packets received, 0.0% packet loss`;
  } else {
    output = `[Exit code 0] Command executed with Root Authority: ${trimmed}`;
  }

  const newHistory = [
    ...state.terminalHistory,
    {
      prompt,
      command: trimmed,
      output,
    },
  ];

  return {
    output,
    nextState: {
      ...state,
      activeWindow: 'terminal',
      terminalHistory: newHistory.slice(-25),
      files: nextFiles,
      processes: nextProcesses,
    },
  };
}
