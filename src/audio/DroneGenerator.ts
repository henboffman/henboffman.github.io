// THE DESCENT - Drone Generator
// The foundational tonal bed of the eldritch soundscape

import * as Tone from 'tone';
import type { DroneParams } from './types';

// Harmonic definition with detune offset
interface HarmonicDef {
  ratio: number;      // Frequency ratio relative to fundamental
  amplitude: number;  // Base amplitude
  detuneOffset: number; // Additional cents offset for this harmonic
}

// The harmonic stack that creates the "wrong" but musical drone
const HARMONIC_STACK: HarmonicDef[] = [
  { ratio: 1.0, amplitude: 0.4, detuneOffset: 0 },       // Fundamental
  { ratio: 1.5, amplitude: 0.2, detuneOffset: -2 },      // Flat 5th
  { ratio: 2.0, amplitude: 0.15, detuneOffset: 0 },      // Octave
  { ratio: 1.875, amplitude: 0.1, detuneOffset: 3 },     // Flat 7th (slightly sharp)
  { ratio: 3.0, amplitude: 0.08, detuneOffset: 5 },      // 12th (sharp)
  { ratio: 4.0, amplitude: 0.05, detuneOffset: -3 },     // 2 octaves (flat)
  { ratio: 2.5, amplitude: 0.04, detuneOffset: 7 },      // Major 3rd + octave (sharp)
  { ratio: 5.0, amplitude: 0.03, detuneOffset: -5 },     // Major 3rd + 2 octaves (flat)
];

export class DroneGenerator {
  private output: Tone.Channel;
  private params: DroneParams;
  private isPlaying = false;

  // Oscillators
  private oscillators: Tone.Oscillator[] = [];
  private subOscillator: Tone.Oscillator | null = null;

  // Noise bed
  private noiseBed: Tone.Noise | null = null;
  private noiseFilter: Tone.Filter | null = null;
  private noiseGain: Tone.Gain | null = null;

  // LFOs
  private ampLfo: Tone.LFO | null = null;
  private pitchLfo: Tone.LFO | null = null;
  private filterLfo: Tone.LFO | null = null;
  private driftLfo: Tone.LFO | null = null;

  // Filter
  private mainFilter: Tone.Filter | null = null;

  // Gain stages
  private mainGain: Tone.Gain | null = null;
  private subGain: Tone.Gain | null = null;

  // Effects
  private chorus: Tone.Chorus | null = null;
  private reverb: Tone.Reverb | null = null;

  // Layer modulation
  private stabilityModulation = 1;

  constructor(output: Tone.Channel, params: DroneParams) {
    this.output = output;
    this.params = { ...params };
    this.createAudioGraph();
  }

  /**
   * Create the full audio graph for the drone
   */
  private createAudioGraph(): void {
    // Create main gain (amplitude modulation target)
    this.mainGain = new Tone.Gain(0.7);
    this.subGain = new Tone.Gain(this.params.subAmplitude);

    // Create filter
    this.mainFilter = new Tone.Filter({
      type: 'lowpass',
      frequency: this.params.filterCutoff,
      Q: this.params.filterResonance * 10, // Scale Q for more audible resonance
      rolloff: -24,
    });

    // Create effects
    this.chorus = new Tone.Chorus({
      frequency: 0.3,
      delayTime: 3.5,
      depth: 0.3,
      wet: 0.2,
    }).start();

    this.reverb = new Tone.Reverb({
      decay: 4,
      wet: 0.4,
    });

    // Create LFOs (ensure min < max)
    const initialAmpDepth = Math.max(0.001, this.params.ampLfoDepth);
    this.ampLfo = new Tone.LFO({
      frequency: this.params.ampLfoRate,
      min: 1 - initialAmpDepth,
      max: 1,
      type: 'sine',
    });

    this.filterLfo = new Tone.LFO({
      frequency: 0.02,
      min: this.params.filterCutoff * 0.5,
      max: this.params.filterCutoff * 1.5,
      type: 'triangle',
    });

    this.pitchLfo = new Tone.LFO({
      frequency: 0.3,
      min: -5,
      max: 5,
      type: 'sine',
    });

    this.driftLfo = new Tone.LFO({
      frequency: 0.005,
      min: -15,
      max: 15,
      type: 'sine',
    });

    // Create noise bed
    this.noiseBed = new Tone.Noise('pink');
    this.noiseFilter = new Tone.Filter({
      type: 'bandpass',
      frequency: this.params.fundamental * 2,
      Q: 0.5,
    });
    this.noiseGain = new Tone.Gain(0.02);

    // Connect noise path
    this.noiseBed.connect(this.noiseFilter);
    this.noiseFilter.connect(this.noiseGain);
    this.noiseGain.connect(this.mainFilter);

    // Create oscillators
    this.rebuildOscillators();

    // Create sub oscillator (infrasound)
    this.subOscillator = new Tone.Oscillator({
      frequency: this.params.subFrequency,
      type: 'sine',
    });
    this.subOscillator.connect(this.subGain);
    this.subGain.connect(this.output);

    // Connect LFOs
    this.ampLfo.connect(this.mainGain.gain);
    this.filterLfo.connect(this.mainFilter.frequency);

    // Connect main signal path
    this.mainFilter.chain(this.chorus, this.reverb, this.mainGain, this.output);
  }

  /**
   * Rebuild oscillators based on current harmonic count
   */
  private rebuildOscillators(): void {
    // Dispose existing oscillators
    this.oscillators.forEach(osc => osc.dispose());
    this.oscillators = [];

    const harmonicsToUse = HARMONIC_STACK.slice(0, this.params.harmonicCount);

    for (let i = 0; i < harmonicsToUse.length; i++) {
      const harmonic = harmonicsToUse[i];
      const baseFreq = this.params.fundamental * harmonic.ratio;

      // Calculate detune: base detune + harmonic offset + random variation per oscillator
      const totalDetune = this.params.detuneAmount + harmonic.detuneOffset;

      const osc = new Tone.Oscillator({
        frequency: baseFreq,
        type: i === 0 ? 'sine' : 'triangle', // Fundamental pure, harmonics with overtones
        detune: totalDetune,
        volume: Tone.gainToDb(harmonic.amplitude),
      });

      osc.connect(this.mainFilter!);
      this.oscillators.push(osc);
    }
  }

  /**
   * Start the drone
   */
  start(): void {
    if (this.isPlaying) return;

    // Start oscillators
    this.oscillators.forEach(osc => osc.start());
    this.subOscillator?.start();
    this.noiseBed?.start();

    // Start LFOs
    this.ampLfo?.start();
    this.filterLfo?.start();
    this.pitchLfo?.start();
    this.driftLfo?.start();

    this.isPlaying = true;
    console.log('DroneGenerator started');
  }

  /**
   * Stop the drone
   */
  stop(): void {
    if (!this.isPlaying) return;

    // Stop oscillators with fade out
    this.oscillators.forEach(osc => osc.stop('+0.5'));
    this.subOscillator?.stop('+0.5');
    this.noiseBed?.stop('+0.5');

    // Stop LFOs
    this.ampLfo?.stop();
    this.filterLfo?.stop();
    this.pitchLfo?.stop();
    this.driftLfo?.stop();

    this.isPlaying = false;
    console.log('DroneGenerator stopped');
  }

  /**
   * Update parameters
   */
  setParams(params: DroneParams): void {
    const needsRebuild =
      params.harmonicCount !== this.params.harmonicCount ||
      params.fundamental !== this.params.fundamental;

    this.params = { ...params };

    if (needsRebuild && this.isPlaying) {
      // Stop current oscillators
      this.oscillators.forEach(osc => osc.stop());
      // Rebuild
      this.rebuildOscillators();
      // Restart
      this.oscillators.forEach(osc => osc.start());
    } else if (needsRebuild) {
      this.rebuildOscillators();
    }

    // Update frequencies and detune
    this.updateOscillatorParams();

    // Update sub oscillator
    this.subOscillator?.frequency.rampTo(params.subFrequency, 0.5);
    this.subGain?.gain.rampTo(params.subAmplitude, 0.5);

    // Update LFOs (ensure min < max)
    if (this.ampLfo) {
      this.ampLfo.frequency.rampTo(params.ampLfoRate, 0.5);
      const depth = Math.max(0.001, params.ampLfoDepth); // Ensure non-zero range
      this.ampLfo.min = 1 - depth;
      this.ampLfo.max = 1;
    }

    // Update filter
    if (this.mainFilter) {
      this.mainFilter.frequency.rampTo(params.filterCutoff, 0.5);
      this.mainFilter.Q.rampTo(params.filterResonance * 10, 0.5);
    }

    // Update filter LFO range
    if (this.filterLfo) {
      this.filterLfo.min = params.filterCutoff * 0.5;
      this.filterLfo.max = params.filterCutoff * 1.5;
    }

    // Update noise filter
    this.noiseFilter?.frequency.rampTo(params.fundamental * 2, 0.5);
  }

  /**
   * Update oscillator frequencies and detune
   */
  private updateOscillatorParams(): void {
    const harmonicsToUse = HARMONIC_STACK.slice(0, this.params.harmonicCount);

    for (let i = 0; i < this.oscillators.length && i < harmonicsToUse.length; i++) {
      const harmonic = harmonicsToUse[i];
      const baseFreq = this.params.fundamental * harmonic.ratio;
      const totalDetune = this.params.detuneAmount + harmonic.detuneOffset;

      this.oscillators[i].frequency.rampTo(baseFreq, 0.5);
      this.oscillators[i].detune.rampTo(totalDetune, 0.5);
    }
  }

  /**
   * Apply layer and stability modulation
   */
  setLayerModulation(layer: number, stability: number): void {
    this.stabilityModulation = stability / 100;

    // Layer affects:
    // - Sub amplitude (more sub at deeper layers)
    // - Detune amount (more detune at deeper layers)
    // - Filter cutoff (darker at deeper layers? or more movement?)
    // - LFO rates (faster modulation at deeper layers)

    const layerFactor = layer / 5; // 0-1 for layers 0-5

    // Increase sub bass with layer
    const subAmpMod = this.params.subAmplitude + (layerFactor * 0.15);
    this.subGain?.gain.rampTo(Math.min(0.4, subAmpMod), 1);

    // Increase detune with layer (and low stability)
    const detuneBase = this.params.detuneAmount;
    const detuneMod = detuneBase + (layerFactor * 15) + ((1 - this.stabilityModulation) * 10);
    this.oscillators.forEach((osc, i) => {
      const harmonic = HARMONIC_STACK[i];
      if (harmonic) {
        osc.detune.rampTo(detuneMod + harmonic.detuneOffset, 1);
      }
    });

    // Adjust amp LFO rate with layer
    const ampRateMod = this.params.ampLfoRate * (1 + layerFactor * 0.5);
    this.ampLfo?.frequency.rampTo(ampRateMod, 1);

    // Adjust amp LFO depth with layer (more breathing)
    const ampDepthMod = Math.max(0.001, this.params.ampLfoDepth + (layerFactor * 0.15));
    if (this.ampLfo) {
      this.ampLfo.min = 1 - Math.min(0.5, ampDepthMod);
    }

    // At low stability, add pitch drift
    if (stability < 50) {
      const driftAmount = Math.max(0.1, ((50 - stability) / 50) * 20);
      if (this.driftLfo) {
        this.driftLfo.min = -driftAmount;
        this.driftLfo.max = driftAmount;
      }
    }
  }

  /**
   * Get current parameters
   */
  getParams(): DroneParams {
    return { ...this.params };
  }

  /**
   * Dispose all audio resources
   */
  dispose(): void {
    this.stop();

    this.oscillators.forEach(osc => osc.dispose());
    this.subOscillator?.dispose();
    this.noiseBed?.dispose();
    this.noiseFilter?.dispose();
    this.noiseGain?.dispose();
    this.ampLfo?.dispose();
    this.pitchLfo?.dispose();
    this.filterLfo?.dispose();
    this.driftLfo?.dispose();
    this.mainFilter?.dispose();
    this.mainGain?.dispose();
    this.subGain?.dispose();
    this.chorus?.dispose();
    this.reverb?.dispose();

    this.oscillators = [];
  }
}
