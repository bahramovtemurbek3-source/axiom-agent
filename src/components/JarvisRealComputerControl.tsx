import React, { useState, useEffect } from 'react';
import {
  Laptop,
  CheckCircle2,
  ShieldCheck,
  Terminal,
  Cpu,
  HardDrive,
  Globe,
  Folder,
  Download,
  Copy,
  Check,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  ExternalLink,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { HostOS } from '../types';
import { playJarvisSound, speakJarvis } from '../utils/jarvisVoice';
import { localAgent, AgentStatus, LocalAgentDetails } from '../utils/localAgent';

interface RealComputerControlProps {
  hostOS: HostOS;
  onSetHostOS: (os: HostOS) => void;
  isDeviceConnected?: boolean;
  onConnectDevice?: (name: string, os: HostOS) => void;
  onDisconnectDevice?: () => void;
  deviceName?: string;
  onOpenLocalFilePicker?: () => void;
  onOpenBrowser?: (url: string) => void;
}

export const JarvisRealComputerControl: React.FC<RealComputerControlProps> = ({
  hostOS,
  onSetHostOS,
  deviceName = 'MacBook-M1',
  onOpenLocalFilePicker,
  onOpenBrowser,
}) => {
  const [agentStatus, setAgentStatus] = useState<AgentStatus>(localAgent.getStatus());
  const [agentDetails, setAgentDetails] = useState<LocalAgentDetails>(localAgent.getDetails());
  const [isPinging, setIsPinging] = useState(false);
  const [actionLog, setActionLog] = useState<{
    time: string;
    action: string;
    success: boolean;
    message: string;
  } | null>(null);

  useEffect(() => {
    const unsub = localAgent.subscribe((st, dt) => {
      setAgentStatus(st);
      setAgentDetails(dt);
    });
    return unsub;
  }, []);

  const isConnected = agentStatus === 'connected';
  const isConnecting = agentStatus === 'connecting';

  // Real tool action executor
  const handleExecuteRealTool = async (action: string, params: any, label: string) => {
    playJarvisSound('acknowledge');
    const time = new Date().toLocaleTimeString();

    if (!isConnected) {
      setActionLog({
        time,
        action: label,
        success: false,
        message: '🔴 Mac agent is not connected. Iltimos, terminalda ./JarvisAI.command ni ishga tushiring.',
      });
      speakJarvis("Mac agenti ulanmagan. Iltimos, avval lokal agentni ishga tushiring.");
      return;
    }

    setActionLog({
      time,
      action: label,
      success: true,
      message: `Bajarilmoqda: ${label}...`,
    });

    const res = await localAgent.executeAction(action, params);
    if (res.success) {
      setActionLog({
        time,
        action: label,
        success: true,
        message: `✅ Muvaffaqiyatli bajarildi: ${res.message || label}`,
      });
      speakJarvis(`${label} bajarildi, janob.`);
    } else {
      setActionLog({
        time,
        action: label,
        success: false,
        message: `❌ Bajarib bo'lmadi: ${res.error || 'Xatolik yuz berdi'}`,
      });
      speakJarvis(`${label}ni bajarib bo'lmadi.`);
    }
  };

  const handlePing = async () => {
    setIsPinging(true);
    playJarvisSound('blip');
    await localAgent.checkHeartbeat();
    setIsPinging(false);
  };

  return (
    <div className="flex-1 bg-[#050813] p-6 overflow-y-auto space-y-6 text-zinc-100 select-none">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-[#071329] via-[#091838] to-[#040914] border border-blue-900/60 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Laptop className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl font-bold text-white tracking-wide font-sans">
              Haqiqiy Kompyuter Boshqaruvi
            </h2>
          </div>
          <p className="text-xs text-zinc-300 font-sans">
            Port 4141 dagi mahalliy agent orqali Mac tizimingizni haqiqiy boshqaring.
          </p>
        </div>

        {/* Real Live Agent Connection Badge */}
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-2 ${
              isConnected
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                : isConnecting
                ? 'bg-amber-950/80 border-amber-500/50 text-amber-300'
                : 'bg-rose-950/80 border-rose-500/50 text-rose-300'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected
                  ? 'bg-emerald-400 animate-pulse'
                  : isConnecting
                  ? 'bg-amber-400 animate-pulse'
                  : 'bg-rose-400'
              }`}
            />
            <span>
              {isConnected
                ? `🟢 MAC ULANGAN (:4141, ${agentDetails.latency}ms)`
                : isConnecting
                ? '🟡 TEKSHIRILMOQDA...'
                : '🔴 MAC ULANMAGAN'}
            </span>
          </span>

          <button
            onClick={handlePing}
            disabled={isPinging}
            className="p-2 rounded-xl bg-blue-900/40 hover:bg-blue-800/60 border border-blue-700/50 text-white transition-all cursor-pointer"
            title="Heartbeat tekshirish"
          >
            <RefreshCw className={`w-4 h-4 ${isPinging ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Hardware / Agent Diagnostics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#081020] border border-blue-950/80 space-y-1">
          <div className="text-zinc-400 text-xs flex items-center gap-1.5">
            <Laptop className="w-4 h-4 text-cyan-400" />
            <span>Qurilma / Xost</span>
          </div>
          <div className="text-base font-bold text-white font-mono truncate">{agentDetails.hostname}</div>
          <div className="text-[11px] text-zinc-400">{agentDetails.platform} ({agentDetails.os})</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#081020] border border-blue-950/80 space-y-1">
          <div className="text-zinc-400 text-xs flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-sky-400" />
            <span>Agent Porti</span>
          </div>
          <div className="text-base font-bold text-white font-mono">Port :{agentDetails.port}</div>
          <div className="text-[11px] text-zinc-400">127.0.0.1 (Localhost)</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#081020] border border-blue-950/80 space-y-1">
          <div className="text-zinc-400 text-xs flex items-center gap-1.5">
            <HardDrive className="w-4 h-4 text-emerald-400" />
            <span>Agent Versiyasi</span>
          </div>
          <div className="text-base font-bold text-white font-mono">v{agentDetails.agentVersion}</div>
          <div className="text-[11px] text-emerald-400 font-medium">Native Process Verification</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#081020] border border-blue-950/80 space-y-1">
          <div className="text-zinc-400 text-xs flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Xavfsizlik Rejimi</span>
          </div>
          <div className="text-base font-bold text-amber-400 font-mono">REAL COMPUTER</div>
          <div className="text-[11px] text-zinc-400">Never Fake Execution</div>
        </div>
      </div>

      {/* Disconnection Banner if offline */}
      {!isConnected && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-1">
            <div className="font-bold text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Mahalliy Mac Agenti ulanmagan</span>
            </div>
            <p className="text-zinc-300 text-[11px]">
              Jarvis ilovalarni ochish yoki tizim buyruqlarini bajarishi uchun kompyuteringizda agent ishlab turishi shart.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <code className="px-2.5 py-1.5 rounded-lg bg-black/60 border border-rose-900 font-mono text-emerald-400 text-[11px]">
              ./JarvisAI.command
            </code>
          </div>
        </div>
      )}

      {/* Real Interactive Computer Actions */}
      <div className="p-5 rounded-2xl bg-[#081020] border border-blue-950/80 space-y-4">
        <h3 className="text-sm font-bold text-white tracking-wide">
          Haqiqiy Kompyuter Amallari (Real Execution):
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {/* Action 1: Launch Discord */}
          <button
            onClick={() => handleExecuteRealTool('launch_application', { application: 'Discord' }, 'Discord')}
            className="p-3.5 rounded-xl bg-[#0c152a] hover:bg-[#122042] border border-blue-900/60 hover:border-cyan-400 text-left transition-all cursor-pointer group space-y-1"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white group-hover:text-cyan-300">
                1. Discord Ilovasini Ochish
              </span>
              <Play className="w-4 h-4 text-indigo-400" />
            </div>
            <p className="text-[11px] text-zinc-400">
              Mac ilovalari orasidan Discord dasturini haqiqiy ishga tushiradi.
            </p>
          </button>

          {/* Action 2: Launch Google Chrome */}
          <button
            onClick={() => handleExecuteRealTool('launch_application', { application: 'Google Chrome' }, 'Google Chrome')}
            className="p-3.5 rounded-xl bg-[#0c152a] hover:bg-[#122042] border border-blue-900/60 hover:border-cyan-400 text-left transition-all cursor-pointer group space-y-1"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white group-hover:text-cyan-300">
                2. Chrome Brauzerini Ochish
              </span>
              <Globe className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-[11px] text-zinc-400">
              Google Chrome ilovasini Mac tizimida ishga tushiradi.
            </p>
          </button>

          {/* Action 3: Open YouTube URL */}
          <button
            onClick={() => handleExecuteRealTool('open_url', { url: 'https://www.youtube.com' }, 'YouTube URL')}
            className="p-3.5 rounded-xl bg-[#0c152a] hover:bg-[#122042] border border-blue-900/60 hover:border-cyan-400 text-left transition-all cursor-pointer group space-y-1"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white group-hover:text-cyan-300">
                3. YouTube Saytini Ochish
              </span>
              <Globe className="w-4 h-4 text-red-400" />
            </div>
            <p className="text-[11px] text-zinc-400">
              Kompyuter standart brauzerida YouTube ni haqiqiy ochadi.
            </p>
          </button>

          {/* Action 4: Real System Diagnostics */}
          <button
            onClick={() => handleExecuteRealTool('get_system_info', {}, 'Tizim Diagnostikasi')}
            className="p-3.5 rounded-xl bg-[#0c152a] hover:bg-[#122042] border border-blue-900/60 hover:border-cyan-400 text-left transition-all cursor-pointer group space-y-1"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white group-hover:text-cyan-300">
                4. Mac Hardware Diagnostika
              </span>
              <Cpu className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-[11px] text-zinc-400">
              Mac CPU, RAM, OS va model ma'lumotlarini o'qiydi.
            </p>
          </button>

          {/* Action 5: Launch Calculator */}
          <button
            onClick={() => handleExecuteRealTool('launch_application', { application: 'Calculator' }, 'Calculator')}
            className="p-3.5 rounded-xl bg-[#0c152a] hover:bg-[#122042] border border-blue-900/60 hover:border-cyan-400 text-left transition-all cursor-pointer group space-y-1"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white group-hover:text-cyan-300">
                5. Kalkulyator Ochish
              </span>
              <Play className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-[11px] text-zinc-400">
              Standart macOS Calculator ilovasini ochadi.
            </p>
          </button>

          {/* Action 6: Launch Terminal */}
          <button
            onClick={() => handleExecuteRealTool('launch_application', { application: 'Terminal' }, 'Terminal')}
            className="p-3.5 rounded-xl bg-[#0c152a] hover:bg-[#122042] border border-blue-900/60 hover:border-cyan-400 text-left transition-all cursor-pointer group space-y-1"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white group-hover:text-cyan-300">
                6. macOS Terminalini Ochish
              </span>
              <Terminal className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-[11px] text-zinc-400">
              macOS Terminal oynasini ishga tushiradi.
            </p>
          </button>
        </div>

        {/* Live Execution Output Log */}
        {actionLog && (
          <div
            className={`p-3.5 rounded-xl border text-xs font-mono space-y-1 ${
              actionLog.success
                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                : 'bg-rose-950/40 border-rose-500/50 text-rose-300'
            }`}
          >
            <div className="flex items-center justify-between font-sans text-[11px] text-zinc-400">
              <span>Amal: {actionLog.action}</span>
              <span>{actionLog.time}</span>
            </div>
            <div className="text-xs">{actionLog.message}</div>
          </div>
        )}
      </div>

      {/* Quick Launch Instruction Card */}
      <div className="p-5 rounded-2xl bg-[#081020] border border-blue-950/80 space-y-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-bold text-white">
            Mahalliy Agentni Boshqarish ({hostOS})
          </h3>
        </div>
        <p className="text-xs text-zinc-300 font-sans leading-relaxed">
          Agent <code className="text-cyan-300 font-mono">127.0.0.1:4141</code> manzilida fon jarayoni sifatida ishlaydi. 
          Agar agent to'xtab qolsa, loyiha ildizida quyidagi buyruqni bering:
        </p>
        <pre className="p-3 rounded-xl bg-[#040813] border border-blue-950 text-xs font-mono text-emerald-400 overflow-x-auto">
          ./JarvisAI.command
        </pre>
      </div>
    </div>
  );
};
