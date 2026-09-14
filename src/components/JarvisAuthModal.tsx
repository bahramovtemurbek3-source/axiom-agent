import React, { useState } from 'react';
import {
  Shield,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  X,
  Sparkles,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { UserProfile } from '../types';

interface JarvisAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: UserProfile | null;
  onAuthSuccess: (user: UserProfile, token: string) => void;
  onLogout?: () => void;
}

type AuthMode = 'login' | 'register' | 'forgot';

export const JarvisAuthModal: React.FC<JarvisAuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onAuthSuccess,
  onLogout,
}) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [identifier, setIdentifier] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    if (!identifier || !password) {
      setError('Username/email va parol talab qilinadi');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Kirish muvaffaqiyatsiz bo\'ldi');
      }
      localStorage.setItem('jarvis_token', data.token);
      onAuthSuccess(data.user, data.token);
      setSuccessMsg('Muvaffaqiyatli kirdingiz!');
      setTimeout(() => onClose(), 800);
    } catch (err: any) {
      setError(err.message || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!username || !email || !password) {
      setError('Barcha maydonlarni to\'ldiring');
      return;
    }
    if (password !== confirmPassword) {
      setError('Parollar bir-biriga mos kelmadi');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, displayName, password, confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Ro\'yxatdan o\'tish muvaffaqiyatsiz bo\'ldi');
      }
      localStorage.setItem('jarvis_token', data.token);
      onAuthSuccess(data.user, data.token);
      setSuccessMsg('Hisobingiz yaratildi va tizimga ulandi!');
      setTimeout(() => onClose(), 800);
    } catch (err: any) {
      setError(err.message || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    if (!email) {
      setError('Email manzilingizni kiriting');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setSuccessMsg(data.message || 'Parolni tiklash yo\'riqnomasi yuborildi');
    } catch (err: any) {
      setError(err.message || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#091122] border border-blue-600/30 rounded-2xl shadow-[0_0_50px_rgba(0,102,255,0.25)] overflow-hidden">
        {/* Glow header banner */}
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-cyan-400 to-blue-600 animate-pulse" />

        <div className="p-6">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header Title */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-100 tracking-wide flex items-center gap-2">
                <span>JARVIS Xavfsizlik Portali</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  Level 10
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                {mode === 'login' && 'Tizimga kirish va neyron interfeysni faollashtirish'}
                {mode === 'register' && 'Yangi operator hisobini yaratish'}
                {mode === 'forgot' && 'Parolni tiklash bo\'yicha so\'rov'}
              </p>
            </div>
          </div>

          {/* Current user badge if logged in */}
          {currentUser && (
            <div className="mb-5 p-3 rounded-xl bg-blue-950/40 border border-blue-800/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.displayName}
                  className="w-9 h-9 rounded-full object-cover border border-blue-400/40"
                />
                <div>
                  <div className="text-xs font-semibold text-zinc-200">{currentUser.displayName}</div>
                  <div className="text-[11px] text-zinc-400">@{currentUser.username} • {currentUser.email}</div>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="text-xs px-2.5 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 transition-colors"
              >
                Chiqish
              </button>
            </div>
          )}

          {/* Error & Success Messages */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-950/50 border border-red-800/50 text-red-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}
          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-950/50 border border-emerald-800/50 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Login Form */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">Username yoki Email</label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="temurbek yoki temurbek@gmail.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#060c18] border border-blue-900/50 text-zinc-100 text-sm focus:outline-none focus:border-blue-500 transition-colors placeholder:text-zinc-600"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-zinc-300">Parol</label>
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-xs text-blue-400 hover:underline"
                  >
                    Parolni unutdingizmi?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#060c18] border border-blue-900/50 text-zinc-100 text-sm focus:outline-none focus:border-blue-500 transition-colors placeholder:text-zinc-600"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,102,255,0.4)] disabled:opacity-50 transition-all cursor-pointer"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                <span>Tizimga Kirish</span>
              </button>

              <div className="pt-2 text-center text-xs text-zinc-400">
                Hisobingiz yo'qmi?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="text-blue-400 font-semibold hover:underline ml-1"
                >
                  Ro'yxatdan o'tish
                </button>
              </div>
            </form>
          )}

          {/* Register Form */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="temurbek"
                    className="w-full px-3 py-2 rounded-xl bg-[#060c18] border border-blue-900/50 text-zinc-100 text-xs focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Ko'rinish Ismi</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Temurbek"
                    className="w-full px-3 py-2 rounded-xl bg-[#060c18] border border-blue-900/50 text-zinc-100 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Email Manzil</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="boss@stark.com"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#060c18] border border-blue-900/50 text-zinc-100 text-xs focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Parol (kamida 6 belgi)</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-xl bg-[#060c18] border border-blue-900/50 text-zinc-100 text-xs focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Parolni Tasdiqlang</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-xl bg-[#060c18] border border-blue-900/50 text-zinc-100 text-xs focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,102,255,0.4)] disabled:opacity-50 transition-all cursor-pointer"
              >
                {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>Operator Sifatida Ro'yxatdan O'tish</span>
              </button>

              <div className="pt-2 text-center text-xs text-zinc-400">
                Hisobingiz bormi?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-blue-400 font-semibold hover:underline ml-1"
                >
                  Kirish
                </button>
              </div>
            </form>
          )}

          {/* Forgot Password */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <p className="text-xs text-zinc-400 leading-relaxed">
                Ro'yxatdan o'tgan email manzilingizni kiriting. Tizim sizga parolni tiklash bo'yicha maxfiy tokenni yuboradi.
              </p>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">Email Manzil</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="temurbek@gmail.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#060c18] border border-blue-900/50 text-zinc-100 text-sm focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                <span>Tiklash Xabarini Yuborish</span>
              </button>

              <div className="pt-1 text-center text-xs text-zinc-400">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-blue-400 hover:underline"
                >
                  Ortga: Kirish oynasiga qaytish
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
