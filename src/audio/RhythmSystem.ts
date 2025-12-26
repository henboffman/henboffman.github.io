// THE DESCENT - Rhythm System
// Organic rhythmic undercurrents: pulse, breath, clicks

import * as Tone from 'tone';
import type { RhythmParams } from './types';

/**
 * The Pulse - an almost-heartbeat that drifts and skips
 */
class PulseGenerator {
  private lowThump: Tone.MembraneSynth;
  private subTail: Tone.Oscillator;
  private subEnvelope: Tone.AmplitudeEnvelope;
  private transient: Tone.NoiseSynth;
  private output: Tone.Gain;

  private schedulerId: number | null = null;
  private currentBpm = 65;
  private variance = 5;
  private skipChance = 3;
  private isPlaying = false;

  constructor(destination: Tone.ToneAudioNode) {
    // Low thump (membrane synth for the body)
    this.lowThump = new Tone.MembraneSynth({
      pitchDecay: 0.05,
      octaves: 4,
      oscillator: { type: 'sine' },
      envelope: {
        attack: 0.001,
        decay: 0.3,
        sustain: 0,
        release: 0.3,
      },
    });

    // Sub-bass tail
    this.subTail = new Tone.Oscillator({
      frequency: 30,
      type: 'sine',
    });
    this.subEnvelope = new Tone.AmplitudeEnvelope({
      attack: 0.01,
      decay: 0.2,
      sustain: 0,
      release: 0.2,
    });

    // High transient click
    this.transient = new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: {
        attack: 0.001,
        decay: 0.01,
        sustain: 0,
        release: 0.01,
      },
    });

    // Output gain
    this.output = new Tone.Gain(0.5);

    // Connect
    this.lowThump.connect(this.output);
    this.subTail.connect(this.subEnvelope);
    this.subEnvelope.connect(this.output);
    this.transient.connect(this.output);
    this.output.connect(destination);
  }

  start(): void {
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.subTail.start();

    if (Tone.getTransport().state !== 'started') {
      Tone.getTransport().start();
    }

    this.scheduleNextPulse();
  }

  stop(): void {
    if (!this.isPlaying) return;
    this.isPlaying = false;

    if (this.schedulerId !== null) {
      Tone.getTransport().clear(this.schedulerId);
      this.schedulerId = null;
    }
    this.subTail.stop();
  }

  private scheduleNextPulse(): void {
    if (!this.isPlaying) return;

    // Calculate interval with variance
    const baseInterval = 60 / this.currentBpm;
    const varianceFactor = (Math.random() - 0.5) * 2 * (this.variance / 100);
    const interval = baseInterval * (1 + varianceFactor);

    this.schedulerId = Tone.getTransport().scheduleOnce((time) => {
      // Skip check
      if (Math.random() * 100 > this.skipChance) {
        this.triggerPulse(time);
      }

      // Rare double beat
      if (Math.random() < 0.03) {
        Tone.getTransport().scheduleOnce((t) => {
          this.triggerPulse(t);
        }, time + 0.15);
      }

      this.scheduleNextPulse();
    }, `+${interval}`);
  }

  private triggerPulse(time: number): void {
    // Slightly randomize pitch for each beat
    const pitchVar = 70 + (Math.random() - 0.5) * 20;
    this.lowThump.triggerAttackRelease(pitchVar, '8n', time, 0.7);
    this.subEnvelope.triggerAttackRelease('4n', time);
    this.transient.triggerAttackRelease('32n', time, 0.3);
  }

  setParams(bpm: number, variance: number, skipChance: number): void {
    this.currentBpm = bpm;
    this.variance = variance;
    this.skipChance = skipChance;
  }

  dispose(): void {
    this.stop();
    this.lowThump.dispose();
    this.subTail.dispose();
    this.subEnvelope.dispose();
    this.transient.dispose();
    this.output.dispose();
  }
}

/**
 * The Breath - vast inhalation/exhalation cycle
 */
class BreathGenerator {
  private noise: Tone.Noise;
  private filter: Tone.Filter;
  private lfo: Tone.LFO;
  private output: Tone.Gain;
  private envelope: Tone.Gain;

  private breathCycle = 12; // seconds
  private isPlaying = false;
  private schedulerId: number | null = null;

  constructor(destination: Tone.ToneAudioNode) {
    // Filtered noise for breath sound
    this.noise = new Tone.Noise('pink');

    this.filter = new Tone.Filter({
      type: 'bandpass',
      frequency: 500,
      Q: 1,
    });

    // LFO for filter sweep (inhale = low to high, exhale = high to low)
    this.lfo = new Tone.LFO({
      frequency: 1 / this.breathCycle,
      min: 200,
      max: 2000,
      type: 'sine',
    });

    this.envelope = new Tone.Gain(0);
    this.output = new Tone.Gain(0.15);

    // Connect
    this.noise.connect(this.filter);
    this.filter.connect(this.envelope);
    this.envelope.connect(this.output);
    this.output.connect(destination);
    this.lfo.connect(this.filter.frequency);
  }

  start(): void {
    if (this.isPlaying) return;
    this.isPlaying = true;

    this.noise.start();
    this.lfo.start();

    if (Tone.getTransport().state !== 'started') {
      Tone.getTransport().start();
    }

    this.animateBreath();
  }

  stop(): void {
    if (!this.isPlaying) return;
    this.isPlaying = false;

    if (this.schedulerId !== null) {
      Tone.getTransport().clear(this.schedulerId);
      this.schedulerId = null;
    }

    this.noise.stop();
    this.lfo.stop();
  }

  private animateBreath(): void {
    if (!this.isPlaying) return;

    const halfCycle = this.breathCycle / 2;

    // Inhale - volume up
    this.envelope.gain.rampTo(1, halfCycle);

    this.schedulerId = Tone.getTransport().scheduleOnce(() => {
      if (!this.isPlaying) return;

      // Exhale - volume down
      this.envelope.gain.rampTo(0.2, halfCycle);

      Tone.getTransport().scheduleOnce(() => {
        // Occasional held breath (pause)
        if (Math.random() < 0.1) {
          Tone.getTransport().scheduleOnce(() => {
            this.animateBreath();
          }, `+${2 + Math.random() * 3}`);
        } else {
          this.animateBreath();
        }
      }, `+${halfCycle}`);
    }, `+${halfCycle}`);
  }

  setBreathCycle(seconds: number): void {
    this.breathCycle = seconds;
    this.lfo.frequency.rampTo(1 / seconds, 1);
  }

  dispose(): void {
    this.stop();
    this.noise.dispose();
    this.filter.dispose();
    this.lfo.dispose();
    this.envelope.dispose();
    this.output.dispose();
  }
}

/**
 * Click Echo System - responds to something clicking back
 */
class ClickEchoSystem {
  private synth: Tone.MetalSynth;
  private delay: Tone.PingPongDelay;
  private output: Tone.Gain;

  private isEnabled = false;

  constructor(destination: Tone.ToneAudioNode) {
    this.synth = new Tone.MetalSynth({
      envelope: {
        attack: 0.001,
        decay: 0.05,
        release: 0.05,
      },
      harmonicity: 5.1,
      modulationIndex: 32,
      resonance: 4000,
      octaves: 1.5,
    });
    this.synth.frequency.value = 200;

    this.delay = new Tone.PingPongDelay({
      delayTime: '8n',
      feedback: 0.3,
      wet: 0.5,
    });

    this.output = new Tone.Gain(0.3);

    this.synth.connect(this.delay);
    this.delay.connect(this.output);
    this.output.connect(destination);
  }

  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Trigger echo click (call this when user clicks if echo is enabled)
   */
  triggerEcho(): void {
    if (!this.isEnabled) return;

    // Delayed echo clicks
    const delayMs = 50 + Math.random() * 150;
    setTimeout(() => {
      const freq = 150 + Math.random() * 100;
      this.synth.frequency.setValueAtTime(freq, Tone.now());
      this.synth.triggerAttackRelease('32n', Tone.now(), 0.3);
    }, delayMs);

    // Sometimes multiple echoes
    if (Math.random() < 0.3) {
      setTimeout(() => {
        const freq = 180 + Math.random() * 80;
        this.synth.frequency.setValueAtTime(freq, Tone.now());
        this.synth.triggerAttackRelease('32n', Tone.now(), 0.2);
      }, delayMs + 100 + Math.random() * 100);
    }
  }

  /**
   * Autonomous clicks (something clicking on its own)
   */
  triggerAutonomous(): void {
    const freq = 120 + Math.random() * 150;
    this.synth.frequency.setValueAtTime(freq, Tone.now());
    this.synth.triggerAttackRelease('32n', Tone.now(), 0.2);
  }

  dispose(): void {
    this.synth.dispose();
    this.delay.dispose();
    this.output.dispose();
  }
}

/**
 * Main Rhythm System
 */
export class RhythmSystem {
  private _output: Tone.Channel;
  private params: RhythmParams;

  private pulse: PulseGenerator;
  private breath: BreathGenerator;
  private clickEcho: ClickEchoSystem;

  private isPlaying = false;
  private autonomousClickId: number | null = null;

  constructor(output: Tone.Channel, params: RhythmParams) {
    this._output = output;
    this.params = { ...params };

    // Create subsystems
    this.pulse = new PulseGenerator(this._output);
    this.breath = new BreathGenerator(this._output);
    this.clickEcho = new ClickEchoSystem(this._output);

    // Apply initial params
    this.setParams(params);
  }

  start(): void {
    if (this.isPlaying) return;
    this.isPlaying = true;

    if (this.params.pulseEnabled) {
      this.pulse.start();
    }
    if (this.params.breathEnabled) {
      this.breath.start();
    }

    // Start autonomous clicking if enabled
    this.scheduleAutonomousClicks();

    console.log('RhythmSystem started');
  }

  stop(): void {
    if (!this.isPlaying) return;
    this.isPlaying = false;

    this.pulse.stop();
    this.breath.stop();

    if (this.autonomousClickId !== null) {
      Tone.getTransport().clear(this.autonomousClickId);
      this.autonomousClickId = null;
    }

    console.log('RhythmSystem stopped');
  }

  private scheduleAutonomousClicks(): void {
    if (!this.isPlaying || !this.params.clickEchoEnabled) return;

    // Random interval for autonomous clicks
    const interval = 5 + Math.random() * 15;

    this.autonomousClickId = Tone.getTransport().scheduleOnce(() => {
      if (Math.random() < 0.3) {
        this.clickEcho.triggerAutonomous();
      }
      this.scheduleAutonomousClicks();
    }, `+${interval}`);
  }

  /**
   * Call this when user clicks (for echo system)
   */
  onUserClick(): void {
    if (this.params.clickEchoEnabled) {
      this.clickEcho.triggerEcho();
    }
  }

  setParams(params: RhythmParams): void {
    const wasPlaying = this.isPlaying;

    // Handle pulse enable/disable
    if (params.pulseEnabled !== this.params.pulseEnabled) {
      if (params.pulseEnabled && wasPlaying) {
        this.pulse.start();
      } else {
        this.pulse.stop();
      }
    }

    // Handle breath enable/disable
    if (params.breathEnabled !== this.params.breathEnabled) {
      if (params.breathEnabled && wasPlaying) {
        this.breath.start();
      } else {
        this.breath.stop();
      }
    }

    this.params = { ...params };

    // Update pulse params
    this.pulse.setParams(params.pulseBpm, params.pulseVariance, params.skipChance);

    // Update breath cycle
    this.breath.setBreathCycle(params.breathCycle);

    // Update click echo
    this.clickEcho.setEnabled(params.clickEchoEnabled);
  }

  setLayerModulation(layer: number, stability: number): void {
    const layerFactor = layer / 5;
    const stabilityFactor = stability / 100;

    // Increase BPM with layer and low stability
    const bpmMod = this.params.pulseBpm + (layerFactor * 15) + ((1 - stabilityFactor) * 10);
    const varianceMod = this.params.pulseVariance + (layerFactor * 10);
    const skipMod = this.params.skipChance + (layerFactor * 8);

    this.pulse.setParams(
      Math.min(120, bpmMod),
      Math.min(30, varianceMod),
      Math.min(25, skipMod)
    );

    // Shorter breath cycle at deeper layers
    const breathMod = Math.max(4, this.params.breathCycle - layerFactor * 4);
    this.breath.setBreathCycle(breathMod);
  }

  dispose(): void {
    this.stop();
    this.pulse.dispose();
    this.breath.dispose();
    this.clickEcho.dispose();
  }
}
