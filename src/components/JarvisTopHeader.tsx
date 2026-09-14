import React from 'react';
import { JarvisArcReactor } from './JarvisArcReactor';
import { Bell, Crown, Laptop } from 'lucide-react';
import { AgentStatus } from '../utils/localAgent';

interface JarvisTopHeaderProps {
  userName?: string;
  avatarUrl?: string;
  unreadNotificationsCount?: number;
  isApiConnected?: boolean;
  localAgentStatus?: AgentStatus;
  localAgentLatency?: number;
  onOpenNotifications?: () => void;
  onOpenProfile?: () => void;
  onOpenAgentModal?: () => void;
}

export const JarvisTopHeader: React.FC<JarvisTopHeaderProps> = ({
  userName = 'Temurbek',
  avatarUrl,
  unreadNotificationsCount = 2,
  isApiConnected = true,
  localAgentStatus = 'connected',
  localAgentLatency = 0,
  onOpenNotifications,
  onOpenProfile,
  onOpenAgentModal,
}) => {
  const isAgentConnected = localAgentStatus === 'connected';
  const isAgentConnecting = localAgentStatus === 'connecting';

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
            v2.5
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Real Mac Computer Agent Status Pill (Clickable for details modal) */}
        <button
          onClick={onOpenAgentModal}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] ${
            isAgentConnected
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:bg-emerald-950/60'
              : isAgentConnecting
              ? 'bg-amber-950/40 border-amber-500/40 text-amber-300 hover:bg-amber-950/60'
              : 'bg-rose-950/40 border-rose-500/40 text-rose-300 hover:bg-rose-950/60'
          }`}
          title="Mahalliy Mac Agenti holati (Tafsilotlar uchun bosing)"
        >
          <span className="relative flex h-2 w-2">
            {isAgentConnected && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            )}
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                isAgentConnected
                  ? 'bg-emerald-500'
                  : isAgentConnecting
                  ? 'bg-amber-500 animate-pulse'
                  : 'bg-rose-500'
              }`}
            />
          </span>
          <div className="flex items-center gap-1.5 text-[11px] font-sans">
            <span className="font-semibold">
              {isAgentConnected
                ? '🟢 Mac Connected'
                : isAgentConnecting
                ? '🟡 Connecting...'
                : '🔴 Mac Disconnected'}
            </span>
            {isAgentConnected && localAgentLatency > 0 && (
              <span className="text-[10px] opacity-75 hidden md:inline font-mono">
                {localAgentLatency}ms
              </span>
            )}
          </div>
        </button>

        {/* AI Cloud Status Indicator */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#091122] border border-blue-950 text-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
          </span>
          <div className="flex items-center gap-1.5 text-[11px] font-sans">
            <span className="text-cyan-400 font-medium">Gemini 3.8 Flash</span>
          </div>
        </div>

        {/* Notification Bell */}
        <button
          onClick={onOpenNotifications}
          className="w-9 h-9 rounded-full bg-[#0c1427] hover:bg-[#13203f] border border-blue-900/40 flex items-center justify-center text-zinc-300 hover:text-white transition-all cursor-pointer relative"
          title="Bildirishnomalar"
        >
          <Bell className="w-4 h-4" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-cyan-500 text-[10px] font-bold text-black border border-blue-900">
              {unreadNotificationsCount}
            </span>
          )}
        </button>

        {/* User Pill Capsule */}
        <button
          onClick={onOpenProfile}
          className="flex items-center gap-2.5 p-1 pr-3 rounded-full bg-[#0c1427] hover:bg-[#13203f] border border-blue-900/50 transition-all cursor-pointer"
        >
          {/* Avatar with cyan neon border */}
          <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-cyan-400/80 p-0.5 bg-zinc-900 flex items-center justify-center shrink-0 shadow-[0_0_8px_rgba(6,182,212,0.4)]">
            <img
              src={avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"}
              alt="Avatar"
              className="w-full h-full object-cover rounded-full"
              onError={(e) => {
                (e.target as any).style.display = 'none';
              }}
            />
          </div>
          <div className="text-left leading-tight hidden sm:block">
            <div className="text-xs font-semibold text-white tracking-wide">{userName}</div>
            <div className="text-[10px] text-amber-400 font-medium flex items-center gap-1">
              <Crown className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
              <span>Operator</span>
            </div>
          </div>
        </button>
      </div>
    </header>
  );
};

