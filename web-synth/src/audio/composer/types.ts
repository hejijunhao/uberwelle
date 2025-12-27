// Composer audio engine types

export interface ClockState {
  isPlaying: boolean
  isPaused: boolean
  bpm: number
  currentStep: number // 0-15 (16th notes in a bar)
  currentBeat: number // 0-3 (quarter notes in a bar)
  currentBar: number
}

export interface ClockCallbacks {
  onSixteenth?: (step: number, time: number) => void
  onBeat?: (beat: number, time: number) => void
  onBar?: (bar: number, time: number) => void
}

export interface DrumHit {
  time: number
  velocity: number
}

// Pattern types - 16 steps per bar (16th notes)
export type DrumPattern = number[] // 0-1 values (0 = off, 1 = full velocity)

export interface DrumPatterns {
  kick: DrumPattern
  snare: DrumPattern
  hatClosed: DrumPattern
  hatOpen: DrumPattern
  clap: DrumPattern
}

export interface BassNote {
  note: string // e.g., 'C2', 'G2'
  step: number // which 16th note (0-15)
}

export interface BassPattern {
  notes: BassNote[]
}

export interface ChordProgression {
  chords: string[] // e.g., ['Cm7', 'Fm7', 'Gm7', 'Fm7']
  barsPerChord: number
}

export interface StyleDefinition {
  name: string
  displayName: string
  bpmRange: [number, number]
  drums: DrumPatterns
  bass: BassPattern
  chords: ChordProgression
  arp: null | {
    pattern: number[]
    octaveRange: number
  }
}

export interface BlockConfig {
  id: string
  configured: boolean
  bpm: number
  style: string
  instruments: string[]
  duration: number // in seconds (300 = 5 min)
}

export type SetPlayerState = {
  isPlaying: boolean
  isPaused: boolean
  currentBlockIndex: number
  blockProgress: number // 0-1
  totalBlocks: number
}
