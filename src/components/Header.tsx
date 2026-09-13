import React from 'react';
import { HostOS, ConnectedDevice } from '../types';
import {
  ShieldAlert,
  Power,
  RefreshCw,
  Zap,
  Sparkles,
  ShieldCheck,
  Cpu,
  Monitor,
  Laptop
} from 'lucide-react';
import { playJarvisSound } from '../utils/jarvisVoice';

interface HeaderProps {
  os: HostOS;
  onSelectOS: (os: HostOS) => void;
  isRunning: boolean;
  killSwitchEngaged: boolean;
  onTriggerKillSwitch: () => void;
  onResetMachine: () => void;
  engineSource: string;
  isListening: boolean;
  connectedDevice: ConnectedDevice | null;
  onOpenConnectModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  os,
  onSelectOS,
  isRunning,
  killSwitchEngaged,
  onTriggerKillSwitch,
  onResetMachine,
  engineSource,
  isListening,
  connectedDevice,
  onOpenConnectModal,
}) => {
  const killShortcut = os === 'macOS' ? 'Shift + R' : 'Shift + N';

  return (
    <header className="border-b border-cyan-500/20 bg-zinc-950/95 backdrop-blur sticky top-0 z-40 px-3 sm:px-6 py-2.5 shadow-[0_4px_25px_rgba(0,0,0,0.5)]">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Jarvis Arc Core badge */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-400/50 text-cyan-300 font-mono font-bold text-xs shadow-[0_0_15px_rgba(6,182,212,0.4)]">
            <Zap className="w-5 h-5 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold tracking-wider text-zinc-100 uppercase font-mono flex items-center gap-1.5">
                <span className="text-cyan-400">J.A.R.V.I.S.</span>
                <span className="text-zinc-600">/</span>
                <span className="text-zinc-300">CORE</span>
              </h1>
              <span
                className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-mono border ${
                  killSwitchEngaged
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                    : isListening
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 animate-pulse'
                    : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    killSwitchEngaged ? 'bg-rose-500' : isListening ? 'bg-cyan-400 animate-ping' : 'bg-emerald-400'
                  }`}
                />
                {killSwitchEngaged ? 'HALTED' : isListening ? 'LISTENING' : 'ONLINE'}
              </span>
            </div>
            <div className="text-[10px] font-mono text-zinc-400 flex items-center gap-2">
              <span className="text-cyan-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                {engineSource}
              </span>
              <span>•</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Level 10 Root
              </span>
            </div>
          </div>
        </div>

        {/* OS Switcher & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Connect Computer (CMD Bridge) Button */}
          <button
            onClick={() => {
              playJarvisSound('blip');
              onOpenConnectModal();
            }}
            className={`px-3 py-1 rounded-xl text-xs font-mono font-bold flex items-center gap-2 border transition-all cursor-pointer ${
              connectedDevice
                ? 'bg-emerald-950/80 border-emerald-400 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                : 'bg-cyan-950/80 hover:bg-cyan-900 border-cyan-500/50 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
            }`}
            title="Kompyuterni CMD orqali J.A.R.V.I.S. ga ulash"
          >
            <Laptop className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">
              {connectedDevice ? `Ulangan: ${connectedDevice.name}` : 'Kompyuterni Ulash (CMD)'}
            </span>
            <span className="md:hidden">
              {connectedDevice ? 'Ulangan' : 'Ulash'}
            </span>
            <span
              className={`w-2 h-2 rounded-full ${
                connectedDevice ? 'bg-emerald-400 animate-pulse' : 'bg-cyan-400 animate-ping'
              }`}
            />
          </button>

          {/* OS Selector Pills */}
          <div className="flex items-center p-0.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs font-mono">
            {(['macOS', 'Windows', 'Linux'] as HostOS[]).map((target) => (
              <button
                key={target}
                onClick={() => {
                  playJarvisSound('blip');
                  onSelectOS(target);
                }}
                className={`px-2.5 py-1 rounded-lg transition-all text-[11px] font-medium ${
                  os === target
                    ? 'bg-cyan-600 text-black font-bold shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {target}
              </button>
            ))}
          </div>

          {/* Reboot Button */}
          <button
            onClick={onResetMachine}
            className="px-2.5 py-1 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 hover:border-zinc-700 text-xs font-mono flex items-center gap-1.5 transition-colors"
            title="Tizimni qayta ishga tushirish"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Qayta yuklash</span>
          </button>

          {/* Emergency Kill Switch */}
          <button
            onClick={killSwitchEngaged ? onResetMachine : onTriggerKillSwitch}
            className={`px-3 py-1 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 border transition-all ${
              killSwitchEngaged
                ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.5)]'
                : 'bg-zinc-900/80 hover:bg-rose-950/50 text-rose-400 hover:text-rose-300 border-rose-900/60 hover:border-rose-500/50'
            }`}
            title={`Favqulodda to'xtatish (${killShortcut})`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{killSwitchEngaged ? 'Qayta yoqish' : 'Kill Switch'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
