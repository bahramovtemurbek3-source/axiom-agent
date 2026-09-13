import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import {
  Send,
  Mic,
  Volume2,
  Sparkles,
  Bot,
  User,
  Copy,
  Check,
  Zap,
  Trash2,
  Globe,
  Brain,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Info,
} from 'lucide-react';
import { JarvisMessage } from '../types';
import { playJarvisSound, speakJarvis } from '../utils/jarvisVoice';

interface JarvisSimpleChatProps {
  messages: JarvisMessage[];
  onSendMessage: (text: string, isVoice?: boolean) => void;
  isListening: boolean;
  onToggleListening: () => void;
  voiceMuted: boolean;
  onToggleVoiceMute: () => void;
  isProcessing: boolean;
  engineSource: string;
  onClearMessages: () => void;
  webSearchEnabled: boolean;
  onToggleWebSearch: () => void;
  deepThinkEnabled: boolean;
  onToggleDeepThink: () => void;
}

const QUICK_ACTIONS = [
  { label: '🧠 Kiberxavfsizlik tahlili', query: "Kiberxavfsizlik va zamonaviy tahdidlar haqida chuqur tahliliy ma'lumot ber" },
  { label: '🌐 AI yangiliklari', query: "Bugungi sun'iy intellekt va texnologiya sohasidagi so'nggi yangiliklar nimalardan iborat?" },
  { label: '⚡ Python vs Rust', query: "Python va Rust tillarini ishlash tezligi va xotira boshqaruvi bo'yicha taqqoslab ber" },
  { label: '🔍 Tizim diagnostikasi', query: "Tizim resurslari, CPU, RAM va xotirani chuqur diagnostika qil" },
  { label: '🧹 Keshni tozalash', query: "Vaqtinchalik fayllar va keshni tekshirib tozalash buyrug'ini ber" },
];

export const JarvisSimpleChat: React.FC<JarvisSimpleChatProps> = ({
  messages,
  onSendMessage,
  isListening,
  onToggleListening,
  voiceMuted,
  onToggleVoiceMute,
  isProcessing,
  engineSource,
  onClearMessages,
  webSearchEnabled,
  onToggleWebSearch,
  deepThinkEnabled,
  onToggleDeepThink,
}) => {
  const [inputText, setInputText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedThoughts, setExpandedThoughts] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isProcessing) return;
    playJarvisSound('blip');
    onSendMessage(inputText.trim(), false);
    setInputText('');
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    playJarvisSound('blip');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeak = (text: string) => {
    playJarvisSound('acknowledge');
    speakJarvis(text);
  };

  const toggleThought = (msgId: string) => {
    setExpandedThoughts((prev) => ({
      ...prev,
      [msgId]: !prev[msgId],
    }));
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950/85 border border-cyan-500/25 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
      {/* Header bar */}
      <div className="px-4 py-3 bg-zinc-900/90 border-b border-cyan-500/20 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center text-cyan-300 font-mono font-bold shadow-[0_0_12px_rgba(6,182,212,0.3)]">
            <Sparkles className="w-4 h-4 text-cyan-300" />
          </div>
          <div>
            <div className="text-xs font-mono font-bold text-cyan-300 flex items-center gap-2">
              <span>GEMINI 3.6 FLASH • J.A.R.V.I.S. INTELLIGENCE</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-[10px] text-zinc-400 font-mono">
              O'zbekcha / Ruscha / Inglizcha • Chuqur tahlil & Web qidiruv
            </p>
          </div>
        </div>

        {/* Feature Toggles & Controls */}
        <div className="flex items-center gap-1.5">
          {/* Web Search Toggle */}
          <button
            type="button"
            onClick={() => {
              playJarvisSound('blip');
              onToggleWebSearch();
            }}
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
              webSearchEnabled
                ? 'bg-cyan-950/90 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
            title="Real vaqtdagi internet qidiruvini yoqish/o'chirish"
          >
            <Globe className={`w-3.5 h-3.5 ${webSearchEnabled ? 'text-cyan-400 animate-pulse' : 'text-zinc-500'}`} />
            <span>Web Search</span>
            <span className={`w-1.5 h-1.5 rounded-full ${webSearchEnabled ? 'bg-cyan-400' : 'bg-zinc-600'}`} />
          </button>

          {/* Deep Think Toggle */}
          <button
            type="button"
            onClick={() => {
              playJarvisSound('blip');
              onToggleDeepThink();
            }}
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
              deepThinkEnabled
                ? 'bg-amber-950/80 border-amber-400 text-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.3)]'
                : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
            title="Mantiqiy chuqur tahlil (Deep Think) rejimini yoqish/o'chirish"
          >
            <Brain className={`w-3.5 h-3.5 ${deepThinkEnabled ? 'text-amber-400 animate-pulse' : 'text-zinc-500'}`} />
            <span>Deep Think</span>
            <span className={`w-1.5 h-1.5 rounded-full ${deepThinkEnabled ? 'bg-amber-400' : 'bg-zinc-600'}`} />
          </button>

          <button
            onClick={onClearMessages}
            className="p-1.5 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
            title="Suhbat tarixini tozalash"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 font-sans text-sm">
        <AnimatePresence initial={false}>
          {messages.map((msg) => {
            const isJarvis = msg.sender === 'jarvis';
            const isSystem = msg.sender === 'system';

            if (isSystem) {
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-center my-1.5"
                >
                  <span className="inline-flex items-center gap-1.5 bg-zinc-900/90 border border-cyan-500/30 text-cyan-300 text-[11px] font-mono px-3 py-1 rounded-full shadow-sm">
                    <Zap className="w-3 h-3 text-cyan-400" />
                    {msg.text}
                  </span>
                </motion.div>
              );
            }

            const isThoughtOpen = expandedThoughts[msg.id];

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex items-start gap-2.5 ${isJarvis ? 'justify-start' : 'justify-end'}`}
              >
                {isJarvis && (
                  <div className="w-8 h-8 rounded-xl bg-cyan-950/90 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0 shadow-[0_0_12px_rgba(6,182,212,0.25)] mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[88%] sm:max-w-[82%] rounded-2xl p-4 shadow-lg relative ${
                    isJarvis
                      ? 'bg-zinc-900/95 border border-cyan-500/30 text-zinc-100 rounded-tl-sm'
                      : 'bg-gradient-to-r from-cyan-600 to-sky-600 text-white rounded-tr-sm shadow-cyan-900/30'
                  }`}
                >
                  {/* Message meta header */}
                  <div className="flex items-center justify-between gap-3 text-[11px] mb-2 opacity-80 font-mono pb-1.5 border-b border-white/10">
                    <span className="font-bold uppercase tracking-wider flex items-center gap-1.5">
                      {isJarvis ? (
                        <>
                          <span className="text-cyan-300">J.A.R.V.I.S.</span>
                          <span className="text-[10px] text-zinc-400">({msg.modelUsed || engineSource})</span>
                        </>
                      ) : (
                        <span>Siz {msg.isVoice ? '(🎤 Ovoz)' : ''}</span>
                      )}
                    </span>
                    <span className="text-[10px]">{msg.timestamp}</span>
                  </div>

                  {/* Deep Thinking Breakdown (if present) */}
                  {msg.thought && (
                    <div className="mb-3 rounded-xl border border-amber-500/30 bg-amber-950/30 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => toggleThought(msg.id)}
                        className="w-full px-3 py-2 text-left flex items-center justify-between text-xs font-mono text-amber-300 hover:bg-amber-900/20 transition-colors"
                      >
                        <span className="flex items-center gap-1.5 font-semibold">
                          <Brain className="w-3.5 h-3.5 text-amber-400" />
                          Chuqur fikrlash jarayoni (Deep Thought)
                        </span>
                        {isThoughtOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                      </button>
                      {isThoughtOpen && (
                        <div className="p-3 border-t border-amber-500/20 text-xs text-amber-200/80 font-mono whitespace-pre-wrap leading-relaxed bg-black/40">
                          {msg.thought}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Message body rendered with rich Markdown */}
                  <div className="markdown-body text-zinc-100 text-sm leading-relaxed select-text space-y-2 prose prose-invert max-w-none prose-p:my-1 prose-headings:text-cyan-300 prose-headings:my-2 prose-code:text-cyan-300 prose-code:bg-zinc-800/80 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-zinc-950 prose-pre:border prose-pre:border-cyan-500/20">
                    <Markdown>{msg.text}</Markdown>
                  </div>

                  {/* Web Search Sources Citations */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-cyan-500/20">
                      <div className="flex items-center gap-1.5 text-[11px] font-mono text-cyan-400 mb-1.5">
                        <Globe className="w-3.5 h-3.5" />
                        <span>Web manbalari va faktlar:</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.sources.map((src, idx) => (
                          <a
                            key={idx}
                            href={src.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-950/70 hover:bg-cyan-900/80 border border-cyan-500/30 text-cyan-300 text-[11px] font-mono transition-colors max-w-[240px] truncate"
                            title={src.snippet || src.title}
                          >
                            <span className="truncate">{src.title}</span>
                            <ExternalLink className="w-3 h-3 shrink-0 opacity-70" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions for Jarvis response */}
                  {isJarvis && (
                    <div className="flex items-center gap-2 mt-3 pt-2 border-t border-zinc-800/80">
                      <button
                        onClick={() => handleSpeak(msg.text)}
                        className="inline-flex items-center gap-1 text-[11px] font-mono text-cyan-400 hover:text-cyan-300 bg-cyan-950/60 hover:bg-cyan-900/60 px-2.5 py-1 rounded-lg border border-cyan-500/30 transition-colors cursor-pointer"
                        title="Ovoz bilan eshitish"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Ovoz</span>
                      </button>

                      <button
                        onClick={() => handleCopy(msg.id, msg.text)}
                        className="inline-flex items-center gap-1 text-[11px] font-mono text-zinc-400 hover:text-zinc-200 bg-zinc-800/60 px-2.5 py-1 rounded-lg border border-zinc-700/50 transition-colors cursor-pointer"
                        title="Nusxalash"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Nusxalandi</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Nusxa</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {!isJarvis && (
                  <div className="w-8 h-8 rounded-xl bg-cyan-800/80 border border-cyan-500/50 flex items-center justify-center text-white shrink-0 shadow-md mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Processing / Thinking indicator */}
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2.5"
          >
            <div className="w-8 h-8 rounded-xl bg-cyan-950/90 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-zinc-900/90 border border-cyan-500/30 rounded-2xl rounded-tl-sm p-3.5 text-xs font-mono text-cyan-300 flex items-center gap-2.5 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>
                {webSearchEnabled
                  ? "Web qidiruv va Gemini chuqur tahlili o'tkazilmoqda..."
                  : deepThinkEnabled
                  ? "Gemini Deep Thinking mantiqiy xulosalar chiqarmoqda..."
                  : "Gemini 3.6 Flash savolingizni tahlil qilmoqda..."}
              </span>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Action Chips */}
      <div className="px-4 py-2 bg-zinc-900/70 border-t border-cyan-500/15 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-[10px] font-mono text-cyan-400/80 shrink-0 flex items-center gap-1">
          <Zap className="w-3 h-3" />
          Tezkor savollar:
        </span>
        {QUICK_ACTIONS.map((action, i) => (
          <button
            key={i}
            onClick={() => {
              playJarvisSound('blip');
              onSendMessage(action.query, false);
            }}
            disabled={isProcessing}
            className="whitespace-nowrap px-2.5 py-1 rounded-full text-xs font-mono bg-zinc-800/80 hover:bg-cyan-950/70 text-zinc-300 hover:text-cyan-300 border border-zinc-700/60 hover:border-cyan-500/40 transition-all cursor-pointer shadow-sm active:scale-95 disabled:opacity-50"
          >
            {action.label}
          </button>
        ))}
      </div>

      {/* Input controls form */}
      <form onSubmit={handleSubmit} className="p-3 bg-zinc-950 border-t border-cyan-500/20 flex items-center gap-2">
        {/* Voice Mic Button */}
        <button
          type="button"
          id="btn-voice-mic-input"
          onClick={onToggleListening}
          className={`relative p-3 rounded-xl border font-mono flex items-center justify-center transition-all duration-200 cursor-pointer ${
            isListening
              ? 'bg-cyan-500 text-black border-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.8)] scale-105'
              : 'bg-zinc-900 hover:bg-zinc-800 text-cyan-400 border-cyan-500/30 hover:border-cyan-400'
          }`}
          title={isListening ? "Ovozni to'xtatish" : "Ovoz orqali gapirish"}
        >
          {isListening ? (
            <>
              <Mic className="w-5 h-5 animate-pulse" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
            </>
          ) : (
            <Mic className="w-5 h-5" />
          )}
        </button>

        {/* Text Input */}
        <input
          id="input-jarvis-prompt"
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={
            isListening
              ? "Eshitilmoqda... gapiring..."
              : "Jarvisga har qanday savol bering (chuqur tahlil, kod, yangiliklar)..."
          }
          disabled={isProcessing}
          className="flex-1 bg-zinc-900/90 border border-cyan-500/30 focus:border-cyan-400 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-cyan-400/50 transition-all font-sans"
        />

        {/* Send Button */}
        <button
          type="submit"
          id="btn-jarvis-send"
          disabled={!inputText.trim() || isProcessing}
          className="p-3 bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-950 font-bold rounded-xl flex items-center justify-center transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] cursor-pointer"
          title="Yuborish"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};
