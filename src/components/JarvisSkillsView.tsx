import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Globe,
  Folder,
  Terminal,
  Cpu,
  LayoutGrid,
  Camera,
  Clipboard,
  Code,
  GitBranch,
  Shield,
  Play,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  RefreshCw,
  X,
  Lock,
  ExternalLink,
} from 'lucide-react';
import { SkillItem } from '../types';

export const JarvisSkillsView: React.FC = () => {
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [testModalSkill, setTestModalSkill] = useState<SkillItem | null>(null);
  const [testResult, setTestResult] = useState<any | null>(null);
  const [testing, setTesting] = useState(false);

  const fetchSkills = async () => {
    try {
      const res = await fetch('/api/skills');
      const data = await res.json();
      if (data.skills) setSkills(data.skills);
    } catch (err) {
      console.warn('Failed to load skills:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const toggleSkill = async (id: string, currentEnabled: boolean) => {
    try {
      // Optimistic update
      setSkills((prev) =>
        prev.map((s) => (s.id === id ? { ...s, enabled: !currentEnabled } : s))
      );
      await fetch(`/api/skills/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !currentEnabled }),
      });
    } catch (err) {
      fetchSkills();
    }
  };

  const handleTestSkill = async (skill: SkillItem) => {
    setTestModalSkill(skill);
    setTestResult(null);
    setTesting(true);

    try {
      const res = await fetch(`/api/skills/${skill.id}/test`, { method: 'POST' });
      const data = await res.json();
      setTestResult(data);
      // update count in list
      setSkills((prev) =>
        prev.map((s) =>
          s.id === skill.id
            ? { ...s, executionCount: (s.executionCount || 0) + 1, lastUsed: 'Just now' }
            : s
        )
      );
    } catch (err: any) {
      setTestResult({
        success: false,
        error: err.message || 'Sinov bajarilmadi',
        logs: ['[ERROR] Skill execution failed on host'],
      });
    } finally {
      setTesting(false);
    }
  };

  const getIcon = (category: string) => {
    switch (category) {
      case 'browser':
        return Globe;
      case 'files':
        return Folder;
      case 'terminal':
        return Terminal;
      case 'system':
        return Cpu;
      case 'app':
        return LayoutGrid;
      case 'screenshot':
        return Camera;
      case 'clipboard':
        return Clipboard;
      case 'coding':
        return Code;
      case 'git':
        return GitBranch;
      case 'minecraft':
        return Boxes;
      default:
        return Boxes;
    }
  };

  const filteredSkills = skills.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || s.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex-1 bg-[#050913] text-zinc-100 p-6 overflow-y-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-5 border-b border-blue-950/60">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-[0_0_20px_rgba(0,102,255,0.25)]">
            <Boxes className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <span>JARVIS Ko'nikmalar Tizimi (Skills Architecture)</span>
              <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded-full bg-blue-500/20 text-cyan-400 border border-blue-500/30">
                10 Skills Active
              </span>
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Neyron agentning brauzer, fayllar, terminal va o'yin serverlarini boshqarish modullari
            </p>
          </div>
        </div>

        {/* Search & Category Filter */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <div className="relative flex-1 md:w-56">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ko'nikmalarni izlash..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#081124] border border-blue-900/40 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-[#081124] border border-blue-900/40 text-xs text-zinc-200 focus:outline-none focus:border-blue-500"
          >
            <option value="all">Barcha toifalar</option>
            <option value="browser">Brauzer</option>
            <option value="files">Fayllar</option>
            <option value="terminal">Terminal & CMD</option>
            <option value="system">Tizim</option>
            <option value="coding">Kodlash</option>
            <option value="git">Git</option>
            <option value="minecraft">Minecraft Server</option>
          </select>
        </div>
      </div>

      {/* Skills Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-zinc-400 text-xs">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-400" />
          <span>Ko'nikmalar manifesti tekshirilmoqda...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSkills.map((skill) => {
            const Icon = getIcon(skill.category);
            return (
              <div
                key={skill.id}
                className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                  skill.enabled
                    ? 'bg-[#081124] border-blue-900/60 shadow-[0_0_15px_rgba(0,102,255,0.08)] hover:border-blue-500/50'
                    : 'bg-[#050a14] border-zinc-900 opacity-60'
                }`}
              >
                <div>
                  {/* Top card row */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-950/60 border border-blue-800/40 flex items-center justify-center text-blue-400">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-zinc-100">{skill.name}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-medium ${
                              skill.permissionLevel === 'HIGH'
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                : skill.permissionLevel === 'MEDIUM'
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            }`}
                          >
                            {skill.permissionLevel}
                          </span>
                          {skill.requiresConfirmation && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 flex items-center gap-1">
                              <Lock className="w-2.5 h-2.5" />
                              <span>CONFIRM</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Enable/Disable switch */}
                    <button
                      onClick={() => toggleSkill(skill.id, skill.enabled)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        skill.enabled ? 'bg-blue-600' : 'bg-zinc-800'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          skill.enabled ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed min-h-[38px]">
                    {skill.description}
                  </p>
                </div>

                {/* Footer card row */}
                <div className="mt-4 pt-3.5 border-t border-blue-950/60 flex items-center justify-between text-[11px] text-zinc-400">
                  <span>Bajarildi: <strong className="text-zinc-200 font-mono">{skill.executionCount || 0}</strong></span>
                  <button
                    onClick={() => handleTestSkill(skill)}
                    className="px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 flex items-center gap-1.5 font-medium transition-colors cursor-pointer"
                  >
                    <Play className="w-3 h-3" />
                    <span>Sinov (Test)</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Test Skill Live Output Modal */}
      {testModalSkill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-[#091122] border border-blue-600/40 shadow-[0_0_50px_rgba(0,102,255,0.3)] overflow-hidden">
            <div className="p-4 border-b border-blue-900/50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center text-blue-400">
                  <Play className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{testModalSkill.name} — Sinov Jurnali</h3>
                  <p className="text-[11px] text-zinc-400">Ruxsat darajasi: {testModalSkill.permissionLevel}</p>
                </div>
              </div>
              <button
                onClick={() => setTestModalSkill(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {testing ? (
                <div className="py-8 flex flex-col items-center justify-center gap-3 text-zinc-300 text-xs">
                  <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
                  <span>Agent protokollari sinovdan o'tkazilmoqda...</span>
                </div>
              ) : testResult ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{testResult.message}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-black/80 border border-blue-950 font-mono text-[11px] text-zinc-300 space-y-1">
                    {testResult.logs?.map((log: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="text-blue-500 select-none">❯</span>
                        <span>{log}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1">
                    <span>Javob vaqti: <strong className="text-zinc-200">{testResult.executionTimeMs} ms</strong></span>
                    <span className="text-emerald-400 font-semibold">STATUS: {testResult.status}</span>
                  </div>
                </div>
              ) : null}

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setTestModalSkill(null)}
                  className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium cursor-pointer"
                >
                  Yopish
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
