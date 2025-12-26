// THE DESCENT - Audio Type Definitions

export interface DroneParams {
  fundamental: number;      // Hz (40-70)
  harmonicCount: number;    // 1-8
  detuneAmount: number;     // cents (0-50)
  subFrequency: number;     // Hz (15-20)
  subAmplitude: number;     // 0-0.4
  ampLfoRate: number;       // Hz (0.01-0.2)
  ampLfoDepth: number;      // 0-0.5
  filterCutoff: number;     // Hz (100-1000)
  filterResonance: number;  // 0-1
}

export interface WhisperParams {
  enabled: boolean;
  density: number;          // events per second (0-0.2)
  volume: number;           // dB (-40 to -10)
  pitchMin: number;         // multiplier (0.4-1.0)
  pitchMax: number;         // multiplier (1.0-1.5)
  panRange: number;         // 0-1
  reverbWet: number;        // 0-1
  clusterChance: number;    // 0-0.5
}

export interface RhythmParams {
  pulseEnabled: boolean;
  pulseBpm: number;         // 50-120
  pulseVariance: number;    // percentage (0-30)
  skipChance: number;       // percentage (0-25)
  breathEnabled: boolean;
  breathCycle: number;      // seconds (4-20)
  clickEchoEnabled: boolean;
}

export interface TextureParams {
  void: number;             // 0-1
  stone: number;            // 0-1
  water: number;            // 0-1
  static: number;           // 0-1
  organic: number;          // 0-1
}

export interface WrongnessParams {
  intensity: number;        // 0-1
  pitchDrift: number;       // cents (0-50)
  temporalOffset: number;   // ms (0-100)
  spatialPhase: number;     // ms (0-50)
  eventChance: number;      // events per second (0-0.2)
}

export interface GlobalParams {
  layer: number;            // 0-5
  stability: number;        // 0-100
  masterVolume: number;     // dB (-60 to 0)
}

export interface AudioState {
  isPlaying: boolean;
  isInitialized: boolean;
  global: GlobalParams;
  drone: DroneParams;
  whisper: WhisperParams;
  rhythm: RhythmParams;
  texture: TextureParams;
  wrongness: WrongnessParams;
}

export interface Preset {
  name: string;
  global: GlobalParams;
  drone: DroneParams;
  whisper: WhisperParams;
  rhythm: RhythmParams;
  texture: TextureParams;
  wrongness: WrongnessParams;
}

// Default parameter values
export const DEFAULT_DRONE: DroneParams = {
  fundamental: 55,
  harmonicCount: 3,
  detuneAmount: 5,
  subFrequency: 18,
  subAmplitude: 0.1,
  ampLfoRate: 0.08,
  ampLfoDepth: 0.15,
  filterCutoff: 400,
  filterResonance: 0.3,
};

export const DEFAULT_WHISPER: WhisperParams = {
  enabled: false,
  density: 0.03,
  volume: -24,
  pitchMin: 0.7,
  pitchMax: 1.1,
  panRange: 0.5,
  reverbWet: 0.5,
  clusterChance: 0.1,
};

export const DEFAULT_RHYTHM: RhythmParams = {
  pulseEnabled: false,
  pulseBpm: 65,
  pulseVariance: 5,
  skipChance: 3,
  breathEnabled: false,
  breathCycle: 12,
  clickEchoEnabled: false,
};

export const DEFAULT_TEXTURE: TextureParams = {
  void: 0.3,
  stone: 0,
  water: 0,
  static: 0,
  organic: 0,
};

export const DEFAULT_WRONGNESS: WrongnessParams = {
  intensity: 0.1,
  pitchDrift: 5,
  temporalOffset: 0,
  spatialPhase: 0,
  eventChance: 0.01,
};

export const DEFAULT_GLOBAL: GlobalParams = {
  layer: 0,
  stability: 100,
  masterVolume: -12,
};
