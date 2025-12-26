// THE DESCENT - Core Audio Engine
// Master controller for all audio systems using Tone.js

import * as Tone from 'tone';
import {
  AudioState,
  GlobalParams,
  DroneParams,
  WhisperParams,
  RhythmParams,
  TextureParams,
  WrongnessParams,
  DEFAULT_GLOBAL,
  DEFAULT_DRONE,
  DEFAULT_WHISPER,
  DEFAULT_RHYTHM,
  DEFAULT_TEXTURE,
  DEFAULT_WRONGNESS,
} from './types';
import { DroneGenerator } from './DroneGenerator';
import { WhisperSystem } from './WhisperSystem';
import { RhythmSystem } from './RhythmSystem';
import { TextureSystem } from './TextureSystem';
import { WrongnessEngine } from './WrongnessEngine';

export class AudioEngine {
  private isInitialized = false;
  private isPlaying = false;

  // Audio buses (channels)
  private masterChannel: Tone.Channel;
  private droneChannel: Tone.Channel;
  private whisperChannel: Tone.Channel;
  private rhythmChannel: Tone.Channel;
  private textureChannel: Tone.Channel;

  // Master effects
  private masterLimiter: Tone.Limiter;
  private masterCompressor: Tone.Compressor;

  // State
  private state: AudioState;

  // Subsystem references (will be populated in later phases)
  private droneGenerator: DroneGenerator | null = null;
  private whisperSystem: WhisperSystem | null = null;
  private rhythmSystem: RhythmSystem | null = null;
  private textureSystem: TextureSystem | null = null;
  private wrongnessEngine: WrongnessEngine | null = null;

  constructor() {
    // Initialize state with defaults
    this.state = {
      isPlaying: false,
      isInitialized: false,
      global: { ...DEFAULT_GLOBAL },
      drone: { ...DEFAULT_DRONE },
      whisper: { ...DEFAULT_WHISPER },
      rhythm: { ...DEFAULT_RHYTHM },
      texture: { ...DEFAULT_TEXTURE },
      wrongness: { ...DEFAULT_WRONGNESS },
    };

    // Create master effects chain
    this.masterLimiter = new Tone.Limiter(-0.3);
    this.masterCompressor = new Tone.Compressor({
      threshold: -6,
      ratio: 2,
      attack: 0.03,
      release: 0.2,
    });

    // Create master channel
    this.masterChannel = new Tone.Channel({
      volume: this.state.global.masterVolume,
    });

    // Create bus channels with initial volumes
    this.droneChannel = new Tone.Channel({ volume: -12 });
    this.whisperChannel = new Tone.Channel({ volume: -18 });
    this.rhythmChannel = new Tone.Channel({ volume: -15 });
    this.textureChannel = new Tone.Channel({ volume: -20 });

    // Connect routing: buses -> master -> effects -> destination
    this.droneChannel.connect(this.masterChannel);
    this.whisperChannel.connect(this.masterChannel);
    this.rhythmChannel.connect(this.masterChannel);
    this.textureChannel.connect(this.masterChannel);

    this.masterChannel.chain(
      this.masterCompressor,
      this.masterLimiter,
      Tone.getDestination()
    );
  }

  /**
   * Initialize audio context (requires user gesture)
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    await Tone.start();
    console.log('Audio context started');

    // Initialize subsystems
    this.droneGenerator = new DroneGenerator(this.droneChannel, this.state.drone);
    this.whisperSystem = new WhisperSystem(this.whisperChannel, this.state.whisper);
    this.rhythmSystem = new RhythmSystem(this.rhythmChannel, this.state.rhythm);
    this.textureSystem = new TextureSystem(this.textureChannel, this.state.texture);
    this.wrongnessEngine = new WrongnessEngine(this.state.wrongness);

    this.isInitialized = true;
    this.state.isInitialized = true;
    console.log('Audio engine initialized');
  }

  /**
   * Start audio playback
   */
  start(): void {
    if (!this.isInitialized || this.isPlaying) return;

    this.droneGenerator?.start();
    this.whisperSystem?.start();
    this.rhythmSystem?.start();
    this.textureSystem?.start();
    this.wrongnessEngine?.start();

    this.isPlaying = true;
    this.state.isPlaying = true;
    console.log('Audio started');
  }

  /**
   * Stop audio playback
   */
  stop(): void {
    if (!this.isPlaying) return;

    this.droneGenerator?.stop();
    this.whisperSystem?.stop();
    this.rhythmSystem?.stop();
    this.textureSystem?.stop();
    this.wrongnessEngine?.stop();

    this.isPlaying = false;
    this.state.isPlaying = false;
    console.log('Audio stopped');
  }

  /**
   * Get current state
   */
  getState(): AudioState {
    return { ...this.state };
  }

  /**
   * Get playing status
   */
  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  /**
   * Get initialization status
   */
  getIsInitialized(): boolean {
    return this.isInitialized;
  }

  // ===== Parameter Updates =====

  /**
   * Update global parameters
   */
  setGlobal(params: Partial<GlobalParams>): void {
    Object.assign(this.state.global, params);

    if (params.masterVolume !== undefined) {
      this.masterChannel.volume.rampTo(params.masterVolume, 0.1);
    }

    // Layer and stability affect all subsystems
    if (params.layer !== undefined || params.stability !== undefined) {
      this.applyLayerAndStability();
    }
  }

  /**
   * Update drone parameters
   */
  setDrone(params: Partial<DroneParams>): void {
    Object.assign(this.state.drone, params);
    this.droneGenerator?.setParams(this.state.drone);
  }

  /**
   * Update whisper parameters
   */
  setWhisper(params: Partial<WhisperParams>): void {
    Object.assign(this.state.whisper, params);
    this.whisperSystem?.setParams(this.state.whisper);
  }

  /**
   * Update rhythm parameters
   */
  setRhythm(params: Partial<RhythmParams>): void {
    Object.assign(this.state.rhythm, params);
    this.rhythmSystem?.setParams(this.state.rhythm);
  }

  /**
   * Update texture parameters
   */
  setTexture(params: Partial<TextureParams>): void {
    Object.assign(this.state.texture, params);
    this.textureSystem?.setParams(this.state.texture);
  }

  /**
   * Update wrongness parameters
   */
  setWrongness(params: Partial<WrongnessParams>): void {
    Object.assign(this.state.wrongness, params);
    this.wrongnessEngine?.setParams(this.state.wrongness);
  }

  /**
   * Load a complete preset
   */
  loadPreset(preset: {
    global: GlobalParams;
    drone: DroneParams;
    whisper: WhisperParams;
    rhythm: RhythmParams;
    texture: TextureParams;
    wrongness: WrongnessParams;
  }): void {
    this.setGlobal(preset.global);
    this.setDrone(preset.drone);
    this.setWhisper(preset.whisper);
    this.setRhythm(preset.rhythm);
    this.setTexture(preset.texture);
    this.setWrongness(preset.wrongness);
  }

  /**
   * Apply layer and stability to all subsystems
   */
  private applyLayerAndStability(): void {
    const { layer, stability } = this.state.global;

    // Calculate wrongness intensity from layer and stability
    const wrongnessBase = 0.1 + (layer * 0.15) + ((100 - stability) * 0.005);
    this.state.wrongness.intensity = Math.min(1, wrongnessBase);
    this.wrongnessEngine?.setParams(this.state.wrongness);

    // Adjust subsystem parameters based on layer
    // (This will be expanded in later phases)
    this.droneGenerator?.setLayerModulation(layer, stability);
    this.whisperSystem?.setLayerModulation(layer, stability);
    this.rhythmSystem?.setLayerModulation(layer, stability);
    this.textureSystem?.setLayerModulation(layer, stability);
  }

  /**
   * Dispose all audio resources
   */
  dispose(): void {
    this.stop();

    this.droneGenerator?.dispose();
    this.whisperSystem?.dispose();
    this.rhythmSystem?.dispose();
    this.textureSystem?.dispose();
    this.wrongnessEngine?.dispose();

    this.masterChannel.dispose();
    this.droneChannel.dispose();
    this.whisperChannel.dispose();
    this.rhythmChannel.dispose();
    this.textureChannel.dispose();
    this.masterLimiter.dispose();
    this.masterCompressor.dispose();

    this.isInitialized = false;
    this.state.isInitialized = false;
  }
}

