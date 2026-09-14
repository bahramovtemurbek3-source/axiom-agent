import React, { useState, useEffect } from 'react';
import {
  Settings,
  Sliders,
  Sparkles,
  Mic,
  Volume2,
  VolumeX,
  MicOff,
  Bell,
  Shield,
  Info,
  Check,
  RotateCcw,
  Trash2,
  Save,
  CheckCircle2,
  AlertTriangle,
  Play,
  Cpu,
  Database,
  RefreshCw,
  Laptop,
  Radio,
  Zap,
} from 'lucide-react';
import { playJarvisSound, speakJarvis, stopJarvisSpeech } from '../utils/jarvisVoice';
import { UserSettings } from '../types';
import { localAgent, AgentStatus, LocalAgentDetails } from '../utils/localAgent';

type SettingsTab = 'general' | 'ai' | 'voice' | 'developer' | 'notifications' | 'privacy' | 'about';

export const JarvisSettingsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('voice');
  const [settings, setSettings] = useState<UserSettings>({
    general: {
      language: 'uz',
      theme: 'dark',
      timezone: 'Asia/Tashkent',
      startupBehavior: 'dashboard',
      interfacePreferences: 'holographic',
    },
    ai: {
      model: 'gemini-3.8-flash',
      responseStyle: 'detailed',
      temperature: 0.7,
      contextLength: 8,
      memoryBehavior: 'always',
      taskExecutionConfirmation: true,
    },
    voice: {
      voiceEnabled: true,
      voiceInputEnabled: true,
      voiceOutputEnabled: true,
      gender: 'male',
      language: 'uz-UZ',
      selectedVoice: 'default',
      speechSpeed: 1.0,
      pitch: 1.0,
      volume: 1.0,
      microphone: 'Default Microphone',
      speaker: 'Default Speakers',
      autoSpeak: true,
      pushToTalk: false,
    },
    developer: {
      executionMode: 'real',
      agentPort: 4141,
      agentHost: '127.0.0.1',
      autoConnectAgent: true,
      requireConfirmationForHighRisk: true,
    },
    notifications: {
      taskCompletion: true,
      taskFailure: true,
      reminders: true,
      systemNotifications: true,
      soundEffects: true,
      desktopNotifications: true,
    },
    privacy: {
      saveConversationHistory: true,
      allowLongTermMemory: true,
      telemetryEnabled: true,
    },
  });

  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [agentStatus, setAgentStatus] = useState<AgentStatus>(localAgent.getStatus());
  const [agentDetails, setAgentDetails] = useState<LocalAgentDetails>(localAgent.getDetails());
  const [isPinging, setIsPinging] = useState(false);

  // Load available system voices
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const updateVoices = () => {
        const vList = window.speechSynthesis.getVoices();
        if (vList && vList.length > 0) {
          setAvailableVoices(vList);
        }
      };
      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  // Listen to local agent state
  useEffect(() => {
    const unsub = localAgent.subscribe((st, dt) => {
      setAgentStatus(st);
      setAgentDetails(dt);
    });
    return unsub;
  }, []);

  // Fetch persisted settings from server or localStorage
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem('jarvis_token');
        const res = await fetch('/api/settings', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json();
        if (data.settings) {
          setSettings((prev) => ({
            ...prev,
            ...data.settings,
            voice: { ...prev.voice, ...data.settings.voice },
            developer: { ...prev.developer, ...data.settings.developer },
          }));
        }
      } catch (err) {
        // Fallback to local storage
        try {
          const raw = localStorage.getItem('jarvis_settings');
          if (raw) {
            setSettings(JSON.parse(raw));
          }
        } catch (_) {}
      }
    };
    fetchSettings();
  }, []);

  // Sync to localStorage on every change
  const updateSettings = (updater: (prev: UserSettings) => UserSettings) => {
    setSettings((prev) => {
      const next = updater(prev);
      try {
        localStorage.setItem('jarvis_settings', JSON.stringify(next));
      } catch (_) {}
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setSavedSuccess(false);
    try {
      localStorage.setItem('jarvis_settings', JSON.stringify(settings));
      const token = localStorage.getItem('jarvis_token');
      await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(settings),
      });
      playJarvisSound('blip');
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.warn('Failed to save settings:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleTestVoice = () => {
    if (!settings.voice.voiceEnabled || !settings.voice.voiceOutputEnabled) {
      alert("Ovoz o'chirilgan holatda. Avval Ovozli Yordamchi yoki Ovoz Chiqarishni (Speaker) yoqing.");
      return;
    }
    playJarvisSound('wake');
    speakJarvis("J.A.R.V.I.S. ovoz sintezi tayyor. Barcha parametrlari to'g'ri sozlangan, janob.", {
      enabled: true,
      rate: settings.voice.speechSpeed,
      pitch: settings.voice.pitch,
      volume: settings.voice.volume,
      gender: settings.voice.gender,
      language: settings.voice.language,
      voiceName: settings.voice.selectedVoice,
    });
  };

  const handlePingAgent = async () => {
    setIsPinging(true);
    playJarvisSound('blip');
    await localAgent.checkHeartbeat();
    setIsPinging(false);
  };

  const isConnected = agentStatus === 'connected';
  const isConnecting = agentStatus === 'connecting';

  return (
    <div className="flex-1 bg-[#050813] p-6 overflow-y-auto space-y-6 text-zinc-100 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-[#071329] via-[#091838] to-[#040914] border border-blue-900/60 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Settings className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl font-bold text-white tracking-wide font-sans">
              Tizim Sozlamalari
            </h2>
          </div>
          <p className="text-xs text-zinc-300 font-sans">
            J.A.R.V.I.S. ovoz parametrlari, kompyuter ijro rejimi va sun'iy intellekt xatti-harakati.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {savedSuccess && (
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              Saqlandi!
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saqlanmoqda...' : 'O\'zgarishlarni Saqlash'}</span>
          </button>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-blue-950/60">
        {[
          { id: 'voice', label: 'Ovoz Sozlamalari (Voice)', icon: Mic },
          { id: 'developer', label: 'Kompyuter Rejimi (Execution)', icon: Laptop },
          { id: 'ai', label: 'Neyron Model (AI)', icon: Sparkles },
          { id: 'general', label: 'Umumiy', icon: Sliders },
          { id: 'notifications', label: 'Bildirishnomalar', icon: Bell },
          { id: 'privacy', label: 'Xavfsizlik', icon: Shield },
          { id: 'about', label: 'Tizim Haqida', icon: Info },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as SettingsTab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                isActive
                  ? 'bg-blue-600/30 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#081020]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT */}
      <div className="space-y-4">
        {/* VOICE TAB (Full UI as requested) */}
        {activeTab === 'voice' && (
          <div className="space-y-4">
            {/* Master Voice Switch */}
            <div className="p-5 rounded-2xl bg-[#081020] border border-blue-950/80 flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-cyan-400" />
                  <span>Ovozli Yordamchi (Voice Assistant Master)</span>
                </div>
                <p className="text-xs text-zinc-400">
                  JARVIS ovoz tizimini to'liq yoqish yoki o'chirish. O'chirilganda hech qanday audio chiqmaydi va mikrofon tinglamaydi.
                </p>
              </div>
              <button
                onClick={() => {
                  const nextVal = !settings.voice.voiceEnabled;
                  if (!nextVal) stopJarvisSpeech();
                  updateSettings((p) => ({
                    ...p,
                    voice: { ...p.voice, voiceEnabled: nextVal },
                  }));
                }}
                className={`w-14 h-7 rounded-full transition-colors p-1 cursor-pointer ${
                  settings.voice.voiceEnabled ? 'bg-cyan-500' : 'bg-zinc-800'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.voice.voiceEnabled ? 'translate-x-7' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Strict Input vs Output Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Voice Input (Microphone) */}
              <div className="p-4 rounded-2xl bg-[#081020] border border-blue-950/80 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    {settings.voice.voiceInputEnabled ? (
                      <Mic className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <MicOff className="w-4 h-4 text-rose-400" />
                    )}
                    <span>Ovoz Kiritish (Mikrofon / Input)</span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Ovozli buyruqlarni mikrofondan tinglash ruxsati
                  </p>
                </div>
                <button
                  onClick={() =>
                    updateSettings((p) => ({
                      ...p,
                      voice: { ...p.voice, voiceInputEnabled: !p.voice.voiceInputEnabled },
                    }))
                  }
                  className={`w-11 h-6 rounded-full transition-colors p-0.5 cursor-pointer ${
                    settings.voice.voiceInputEnabled ? 'bg-emerald-600' : 'bg-zinc-800'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      settings.voice.voiceInputEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Voice Output (Speaker) */}
              <div className="p-4 rounded-2xl bg-[#081020] border border-blue-950/80 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    {settings.voice.voiceOutputEnabled ? (
                      <Volume2 className="w-4 h-4 text-sky-400" />
                    ) : (
                      <VolumeX className="w-4 h-4 text-rose-400" />
                    )}
                    <span>Ovoz Chiqarish (Dinamik / Output)</span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    O'chirilsa: Jarvis javoblarni faqat yozma ko'rsatadi, ovoz mutlaqo chiqmaydi.
                  </p>
                </div>
                <button
                  onClick={() => {
                    const nextVal = !settings.voice.voiceOutputEnabled;
                    if (!nextVal) stopJarvisSpeech();
                    updateSettings((p) => ({
                      ...p,
                      voice: { ...p.voice, voiceOutputEnabled: nextVal },
                    }));
                  }}
                  className={`w-11 h-6 rounded-full transition-colors p-0.5 cursor-pointer ${
                    settings.voice.voiceOutputEnabled ? 'bg-sky-600' : 'bg-zinc-800'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      settings.voice.voiceOutputEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Auto Speak Toggle */}
            <div className="p-4 rounded-2xl bg-[#081020] border border-blue-950/80 flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-white">Avtomatik Ovozda O'qish (Auto Speak)</div>
                <p className="text-[11px] text-zinc-400">
                  Chatda javob kelishi bilanoq uni darhol ovozda eshittirish
                </p>
              </div>
              <button
                onClick={() =>
                  updateSettings((p) => ({
                    ...p,
                    voice: { ...p.voice, autoSpeak: !p.voice.autoSpeak },
                  }))
                }
                className={`w-11 h-6 rounded-full transition-colors p-0.5 cursor-pointer ${
                  settings.voice.autoSpeak ? 'bg-blue-600' : 'bg-zinc-800'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.voice.autoSpeak ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Voice Characteristics: Gender & Language */}
            <div className="p-5 rounded-2xl bg-[#081020] border border-blue-950/80 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-zinc-300 font-bold block mb-1">Ovoz Jinsi (Gender)</label>
                <select
                  value={settings.voice.gender}
                  onChange={(e) =>
                    updateSettings((p) => ({
                      ...p,
                      voice: { ...p.voice, gender: e.target.value as any },
                    }))
                  }
                  className="w-full px-3 py-2 rounded-xl bg-[#040813] border border-blue-900/40 text-zinc-200 focus:outline-none"
                >
                  <option value="male">Erkak Ovozi (Paul Bettany / Classic Jarvis)</option>
                  <option value="female">Ayol Ovozi (Friday / S.H.I.E.L.D.)</option>
                </select>
                <p className="text-[10px] text-zinc-400 mt-1">
                  Erkak ovozi pastroq pitch va chuqur tembr bilan yangraydi.
                </p>
              </div>

              <div>
                <label className="text-zinc-300 font-bold block mb-1">Nutq Tili (Language)</label>
                <select
                  value={settings.voice.language}
                  onChange={(e) =>
                    updateSettings((p) => ({
                      ...p,
                      voice: { ...p.voice, language: e.target.value },
                    }))
                  }
                  className="w-full px-3 py-2 rounded-xl bg-[#040813] border border-blue-900/40 text-zinc-200 focus:outline-none"
                >
                  <option value="uz-UZ">O'zbek tili (uz-UZ)</option>
                  <option value="en-US">English - US (en-US)</option>
                  <option value="en-GB">English - UK (en-GB / Jarvis accent)</option>
                  <option value="ru-RU">Русский (ru-RU)</option>
                </select>
                <p className="text-[10px] text-zinc-400 mt-1">
                  Tanlangan til bo'yicha eng mos sintetik ovoz avtomatik biriktiriladi.
                </p>
              </div>
            </div>

            {/* Sliders: Speed, Pitch, Volume */}
            <div className="p-5 rounded-2xl bg-[#081020] border border-blue-950/80 space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">Akustik Parametrlar:</span>
                <button
                  onClick={handleTestVoice}
                  className="px-3.5 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Ovozni Sinab Ko'rish</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                {/* Speed */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-zinc-300">
                    <span>Nutq Tezligi:</span>
                    <span className="font-mono text-cyan-300">{settings.voice.speechSpeed}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.1"
                    value={settings.voice.speechSpeed}
                    onChange={(e) =>
                      updateSettings((p) => ({
                        ...p,
                        voice: { ...p.voice, speechSpeed: parseFloat(e.target.value) },
                      }))
                    }
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-400">
                    <span>0.5x</span>
                    <span>1.0x</span>
                    <span>2.0x</span>
                  </div>
                </div>

                {/* Pitch */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-zinc-300">
                    <span>Ovoz Balandligi (Pitch):</span>
                    <span className="font-mono text-sky-300">{settings.voice.pitch}</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="1.5"
                    step="0.05"
                    value={settings.voice.pitch}
                    onChange={(e) =>
                      updateSettings((p) => ({
                        ...p,
                        voice: { ...p.voice, pitch: parseFloat(e.target.value) },
                      }))
                    }
                    className="w-full accent-sky-400 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-400">
                    <span>Chuqur</span>
                    <span>Normal</span>
                    <span>O'tkir</span>
                  </div>
                </div>

                {/* Volume */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-zinc-300">
                    <span>Ovoz kuchi (Volume):</span>
                    <span className="font-mono text-emerald-300">
                      {Math.round(settings.voice.volume * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="1.0"
                    step="0.05"
                    value={settings.voice.volume}
                    onChange={(e) =>
                      updateSettings((p) => ({
                        ...p,
                        voice: { ...p.voice, volume: parseFloat(e.target.value) },
                      }))
                    }
                    className="w-full accent-emerald-400 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-400">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DEVELOPER / EXECUTION MODE TAB */}
        {activeTab === 'developer' && (
          <div className="space-y-4">
            {/* Execution Mode Selector Card */}
            <div className="p-5 rounded-2xl bg-[#081020] border border-blue-950/80 space-y-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-cyan-400" />
                  <span>Ijro Rejimi (Execution Mode)</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Kompyuter harakatlari (ilova ochish, fayl ko'rish) qanday bajarilishini tanlang.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Mode 1: Real Computer */}
                <div
                  onClick={() =>
                    updateSettings((p) => ({
                      ...p,
                      developer: { ...p.developer, executionMode: 'real' },
                    }))
                  }
                  className={`p-4 rounded-xl border transition-all cursor-pointer space-y-1.5 ${
                    settings.developer?.executionMode === 'real'
                      ? 'bg-blue-950/50 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                      : 'bg-[#040813] border-blue-950 hover:border-blue-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                      <span>Haqiqiy Kompyuter (Real Computer)</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-950/60 border border-emerald-500/40 text-[10px] font-mono text-emerald-300">
                      Tavsiya etiladi
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-300 leading-relaxed">
                    Barcha buyruqlar port 4141 dagi mahalliy agent orqali macOS tizimingizda real bajariladi.
                    Agent ulanmagan bo'lsa, xatolik beriladi va hech qachon soxta javob aytilmaydi.
                  </p>
                </div>

                {/* Mode 2: Simulation */}
                <div
                  onClick={() =>
                    updateSettings((p) => ({
                      ...p,
                      developer: { ...p.developer, executionMode: 'simulation' },
                    }))
                  }
                  className={`p-4 rounded-xl border transition-all cursor-pointer space-y-1.5 ${
                    settings.developer?.executionMode === 'simulation'
                      ? 'bg-amber-950/50 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                      : 'bg-[#040813] border-blue-950 hover:border-blue-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      <span>Simulyatsiya (Simulation Mode)</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-950/60 border border-amber-500/40 text-[10px] font-mono text-amber-300">
                      Xavfsiz / Demo
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-300 leading-relaxed">
                    Kompyuterda hech qanday dastur yoki fayl ochilmaydi. Barcha amallar ekranda aniq
                    "Simulyatsiya rejimi" yorlig'i bilan ko'rsatiladi.
                  </p>
                </div>
              </div>
            </div>

            {/* Local Agent Connection Status Card */}
            <div className="p-5 rounded-2xl bg-[#081020] border border-blue-950/80 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Zap className="w-4 h-4 text-cyan-400" />
                    <span>Mahalliy Agent Aloqasi (:4141)</span>
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Kompyuterdagi mahalliy daemon xizmati holati
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-2 ${
                      isConnected
                        ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                        : isConnecting
                        ? 'bg-amber-950/80 border-amber-500/50 text-amber-300'
                        : 'bg-rose-950/80 border-rose-500/50 text-rose-300'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isConnected
                          ? 'bg-emerald-400 animate-pulse'
                          : isConnecting
                          ? 'bg-amber-400 animate-pulse'
                          : 'bg-rose-400'
                      }`}
                    />
                    <span>
                      {isConnected
                        ? `🟢 ULANGAN (${agentDetails.latency}ms)`
                        : isConnecting
                        ? '🟡 TEKSHIRILMOQDA...'
                        : '🔴 ULANMAGAN'}
                    </span>
                  </span>

                  <button
                    onClick={handlePingAgent}
                    disabled={isPinging}
                    className="p-2 rounded-xl bg-blue-900/40 hover:bg-blue-800/60 border border-blue-700/50 text-white transition-all cursor-pointer"
                    title="Aloqani tekshirish"
                  >
                    <RefreshCw className={`w-4 h-4 ${isPinging ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Host and Port Configuration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                <div>
                  <label className="text-zinc-400 block mb-1">Agent Xosti (Host)</label>
                  <input
                    type="text"
                    value={settings.developer?.agentHost || '127.0.0.1'}
                    onChange={(e) =>
                      updateSettings((p) => ({
                        ...p,
                        developer: { ...p.developer, agentHost: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#040813] border border-blue-900/40 text-cyan-300 font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">Agent Porti (Port)</label>
                  <input
                    type="number"
                    value={settings.developer?.agentPort || 4141}
                    onChange={(e) =>
                      updateSettings((p) => ({
                        ...p,
                        developer: { ...p.developer, agentPort: parseInt(e.target.value) || 4141 },
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#040813] border border-blue-900/40 text-cyan-300 font-mono focus:outline-none"
                  />
                </div>
              </div>

              {/* Confirmation for High-risk commands */}
              <div className="p-3.5 rounded-xl bg-[#040813] border border-blue-950 flex items-center justify-between text-xs pt-2">
                <div>
                  <div className="font-bold text-white">Xavfli buyruqlar uchun tasdiq (Confirmation)</div>
                  <p className="text-[11px] text-zinc-400">
                    Terminal, fayllarni o'chirish yoki tizim o'zgartirishdan oldin so'rash
                  </p>
                </div>
                <button
                  onClick={() =>
                    updateSettings((p) => ({
                      ...p,
                      developer: {
                        ...p.developer,
                        requireConfirmationForHighRisk: !p.developer?.requireConfirmationForHighRisk,
                      },
                    }))
                  }
                  className={`w-11 h-6 rounded-full transition-colors p-0.5 cursor-pointer ${
                    settings.developer?.requireConfirmationForHighRisk ? 'bg-blue-600' : 'bg-zinc-800'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      settings.developer?.requireConfirmationForHighRisk
                        ? 'translate-x-5'
                        : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* AI TAB */}
        {activeTab === 'ai' && (
          <div className="space-y-3.5">
            <div className="p-4 rounded-2xl bg-[#081020] border border-blue-950/80 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white">Bosh Neyron Modeli (Gemini)</div>
                <p className="text-[11px] text-zinc-400">Google Gemini avlodlaridan tanlash</p>
              </div>
              <select
                value={settings.ai.model}
                onChange={(e) =>
                  updateSettings((p) => ({
                    ...p,
                    ai: { ...p.ai, model: e.target.value },
                  }))
                }
                className="px-3 py-1.5 rounded-xl bg-[#040813] border border-blue-900 text-xs text-cyan-200 font-mono"
              >
                <option value="gemini-3.8-flash">gemini-3.8-flash (Eng tez & tavsiya etilgan)</option>
                <option value="gemini-3.6-flash">gemini-3.6-flash (Barqaror & yuqori tezlik)</option>
                <option value="gemini-flash-latest">gemini-flash-latest (Avtomatik eng so'nggi)</option>
                <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Yengil & tejamkor)</option>
              </select>
            </div>

            <div className="p-4 rounded-2xl bg-[#081020] border border-blue-950/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">
                  Ijodkorlik / Harorat (Temperature: {settings.ai.temperature})
                </span>
                <span className="text-[11px] text-zinc-400">Aniq & Tahliliy — Erkin & Ijodiy</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={settings.ai.temperature}
                onChange={(e) =>
                  updateSettings((p) => ({
                    ...p,
                    ai: { ...p.ai, temperature: parseFloat(e.target.value) },
                  }))
                }
                className="w-full accent-blue-500 cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* GENERAL TAB */}
        {activeTab === 'general' && (
          <div className="space-y-3.5">
            <div className="p-5 rounded-2xl bg-[#081020] border border-blue-950/80 space-y-4 text-xs">
              <h3 className="font-bold text-white">Til va Mintaqa</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-zinc-400 block mb-1">Dastur Tili</label>
                  <select
                    value={settings.general.language}
                    onChange={(e) =>
                      updateSettings((p) => ({
                        ...p,
                        general: { ...p.general, language: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#040813] border border-blue-900/40 text-zinc-200 focus:outline-none"
                  >
                    <option value="uz">O'zbek tili</option>
                    <option value="en">English</option>
                    <option value="ru">Русский</option>
                  </select>
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">Vaqt Mintaqasi</label>
                  <input
                    type="text"
                    value={settings.general.timezone}
                    onChange={(e) =>
                      updateSettings((p) => ({
                        ...p,
                        general: { ...p.general, timezone: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#040813] border border-blue-900/40 text-zinc-200 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* NOTIFICATIONS TAB */}
        {activeTab === 'notifications' && (
          <div className="space-y-3">
            {[
              {
                key: 'taskCompletion',
                title: 'Vazifa bajarilganda bildirishnoma',
                desc: 'Avtonom topshiriq tugaganda audio va vizual signal berish',
              },
              {
                key: 'taskFailure',
                title: 'Xatoliklar va uzilishlar haqida ogohlantirish',
                desc: 'Ruxsat etilmagan yoki xato buyruqlar yuz berganda xabar berish',
              },
              {
                key: 'soundEffects',
                title: 'Reaktor va Texno Tovushlar',
                desc: 'HUD tugmalari, xabar kelishi va buyruq qabul qilish tovushlari',
              },
            ].map((item) => {
              const val = (settings.notifications as any)[item.key];
              return (
                <div
                  key={item.key}
                  className="p-4 rounded-2xl bg-[#081020] border border-blue-950/80 flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-bold text-white">{item.title}</div>
                    <p className="text-[11px] text-zinc-400">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => {
                      updateSettings((p) => ({
                        ...p,
                        notifications: {
                          ...p.notifications,
                          [item.key]: !val,
                        },
                      }));
                      playJarvisSound('blip');
                    }}
                    className={`w-11 h-6 rounded-full transition-colors p-0.5 cursor-pointer ${
                      val ? 'bg-blue-600' : 'bg-zinc-800'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        val ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* PRIVACY TAB */}
        {activeTab === 'privacy' && (
          <div className="p-5 rounded-2xl bg-[#081020] border border-blue-950/80 space-y-4 text-xs">
            <h3 className="font-bold text-white">Xavfsizlik va Ma'lumotlar Maxfiyligi</h3>
            <p className="text-zinc-300">
              JARVIS barcha kompyuter buyruqlarini faqat <code className="text-cyan-300 font-mono">127.0.0.1</code> mahalliy
              tarmoq orqali bajaradi. Hech qanday shaxsiy fayllar yoki parollar tashqi serverlarga yuborilmaydi.
            </p>
          </div>
        )}

        {/* ABOUT TAB */}
        {activeTab === 'about' && (
          <div className="p-5 rounded-2xl bg-[#081020] border border-blue-950/80 space-y-3 text-xs">
            <div className="text-base font-bold text-white">J.A.R.V.I.S. Core v2.5.0</div>
            <p className="text-zinc-400">
              Just A Rather Very Intelligent System — Gemini AI va mahalliy kompyuter agenti bilan quvvatlangan avtonom yordamchi.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
