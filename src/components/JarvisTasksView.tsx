import React, { useState } from 'react';
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
} from 'lucide-react';
import { playJarvisSound } from '../utils/jarvisVoice';

export interface TaskItem {
  id: string;
  title: string;
  category: 'youtube' | 'files' | 'system' | 'search' | 'text' | 'general';
  status: 'Completed' | 'In Progress' | 'Pending';
  time: string;
  description?: string;
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
  const [filter, setFilter] = useState<'all' | 'Completed' | 'In Progress' | 'Pending'>('all');
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<TaskItem['category']>('general');

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'all') return true;
    return t.status === filter;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddTask(newTitle.trim(), newCategory);
    setNewTitle('');
    playJarvisSound('blip');
  };

  return (
    <div className="flex-1 bg-[#050813] p-6 overflow-y-auto space-y-6 text-zinc-100 select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-blue-950/60">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-bold text-white tracking-wide">Vazifalar Boshqaruvi (Tasks)</h2>
          </div>
          <p className="text-xs text-zinc-400">
            J.A.R.V.I.S. bajargan va kutilayotgan barcha jarayonlar ro'yxati.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#081020] border border-blue-950 text-xs">
          {(['all', 'Completed', 'In Progress', 'Pending'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer font-medium ${
                filter === tab
                  ? 'bg-[#0055ff] text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {tab === 'all' ? 'Barchasi' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* New Task Creation Bar */}
      <form onSubmit={handleCreate} className="flex gap-2">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Yangi vazifa nomini yozing (masalan: 'Telegramni ochish')..."
          className="flex-1 px-4 py-2.5 rounded-xl bg-[#081020] border border-blue-950 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-cyan-500 font-sans"
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
        </select>
        <button
          type="submit"
          className="px-4 py-2.5 rounded-xl bg-[#0055ff] hover:bg-[#0044dd] text-white font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Qo'shish</span>
        </button>
      </form>

      {/* Tasks List */}
      <div className="space-y-2">
        {filteredTasks.map((task) => (
          <div
            key={task.id}
            className="p-3.5 rounded-2xl bg-[#081020] hover:bg-[#0d1832] border border-blue-950/80 flex items-center justify-between transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#0c1427] border border-blue-900/50">
                {task.category === 'youtube' && <Brain className="w-4 h-4 text-cyan-400" />}
                {task.category === 'files' && <Folder className="w-4 h-4 text-amber-400" />}
                {task.category === 'search' && <Search className="w-4 h-4 text-sky-400" />}
                {task.category === 'text' && <FileText className="w-4 h-4 text-emerald-400" />}
                {task.category === 'general' && <CheckSquare className="w-4 h-4 text-blue-400" />}
                {task.category === 'system' && <Clock className="w-4 h-4 text-purple-400" />}
              </div>

              <div>
                <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {task.title}
                </div>
                <div className="text-[11px] text-zinc-400 font-sans flex items-center gap-2">
                  <span
                    className={`font-semibold ${
                      task.status === 'Completed'
                        ? 'text-emerald-400'
                        : task.status === 'In Progress'
                        ? 'text-cyan-400 animate-pulse'
                        : 'text-amber-400'
                    }`}
                  >
                    ● {task.status}
                  </span>
                  <span>•</span>
                  <span>{task.time}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
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
  );
};
