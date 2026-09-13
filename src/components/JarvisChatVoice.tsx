import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Volume2, VolumeX, Sparkles, Terminal, Play, Bot, User, Radio } from 'lucide-react';
import { JarvisMessage } from '../types';
import { playJarvisSound, speakJarvis } from '../utils/jarvisVoice';

interface JarvisChatVoiceProps {
  messages: JarvisMessage[];
  onSendMessage: (text: string, isVoice?: boolean) => void;
  isListening: boolean;
  onToggleListening: () => void;
  voiceMuted: boolean;
  onToggleVoiceMute: () => void;
  onExecuteAsTask: (taskText: string) => void;
  isProcessing: boolean;
}

export const JarvisChatVoice: React.FC<JarvisChatVoiceProps> = ({
  messages,
  onSendMessage,
  isListening,
  onToggleListening,
  voiceMuted,
  onToggleVoiceMute,
  onExecuteAsTask,
  isProcessing,
}) => {
  const [inputText, setInputText] = useState('');
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

  return (
    <div className="flex flex-col h-full bg-zinc-950/90 border border-cyan-500/20 rounded-xl overflow-hidden shadow-xl">
      {/* Chat Header */}
      <div className="bg-zinc-900/90 border-b border-cyan-500/20 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-400/40 flex items-center justify-center text-cyan-300 font-mono font-bold shadow-[0_0_10px_rgba(6,182,212,0.3)]">
            J
          </div>
          <div>
            <div className="text-xs font-mono font-bold text-cyan-300 flex items-center gap-2">
              <span>JARVIS NEURAL CHAT & VOICE</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <div className="text-[10px] text-zinc-400 font-mono">
              Speech Synthesis • STT Neural Uplink • Multi-language
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleVoiceMute}
            className={`p-1.5 rounded-lg border text-xs font-mono flex items-center gap-1 transition-colors ${
              voiceMuted
                ? 'bg-zinc-900 border-zinc-700 text-zinc-400'
                : 'bg-cyan-500/15 border-cyan-400/50 text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.3)]'
            }`}
            title={voiceMuted ? 'Voice Responses Muted' : 'Voice Responses Active (Text-to-Speech)'}
          >
            {voiceMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
            <span className="hidden sm:inline text-[11px]">{voiceMuted ? 'TTS Muted' : 'Voice Active'}</span>
          </button>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 font-mono text-xs">
        {messages.map((msg) => {
          const isJarvis = msg.sender === 'jarvis';
          const isSystem = msg.sender === 'system';

          if (isSystem) {
            return (
              <div key={msg.id} className="text-center my-2">
                <span className="inline-block bg-zinc-900/90 border border-cyan-500/30 text-cyan-400 text-[10px] px-3 py-1 rounded-full shadow-sm">
                  {msg.text}
                </span>
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isJarvis ? 'justify-start' : 'justify-end'}`}
            >
              {isJarvis && (
                <div className="w-7 h-7 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 shadow-md relative ${
                  isJarvis
                    ? 'bg-zinc-900/90 border border-cyan-500/30 text-zinc-100 rounded-tl-sm'
                    : 'bg-cyan-600/90 text-white rounded-tr-sm shadow-cyan-900/30'
                }`}
              >
                <div className="flex items-center justify-between gap-3 text-[10px] mb-1 opacity-70">
                  <span className="font-bold uppercase tracking-wide">
                    {isJarvis ? 'J.A.R.V.I.S.' : 'Tony Stark / Owner'}
                  </span>
                  <span>{msg.timestamp}</span>
                </div>

                <p className="leading-relaxed whitespace-pre-wrap font-sans text-sm">
                  {msg.text}
                </p>

                {/* Optional Voice replay button for Jarvis message */}
                {isJarvis && (
                  <div className="mt-2.5 pt-2 border-t border-zinc-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => speakJarvis(msg.text)}
                      className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                      title="Replay Voice Audio"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>Hear Voice</span>
                    </button>

                    <button
                      onClick={() => onExecuteAsTask(msg.text)}
                      className="text-[10px] bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/40 flex items-center gap-1 transition-colors"
                      title="Dispatch as Machine Autonomous Task"
                    >
                      <Play className="w-2.5 h-2.5" />
                      <span>Execute on Host</span>
                    </button>
                  </div>
                )}
              </div>

              {!isJarvis && (
                <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {isProcessing && (
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono pl-2">
            <Radio className="w-3.5 h-3.5 animate-spin text-cyan-400" />
            <span>Jarvis is processing neural reasoning...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Voice & Text Input Form */}
      <form onSubmit={handleSubmit} className="p-3 bg-zinc-900/90 border-t border-cyan-500/20 flex items-center gap-2">
        {/* Microphone Button */}
        <button
          type="button"
          id="btn-voice-input-chat"
          onClick={() => {
            playJarvisSound(isListening ? 'acknowledge' : 'wake');
            onToggleListening();
          }}
          className={`p-2.5 rounded-xl border transition-all ${
            isListening
              ? 'bg-rose-500 text-white border-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.6)] animate-pulse'
              : 'bg-zinc-900 hover:bg-zinc-800 text-cyan-400 border-cyan-500/40 hover:border-cyan-300'
          }`}
          title={isListening ? 'Stop Microphone' : 'Speak into Microphone'}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        {/* Input Text Box */}
        <input
          id="jarvis-chat-input"
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={isListening ? "Listening... Speak to Jarvis" : "Message Jarvis (e.g., 'Salom Jarvis', 'Check system vitals')..."}
          disabled={isProcessing}
          className="flex-1 bg-zinc-950 border border-zinc-700/80 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-cyan-400/40 font-mono transition-all"
        />

        {/* Send Button */}
        <button
          type="submit"
          id="btn-chat-send"
          disabled={!inputText.trim() || isProcessing}
          className="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:bg-zinc-800 disabled:text-zinc-600 text-zinc-950 transition-colors shadow-md shadow-cyan-900/30"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
