// Short synthesised sounds from spec chapter 13. No sound files: each sound is
// a few tones described as data below, played with Web Audio oscillators.
// Browsers keep audio silent until the player touches or presses something,
// so the AudioContext is created on the first such gesture (unlock()).

import type { GameEvent } from "../game/game";

type Tone = {
  /** "noise" is white noise, used for the crash. */
  wave: OscillatorType | "noise";
  /** Pitch in Hz at the start and, for a slide, at the end. */
  from: number;
  to?: number;
  /** Start after the sound begins and length, in seconds. */
  at: number;
  length: number;
  volume: number;
};

// The fly is the most frequent sound, so it is the quietest and shortest.
const SOUNDS: Record<GameEvent, readonly Tone[]> = {
  fly: [{ wave: "square", from: 1320, to: 1760, at: 0, length: 0.05, volume: 0.05 }],
  bonus: [660, 880, 1320].map((from, i) => ({ wave: "triangle", from, at: i * 0.07, length: 0.12, volume: 0.2 })),
  climb: [{ wave: "sine", from: 260, to: 520, at: 0, length: 0.09, volume: 0.15 }],
  crash: [
    { wave: "noise", from: 0, at: 0, length: 0.45, volume: 0.3 },
    { wave: "sawtooth", from: 300, to: 50, at: 0, length: 0.5, volume: 0.15 },
  ],
  roundClear: [523, 659, 784, 1047].map((from, i) => ({ wave: "square", from, at: i * 0.1, length: 0.18, volume: 0.08 })),
  gameOver: [392, 330, 262, 196].map((from, i) => ({ wave: "triangle", from, at: i * 0.25, length: 0.35, volume: 0.22 })),
};

const MASTER_VOLUME = 0.6;
/** A few milliseconds of fade-in keep a tone from starting with a click. */
const ATTACK = 0.005;

export type Sound = {
  /** Whether sounds play; the settings switch it. */
  enabled: boolean;
  /** Call from a touch, click or key press; until then the browser blocks audio. */
  unlock(): void;
  play(event: GameEvent): void;
};

export function createSound(enabled: boolean): Sound {
  let audio: { ctx: AudioContext; out: GainNode; noise: AudioBuffer } | null = null;

  const sound: Sound = {
    enabled,
    unlock() {
      if (!audio) {
        const ctx = new AudioContext();
        const out = ctx.createGain();
        out.gain.value = MASTER_VOLUME;
        out.connect(ctx.destination);
        audio = { ctx, out, noise: whiteNoise(ctx) };
      }
      if (audio.ctx.state === "suspended") void audio.ctx.resume();
    },
    play(event) {
      if (!sound.enabled || !audio || audio.ctx.state !== "running") return;
      const start = audio.ctx.currentTime;
      for (const tone of SOUNDS[event]) playTone(audio.ctx, audio.out, audio.noise, tone, start);
    },
  };
  return sound;
}

function playTone(ctx: AudioContext, out: AudioNode, noise: AudioBuffer, tone: Tone, start: number): void {
  const begin = start + tone.at;
  const end = begin + tone.length;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, begin);
  gain.gain.linearRampToValueAtTime(tone.volume, begin + ATTACK);
  // An exponential fade sounds natural but cannot reach zero, hence the tiny target.
  gain.gain.exponentialRampToValueAtTime(0.0001, end);
  gain.connect(out);

  const source = tone.wave === "noise" ? noiseSource(ctx, noise) : oscillator(ctx, tone.wave, tone, begin, end);
  source.connect(gain);
  source.start(begin);
  source.stop(end);
}

function oscillator(ctx: AudioContext, wave: OscillatorType, tone: Tone, begin: number, end: number): OscillatorNode {
  const osc = ctx.createOscillator();
  osc.type = wave;
  osc.frequency.setValueAtTime(tone.from, begin);
  if (tone.to !== undefined) osc.frequency.exponentialRampToValueAtTime(tone.to, end);
  return osc;
}

function noiseSource(ctx: AudioContext, noise: AudioBuffer): AudioBufferSourceNode {
  const source = ctx.createBufferSource();
  source.buffer = noise;
  return source;
}

/** One second of white noise, made once and reused. */
function whiteNoise(ctx: AudioContext): AudioBuffer {
  const buffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  // Noise only colours the crash sound; it never affects the game, so Math.random is fine here.
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}
