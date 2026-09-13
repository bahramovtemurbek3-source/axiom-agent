import React, { useState } from 'react';
import { HostOS, VirtualDesktopState, VirtualFile } from '../types';
import {
  Terminal as TerminalIcon,
  Folder,
  FileText,
  Activity,
  Maximize2,
  Minimize2,
  X,
  HardDrive,
  MousePointer2,
  Camera,
  Layers,
  Sparkles,
  Search,
  Wifi,
  Battery,
  Volume2
} from 'lucide-react';

interface VirtualDesktopProps {
  state: VirtualDesktopState;
  onWindowChange: (win: 'terminal' | 'files' | 'editor' | 'monitor') => void;
  lastAction?: { type: string; x?: number; y?: number; text?: string; command?: string };
  screenshotFlash: boolean;
}

export const VirtualDesktop: React.FC<VirtualDesktopProps> = ({
  state,
  onWindowChange,
  lastAction,
  screenshotFlash,
}) => {
  const [selectedFile, setSelectedFile] = useState<VirtualFile | null>(null);
  const isWindows = state.os === 'Windows';

  const filesList: VirtualFile[] = Object.values(state.files);
  const tempCacheCount = filesList.filter((f: VirtualFile) => f.path.includes('temp_cache')).length;

  return (
    <div className="relative flex flex-col h-full bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Screenshot Flash Effect */}
      {screenshotFlash && (
        <div className="absolute inset-0 z-50 bg-white/40 pointer-events-none transition-opacity duration-300 animate-out fade-out" />
      )}

      {/* OS Topbar / Header (macOS style) */}
      {!isWindows && (
        <div className="bg-zinc-900/90 border-b border-zinc-800/80 px-3 py-1 flex items-center justify-between text-xs text-zinc-300 select-none z-10">
          <div className="flex items-center gap-3">
            <span className="text-zinc-100 font-bold text-sm"></span>
            <span className="font-semibold text-zinc-200">Finder</span>
            <span className="text-zinc-500 hover:text-zinc-300 cursor-pointer">File</span>
            <span className="text-zinc-500 hover:text-zinc-300 cursor-pointer">Edit</span>
            <span className="text-zinc-500 hover:text-zinc-300 cursor-pointer">View</span>
            <span className="text-zinc-500 hover:text-zinc-300 cursor-pointer">Terminal</span>
            <span className="text-zinc-500 hover:text-zinc-300 cursor-pointer">Help</span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-zinc-400 font-mono">
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>127.0.0.1:daemon</span>
            </div>
            <Wifi className="w-3.5 h-3.5 text-zinc-400" />
            <Battery className="w-3.5 h-3.5 text-zinc-400" />
            <span>Sun 13:14</span>
          </div>
        </div>
      )}

      {/* Desktop Canvas / Workspace */}
      <div className="relative flex-1 bg-gradient-to-br from-zinc-900 via-zinc-950 to-slate-950 p-3 overflow-hidden flex flex-col">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f29370f_1px,transparent_1px),linear-gradient(to_bottom,#1f29370f_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        {/* Floating Agent Cursor */}
        <div
          className="absolute z-40 transition-all duration-300 ease-out pointer-events-none flex items-start gap-1"
          style={{
            left: `${Math.max(10, Math.min(state.mousePos.x, 680))}px`,
            top: `${Math.max(10, Math.min(state.mousePos.y, 420))}px`,
          }}
        >
          <div className="relative">
            <MousePointer2 className="w-5 h-5 text-cyan-400 fill-cyan-400/30 drop-shadow-[0_2px_8px_rgba(6,182,212,0.6)]" />
            {state.mouseClick && (
              <span className="absolute -inset-2 rounded-full border border-cyan-400 animate-ping opacity-75" />
            )}
          </div>
          <span className="bg-zinc-900/90 border border-cyan-500/40 text-[10px] text-cyan-300 font-mono px-1.5 py-0.5 rounded shadow-sm">
            ({state.mousePos.x}, {state.mousePos.y})
          </span>
        </div>

        {/* Window Selector Tabs */}
        <div className="flex items-center justify-between gap-2 mb-2 z-10">
          <div className="flex items-center gap-1.5 bg-zinc-900/90 border border-zinc-800 rounded-lg p-1">
            <button
              id="desktop-tab-terminal"
              onClick={() => onWindowChange('terminal')}
              className={`px-3 py-1 rounded text-xs font-mono flex items-center gap-1.5 transition-colors ${
                state.activeWindow === 'terminal'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <TerminalIcon className="w-3.5 h-3.5" />
              {isWindows ? 'PowerShell 7' : 'zsh Terminal'}
            </button>

            <button
              id="desktop-tab-files"
              onClick={() => onWindowChange('files')}
              className={`px-3 py-1 rounded text-xs font-mono flex items-center gap-1.5 transition-colors ${
                state.activeWindow === 'files'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Folder className="w-3.5 h-3.5" />
              {isWindows ? 'File Explorer' : 'Finder'}
              {tempCacheCount > 0 && (
                <span className="px-1 py-0.2 rounded-full bg-zinc-800 text-[10px] text-zinc-400">
                  {filesList.length}
                </span>
              )}
            </button>

            <button
              id="desktop-tab-editor"
              onClick={() => onWindowChange('editor')}
              className={`px-3 py-1 rounded text-xs font-mono flex items-center gap-1.5 transition-colors ${
                state.activeWindow === 'editor'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              {isWindows ? 'Notepad' : 'TextEdit'}
            </button>

            <button
              id="desktop-tab-monitor"
              onClick={() => onWindowChange('monitor')}
              className={`px-3 py-1 rounded text-xs font-mono flex items-center gap-1.5 transition-colors ${
                state.activeWindow === 'monitor'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              {isWindows ? 'Task Manager' : 'Activity Monitor'}
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
            <span className="text-cyan-400 font-semibold flex items-center gap-1 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              JARVIS HUD STREAM
            </span>
            <span className="w-1 h-1 rounded-full bg-zinc-700" />
            <span className="hidden sm:inline">1920x1080 @ 60Hz</span>
            <span className="text-emerald-400">Root Session</span>
          </div>
        </div>

        {/* Window Content Display */}
        <div className="flex-1 bg-zinc-900/90 border border-zinc-800 rounded-lg overflow-hidden flex flex-col shadow-inner relative">
          {/* Window Titlebar */}
          <div className="bg-zinc-950/80 border-b border-zinc-800/80 px-3 py-1.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
              </div>
              <span className="text-xs font-mono text-zinc-300 ml-2">
                {state.activeWindow === 'terminal' && (isWindows ? 'Windows PowerShell — Administrator' : 'Terminal — zsh — 80x24')}
                {state.activeWindow === 'files' && (isWindows ? 'C:\\Users\\owner' : '/Users/owner')}
                {state.activeWindow === 'editor' && (selectedFile ? selectedFile.name : 'Untitled Document')}
                {state.activeWindow === 'monitor' && (isWindows ? 'Task Manager — Performance' : 'Activity Monitor — Processes')}
              </span>
            </div>

            <div className="flex items-center gap-2 text-zinc-500">
              <Minimize2 className="w-3.5 h-3.5 cursor-pointer hover:text-zinc-300" />
              <Maximize2 className="w-3.5 h-3.5 cursor-pointer hover:text-zinc-300" />
            </div>
          </div>

          {/* Window Body: Terminal */}
          {state.activeWindow === 'terminal' && (
            <div className="flex-1 p-3 bg-zinc-950 font-mono text-xs overflow-y-auto space-y-2 text-zinc-300">
              <div className="text-zinc-500 pb-1 border-b border-zinc-800/60 text-[11px]">
                {isWindows
                  ? 'Windows PowerShell\nCopyright (C) Microsoft Corporation. All rights reserved.'
                  : 'Last login: Sun Sep 13 13:14:19 on ttys001'}
              </div>

              {state.terminalHistory.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center gap-1 text-emerald-400">
                    <span className="text-cyan-400 font-semibold">{item.prompt}</span>
                    <span className="text-zinc-100">{item.command}</span>
                  </div>
                  {item.output && (
                    <pre className="text-zinc-400 text-[11px] whitespace-pre-wrap pl-2 border-l border-zinc-800/80 font-mono">
                      {item.output}
                    </pre>
                  )}
                </div>
              ))}

              {/* Current Prompt line */}
              <div className="flex items-center gap-1 text-emerald-400 pt-1">
                <span className="text-cyan-400 font-semibold">
                  {isWindows ? 'PS C:\\Users\\owner> ' : 'owner@macbook:~$ '}
                </span>
                <span className="inline-block w-2 h-4 bg-cyan-400 animate-pulse" />
              </div>
            </div>
          )}

          {/* Window Body: Files Explorer */}
          {state.activeWindow === 'files' && (
            <div className="flex-1 flex flex-col bg-zinc-950 text-xs font-mono">
              <div className="bg-zinc-900/60 border-b border-zinc-800/70 p-2 flex items-center justify-between text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
                  {isWindows ? 'C:\\Users\\owner' : '/Users/owner'}
                </span>
                <span className="text-[11px] text-zinc-500">
                  {filesList.length} items ({tempCacheCount} in temp_cache)
                </span>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-zinc-900">
                {filesList.map((file) => (
                  <div
                    key={file.path}
                    onClick={() => {
                      setSelectedFile(file);
                      onWindowChange('editor');
                    }}
                    className="p-2.5 flex items-center justify-between hover:bg-zinc-900/80 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <FileText className={`w-4 h-4 ${
                        file.name.endsWith('.log') ? 'text-amber-400' :
                        file.name.endsWith('.tmp') ? 'text-rose-400' :
                        file.name.endsWith('.zip') || file.name.endsWith('.tar.gz') ? 'text-emerald-400' : 'text-cyan-400'
                      }`} />
                      <div>
                        <div className="text-zinc-200 group-hover:text-cyan-300 font-semibold">
                          {file.name}
                        </div>
                        <div className="text-[10px] text-zinc-500">
                          {file.path}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-[11px] text-zinc-400">
                      <span>{file.size} B</span>
                      <span className="text-zinc-500">{file.updatedAt}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Window Body: Text Editor */}
          {state.activeWindow === 'editor' && (
            <div className="flex-1 flex flex-col bg-zinc-950 text-xs font-mono">
              <div className="bg-zinc-900/60 border-b border-zinc-800/70 p-2 flex items-center justify-between text-zinc-400">
                <span>{selectedFile ? selectedFile.path : 'Draft / buffer.txt'}</span>
                <span className="text-[11px] text-emerald-400 font-medium">UTF-8 • Saved</span>
              </div>

              <div className="flex-1 p-3 overflow-y-auto font-mono text-zinc-300 whitespace-pre-wrap">
                {selectedFile ? (
                  selectedFile.content
                ) : (
                  <div className="space-y-2">
                    <div className="text-zinc-500 italic">
                      # Axiom Agent Workspace Buffer
                    </div>
                    {state.typedBuffer ? (
                      <div className="text-cyan-300 font-mono">
                        {state.typedBuffer}
                      </div>
                    ) : (
                      <div className="text-zinc-600">
                        No active file selected. Click a file in Explorer or command the agent to type/write_file.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Window Body: Process Monitor */}
          {state.activeWindow === 'monitor' && (
            <div className="flex-1 flex flex-col bg-zinc-950 text-xs font-mono overflow-y-auto">
              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-2 p-3 border-b border-zinc-800 bg-zinc-900/30">
                <div className="p-2 rounded bg-zinc-900/80 border border-zinc-800">
                  <div className="text-zinc-500 text-[10px]">CPU USAGE</div>
                  <div className="text-base font-bold text-emerald-400">4.5%</div>
                  <div className="w-full bg-zinc-800 rounded-full h-1 mt-1 overflow-hidden">
                    <div className="bg-emerald-400 h-1 w-[4.5%]" />
                  </div>
                </div>
                <div className="p-2 rounded bg-zinc-900/80 border border-zinc-800">
                  <div className="text-zinc-500 text-[10px]">MEMORY USAGE</div>
                  <div className="text-base font-bold text-cyan-400">42% (6.7 GB)</div>
                  <div className="w-full bg-zinc-800 rounded-full h-1 mt-1 overflow-hidden">
                    <div className="bg-cyan-400 h-1 w-[42%]" />
                  </div>
                </div>
                <div className="p-2 rounded bg-zinc-900/80 border border-zinc-800">
                  <div className="text-zinc-500 text-[10px]">ACTIVE TASKS</div>
                  <div className="text-base font-bold text-zinc-200">{state.processes.length} Processes</div>
                  <div className="text-[10px] text-zinc-500 mt-1">Axiom Daemon PID: 1420</div>
                </div>
              </div>

              <div className="p-2 divide-y divide-zinc-900">
                <div className="grid grid-cols-5 text-[11px] text-zinc-500 font-semibold pb-1 px-2">
                  <span>PID</span>
                  <span className="col-span-2">PROCESS NAME</span>
                  <span>CPU</span>
                  <span>MEMORY</span>
                </div>
                {state.processes.map((p) => (
                  <div key={p.pid} className="grid grid-cols-5 py-2 px-2 hover:bg-zinc-900/60 transition-colors text-zinc-300">
                    <span className="text-zinc-500">{p.pid}</span>
                    <span className="col-span-2 font-medium text-zinc-100 flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${p.status === 'running' ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
                      {p.name}
                    </span>
                    <span className="text-emerald-400">{p.cpu}</span>
                    <span className="text-cyan-400">{p.mem}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Windows Taskbar (if Windows selected) */}
      {isWindows && (
        <div className="bg-zinc-950/95 border-t border-zinc-800/80 px-4 py-1.5 flex items-center justify-between text-xs select-none z-10">
          <div className="flex items-center gap-3">
            <button className="p-1 rounded hover:bg-zinc-800 text-cyan-400">
              <span className="text-sm font-bold">⊞</span>
            </button>
            <div className="flex items-center gap-2 bg-zinc-900/90 border border-zinc-800 rounded px-2 py-0.5 text-[11px] text-zinc-400">
              <Search className="w-3 h-3" />
              <span>Search apps, settings...</span>
            </div>
            <div className="flex items-center gap-1 ml-2">
              <button
                onClick={() => onWindowChange('terminal')}
                className={`p-1.5 rounded ${state.activeWindow === 'terminal' ? 'bg-zinc-800 text-cyan-400 border-b-2 border-cyan-400' : 'text-zinc-400 hover:bg-zinc-900'}`}
              >
                <TerminalIcon className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onWindowChange('files')}
                className={`p-1.5 rounded ${state.activeWindow === 'files' ? 'bg-zinc-800 text-amber-400 border-b-2 border-amber-400' : 'text-zinc-400 hover:bg-zinc-900'}`}
              >
                <Folder className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onWindowChange('editor')}
                className={`p-1.5 rounded ${state.activeWindow === 'editor' ? 'bg-zinc-800 text-cyan-400 border-b-2 border-cyan-400' : 'text-zinc-400 hover:bg-zinc-900'}`}
              >
                <FileText className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-zinc-400 font-mono">
            <Volume2 className="w-3.5 h-3.5" />
            <Wifi className="w-3.5 h-3.5" />
            <Battery className="w-3.5 h-3.5" />
            <span>1:14 PM</span>
          </div>
        </div>
      )}
    </div>
  );
};
