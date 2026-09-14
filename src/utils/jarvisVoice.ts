// Web Audio API Sound Generator & Web Speech Synthesis for JARVIS

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Play Jarvis Futuristic Sci-Fi sound effects using pure Web Audio oscillator synthesis
export function playJarvisSound(type: 'wake' | 'blip' | 'acknowledge' | 'alert' | 'shutdown' | 'sonar') {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    if (type === 'wake') {
      // Elegant futuristic two-tone rising chime
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';

      osc1.frequency.setValueAtTime(440, now);
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15);

      osc2.frequency.setValueAtTime(880, now + 0.08);
      osc2.frequency.exponentialRampToValueAtTime(1760, now + 0.25);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now + 0.08);
      osc1.stop(now + 0.35);
      osc2.stop(now + 0.35);
    } else if (type === 'acknowledge') {
      // Tech affirmative confirmation chirp
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(660, now);
      osc.frequency.setValueAtTime(990, now + 0.08);
      osc.frequency.setValueAtTime(1320, now + 0.16);

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.28);
    } else if (type === 'blip') {
      // Minimal HUD selection blip
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, now);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.06);
    } else if (type === 'alert') {
      // Warning klaxon
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.linearRampToValueAtTime(320, now + 0.2);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === 'shutdown') {
      // Power down descending tone
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.5);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.55);
    } else if (type === 'sonar') {
      // Radar sweep ping
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1500, now);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.4);
    }
  } catch (err) {
    // Ignore audio autoplay restrictions before user gesture
  }
}

// Text-to-Speech synthesis for Jarvis Voice
export interface JarvisSpeakOptions {
  enabled?: boolean;
  rate?: number;
  pitch?: number;
  volume?: number;
  voiceName?: string;
  gender?: 'male' | 'female';
  language?: string; // 'uz' | 'ru' | 'en'
  onStart?: () => void;
  onEnd?: () => void;
}

// Get all system voices
export function getAvailableVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !window.speechSynthesis) return [];
  return window.speechSynthesis.getVoices();
}

export function speakJarvis(text: string, options?: JarvisSpeakOptions) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  // STRICT VOICE OFF ENFORCEMENT:
  // Check if voice output is explicitly disabled via options OR persisted in localStorage
  if (options?.enabled === false) {
    window.speechSynthesis.cancel();
    return;
  }

  try {
    const savedSettings = localStorage.getItem('jarvis_settings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      if (parsed?.voice) {
        if (parsed.voice.voiceEnabled === false || parsed.voice.voiceOutputEnabled === false) {
          window.speechSynthesis.cancel();
          return;
        }
      }
    }
  } catch (e) {
    // Ignore JSON parse errors
  }

  window.speechSynthesis.cancel();

  // Strip JSON formatting, command outputs, codeblocks, or actions
  const cleanText = text
    .replace(/\{"think":.*?,"action":.*?\}/gs, 'Executing requested system sequence.')
    .replace(/\{.*?\}/gs, '')
    .replace(/```.*?```/gs, 'Command output displayed on terminal.')
    .replace(/[#*`_]/g, '')
    .trim();

  if (!cleanText) return;

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.rate = Math.max(0.5, Math.min(2.0, options?.rate ?? 1.05));
  utterance.pitch = Math.max(0.5, Math.min(2.0, options?.pitch ?? 0.95));
  utterance.volume = Math.max(0, Math.min(1.0, options?.volume ?? 1.0));

  // Determine language
  let lang = options?.language;
  if (!lang || lang === 'auto') {
    const isUzbek = /[ўқғҳ]|tekshir|fayl|tizim|salom|jarvis|ishla|qil/i.test(cleanText);
    const isRussian = /[а-яё]/i.test(cleanText);
    lang = isUzbek ? 'uz' : isRussian ? 'ru' : 'en';
  }

  if (lang === 'uz') {
    utterance.lang = 'uz-UZ';
  } else if (lang === 'ru') {
    utterance.lang = 'ru-RU';
  } else {
    utterance.lang = 'en-GB'; // British English for authentic Jarvis accent
  }

  // Voice Selection
  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    let chosenVoice: SpeechSynthesisVoice | null = null;

    // 1. If explicit voiceName provided and exists
    if (options?.voiceName) {
      chosenVoice = voices.find((v) => v.name === options.voiceName) || null;
    }

    // 2. Otherwise match by language and gender
    if (!chosenVoice) {
      const isMale = options?.gender !== 'female';

      if (lang === 'ru') {
        chosenVoice =
          voices.find((v) => v.lang.startsWith('ru') && (isMale ? v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('dmitri') || v.name.toLowerCase().includes('pavel') : v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('milena') || v.name.toLowerCase().includes('tatyana'))) ||
          voices.find((v) => v.lang.startsWith('ru')) ||
          null;
      } else if (lang === 'uz') {
        chosenVoice =
          voices.find((v) => v.lang.startsWith('uz') || v.lang.startsWith('tr')) ||
          null;
      } else {
        // English
        chosenVoice =
          voices.find((v) => v.lang === 'en-GB' && (isMale ? v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('daniel') || v.name.toLowerCase().includes('george') : v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('serena') || v.name.toLowerCase().includes('kate'))) ||
          voices.find((v) => v.lang === 'en-GB') ||
          voices.find((v) => v.lang.startsWith('en') && (isMale ? v.name.toLowerCase().includes('male') : v.name.toLowerCase().includes('female'))) ||
          voices.find((v) => v.lang.startsWith('en')) ||
          null;
      }
    }

    if (chosenVoice) {
      utterance.voice = chosenVoice;
    }
  }

  utterance.onstart = () => {
    playJarvisSound('acknowledge');
    options?.onStart?.();
  };

  utterance.onend = () => {
    options?.onEnd?.();
  };

  utterance.onerror = () => {
    options?.onEnd?.();
  };

  window.speechSynthesis.speak(utterance);
}

// Test voice with sample sentence
export function testJarvisVoice(options?: JarvisSpeakOptions) {
  const lang = options?.language || 'uz';
  let sampleText = "Assalomu alaykum, janob. Jarvis ovoz tizimi faol va buyruqlaringizga tayyor.";
  if (lang === 'en') {
    sampleText = "Good day, sir. Jarvis audio diagnostics complete and operating at maximum fidelity.";
  } else if (lang === 'ru') {
    sampleText = "Здравствуйте, сэр. Голосовой модуль Джарвис функционирует штатно.";
  }
  speakJarvis(sampleText, options);
}

// Stop current speech
export function stopJarvisSpeech() {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}
