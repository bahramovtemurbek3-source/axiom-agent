import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Shield, Zap, Terminal, Activity, Radio, Cpu, Lock, Unlock } from 'lucide-react';
import { playJarvisSound, speakJarvis, stopJarvisSpeech } from '../utils/jarvisVoice';

interface JarvisHeroProps {
  isListening: boolean;
  onToggleListening: () => void;
  isSpeaking: boolean;
  onToggleSpeakingMute: () => void;
  voiceMuted: boolean;
  fullAccess: boolean;
  onToggleFullAccess: () => void;
  onQuickDirective: (directive: string) => void;
  activeWindow: string;
}

export const JarvisHero: React.FC<JarvisHeroProps> = ({
  isListening,
  onToggleListening,
  isSpeaking,
  onToggleSpeakingMute,
  voiceMuted,
  fullAccess,
  onToggleFullAccess,
  onQuickDirective,
}) => {
  const [pulseDegree, setPulseDegree] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulseDegree((p) => (p + 2) % 360);
    }, 40);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-zinc-950 via-cyan-950/20 to-zinc-950 border border-cyan-500/30 p-6 shadow-[0_0_50px_rgba(6,182,212,0.12)]">
      {/* Sci-Fi Holographic HUD scanlines and background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(6,182,212,0.03)_51%)] bg-[size:100%_4px] pointer-events-none" />
      <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

      {/* Futuristic Corner Brackets */}
      <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-cyan-400/80" />
      <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-cyan-400/80" />
      <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-cyan-400/80" />
      <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-cyan-400/80" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left: Holographic Arc Reactor & Telemetry (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center text-center">
          <div className="relative flex items-center justify-center w-52 h-52 sm:w-60 sm:h-60">
            {/* Outer Rotating HUD Ring with tick marks */}
            <div
              className="absolute inset-0 rounded-full border border-cyan-500/40 border-dashed"
              style={{ transform: `rotate(${pulseDegree}deg)` }}
            />

            {/* Middle Counter-Rotating Ring */}
            <div
              className="absolute inset-4 rounded-full border-2 border-cyan-400/30 border-t-cyan-400 border-b-cyan-400"
              style={{ transform: `rotate(-${pulseDegree * 1.5}deg)` }}
            />

            {/* Segmented Arc Reactor Ring */}
            <div className="absolute inset-8 rounded-full border border-cyan-300/20 flex items-center justify-center">
              <div className={`w-32 h-32 rounded-full border-2 border-cyan-400/60 flex items-center justify-center transition-all duration-500 ${
                isListening
                  ? 'shadow-[0_0_35px_rgba(6,182,212,0.8)] border-cyan-300 scale-105'
                  : isSpeaking
                  ? 'shadow-[0_0_35px_rgba(59,130,246,0.8)] border-blue-400 scale-105'
                  : 'shadow-[0_0_20px_rgba(6,182,212,0.3)]'
              }`}>
                {/* Central Arc Reactor Core Button / Mic */}
                <button
                  id="btn-arc-voice-toggle"
                  onClick={() => {
                    playJarvisSound(isListening ? 'acknowledge' : 'wake');
                    onToggleListening();
                  }}
                  className={`relative z-20 w-24 h-24 rounded-full flex flex-col items-center justify-center transition-all ${
                    isListening
                      ? 'bg-cyan-500 text-zinc-950 shadow-[0_0_25px_rgba(6,182,212,0.9)] scale-110'
                      : isSpeaking
                      ? 'bg-blue-600 text-white shadow-[0_0_25px_rgba(59,130,246,0.9)] animate-pulse'
                      : 'bg-zinc-950/80 hover:bg-cyan-950/60 text-cyan-300 border border-cyan-400/50 hover:border-cyan-300'
                  }`}
                  title="Click to activate JARVIS Voice Protocol"
                >
                  {isListening ? (
                    <Mic className="w-8 h-8 animate-bounce text-zinc-950" />
                  ) : (
                    <Zap className="w-8 h-8 text-cyan-400 animate-pulse" />
                  )}
                  <span className="text-[9px] font-mono font-bold mt-1 tracking-wider uppercase">
                    {isListening ? 'LISTENING' : isSpeaking ? 'SPEAKING' : 'JARVIS CORE'}
                  </span>
                </button>
              </div>
            </div>

            {/* Orbiting HUD Satellites */}
            <div
              className="absolute w-2.5 h-2.5 rounded-full bg-cyan-300 shadow-[0_0_10px_#22d3ee]"
              style={{
                top: `${50 + 44 * Math.sin((pulseDegree * Math.PI) / 180)}%`,
                left: `${50 + 44 * Math.cos((pulseDegree * Math.PI) / 180)}%`,
              }}
            />
            <div
              className="absolute w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_10px_#60a5fa]"
              style={{
                top: `${50 - 44 * Math.sin((pulseDegree * 1.5 * Math.PI) / 180)}%`,
                left: `${50 - 44 * Math.cos((pulseDegree * 1.5 * Math.PI) / 180)}%`,
              }}
            />
          </div>

          {/* Core Telemetry Readout */}
          <div className="mt-3 flex items-center gap-4 text-xs font-mono text-cyan-400/90">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              ARC CORE: 100%
            </span>
            <span className="text-zinc-600">|</span>
            <span className="text-zinc-300">3.2 GIGA-WATTS</span>
            <span className="text-zinc-600">|</span>
            <span className="text-emerald-400">STABLE</span>
          </div>
        </div>

        {/* Right: J.A.R.V.I.S. Command & Voice Interface (7 cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          {/* Header Title & Clearance Level */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cyan-500/20 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold font-mono tracking-wider text-cyan-300 uppercase flex items-center gap-2">
                  <span className="text-cyan-400">J.A.R.V.I.S.</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-200">
                    NEURAL PROTOCOL v2.5
                  </span>
                </h2>
              </div>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">
                Autonomous Machine Orchestration • Just A Rather Very Intelligent System
              </p>
            </div>

            {/* Full Access Toggle Badge */}
            <button
              id="btn-toggle-full-access"
              onClick={() => {
                playJarvisSound('acknowledge');
                onToggleFullAccess();
              }}
              className={`px-3 py-1.5 rounded-lg border font-mono text-xs flex items-center gap-2 transition-all shadow-md ${
                fullAccess
                  ? 'bg-cyan-500/15 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                  : 'bg-zinc-900 border-zinc-700 text-zinc-400'
              }`}
            >
              {fullAccess ? <Unlock className="w-3.5 h-3.5 text-cyan-300" /> : <Lock className="w-3.5 h-3.5" />}
              <div className="text-left">
                <div className="text-[10px] text-cyan-400 uppercase font-bold">Clearance Level:</div>
                <div className="font-bold">
                  {fullAccess ? 'LEVEL 10: FULL ROOT ACCESS' : 'STANDARD SAFE ACCESS'}
                </div>
              </div>
            </button>
          </div>

          {/* Voice Waveform Visualizer & Direct Controls */}
          <div className="bg-zinc-950/80 border border-cyan-500/30 rounded-xl p-4 flex flex-col space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-cyan-400 flex items-center gap-2">
                <Radio className={`w-3.5 h-3.5 ${isListening ? 'text-cyan-400 animate-pulse' : 'text-zinc-500'}`} />
                {isListening ? 'LISTENING TO MICROPHONE STREAM...' : isSpeaking ? 'JARVIS SYNTHESIZING VOICE...' : 'VOICE INTERFACE READY'}
              </span>

              <div className="flex items-center gap-2">
                <button
                  id="btn-voice-mute-toggle"
                  onClick={onToggleSpeakingMute}
                  className="p-1.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-cyan-300 transition-colors"
                  title={voiceMuted ? 'Unmute Jarvis Voice' : 'Mute Jarvis Voice'}
                >
                  {voiceMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
                </button>
                <button
                  id="btn-mic-toggle-hero"
                  onClick={() => {
                    playJarvisSound(isListening ? 'acknowledge' : 'wake');
                    onToggleListening();
                  }}
                  className={`px-3 py-1 rounded text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
                    isListening
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                      : 'bg-cyan-500 hover:bg-cyan-400 text-zinc-950 shadow-md shadow-cyan-500/30'
                  }`}
                >
                  <Mic className="w-3.5 h-3.5" />
                  {isListening ? 'Stop Listening' : 'Speak to Jarvis'}
                </button>
              </div>
            </div>

            {/* Holographic Soundwave Equalizer */}
            <div className="flex items-center justify-center gap-1 h-10 px-4 bg-zinc-900/60 rounded-lg border border-cyan-500/20 overflow-hidden">
              {[12, 28, 45, 18, 62, 34, 85, 42, 95, 60, 30, 75, 48, 90, 38, 20, 55, 32, 14, 25].map(
                (baseHeight, i) => {
                  const animatedHeight = isListening || isSpeaking
                    ? Math.min(100, Math.max(15, (baseHeight * (Math.sin(pulseDegree * 0.1 + i) + 1.2)) / 2))
                    : 15;
                  return (
                    <div
                      key={i}
                      className={`w-1.5 rounded-full transition-all duration-75 ${
                        isListening
                          ? 'bg-cyan-400 shadow-[0_0_8px_#22d3ee]'
                          : isSpeaking
                          ? 'bg-blue-400 shadow-[0_0_8px_#60a5fa]'
                          : 'bg-cyan-900/40'
                      }`}
                      style={{ height: `${animatedHeight}%` }}
                    />
                  );
                }
              )}
            </div>
          </div>

          {/* Quick Voice Directives / Hot Commands */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-mono text-zinc-400 flex items-center justify-between">
              <span>VOICE & CHAT DIRECTIVES:</span>
              <span className="text-[10px] text-cyan-400">Click or say aloud</span>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-mono">
              <button
                id="directive-uzbek"
                onClick={() => onQuickDirective("Salom Jarvis, tizimni tekshir va barcha ruxsatlarni faollashtir")}
                className="px-2.5 py-1 rounded bg-zinc-900/90 hover:bg-cyan-950/60 border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 text-xs transition-colors flex items-center gap-1.5"
              >
                <span>🇺🇿 "Salom Jarvis, tizimni tekshir"</span>
              </button>
              <button
                id="directive-diag"
                onClick={() => onQuickDirective("Jarvis, run complete diagnostics on CPU, memory, and services")}
                className="px-2.5 py-1 rounded bg-zinc-900/90 hover:bg-cyan-950/60 border border-cyan-500/30 hover:border-cyan-400 text-zinc-200 text-xs transition-colors"
              >
                <span>"Jarvis, run complete diagnostics"</span>
              </button>
              <button
                id="directive-archive"
                onClick={() => onQuickDirective("Jarvis, scan log directory and compress all archive bundles")}
                className="px-2.5 py-1 rounded bg-zinc-900/90 hover:bg-cyan-950/60 border border-cyan-500/30 hover:border-cyan-400 text-zinc-200 text-xs transition-colors"
              >
                <span>"Jarvis, compress all log archives"</span>
              </button>
              <button
                id="directive-russian"
                onClick={() => onQuickDirective("Джарвис, проверь статус системы и открой терминал")}
                className="px-2.5 py-1 rounded bg-zinc-900/90 hover:bg-cyan-950/60 border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 text-xs transition-colors"
              >
                <span>🇷🇺 "Джарвис, проверь статус"</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
