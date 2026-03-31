// Simple Web Audio API sound effects using oscillator synthesis

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

function playTone(freq: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.15): void {
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.5, ctx.currentTime + duration);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Audio not available
  }
}

export const Audio = {
  webShoot(): void {
    playTone(800, 0.1, 'sine', 0.1);
  },

  webAttach(): void {
    playTone(500, 0.15, 'triangle', 0.12);
  },

  webSnap(): void {
    playTone(200, 0.2, 'sawtooth', 0.1);
  },

  slingshotStretch(): void {
    playTone(300, 0.05, 'sine', 0.05);
  },

  slingshotLaunch(): void {
    playTone(400, 0.3, 'square', 0.1);
    setTimeout(() => playTone(600, 0.2, 'sine', 0.08), 50);
  },

  death(): void {
    playTone(400, 0.1, 'sawtooth', 0.15);
    setTimeout(() => playTone(200, 0.3, 'sawtooth', 0.12), 100);
    setTimeout(() => playTone(100, 0.5, 'sawtooth', 0.1), 200);
  },

  zoneComplete(): void {
    playTone(523, 0.15, 'triangle', 0.12);
    setTimeout(() => playTone(659, 0.15, 'triangle', 0.12), 100);
    setTimeout(() => playTone(784, 0.3, 'triangle', 0.12), 200);
  },

  upgrade(): void {
    playTone(440, 0.1, 'sine', 0.12);
    setTimeout(() => playTone(880, 0.3, 'sine', 0.1), 100);
  },

  webCatchWarning(): void {
    playTone(600, 0.05, 'square', 0.08);
  },

  bossHit(): void {
    playTone(150, 0.3, 'sawtooth', 0.15);
  },

  unlock(): void {
    // Resume audio context on first user interaction
    if (audioCtx?.state === 'suspended') {
      audioCtx.resume();
    }
  },
};
