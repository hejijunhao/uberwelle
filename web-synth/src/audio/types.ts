export type Waveform = OscillatorType

export interface VoiceHandle {
  osc: OscillatorNode
  gain: GainNode
  noteId: string
  frequency: number
}

export interface EnvelopeConfig {
  attack: number
  release: number
}

export interface SynthConfig {
  waveform: Waveform
  envelope: EnvelopeConfig
  masterGain: number
  maxVoices: number
}
