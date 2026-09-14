import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Terminal,
  Copy,
  Check,
  ShieldCheck,
  ShieldAlert,
  Laptop,
  CheckCircle2,
  Clock,
  Sparkles,
  RefreshCw,
  PowerOff,
  Cpu,
  HardDrive,
  Key,
  HelpCircle,
  Play,
  ArrowRight,
  AlertTriangle,
  Download,
} from 'lucide-react';
import { ConnectedDevice, HostOS } from '../types';
import { playJarvisSound } from '../utils/jarvisVoice';
import { downloadJarvisMacLauncher, getTerminalSelfContainedCommand } from '../utils/macLauncherScript';

interface JarvisConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  connectedDevice: ConnectedDevice | null;
  onSimulateConnect: (name: string, os: HostOS) => void;
  onDisconnect: () => void;
  onUpdatePermissions: (perms: ConnectedDevice['permissions']) => void;
}

export const JarvisConnectModal: React.FC<JarvisConnectModalProps> = ({
  isOpen,
  onClose,
  connectedDevice,
  onSimulateConnect,
  onDisconnect,
  onUpdatePermissions,
}) => {
  const [selectedOS, setSelectedOS] = useState<'windows' | 'macos' | 'linux'>('macos');
  const [copied, setCopied] = useState(false);
  const [simName, setSimName] = useState('MacBook-M1');
  const [originUrl, setOriginUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOriginUrl(window.location.origin);
      const ua = navigator.userAgent.toLowerCase();
      if (ua.includes('mac')) {
        setSelectedOS('macos');
        setSimName('MacBook-M1');
      } else if (ua.includes('win')) {
        setSelectedOS('windows');
        setSimName('Windows-PC');
      } else if (ua.includes('linux')) {
        setSelectedOS('linux');
        setSimName('Linux-Station');
      }
    }
  }, []);

  if (!isOpen) return null;

  const getCommand = () => {
    const base = originUrl || 'https://ais-dev-...';
    if (selectedOS === 'windows') {
      return `powershell -c "irm ${base}/connect.ps1 | iex"`;
    }
    if (selectedOS === 'macos') {
      return getTerminalSelfContainedCommand();
    }
    return `curl -sL ${base}/connect.sh | bash`;
  };

  const currentCommand = getCommand();

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCommand);
    playJarvisSound('blip');
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadMacLauncher = () => {
    playJarvisSound('blip');
    downloadJarvisMacLauncher();
  };

  const handleSimulate = () => {
    playJarvisSound('acknowledge');
    const osMap: Record<string, HostOS> = {
      windows: 'Windows',
      macos: 'macOS',
      linux: 'Linux',
    };
    onSimulateConnect(simName.trim() || 'My-Workstation', osMap[selectedOS] || 'Windows');
  };

  const togglePermission = (key: keyof ConnectedDevice['permissions']) => {
    if (!connectedDevice) return;
    playJarvisSound('blip');
    const updated = {
      ...connectedDevice.permissions,
      [key]: !connectedDevice.permissions[key],
    };
    onUpdatePermissions(updated);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-2xl bg-zinc-950 border border-cyan-500/40 rounded-3xl shadow-[0_0_50px_rgba(6,182,212,0.25)] overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Modal Header */}
          <div className="px-5 py-4 bg-zinc-900/90 border-b border-cyan-500/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                <Laptop className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-zinc-100 font-mono tracking-wide flex items-center gap-2">
                  <span>KOMPYUTERNI J.A.R.V.I.S. GA ULASH</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                    1-BOSQICH
                  </span>
                </h3>
                <p className="text-xs text-zinc-400 font-sans">
                  CMD yoki Terminalda bitta buyruq yozing — J.A.R.V.I.S. darhol ulanadi va ruxsat so'raydi
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-5 overflow-y-auto space-y-5 font-sans">
            {/* Live Connection Banner */}
            {connectedDevice ? (
              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-300 animate-pulse">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-mono font-bold text-emerald-300 flex items-center gap-2">
                      <span>KOMPYUTER ULANGAN: {connectedDevice.name}</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    </div>
                    <div className="text-[11px] text-zinc-300 font-mono mt-0.5">
                      {connectedDevice.os} • Level 10 Root faol • Barcha buyruqlar va monitoring ulandi
                    </div>
                  </div>
                </div>

                <button
                  onClick={onDisconnect}
                  className="px-3 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 border border-rose-500/40 text-rose-300 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <PowerOff className="w-3.5 h-3.5" />
                  <span>Ulanishni uzish</span>
                </button>
              </div>
            ) : (
              /* ONE-CLICK DIRECT CONNECT HERO CARD FOR MAC/PC */
              <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/70 via-sky-950/60 to-blue-950/70 border border-cyan-400/50 shadow-[0_0_25px_rgba(6,182,212,0.15)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="text-xs font-mono font-bold text-cyan-300 flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 border border-cyan-400/40 text-[10px]">
                      TAVSIYA ETILADI
                    </span>
                    <span>1-MARTA BOSISHDA KOMPYUTERNI ULASH</span>
                  </div>
                  <p className="text-xs text-zinc-300 font-sans">
                    Terminalda xatolik chiqmasligi uchun brauzerning xavfsiz kanali orqali kompyuteringizni J.A.R.V.I.S. ga to'liq bog'lang.
                  </p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <input
                    type="text"
                    value={simName}
                    onChange={(e) => setSimName(e.target.value)}
                    placeholder="Qurilma (masalan: m1)"
                    className="px-3 py-2 rounded-xl bg-black/80 border border-cyan-500/40 text-xs font-mono text-cyan-200 focus:outline-none focus:border-cyan-300 w-28 sm:w-32"
                  />
                  <button
                    type="button"
                    onClick={handleSimulate}
                    className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-sky-300 text-black font-mono font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:scale-105"
                  >
                    <Sparkles className="w-4 h-4 text-black" />
                    <span>Darhol Bog'lash</span>
                  </button>
                </div>
              </div>
            )}

            {/* Error Diagnostics & Explanations for Mac & Terminal */}
            <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/30 space-y-1.5 text-xs font-sans">
              <div className="font-mono font-bold text-amber-300 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Nega terminalingizda xatolik berdi? (Eslatma)</span>
              </div>
              <ul className="space-y-1 text-zinc-300 text-[11px] list-disc list-inside">
                <li>
                  <b className="text-zinc-100">zsh: command not found: powershell:</b> Siz <span className="text-cyan-300 font-mono">Mac (macOS M1)</span> foydalanuvchisisiz. PowerShell faqat Windows uchun. Mac-da esa <span className="text-cyan-300 font-mono">zsh / bash</span> ishlatiladi.
                </li>
                <li>
                  <b className="text-zinc-100">bash: line 1: &lt;!doctype html&gt;:</b> Google AI Studio bulut muhiti (ais-dev) tashqi <span className="font-mono text-cyan-300">curl</span> so'rovlarini xavfsizlik uchun bloklaydi.
                </li>
                <li>
                  <b className="text-emerald-300">Yechim:</b> Yuqoridagi <b className="text-cyan-300">"Darhol Bog'lash"</b> tugmasini bosing yoki ekraningizdagi tayyor <b className="text-cyan-300">J.A.R.V.I.S. Virtual Terminali</b>dan foydalaning!
                </li>
              </ul>
            </div>

            {/* Step 1: Choose Operating System */}
            <div>
              <label className="block text-xs font-mono font-bold text-zinc-300 mb-2 uppercase tracking-wider">
                1. Operatsion tizimingizni tanlang:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'windows', label: 'Windows', desc: 'CMD / PowerShell' },
                  { id: 'macos', label: 'macOS', desc: 'Terminal / zsh' },
                  { id: 'linux', label: 'Linux', desc: 'Bash / Shell' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      playJarvisSound('blip');
                      setSelectedOS(item.id as any);
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      selectedOS === item.id
                        ? 'bg-cyan-950/70 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                        : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                    }`}
                  >
                    <div className="font-mono font-bold text-xs">{item.label}</div>
                    <div className="text-[11px] opacity-75 mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: The 1-Line CMD Command to Run */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                  <span>2. Ushbu buyruqni CMD / Terminalga qo'ying:</span>
                </label>
                <span className="text-[11px] font-mono text-cyan-400">1 marta bosish bilan ulanadi</span>
              </div>

              <div className="relative group">
                <div className="w-full bg-black/90 border border-cyan-500/35 rounded-2xl p-3.5 font-mono text-xs text-cyan-300 break-all select-all flex items-center justify-between gap-3 shadow-inner">
                  <span className="text-emerald-400 select-none mr-1 font-bold">&gt;</span>
                  <span className="flex-1 text-zinc-100">{currentCommand}</span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className={`px-3 py-2 rounded-xl text-xs font-mono font-bold shrink-0 flex items-center gap-1.5 transition-all cursor-pointer shadow-md ${
                      copied
                        ? 'bg-emerald-500 text-black border border-emerald-400'
                        : 'bg-gradient-to-r from-cyan-500 to-sky-500 text-black hover:from-cyan-400 hover:to-sky-400'
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Nusxalandi!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Nusxalash</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Mac Direct Launcher Download */}
              {selectedOS === 'macos' && (
                <div className="mt-3 p-3.5 rounded-2xl bg-gradient-to-r from-blue-950/60 to-cyan-950/60 border border-blue-800/60 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs">
                    <div className="font-mono font-bold text-cyan-300 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>macOS Launcher Fayli (Full Access)</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Buyruq yozmasdan, to'g'ridan-to'g'ri .command faylini yuklab olib ishga tushiring
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownloadMacLauncher}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shrink-0 shadow-md"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Yuklab olish (.command)</span>
                  </button>
                </div>
              )}
            </div>

            {/* How it works breakdown */}
            <div className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-2">
              <div className="text-xs font-mono font-bold text-zinc-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Buyruqni bajarganda nima bo'ladi?
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px] text-zinc-400 font-sans pt-1">
                <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 space-y-1">
                  <div className="font-mono text-cyan-300 font-bold">1. CMD ga yozasiz</div>
                  <p>Yuqoridagi buyruqni CMD yoki PowerShellga tashlab Enter bosing.</p>
                </div>
                <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 space-y-1">
                  <div className="font-mono text-amber-300 font-bold">2. Ruxsat so'raydi</div>
                  <p>Terminalda: <span className="text-zinc-200 font-mono">"Ruxsat berasizmi? (Y/n)"</span> chiqadi, <b>Y</b> ni bosing.</p>
                </div>
                <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 space-y-1">
                  <div className="font-mono text-emerald-300 font-bold">3. Avtomatik ulanadi</div>
                  <p>J.A.R.V.I.S. brauzeringizda yashil rangda to'liq Root bilan ulanadi.</p>
                </div>
              </div>
            </div>

            {/* Active Permissions Checklist */}
            <div>
              <label className="block text-xs font-mono font-bold text-zinc-300 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Tizim Ruxsatlari (Root Privileges):
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  {
                    key: 'terminal' as const,
                    title: 'Terminal / CMD Buyruqlari',
                    desc: 'Barcha shell va PowerShell buyruqlarni masofadan bajarish',
                  },
                  {
                    key: 'monitoring' as const,
                    title: 'Resurslar Monitoringi',
                    desc: 'CPU, RAM va disk holatini real vaqtda o\'qish',
                  },
                  {
                    key: 'files' as const,
                    title: 'Fayllar Tizimi (Read/Write)',
                    desc: 'Fayllarni ko\'rish, o\'chirish va yangi fayllar yaratish',
                  },
                  {
                    key: 'voiceControl' as const,
                    title: 'Ovozli Boshqaruv (Voice Link)',
                    desc: 'Ovoz orqali to\'g\'ridan-to\'g\'ri kompyuterga buyruq berish',
                  },
                ].map((perm) => {
                  const isActive = connectedDevice ? connectedDevice.permissions[perm.key] : true;
                  return (
                    <div
                      key={perm.key}
                      onClick={() => togglePermission(perm.key)}
                      className={`p-3 rounded-2xl border transition-all flex items-start justify-between gap-2 cursor-pointer ${
                        isActive
                          ? 'bg-zinc-900/90 border-emerald-500/30'
                          : 'bg-zinc-900/40 border-zinc-800 opacity-60'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-mono font-bold text-zinc-200">{perm.title}</div>
                        <div className="text-[11px] text-zinc-400 mt-0.5">{perm.desc}</div>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                          isActive
                            ? 'bg-emerald-500 text-black border-emerald-400'
                            : 'border-zinc-700 bg-zinc-800'
                        }`}
                      >
                        {isActive && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Instant In-Browser Test Connector */}
            <div className="p-4 rounded-2xl bg-zinc-900/40 border border-cyan-500/20 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs font-mono font-bold text-cyan-300 flex items-center gap-1.5">
                  <Play className="w-3.5 h-3.5" />
                  Terminalni ochmasdan brauzerda sinashni xohlaysizmi?
                </div>
                <div className="text-[11px] text-zinc-400 mt-0.5">
                  1-bosqichda virtual kompyuterni bir zumda J.A.R.V.I.S. ga bog'lab ko'rishingiz mumkin.
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={simName}
                  onChange={(e) => setSimName(e.target.value)}
                  placeholder="Qurilma nomi"
                  className="px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-700 text-xs font-mono text-zinc-200 focus:outline-none focus:border-cyan-400 w-36"
                />
                <button
                  type="button"
                  onClick={handleSimulate}
                  className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-black font-mono font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.3)]"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Tezkor Bog'lash</span>
                </button>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-5 py-3.5 bg-zinc-900/90 border-t border-cyan-500/20 flex items-center justify-between">
            <div className="text-[11px] font-mono text-zinc-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>J.A.R.V.I.S. OMNI PROTOCOL • LEVEL 10 CLEARANCE</span>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono transition-colors cursor-pointer"
            >
              Yopish
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
