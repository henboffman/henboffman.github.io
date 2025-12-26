// THE DESCENT - Wrongness Engine
// Audio anomalies: pitch drift, temporal errors, spatial confusion

import * as Tone from 'tone';
import type { WrongnessParams } from './types';

/**
 * Perlin-like noise generator for smooth random values
 */
class SmoothNoise {
  private values: number[] = [];
  private resolution = 256;

  constructor() {
    // Pre-generate smooth noise values
    for (let i = 0; i < this.resolution; i++) {
      this.values.push(Math.random() * 2 - 1);
    }
  }

  /**
   * Get interpolated noise value at a position
   */
  getValue(position: number): number {
    const scaledPos = (position % 1) * this.resolution;
    const i0 = Math.floor(scaledPos) % this.resolution;
    const i1 = (i0 + 1) % this.resolution;
    const fract = scaledPos - Math.floor(scaledPos);

    // Smooth interpolation
    const t = fract * fract * (3 - 2 * fract);
    return this.values[i0] * (1 - t) + this.values[i1] * t;
  }
}

/**
 * Wrongness Engine - creates audio anomalies
 */
export class WrongnessEngine {
  private params: WrongnessParams;
  private isRunning = false;

  // Noise generators for different modulation sources
  private pitchNoise: SmoothNoise;
  private temporalNoise: SmoothNoise;
  private spatialNoise: SmoothNoise;

  // Time tracking for noise sampling
  private time = 0;
  private lastTime = 0;

  // Event scheduling
  private eventSchedulerId: number | null = null;
  private animationFrameId: number | null = null;

  // Callbacks for applying wrongness to other systems
  private onPitchDrift: ((cents: number) => void) | null = null;
  private onTemporalShift: ((ms: number) => void) | null = null;
  private onSpatialAnomaly: ((pan: number) => void) | null = null;
  private onWrongnessEvent: ((type: string) => void) | null = null;

  // Current wrongness values
  private currentPitchDrift = 0;
  private currentTemporalOffset = 0;
  private currentSpatialPhase = 0;

  constructor(params: WrongnessParams) {
    this.params = { ...params };

    this.pitchNoise = new SmoothNoise();
    this.temporalNoise = new SmoothNoise();
    this.spatialNoise = new SmoothNoise();
  }

  /**
   * Register callbacks for wrongness effects
   */
  registerCallbacks(callbacks: {
    onPitchDrift?: (cents: number) => void;
    onTemporalShift?: (ms: number) => void;
    onSpatialAnomaly?: (pan: number) => void;
    onWrongnessEvent?: (type: string) => void;
  }): void {
    if (callbacks.onPitchDrift) this.onPitchDrift = callbacks.onPitchDrift;
    if (callbacks.onTemporalShift) this.onTemporalShift = callbacks.onTemporalShift;
    if (callbacks.onSpatialAnomaly) this.onSpatialAnomaly = callbacks.onSpatialAnomaly;
    if (callbacks.onWrongnessEvent) this.onWrongnessEvent = callbacks.onWrongnessEvent;
  }

  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();

    // Start animation frame loop for continuous modulation
    this.updateLoop();

    // Schedule random wrongness events
    this.scheduleEvents();

    console.log('WrongnessEngine started');
  }

  stop(): void {
    if (!this.isRunning) return;
    this.isRunning = false;

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.eventSchedulerId !== null) {
      Tone.getTransport().clear(this.eventSchedulerId);
      this.eventSchedulerId = null;
    }

    console.log('WrongnessEngine stopped');
  }

  /**
   * Main update loop - calculates and applies continuous wrongness
   */
  private updateLoop(): void {
    if (!this.isRunning) return;

    const now = performance.now();
    const deltaTime = (now - this.lastTime) / 1000;
    this.lastTime = now;
    this.time += deltaTime;

    // Calculate wrongness values based on intensity
    const intensity = this.params.intensity;

    if (intensity > 0) {
      // Pitch drift
      if (this.params.pitchDrift > 0) {
        const pitchNoiseValue = this.pitchNoise.getValue(this.time * 0.1);
        this.currentPitchDrift = pitchNoiseValue * this.params.pitchDrift * intensity;
        this.onPitchDrift?.(this.currentPitchDrift);
      }

      // Temporal offset (phase shifting)
      if (this.params.temporalOffset > 0) {
        const temporalNoiseValue = this.temporalNoise.getValue(this.time * 0.05);
        this.currentTemporalOffset = temporalNoiseValue * this.params.temporalOffset * intensity;
        this.onTemporalShift?.(this.currentTemporalOffset);
      }

      // Spatial anomaly (stereo weirdness)
      if (this.params.spatialPhase > 0) {
        const spatialNoiseValue = this.spatialNoise.getValue(this.time * 0.08);
        this.currentSpatialPhase = spatialNoiseValue * (this.params.spatialPhase / 50) * intensity;
        this.onSpatialAnomaly?.(this.currentSpatialPhase);
      }
    }

    this.animationFrameId = requestAnimationFrame(() => this.updateLoop());
  }

  /**
   * Schedule random wrongness events
   */
  private scheduleEvents(): void {
    if (!this.isRunning) return;

    const eventChance = this.params.eventChance * this.params.intensity;
    if (eventChance <= 0) {
      // Reschedule check
      this.eventSchedulerId = Tone.getTransport().scheduleOnce(() => {
        this.scheduleEvents();
      }, '+2');
      return;
    }

    // Calculate time until next event (exponential distribution)
    const meanInterval = 1 / eventChance;
    const interval = -Math.log(1 - Math.random()) * meanInterval;

    this.eventSchedulerId = Tone.getTransport().scheduleOnce(() => {
      this.triggerWrongnessEvent();
      this.scheduleEvents();
    }, `+${Math.max(0.5, interval)}`);
  }

  /**
   * Trigger a random wrongness event
   */
  private triggerWrongnessEvent(): void {
    const eventTypes = [
      'pitch_drop',      // Sudden pitch drop
      'audio_glitch',    // Brief silence/stutter
      'reverb_tail',     // Only reverb, no dry signal
      'stereo_collapse', // Mono for a moment
      'harmonic_freeze', // One frequency sustains
      'time_stretch',    // Brief slow-down
    ];

    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];

    console.log(`Wrongness event: ${eventType}`);
    this.onWrongnessEvent?.(eventType);

    // Each event type could have its own implementation
    // For now we just notify callbacks
  }

  setParams(params: WrongnessParams): void {
    this.params = { ...params };
  }

  /**
   * Get current wrongness values
   */
  getCurrentValues(): {
    pitchDrift: number;
    temporalOffset: number;
    spatialPhase: number;
    intensity: number;
  } {
    return {
      pitchDrift: this.currentPitchDrift,
      temporalOffset: this.currentTemporalOffset,
      spatialPhase: this.currentSpatialPhase,
      intensity: this.params.intensity,
    };
  }

  /**
   * Get intensity
   */
  getIntensity(): number {
    return this.params.intensity;
  }

  dispose(): void {
    this.stop();
  }
}
