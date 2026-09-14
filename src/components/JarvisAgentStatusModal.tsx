import React, { useState, useEffect } from 'react';
import {
  Laptop,
  CheckCircle2,
  AlertCircle,
  Clock,
  Zap,
  Activity,
  RefreshCw,
  Terminal,
  X,
  Play,
  Copy,
  Check,
  ShieldCheck,
  Download,
  ExternalLink,
} from 'lucide-react';
import { localAgent, AgentStatus, LocalAgentDetails } from '../utils/localAgent';
import { playJarvisSound } from '../utils/jarvisVoice';
import { downloadJarvisMacLauncher, getTerminalSelfContainedCommand } from '../utils/macLauncherScript';

interface AgentStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const JarvisAgentStatusModal: React.FC<AgentStatusModalProps> = ({ isOpen, onClose }) => {
  const [status, setStatus] = useState<AgentStatus>(localAgent.getStatus());
  const [details, setDetails] = useState<LocalAgentDetails>(localAgent.getDetails());
  const [isChecking, setIsChecking] = useState(false);
  const [testOutput, setTestOutput] = useState<{ success?: boolean; message?: string } | null>(null);
  const [copiedCmd, setCopiedCmd] = useState(false);

  useEffect(() => {
    const unsub = localAgent.subscribe((st, dt) => {
      setStatus(st);
      setDetails(dt);
    });
    return unsub;
  }, []);

  if (!isOpen) return null;

  const handlePingNow = async () => {
    setIsChecking(true);
    playJarvisSound('blip');
    await localAgent.checkHeartbeat();
    setIsChecking(false);
  };

  const handleTestLaunch = async () => {
    playJarvisSound('acknowledge');
    setTestOutput({ message: "Mac agentiga 'Calculator' dasturini ochish buyrug'i yuborilmoqda..." });
    const res = await localAgent.executeAction('launch_application', { application: 'Calculator' });
    if (res.success) {
      setTestOutput({
        success: true,
        message: "✅ Calculator muvaffaqiyatli ochildi va jarayon faol ekanligi tekshirildi.",
      });
    } else {
      setTestOutput({
        success: false,
        message: `❌ Ochib bo'lmadi: ${res.error || 'Noma\'lum xatolik'}`,
      });
    }
  };

  const handleDownloadCommand = () => {
    playJarvisSound('blip');
    downloadJarvisMacLauncher();
  };

  const handleCopy = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  const terminalOfflineCmd = getTerminalSelfContainedCommand();

  const isConnected = status === 'connected';
  const isConnecting = status === 'connecting';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-lg rounded-2xl bg-[#060b17] border border-blue-900/60 shadow-[0_0_50px_rgba(0,102,255,0.2)] p-6 space-y-5 text-zinc-100 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-950/80 border border-blue-800/60 text-cyan-400">
            <Laptop className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-wide">
              Mahalliy Kompyuter Agenti (Local Agent)
            </h3>
            <p className="text-xs text-zinc-400">
              Mac kompyuteridagi amallarni real bajaruvchi fon xizmati (Daemon)
            </p>
          </div>
        </div>

        {/* Live Status Hero Banner */}
        <div
          className={`p-4 rounded-xl border flex items-center justify-between ${
            isConnected
              ? 'bg-emerald-950/40 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
              : isConnecting
              ? 'bg-amber-950/40 border-amber-500/50'
              : 'bg-rose-950/40 border-rose-500/50'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="relative flex h-3.5 w-3.5">
              {isConnected && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              )}
              <span
                className={`relative inline-flex rounded-full h-3.5 w-3.5 ${
                  isConnected
                    ? 'bg-emerald-500'
                    : isConnecting
                    ? 'bg-amber-500 animate-pulse'
                    : 'bg-rose-500'
                }`}
              />
            </span>
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span>
                  {isConnected
                    ? '🟢 Mac Connected (Ulandi)'
                    : isConnecting
                    ? '🟡 Connecting... (Bog\'lanmoqda)'
                    : '🔴 Mac Disconnected (Ulanmagan)'}
                </span>
              </div>
              <p className="text-xs text-zinc-300 mt-0.5">
                {isConnected
                  ? 'Real tizim buyruqlari mahalliy agent orqali to\'liq bajarilmoqda.'
                  : isConnecting
                  ? 'Agent bilan ulanish tekshirilmoqda...'
                  : 'Kompyuter buyruqlari bloklangan. Hech qanday soxta natija qaytarilmaydi.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {!isConnected && (
              <button
                onClick={async () => {
                  playJarvisSound('acknowledge');
                  try {
                    await fetch('/api/bridge/register', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ name: 'MacBook-M1', os: 'macOS', fullAccess: true }),
                    });
                  } catch (_) {}
                  localAgent.setManualConnected(true, 'MacBook-M1');
                }}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-emerald-500/20"
                title="Terminalda agentni ishga tushirgan bo'lsangiz, ulanishni darhol tasdiqlang"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Ulanishni tasdiqlash</span>
              </button>
            )}
            <button
              onClick={handlePingNow}
              disabled={isChecking}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-medium text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
              <span>Tekshirish</span>
            </button>
          </div>
        </div>

        {/* Telemetry Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-[#091122] border border-blue-950 space-y-1">
            <div className="text-zinc-400 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>Port</span>
            </div>
            <div className="text-sm font-bold font-mono text-cyan-300">:{details.port}</div>
            <div className="text-[10px] text-zinc-500">127.0.0.1</div>
          </div>

          <div className="p-3 rounded-xl bg-[#091122] border border-blue-950 space-y-1">
            <div className="text-zinc-400 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>Latency</span>
            </div>
            <div className="text-sm font-bold font-mono text-emerald-300">
              {isConnected ? `${details.latency} ms` : '—'}
            </div>
            <div className="text-[10px] text-zinc-500">Ping vaqti</div>
          </div>

          <div className="p-3 rounded-xl bg-[#091122] border border-blue-950 space-y-1">
            <div className="text-zinc-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              <span>Heartbeat</span>
            </div>
            <div className="text-sm font-bold font-mono text-sky-300">
              {isConnected ? '3.5s interval' : 'To\'xtatilgan'}
            </div>
            <div className="text-[10px] text-zinc-500">Avto-yangilanish</div>
          </div>

          <div className="p-3 rounded-xl bg-[#091122] border border-blue-950 space-y-1">
            <div className="text-zinc-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              <span>Versiya</span>
            </div>
            <div className="text-sm font-bold font-mono text-purple-300">v{details.agentVersion}</div>
            <div className="text-[10px] text-zinc-500">Mac Native</div>
          </div>
        </div>

        {/* If Disconnected: Show Download and Quick Start */}
        {!isConnected && (
          <div className="p-4 rounded-xl bg-[#0b1326] border border-blue-900/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-cyan-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Mac Launcher (Full Access):</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300">
                macOS Native
              </span>
            </div>

            {/* Direct Download Button */}
            <button
              type="button"
              onClick={handleDownloadCommand}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all cursor-pointer text-center"
            >
              <Download className="w-4 h-4" />
              <span>JarvisAI.command faylini yuklab olish</span>
            </button>

            <div className="p-2.5 rounded-lg bg-[#040813] border border-blue-950/80 text-[11px] text-zinc-300 space-y-1">
              <div className="font-semibold text-cyan-200">Yuklab olgandan so'ng:</div>
              <p className="text-zinc-400 leading-relaxed">
                1. Yuklab olingan <code className="text-emerald-300">JarvisAI.command</code> ustiga ikki marta bosing.<br />
                2. Ochilgan oynada ruxsatlar (Accessibility, Microphone, Screen) beriladi.<br />
                3. J.A.R.V.I.S. kompyuteringiz bilan avtomatik bog'lanadi.
              </p>
            </div>

            <div className="space-y-2 pt-1 border-t border-blue-950">
              <div className="flex items-center justify-between text-[11px] text-zinc-400">
                <span>Terminalda 1 qatorda yaratish & ishga tushirish:</span>
                <button
                  type="button"
                  onClick={() => handleCopy(terminalOfflineCmd)}
                  className="text-[11px] text-cyan-400 hover:text-white flex items-center gap-1 cursor-pointer font-medium"
                >
                  {copiedCmd ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>Buyruqni nusxalash</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* If Connected: Allow real quick test */}
        {isConnected && (
          <div className="p-3.5 rounded-xl bg-[#0b1326] border border-blue-900/50 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-300">Real Tizim Sinovi:</span>
              <button
                onClick={handleTestLaunch}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Play className="w-3 h-3" />
                <span>Calculator ochish</span>
              </button>
            </div>
            {testOutput && (
              <div
                className={`p-2.5 rounded-lg text-xs font-mono ${
                  testOutput.success ? 'bg-emerald-950/50 text-emerald-300' : 'bg-rose-950/50 text-rose-300'
                }`}
              >
                {testOutput.message}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-blue-950/60 text-xs">
          <span className="text-zinc-500">Xavfsizlik: Faqat Localhost (127.0.0.1)</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold cursor-pointer transition-colors"
          >
            Yopish
          </button>
        </div>
      </div>
    </div>
  );
};
