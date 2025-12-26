// THE DESCENT - Whisper System
// Procedural formant synthesis for eerie almost-voices

import * as Tone from 'tone';
import type { WhisperParams } from './types';

// Formant frequencies for different vowels (in Hz)
// These create the recognizable vowel sounds when filtering noise
interface FormantSet {
  f1: number;  // First formant (jaw opening)
  f2: number;  // Second formant (tongue position)
  f3: number;  // Third formant (lip rounding)
}

const FORMANTS: Record<string, FormantSet> = {
  ah: { f1: 700, f2: 1200, f3: 2500 },   // "father"
  ee: { f1: 300, f2: 2300, f3: 3000 },   // "see"
  ih: { f1: 400, f2: 2000, f3: 2550 },   // "bit"
  oh: { f1: 500, f2: 900, f3: 2400 },    // "go"
  oo: { f1: 350, f2: 800, f3: 2300 },    // "boot"
  uh: { f1: 600, f2: 1000, f3: 2400 },   // "but"
  eh: { f1: 550, f2: 1800, f3: 2500 },   // "bet"
};

const VOWEL_KEYS = Object.keys(FORMANTS);

/**
 * A single whisper voice - creates one formant-synthesized "whisper"
 */
class WhisperVoice {
  private noise: Tone.Noise;
  private formantFilters: Tone.Filter[];
  private formantGains: Tone.Gain[];
  private masterGain: Tone.Gain;
  private panner: Tone.Panner;
  private envelope: Tone.AmplitudeEnvelope;

  // LFOs for formant modulation
  private f1Lfo: Tone.LFO;
  private f2Lfo: Tone.LFO;
  private panLfo: Tone.LFO;

  private isActive = false;

  constructor(private output: Tone.ToneAudioNode) {
    // Create noise source (breathy excitation)
    this.noise = new Tone.Noise('pink');

    // Create 3 parallel bandpass filters for formants
    this.formantFilters = [
      new Tone.Filter({ type: 'bandpass', frequency: 700, Q: 10 }),
      new Tone.Filter({ type: 'bandpass', frequency: 1200, Q: 12 }),
      new Tone.Filter({ type: 'bandpass', frequency: 2500, Q: 15 }),
    ];

    // Gains for each formant (they have different amplitudes)
    this.formantGains = [
      new Tone.Gain(1.0),   // F1 strongest
      new Tone.Gain(0.7),   // F2 medium
      new Tone.Gain(0.4),   // F3 weakest
    ];

    // Master gain and envelope
    this.masterGain = new Tone.Gain(0);
    this.envelope = new Tone.AmplitudeEnvelope({
      attack: 0.3,
      decay: 0.2,
      sustain: 0.6,
      release: 0.8,
    });

    // Panner for stereo positioning
    this.panner = new Tone.Panner(0);

    // LFOs for subtle formant drift (makes it more organic)
    this.f1Lfo = new Tone.LFO({ frequency: 0.15, min: -50, max: 50, type: 'sine' });
    this.f2Lfo = new Tone.LFO({ frequency: 0.12, min: -80, max: 80, type: 'sine' });
    this.panLfo = new Tone.LFO({ frequency: 0.08, min: -0.3, max: 0.3, type: 'sine' });

    // Connect noise to all formant filters in parallel
    this.formantFilters.forEach((filter, i) => {
      this.noise.connect(filter);
      filter.connect(this.formantGains[i]);
      this.formantGains[i].connect(this.masterGain);
    });

    // Connect LFOs to formant frequencies
    this.f1Lfo.connect(this.formantFilters[0].frequency);
    this.f2Lfo.connect(this.formantFilters[1].frequency);
    this.panLfo.connect(this.panner.pan);

    // Connect envelope to master gain
    this.envelope.connect(this.masterGain.gain);

    // Connect output chain
    this.masterGain.connect(this.panner);
    this.panner.connect(this.output);
  }

  /**
   * Trigger a whisper with specific parameters
   */
  trigger(params: {
    vowel?: string;
    duration?: number;
    pan?: number;
    pitch?: number;  // Multiplier for formant frequencies
    volume?: number; // 0-1
  }): void {
    if (this.isActive) return;
    this.isActive = true;

    const vowel = params.vowel || VOWEL_KEYS[Math.floor(Math.random() * VOWEL_KEYS.length)];
    const duration = params.duration || 1.5;
    const pitch = params.pitch || 1;
    const volume = params.volume || 0.5;

    // Set formant frequencies based on vowel
    const formantSet = FORMANTS[vowel] || FORMANTS.ah;
    this.formantFilters[0].frequency.setValueAtTime(formantSet.f1 * pitch, Tone.now());
    this.formantFilters[1].frequency.setValueAtTime(formantSet.f2 * pitch, Tone.now());
    this.formantFilters[2].frequency.setValueAtTime(formantSet.f3 * pitch, Tone.now());

    // Set pan position
    if (params.pan !== undefined) {
      this.panner.pan.setValueAtTime(params.pan, Tone.now());
    }

    // Set volume
    this.masterGain.gain.setValueAtTime(volume, Tone.now());

    // Adjust envelope for duration
    this.envelope.attack = duration * 0.2;
    this.envelope.decay = duration * 0.15;
    this.envelope.release = duration * 0.5;

    // Start noise and LFOs
    this.noise.start();
    this.f1Lfo.start();
    this.f2Lfo.start();
    this.panLfo.start();

    // Trigger envelope
    this.envelope.triggerAttack();

    // Schedule morphing between vowels during the whisper
    this.morphVowels(duration);

    // Schedule release
    Tone.getTransport().scheduleOnce(() => {
      this.release();
    }, `+${duration}`);
  }

  /**
   * Morph between vowels during the whisper for more organic sound
   */
  private morphVowels(duration: number): void {
    const morphCount = Math.floor(duration / 0.5);
    for (let i = 1; i <= morphCount; i++) {
      const time = (i * 0.5) / duration * duration * 0.8; // Don't morph during release
      Tone.getTransport().scheduleOnce(() => {
        if (!this.isActive) return;
        try {
          const newVowel = VOWEL_KEYS[Math.floor(Math.random() * VOWEL_KEYS.length)];
          const formantSet = FORMANTS[newVowel];
          this.formantFilters[0].frequency.rampTo(formantSet.f1, 0.3);
          this.formantFilters[1].frequency.rampTo(formantSet.f2, 0.3);
          this.formantFilters[2].frequency.rampTo(formantSet.f3, 0.3);
        } catch {
          // Voice may have been disposed
        }
      }, `+${time}`);
    }
  }

  /**
   * Release the whisper
   */
  release(): void {
    if (!this.isActive) return;

    this.envelope.triggerRelease();

    // Schedule stop after release
    const releaseTime = this.envelope.release as number;
    Tone.getTransport().scheduleOnce(() => {
      this.stop();
    }, `+${releaseTime + 0.1}`);
  }

  /**
   * Stop the voice completely
   */
  stop(): void {
    this.noise.stop();
    this.f1Lfo.stop();
    this.f2Lfo.stop();
    this.panLfo.stop();
    this.isActive = false;
  }

  /**
   * Check if voice is currently active
   */
  getIsActive(): boolean {
    return this.isActive;
  }

  /**
   * Dispose all resources
   */
  dispose(): void {
    this.stop();
    this.noise.dispose();
    this.formantFilters.forEach(f => f.dispose());
    this.formantGains.forEach(g => g.dispose());
    this.masterGain.dispose();
    this.panner.dispose();
    this.envelope.dispose();
    this.f1Lfo.dispose();
    this.f2Lfo.dispose();
    this.panLfo.dispose();
  }
}

/**
 * Main whisper system - manages multiple voices and scheduling
 */
export class WhisperSystem {
  private output: Tone.Channel;
  private params: WhisperParams;
  private isPlaying = false;

  // Voice pool
  private voices: WhisperVoice[] = [];
  private maxVoices = 6;

  // Effects
  private reverb: Tone.Reverb;
  private delay: Tone.FeedbackDelay;
  private effectsGain: Tone.Gain;

  // Scheduling
  private schedulerId: number | null = null;

  // Layer modulation
  private layerMod = 0;
  private stabilityMod = 1;

  constructor(output: Tone.Channel, params: WhisperParams) {
    this.output = output;
    this.params = { ...params };

    // Create effects chain
    this.reverb = new Tone.Reverb({
      decay: 3,
      wet: params.reverbWet,
    });

    this.delay = new Tone.FeedbackDelay({
      delayTime: 0.3,
      feedback: 0.25,
      wet: 0.3,
    });

    this.effectsGain = new Tone.Gain(Tone.dbToGain(params.volume));

    // Chain: voices -> delay -> reverb -> gain -> output
    this.delay.connect(this.reverb);
    this.reverb.connect(this.effectsGain);
    this.effectsGain.connect(this.output);

    // Create voice pool
    for (let i = 0; i < this.maxVoices; i++) {
      this.voices.push(new WhisperVoice(this.delay));
    }
  }

  /**
   * Start the whisper system
   */
  start(): void {
    if (this.isPlaying) return;
    this.isPlaying = true;

    // Start transport if not running
    if (Tone.getTransport().state !== 'started') {
      Tone.getTransport().start();
    }

    // Schedule first whisper
    this.scheduleNextWhisper();
    console.log('WhisperSystem started');
  }

  /**
   * Stop the whisper system
   */
  stop(): void {
    if (!this.isPlaying) return;
    this.isPlaying = false;

    // Cancel scheduled whisper
    if (this.schedulerId !== null) {
      Tone.getTransport().clear(this.schedulerId);
      this.schedulerId = null;
    }

    // Stop all active voices
    this.voices.forEach(v => v.stop());
    console.log('WhisperSystem stopped');
  }

  /**
   * Schedule the next whisper event
   */
  private scheduleNextWhisper(): void {
    if (!this.isPlaying || !this.params.enabled) return;

    // Calculate time until next whisper
    const baseInterval = 1 / Math.max(0.01, this.params.density);
    const variance = baseInterval * 0.5;
    const interval = baseInterval + (Math.random() - 0.5) * variance * 2;

    // Apply layer modulation (more frequent at deeper layers)
    const layerMultiplier = 1 - (this.layerMod * 0.15);
    const stabilityMultiplier = this.stabilityMod;
    const adjustedInterval = Math.max(0.5, interval * layerMultiplier * stabilityMultiplier);

    this.schedulerId = Tone.getTransport().scheduleOnce(() => {
      this.triggerWhisper();

      // Check for cluster
      if (Math.random() < this.params.clusterChance) {
        this.triggerCluster();
      }

      // Schedule next
      this.scheduleNextWhisper();
    }, `+${adjustedInterval}`);
  }

  /**
   * Trigger a single whisper
   */
  private triggerWhisper(): void {
    // Find an available voice
    const voice = this.voices.find(v => !v.getIsActive());
    if (!voice) return;

    // Calculate parameters
    const pan = (Math.random() - 0.5) * 2 * this.params.panRange;
    const pitch = this.params.pitchMin + Math.random() * (this.params.pitchMax - this.params.pitchMin);
    const duration = 1 + Math.random() * 2; // 1-3 seconds
    const volume = 0.3 + Math.random() * 0.4; // 0.3-0.7

    voice.trigger({
      pan,
      pitch,
      duration,
      volume,
    });
  }

  /**
   * Trigger a cluster of whispers
   */
  private triggerCluster(): void {
    const clusterSize = 2 + Math.floor(Math.random() * 3); // 2-4 whispers

    for (let i = 1; i < clusterSize; i++) {
      const delay = 0.1 + Math.random() * 0.4; // 0.1-0.5 second delays
      Tone.getTransport().scheduleOnce(() => {
        this.triggerWhisper();
      }, `+${delay * i}`);
    }
  }

  /**
   * Update parameters
   */
  setParams(params: WhisperParams): void {
    this.params = { ...params };

    // Update effects
    this.reverb.wet.rampTo(params.reverbWet, 0.5);
    this.effectsGain.gain.rampTo(Tone.dbToGain(params.volume), 0.5);

    // If enabled state changed, handle it
    if (params.enabled && this.isPlaying && this.schedulerId === null) {
      this.scheduleNextWhisper();
    }
  }

  /**
   * Set layer and stability modulation
   */
  setLayerModulation(layer: number, stability: number): void {
    this.layerMod = layer;
    this.stabilityMod = stability / 100;

    // Adjust parameters based on layer
    // Deeper layers = louder, more frequent, wider pitch range
    const layerFactor = layer / 5;

    // Increase volume slightly with layer
    const volumeBoost = layerFactor * 6; // Up to +6dB
    this.effectsGain.gain.rampTo(Tone.dbToGain(this.params.volume + volumeBoost), 1);

    // Increase reverb with layer (more distant/ethereal)
    const reverbWet = Math.min(1, this.params.reverbWet + layerFactor * 0.2);
    this.reverb.wet.rampTo(reverbWet, 1);
  }

  /**
   * Dispose all resources
   */
  dispose(): void {
    this.stop();
    this.voices.forEach(v => v.dispose());
    this.reverb.dispose();
    this.delay.dispose();
    this.effectsGain.dispose();
  }
}
