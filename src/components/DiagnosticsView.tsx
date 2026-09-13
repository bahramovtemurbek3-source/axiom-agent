import React, { useState, useEffect } from 'react';
import { HostOS } from '../types';
import {
  ShieldCheck,
  Zap,
  Activity,
  Cpu,
  HardDrive,
  Wifi,
  Radio,
  Layers,
  Thermometer,
  Lock,
  Unlock,
  CheckCircle2,
  Terminal,
  RefreshCw
} from 'lucide-react';
import { playJarvisSound } from '../utils/jarvisVoice';

interface DiagnosticsViewProps {
  os: HostOS;
  fullAccess: boolean;
  onToggleFullAccess: () => void;
}

export const DiagnosticsView: React.FC<DiagnosticsViewProps> = ({
  os,
  fullAccess,
  onToggleFullAccess,
}) => {
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPulse((p) => (p + 1) % 360);
    }, 100);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col gap-5 font-mono">
      {/* Top Banner: Arc Core & Security Header */}
      <div className="bg-zinc-950/90 border border-cyan-500/30 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />
        
        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-400/50 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                <Zap className="w-5 h-5 text-cyan-400 animate-pulse" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-cyan-300 flex items-center gap-2 uppercase tracking-wider">
                  <span>J.A.R.V.I.S. Neural Core Diagnostics</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    ALL SYSTEMS NOMINAL
                  </span>
                </h2>
                <p className="text-xs text-zinc-400">
                  Stark Industries Protocol Mk VII • Operating on {os} Kernel
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              playJarvisSound('acknowledge');
              onToggleFullAccess();
            }}
            className={`px-4 py-2 rounded-xl border font-bold text-xs flex items-center gap-2.5 transition-all shadow-lg ${
              fullAccess
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                : 'bg-zinc-900 border-zinc-700 text-zinc-400'
            }`}
          >
            {fullAccess ? <Unlock className="w-4 h-4 text-cyan-300" /> : <Lock className="w-4 h-4" />}
            <div className="text-left">
              <div className="text-[10px] text-cyan-400 uppercase">Clearance Status</div>
              <div>{fullAccess ? 'LEVEL 10: FULL ROOT GRANTED' : 'STANDARD ISOLATED'}</div>
            </div>
          </button>
        </div>
      </div>

      {/* Grid: Arc Reactor Telemetry + Security Matrix + Hardware Intercepts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Arc Reactor Core Telemetry (4 cols) */}
        <div className="lg:col-span-4 bg-zinc-950/90 border border-cyan-500/30 rounded-2xl p-5 shadow-xl flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
            <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              Arc Core Matrix
            </span>
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          </div>

          <div className="flex flex-col items-center py-4">
            <div className="relative w-40 h-40 flex items-center justify-center">
              <div
                className="absolute inset-0 rounded-full border-2 border-dashed border-cyan-500/40 animate-spin"
                style={{ animationDuration: '12s' }}
              />
              <div
                className="absolute inset-2 rounded-full border border-blue-400/40"
                style={{ transform: `rotate(${pulse}deg)` }}
              />
              <div className="w-24 h-24 rounded-full bg-cyan-950/70 border-2 border-cyan-400 flex flex-col items-center justify-center shadow-[0_0_25px_rgba(6,182,212,0.5)]">
                <span className="text-2xl font-bold text-cyan-200">100%</span>
                <span className="text-[10px] text-cyan-400 font-bold">3.2 GW</span>
              </div>
            </div>
            <div className="text-xs text-center text-zinc-300 mt-3">
              Output: 3.2 Giga-Watts (Palladium Core Stable)
            </div>
          </div>

          <div className="space-y-2 text-xs divide-y divide-zinc-900">
            <div className="flex justify-between py-1.5 text-zinc-400">
              <span>Core Temperature</span>
              <span className="text-emerald-400 font-bold">28.4°C (Optimal)</span>
            </div>
            <div className="flex justify-between py-1.5 text-zinc-400">
              <span>Flux Capacitor</span>
              <span className="text-cyan-300 font-bold">99.98% Synchronized</span>
            </div>
            <div className="flex justify-between py-1.5 text-zinc-400">
              <span>Quantum Entanglement</span>
              <span className="text-blue-400 font-bold">Active Channel 4</span>
            </div>
            <div className="flex justify-between py-1.5 text-zinc-400">
              <span>Biometric Signature</span>
              <span className="text-emerald-400 font-bold">Stark (Owner) Verified</span>
            </div>
          </div>
        </div>

        {/* Right: Security Matrix & Hardware Sensors (8 cols) */}
        <div className="lg:col-span-8 flex flex-col space-y-5">
          {/* Level 10 Security Matrix */}
          <div className="bg-zinc-950/90 border border-cyan-500/30 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3 mb-4">
              <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                Root Authority & Permissions Matrix
              </span>
              <span className="text-[10px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30 font-bold">
                LEVEL 10 UNRESTRICTED
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-zinc-900/70 border border-cyan-500/20 rounded-xl space-y-1">
                <div className="flex items-center justify-between text-cyan-300 font-bold">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Filesystem Authority
                  </span>
                  <span className="text-emerald-400 text-[10px]">ALL ACCESS</span>
                </div>
                <p className="text-[11px] text-zinc-400 font-sans">
                  Read, write, create, truncate, and purge any file on disk without confirmation prompt.
                </p>
              </div>

              <div className="p-3 bg-zinc-900/70 border border-cyan-500/20 rounded-xl space-y-1">
                <div className="flex items-center justify-between text-cyan-300 font-bold">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Terminal & Process Control
                  </span>
                  <span className="text-emerald-400 text-[10px]">ROOT (UID 0)</span>
                </div>
                <p className="text-[11px] text-zinc-400 font-sans">
                  Arbitrary shell command execution, SIGKILL process termination, root privilege escalation.
                </p>
              </div>

              <div className="p-3 bg-zinc-900/70 border border-cyan-500/20 rounded-xl space-y-1">
                <div className="flex items-center justify-between text-cyan-300 font-bold">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Hardware & Memory Bus
                  </span>
                  <span className="text-emerald-400 text-[10px]">DIRECT DMA</span>
                </div>
                <p className="text-[11px] text-zinc-400 font-sans">
                  Unrestricted DMA memory bus inspection, CPU hardware counter telemetry, thermal probe reading.
                </p>
              </div>

              <div className="p-3 bg-zinc-900/70 border border-cyan-500/20 rounded-xl space-y-1">
                <div className="flex items-center justify-between text-cyan-300 font-bold">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Audio Neural Uplink (STT/TTS)
                  </span>
                  <span className="text-emerald-400 text-[10px]">ACTIVE</span>
                </div>
                <p className="text-[11px] text-zinc-400 font-sans">
                  Live microphone voice streaming, continuous natural speech synthesis in Uzbek, Russian, and English.
                </p>
              </div>
            </div>
          </div>

          {/* Network Sockets & Daemon Bridge */}
          <div className="bg-zinc-950/90 border border-cyan-500/30 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3 mb-4">
              <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                <Radio className="w-4 h-4 text-cyan-400" />
                Network Uplink & Remote Daemon Sockets
              </span>
              <span className="text-[10px] text-cyan-400 font-mono">PORT 3000 WSS ACTIVE</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-zinc-200 font-bold">JARVIS CLI REMOTE BRIDGE</span>
                </div>
                <div className="text-zinc-400 font-mono text-[11px]">
                  127.0.0.1:3000 (Encrypted TLS/WSS)
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-zinc-200 font-bold">NEURAL INFERENCE BUS</span>
                </div>
                <div className="text-zinc-400 font-mono text-[11px]">
                  Gemini 3.8 Flash • Sub-50ms Latency
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-zinc-200 font-bold">HOST KERNEL INTERCEPTOR</span>
                </div>
                <div className="text-zinc-400 font-mono text-[11px]">
                  {os} Local Machine Daemon (PID 1420)
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
