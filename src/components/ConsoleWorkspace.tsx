import React, { useState } from 'react';
import { HostOS, VirtualDesktopState, VirtualFile } from '../types';
import {
  Terminal as TerminalIcon,
  Activity,
  Folder,
  Monitor,
  CornerDownLeft,
  Trash2,
  FileText,
  MousePointer2,
  HardDrive,
  Check,
  Zap,
  Play,
  Maximize2
} from 'lucide-react';
import { VirtualDesktop } from './VirtualDesktop';
import { playJarvisSound } from '../utils/jarvisVoice';

interface ConsoleWorkspaceProps {
  os: HostOS;
  desktopState: VirtualDesktopState;
  onExecuteCommand: (cmd: string) => void;
  onKillProcess: (pid: number) => void;
  onDeleteFile: (path: string) => void;
  onWindowChange?: (win: 'terminal' | 'files' | 'editor' | 'monitor') => void;
  screenshotFlash: boolean;
  fullAccess: boolean;
}

export const ConsoleWorkspace: React.FC<ConsoleWorkspaceProps> = ({
  os,
  desktopState,
  onExecuteCommand,
  onKillProcess,
  onDeleteFile,
  onWindowChange,
  screenshotFlash,
  fullAccess,
}) => {
  const [activeConsoleTab, setActiveConsoleTab] = useState<'terminal' | 'processes' | 'files' | 'desktop'>('terminal');
  const [cmdInput, setCmdInput] = useState('');
  const [viewingFile, setViewingFile] = useState<VirtualFile | null>(null);

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
      ? 'PS [ADMIN] C:\\Users\\owner> '
      : os === 'Linux'
      ? 'root@jarvis-core:~# '
      : 'root@jarvis-mac:~# '
    : isWindows
    ? 'PS C:\\Users\\owner> '
    : 'owner@host:~$ ';

  const filesList = Object.values(desktopState.files) as VirtualFile[];

  return (
    <div className="flex flex-col h-full bg-zinc-950/90 border border-cyan-500/25 rounded-xl overflow-hidden shadow-2xl font-mono">
      {/* Console Sub-Header Tabs */}
      <div className="bg-zinc-900/90 border-b border-cyan-500/20 px-3 py-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            id="console-tab-terminal"
            onClick={() => {
              playJarvisSound('blip');
              setActiveConsoleTab('terminal');
            }}
            className={`px-2.5 py-1 rounded text-xs flex items-center gap-1.5 transition-colors ${
              activeConsoleTab === 'terminal'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 font-bold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <TerminalIcon className="w-3.5 h-3.5 text-cyan-400" />
            <span>Terminal</span>
          </button>

          <button
            id="console-tab-processes"
            onClick={() => {
              playJarvisSound('blip');
              setActiveConsoleTab('processes');
            }}
            className={`px-2.5 py-1 rounded text-xs flex items-center gap-1.5 transition-colors ${
              activeConsoleTab === 'processes'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 font-bold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>Processes ({desktopState.processes.length})</span>
          </button>

          <button
            id="console-tab-files"
            onClick={() => {
              playJarvisSound('blip');
              setActiveConsoleTab('files');
            }}
            className={`px-2.5 py-1 rounded text-xs flex items-center gap-1.5 transition-colors ${
              activeConsoleTab === 'files'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 font-bold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Folder className="w-3.5 h-3.5 text-amber-400" />
            <span>Files ({filesList.length})</span>
          </button>

          <button
            id="console-tab-desktop"
            onClick={() => {
              playJarvisSound('blip');
              setActiveConsoleTab('desktop');
            }}
            className={`px-2.5 py-1 rounded text-xs flex items-center gap-1.5 transition-colors ${
              activeConsoleTab === 'desktop'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 font-bold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Monitor className="w-3.5 h-3.5 text-blue-400" />
            <span>Desktop Screen</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-[11px] text-zinc-500">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-cyan-400">Root Session 0x00</span>
        </div>
      </div>

      {/* Body: Terminal */}
      {activeConsoleTab === 'terminal' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 p-3.5 bg-zinc-950 text-xs overflow-y-auto space-y-2 text-zinc-300">
            {desktopState.terminalHistory.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-emerald-400 font-bold">{item.prompt}</span>
                  <span className="text-zinc-100">{item.command}</span>
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
          <div className="bg-zinc-900/80 border-t border-zinc-800/80 px-2.5 py-1 flex items-center gap-1.5 overflow-x-auto text-[11px]">
            <span className="text-zinc-500 shrink-0">Quick:</span>
            {['jarvis status', 'ps aux', 'clean', 'neofetch', 'whoami', 'clear'].map((cmd) => (
              <button
                key={cmd}
                onClick={() => {
                  playJarvisSound('blip');
                  onExecuteCommand(cmd);
                }}
                className="shrink-0 px-2 py-0.5 rounded bg-zinc-800/80 hover:bg-cyan-950 text-cyan-300 border border-zinc-700/80 hover:border-cyan-400 transition-colors"
              >
                {cmd}
              </button>
            ))}
          </div>

          {/* Form input */}
          <form onSubmit={handleSubmit} className="p-2.5 bg-zinc-900/90 border-t border-cyan-500/30 flex items-center gap-2">
            <span className="text-emerald-400 font-bold text-xs shrink-0">{prompt}</span>
            <input
              type="text"
              value={cmdInput}
              onChange={(e) => setCmdInput(e.target.value)}
              placeholder="Run command ('jarvis status', 'ps aux', 'ls', 'clean', 'clear')..."
              className="flex-1 bg-transparent border-none text-zinc-100 text-xs focus:outline-none placeholder:text-zinc-600"
            />
            <button
              type="submit"
              className="px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1"
            >
              <span>Run</span>
              <CornerDownLeft className="w-3 h-3" />
            </button>
          </form>
        </div>
      )}

      {/* Body: Processes */}
      {activeConsoleTab === 'processes' && (
        <div className="flex-1 flex flex-col p-3 overflow-hidden">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-[11px] text-zinc-400">
            <span>RUNNING PROCESS SUPERVISOR</span>
            <span className="text-emerald-400 font-bold">{desktopState.processes.length} Active</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-zinc-900 mt-2">
            {desktopState.processes.map((p) => (
              <div key={p.pid} className="py-2 px-1 flex items-center justify-between hover:bg-zinc-900/50 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-zinc-500 text-[11px]">PID {p.pid}</span>
                  <span className="font-semibold text-zinc-200">{p.name}</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-emerald-400 text-[11px]">{p.cpu}</span>
                  <span className="text-cyan-400 text-[11px]">{p.mem}</span>
                  <button
                    onClick={() => {
                      playJarvisSound('shutdown');
                      onKillProcess(p.pid);
                    }}
                    className="p-1 text-zinc-500 hover:text-rose-400 transition-colors"
                    title="Terminate process"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Body: Files */}
      {activeConsoleTab === 'files' && (
        <div className="flex-1 flex flex-col p-3 overflow-hidden">
          {viewingFile ? (
            <div className="flex-1 flex flex-col">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-xs">
                <span className="text-cyan-300 font-bold">{viewingFile.name}</span>
                <button
                  onClick={() => setViewingFile(null)}
                  className="text-zinc-400 hover:text-zinc-200 text-xs"
                >
                  ✕ Close Preview
                </button>
              </div>
              <pre className="flex-1 overflow-y-auto p-3 mt-2 bg-zinc-900/60 rounded-lg text-zinc-300 text-xs whitespace-pre-wrap">
                {viewingFile.content}
              </pre>
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-[11px] text-zinc-400">
                <span>VIRTUAL DISK FILES</span>
                <span>{filesList.length} items</span>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-zinc-900 mt-2">
                {filesList.map((f) => (
                  <div
                    key={f.path}
                    onClick={() => {
                      playJarvisSound('blip');
                      setViewingFile(f);
                    }}
                    className="py-2 px-1 flex items-center justify-between hover:bg-zinc-900/50 cursor-pointer text-xs group"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="text-zinc-200 group-hover:text-cyan-300 truncate">{f.name}</span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-zinc-500 shrink-0">
                      <span>{f.size} B</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playJarvisSound('shutdown');
                          onDeleteFile(f.path);
                        }}
                        className="p-1 text-zinc-500 hover:text-rose-400 transition-colors"
                        title="Delete file"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Body: Virtual Desktop Screen */}
      {activeConsoleTab === 'desktop' && (
        <div className="flex-1 overflow-hidden flex flex-col">
          <VirtualDesktop
            state={desktopState}
            onWindowChange={onWindowChange || (() => {})}
            screenshotFlash={screenshotFlash}
          />
        </div>
      )}
    </div>
  );
};
