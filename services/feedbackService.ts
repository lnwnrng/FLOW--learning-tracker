import { useSettingsStore } from '../stores';

export type FeedbackEvent =
  | 'tap'
  | 'nav'
  | 'toggleOn'
  | 'toggleOff'
  | 'modal'
  | 'success'
  | 'info'
  | 'warning'
  | 'error'
  | 'timerStart'
  | 'timerPause'
  | 'timerComplete'
  | 'achievement'
  | 'premium';

type FeedbackOptions = {
  force?: boolean;
};

type Tone = {
  frequency: number;
  durationMs: number;
  type?: OscillatorType;
  gain?: number;
  glideTo?: number;
  delayMs?: number;
};

let audioContext: AudioContext | null = null;

const SOUND_SEQUENCES: Record<FeedbackEvent, Tone[]> = {
  // light, watery, unobtrusive clicks
  tap: [{ frequency: 820, durationMs: 55, type: 'sine', gain: 0.05 }],
  nav: [{ frequency: 680, durationMs: 80, type: 'triangle', gain: 0.055, glideTo: 520 }],
  toggleOn: [{ frequency: 520, durationMs: 100, type: 'sine', gain: 0.06, glideTo: 880 }],
  toggleOff: [{ frequency: 740, durationMs: 95, type: 'sine', gain: 0.05, glideTo: 420 }],
  modal: [{ frequency: 720, durationMs: 90, type: 'triangle', gain: 0.055 }],

  // contextual cues (still soft, slightly richer)
  success: [
    { frequency: 640, durationMs: 80, type: 'sine', gain: 0.065 },
    { frequency: 900, durationMs: 100, type: 'sine', gain: 0.07, delayMs: 60 },
  ],
  info: [{ frequency: 720, durationMs: 100, type: 'triangle', gain: 0.055 }],
  warning: [{ frequency: 520, durationMs: 120, type: 'sine', gain: 0.055, glideTo: 480 }],
  error: [
    { frequency: 420, durationMs: 110, type: 'triangle', gain: 0.055 },
    { frequency: 360, durationMs: 110, type: 'triangle', gain: 0.05, delayMs: 70 },
  ],

  // focus flow cues (gentle rising/falling)
  timerStart: [{ frequency: 480, durationMs: 110, type: 'sine', gain: 0.065, glideTo: 960 }],
  timerPause: [{ frequency: 560, durationMs: 110, type: 'sine', gain: 0.055, glideTo: 380 }],
  timerComplete: [
    { frequency: 660, durationMs: 90, type: 'sine', gain: 0.065 },
    { frequency: 990, durationMs: 120, type: 'sine', gain: 0.07, delayMs: 70 },
  ],

  // celebratory but airy
  achievement: [
    { frequency: 880, durationMs: 110, type: 'triangle', gain: 0.07 },
    { frequency: 1175, durationMs: 120, type: 'triangle', gain: 0.07, delayMs: 70 },
    { frequency: 1568, durationMs: 140, type: 'triangle', gain: 0.065, delayMs: 140 },
  ],
  premium: [
    { frequency: 784, durationMs: 120, type: 'sine', gain: 0.07 },
    { frequency: 1046, durationMs: 140, type: 'sine', gain: 0.07, delayMs: 80 },
    { frequency: 1318, durationMs: 160, type: 'sine', gain: 0.065, delayMs: 160 },
  ],
};

const HAPTIC_PATTERNS: Record<FeedbackEvent, number | number[]> = {
  tap: 8,
  nav: 10,
  toggleOn: [10, 18, 10],
  toggleOff: 12,
  modal: 12,
  success: [16, 24, 16],
  info: [12, 18, 12],
  warning: [20, 24, 20],
  error: [32, 24, 32],
  timerStart: [12, 24, 12],
  timerPause: [14, 26, 14],
  timerComplete: [18, 28, 18],
  achievement: [8, 16, 8, 16, 22],
  premium: [10, 18, 10, 18, 26],
};

function isSoundEnabled(): boolean {
  const setting = useSettingsStore.getState().settings['soundEffects'];
  return setting !== 'off';
}

function isHapticEnabled(): boolean {
  const setting = useSettingsStore.getState().settings['hapticFeedback'];
  return setting !== 'off';
}

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioCtx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return null;
  if (!audioContext) {
    audioContext = new AudioCtx();
  }
  if (audioContext.state === 'suspended') {
    void audioContext.resume();
  }
  return audioContext;
}

function playTone(ctx: AudioContext, tone: Tone): void {
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  const now = ctx.currentTime + (tone.delayMs ?? 0) / 1000;
  const duration = tone.durationMs / 1000;
  const peak = tone.gain ?? 0.1;

  oscillator.type = tone.type ?? 'sine';
  oscillator.frequency.value = tone.frequency;

  if (tone.glideTo) {
    oscillator.frequency.exponentialRampToValueAtTime(tone.glideTo, now + duration);
  }

  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(peak, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  oscillator.connect(gain);
  gain.connect(ctx.destination);

  oscillator.start(now);
  oscillator.stop(now + duration + 0.02);
}

export function playSoundEffect(type: FeedbackEvent, options?: FeedbackOptions): void {
  if (!options?.force && !isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const sequence = SOUND_SEQUENCES[type];
  if (!sequence) return;
  sequence.forEach((tone) => playTone(ctx, tone));
}

export function triggerHaptic(type: FeedbackEvent, options?: FeedbackOptions): void {
  if (!options?.force && !isHapticEnabled()) return;
  if (typeof navigator === 'undefined' || !('vibrate' in navigator)) return;
  const pattern = HAPTIC_PATTERNS[type];
  try {
    navigator.vibrate(pattern);
  } catch {
    // ignore
  }
}

export function triggerFeedback(type: FeedbackEvent): void {
  playSoundEffect(type);
  triggerHaptic(type);
}
