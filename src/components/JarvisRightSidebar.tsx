import React from 'react';
import {
  Crown,
  ChevronDown,
  Clock,
  Globe,
  Folder,
  Power,
  RotateCcw,
  CheckCircle2,
  Brain,
  Search,
  FileText,
  Monitor,
  Sparkles,
} from 'lucide-react';

export interface RecentTaskItem {
  id: string;
  title: string;
  iconType: 'youtube' | 'files' | 'system' | 'search' | 'text';
  status: 'Completed' | 'In Progress' | 'Pending';
  time: string;
}

interface JarvisRightSidebarProps {
  userName?: string;
  userHandle?: string;
  userEmail?: string;
  memberSince?: string;
  planName?: string;
  storageUsedGB?: number;
  storageTotalGB?: number;
  recentTasks: RecentTaskItem[];
  onViewAllTasks: () => void;
  onQuickAction: (action: 'browser' | 'files' | 'shutdown' | 'restart') => void;
  onEditProfile: () => void;
  onUpgrade: () => void;
  onTaskClick?: (task: RecentTaskItem) => void;
}

export const JarvisRightSidebar: React.FC<JarvisRightSidebarProps> = ({
  userName = 'Temurbek',
  userHandle = '@temurbek',
  userEmail = 'temurbek@gmail.com',
  memberSince = '2025-06-01',
  planName = 'Premium',
  storageUsedGB = 12,
  storageTotalGB = 100,
  recentTasks,
  onViewAllTasks,
  onQuickAction,
  onEditProfile,
  onUpgrade,
  onTaskClick,
}) => {
  const getTaskIcon = (type: RecentTaskItem['iconType']) => {
    switch (type) {
      case 'youtube':
        return <Brain className="w-4 h-4 text-cyan-400" />;
      case 'files':
        return <Folder className="w-4 h-4 text-amber-400" />;
      case 'system':
        return <Monitor className="w-4 h-4 text-sky-400" />;
      case 'search':
        return <Search className="w-4 h-4 text-cyan-300" />;
      case 'text':
      default:
        return <FileText className="w-4 h-4 text-emerald-400" />;
    }
  };

  const storagePercent = Math.min(100, Math.round((storageUsedGB / storageTotalGB) * 100));

  return (
    <aside className="w-72 bg-[#060a14] border-l border-blue-950/60 p-4 flex flex-col gap-3.5 shrink-0 select-none overflow-y-auto">
      {/* 1. Profile Card */}
      <div className="rounded-2xl p-4 bg-[#081020] border border-blue-950/80 space-y-3">
        <div className="flex items-center gap-3">
          {/* Circular anime avatar with glowing blue border */}
          <div className="w-13 h-13 rounded-full overflow-hidden border-2 border-cyan-400 p-0.5 bg-zinc-900 shrink-0 shadow-[0_0_12px_rgba(6,182,212,0.4)]">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
              alt="Temurbek"
              className="w-full h-full object-cover rounded-full"
              onError={(e) => {
                (e.target as any).style.display = 'none';
              }}
            />
          </div>

          <div className="space-y-0.5 min-w-0 flex-1">
            <div className="text-sm font-bold text-white tracking-wide truncate">{userName}</div>
            <div className="text-xs text-zinc-400 truncate">{userHandle}</div>
            <div className="text-[11px] text-amber-400 font-medium flex items-center gap-1">
              <Crown className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{planName}</span>
            </div>
          </div>
        </div>

        {/* Profile Info Details */}
        <div className="space-y-1 pt-1 text-xs border-t border-blue-950/60">
          <div className="flex items-center justify-between text-zinc-400">
            <span>Email</span>
            <span className="text-zinc-200 font-sans truncate max-w-[150px]">{userEmail}</span>
          </div>
          <div className="flex items-center justify-between text-zinc-400">
            <span>Member since</span>
            <span className="text-zinc-200 font-mono">{memberSince}</span>
          </div>
        </div>

        <button
          onClick={onEditProfile}
          className="w-full py-1.5 rounded-xl bg-[#0e1932] hover:bg-[#142347] border border-blue-900/60 text-zinc-200 font-medium text-xs transition-all cursor-pointer shadow-sm"
        >
          Edit Profile
        </button>
      </div>

      {/* 2. Account Card */}
      <div className="rounded-2xl p-4 bg-[#081020] border border-blue-950/80 space-y-3 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-bold text-white text-xs">
            <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>Account</span>
            <ChevronDown className="w-3 h-3 text-zinc-400" />
          </div>
        </div>

        <div className="space-y-2 text-zinc-400">
          <div className="flex items-center justify-between">
            <span>Plan</span>
            <span className="text-amber-400 font-semibold">{planName}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              <span>Tasks limit</span>
            </span>
            <span className="text-zinc-200 font-sans font-medium">∞ (Unlimited)</span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span>Storage</span>
              <span className="text-zinc-200 font-mono font-medium">
                {storageUsedGB} GB / {storageTotalGB} GB
              </span>
            </div>
            {/* Progress Bar */}
            <div className="w-full h-1.5 rounded-full bg-blue-950 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 shadow-[0_0_6px_rgba(6,182,212,0.8)]"
                style={{ width: `${storagePercent}%` }}
              />
            </div>
          </div>
        </div>

        <button
          onClick={onUpgrade}
          className="w-full py-2 rounded-xl bg-gradient-to-r from-[#0066ff] to-[#0284c7] hover:from-[#0052cc] hover:to-[#0369a1] text-white font-semibold text-xs tracking-wide transition-all cursor-pointer shadow-[0_0_15px_rgba(0,102,255,0.4)]"
        >
          Upgrade
        </button>
      </div>

      {/* 3. Recent Tasks Card */}
      <div className="rounded-2xl p-4 bg-[#081020] border border-blue-950/80 space-y-2.5 flex-1 flex flex-col text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-bold text-white text-xs">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span>Recent Tasks</span>
          </div>
          <button
            onClick={onViewAllTasks}
            className="text-[11px] text-blue-400 hover:text-cyan-300 font-medium transition-colors cursor-pointer"
          >
            View all
          </button>
        </div>

        {/* Task Items */}
        <div className="space-y-2 overflow-y-auto max-h-56 pr-0.5">
          {recentTasks.map((task) => (
            <div
              key={task.id}
              onClick={() => onTaskClick?.(task)}
              className="p-2 rounded-xl bg-[#0c1427] hover:bg-[#111e3b] border border-blue-950/80 flex items-center justify-between transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-1.5 rounded-lg bg-[#070d1e] border border-blue-900/50 shrink-0">
                  {getTaskIcon(task.iconType)}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-medium text-zinc-200 group-hover:text-cyan-300 transition-colors truncate">
                    {task.title}
                  </div>
                  <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <span>✓ {task.status}</span>
                  </div>
                </div>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono shrink-0 ml-2">{task.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Quick Actions 2x2 Grid */}
      <div className="space-y-2">
        <div className="text-xs font-bold text-zinc-300">Quick Actions</div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            onClick={() => onQuickAction('browser')}
            className="p-2.5 rounded-xl bg-[#081020] hover:bg-[#0e1933] border border-blue-950 hover:border-cyan-500/40 flex items-center gap-2 text-zinc-300 hover:text-white transition-all cursor-pointer group"
          >
            <Globe className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span className="font-medium text-[11px] truncate">Open Browser</span>
          </button>

          <button
            onClick={() => onQuickAction('files')}
            className="p-2.5 rounded-xl bg-[#081020] hover:bg-[#0e1933] border border-blue-950 hover:border-cyan-500/40 flex items-center gap-2 text-zinc-300 hover:text-white transition-all cursor-pointer group"
          >
            <Folder className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            <span className="font-medium text-[11px] truncate">Open Files</span>
          </button>

          <button
            onClick={() => onQuickAction('shutdown')}
            className="p-2.5 rounded-xl bg-[#081020] hover:bg-rose-950/40 border border-blue-950 hover:border-rose-500/40 flex items-center gap-2 text-zinc-300 hover:text-rose-300 transition-all cursor-pointer group"
          >
            <Power className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
            <span className="font-medium text-[11px] truncate">Shutdown</span>
          </button>

          <button
            onClick={() => onQuickAction('restart')}
            className="p-2.5 rounded-xl bg-[#081020] hover:bg-sky-950/40 border border-blue-950 hover:border-sky-500/40 flex items-center gap-2 text-zinc-300 hover:text-sky-300 transition-all cursor-pointer group"
          >
            <RotateCcw className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
            <span className="font-medium text-[11px] truncate">Restart</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
