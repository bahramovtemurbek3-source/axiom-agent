import React, { useState, useRef, useEffect } from 'react';
import { JarvisArcReactor } from './JarvisArcReactor';
import {
  MessageSquare,
  CheckSquare,
  Laptop,
  Folder,
  Sliders,
  Paperclip,
  Mic,
  MicOff,
  Send,
  ExternalLink,
  User,
  Sparkles,
  Check,
} from 'lucide-react';
import { playJarvisSound, speakJarvis } from '../utils/jarvisVoice';

export interface ChatMessageItem {
  id: string;
  sender: 'user' | 'jarvis';
  text: string;
  substeps?: string[];
  completedBadge?: boolean;
  time: string;
  embeddedCard?: {
    type: 'youtube' | 'folder' | 'google' | 'file';
    title: string;
    url?: string;
    subtitle?: string;
  };
}

interface JarvisCenterChatProps {
  messages: ChatMessageItem[];
  onSendMessage: (text: string, actionType?: 'chat' | 'task' | 'computer') => void;
  isProcessing?: boolean;
  isListening?: boolean;
  onToggleVoice?: () => void;
  onSelectPrompt?: (promptText: string) => void;
  onPillTabClick?: (tab: 'chat' | 'task' | 'computer' | 'files' | 'more') => void;
  connectedDeviceName?: string;
  hostOS?: 'macOS' | 'Windows' | 'Linux';
}

export const JarvisCenterChat: React.FC<JarvisCenterChatProps> = ({
  messages,
  onSendMessage,
  isProcessing = false,
  isListening = false,
  onToggleVoice,
  onSelectPrompt,
  onPillTabClick,
  connectedDeviceName = 'MacBook-M1',
  hostOS = 'macOS',
}) => {
  const [inputText, setInputText] = useState('');
  const [activePill, setActivePill] = useState<'chat' | 'task' | 'computer' | 'files' | 'more'>('chat');
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom of chat
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isProcessing]);

  const examplePrompts = [
    "Google'da ma'lumot qidir",
    "Matn yozib ber",
    "Faylni och",
    "Kompyuteringda papka yarat",
    "YouTube'dan video yuklab ol",
    "Tizim ma'lumotlarini ko'rsat",
  ];

  const handleSend = () => {
    const trimmed = inputText.trim();
    if (!trimmed || isProcessing) return;
    onSendMessage(trimmed);
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      playJarvisSound('blip');
      onSendMessage(`Kompyuterdan fayl yuklandi: "${file.name}" (${(file.size / 1024).toFixed(1)} KB). Ushbu faylni tahlil qiling.`);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#050813] h-full overflow-hidden select-none relative">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileAttach}
        className="hidden"
      />

      {/* Main Scrollable Canvas */}
      <div
        ref={chatScrollRef}
        className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-8 scroll-smooth"
      >
        {/* TOP HERO SECTION (Matching Screenshot 1:1) */}
        <div className="flex flex-col items-center justify-center text-center pt-2 pb-4 space-y-4 max-w-2xl mx-auto">
          {/* Glowing Arc Reactor Centerpiece */}
          <div className="cursor-pointer group" onClick={() => playJarvisSound('wake')}>
            <JarvisArcReactor size={110} pulsing={true} />
          </div>

          {/* Heading & Subtitle */}
          <div className="space-y-1.5">
            <h1 className="text-3xl font-extrabold tracking-wider text-white font-sans">
              JARVIS AI
            </h1>
            <p className="text-base text-zinc-200 font-medium font-sans">
              Buyruq ber. Men bajaraman.
            </p>
            <p className="text-xs text-zinc-400 font-sans">
              Gemini AI + Kompyutering bilan quvvatlangan.
            </p>
          </div>

          {/* Quick Action Pills Under Hero */}
          <div className="flex items-center gap-2 flex-wrap justify-center pt-1">
            {[
              { id: 'chat' as const, label: 'Chat', icon: MessageSquare },
              { id: 'task' as const, label: 'Task', icon: CheckSquare },
              { id: 'computer' as const, label: 'Computer Control', icon: Laptop },
              { id: 'files' as const, label: 'Files', icon: Folder },
              { id: 'more' as const, label: 'More', icon: Sliders },
            ].map((pill) => {
              const Icon = pill.icon;
              const isActive = activePill === pill.id;
              return (
                <button
                  key={pill.id}
                  onClick={() => {
                    setActivePill(pill.id);
                    onPillTabClick?.(pill.id);
                    playJarvisSound('blip');
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 border transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#0055ff] text-white border-blue-500 shadow-[0_0_12px_rgba(0,85,255,0.4)]'
                      : 'bg-[#0a1224] hover:bg-[#111e3b] text-zinc-300 border-blue-950 hover:border-blue-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{pill.label}</span>
                </button>
              );
            })}
          </div>

          {/* Misollar: Section (6 Chips in 2x3 Grid) */}
          <div className="w-full pt-3 text-left space-y-2">
            <div className="text-xs font-semibold text-zinc-400 pl-1">Misollar:</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {examplePrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    playJarvisSound('blip');
                    if (onSelectPrompt) onSelectPrompt(prompt);
                    else onSendMessage(prompt);
                  }}
                  className="p-3 rounded-xl bg-[#081020] hover:bg-[#0e1c3a] border border-blue-950/80 hover:border-cyan-500/40 text-left text-xs text-zinc-300 hover:text-white transition-all cursor-pointer truncate shadow-sm"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* CHAT MESSAGES STREAM */}
        <div className="space-y-4 max-w-3xl mx-auto pb-4">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';

            if (isUser) {
              return (
                <div key={msg.id} className="flex items-end justify-end gap-2.5">
                  {/* User Bubble */}
                  <div className="max-w-lg rounded-2xl rounded-tr-sm px-4 py-2.5 bg-[#0055ff] text-white shadow-[0_0_15px_rgba(0,85,255,0.25)] space-y-1">
                    <p className="text-sm font-sans leading-relaxed">{msg.text}</p>
                    <div className="text-[10px] text-blue-200 text-right font-mono">
                      {msg.time}
                    </div>
                  </div>

                  {/* User Icon */}
                  <div className="w-8 h-8 rounded-full bg-[#0c1427] border border-blue-900/60 flex items-center justify-center text-zinc-300 shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                </div>
              );
            }

            // Jarvis AI Message
            return (
              <div key={msg.id} className="flex items-start gap-3">
                {/* Jarvis Arc Reactor Avatar */}
                <div className="shrink-0 mt-0.5">
                  <JarvisArcReactor size={34} pulsing={false} />
                </div>

                {/* Jarvis Card Container */}
                <div className="max-w-xl rounded-2xl rounded-tl-sm p-4 bg-[#081020] border border-blue-950/80 text-zinc-200 space-y-2.5 shadow-md">
                  {/* Primary text */}
                  <p className="text-sm font-sans leading-relaxed">{msg.text}</p>

                  {/* Substeps check marks */}
                  {msg.substeps && msg.substeps.length > 0 && (
                    <div className="space-y-1 text-xs text-zinc-300">
                      {msg.substeps.map((sub, sIdx) => (
                        <div key={sIdx} className="flex items-center gap-1.5 text-zinc-300">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{sub}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Completed Badge & Timestamp */}
                  <div className="flex items-center justify-between pt-1 text-xs border-t border-blue-950/40">
                    {msg.completedBadge !== false ? (
                      <span className="text-emerald-400 font-medium text-[11px] flex items-center gap-1">
                        <span>Bajarildi</span>
                        <span>✓</span>
                      </span>
                    ) : (
                      <span className="text-cyan-400 text-[11px]">J.A.R.V.I.S. Core</span>
                    )}
                    <span className="text-[10px] text-zinc-500 font-mono">{msg.time}</span>
                  </div>

                  {/* Embedded Rich Card (e.g. YouTube Card in Screenshot) */}
                  {msg.embeddedCard && (
                    <div className="pt-1">
                      {msg.embeddedCard.type === 'youtube' && (
                        <div
                          onClick={() => {
                            if (msg.embeddedCard?.url) {
                              window.open(msg.embeddedCard.url, '_blank');
                            }
                          }}
                          className="p-3 rounded-xl bg-[#0d1730] hover:bg-[#122044] border border-blue-900/60 flex items-center justify-between cursor-pointer transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            {/* Red YouTube Logo Box */}
                            <div className="w-9 h-9 rounded-lg bg-red-600 flex items-center justify-center text-white shrink-0 shadow-sm">
                              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                              </svg>
                            </div>
                            <div>
                              <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                                {msg.embeddedCard.title}
                              </div>
                              <div className="text-[11px] text-zinc-400 font-mono">
                                {msg.embeddedCard.url || 'https://www.youtube.com'}
                              </div>
                            </div>
                          </div>

                          <ExternalLink className="w-4 h-4 text-zinc-400 group-hover:text-cyan-300 transition-colors" />
                        </div>
                      )}

                      {msg.embeddedCard.type === 'folder' && (
                        <div
                          onClick={() => {
                            if (onPillTabClick) onPillTabClick('files');
                          }}
                          className="p-3 rounded-xl bg-[#0d1730] hover:bg-[#122044] border border-blue-900/60 flex items-center justify-between cursor-pointer transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                              <Folder className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                                {msg.embeddedCard.title}
                              </div>
                              <div className="text-[11px] text-zinc-400 font-mono">
                                {msg.embeddedCard.subtitle || `${hostOS === 'Windows' ? 'C:\\Users\\Temurbek' : '/Users/temurbek'}`}
                              </div>
                            </div>
                          </div>
                          <ExternalLink className="w-4 h-4 text-zinc-400 group-hover:text-cyan-300 transition-colors" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Processing Indicator */}
          {isProcessing && (
            <div className="flex items-center gap-3 text-cyan-400 text-xs font-sans pl-2 animate-pulse">
              <JarvisArcReactor size={26} pulsing={true} />
              <span>J.A.R.V.I.S. buyruqni bajarmoqda...</span>
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM INPUT DOCK (Matching Screenshot 1:1) */}
      <div className="p-4 md:px-8 bg-[#060a14] border-t border-blue-950/60 shrink-0">
        <div className="max-w-3xl mx-auto rounded-2xl bg-[#070d1e] border border-blue-900/50 p-2 shadow-[0_0_20px_rgba(6,182,212,0.1)] space-y-2">
          {/* Main Input Field */}
          <div className="px-2 pt-1">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Task yozing yoki Jarvis bilan suhbatlashing..."
              className="w-full bg-transparent text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none font-sans"
            />
          </div>

          {/* Action Tools Row & Send Button */}
          <div className="flex items-center justify-between pt-1">
            {/* Left Action Buttons: Attachment, Task, Computer, Voice */}
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-[#0e1933] transition-colors cursor-pointer"
                title="Fayl biriktirish"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  playJarvisSound('blip');
                  setInputText('Yangi vazifa yarat: ');
                }}
                className="px-2.5 py-1.5 rounded-xl text-xs font-medium text-zinc-300 hover:text-white hover:bg-[#0e1933] flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <CheckSquare className="w-3.5 h-3.5 text-blue-400" />
                <span>Task</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playJarvisSound('blip');
                  if (onPillTabClick) onPillTabClick('computer');
                }}
                className="px-2.5 py-1.5 rounded-xl text-xs font-medium text-zinc-300 hover:text-white hover:bg-[#0e1933] flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Laptop className="w-3.5 h-3.5 text-cyan-400" />
                <span>Computer</span>
              </button>

              <button
                type="button"
                onClick={onToggleVoice}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                  isListening
                    ? 'bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse'
                    : 'text-zinc-300 hover:text-white hover:bg-[#0e1933]'
                }`}
                title={isListening ? "Ovozni to'xtatish" : "Ovoz bilan gapirish"}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-3.5 h-3.5 text-red-400" />
                    <span className="text-red-300">Eshitilmoqda...</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Voice</span>
                  </>
                )}
              </button>
            </div>

            {/* Right Blue Send Button */}
            <button
              type="button"
              onClick={handleSend}
              disabled={!inputText.trim() || isProcessing}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                inputText.trim() && !isProcessing
                  ? 'bg-gradient-to-r from-[#0055ff] to-[#0284c7] hover:from-[#0044dd] hover:to-[#0369a1] text-white shadow-[0_0_15px_rgba(0,85,255,0.6)] hover:scale-105'
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
