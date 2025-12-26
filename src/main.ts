// THE DESCENT - Main Entry Point
// Eldritch Soundscape Generator

import { AudioEngine } from './audio/AudioEngine';
import type { DroneParams, WhisperParams, RhythmParams, TextureParams, WrongnessParams } from './audio/types';

// Initialize audio engine
const audioEngine = new AudioEngine();

// DOM Elements
const playBtn = document.getElementById('play-btn') as HTMLButtonElement;
const stopBtn = document.getElementById('stop-btn') as HTMLButtonElement;
const app = document.getElementById('app') as HTMLDivElement;

// Global controls
const layerSlider = document.getElementById('layer-slider') as HTMLInputElement;
const layerValue = document.getElementById('layer-value') as HTMLSpanElement;
const stabilitySlider = document.getElementById('stability-slider') as HTMLInputElement;
const stabilityValue = document.getElementById('stability-value') as HTMLSpanElement;
const masterVolume = document.getElementById('master-volume') as HTMLInputElement;
const masterVolumeValue = document.getElementById('master-volume-value') as HTMLSpanElement;

// Drone controls
const droneFundamental = document.getElementById('drone-fundamental') as HTMLInputElement;
const droneHarmonics = document.getElementById('drone-harmonics') as HTMLInputElement;
const droneDetune = document.getElementById('drone-detune') as HTMLInputElement;
const droneSub = document.getElementById('drone-sub') as HTMLInputElement;
const droneAmpRate = document.getElementById('drone-amp-rate') as HTMLInputElement;
const droneAmpDepth = document.getElementById('drone-amp-depth') as HTMLInputElement;
const droneFilterCutoff = document.getElementById('drone-filter-cutoff') as HTMLInputElement;
const droneFilterRes = document.getElementById('drone-filter-res') as HTMLInputElement;

// Whisper controls
const whisperEnabled = document.getElementById('whisper-enabled') as HTMLInputElement;
const whisperDensity = document.getElementById('whisper-density') as HTMLInputElement;
const whisperVolume = document.getElementById('whisper-volume') as HTMLInputElement;
const whisperReverb = document.getElementById('whisper-reverb') as HTMLInputElement;

// Rhythm controls
const pulseEnabled = document.getElementById('pulse-enabled') as HTMLInputElement;
const rhythmBpm = document.getElementById('rhythm-bpm') as HTMLInputElement;
const rhythmVariance = document.getElementById('rhythm-variance') as HTMLInputElement;
const rhythmSkip = document.getElementById('rhythm-skip') as HTMLInputElement;
const breathEnabled = document.getElementById('breath-enabled') as HTMLInputElement;
const rhythmBreath = document.getElementById('rhythm-breath') as HTMLInputElement;

// Texture controls
const textureVoid = document.getElementById('texture-void') as HTMLInputElement;
const textureStone = document.getElementById('texture-stone') as HTMLInputElement;
const textureWater = document.getElementById('texture-water') as HTMLInputElement;
const textureStatic = document.getElementById('texture-static') as HTMLInputElement;
const textureOrganic = document.getElementById('texture-organic') as HTMLInputElement;

// Wrongness controls
const wrongnessIntensity = document.getElementById('wrongness-intensity') as HTMLInputElement;
const wrongnessPitch = document.getElementById('wrongness-pitch') as HTMLInputElement;
const wrongnessTemporal = document.getElementById('wrongness-temporal') as HTMLInputElement;
const wrongnessSpatial = document.getElementById('wrongness-spatial') as HTMLInputElement;

// Preset controls
const presetSelect = document.getElementById('preset-select') as HTMLSelectElement;
const presetSave = document.getElementById('preset-save') as HTMLButtonElement;
const presetExport = document.getElementById('preset-export') as HTMLButtonElement;
const presetImport = document.getElementById('preset-import') as HTMLButtonElement;
const presetFile = document.getElementById('preset-file') as HTMLInputElement;

// ===== Event Handlers =====

// Play button - initializes and starts audio
playBtn.addEventListener('click', async () => {
  if (!audioEngine.getIsInitialized()) {
    playBtn.textContent = 'Initializing...';
    playBtn.disabled = true;

    try {
      await audioEngine.initialize();
      playBtn.innerHTML = '<span class="icon">&#9654;</span> Play';
      playBtn.disabled = false;
      stopBtn.disabled = false;
    } catch (error) {
      console.error('Failed to initialize audio:', error);
      playBtn.textContent = 'Error - Click to retry';
      playBtn.disabled = false;
      return;
    }
  }

  if (audioEngine.getIsPlaying()) {
    audioEngine.stop();
    playBtn.innerHTML = '<span class="icon">&#9654;</span> Play';
    playBtn.classList.remove('active');
    app.classList.remove('playing');
  } else {
    audioEngine.start();
    playBtn.innerHTML = '<span class="icon">&#10074;&#10074;</span> Pause';
    playBtn.classList.add('active');
    app.classList.add('playing');
  }
});

// Stop button - stops audio completely
stopBtn.addEventListener('click', () => {
  audioEngine.stop();
  playBtn.innerHTML = '<span class="icon">&#9654;</span> Play';
  playBtn.classList.remove('active');
  app.classList.remove('playing');
});

// ===== Helper: Update display value =====
function updateDisplay(input: HTMLInputElement, display: HTMLSpanElement, suffix: string = ''): void {
  display.textContent = input.value + suffix;
}

// ===== Global Controls =====
layerSlider.addEventListener('input', () => {
  updateDisplay(layerSlider, layerValue);
  audioEngine.setGlobal({ layer: parseInt(layerSlider.value) });
});

stabilitySlider.addEventListener('input', () => {
  updateDisplay(stabilitySlider, stabilityValue);
  audioEngine.setGlobal({ stability: parseInt(stabilitySlider.value) });
});

masterVolume.addEventListener('input', () => {
  updateDisplay(masterVolume, masterVolumeValue, ' dB');
  audioEngine.setGlobal({ masterVolume: parseInt(masterVolume.value) });
});

// ===== Drone Controls =====
function updateDrone(): void {
  const params: Partial<DroneParams> = {
    fundamental: parseFloat(droneFundamental.value),
    harmonicCount: parseInt(droneHarmonics.value),
    detuneAmount: parseFloat(droneDetune.value),
    subAmplitude: parseFloat(droneSub.value),
    ampLfoRate: parseFloat(droneAmpRate.value),
    ampLfoDepth: parseFloat(droneAmpDepth.value),
    filterCutoff: parseFloat(droneFilterCutoff.value),
    filterResonance: parseFloat(droneFilterRes.value),
  };
  audioEngine.setDrone(params);
}

droneFundamental.addEventListener('input', () => {
  document.getElementById('drone-fundamental-value')!.textContent = droneFundamental.value + ' Hz';
  updateDrone();
});

droneHarmonics.addEventListener('input', () => {
  document.getElementById('drone-harmonics-value')!.textContent = droneHarmonics.value;
  updateDrone();
});

droneDetune.addEventListener('input', () => {
  document.getElementById('drone-detune-value')!.textContent = droneDetune.value + ' cents';
  updateDrone();
});

droneSub.addEventListener('input', () => {
  document.getElementById('drone-sub-value')!.textContent = parseFloat(droneSub.value).toFixed(2);
  updateDrone();
});

droneAmpRate.addEventListener('input', () => {
  document.getElementById('drone-amp-rate-value')!.textContent = parseFloat(droneAmpRate.value).toFixed(2) + ' Hz';
  updateDrone();
});

droneAmpDepth.addEventListener('input', () => {
  document.getElementById('drone-amp-depth-value')!.textContent = parseFloat(droneAmpDepth.value).toFixed(2);
  updateDrone();
});

droneFilterCutoff.addEventListener('input', () => {
  document.getElementById('drone-filter-cutoff-value')!.textContent = droneFilterCutoff.value + ' Hz';
  updateDrone();
});

droneFilterRes.addEventListener('input', () => {
  document.getElementById('drone-filter-res-value')!.textContent = parseFloat(droneFilterRes.value).toFixed(2);
  updateDrone();
});

// ===== Whisper Controls =====
function updateWhisper(): void {
  const params: Partial<WhisperParams> = {
    enabled: whisperEnabled.checked,
    density: parseFloat(whisperDensity.value),
    volume: parseFloat(whisperVolume.value),
    reverbWet: parseFloat(whisperReverb.value),
  };
  audioEngine.setWhisper(params);
}

whisperEnabled.addEventListener('change', updateWhisper);

whisperDensity.addEventListener('input', () => {
  document.getElementById('whisper-density-value')!.textContent = parseFloat(whisperDensity.value).toFixed(2) + '/s';
  updateWhisper();
});

whisperVolume.addEventListener('input', () => {
  document.getElementById('whisper-volume-value')!.textContent = whisperVolume.value + ' dB';
  updateWhisper();
});

whisperReverb.addEventListener('input', () => {
  document.getElementById('whisper-reverb-value')!.textContent = parseFloat(whisperReverb.value).toFixed(2);
  updateWhisper();
});

// ===== Rhythm Controls =====
function updateRhythm(): void {
  const params: Partial<RhythmParams> = {
    pulseEnabled: pulseEnabled.checked,
    pulseBpm: parseInt(rhythmBpm.value),
    pulseVariance: parseInt(rhythmVariance.value),
    skipChance: parseInt(rhythmSkip.value),
    breathEnabled: breathEnabled.checked,
    breathCycle: parseInt(rhythmBreath.value),
  };
  audioEngine.setRhythm(params);
}

pulseEnabled.addEventListener('change', updateRhythm);
breathEnabled.addEventListener('change', updateRhythm);

rhythmBpm.addEventListener('input', () => {
  document.getElementById('rhythm-bpm-value')!.textContent = rhythmBpm.value;
  updateRhythm();
});

rhythmVariance.addEventListener('input', () => {
  document.getElementById('rhythm-variance-value')!.textContent = rhythmVariance.value + '%';
  updateRhythm();
});

rhythmSkip.addEventListener('input', () => {
  document.getElementById('rhythm-skip-value')!.textContent = rhythmSkip.value + '%';
  updateRhythm();
});

rhythmBreath.addEventListener('input', () => {
  document.getElementById('rhythm-breath-value')!.textContent = rhythmBreath.value + 's';
  updateRhythm();
});

// ===== Texture Controls =====
function updateTexture(): void {
  const params: Partial<TextureParams> = {
    void: parseFloat(textureVoid.value),
    stone: parseFloat(textureStone.value),
    water: parseFloat(textureWater.value),
    static: parseFloat(textureStatic.value),
    organic: parseFloat(textureOrganic.value),
  };
  audioEngine.setTexture(params);
}

textureVoid.addEventListener('input', () => {
  document.getElementById('texture-void-value')!.textContent = parseFloat(textureVoid.value).toFixed(2);
  updateTexture();
});

textureStone.addEventListener('input', () => {
  document.getElementById('texture-stone-value')!.textContent = parseFloat(textureStone.value).toFixed(2);
  updateTexture();
});

textureWater.addEventListener('input', () => {
  document.getElementById('texture-water-value')!.textContent = parseFloat(textureWater.value).toFixed(2);
  updateTexture();
});

textureStatic.addEventListener('input', () => {
  document.getElementById('texture-static-value')!.textContent = parseFloat(textureStatic.value).toFixed(2);
  updateTexture();
});

textureOrganic.addEventListener('input', () => {
  document.getElementById('texture-organic-value')!.textContent = parseFloat(textureOrganic.value).toFixed(2);
  updateTexture();
});

// ===== Wrongness Controls =====
function updateWrongness(): void {
  const params: Partial<WrongnessParams> = {
    intensity: parseFloat(wrongnessIntensity.value),
    pitchDrift: parseFloat(wrongnessPitch.value),
    temporalOffset: parseFloat(wrongnessTemporal.value),
    spatialPhase: parseFloat(wrongnessSpatial.value),
  };
  audioEngine.setWrongness(params);
}

wrongnessIntensity.addEventListener('input', () => {
  document.getElementById('wrongness-intensity-value')!.textContent = parseFloat(wrongnessIntensity.value).toFixed(2);
  updateWrongness();
});

wrongnessPitch.addEventListener('input', () => {
  document.getElementById('wrongness-pitch-value')!.textContent = wrongnessPitch.value + ' cents';
  updateWrongness();
});

wrongnessTemporal.addEventListener('input', () => {
  document.getElementById('wrongness-temporal-value')!.textContent = wrongnessTemporal.value + ' ms';
  updateWrongness();
});

wrongnessSpatial.addEventListener('input', () => {
  document.getElementById('wrongness-spatial-value')!.textContent = wrongnessSpatial.value + ' ms';
  updateWrongness();
});

// ===== Preset Controls =====

// Load preset from select
presetSelect.addEventListener('change', () => {
  const presetName = presetSelect.value;
  if (!presetName) return;

  const preset = getBuiltInPreset(presetName);
  if (preset) {
    audioEngine.loadPreset(preset);
    updateUIFromState();
  }
});

// Save current state to localStorage
presetSave.addEventListener('click', () => {
  const name = prompt('Enter preset name:');
  if (!name) return;

  const state = audioEngine.getState();
  const presets = JSON.parse(localStorage.getItem('eldritch-presets') || '{}');
  presets[name] = {
    global: state.global,
    drone: state.drone,
    whisper: state.whisper,
    rhythm: state.rhythm,
    texture: state.texture,
    wrongness: state.wrongness,
  };
  localStorage.setItem('eldritch-presets', JSON.stringify(presets));
  alert(`Preset "${name}" saved!`);
});

// Export current state to JSON file
presetExport.addEventListener('click', () => {
  const state = audioEngine.getState();
  const preset = {
    name: 'Exported Preset',
    global: state.global,
    drone: state.drone,
    whisper: state.whisper,
    rhythm: state.rhythm,
    texture: state.texture,
    wrongness: state.wrongness,
  };

  const blob = new Blob([JSON.stringify(preset, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'eldritch-preset.json';
  a.click();
  URL.revokeObjectURL(url);
});

// Import preset from JSON file
presetImport.addEventListener('click', () => {
  presetFile.click();
});

presetFile.addEventListener('change', () => {
  const file = presetFile.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const preset = JSON.parse(e.target?.result as string);
      audioEngine.loadPreset(preset);
      updateUIFromState();
      alert('Preset loaded!');
    } catch (error) {
      alert('Failed to load preset: Invalid JSON');
    }
  };
  reader.readAsText(file);
  presetFile.value = ''; // Reset for next import
});

// ===== Built-in Presets =====
function getBuiltInPreset(name: string) {
  const presets: Record<string, ReturnType<typeof audioEngine.getState>> = {
    surface: {
      isPlaying: false,
      isInitialized: false,
      global: { layer: 0, stability: 100, masterVolume: -12 },
      drone: {
        fundamental: 55, harmonicCount: 1, detuneAmount: 0,
        subFrequency: 18, subAmplitude: 0,
        ampLfoRate: 0.05, ampLfoDepth: 0.1,
        filterCutoff: 200, filterResonance: 0.2,
      },
      whisper: {
        enabled: false, density: 0.01, volume: -30,
        pitchMin: 0.8, pitchMax: 1.0, panRange: 0.3,
        reverbWet: 0.4, clusterChance: 0.05,
      },
      rhythm: {
        pulseEnabled: false, pulseBpm: 65, pulseVariance: 3, skipChance: 2,
        breathEnabled: false, breathCycle: 15, clickEchoEnabled: false,
      },
      texture: { void: 0.2, stone: 0, water: 0, static: 0, organic: 0 },
      wrongness: { intensity: 0.05, pitchDrift: 2, temporalOffset: 0, spatialPhase: 0, eventChance: 0.005 },
    },
    veil: {
      isPlaying: false,
      isInitialized: false,
      global: { layer: 1, stability: 85, masterVolume: -12 },
      drone: {
        fundamental: 55, harmonicCount: 3, detuneAmount: 5,
        subFrequency: 18, subAmplitude: 0.1,
        ampLfoRate: 0.06, ampLfoDepth: 0.12,
        filterCutoff: 300, filterResonance: 0.25,
      },
      whisper: {
        enabled: true, density: 0.02, volume: -28,
        pitchMin: 0.75, pitchMax: 1.05, panRange: 0.4,
        reverbWet: 0.5, clusterChance: 0.1,
      },
      rhythm: {
        pulseEnabled: true, pulseBpm: 65, pulseVariance: 5, skipChance: 3,
        breathEnabled: false, breathCycle: 12, clickEchoEnabled: false,
      },
      texture: { void: 0.3, stone: 0.1, water: 0, static: 0, organic: 0 },
      wrongness: { intensity: 0.15, pitchDrift: 5, temporalOffset: 0, spatialPhase: 0, eventChance: 0.01 },
    },
    depths: {
      isPlaying: false,
      isInitialized: false,
      global: { layer: 2, stability: 70, masterVolume: -10 },
      drone: {
        fundamental: 52, harmonicCount: 5, detuneAmount: 10,
        subFrequency: 18, subAmplitude: 0.15,
        ampLfoRate: 0.08, ampLfoDepth: 0.15,
        filterCutoff: 400, filterResonance: 0.3,
      },
      whisper: {
        enabled: true, density: 0.04, volume: -22,
        pitchMin: 0.7, pitchMax: 1.1, panRange: 0.5,
        reverbWet: 0.55, clusterChance: 0.15,
      },
      rhythm: {
        pulseEnabled: true, pulseBpm: 70, pulseVariance: 8, skipChance: 5,
        breathEnabled: true, breathCycle: 10, clickEchoEnabled: true,
      },
      texture: { void: 0.25, stone: 0.2, water: 0.3, static: 0, organic: 0 },
      wrongness: { intensity: 0.3, pitchDrift: 10, temporalOffset: 10, spatialPhase: 5, eventChance: 0.02 },
    },
    threshold: {
      isPlaying: false,
      isInitialized: false,
      global: { layer: 3, stability: 45, masterVolume: -8 },
      drone: {
        fundamental: 49, harmonicCount: 6, detuneAmount: 18,
        subFrequency: 18, subAmplitude: 0.2,
        ampLfoRate: 0.1, ampLfoDepth: 0.2,
        filterCutoff: 500, filterResonance: 0.35,
      },
      whisper: {
        enabled: true, density: 0.08, volume: -18,
        pitchMin: 0.6, pitchMax: 1.15, panRange: 0.7,
        reverbWet: 0.6, clusterChance: 0.2,
      },
      rhythm: {
        pulseEnabled: true, pulseBpm: 80, pulseVariance: 12, skipChance: 10,
        breathEnabled: true, breathCycle: 6, clickEchoEnabled: true,
      },
      texture: { void: 0.2, stone: 0.3, water: 0.25, static: 0.15, organic: 0.1 },
      wrongness: { intensity: 0.55, pitchDrift: 18, temporalOffset: 25, spatialPhase: 15, eventChance: 0.04 },
    },
    beyond: {
      isPlaying: false,
      isInitialized: false,
      global: { layer: 4, stability: 20, masterVolume: -6 },
      drone: {
        fundamental: 45, harmonicCount: 8, detuneAmount: 30,
        subFrequency: 18, subAmplitude: 0.3,
        ampLfoRate: 0.15, ampLfoDepth: 0.3,
        filterCutoff: 600, filterResonance: 0.4,
      },
      whisper: {
        enabled: true, density: 0.15, volume: -14,
        pitchMin: 0.5, pitchMax: 1.2, panRange: 0.9,
        reverbWet: 0.7, clusterChance: 0.3,
      },
      rhythm: {
        pulseEnabled: true, pulseBpm: 95, pulseVariance: 20, skipChance: 15,
        breathEnabled: true, breathCycle: 4, clickEchoEnabled: true,
      },
      texture: { void: 0.15, stone: 0.2, water: 0.2, static: 0.3, organic: 0.2 },
      wrongness: { intensity: 0.8, pitchDrift: 30, temporalOffset: 50, spatialPhase: 30, eventChance: 0.08 },
    },
  };

  return presets[name];
}

// ===== Update UI from State =====
function updateUIFromState(): void {
  const state = audioEngine.getState();

  // Global
  layerSlider.value = String(state.global.layer);
  layerValue.textContent = String(state.global.layer);
  stabilitySlider.value = String(state.global.stability);
  stabilityValue.textContent = String(state.global.stability);
  masterVolume.value = String(state.global.masterVolume);
  masterVolumeValue.textContent = state.global.masterVolume + ' dB';

  // Drone
  droneFundamental.value = String(state.drone.fundamental);
  document.getElementById('drone-fundamental-value')!.textContent = state.drone.fundamental + ' Hz';
  droneHarmonics.value = String(state.drone.harmonicCount);
  document.getElementById('drone-harmonics-value')!.textContent = String(state.drone.harmonicCount);
  droneDetune.value = String(state.drone.detuneAmount);
  document.getElementById('drone-detune-value')!.textContent = state.drone.detuneAmount + ' cents';
  droneSub.value = String(state.drone.subAmplitude);
  document.getElementById('drone-sub-value')!.textContent = state.drone.subAmplitude.toFixed(2);
  droneAmpRate.value = String(state.drone.ampLfoRate);
  document.getElementById('drone-amp-rate-value')!.textContent = state.drone.ampLfoRate.toFixed(2) + ' Hz';
  droneAmpDepth.value = String(state.drone.ampLfoDepth);
  document.getElementById('drone-amp-depth-value')!.textContent = state.drone.ampLfoDepth.toFixed(2);
  droneFilterCutoff.value = String(state.drone.filterCutoff);
  document.getElementById('drone-filter-cutoff-value')!.textContent = state.drone.filterCutoff + ' Hz';
  droneFilterRes.value = String(state.drone.filterResonance);
  document.getElementById('drone-filter-res-value')!.textContent = state.drone.filterResonance.toFixed(2);

  // Whisper
  whisperEnabled.checked = state.whisper.enabled;
  whisperDensity.value = String(state.whisper.density);
  document.getElementById('whisper-density-value')!.textContent = state.whisper.density.toFixed(2) + '/s';
  whisperVolume.value = String(state.whisper.volume);
  document.getElementById('whisper-volume-value')!.textContent = state.whisper.volume + ' dB';
  whisperReverb.value = String(state.whisper.reverbWet);
  document.getElementById('whisper-reverb-value')!.textContent = state.whisper.reverbWet.toFixed(2);

  // Rhythm
  pulseEnabled.checked = state.rhythm.pulseEnabled;
  rhythmBpm.value = String(state.rhythm.pulseBpm);
  document.getElementById('rhythm-bpm-value')!.textContent = String(state.rhythm.pulseBpm);
  rhythmVariance.value = String(state.rhythm.pulseVariance);
  document.getElementById('rhythm-variance-value')!.textContent = state.rhythm.pulseVariance + '%';
  rhythmSkip.value = String(state.rhythm.skipChance);
  document.getElementById('rhythm-skip-value')!.textContent = state.rhythm.skipChance + '%';
  breathEnabled.checked = state.rhythm.breathEnabled;
  rhythmBreath.value = String(state.rhythm.breathCycle);
  document.getElementById('rhythm-breath-value')!.textContent = state.rhythm.breathCycle + 's';

  // Texture
  textureVoid.value = String(state.texture.void);
  document.getElementById('texture-void-value')!.textContent = state.texture.void.toFixed(2);
  textureStone.value = String(state.texture.stone);
  document.getElementById('texture-stone-value')!.textContent = state.texture.stone.toFixed(2);
  textureWater.value = String(state.texture.water);
  document.getElementById('texture-water-value')!.textContent = state.texture.water.toFixed(2);
  textureStatic.value = String(state.texture.static);
  document.getElementById('texture-static-value')!.textContent = state.texture.static.toFixed(2);
  textureOrganic.value = String(state.texture.organic);
  document.getElementById('texture-organic-value')!.textContent = state.texture.organic.toFixed(2);

  // Wrongness
  wrongnessIntensity.value = String(state.wrongness.intensity);
  document.getElementById('wrongness-intensity-value')!.textContent = state.wrongness.intensity.toFixed(2);
  wrongnessPitch.value = String(state.wrongness.pitchDrift);
  document.getElementById('wrongness-pitch-value')!.textContent = state.wrongness.pitchDrift + ' cents';
  wrongnessTemporal.value = String(state.wrongness.temporalOffset);
  document.getElementById('wrongness-temporal-value')!.textContent = state.wrongness.temporalOffset + ' ms';
  wrongnessSpatial.value = String(state.wrongness.spatialPhase);
  document.getElementById('wrongness-spatial-value')!.textContent = state.wrongness.spatialPhase + ' ms';
}

// Initialize UI
console.log('THE DESCENT - Eldritch Soundscape Generator');
console.log('Click "Initialize Audio" to begin...');
