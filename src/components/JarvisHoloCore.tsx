import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Mic, MicOff, Volume2, VolumeX, Sparkles, Cpu, Zap, Activity } from 'lucide-react';
import { playJarvisSound } from '../utils/jarvisVoice';

export type JarvisCoreState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'executing';

interface JarvisHoloCoreProps {
  state: JarvisCoreState;
  onToggleMic: () => void;
  isListening: boolean;
  isSpeaking: boolean;
  voiceMuted: boolean;
  onToggleMute: () => void;
  activeAction?: string;
}

export const JarvisHoloCore: React.FC<JarvisHoloCoreProps> = ({
  state,
  onToggleMic,
  isListening,
  isSpeaking,
  voiceMuted,
  onToggleMute,
  activeAction,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Dynamic particle canvas animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = 380);
    let height = (canvas.height = 380);

    // Generate orbiting energy particles
    const particlesCount = 45;
    const particles = Array.from({ length: particlesCount }, (_, i) => ({
      angle: (i / particlesCount) * Math.PI * 2,
      radius: 95 + Math.random() * 45,
      speed: (0.008 + Math.random() * 0.015) * (i % 2 === 0 ? 1 : -1),
      size: 1.2 + Math.random() * 2,
      alpha: 0.3 + Math.random() * 0.7,
      color: i % 3 === 0 ? '#38bdf8' : i % 3 === 1 ? '#06b6d4' : '#67e8f9',
    }));

    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      const cx = width / 2;
      const cy = height / 2;
      phase += state === 'thinking' ? 0.08 : state === 'listening' ? 0.05 : 0.02;

      // Speed multiplier based on state
      const speedMult = state === 'thinking' ? 3.5 : state === 'speaking' ? 2 : state === 'listening' ? 2.5 : 1;

      // 1. Draw central glowing gradient haze
      const gradient = ctx.createRadialGradient(cx, cy, 10, cx, cy, 140);
      if (state === 'thinking') {
        gradient.addColorStop(0, 'rgba(56, 189, 248, 0.45)');
        gradient.addColorStop(0.5, 'rgba(14, 165, 233, 0.15)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      } else if (state === 'listening') {
        gradient.addColorStop(0, 'rgba(34, 211, 238, 0.5)');
        gradient.addColorStop(0.5, 'rgba(6, 182, 212, 0.2)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      } else if (state === 'speaking') {
        gradient.addColorStop(0, 'rgba(96, 165, 250, 0.5)');
        gradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.2)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      } else {
        gradient.addColorStop(0, 'rgba(6, 182, 212, 0.25)');
        gradient.addColorStop(0.6, 'rgba(6, 182, 212, 0.08)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      }
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(cx, cy, 140, 0, Math.PI * 2);
      ctx.fill();

      // 2. Draw audio waveform bars if listening or speaking
      if (state === 'listening' || state === 'speaking') {
        const barCount = 36;
        for (let i = 0; i < barCount; i++) {
          const angle = (i / barCount) * Math.PI * 2 + phase * 0.2;
          const amp = Math.sin(phase * 4 + i * 0.8) * 16 + 18;
          const r1 = 80;
          const r2 = r1 + amp;
          const x1 = cx + Math.cos(angle) * r1;
          const y1 = cy + Math.sin(angle) * r1;
          const x2 = cx + Math.cos(angle) * r2;
          const y2 = cy + Math.sin(angle) * r2;

          ctx.strokeStyle = state === 'speaking' ? '#60a5fa' : '#22d3ee';
          ctx.lineWidth = 2.2;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
      }

      // 3. Draw Orbiting Energy Particles
      particles.forEach((p) => {
        p.angle += p.speed * speedMult;
        const wobble = Math.sin(phase + p.angle * 3) * 6;
        const currentR = p.radius + wobble;
        const x = cx + Math.cos(p.angle) * currentR;
        const y = cy + Math.sin(p.angle) * currentR;

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [state]);

  const getStateLabel = () => {
    switch (state) {
      case 'listening':
        return {
          title: "SIZNI ESHITMOQDA...",
          desc: "Mikrofonga xohlagan savolingiz yoki buyrug'ingizni ayting",
          color: 'text-cyan-300 border-cyan-400/50 bg-cyan-950/60 shadow-[0_0_20px_rgba(6,182,212,0.4)]',
          badge: 'bg-cyan-400 animate-ping',
        };
      case 'thinking':
        return {
          title: "GEMINI 3.6 FLASH TAHLIL QILMOQDA...",
          desc: "Neyron tarmog'i javob va buyruqni shakllantirmoqda",
          color: 'text-sky-300 border-sky-400/50 bg-sky-950/60 shadow-[0_0_20px_rgba(14,165,233,0.4)]',
          badge: 'bg-sky-400 animate-pulse',
        };
      case 'speaking':
        return {
          title: "J.A.R.V.I.S. GAPIRMOQDA...",
          desc: "Ovoz sintezi faol • Tinglang yoki savol berishda davom eting",
          color: 'text-blue-300 border-blue-400/50 bg-blue-950/60 shadow-[0_0_20px_rgba(59,130,246,0.4)]',
          badge: 'bg-blue-400 animate-ping',
        };
      case 'executing':
        return {
          title: "BUYRUQ BAJARILMOQDA...",
          desc: activeAction || "Tizim jarayoni boshqarilmoqda",
          color: 'text-emerald-300 border-emerald-400/50 bg-emerald-950/60 shadow-[0_0_20px_rgba(16,185,129,0.4)]',
          badge: 'bg-emerald-400 animate-ping',
        };
      default:
        return {
          title: "J.A.R.V.I.S. ONLINE • TAYYOR",
          desc: "Markaziy reaktorga bosing yoki pastdan yozing",
          color: 'text-zinc-300 border-cyan-500/30 bg-zinc-900/70',
          badge: 'bg-emerald-400',
        };
    }
  };

  const statusInfo = getStateLabel();

  return (
    <div className="relative flex flex-col items-center justify-center p-4 sm:p-6 select-none">
      {/* Outer ambient glow */}
      <div className="absolute w-72 sm:w-96 h-72 sm:h-96 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

      {/* Main Hologram Container */}
      <div className="relative w-[320px] h-[320px] sm:w-[380px] sm:h-[380px] flex items-center justify-center">
        {/* Canvas Particle Overlay */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
        />

        {/* Multi-layer Animated SVG Tech Rings */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          {/* Outer Degree Tick Ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
            className="absolute w-[290px] h-[290px] sm:w-[350px] sm:h-[350px] rounded-full border border-cyan-500/20 border-dashed"
          />

          {/* Counter-rotating Segment Ring */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
            className="absolute w-[250px] h-[250px] sm:w-[300px] sm:h-[300px] rounded-full border-2 border-transparent border-t-cyan-400/40 border-b-cyan-500/30"
          />

          {/* Inner Fast Ring */}
          <motion.div
            animate={{ rotate: state === 'thinking' ? 720 : 360 }}
            transition={{
              duration: state === 'thinking' ? 6 : 16,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="absolute w-[200px] h-[200px] sm:w-[240px] sm:h-[240px] rounded-full border border-cyan-400/30 border-dotted"
          />

          {/* Dynamic Radar Sweeper */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            className="absolute w-[180px] h-[180px] sm:w-[220px] sm:h-[220px] rounded-full bg-gradient-to-tr from-cyan-500/10 to-transparent pointer-events-none"
          />
        </div>

        {/* Central Clickable Arc Reactor Button */}
        <motion.button
          id="btn-jarvis-core-trigger"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => {
            playJarvisSound('blip');
            onToggleMic();
          }}
          className={`relative z-20 w-32 h-32 sm:w-40 sm:h-40 rounded-full flex flex-col items-center justify-center cursor-pointer transition-all duration-300 shadow-2xl ${
            isListening
              ? 'bg-gradient-to-br from-cyan-950 via-cyan-900 to-sky-950 border-2 border-cyan-300 shadow-[0_0_40px_rgba(6,182,212,0.8)]'
              : state === 'thinking'
              ? 'bg-gradient-to-br from-sky-950 via-zinc-900 to-blue-950 border-2 border-sky-400 shadow-[0_0_35px_rgba(14,165,233,0.7)]'
              : state === 'speaking'
              ? 'bg-gradient-to-br from-blue-950 via-zinc-900 to-cyan-950 border-2 border-blue-400 shadow-[0_0_35px_rgba(59,130,246,0.7)]'
              : 'bg-zinc-950/90 hover:bg-zinc-900 border-2 border-cyan-500/40 hover:border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.3)]'
          }`}
          title={isListening ? "To'xtatish uchun bosing" : "Gapirish uchun bosing"}
        >
          {/* Core Pulsing Glow Rings */}
          <motion.div
            animate={{
              scale: isListening ? [1, 1.25, 1] : state === 'speaking' ? [1, 1.15, 1] : [1, 1.06, 1],
              opacity: isListening ? [0.6, 0.9, 0.6] : [0.4, 0.7, 0.4],
            }}
            transition={{ duration: isListening ? 1.2 : 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 rounded-full bg-cyan-400/10 pointer-events-none"
          />

          {/* Central Reactor Icons */}
          <div className="flex flex-col items-center justify-center gap-1.5 z-10">
            {isListening ? (
              <Mic className="w-8 h-8 sm:w-10 sm:h-10 text-cyan-300 animate-pulse drop-shadow-[0_0_12px_rgba(6,182,212,0.9)]" />
            ) : state === 'thinking' ? (
              <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-sky-300 animate-spin drop-shadow-[0_0_12px_rgba(14,165,233,0.9)]" />
            ) : state === 'speaking' ? (
              <Activity className="w-8 h-8 sm:w-10 sm:h-10 text-blue-300 animate-pulse drop-shadow-[0_0_12px_rgba(59,130,246,0.9)]" />
            ) : (
              <Zap className="w-8 h-8 sm:w-10 sm:h-10 text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
            )}

            <span className="text-[11px] sm:text-xs font-mono font-bold tracking-wider uppercase text-cyan-200">
              {isListening ? "ESHITILMOQDA" : state === 'thinking' ? "O'YLANMOQDA" : state === 'speaking' ? "GAPIRMOQDA" : "BOSING"}
            </span>

            <span className="text-[9px] font-mono text-cyan-400/80">
              {isListening ? "To'xtatish" : "Ovozli buyruq"}
            </span>
          </div>
        </motion.button>
      </div>

      {/* State Status Banner (Right below the core) */}
      <div className={`mt-2 sm:mt-3 px-4 py-2 rounded-2xl border font-mono flex flex-col items-center text-center transition-all duration-300 max-w-md ${statusInfo.color}`}>
        <div className="flex items-center gap-2 text-xs font-bold tracking-wide uppercase">
          <span className={`w-2 h-2 rounded-full ${statusInfo.badge}`} />
          <span>{statusInfo.title}</span>
        </div>
        <p className="text-[11px] text-zinc-400 mt-0.5">
          {statusInfo.desc}
        </p>
      </div>

      {/* Audio Mute & Telemetry Quick Floating Controls */}
      <div className="flex items-center gap-3 mt-3">
        <button
          onClick={onToggleMute}
          className={`px-3 py-1 rounded-full text-xs font-mono flex items-center gap-1.5 border transition-all ${
            voiceMuted
              ? 'bg-zinc-900 border-zinc-700 text-zinc-400'
              : 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.25)]'
          }`}
          title={voiceMuted ? "Ovozni yoqish" : "Ovozni o'chirish"}
        >
          {voiceMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
          <span>{voiceMuted ? "Ovoz: O'chiq" : "Ovoz: Faol"}</span>
        </button>

        <div className="px-3 py-1 rounded-full text-xs font-mono bg-zinc-900/80 border border-zinc-800 text-zinc-400 flex items-center gap-1.5">
          <Cpu className="w-3 h-3 text-cyan-400" />
          <span>Gemini 3.6 • Level 10 Root</span>
        </div>
      </div>
    </div>
  );
};
