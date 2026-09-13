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
export function speakJarvis(
  text: string,
  options?: {
    rate?: number;
    pitch?: number;
    onStart?: () => void;
    onEnd?: () => void;
  }
) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  window.speechSynthesis.cancel();

  // Strip JSON formatting or code chunks if text contains raw action blocks
  const cleanText = text
    .replace(/\{"think":.*?,"action":.*?\}/gs, 'Executing requested system sequence.')
    .replace(/\{.*?\}/gs, '')
    .replace(/```.*?```/gs, 'Command output displayed on terminal.')
    .replace(/[#*`_]/g, '')
    .trim();

  if (!cleanText) return;

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.rate = options?.rate ?? 1.05;
  utterance.pitch = options?.pitch ?? 0.95;

  // Language detection
  const isUzbek = /[ўқғҳ]|tekshir|fayl|tizim|salom|jarvis/i.test(cleanText);
  const isRussian = /[а-яё]/i.test(cleanText);

  if (isUzbek) {
    utterance.lang = 'uz-UZ';
  } else if (isRussian) {
    utterance.lang = 'ru-RU';
  } else {
    utterance.lang = 'en-GB'; // British English for authentic Jarvis accent
  }

  // Find preferred voice
  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    let chosenVoice = null;
    if (isRussian) {
      chosenVoice = voices.find((v) => v.lang.startsWith('ru'));
    } else if (isUzbek) {
      chosenVoice = voices.find((v) => v.lang.startsWith('uz') || v.lang.startsWith('tr'));
    } else {
      chosenVoice =
        voices.find((v) => v.lang === 'en-GB' && v.name.toLowerCase().includes('male')) ||
        voices.find((v) => v.lang === 'en-GB') ||
        voices.find((v) => v.lang.startsWith('en'));
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

// Stop current speech
export function stopJarvisSpeech() {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}
