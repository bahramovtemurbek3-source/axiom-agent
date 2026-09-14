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
} from 'lucide-react';
import { localAgent, AgentStatus, LocalAgentDetails } from '../utils/localAgent';
import { playJarvisSound } from '../utils/jarvisVoice';

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

  const handleCopy = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

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

          <button
            onClick={handlePingNow}
            disabled={isChecking}
            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-medium text-white flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
            <span>Tekshirish</span>
          </button>
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

        {/* If Disconnected: Show Quick Start Command */}
        {!isConnected && (
          <div className="p-4 rounded-xl bg-[#0b1326] border border-blue-900/60 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-semibold text-cyan-300">
              <span className="flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span>Agentni Mac terminalida ishga tushiring:</span>
              </span>
              <button
                onClick={() => handleCopy('./JarvisAI.command')}
                className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                {copiedCmd ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>Nusxalash</span>
              </button>
            </div>
            <pre className="p-2.5 rounded-lg bg-[#040813] border border-blue-950 font-mono text-xs text-emerald-400 overflow-x-auto">
              ./JarvisAI.command
            </pre>
            <p className="text-[11px] text-zinc-400">
              Yoki bevosita Node.js orqali: <code className="text-zinc-200">node local-agent/agent.js</code>. Agent
              ishga tushishi bilan ushbu indikator avtomatik ravishda yashil rangga o'tadi.
            </p>
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
