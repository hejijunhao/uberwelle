export type Waveform = OscillatorType
export type FilterType = 'lowpass' | 'highpass' | 'bandpass' | 'notch'
export type LfoTarget = 'pitch' | 'filter' | 'amplitude'

export interface VoiceHandle {
  osc: OscillatorNode
  gain: GainNode
  filter: BiquadFilterNode
  noteId: string
  frequency: number
  startTime: number
}

export interface EnvelopeConfig {
  attack: number   // 0.001 - 2s
  decay: number    // 0.001 - 2s
  sustain: number  // 0 - 1 (level)
  release: number  // 0.01 - 4s
}

export interface FilterConfig {
  type: FilterType
  cutoff: number      // 20 - 20000 Hz
  resonance: number   // 0 - 30 Q
  envAmount: number   // -1 to 1 (how much envelope affects cutoff)
}

export interface LfoConfig {
  enabled: boolean
  waveform: Waveform
  rate: number        // 0.1 - 30 Hz
  depth: number       // 0 - 1
  target: LfoTarget
}

export interface OscillatorConfig {
  waveform: Waveform
  detune: number      // cents (-100 to 100)
  octave: number      // -2 to 2
}

export interface SynthConfig {
  oscillator: OscillatorConfig
  envelope: EnvelopeConfig
  filter: FilterConfig
  lfo: LfoConfig
  masterGain: number
  maxVoices: number
  portamento: number  // 0 - 1s
}

// Default config factory
export function createDefaultConfig(): SynthConfig {
  return {
    oscillator: {
      waveform: 'sawtooth',
      detune: 0,
      octave: 0,
    },
    envelope: {
      attack: 0.01,
      decay: 0.3,
      sustain: 0.7,
      release: 0.3,
    },
    filter: {
      type: 'lowpass',
      cutoff: 8000,
      resonance: 1,
      envAmount: 0,
    },
    lfo: {
      enabled: false,
      waveform: 'sine',
      rate: 5,
      depth: 0.5,
      target: 'pitch',
    },
    masterGain: 0.4,
    maxVoices: 8,
    portamento: 0,
  }
}
