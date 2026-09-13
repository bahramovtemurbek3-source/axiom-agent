import React, { useState } from 'react';
import {
  Settings,
  Volume2,
  VolumeX,
  ShieldCheck,
  Cpu,
  Sparkles,
  RotateCcw,
  Check,
} from 'lucide-react';
import { playJarvisSound, speakJarvis } from '../utils/jarvisVoice';

export const JarvisSettingsView: React.FC = () => {
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [model, setModel] = useState('gemini-3.8-flash');
  const [rootClearance, setRootClearance] = useState('LEVEL 10');

  const handleTestVoice = () => {
    playJarvisSound('wake');
    speakJarvis("J.A.R.V.I.S. ovoz tizimi to'liq sozlandi va aloqaga tayyor, janob.");
  };

  return (
    <div className="flex-1 bg-[#050813] p-6 overflow-y-auto space-y-6 text-zinc-100 select-none max-w-3xl">
      <div className="pb-2 border-b border-blue-950/60">
        <h2 className="text-xl font-bold text-white tracking-wide">Tizim Sozlamalari (Settings)</h2>
        <p className="text-xs text-zinc-400">
          J.A.R.V.I.S. neyron yadrosi, ovoz va ruxsat parametrlarini boshqarish.
        </p>
      </div>

      <div className="space-y-4">
        {/* Voice Setting */}
        <div className="p-4 rounded-2xl bg-[#081020] border border-blue-950/80 flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="text-xs font-bold text-white">J.A.R.V.I.S. Ovozli Nutq (TTS)</div>
            <p className="text-[11px] text-zinc-400">Javoblarni ovozli o'qib eshittirish</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleTestVoice}
              className="px-3 py-1.5 rounded-xl bg-[#0e1933] hover:bg-[#142347] text-cyan-300 text-xs font-medium cursor-pointer"
            >
              Test qilish
            </button>
            <button
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className={`w-12 h-6 rounded-full transition-colors p-1 cursor-pointer ${
                voiceEnabled ? 'bg-[#0055ff]' : 'bg-zinc-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  voiceEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Sound Effects */}
        <div className="p-4 rounded-2xl bg-[#081020] border border-blue-950/80 flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="text-xs font-bold text-white">Kelajak Texno Tovushlari</div>
            <p className="text-[11px] text-zinc-400">Reaktor va tasdiqlash audio effektlari</p>
          </div>
          <button
            onClick={() => {
              setSoundEffects(!soundEffects);
              playJarvisSound('blip');
            }}
            className={`w-12 h-6 rounded-full transition-colors p-1 cursor-pointer ${
              soundEffects ? 'bg-[#0055ff]' : 'bg-zinc-800'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                soundEffects ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* AI Model Selector */}
        <div className="p-4 rounded-2xl bg-[#081020] border border-blue-950/80 flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="text-xs font-bold text-white">Neyron Modeli</div>
            <p className="text-[11px] text-zinc-400">Google Gemini yadrosi</p>
          </div>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-[#0e1933] border border-blue-900 text-xs text-cyan-200 focus:outline-none cursor-pointer"
          >
            <option value="gemini-3.8-flash">Gemini 3.8 Flash (Tavsiya etiladi)</option>
            <option value="gemini-3.6-flash">Gemini 3.6 Flash</option>
            <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
          </select>
        </div>

        {/* Root Clearance */}
        <div className="p-4 rounded-2xl bg-[#081020] border border-blue-950/80 flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="text-xs font-bold text-white">Kompyuter Ruxsati Darajasi</div>
            <p className="text-[11px] text-zinc-400">Root / Full Administrative Access</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-950 border border-emerald-500/50 text-emerald-400 font-mono text-xs font-bold">
            LEVEL 10 (FULL UNRESTRICTED)
          </span>
        </div>
      </div>
    </div>
  );
};
