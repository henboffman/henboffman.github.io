// THE DESCENT - Texture System
// Environmental soundscapes: void, stone, water, static, organic

import * as Tone from 'tone';
import type { TextureParams } from './types';

/**
 * Void Ambience - the sound of infinite emptiness
 */
class VoidTexture {
  private noiseFloor: Tone.Noise;
  private noiseFilter: Tone.Filter;
  private noiseGain: Tone.Gain;

  // Sparse high-frequency "stars"
  private starSynth: Tone.Synth;
  private starGain: Tone.Gain;

  // Low rumbles
  private rumbleNoise: Tone.Noise;
  private rumbleFilter: Tone.Filter;
  private rumbleEnvelope: Tone.AmplitudeEnvelope;
  private rumbleGain: Tone.Gain;

  private output: Tone.Gain;
  private isPlaying = false;
  private starSchedulerId: number | null = null;
  private rumbleSchedulerId: number | null = null;

  constructor(destination: Tone.ToneAudioNode) {
    // Ultra-quiet noise floor
    this.noiseFloor = new Tone.Noise('pink');
    this.noiseFilter = new Tone.Filter({
      type: 'lowpass',
      frequency: 3000,
      Q: 0.5,
    });
    this.noiseGain = new Tone.Gain(0.03);

    // Star pings
    this.starSynth = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: {
        attack: 0.01,
        decay: 0.5,
        sustain: 0,
        release: 0.5,
      },
    });
    this.starGain = new Tone.Gain(0.1);

    // Deep rumbles
    this.rumbleNoise = new Tone.Noise('brown');
    this.rumbleFilter = new Tone.Filter({
      type: 'lowpass',
      frequency: 80,
      Q: 2,
    });
    this.rumbleEnvelope = new Tone.AmplitudeEnvelope({
      attack: 1,
      decay: 0.5,
      sustain: 0.5,
      release: 2,
    });
    this.rumbleGain = new Tone.Gain(0.2);

    this.output = new Tone.Gain(0);

    // Connect
    this.noiseFloor.connect(this.noiseFilter);
    this.noiseFilter.connect(this.noiseGain);
    this.noiseGain.connect(this.output);

    this.starSynth.connect(this.starGain);
    this.starGain.connect(this.output);

    this.rumbleNoise.connect(this.rumbleFilter);
    this.rumbleFilter.connect(this.rumbleEnvelope);
    this.rumbleEnvelope.connect(this.rumbleGain);
    this.rumbleGain.connect(this.output);

    this.output.connect(destination);
  }

  start(): void {
    if (this.isPlaying) return;
    this.isPlaying = true;

    this.noiseFloor.start();
    this.rumbleNoise.start();

    this.scheduleStars();
    this.scheduleRumbles();
  }

  stop(): void {
    if (!this.isPlaying) return;
    this.isPlaying = false;

    this.noiseFloor.stop();
    this.rumbleNoise.stop();

    if (this.starSchedulerId) Tone.getTransport().clear(this.starSchedulerId);
    if (this.rumbleSchedulerId) Tone.getTransport().clear(this.rumbleSchedulerId);
  }

  private scheduleStars(): void {
    if (!this.isPlaying) return;

    const interval = 3 + Math.random() * 10;
    this.starSchedulerId = Tone.getTransport().scheduleOnce(() => {
      const freq = 3000 + Math.random() * 5000;
      this.starSynth.triggerAttackRelease(freq, '8n', Tone.now(), 0.05 + Math.random() * 0.1);
      this.scheduleStars();
    }, `+${interval}`);
  }

  private scheduleRumbles(): void {
    if (!this.isPlaying) return;

    const interval = 15 + Math.random() * 45;
    this.rumbleSchedulerId = Tone.getTransport().scheduleOnce(() => {
      const duration = 2 + Math.random() * 3;
      this.rumbleEnvelope.triggerAttackRelease(duration);
      this.scheduleRumbles();
    }, `+${interval}`);
  }

  setLevel(level: number): void {
    this.output.gain.rampTo(level, 0.5);
  }

  dispose(): void {
    this.stop();
    this.noiseFloor.dispose();
    this.noiseFilter.dispose();
    this.noiseGain.dispose();
    this.starSynth.dispose();
    this.starGain.dispose();
    this.rumbleNoise.dispose();
    this.rumbleFilter.dispose();
    this.rumbleEnvelope.dispose();
    this.rumbleGain.dispose();
    this.output.dispose();
  }
}

/**
 * Stone/Architecture - cyclopean structures
 */
class StoneTexture {
  private resonators: Tone.Filter[];
  private resonatorGains: Tone.Gain[];
  private creakSynth: Tone.MetalSynth;
  private creakFilter: Tone.Filter;
  private creakGain: Tone.Gain;
  private reverb: Tone.Reverb;
  private output: Tone.Gain;

  private isPlaying = false;
  private creakSchedulerId: number | null = null;

  constructor(destination: Tone.ToneAudioNode) {
    // Resonant modes (frequencies that "ring" in stone)
    const resonantFreqs = [110, 220, 330, 165, 275];
    this.resonators = [];
    this.resonatorGains = [];

    for (const freq of resonantFreqs) {
      const filter = new Tone.Filter({
        type: 'bandpass',
        frequency: freq,
        Q: 30,
      });
      const gain = new Tone.Gain(0.1);
      this.resonators.push(filter);
      this.resonatorGains.push(gain);
    }

    // Creak/groan sounds
    this.creakSynth = new Tone.MetalSynth({
      envelope: {
        attack: 0.5,
        decay: 1,
        release: 2,
      },
      harmonicity: 3.1,
      modulationIndex: 16,
      resonance: 2000,
      octaves: 0.5,
    });
    this.creakSynth.frequency.value = 100;

    this.creakFilter = new Tone.Filter({
      type: 'lowpass',
      frequency: 500,
      Q: 1,
    });

    this.creakGain = new Tone.Gain(0.2);

    this.reverb = new Tone.Reverb({
      decay: 8,
      wet: 0.6,
    });

    this.output = new Tone.Gain(0);

    // Connect resonators
    this.resonatorGains.forEach(gain => gain.connect(this.reverb));

    // Connect creak
    this.creakSynth.connect(this.creakFilter);
    this.creakFilter.connect(this.creakGain);
    this.creakGain.connect(this.reverb);

    this.reverb.connect(this.output);
    this.output.connect(destination);
  }

  start(): void {
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.scheduleCreaks();
  }

  stop(): void {
    if (!this.isPlaying) return;
    this.isPlaying = false;

    if (this.creakSchedulerId) Tone.getTransport().clear(this.creakSchedulerId);
  }

  private scheduleCreaks(): void {
    if (!this.isPlaying) return;

    const interval = 10 + Math.random() * 30;
    this.creakSchedulerId = Tone.getTransport().scheduleOnce(() => {
      const freq = 50 + Math.random() * 100;
      this.creakSynth.frequency.setValueAtTime(freq, Tone.now());
      this.creakSynth.triggerAttackRelease('2n', Tone.now(), 0.3);
      this.scheduleCreaks();
    }, `+${interval}`);
  }

  /**
   * Trigger a resonant event (can be called externally)
   */
  triggerResonance(): void {
    // Trigger random resonator - would need impulse, simplified for now
    const _idx = Math.floor(Math.random() * this.resonators.length);
    void _idx; // Suppress unused warning
  }

  setLevel(level: number): void {
    this.output.gain.rampTo(level, 0.5);
  }

  dispose(): void {
    this.stop();
    this.resonators.forEach(r => r.dispose());
    this.resonatorGains.forEach(g => g.dispose());
    this.creakSynth.dispose();
    this.creakFilter.dispose();
    this.creakGain.dispose();
    this.reverb.dispose();
    this.output.dispose();
  }
}

/**
 * Water/Depths - submerged in liquid void
 */
class WaterTexture {
  private noise: Tone.Noise;
  private bandpass: Tone.Filter;
  private lowpass: Tone.Filter;
  private filterLfo: Tone.LFO;

  // Pressure hum
  private pressureOsc: Tone.Oscillator;
  private pressureGain: Tone.Gain;

  // Bubble sounds
  private bubbleSynth: Tone.Synth;
  private bubbleGain: Tone.Gain;

  private chorus: Tone.Chorus;
  private reverb: Tone.Reverb;
  private output: Tone.Gain;

  private isPlaying = false;
  private bubbleSchedulerId: number | null = null;

  constructor(destination: Tone.ToneAudioNode) {
    // Filtered noise for water ambience
    this.noise = new Tone.Noise('pink');
    this.bandpass = new Tone.Filter({
      type: 'bandpass',
      frequency: 800,
      Q: 1,
    });
    this.lowpass = new Tone.Filter({
      type: 'lowpass',
      frequency: 1500,
      Q: 0.5,
    });

    this.filterLfo = new Tone.LFO({
      frequency: 0.1,
      min: 500,
      max: 1500,
      type: 'sine',
    });

    // Deep pressure hum
    this.pressureOsc = new Tone.Oscillator({
      frequency: 40,
      type: 'sine',
    });
    this.pressureGain = new Tone.Gain(0.15);

    // Bubbles
    this.bubbleSynth = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: {
        attack: 0.01,
        decay: 0.1,
        sustain: 0,
        release: 0.1,
      },
    });
    this.bubbleGain = new Tone.Gain(0.1);

    // Effects
    this.chorus = new Tone.Chorus({
      frequency: 0.5,
      delayTime: 5,
      depth: 0.5,
      wet: 0.4,
    }).start();

    this.reverb = new Tone.Reverb({
      decay: 5,
      wet: 0.5,
    });

    this.output = new Tone.Gain(0);

    // Connect water noise path
    this.noise.connect(this.bandpass);
    this.bandpass.connect(this.lowpass);
    this.lowpass.connect(this.chorus);
    this.filterLfo.connect(this.bandpass.frequency);

    // Connect pressure
    this.pressureOsc.connect(this.pressureGain);
    this.pressureGain.connect(this.output);

    // Connect bubbles
    this.bubbleSynth.connect(this.bubbleGain);
    this.bubbleGain.connect(this.reverb);

    this.chorus.connect(this.reverb);
    this.reverb.connect(this.output);
    this.output.connect(destination);
  }

  start(): void {
    if (this.isPlaying) return;
    this.isPlaying = true;

    this.noise.start();
    this.pressureOsc.start();
    this.filterLfo.start();
    this.scheduleBubbles();
  }

  stop(): void {
    if (!this.isPlaying) return;
    this.isPlaying = false;

    this.noise.stop();
    this.pressureOsc.stop();
    this.filterLfo.stop();

    if (this.bubbleSchedulerId) Tone.getTransport().clear(this.bubbleSchedulerId);
  }

  private scheduleBubbles(): void {
    if (!this.isPlaying) return;

    const interval = 2 + Math.random() * 5;
    this.bubbleSchedulerId = Tone.getTransport().scheduleOnce(() => {
      // Bubble: high freq that drops
      const startFreq = 800 + Math.random() * 400;
      this.bubbleSynth.triggerAttack(startFreq, Tone.now(), 0.1);
      this.bubbleSynth.frequency.rampTo(startFreq * 0.5, 0.15);
      this.bubbleSynth.triggerRelease('+0.15');
      this.scheduleBubbles();
    }, `+${interval}`);
  }

  setLevel(level: number): void {
    this.output.gain.rampTo(level, 0.5);
  }

  dispose(): void {
    this.stop();
    this.noise.dispose();
    this.bandpass.dispose();
    this.lowpass.dispose();
    this.filterLfo.dispose();
    this.pressureOsc.dispose();
    this.pressureGain.dispose();
    this.bubbleSynth.dispose();
    this.bubbleGain.dispose();
    this.chorus.dispose();
    this.reverb.dispose();
    this.output.dispose();
  }
}

/**
 * Static/Transmission - radio from beyond
 */
class StaticTexture {
  private noise: Tone.Noise;
  private bandpass: Tone.Filter;
  private bandpassLfo: Tone.LFO;

  // Signal tones
  private signalOsc: Tone.Oscillator;
  private signalGain: Tone.Gain;
  private signalEnvelope: Tone.AmplitudeEnvelope;

  // AM modulation for wavering signal
  private amLfo: Tone.LFO;

  private bitcrusher: Tone.BitCrusher;
  private output: Tone.Gain;

  private isPlaying = false;
  private signalSchedulerId: number | null = null;

  constructor(destination: Tone.ToneAudioNode) {
    // Static noise
    this.noise = new Tone.Noise('white');
    this.bandpass = new Tone.Filter({
      type: 'bandpass',
      frequency: 2000,
      Q: 2,
    });

    this.bandpassLfo = new Tone.LFO({
      frequency: 0.3,
      min: 800,
      max: 4000,
      type: 'sine',
    });

    // Signal breaking through
    this.signalOsc = new Tone.Oscillator({
      frequency: 1000,
      type: 'sine',
    });
    this.signalGain = new Tone.Gain(0);
    this.signalEnvelope = new Tone.AmplitudeEnvelope({
      attack: 0.5,
      decay: 0.3,
      sustain: 0.5,
      release: 1,
    });

    // AM for wavering
    this.amLfo = new Tone.LFO({
      frequency: 3,
      min: 0.3,
      max: 1,
      type: 'sine',
    });

    // Lo-fi effect
    this.bitcrusher = new Tone.BitCrusher(6);

    this.output = new Tone.Gain(0);

    // Connect
    this.noise.connect(this.bandpass);
    this.bandpass.connect(this.bitcrusher);
    this.bandpassLfo.connect(this.bandpass.frequency);

    this.signalOsc.connect(this.signalEnvelope);
    this.signalEnvelope.connect(this.signalGain);
    this.amLfo.connect(this.signalGain.gain);
    this.signalGain.connect(this.bitcrusher);

    this.bitcrusher.connect(this.output);
    this.output.connect(destination);
  }

  start(): void {
    if (this.isPlaying) return;
    this.isPlaying = true;

    this.noise.start();
    this.signalOsc.start();
    this.bandpassLfo.start();
    this.amLfo.start();
    this.scheduleSignals();
  }

  stop(): void {
    if (!this.isPlaying) return;
    this.isPlaying = false;

    this.noise.stop();
    this.signalOsc.stop();
    this.bandpassLfo.stop();
    this.amLfo.stop();

    if (this.signalSchedulerId) Tone.getTransport().clear(this.signalSchedulerId);
  }

  private scheduleSignals(): void {
    if (!this.isPlaying) return;

    const interval = 5 + Math.random() * 15;
    this.signalSchedulerId = Tone.getTransport().scheduleOnce(() => {
      const freq = 400 + Math.random() * 1200;
      this.signalOsc.frequency.setValueAtTime(freq, Tone.now());
      const duration = 1 + Math.random() * 2;
      this.signalEnvelope.triggerAttackRelease(duration);
      this.scheduleSignals();
    }, `+${interval}`);
  }

  setLevel(level: number): void {
    this.output.gain.rampTo(level * 0.3, 0.5); // Static is harsh, reduce level
  }

  dispose(): void {
    this.stop();
    this.noise.dispose();
    this.bandpass.dispose();
    this.bandpassLfo.dispose();
    this.signalOsc.dispose();
    this.signalGain.dispose();
    this.signalEnvelope.dispose();
    this.amLfo.dispose();
    this.bitcrusher.dispose();
    this.output.dispose();
  }
}

/**
 * Organic/Biological - things growing and moving
 */
class OrganicTexture {
  private noise: Tone.Noise;
  private wetFilter: Tone.Filter;
  private filterLfo: Tone.LFO;

  // Stretch/growth sounds
  private stretchSynth: Tone.FMSynth;
  private stretchGain: Tone.Gain;

  // Pulse/circulation
  private pulseNoise: Tone.Noise;
  private pulseFilter: Tone.Filter;
  private pulseLfo: Tone.LFO;
  private pulseGain: Tone.Gain;

  private distortion: Tone.Distortion;
  private reverb: Tone.Reverb;
  private output: Tone.Gain;

  private isPlaying = false;
  private stretchSchedulerId: number | null = null;

  constructor(destination: Tone.ToneAudioNode) {
    // Wet ambient noise
    this.noise = new Tone.Noise('pink');
    this.wetFilter = new Tone.Filter({
      type: 'lowpass',
      frequency: 600,
      Q: 3,
    });
    this.filterLfo = new Tone.LFO({
      frequency: 0.2,
      min: 300,
      max: 900,
      type: 'sine',
    });

    // Stretch sounds
    this.stretchSynth = new Tone.FMSynth({
      harmonicity: 1.5,
      modulationIndex: 5,
      envelope: {
        attack: 1,
        decay: 0.5,
        sustain: 0.3,
        release: 2,
      },
      modulation: { type: 'sine' },
    });
    this.stretchGain = new Tone.Gain(0.15);

    // Circulation pulse
    this.pulseNoise = new Tone.Noise('brown');
    this.pulseFilter = new Tone.Filter({
      type: 'bandpass',
      frequency: 100,
      Q: 5,
    });
    this.pulseLfo = new Tone.LFO({
      frequency: 1.2, // Heartbeat-ish
      min: 0,
      max: 0.3,
      type: 'sine',
    });
    this.pulseGain = new Tone.Gain(0);

    // Tissue-like distortion
    this.distortion = new Tone.Distortion({
      distortion: 0.2,
      wet: 0.3,
    });

    this.reverb = new Tone.Reverb({
      decay: 2,
      wet: 0.3,
    });

    this.output = new Tone.Gain(0);

    // Connect wet noise
    this.noise.connect(this.wetFilter);
    this.wetFilter.connect(this.distortion);
    this.filterLfo.connect(this.wetFilter.frequency);

    // Connect stretch
    this.stretchSynth.connect(this.stretchGain);
    this.stretchGain.connect(this.distortion);

    // Connect pulse
    this.pulseNoise.connect(this.pulseFilter);
    this.pulseFilter.connect(this.pulseGain);
    this.pulseLfo.connect(this.pulseGain.gain);
    this.pulseGain.connect(this.distortion);

    this.distortion.connect(this.reverb);
    this.reverb.connect(this.output);
    this.output.connect(destination);
  }

  start(): void {
    if (this.isPlaying) return;
    this.isPlaying = true;

    this.noise.start();
    this.pulseNoise.start();
    this.filterLfo.start();
    this.pulseLfo.start();
    this.scheduleStretches();
  }

  stop(): void {
    if (!this.isPlaying) return;
    this.isPlaying = false;

    this.noise.stop();
    this.pulseNoise.stop();
    this.filterLfo.stop();
    this.pulseLfo.stop();

    if (this.stretchSchedulerId) Tone.getTransport().clear(this.stretchSchedulerId);
  }

  private scheduleStretches(): void {
    if (!this.isPlaying) return;

    const interval = 8 + Math.random() * 20;
    this.stretchSchedulerId = Tone.getTransport().scheduleOnce(() => {
      const freq = 50 + Math.random() * 100;
      this.stretchSynth.triggerAttackRelease(freq, '2n', Tone.now(), 0.3);
      this.scheduleStretches();
    }, `+${interval}`);
  }

  setLevel(level: number): void {
    this.output.gain.rampTo(level, 0.5);
  }

  dispose(): void {
    this.stop();
    this.noise.dispose();
    this.wetFilter.dispose();
    this.filterLfo.dispose();
    this.stretchSynth.dispose();
    this.stretchGain.dispose();
    this.pulseNoise.dispose();
    this.pulseFilter.dispose();
    this.pulseLfo.dispose();
    this.pulseGain.dispose();
    this.distortion.dispose();
    this.reverb.dispose();
    this.output.dispose();
  }
}

/**
 * Main Texture System
 */
export class TextureSystem {
  private _output: Tone.Channel;
  private params: TextureParams;

  private void: VoidTexture;
  private stone: StoneTexture;
  private water: WaterTexture;
  private static_: StaticTexture;
  private organic: OrganicTexture;

  private isPlaying = false;

  constructor(output: Tone.Channel, params: TextureParams) {
    this._output = output;
    this.params = { ...params };

    // Create all textures
    this.void = new VoidTexture(this._output);
    this.stone = new StoneTexture(this._output);
    this.water = new WaterTexture(this._output);
    this.static_ = new StaticTexture(this._output);
    this.organic = new OrganicTexture(this._output);

    // Set initial levels
    this.setParams(params);
  }

  start(): void {
    if (this.isPlaying) return;
    this.isPlaying = true;

    if (Tone.getTransport().state !== 'started') {
      Tone.getTransport().start();
    }

    // Start all textures (they control their own levels)
    this.void.start();
    this.stone.start();
    this.water.start();
    this.static_.start();
    this.organic.start();

    console.log('TextureSystem started');
  }

  stop(): void {
    if (!this.isPlaying) return;
    this.isPlaying = false;

    this.void.stop();
    this.stone.stop();
    this.water.stop();
    this.static_.stop();
    this.organic.stop();

    console.log('TextureSystem stopped');
  }

  setParams(params: TextureParams): void {
    this.params = { ...params };

    this.void.setLevel(params.void);
    this.stone.setLevel(params.stone);
    this.water.setLevel(params.water);
    this.static_.setLevel(params.static);
    this.organic.setLevel(params.organic);
  }

  setLayerModulation(layer: number, _stability: number): void {
    const layerFactor = layer / 5;

    // Layer affects which textures are emphasized
    // Deeper = more water, static, organic; less void
    const voidMod = Math.max(0, this.params.void - layerFactor * 0.2);
    const stoneMod = this.params.stone + layerFactor * 0.1;
    const waterMod = this.params.water + layerFactor * 0.15;
    const staticMod = this.params.static + layerFactor * 0.2;
    const organicMod = this.params.organic + layerFactor * 0.15;

    this.void.setLevel(voidMod);
    this.stone.setLevel(Math.min(1, stoneMod));
    this.water.setLevel(Math.min(1, waterMod));
    this.static_.setLevel(Math.min(1, staticMod));
    this.organic.setLevel(Math.min(1, organicMod));
  }

  dispose(): void {
    this.stop();
    this.void.dispose();
    this.stone.dispose();
    this.water.dispose();
    this.static_.dispose();
    this.organic.dispose();
  }
}
