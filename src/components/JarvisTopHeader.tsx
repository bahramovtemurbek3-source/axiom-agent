import React from 'react';
import { JarvisArcReactor } from './JarvisArcReactor';
import { Bell, Crown } from 'lucide-react';

interface JarvisTopHeaderProps {
  userName?: string;
  isApiConnected?: boolean;
  onOpenNotifications?: () => void;
  onOpenProfile?: () => void;
}

export const JarvisTopHeader: React.FC<JarvisTopHeaderProps> = ({
  userName = 'Temurbek',
  isApiConnected = true,
  onOpenNotifications,
  onOpenProfile,
}) => {
  return (
    <header className="w-full h-16 bg-[#060a14] border-b border-blue-950/60 px-5 flex items-center justify-between z-30 shrink-0 select-none">
      {/* Brand Logo */}
      <div className="flex items-center gap-3">
        <JarvisArcReactor size={32} pulsing={true} />
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-wider text-white font-sans">
            JARVIS <span className="text-[#38bdf8]">AI</span>
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#1e293b]/90 text-[#38bdf8] border border-blue-500/30 tracking-wide">
            Beta
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Connection Status Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#091122] border border-blue-950 text-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <div className="flex items-center gap-1.5 text-[11px] font-sans">
            <span className="text-emerald-400 font-medium">Connected</span>
            <span className="text-zinc-400">Gemini API</span>
          </div>
        </div>

        {/* Notification Bell */}
        <button
          onClick={onOpenNotifications}
          className="w-9 h-9 rounded-full bg-[#0c1427] hover:bg-[#13203f] border border-blue-900/40 flex items-center justify-center text-zinc-300 hover:text-white transition-all cursor-pointer relative"
          title="Bildirishnomalar"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-cyan-400" />
        </button>

        {/* User Pill Capsule */}
        <button
          onClick={onOpenProfile}
          className="flex items-center gap-2.5 p-1 pr-3 rounded-full bg-[#0c1427] hover:bg-[#13203f] border border-blue-900/50 transition-all cursor-pointer"
        >
          {/* Avatar with cyan neon border */}
          <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-cyan-400/80 p-0.5 bg-zinc-900 flex items-center justify-center shrink-0 shadow-[0_0_8px_rgba(6,182,212,0.4)]">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
              alt="Avatar"
              className="w-full h-full object-cover rounded-full"
              onError={(e) => {
                // Fallback SVG avatar if external image fails
                (e.target as any).style.display = 'none';
              }}
            />
          </div>
          <div className="text-left leading-tight hidden sm:block">
            <div className="text-xs font-semibold text-white tracking-wide">{userName}</div>
            <div className="text-[10px] text-amber-400 font-medium flex items-center gap-1">
              <Crown className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
              <span>Premium</span>
            </div>
          </div>
        </button>
      </div>
    </header>
  );
};
