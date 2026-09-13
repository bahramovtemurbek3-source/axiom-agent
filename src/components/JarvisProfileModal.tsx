import React, { useState } from 'react';
import { X, User, Mail, Calendar, Crown, Check, Sparkles } from 'lucide-react';
import { playJarvisSound } from '../utils/jarvisVoice';

interface JarvisProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  userEmail: string;
  onSave: (name: string, email: string) => void;
}

export const JarvisProfileModal: React.FC<JarvisProfileModalProps> = ({
  isOpen,
  onClose,
  userName,
  userEmail,
  onSave,
}) => {
  const [name, setName] = useState(userName);
  const [email, setEmail] = useState(userEmail);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(name, email);
    playJarvisSound('acknowledge');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#081020] border border-blue-900/80 rounded-2xl p-6 space-y-5 text-zinc-100 shadow-[0_0_30px_rgba(0,102,255,0.2)]">
        <div className="flex items-center justify-between pb-3 border-b border-blue-950/60">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">Profil Ma'lumotlarini Tahrirlash</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="text-zinc-300 font-medium">Ism / Foydalanuvchi nomi:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#040813] border border-blue-950 text-zinc-100 focus:outline-none focus:border-cyan-400 font-sans"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-zinc-300 font-medium">Elektron pochta (Email):</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#040813] border border-blue-950 text-zinc-100 focus:outline-none focus:border-cyan-400 font-sans"
              required
            />
          </div>

          <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-900/40 flex items-center justify-between">
            <span className="text-zinc-400">Tarif rejasi:</span>
            <span className="text-amber-400 font-bold flex items-center gap-1">
              <Crown className="w-3.5 h-3.5 fill-amber-400" />
              <span>Premium Lifetime</span>
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium cursor-pointer"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#0055ff] hover:bg-[#0044dd] text-white font-semibold cursor-pointer shadow-md"
            >
              Saqlash
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
