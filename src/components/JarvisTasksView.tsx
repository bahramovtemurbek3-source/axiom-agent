import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Play,
  Brain,
  Folder,
  Globe,
  FileText,
  Search,
  Calendar,
  Repeat,
  AlertCircle,
  X,
  FileCode,
  Boxes,
  Terminal,
  RefreshCw,
  Eye,
  Sliders,
} from 'lucide-react';
import { playJarvisSound } from '../utils/jarvisVoice';
import { ScheduledTaskItem } from '../types';

export interface TaskItem {
  id: string;
  title: string;
  category: 'youtube' | 'files' | 'system' | 'search' | 'text' | 'general' | 'minecraft' | 'coding';
  status: 'Completed' | 'In Progress' | 'Pending' | 'Planning' | 'Failed';
  time: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  progress?: number;
  logs?: string[];
}

interface JarvisTasksViewProps {
  tasks: TaskItem[];
  onAddTask: (title: string, category: TaskItem['category']) => void;
  onDeleteTask: (id: string) => void;
  onExecuteTask: (task: TaskItem) => void;
}

export const JarvisTasksView: React.FC<JarvisTasksViewProps> = ({
  tasks,
  onAddTask,
  onDeleteTask,
  onExecuteTask,
}) => {
  const [viewMode, setViewMode] = useState<'tasks' | 'scheduled'>('tasks');
  const [filter, setFilter] = useState<'all' | 'Completed' | 'In Progress' | 'Pending'>('all');
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<TaskItem['category']>('general');

  // Scheduled tasks state
  const [scheduledList, setScheduledList] = useState<ScheduledTaskItem[]>([]);
  const [showAddSchedModal, setShowAddSchedModal] = useState(false);
  const [schedTitle, setSchedTitle] = useState('');
  const [schedCommand, setSchedCommand] = useState('');
  const [schedTime, setSchedTime] = useState('Har kuni soat 20:00 da');
  const [schedFreq, setSchedFreq] = useState<'daily' | 'weekly' | 'hourly' | 'once'>('daily');
  const [schedCategory, setSchedCategory] = useState('minecraft');

  // Logs modal
  const [selectedTaskLogs, setSelectedTaskLogs] = useState<TaskItem | null>(null);

  const fetchScheduled = async () => {
    try {
      const token = localStorage.getItem('jarvis_token');
      const res = await fetch('/api/scheduled-tasks', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (data.scheduledTasks) setScheduledList(data.scheduledTasks);
    } catch (err) {
      console.warn('Scheduled tasks fetch error:', err);
    }
  };

  useEffect(() => {
    fetchScheduled();
  }, []);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddTask(newTitle.trim(), newCategory);
    setNewTitle('');
    playJarvisSound('blip');
  };

  const handleCreateScheduled = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedTitle.trim()) return;

    try {
      const token = localStorage.getItem('jarvis_token');
      const res = await fetch('/api/scheduled-tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          title: schedTitle,
          command: schedCommand,
          schedule: schedTime,
          frequency: schedFreq,
          category: schedCategory,
        }),
      });
      const data = await res.json();
      if (data.scheduledTask) {
        setScheduledList([data.scheduledTask, ...scheduledList]);
        setShowAddSchedModal(false);
        setSchedTitle('');
        setSchedCommand('');
        playJarvisSound('blip');
      }
    } catch (err) {
      console.warn('Scheduled create error:', err);
    }
  };

  const toggleScheduled = async (id: string, currentEnabled: boolean) => {
    try {
      setScheduledList((prev) =>
        prev.map((s) => (s.id === id ? { ...s, enabled: !currentEnabled } : s))
      );
      const token = localStorage.getItem('jarvis_token');
      await fetch(`/api/scheduled-tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ enabled: !currentEnabled }),
      });
    } catch (err) {
      fetchScheduled();
    }
  };

  const deleteScheduled = async (id: string) => {
    try {
      setScheduledList((prev) => prev.filter((s) => s.id !== id));
      const token = localStorage.getItem('jarvis_token');
      await fetch(`/api/scheduled-tasks/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch (err) {
      fetchScheduled();
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'all') return true;
    return t.status === filter;
  });

  return (
    <div className="flex-1 bg-[#050813] p-6 overflow-y-auto space-y-6 text-zinc-100 select-none">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-blue-950/60">
        <div>
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-bold text-white tracking-wide">
              Vazifalar & Rejalar (Tasks & Schedules)
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            JARVIS avtonom topshiriqlari, davriy skriptlar va bajarish jurnali
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-xl bg-[#081020] border border-blue-950 flex items-center gap-1 text-xs">
            <button
              onClick={() => setViewMode('tasks')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                viewMode === 'tasks'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Faol Vazifalar ({tasks.length})
            </button>
            <button
              onClick={() => setViewMode('scheduled')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'scheduled'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              <span>Rejalashtirilgan ({scheduledList.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* TASKS VIEW MODE */}
      {viewMode === 'tasks' && (
        <div className="space-y-4">
          {/* New Task Bar */}
          <form onSubmit={handleCreateTask} className="flex gap-2">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Yangi vazifa nomini yozing (masalan: 'Telegramni ochish' yoki 'Hisobot yozish')..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#081020] border border-blue-950 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-cyan-500"
            />
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as TaskItem['category'])}
              className="px-3 py-2.5 rounded-xl bg-[#081020] border border-blue-950 text-xs text-zinc-300 focus:outline-none cursor-pointer"
            >
              <option value="general">Umumiy</option>
              <option value="youtube">YouTube</option>
              <option value="files">Fayllar</option>
              <option value="search">Qidiruv</option>
              <option value="text">Matn</option>
              <option value="system">Tizim</option>
              <option value="minecraft">Minecraft</option>
              <option value="coding">Kodlash</option>
            </select>
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-[#0055ff] hover:bg-[#0044dd] text-white font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Qo'shish</span>
            </button>
          </form>

          {/* Filter Bar */}
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Vazifalar holati bo'yicha saralash:</span>
            <div className="flex items-center gap-1">
              {(['all', 'Completed', 'In Progress', 'Pending'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer font-medium ${
                    filter === tab
                      ? 'bg-blue-600/30 text-cyan-300 border border-blue-500/40'
                      : 'text-zinc-500 hover:text-zinc-200'
                  }`}
                >
                  {tab === 'all' ? 'Barchasi' : tab}
                </button>
              ))}
            </div>
          </div>

          {/* Tasks List */}
          <div className="space-y-2.5">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className="p-4 rounded-2xl bg-[#081020] hover:bg-[#0d1832] border border-blue-950/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all group"
              >
                <div className="flex items-start sm:items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[#0c1427] border border-blue-900/50 shrink-0">
                    {task.category === 'youtube' && <Brain className="w-4 h-4 text-cyan-400" />}
                    {task.category === 'files' && <Folder className="w-4 h-4 text-amber-400" />}
                    {task.category === 'search' && <Search className="w-4 h-4 text-sky-400" />}
                    {task.category === 'text' && <FileText className="w-4 h-4 text-emerald-400" />}
                    {task.category === 'general' && <CheckSquare className="w-4 h-4 text-blue-400" />}
                    {task.category === 'system' && <Clock className="w-4 h-4 text-purple-400" />}
                    {task.category === 'minecraft' && <Boxes className="w-4 h-4 text-emerald-400" />}
                    {task.category === 'coding' && <FileCode className="w-4 h-4 text-orange-400" />}
                  </div>

                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {task.title}
                    </div>
                    <div className="text-[11px] text-zinc-400 flex items-center gap-2 mt-0.5">
                      <span
                        className={`font-semibold ${
                          task.status === 'Completed'
                            ? 'text-emerald-400'
                            : task.status === 'In Progress' || task.status === 'Planning'
                            ? 'text-cyan-400 animate-pulse'
                            : 'text-amber-400'
                        }`}
                      >
                        ● {task.status}
                      </span>
                      <span>•</span>
                      <span>{task.time}</span>
                      {task.priority && (
                        <>
                          <span>•</span>
                          <span className="uppercase text-[10px] text-zinc-500 font-mono">
                            {task.priority}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Progress & Actions */}
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() =>
                      setSelectedTaskLogs({
                        ...task,
                        logs: task.logs || [
                          `[START] ${task.title} boshlandi`,
                          `[EXEC] Agent protseduralari bajarilmoqda`,
                          `[STATE] Holat: ${task.status}`,
                        ],
                      })
                    }
                    className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-cyan-300 border border-white/5 transition-colors cursor-pointer"
                    title="Jurnalni ko'rish"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onExecuteTask(task)}
                    className="px-3 py-1.5 rounded-xl bg-[#0055ff]/20 hover:bg-[#0055ff] border border-blue-500/40 text-cyan-300 hover:text-white text-xs font-medium transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Play className="w-3 h-3" />
                    <span>Bajarish</span>
                  </button>
                  <button
                    onClick={() => onDeleteTask(task.id)}
                    className="p-1.5 rounded-xl text-zinc-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                    title="O'chirish"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SCHEDULED TASKS VIEW MODE */}
      {viewMode === 'scheduled' && (
        <div className="space-y-4">
          {/* Top Banner & Add Button */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-blue-950/40 via-[#081226] to-[#040814] border border-blue-900/40">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Repeat className="w-4 h-4 text-cyan-400" />
                <span>Davriy & Rejalashtirilgan Vazifalar</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Belgilangan vaqtda (masalan: Har kuni 20:00 da) avtomatik ishga tushuvchi buyruqlar
              </p>
            </div>
            <button
              onClick={() => setShowAddSchedModal(true)}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,102,255,0.3)] transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Yangi Reja Qo'shish</span>
            </button>
          </div>

          {/* Scheduled Task Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scheduledList.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all ${
                  item.enabled
                    ? 'bg-[#081124] border-blue-900/60 shadow-sm'
                    : 'bg-[#060b17] border-zinc-900 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-950/80 border border-blue-800/50 flex items-center justify-center text-cyan-400">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{item.title}</h4>
                      <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-900/40">
                        {item.schedule}
                      </span>
                    </div>
                  </div>

                  {/* Toggle */}
                  <button
                    onClick={() => toggleScheduled(item.id, item.enabled)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      item.enabled ? 'bg-blue-600' : 'bg-zinc-800'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
                        item.enabled ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {item.command && (
                  <div className="p-2 rounded-xl bg-black/60 border border-blue-950 font-mono text-[11px] text-zinc-300 truncate">
                    <span className="text-blue-500 mr-1.5">$</span>
                    <span>{item.command}</span>
                  </div>
                )}

                <div className="mt-3 pt-2.5 border-t border-blue-950/60 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                  <span>Oxirgi: {item.lastRun || 'Bajarilmagan'}</span>
                  <button
                    onClick={() => deleteScheduled(item.id)}
                    className="p-1 rounded text-zinc-500 hover:text-red-400 hover:bg-white/5 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Scheduled Task Modal */}
      {showAddSchedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md p-6 rounded-2xl bg-[#091122] border border-blue-600/40 shadow-[0_0_50px_rgba(0,102,255,0.3)] space-y-4">
            <div className="flex items-center justify-between border-b border-blue-900/50 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Yangi Rejali Vazifa Qo'shish</h3>
              </div>
              <button
                onClick={() => setShowAddSchedModal(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateScheduled} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-zinc-300 font-medium mb-1">Vazifa Nomi</label>
                <input
                  type="text"
                  value={schedTitle}
                  onChange={(e) => setSchedTitle(e.target.value)}
                  placeholder="Minecraft server backupini qilish"
                  className="w-full px-3 py-2 rounded-xl bg-[#040813] border border-blue-900/40 text-zinc-100 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Bajariladigan Buyruq (ixtiyoriy)</label>
                <input
                  type="text"
                  value={schedCommand}
                  onChange={(e) => setSchedCommand(e.target.value)}
                  placeholder="tar -czf ~/backup.tar.gz ~/minecraft"
                  className="w-full px-3 py-2 rounded-xl bg-[#040813] border border-blue-900/40 text-zinc-100 focus:outline-none focus:border-blue-500 font-mono text-[11px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Vaqt jadvali</label>
                  <input
                    type="text"
                    value={schedTime}
                    onChange={(e) => setSchedTime(e.target.value)}
                    placeholder="Har kuni soat 20:00 da"
                    className="w-full px-3 py-2 rounded-xl bg-[#040813] border border-blue-900/40 text-zinc-100 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Davriylik</label>
                  <select
                    value={schedFreq}
                    onChange={(e) => setSchedFreq(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-[#040813] border border-blue-900/40 text-zinc-100 focus:outline-none focus:border-blue-500"
                  >
                    <option value="daily">Har kuni</option>
                    <option value="weekly">Har hafta</option>
                    <option value="hourly">Har soatda</option>
                    <option value="once">Bir martalik</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-blue-950/60">
                <button
                  type="button"
                  onClick={() => setShowAddSchedModal(false)}
                  className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-[0_0_15px_rgba(0,102,255,0.3)]"
                >
                  Rejani Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Logs Modal */}
      {selectedTaskLogs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg p-5 rounded-2xl bg-[#091122] border border-blue-600/40 shadow-[0_0_50px_rgba(0,102,255,0.3)] space-y-4">
            <div className="flex items-center justify-between border-b border-blue-900/50 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white">{selectedTaskLogs.title}</h3>
                <p className="text-[11px] text-zinc-400">Ijro jurnali va qadamlar ketma-ketligi</p>
              </div>
              <button
                onClick={() => setSelectedTaskLogs(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-black/90 border border-blue-950 font-mono text-[11px] text-zinc-300 max-h-64 overflow-y-auto space-y-1">
              {selectedTaskLogs.logs?.map((log, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-blue-500 select-none">❯</span>
                  <span>{log}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={() => setSelectedTaskLogs(null)}
                className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium cursor-pointer"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
