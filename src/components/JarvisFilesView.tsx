import React, { useState, useRef } from 'react';
import {
  Folder,
  FileText,
  Plus,
  Upload,
  Download,
  Trash2,
  HardDrive,
  Eye,
  Check,
} from 'lucide-react';
import { playJarvisSound, speakJarvis } from '../utils/jarvisVoice';

interface ManagedFile {
  id: string;
  name: string;
  size: string;
  updatedAt: string;
  content: string;
  isLocal?: boolean;
}

export const JarvisFilesView: React.FC = () => {
  const [files, setFiles] = useState<ManagedFile[]>([
    {
      id: 'f1',
      name: 'loyixa_rejasi.txt',
      size: '2.4 KB',
      updatedAt: '01:26',
      content: "1. J.A.R.V.I.S. tizimini kompyuter bilan integratsiya qilish.\n2. Root ruxsatlarni faollashtirish.\n3. Ovozli boshqaruvni yoqish.",
    },
    {
      id: 'f2',
      name: 'jarvis_config.json',
      size: '1.1 KB',
      updatedAt: '01:10',
      content: '{\n  "version": "3.8-flash",\n  "rootAccess": true,\n  "owner": "Temurbek",\n  "voiceEnabled": true\n}',
    },
    {
      id: 'f3',
      name: 'system_report.log',
      size: '4.8 KB',
      updatedAt: '00:45',
      content: "[00:45:10] Booting Jarvis Kernel...\n[00:45:12] Neural Gemini Flash Online\n[00:45:15] Computer Link Verified OK",
    },
  ]);

  const [selectedFile, setSelectedFile] = useState<ManagedFile | null>(files[0]);
  const [newFileName, setNewFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePickLocalFiles = () => {
    playJarvisSound('acknowledge');
    speakJarvis("Kompyuteringizdan fayl tanlang.");

    if (typeof window !== 'undefined' && (window as any).showOpenFilePicker) {
      (window as any)
        .showOpenFilePicker({ multiple: true })
        .then(async (handles: any[]) => {
          for (const handle of handles) {
            const file = await handle.getFile();
            const text = await file.text();
            const newF: ManagedFile = {
              id: `local-${Date.now()}-${Math.random()}`,
              name: file.name,
              size: `${(file.size / 1024).toFixed(1)} KB`,
              updatedAt: 'Hozirgina',
              content: text.slice(0, 10000),
              isLocal: true,
            };
            setFiles((prev) => [newF, ...prev]);
            setSelectedFile(newF);
          }
          speakJarvis("Fayllar J.A.R.V.I.S. tizimiga yuklandi.");
        })
        .catch(() => {
          // Fallback to hidden input
          fileInputRef.current?.click();
        });
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleNativeInputUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files;
    if (uploaded && uploaded.length > 0) {
      const file = uploaded[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = (event.target?.result as string) || '';
        const newF: ManagedFile = {
          id: `local-${Date.now()}`,
          name: file.name,
          size: `${(file.size / 1024).toFixed(1)} KB`,
          updatedAt: 'Hozirgina',
          content: text.slice(0, 10000),
          isLocal: true,
        };
        setFiles((prev) => [newF, ...prev]);
        setSelectedFile(newF);
        speakJarvis(`"${file.name}" fayli muvaffaqiyatli ochildi.`);
      };
      reader.readAsText(file);
    }
  };

  const handleCreateNewFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;
    const cleanName = newFileName.includes('.') ? newFileName : `${newFileName}.txt`;
    const newF: ManagedFile = {
      id: `file-${Date.now()}`,
      name: cleanName,
      size: '0.1 KB',
      updatedAt: 'Hozirgina',
      content: `# ${cleanName}\nJ.A.R.V.I.S. orqali yaratildi.\n`,
    };
    setFiles((prev) => [newF, ...prev]);
    setSelectedFile(newF);
    setNewFileName('');
    playJarvisSound('blip');
  };

  const handleDeleteFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    if (selectedFile?.id === id) {
      setSelectedFile(null);
    }
    playJarvisSound('blip');
  };

  return (
    <div className="flex-1 bg-[#050813] p-6 overflow-hidden flex flex-col space-y-4 text-zinc-100 select-none">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleNativeInputUpload}
        className="hidden"
      />

      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-blue-950/60">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Folder className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold text-white tracking-wide">Fayllar Boshqaruvi (Files)</h2>
          </div>
          <p className="text-xs text-zinc-400">
            Kompyuteringizdagi va J.A.R.V.I.S. xotirasidagi hujjatlar.
          </p>
        </div>

        {/* Real Computer File Picker Button */}
        <button
          onClick={handlePickLocalFiles}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md hover:scale-105"
        >
          <Upload className="w-4 h-4 text-black" />
          <span>Kompyuterdan Fayl Ochish</span>
        </button>
      </div>

      {/* Create New File bar */}
      <form onSubmit={handleCreateNewFile} className="flex gap-2">
        <input
          type="text"
          value={newFileName}
          onChange={(e) => setNewFileName(e.target.value)}
          placeholder="Yangi fayl nomi (masalan: hisobot.txt)..."
          className="flex-1 px-4 py-2 rounded-xl bg-[#081020] border border-blue-950 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-cyan-500 font-sans"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-xl bg-[#0055ff] hover:bg-[#0044dd] text-white font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Fayl Yaratish</span>
        </button>
      </form>

      {/* Split Pane: Files List & File Content Viewer */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 min-h-0 overflow-hidden">
        {/* Left: Files List */}
        <div className="rounded-2xl bg-[#081020] border border-blue-950/80 p-3 space-y-2 overflow-y-auto">
          <div className="text-xs font-bold text-zinc-400 px-2">Hujjatlar ({files.length})</div>
          {files.map((file) => {
            const isSel = selectedFile?.id === file.id;
            return (
              <div
                key={file.id}
                onClick={() => {
                  setSelectedFile(file);
                  playJarvisSound('blip');
                }}
                className={`p-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                  isSel
                    ? 'bg-[#0055ff]/20 border-blue-500 text-white'
                    : 'bg-[#0c1427] hover:bg-[#111e3c] border-blue-950/80 text-zinc-300'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileText className={`w-4 h-4 shrink-0 ${isSel ? 'text-cyan-300' : 'text-zinc-400'}`} />
                  <div className="min-w-0">
                    <div className="text-xs font-medium truncate">{file.name}</div>
                    <div className="text-[10px] text-zinc-500">{file.size} • {file.updatedAt}</div>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteFile(file.id);
                  }}
                  className="p-1 text-zinc-500 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Right: File Content Inspector / Editor */}
        <div className="md:col-span-2 rounded-2xl bg-[#081020] border border-blue-950/80 p-4 flex flex-col space-y-2 overflow-hidden">
          {selectedFile ? (
            <>
              <div className="flex items-center justify-between pb-2 border-b border-blue-950/60">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-white">{selectedFile.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-900">
                    {selectedFile.size}
                  </span>
                </div>
                <button
                  onClick={() => {
                    const blob = new Blob([selectedFile.content], { type: 'text/plain;charset=utf-8' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = selectedFile.name;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                  }}
                  className="p-1.5 rounded-lg bg-[#0e1933] hover:bg-[#142347] text-zinc-300 hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Yuklab olish</span>
                </button>
              </div>

              <textarea
                value={selectedFile.content}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedFile({ ...selectedFile, content: val });
                  setFiles((prev) =>
                    prev.map((f) => (f.id === selectedFile.id ? { ...f, content: val } : f))
                  );
                }}
                className="flex-1 w-full bg-[#040813] rounded-xl p-3 text-xs font-mono text-cyan-200 border border-blue-950 focus:outline-none focus:border-blue-700 resize-none"
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs text-zinc-500">
              Faylni ko'rish uchun chapdagi ro'yxatdan tanlang.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
