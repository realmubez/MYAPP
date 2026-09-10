import { storageService } from './storage';

/**
 * High-performance, zero-latency typing sound engine using Web Audio API.
 * Synthesizes organic, soft mechanical keystrokes, gentle error bonks,
 * and rewarding completion chimes with zero external assets and zero delay.
 */
class TypingSoundService {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private soundEnabled: boolean = true;
  private volume: number = 0.4; // Default subtle/moderate volume (0.0 to 1.0)
  private isInitialized: boolean = false;

  constructor() {
    // Read initial settings from local storage if available
    try {
      const settings = storageService.getSettings();
      this.soundEnabled = settings.soundEnabled ?? true;
      this.volume = typeof settings.typingSoundVolume === 'number' ? settings.typingSoundVolume : 0.4;
    } catch {
      this.soundEnabled = true;
      this.volume = 0.4;
    }
  }

  /**
   * Lazily initialize AudioContext and handle browser/mobile autoplay policy
   */
  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    try {
      if (!this.ctx) {
        const AudioContextClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

        if (!AudioContextClass) return null;

        this.ctx = new AudioContextClass();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(
          this.soundEnabled ? this.volume : 0,
          this.ctx.currentTime
        );
        this.masterGain.connect(this.ctx.destination);
      }

      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }

      return this.ctx;
    } catch (e) {
      console.warn('AudioContext initialization failed:', e);
      return null;
    }
  }

  /**
   * Attach global gesture unlock listeners to comply with iOS and Chrome autoplay policies
   */
  public init(): void {
    if (this.isInitialized || typeof window === 'undefined') return;
    this.isInitialized = true;

    // Refresh settings
    try {
      const settings = storageService.getSettings();
      this.soundEnabled = settings.soundEnabled ?? true;
      this.volume = typeof settings.typingSoundVolume === 'number' ? settings.typingSoundVolume : 0.4;
    } catch {
      // Keep defaults
    }

    const unlock = () => {
      this.ensureContext();
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('touchstart', unlock);
    };

    window.addEventListener('pointerdown', unlock, { passive: true, once: true });
    window.addEventListener('keydown', unlock, { passive: true, once: true });
    window.addEventListener('touchstart', unlock, { passive: true, once: true });
  }

  public setEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
    if (this.ctx && this.masterGain) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(enabled ? this.volume : 0, now);
    }
  }

  public isEnabled(): boolean {
    return this.soundEnabled;
  }

  public setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.ctx && this.masterGain) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.soundEnabled ? this.volume : 0, now);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  /**
   * 1. CORRECT character sound:
   * Short, soft mechanical switch tick with organic micro-pitch jitter.
   * Subtle, crisp, and comfortable during fast 100+ WPM typing.
   */
  public playCorrectKey(): void {
    if (!this.soundEnabled || this.volume <= 0) return;

    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;

    try {
      const now = ctx.currentTime;

      // Micro-pitch jitter (±3.5%) to prevent mechanical machine-gun monotony
      const pitchVar = 1 + (Math.random() - 0.5) * 0.07;

      // Layer 1: Crisp high-frequency switch snap/transient (1900Hz -> 650Hz in 10ms)
      const oscSnap = ctx.createOscillator();
      const gainSnap = ctx.createGain();

      oscSnap.type = 'triangle';
      oscSnap.frequency.setValueAtTime(1950 * pitchVar, now);
      oscSnap.frequency.exponentialRampToValueAtTime(650 * pitchVar, now + 0.011);

      gainSnap.gain.setValueAtTime(0.24, now);
      gainSnap.gain.exponentialRampToValueAtTime(0.001, now + 0.012);

      oscSnap.connect(gainSnap);
      gainSnap.connect(this.masterGain);

      oscSnap.start(now);
      oscSnap.stop(now + 0.013);

      // Layer 2: Warm dampened bottom-out thud (340Hz -> 180Hz in 25ms)
      const oscThud = ctx.createOscillator();
      const gainThud = ctx.createGain();

      oscThud.type = 'sine';
      oscThud.frequency.setValueAtTime(340 * pitchVar, now);
      oscThud.frequency.exponentialRampToValueAtTime(180 * pitchVar, now + 0.026);

      gainThud.gain.setValueAtTime(0.38, now);
      gainThud.gain.exponentialRampToValueAtTime(0.001, now + 0.028);

      oscThud.connect(gainThud);
      gainThud.connect(this.masterGain);

      oscThud.start(now);
      oscThud.stop(now + 0.03);

      // Cleanup nodes after playback
      setTimeout(() => {
        try {
          oscSnap.disconnect();
          gainSnap.disconnect();
          oscThud.disconnect();
          gainThud.disconnect();
        } catch {
          // ignore
        }
      }, 50);
    } catch (e) {
      console.warn('Error playing correct key sound:', e);
    }
  }

  /**
   * 2. INCORRECT character sound:
   * Gentle, soft wooden knock/bonk. NO loud buzzer.
   * Damped low frequency with fast exponential decay.
   */
  public playIncorrectKey(): void {
    if (!this.soundEnabled || this.volume <= 0) return;

    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;

    try {
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      // Soft low wooden tone (165Hz -> 105Hz)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(165, now);
      osc.frequency.exponentialRampToValueAtTime(105, now + 0.065);

      // Low-pass filter to eliminate harsh buzz
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, now);

      // Soft, quick decay
      gain.gain.setValueAtTime(0.32, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.075);

      setTimeout(() => {
        try {
          osc.disconnect();
          filter.disconnect();
          gain.disconnect();
        } catch {
          // ignore
        }
      }, 90);
    } catch (e) {
      console.warn('Error playing incorrect key sound:', e);
    }
  }

  /**
   * 3. COMPLETION sound:
   * A short, pleasant ascending harmonic chime (C5 -> E5 -> G5)
   * Light, rewarding, uplifting, and unobtrusive (~240ms).
   */
  public playCompletion(): void {
    if (!this.soundEnabled || this.volume <= 0) return;

    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;

    try {
      const now = ctx.currentTime;
      // Arpeggio notes in Hz: C5, E5, G5
      const notes = [523.25, 659.25, 783.99];
      const stepDelay = 0.055;

      notes.forEach((freq, idx) => {
        const noteStart = now + idx * stepDelay;
        const noteDuration = 0.18;

        // Fundamental note
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteStart);

        gain.gain.setValueAtTime(0, noteStart);
        gain.gain.linearRampToValueAtTime(0.28, noteStart + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.001, noteStart + noteDuration);

        osc.connect(gain);
        gain.connect(this.masterGain!);

        osc.start(noteStart);
        osc.stop(noteStart + noteDuration);

        // Subtle bell harmonic (2x overtone at low volume)
        const overtone = ctx.createOscillator();
        const overtoneGain = ctx.createGain();

        overtone.type = 'sine';
        overtone.frequency.setValueAtTime(freq * 2, noteStart);

        overtoneGain.gain.setValueAtTime(0, noteStart);
        overtoneGain.gain.linearRampToValueAtTime(0.08, noteStart + 0.006);
        overtoneGain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.12);

        overtone.connect(overtoneGain);
        overtoneGain.connect(this.masterGain!);

        overtone.start(noteStart);
        overtone.stop(noteStart + 0.13);
      });
    } catch (e) {
      console.warn('Error playing completion sound:', e);
    }
  }
}

export const typingSoundService = new TypingSoundService();
