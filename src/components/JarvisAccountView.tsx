import React, { useState } from 'react';
import {
  User,
  Shield,
  Key,
  Calendar,
  Clock,
  Globe,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  LogOut,
  Save,
  Laptop,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { UserProfile } from '../types';

interface JarvisAccountViewProps {
  currentUser: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
  onLogout: () => void;
  onOpenAuthModal: () => void;
}

export const JarvisAccountView: React.FC<JarvisAccountViewProps> = ({
  currentUser,
  onUpdateUser,
  onLogout,
  onOpenAuthModal,
}) => {
  // Profile edit state
  const [displayName, setDisplayName] = useState(currentUser.displayName || '');
  const [bio, setBio] = useState(currentUser.bio || '');
  const [avatar, setAvatar] = useState(currentUser.avatar || '');
  const [language, setLanguage] = useState(currentUser.language || 'uz');
  const [timezone, setTimezone] = useState(currentUser.timezone || 'Asia/Tashkent');

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdSuccess, setPwdSuccess] = useState<string | null>(null);
  const [pwdError, setPwdError] = useState<string | null>(null);

  // Profile save state
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Delete account confirmation
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccess(null);
    setProfileError(null);

    try {
      const token = localStorage.getItem('jarvis_token');
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ displayName, bio, avatar, language, timezone }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Profilni yangilashda xatolik');
      }
      onUpdateUser(data.user);
      setProfileSuccess('Profil ma\'lumotlari muvaffaqiyatli saqlandi!');
      setTimeout(() => setProfileSuccess(null), 4000);
    } catch (err: any) {
      setProfileError(err.message || 'Xatolik yuz berdi');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdLoading(true);
    setPwdSuccess(null);
    setPwdError(null);

    if (newPassword !== confirmPassword) {
      setPwdError('Yangi parollar mos kelmadi');
      setPwdLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('jarvis_token');
      const res = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Parolni o\'zgartirishda xatolik');
      }
      setPwdSuccess('Parol muvaffaqiyatli o\'zgartirildi!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPwdSuccess(null), 4000);
    } catch (err: any) {
      setPwdError(err.message || 'Xatolik yuz berdi');
    } finally {
      setPwdLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') {
      setDeleteError('Tasdiqlash uchun aynan "DELETE" so\'zini kiriting');
      return;
    }

    setDeleteLoading(true);
    try {
      const token = localStorage.getItem('jarvis_token');
      const res = await fetch('/api/user/account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ confirmation: 'DELETE' }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Hisobni o\'chirishda xatolik');
      }
      localStorage.removeItem('jarvis_token');
      onLogout();
    } catch (err: any) {
      setDeleteError(err.message || 'Xatolik');
      setDeleteLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-[#050913] text-zinc-100 p-6 overflow-y-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-5 border-b border-blue-950/60">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <img
              src={avatar || currentUser.avatar}
              alt={currentUser.displayName}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-blue-500/50 shadow-[0_0_20px_rgba(0,102,255,0.3)]"
            />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[#050913] flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <span>{currentUser.displayName}</span>
              <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded-full bg-blue-500/20 text-cyan-400 border border-blue-500/30">
                Primary Operator
              </span>
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              @{currentUser.username} • {currentUser.email}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenAuthModal}
            className="px-3.5 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs font-medium border border-blue-500/30 flex items-center gap-2 transition-all cursor-pointer"
          >
            <User className="w-3.5 h-3.5" />
            <span>Hisobni Almashtirish</span>
          </button>
          <button
            onClick={onLogout}
            className="px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium border border-red-500/30 flex items-center gap-2 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Chiqish</span>
          </button>
        </div>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Profile & Password */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section: Profile Info */}
          <div className="p-5 rounded-2xl bg-[#081124] border border-blue-950/80 shadow-md space-y-4">
            <div className="flex items-center gap-2.5 text-sm font-semibold text-white">
              <User className="w-4 h-4 text-cyan-400" />
              <span>Profil Ma'lumotlari</span>
            </div>

            {profileSuccess && (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{profileSuccess}</span>
              </div>
            )}
            {profileError && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/40 text-red-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span>{profileError}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Ko'rinish Ismi (Display Name)</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#040813] border border-blue-900/40 text-zinc-100 focus:outline-none focus:border-blue-500"
                    placeholder="Temurbek"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Avatar Rasmi (URL)</label>
                  <input
                    type="text"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#040813] border border-blue-900/40 text-zinc-100 focus:outline-none focus:border-blue-500"
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Bio & Vazifa Tavsifi</label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#040813] border border-blue-900/40 text-zinc-100 focus:outline-none focus:border-blue-500 resize-none"
                  placeholder="Axiom Agent Owner & Lead Developer..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Afzal Ko'rilgan Til</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#040813] border border-blue-900/40 text-zinc-100 focus:outline-none focus:border-blue-500"
                  >
                    <option value="uz">O'zbek tili (Uzbek)</option>
                    <option value="en">English (US/UK)</option>
                    <option value="ru">Русский язык (Russian)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Vaqt Mintaqasi (Timezone)</label>
                  <input
                    type="text"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#040813] border border-blue-900/40 text-zinc-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium flex items-center gap-2 shadow-[0_0_15px_rgba(0,102,255,0.3)] transition-all cursor-pointer"
                >
                  {savingProfile ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>O'zgarishlarni Saqlash</span>
                </button>
              </div>
            </form>
          </div>

          {/* Section: Change Password */}
          <div className="p-5 rounded-2xl bg-[#081124] border border-blue-950/80 shadow-md space-y-4">
            <div className="flex items-center gap-2.5 text-sm font-semibold text-white">
              <Key className="w-4 h-4 text-cyan-400" />
              <span>Parolni O'zgartirish</span>
            </div>

            {pwdSuccess && (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{pwdSuccess}</span>
              </div>
            )}
            {pwdError && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/40 text-red-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span>{pwdError}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-zinc-300 font-medium mb-1">Amaldagi Parol</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-xl bg-[#040813] border border-blue-900/40 text-zinc-100 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Yangi Parol (min 6 belgi)</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 rounded-xl bg-[#040813] border border-blue-900/40 text-zinc-100 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Yangi Parolni Tasdiqlang</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 rounded-xl bg-[#040813] border border-blue-900/40 text-zinc-100 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={pwdLoading}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium flex items-center gap-2 transition-all cursor-pointer"
                >
                  {pwdLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Key className="w-3.5 h-3.5" />}
                  <span>Parolni Yangilash</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right 1 Col: Account Metadata, Active Sessions & Danger Zone */}
        <div className="space-y-6">
          {/* Metadata Card */}
          <div className="p-5 rounded-2xl bg-[#081124] border border-blue-950/80 shadow-md space-y-3.5 text-xs">
            <div className="text-sm font-semibold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-cyan-400" />
              <span>Hisob Holati</span>
            </div>

            <div className="space-y-2.5 pt-1 text-zinc-400">
              <div className="flex items-center justify-between pb-2 border-b border-blue-950/60">
                <span className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-blue-400" />
                  <span>Yaratilgan sana</span>
                </span>
                <span className="text-zinc-200 font-mono">
                  {new Date(currentUser.createdAt || Date.now()).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-blue-950/60">
                <span className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Oxirgi faollik</span>
                </span>
                <span className="text-emerald-400 font-mono">Hozir online</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-sky-400" />
                  <span>Ruxsat darajasi</span>
                </span>
                <span className="text-blue-400 font-semibold font-mono">ROOT / UNRESTRICTED</span>
              </div>
            </div>
          </div>

          {/* Active Sessions */}
          <div className="p-5 rounded-2xl bg-[#081124] border border-blue-950/80 shadow-md space-y-3.5 text-xs">
            <div className="text-sm font-semibold text-white flex items-center gap-2">
              <Laptop className="w-4 h-4 text-cyan-400" />
              <span>Faol Seanslar (Sessions)</span>
            </div>

            <div className="p-3 rounded-xl bg-[#040813] border border-blue-900/40 space-y-1.5">
              <div className="flex items-center justify-between text-zinc-200 font-medium">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Joriy Brauzer Sessiyasi</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">Faol</span>
              </div>
              <p className="text-[11px] text-zinc-400">
                IP: 127.0.0.1 • Web Dashboard v2.5.0 • So'nggi so'rov: bir necha soniya oldin
              </p>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="p-5 rounded-2xl bg-red-950/20 border border-red-900/40 shadow-md space-y-3.5 text-xs">
            <div className="text-sm font-semibold text-red-400 flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              <span>Xavfli Hudud (Danger Zone)</span>
            </div>

            <p className="text-zinc-400 text-[11px] leading-relaxed">
              Hisobni o'chirish barcha shaxsiy ma'lumotlar, vazifalar tarixi, suhbatlar va xotira yozuvlarini qaytarib bo'lmaydigan tarzda tozalaydi.
            </p>

            <button
              onClick={() => setShowDeleteModal(true)}
              className="w-full py-2 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-medium transition-colors cursor-pointer"
            >
              Hisobni butunlay o'chirish...
            </button>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md p-6 rounded-2xl bg-[#0d0608] border border-red-800/60 shadow-[0_0_50px_rgba(255,0,0,0.25)] space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <div className="p-2 rounded-xl bg-red-500/20">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold">Hisobni o'chirishni tasdiqlaysizmi?</h3>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Bu amal barcha vazifalaringiz, xotiralar va suhbatlar tarixini o'chiradi. Davom etish uchun quyidagi maydonga katta harflar bilan <strong className="text-red-400">DELETE</strong> so'zini yozing:
            </p>

            {deleteError && (
              <div className="p-2.5 rounded-lg bg-red-950/60 border border-red-800 text-red-300 text-xs">
                {deleteError}
              </div>
            )}

            <input
              type="text"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="DELETE"
              className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-red-800/60 text-white text-sm font-mono focus:outline-none focus:border-red-500"
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirm('');
                  setDeleteError(null);
                }}
                className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white text-xs cursor-pointer"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteLoading || deleteConfirm !== 'DELETE'}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold disabled:opacity-40 transition-colors cursor-pointer"
              >
                {deleteLoading ? 'O\'chirilmoqda...' : 'O\'chirishni tasdiqlash'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
