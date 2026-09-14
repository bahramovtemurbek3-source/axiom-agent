import React from 'react';
import {
  MessageSquare,
  History,
  CheckSquare,
  Boxes,
  Laptop,
  Folder,
  LayoutGrid,
  User,
  Settings,
  Sparkles,
  Cpu,
  HardDrive,
  Wifi,
} from 'lucide-react';

export type JarvisNavTab =
  | 'chat'
  | 'history'
  | 'tasks'
  | 'skills'
  | 'computer'
  | 'files'
  | 'apps'
  | 'account'
  | 'settings';

interface JarvisLeftSidebarProps {
  activeTab: JarvisNavTab;
  onSelectTab: (tab: JarvisNavTab) => void;
  cpuUsage?: number;
  ramUsage?: number;
  networkStatus?: 'Stable' | 'Connecting' | 'Offline';
  isDeviceConnected?: boolean;
}

export const JarvisLeftSidebar: React.FC<JarvisLeftSidebarProps> = ({
  activeTab,
  onSelectTab,
  cpuUsage = 12,
  ramUsage = 36,
  networkStatus = 'Stable',
  isDeviceConnected = true,
}) => {
  const navItems = [
    { id: 'chat' as JarvisNavTab, label: 'Chat', icon: MessageSquare },
    { id: 'history' as JarvisNavTab, label: 'History', icon: History },
    { id: 'tasks' as JarvisNavTab, label: 'Tasks', icon: CheckSquare },
    { id: 'skills' as JarvisNavTab, label: 'Skills', icon: Boxes },
    { id: 'computer' as JarvisNavTab, label: 'Computer Control', icon: Laptop },
    { id: 'files' as JarvisNavTab, label: 'Files', icon: Folder },
    { id: 'apps' as JarvisNavTab, label: 'Apps', icon: LayoutGrid },
    { id: 'account' as JarvisNavTab, label: 'Account', icon: User },
    { id: 'settings' as JarvisNavTab, label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-60 bg-[#060a14] border-r border-blue-950/60 p-3.5 flex flex-col justify-between shrink-0 select-none overflow-y-auto">
      {/* Navigation List */}
      <div className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#0055ff] text-white shadow-[0_0_15px_rgba(0,85,255,0.4)] font-semibold'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-[#0c1427]'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
              <span className="tracking-wide">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Bottom Area: Promo Card & System Status */}
      <div className="space-y-3 pt-4">
        {/* Jarvis AI Futuristic Promo Card */}
        <div className="relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br from-[#0a1b38] via-[#071329] to-[#040914] border border-blue-800/40 shadow-[0_0_20px_rgba(6,182,212,0.15)] group">
          {/* Cyber light streaks */}
          <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-cyan-500/20 blur-xl pointer-events-none group-hover:bg-cyan-400/30 transition-all" />
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-sky-400/10 via-transparent to-transparent pointer-events-none" />

          <div className="relative z-10 space-y-1">
            <div className="flex items-center gap-1.5 text-white font-bold text-sm tracking-wide">
              <span>Jarvis AI</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-snug font-sans">
              Your personal assistant for a smarter tomorrow.
            </p>
          </div>
        </div>

        {/* System Status Card */}
        <div className="rounded-2xl p-3.5 bg-[#081020] border border-blue-950/80 space-y-2.5 text-xs font-sans">
          {/* Header Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-zinc-300 font-medium text-xs">System Status</span>
            </div>
            <span className="text-emerald-400 font-semibold text-xs">Online</span>
          </div>

          {/* Metrics Rows */}
          <div className="space-y-1.5 text-[11px] pt-1">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-blue-400" />
                <span>CPU</span>
              </span>
              <span className="text-zinc-200 font-mono font-medium">{cpuUsage}%</span>
            </div>

            <div className="flex items-center justify-between text-zinc-400">
              <span className="flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-sky-400" />
                <span>RAM</span>
              </span>
              <span className="text-zinc-200 font-mono font-medium">{ramUsage}%</span>
            </div>

            <div className="flex items-center justify-between text-zinc-400">
              <span className="flex items-center gap-1.5">
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span>Network</span>
              </span>
              <span className="text-emerald-400 font-medium">{networkStatus}</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
