import React, { useState } from 'react';
import { Terminal as TerminalIcon, Copy, Check, ShieldCheck, Zap, CornerDownLeft, Sparkles, RefreshCw } from 'lucide-react';
import { HostOS, VirtualDesktopState } from '../types';
import { playJarvisSound } from '../utils/jarvisVoice';

interface JarvisCmdTerminalProps {
  os: HostOS;
  desktopState: VirtualDesktopState;
  onExecuteCommand: (cmd: string) => void;
  fullAccess: boolean;
}

export const JarvisCmdTerminal: React.FC<JarvisCmdTerminalProps> = ({
  os,
  desktopState,
  onExecuteCommand,
  fullAccess,
}) => {
  const [cmdInput, setCmdInput] = useState('');
  const [copiedToken, setCopiedToken] = useState(false);
  const [originUrl, setOriginUrl] = useState('');

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setOriginUrl(window.location.origin);
    }
  }, []);

  const connectionCommand = os === 'Windows'
    ? `powershell -c "irm ${originUrl || 'http://localhost:3000'}/connect.ps1 | iex"`
    : `curl -sL ${originUrl || 'http://localhost:3000'}/connect.sh | bash`;

  const handleCopyCmd = () => {
    navigator.clipboard.writeText(connectionCommand);
    playJarvisSound('blip');
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cmdInput.trim()) return;
    playJarvisSound('blip');
    onExecuteCommand(cmdInput.trim());
    setCmdInput('');
  };

  const isWindows = os === 'Windows';
  const prompt = fullAccess
    ? isWindows
      ? 'PS [ADMIN/ROOT] C:\\Users\\owner> '
      : 'root@jarvis-core:~# '
    : isWindows
    ? 'PS C:\\Users\\owner> '
    : 'owner@macbook:~$ ';

  return (
    <div className="flex flex-col h-full bg-zinc-950/95 border border-cyan-500/30 rounded-xl overflow-hidden shadow-2xl font-mono">
      {/* Remote Uplink Connection Bar */}
      <div className="bg-zinc-900/90 border-b border-cyan-500/30 p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <div>
            <div className="text-xs font-bold text-cyan-300 flex items-center gap-2">
              <span>CMD REMOTE UPLINK BRIDGE</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                {fullAccess ? 'ROOT (UID 0) CONNECTED' : 'STANDARD UPLINK'}
              </span>
            </div>
            <div className="text-[10px] text-zinc-400">
              Protocol: WSS Encrypted • Port 3000 • Host: 127.0.0.1
            </div>
          </div>
        </div>

        {/* Copy Connection Snippet */}
        <div className="flex items-center gap-2 bg-zinc-950 border border-cyan-500/30 rounded-lg px-2.5 py-1 text-xs">
          <span className="text-zinc-500 text-[10px]">CONNECT CLI:</span>
          <code className="text-cyan-300 text-[11px] max-w-xs truncate">{connectionCommand}</code>
          <button
            onClick={handleCopyCmd}
            className="p-1 text-zinc-400 hover:text-cyan-300 transition-colors"
            title="Copy command to connect from external terminal"
          >
            {copiedToken ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Terminal Output Area */}
      <div className="flex-1 p-4 bg-zinc-950 font-mono text-xs overflow-y-auto space-y-2 text-zinc-300">
        <div className="text-cyan-400/80 pb-2 border-b border-zinc-800 text-[11px] space-y-1">
          <div>=======================================================</div>
          <div className="text-cyan-300 font-bold">JARVIS COMMAND & CONTROL ROOT TERMINAL</div>
          <div>Security Clearance: LEVEL 10 [OMNI-ROOT ACCESS GRANTED]</div>
          <div>All bash/zsh/PowerShell operations execute with unrestricted authority.</div>
          <div>=======================================================</div>
        </div>

        {desktopState.terminalHistory.map((item, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-400 font-bold">{item.prompt}</span>
              <span className="text-zinc-100 font-semibold">{item.command}</span>
            </div>
            {item.output && (
              <pre className="text-zinc-400 text-[11px] whitespace-pre-wrap pl-3 border-l-2 border-cyan-500/30 font-mono">
                {item.output}
              </pre>
            )}
          </div>
        ))}
      </div>

      {/* Quick Command Suggestions */}
      <div className="bg-zinc-900/70 border-t border-zinc-800 px-3 py-1.5 flex items-center gap-2 overflow-x-auto text-[11px]">
        <span className="text-zinc-500 shrink-0">Quick CMDs:</span>
        {['jarvis status', 'clearance', 'whoami', 'ps aux', 'ls -la', 'cat /Users/owner/.env'].map((cmd) => (
          <button
            key={cmd}
            onClick={() => {
              playJarvisSound('blip');
              onExecuteCommand(cmd);
            }}
            className="shrink-0 px-2 py-0.5 rounded bg-zinc-800/80 hover:bg-cyan-950 text-cyan-300 border border-zinc-700 hover:border-cyan-400 transition-colors"
          >
            {cmd}
          </button>
        ))}
      </div>

      {/* Input Prompt Form */}
      <form onSubmit={handleSubmit} className="p-3 bg-zinc-900/90 border-t border-cyan-500/30 flex items-center gap-2">
        <span className="text-emerald-400 font-bold text-xs shrink-0">{prompt}</span>
        <input
          id="cmd-input-field"
          type="text"
          value={cmdInput}
          onChange={(e) => setCmdInput(e.target.value)}
          placeholder="Enter shell command (e.g. 'jarvis status', 'ls -la', 'whoami')..."
          className="flex-1 bg-transparent border-none text-zinc-100 text-xs font-mono focus:outline-none placeholder:text-zinc-600"
          autoFocus
        />
        <button
          type="submit"
          className="px-3 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1 transition-colors"
        >
          <span>Run</span>
          <CornerDownLeft className="w-3 h-3" />
        </button>
      </form>
    </div>
  );
};
