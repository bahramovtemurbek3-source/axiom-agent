import React from 'react';
import {
  Globe,
  Terminal,
  Folder,
  Code,
  Cpu,
  PlaySquare,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { playJarvisSound, speakJarvis } from '../utils/jarvisVoice';

interface JarvisAppsViewProps {
  onLaunchApp: (appName: string, actionUrl?: string) => void;
}

export const JarvisAppsView: React.FC<JarvisAppsViewProps> = ({ onLaunchApp }) => {
  const apps = [
    {
      id: 'browser',
      name: 'Veb Brauzer (Browser)',
      desc: 'YouTube, Google va internet tarmoqlari',
      icon: Globe,
      color: 'text-cyan-400',
      action: () => {
        window.open('https://www.google.com', '_blank');
        speakJarvis("Brauzer ochildi.");
      },
    },
    {
      id: 'youtube',
      name: 'YouTube Media',
      desc: 'Video, musiqa va kontentlar',
      icon: PlaySquare,
      color: 'text-red-400',
      action: () => {
        window.open('https://www.youtube.com', '_blank');
        speakJarvis("YouTube ochilmoqda.");
      },
    },
    {
      id: 'terminal',
      name: 'J.A.R.V.I.S. Terminal',
      desc: 'Tizim buyruqlari va bash amallari',
      icon: Terminal,
      color: 'text-emerald-400',
      action: () => onLaunchApp('terminal'),
    },
    {
      id: 'files',
      name: 'Explorer & Files',
      desc: 'Fayllar va kataloglar nazorati',
      icon: Folder,
      color: 'text-amber-400',
      action: () => onLaunchApp('files'),
    },
    {
      id: 'editor',
      name: 'Code Studio',
      desc: 'TypeScript va Python skriptlar muhiti',
      icon: Code,
      color: 'text-sky-400',
      action: () => onLaunchApp('editor'),
    },
    {
      id: 'system',
      name: 'Tizim Monitori',
      desc: 'CPU, RAM va tarmoq diagnostikasi',
      icon: Cpu,
      color: 'text-purple-400',
      action: () => onLaunchApp('system'),
    },
  ];

  return (
    <div className="flex-1 bg-[#050813] p-6 overflow-y-auto space-y-6 text-zinc-100 select-none">
      <div className="pb-2 border-b border-blue-950/60">
        <h2 className="text-xl font-bold text-white tracking-wide">Kompyuter Ilovalari (Apps)</h2>
        <p className="text-xs text-zinc-400">
          J.A.R.V.I.S. orqali 1 marta bosishda ishga tushirish.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {apps.map((app) => {
          const Icon = app.icon;
          return (
            <div
              key={app.id}
              onClick={() => {
                playJarvisSound('acknowledge');
                app.action();
              }}
              className="p-5 rounded-2xl bg-[#081020] hover:bg-[#0e1c3a] border border-blue-950/80 hover:border-cyan-500/50 flex flex-col justify-between transition-all cursor-pointer group shadow-sm hover:scale-[1.02]"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#0c1427] border border-blue-900/50 flex items-center justify-center">
                  <Icon className={`w-5 h-5 ${app.color}`} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {app.name}
                  </h3>
                  <p className="text-xs text-zinc-400 pt-1 font-sans">{app.desc}</p>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between text-xs text-cyan-400 font-medium">
                <span>Ishga tushirish</span>
                <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
