import React, { useState, useRef, useEffect } from 'react';
import { Terminal, ChevronDown, ChevronUp, Play, Trash2, Cpu, HardDrive, ShieldCheck, Activity } from 'lucide-react';
import { VirtualDesktopState, HostOS } from '../types';
import { playJarvisSound } from '../utils/jarvisVoice';

interface JarvisMiniConsoleProps {
  desktopState: VirtualDesktopState;
  os: HostOS;
  onExecuteCommand: (cmd: string) => string;
  isOpen: boolean;
  onToggleOpen: () => void;
}

export const JarvisMiniConsole: React.FC<JarvisMiniConsoleProps> = ({
  desktopState,
  os,
  onExecuteCommand,
  isOpen,
  onToggleOpen,
}) => {
  const [cmdInput, setCmdInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [desktopState.terminalHistory, isOpen]);

  const handleRun = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cmdInput.trim()) return;
    playJarvisSound('blip');
    onExecuteCommand(cmdInput.trim());
    setCmdInput('');
  };

  const isWindows = os === 'Windows';
  const promptSymbol = isWindows ? 'PS [ADMIN] C:\\Users\\owner> ' : 'root@jarvis-core:~# ';

  return (
    <div className="w-full bg-zinc-950/90 border border-cyan-500/25 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
      {/* Header bar / Toggle Button */}
      <button
        onClick={onToggleOpen}
        className="w-full px-4 py-3 bg-zinc-900/90 hover:bg-zinc-850 flex items-center justify-between border-b border-cyan-500/20 text-left transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-400">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-mono font-bold text-cyan-300 flex items-center gap-2">
              <span>ROOT TERMINAL & PROCESS SUPERVISOR</span>
              <span className="text-[10px] px-2 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                {os}
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 font-mono">
              Barcha buyruqlar va operatsiyalar real vaqtda shu yerda ko'rinadi
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick status counters */}
          <div className="hidden sm:flex items-center gap-3 text-xs font-mono text-zinc-400">
            <span className="flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              {desktopState.cpuUsage}% CPU
            </span>
            <span className="flex items-center gap-1">
              <HardDrive className="w-3.5 h-3.5 text-sky-400" />
              {desktopState.memoryUsage}% RAM
            </span>
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              Root Active
            </span>
          </div>

          <div className="p-1 rounded-lg bg-zinc-800 text-zinc-400 hover:text-zinc-200">
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </button>

      {/* Collapsible Terminal Content */}
      {isOpen && (
        <div className="p-4 flex flex-col font-mono text-xs">
          {/* Active Quick Terminal Chips */}
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-zinc-800/80 overflow-x-auto">
            <span className="text-[10px] text-cyan-400 font-bold">Buyruqlar:</span>
            {['jarvis status', 'clean', 'ps aux', 'whoami', 'ls -la', 'clear'].map((cmd) => (
              <button
                key={cmd}
                onClick={() => {
                  playJarvisSound('blip');
                  onExecuteCommand(cmd);
                }}
                className="px-2.5 py-0.5 rounded bg-zinc-900 hover:bg-cyan-950 text-cyan-300 border border-zinc-800 hover:border-cyan-500/40 text-[11px] transition-colors"
              >
                {cmd}
              </button>
            ))}
          </div>

          {/* Terminal Logs Output */}
          <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-3 h-48 sm:h-64 overflow-y-auto space-y-2">
            <div className="text-zinc-500 text-[11px]">
              J.A.R.V.I.S. Root Kernel Session Initialized • Terminal Ready
            </div>
            {desktopState.terminalHistory.map((item, idx) => (
              <div key={idx} className="space-y-0.5">
                <div className="flex items-center text-cyan-400 font-bold">
                  <span className="text-emerald-400">{item.prompt}</span>
                  <span className="text-zinc-100 ml-1">{item.command}</span>
                </div>
                {item.output && (
                  <pre className="text-zinc-300 text-[11px] whitespace-pre-wrap font-mono pl-3 border-l border-cyan-500/20 py-0.5">
                    {item.output}
                  </pre>
                )}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Command Prompt Input */}
          <form onSubmit={handleRun} className="mt-3 flex items-center gap-2">
            <span className="text-emerald-400 font-bold shrink-0">{promptSymbol}</span>
            <input
              type="text"
              value={cmdInput}
              onChange={(e) => setCmdInput(e.target.value)}
              placeholder="Masalan: jarvis status, clean, whoami..."
              className="flex-1 bg-zinc-900 border border-zinc-800 focus:border-cyan-400 rounded-lg px-3 py-1.5 text-zinc-100 placeholder-zinc-500 focus:outline-none font-mono text-xs"
            />
            <button
              type="submit"
              disabled={!cmdInput.trim()}
              className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-black font-bold rounded-lg flex items-center gap-1 transition-colors text-xs"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Run</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
