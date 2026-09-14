import React, { useState, useEffect } from 'react';
import {
  History,
  MessageSquare,
  Plus,
  Search,
  Pin,
  Trash2,
  Edit2,
  Check,
  X,
  Clock,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

export interface ConversationItem {
  id: string;
  title: string;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

interface JarvisHistoryViewProps {
  activeConversationId: string;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
}

export const JarvisHistoryView: React.FC<JarvisHistoryViewProps> = ({
  activeConversationId,
  onSelectConversation,
  onNewChat,
}) => {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('jarvis_token');
      const res = await fetch('/api/conversations', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (data.conversations) {
        setConversations(data.conversations);
      }
    } catch (err) {
      console.warn('Failed to load conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const handleCreateNew = async () => {
    try {
      const token = localStorage.getItem('jarvis_token');
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ title: 'Yangi Suhbat' }),
      });
      const data = await res.json();
      if (data.conversation) {
        setConversations([data.conversation, ...conversations]);
        onSelectConversation(data.conversation.id);
        onNewChat();
      }
    } catch (err) {
      console.warn('Create chat error:', err);
    }
  };

  const handleTogglePin = async (id: string, currentPin: boolean) => {
    try {
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, pinned: !currentPin } : c))
      );
      const token = localStorage.getItem('jarvis_token');
      await fetch(`/api/conversations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ pinned: !currentPin }),
      });
    } catch (err) {
      fetchConversations();
    }
  };

  const handleSaveRename = async (id: string) => {
    if (!editTitle.trim()) {
      setEditingId(null);
      return;
    }
    try {
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, title: editTitle } : c))
      );
      setEditingId(null);
      const token = localStorage.getItem('jarvis_token');
      await fetch(`/api/conversations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ title: editTitle }),
      });
    } catch (err) {
      fetchConversations();
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setConversations((prev) => prev.filter((c) => c.id !== id));
      const token = localStorage.getItem('jarvis_token');
      await fetch(`/api/conversations/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch (err) {
      fetchConversations();
    }
  };

  const filtered = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 bg-[#050913] text-zinc-100 p-6 overflow-y-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-5 border-b border-blue-950/60">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-[0_0_20px_rgba(0,102,255,0.25)]">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <span>Suhbatlar Tarixi (Chat History)</span>
              <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded-full bg-blue-500/20 text-cyan-400 border border-blue-500/30">
                {conversations.length} Sessiya
              </span>
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              JARVIS bilan bo'lgan barcha suhbatlar, buyruqlar va tahliliy hisobotlar arxivi
            </p>
          </div>
        </div>

        {/* New Chat Button & Search */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <div className="relative flex-1 md:w-56">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Suhbatni izlash..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#081124] border border-blue-900/40 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            onClick={handleCreateNew}
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,102,255,0.3)] transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Yangi Suhbat</span>
          </button>
        </div>
      </div>

      {/* Conversations List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-zinc-400 text-xs">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-400" />
          <span>Suhbatlar arxivi yuklanmoqda...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center text-zinc-500 text-xs">
          Hozircha suhbatlar topilmadi. Yangi suhbat boshlashingiz mumkin.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filtered.map((conv) => {
            const isActive = conv.id === activeConversationId;
            return (
              <div
                key={conv.id}
                onClick={() => onSelectConversation(conv.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer group flex flex-col justify-between ${
                  isActive
                    ? 'bg-[#0a152e] border-blue-500 shadow-[0_0_20px_rgba(0,102,255,0.2)]'
                    : 'bg-[#081124] border-blue-950/80 hover:border-blue-800/60 hover:bg-[#0b162e]'
                }`}
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
                        <MessageSquare className="w-3.5 h-3.5" />
                      </div>
                      {conv.pinned && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1 font-mono">
                          <Pin className="w-2.5 h-2.5" />
                          <span>Pinned</span>
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleTogglePin(conv.id, conv.pinned)}
                        title={conv.pinned ? "Qadalganlikni olib tashlash" : "Suhbatni yuqoriga qadash"}
                        className="p-1 rounded text-zinc-400 hover:text-amber-400 hover:bg-white/5 transition-colors"
                      >
                        <Pin className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(conv.id);
                          setEditTitle(conv.title);
                        }}
                        title="Nomini o'zgartirish"
                        className="p-1 rounded text-zinc-400 hover:text-cyan-400 hover:bg-white/5 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(conv.id)}
                        title="O'chirish"
                        className="p-1 rounded text-zinc-400 hover:text-red-400 hover:bg-white/5 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title / Renaming */}
                  {editingId === conv.id ? (
                    <div className="flex items-center gap-1.5 my-1" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="flex-1 px-2 py-1 rounded-lg bg-black border border-blue-500 text-xs text-white focus:outline-none"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveRename(conv.id)}
                        className="p-1 rounded bg-blue-600 text-white hover:bg-blue-500"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1 rounded bg-zinc-800 text-zinc-400 hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <h3 className="text-xs font-semibold text-zinc-100 group-hover:text-blue-300 transition-colors line-clamp-2">
                      {conv.title}
                    </h3>
                  )}
                </div>

                {/* Footer Time */}
                <div className="mt-3 pt-2.5 border-t border-blue-950/60 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                  <span className="flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    <span>{new Date(conv.updatedAt || conv.createdAt).toLocaleDateString()}</span>
                  </span>
                  <span className="text-blue-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Ochish</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
