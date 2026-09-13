import React, { useState } from 'react';
import { HostOS, VirtualDesktopState, VirtualFile, VirtualProcess } from '../types';
import {
  HardDrive,
  Cpu,
  Activity,
  Trash2,
  Plus,
  FileText,
  Terminal,
  RefreshCw,
  Folder,
  ShieldCheck,
  Zap,
  Save,
  Check,
  Search,
  AlertCircle
} from 'lucide-react';
import { playJarvisSound } from '../utils/jarvisVoice';

interface SystemManagerProps {
  os: HostOS;
  desktopState: VirtualDesktopState;
  onKillProcess: (pid: number) => void;
  onDeleteFile: (path: string) => void;
  onCreateFile: (path: string, content: string) => void;
  onSelectFileToEdit?: (file: VirtualFile) => void;
  fullAccess: boolean;
}

export const SystemManager: React.FC<SystemManagerProps> = ({
  os,
  desktopState,
  onKillProcess,
  onDeleteFile,
  onCreateFile,
  fullAccess,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'processes' | 'files'>('processes');
  const [processFilter, setProcessFilter] = useState('');
  const [fileFilter, setFileFilter] = useState('');
  
  // Selected file in preview/editor
  const [selectedFile, setSelectedFile] = useState<VirtualFile | null>(null);
  const [editingContent, setEditingContent] = useState<string>('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New file modal / inline creator
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileContent, setNewFileContent] = useState('');

  const filesList = Object.values(desktopState.files) as VirtualFile[];
  const isWindows = os === 'Windows';
  const basePath = isWindows ? 'C:\\Users\\owner' : '/Users/owner';

  const filteredProcesses = desktopState.processes.filter(p =>
    p.name.toLowerCase().includes(processFilter.toLowerCase()) ||
    p.pid.toString().includes(processFilter)
  );

  const filteredFiles = filesList.filter(f =>
    f.name.toLowerCase().includes(fileFilter.toLowerCase()) ||
    f.path.toLowerCase().includes(fileFilter.toLowerCase())
  );

  const handleSelectFile = (file: VirtualFile) => {
    setSelectedFile(file);
    setEditingContent(file.content);
    setSaveSuccess(false);
    playJarvisSound('blip');
  };

  const handleSaveFile = () => {
    if (!selectedFile) return;
    onCreateFile(selectedFile.path, editingContent);
    setSaveSuccess(true);
    playJarvisSound('acknowledge');
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleCreateNewFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;

    const trimmed = newFileName.trim();
    const fullPath = trimmed.includes('/') || trimmed.includes('\\')
      ? trimmed
      : `${basePath}/${trimmed}`;

    onCreateFile(fullPath, newFileContent);
    setIsCreatingFile(false);
    setNewFileName('');
    setNewFileContent('');
    playJarvisSound('acknowledge');
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Top Telemetry & Resource Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-zinc-950/90 border border-cyan-500/20 rounded-xl p-3 shadow-md">
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
            <span>CPU WORKLOAD</span>
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-bold font-mono text-cyan-300 mt-1">4.5%</div>
          <div className="w-full bg-zinc-800 rounded-full h-1.5 mt-2 overflow-hidden">
            <div className="bg-cyan-400 h-1.5 w-[4.5%]" />
          </div>
          <div className="text-[10px] text-zinc-500 font-mono mt-1">16 Cores @ 4.8 GHz</div>
        </div>

        <div className="bg-zinc-950/90 border border-cyan-500/20 rounded-xl p-3 shadow-md">
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
            <span>MEMORY ALLOCATED</span>
            <Activity className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-xl font-bold font-mono text-blue-300 mt-1">6.7 GB / 16 GB</div>
          <div className="w-full bg-zinc-800 rounded-full h-1.5 mt-2 overflow-hidden">
            <div className="bg-blue-400 h-1.5 w-[42%]" />
          </div>
          <div className="text-[10px] text-zinc-500 font-mono mt-1">42% Used • 9.3 GB Free</div>
        </div>

        <div className="bg-zinc-950/90 border border-cyan-500/20 rounded-xl p-3 shadow-md">
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
            <span>ACTIVE PROCESSES</span>
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
            {desktopState.processes.length} Active
          </div>
          <div className="w-full bg-zinc-800 rounded-full h-1.5 mt-2 overflow-hidden">
            <div className="bg-emerald-400 h-1.5 w-[65%]" />
          </div>
          <div className="text-[10px] text-zinc-500 font-mono mt-1">Root Daemon: PID 1420</div>
        </div>

        <div className="bg-zinc-950/90 border border-cyan-500/20 rounded-xl p-3 shadow-md">
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
            <span>STORAGE ITEMS</span>
            <HardDrive className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-300 mt-1">
            {filesList.length} Files
          </div>
          <div className="w-full bg-zinc-800 rounded-full h-1.5 mt-2 overflow-hidden">
            <div className="bg-amber-400 h-1.5 w-[28%]" />
          </div>
          <div className="text-[10px] text-zinc-500 font-mono mt-1">NVMe SSD • 364 GB Free</div>
        </div>
      </div>

      {/* Main Dual Pane Controller */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[560px]">
        {/* Left Column: Process Manager or File Tree (6 or 7 cols) */}
        <div className="lg:col-span-6 flex flex-col bg-zinc-950/90 border border-cyan-500/30 rounded-xl overflow-hidden shadow-xl">
          {/* Sub-tab Navigation */}
          <div className="bg-zinc-900/90 border-b border-cyan-500/20 px-3 py-2 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button
                id="tab-sub-processes"
                onClick={() => {
                  playJarvisSound('blip');
                  setActiveSubTab('processes');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center gap-2 transition-colors ${
                  activeSubTab === 'processes'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Process Supervisor ({desktopState.processes.length})</span>
              </button>

              <button
                id="tab-sub-files"
                onClick={() => {
                  playJarvisSound('blip');
                  setActiveSubTab('files');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center gap-2 transition-colors ${
                  activeSubTab === 'files'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Folder className="w-3.5 h-3.5" />
                <span>Disk Filesystem ({filesList.length})</span>
              </button>
            </div>

            {activeSubTab === 'files' && (
              <button
                id="btn-add-file"
                onClick={() => {
                  playJarvisSound('blip');
                  setIsCreatingFile(true);
                }}
                className="px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-bold flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New File</span>
              </button>
            )}
          </div>

          {/* Sub-tab Content: PROCESSES */}
          {activeSubTab === 'processes' && (
            <div className="flex-1 flex flex-col p-3 overflow-hidden">
              {/* Search filter */}
              <div className="mb-3 flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs font-mono">
                <Search className="w-3.5 h-3.5 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Filter processes by name or PID..."
                  value={processFilter}
                  onChange={(e) => setProcessFilter(e.target.value)}
                  className="bg-transparent border-none text-zinc-200 w-full focus:outline-none placeholder:text-zinc-600"
                />
              </div>

              {/* Process Table */}
              <div className="flex-1 overflow-y-auto border border-zinc-800/80 rounded-lg divide-y divide-zinc-900">
                <div className="grid grid-cols-12 text-[11px] font-mono text-zinc-400 bg-zinc-900/80 px-3 py-2 font-bold sticky top-0">
                  <span className="col-span-2">PID</span>
                  <span className="col-span-5">PROCESS NAME</span>
                  <span className="col-span-2">CPU</span>
                  <span className="col-span-3 text-right">ACTION</span>
                </div>

                {filteredProcesses.map((p) => (
                  <div
                    key={p.pid}
                    className="grid grid-cols-12 items-center px-3 py-2 hover:bg-zinc-900/60 transition-colors text-xs font-mono text-zinc-300 group"
                  >
                    <span className="col-span-2 text-zinc-500">{p.pid}</span>
                    <span className="col-span-5 font-medium text-zinc-200 flex items-center gap-1.5 truncate">
                      <span className={`w-1.5 h-1.5 rounded-full ${p.status === 'running' ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
                      <span className="truncate">{p.name}</span>
                    </span>
                    <span className="col-span-2 text-emerald-400">{p.cpu}</span>
                    <div className="col-span-3 flex justify-end">
                      <button
                        id={`btn-kill-${p.pid}`}
                        onClick={() => {
                          playJarvisSound('shutdown');
                          onKillProcess(p.pid);
                        }}
                        className="px-2 py-0.5 rounded bg-rose-950/60 hover:bg-rose-900 border border-rose-800/50 text-rose-300 text-[11px] font-mono flex items-center gap-1 transition-colors"
                        title={`Terminate process ${p.name} (PID ${p.pid})`}
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Kill</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sub-tab Content: FILES */}
          {activeSubTab === 'files' && (
            <div className="flex-1 flex flex-col p-3 overflow-hidden">
              {/* Search and New File form */}
              <div className="mb-3 flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs font-mono">
                <Search className="w-3.5 h-3.5 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Filter files by name or path..."
                  value={fileFilter}
                  onChange={(e) => setFileFilter(e.target.value)}
                  className="bg-transparent border-none text-zinc-200 w-full focus:outline-none placeholder:text-zinc-600"
                />
              </div>

              {/* Inline Create Form */}
              {isCreatingFile && (
                <form
                  onSubmit={handleCreateNewFile}
                  className="mb-3 p-3 bg-zinc-900/90 border border-cyan-500/40 rounded-xl space-y-2 font-mono text-xs shadow-lg animate-in fade-in duration-200"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-cyan-300 font-bold flex items-center gap-1.5">
                      <Plus className="w-3.5 h-3.5" />
                      Create New File
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsCreatingFile(false)}
                      className="text-zinc-500 hover:text-zinc-300"
                    >
                      ✕
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="File path or name (e.g. config.json, script.sh)..."
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded px-2.5 py-1.5 text-zinc-100 focus:outline-none focus:border-cyan-400"
                    autoFocus
                  />
                  <textarea
                    placeholder="File initial content..."
                    rows={3}
                    value={newFileContent}
                    onChange={(e) => setNewFileContent(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded px-2.5 py-1.5 text-zinc-100 focus:outline-none focus:border-cyan-400 font-mono"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsCreatingFile(false)}
                      className="px-3 py-1 rounded bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
                    >
                      Save File
                    </button>
                  </div>
                </form>
              )}

              {/* Files Table */}
              <div className="flex-1 overflow-y-auto border border-zinc-800/80 rounded-lg divide-y divide-zinc-900">
                {filteredFiles.map((f) => (
                  <div
                    key={f.path}
                    onClick={() => handleSelectFile(f)}
                    className={`p-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                      selectedFile?.path === f.path ? 'bg-cyan-950/40 border-l-2 border-cyan-400' : 'hover:bg-zinc-900/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <FileText className={`w-4 h-4 shrink-0 ${
                        f.name.endsWith('.log') ? 'text-amber-400' :
                        f.name.endsWith('.tmp') ? 'text-rose-400' :
                        f.name.endsWith('.env') ? 'text-emerald-400' : 'text-cyan-400'
                      }`} />
                      <div className="truncate font-mono">
                        <div className="text-zinc-200 text-xs font-semibold truncate">{f.name}</div>
                        <div className="text-[10px] text-zinc-500 truncate">{f.path}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 font-mono text-[11px] text-zinc-400 shrink-0">
                      <span>{f.size} B</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playJarvisSound('shutdown');
                          onDeleteFile(f.path);
                          if (selectedFile?.path === f.path) {
                            setSelectedFile(null);
                          }
                        }}
                        className="p-1 text-zinc-500 hover:text-rose-400 transition-colors"
                        title="Delete file"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: File Preview & Editor (6 cols) */}
        <div className="lg:col-span-6 flex flex-col bg-zinc-950/90 border border-cyan-500/30 rounded-xl overflow-hidden shadow-xl font-mono">
          <div className="bg-zinc-900/90 border-b border-cyan-500/20 px-3 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-cyan-300">
                {selectedFile ? selectedFile.name : 'System File Inspector'}
              </span>
              {selectedFile && (
                <span className="text-[10px] text-zinc-500">({selectedFile.size} bytes)</span>
              )}
            </div>

            {selectedFile && (
              <div className="flex items-center gap-2">
                {saveSuccess && (
                  <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Saved
                  </span>
                )}
                <button
                  onClick={handleSaveFile}
                  className="px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            )}
          </div>

          {selectedFile ? (
            <div className="flex-1 flex flex-col p-3">
              <div className="text-[10px] text-zinc-500 pb-2 border-b border-zinc-800 flex justify-between">
                <span>PATH: {selectedFile.path}</span>
                <span>UPDATED: {selectedFile.updatedAt}</span>
              </div>
              <textarea
                value={editingContent}
                onChange={(e) => setEditingContent(e.target.value)}
                className="flex-1 w-full mt-2 bg-zinc-900/50 border border-zinc-800 rounded-lg p-3 text-zinc-200 text-xs font-mono leading-relaxed focus:outline-none focus:border-cyan-500/50 resize-none"
              />
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-zinc-500 text-xs">
              <Folder className="w-12 h-12 text-zinc-700 mb-3" />
              <div className="text-zinc-300 font-bold mb-1">No File Selected</div>
              <p className="max-w-xs text-zinc-500">
                Click on any file in the Disk Filesystem on the left to inspect, edit, or modify its contents in real time.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
