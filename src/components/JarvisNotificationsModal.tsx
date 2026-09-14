import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  XCircle,
  X,
  Check,
  Trash2,
  Clock,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { NotificationItem } from '../types';

interface JarvisNotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnreadCountChange?: (count: number) => void;
}

export const JarvisNotificationsModal: React.FC<JarvisNotificationsModalProps> = ({
  isOpen,
  onClose,
  onUnreadCountChange,
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('jarvis_token');
      const res = await fetch('/api/notifications', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (data.notifications) {
        setNotifications(data.notifications);
        const unread = data.notifications.filter((n: NotificationItem) => !n.read).length;
        onUnreadCountChange?.(unread);
      }
    } catch (err) {
      console.warn('Notifications fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const markAsRead = async (id: string) => {
    try {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      const token = localStorage.getItem('jarvis_token');
      await fetch(`/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const remainingUnread = notifications.filter((n) => n.id !== id && !n.read).length;
      onUnreadCountChange?.(remainingUnread);
    } catch (err) {
      fetchNotifications();
    }
  };

  const markAllRead = async () => {
    try {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      const token = localStorage.getItem('jarvis_token');
      await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      onUnreadCountChange?.(0);
    } catch (err) {
      fetchNotifications();
    }
  };

  const clearAll = async () => {
    try {
      setNotifications([]);
      const token = localStorage.getItem('jarvis_token');
      await fetch('/api/notifications', {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      onUnreadCountChange?.(0);
    } catch (err) {
      fetchNotifications();
    }
  };

  if (!isOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-md rounded-2xl bg-[#091122] border border-blue-600/40 shadow-[0_0_50px_rgba(0,102,255,0.3)] overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-blue-900/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Bildirishnomalar Markazi</h3>
              <p className="text-[11px] text-zinc-400">Tizim hodisalari va bajarilgan vazifalar jurnali</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="px-4 py-2 bg-[#060c18] border-b border-blue-950/60 flex items-center justify-between text-xs">
          <span className="text-zinc-400">
            Jami: <strong className="text-zinc-200">{notifications.length}</strong> ta
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={markAllRead}
              className="text-blue-400 hover:underline flex items-center gap-1 text-[11px]"
            >
              <Check className="w-3 h-3" />
              <span>Hammasini o'qilgan deb belgilash</span>
            </button>
            <span className="text-zinc-700">|</span>
            <button
              onClick={clearAll}
              className="text-red-400 hover:underline flex items-center gap-1 text-[11px]"
            >
              <Trash2 className="w-3 h-3" />
              <span>Tozalash</span>
            </button>
          </div>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-zinc-500 text-xs">
              <RefreshCw className="w-5 h-5 animate-spin text-blue-400" />
              <span>Bildirishnomalar olinmoqda...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 text-xs">
              Yangi bildirishnomalar mavjud emas.
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => !n.read && markAsRead(n.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  n.read
                    ? 'bg-[#060d1b] border-blue-950/40 opacity-70'
                    : 'bg-[#0a152e] border-blue-800/60 shadow-[0_0_12px_rgba(0,102,255,0.15)]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">{getIcon(n.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-semibold text-zinc-100">{n.title}</h4>
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0 animate-pulse" />
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">{n.message}</p>
                    <div className="flex items-center gap-1 mt-1.5 text-[10px] text-zinc-500 font-mono">
                      <Clock className="w-2.5 h-2.5" />
                      <span>{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#060c18] border-t border-blue-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium cursor-pointer"
          >
            Yopish
          </button>
        </div>
      </div>
    </div>
  );
};
