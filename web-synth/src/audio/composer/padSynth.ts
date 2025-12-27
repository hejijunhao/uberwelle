/**
 * Pad Synthesizer
 *
 * Polyphonic pad synth for warm, evolving chords.
 * Features:
 * - Multiple detuned oscillators per voice
 * - Slow attack, long release
 * - Lowpass filter with slow LFO modulation
 * - Stereo spread
 */

import { getAudioContext } from '../audioContext'
import { noteNameToFrequency, getChordNotes } from './noteUtils'

export interface PadSynthConfig {
  attackTime: number       // seconds (default 0.5)
  decayTime: number        // seconds
  sustainLevel: number     // 0-1
  releaseTime: number      // seconds (default 2.0)
  filterCutoff: number     // Hz
  filterResonance: number  // Q
  lfoRate: number          // Hz (filter modulation)
  lfoDepth: number         // 0-1 (how much LFO affects filter)
  detuneSpread: number     // cents between oscillators
  voiceCount: number       // oscillators per note
}

const DEFAULT_CONFIG: PadSynthConfig = {
  attackTime: 0.5,
  decayTime: 0.3,
  sustainLevel: 0.7,
  releaseTime: 2.0,
  filterCutoff: 2000,
  filterResonance: 1,
  lfoRate: 0.2,
  lfoDepth: 0.3,
  detuneSpread: 8,
  voiceCount: 3,
}

interface PadVoice {
  oscillators: OscillatorNode[]
  gains: GainNode[]
  filter: BiquadFilterNode
  envelope: GainNode
  noteFrequency: number
}

export class PadSynth {
  private ctx: AudioContext | null = null
  private config: PadSynthConfig

  // Audio nodes
  private masterGain: GainNode | null = null
  private lfo: OscillatorNode | null = null
  private lfoGain: GainNode | null = null

  // Active voices
  private voices: Map<string, PadVoice> = new Map()

  constructor(config?: Partial<PadSynthConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  /**
   * Initialize master nodes and LFO
   */
  private ensureContext(): AudioContext {
    if (this.ctx && this.masterGain) return this.ctx

    this.ctx = getAudioContext()

    // Master output
    this.masterGain = this.ctx.createGain()
    this.masterGain.gain.value = 0.4
    this.masterGain.connect(this.ctx.destination)

    // LFO for filter modulation
    this.lfo = this.ctx.createOscillator()
    this.lfo.type = 'sine'
    this.lfo.frequency.value = this.config.lfoRate

    this.lfoGain = this.ctx.createGain()
    this.lfoGain.gain.value = this.config.filterCutoff * this.config.lfoDepth

    this.lfo.connect(this.lfoGain)
    this.lfo.start()

    return this.ctx
  }

  /**
   * Set master volume
   */
  setVolume(volume: number): void {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, volume))
    }
  }

  /**
   * Update configuration
   */
  setConfig(config: Partial<PadSynthConfig>): void {
    this.config = { ...this.config, ...config }

    if (this.lfo) {
      this.lfo.frequency.value = this.config.lfoRate
    }
    if (this.lfoGain) {
      this.lfoGain.gain.value = this.config.filterCutoff * this.config.lfoDepth
    }
  }

  /**
   * Play a single note
   */
  noteOn(note: string, time: number, velocity: number = 1): void {
    const ctx = this.ensureContext()
    if (!this.masterGain || !this.lfoGain) return

    // Don't retrigger if already playing
    if (this.voices.has(note)) return

    const frequency = noteNameToFrequency(note)
    const vel = Math.max(0, Math.min(1, velocity))

    // Create oscillators with detuning spread
    const oscillators: OscillatorNode[] = []
    const gains: GainNode[] = []
    const detuneValues = this.getDetuneValues()

    for (let i = 0; i < this.config.voiceCount; i++) {
      const osc = ctx.createOscillator()
      osc.type = i % 2 === 0 ? 'sawtooth' : 'triangle'
      osc.frequency.value = frequency
      osc.detune.value = detuneValues[i]

      const gain = ctx.createGain()
      gain.gain.value = 1 / this.config.voiceCount

      osc.connect(gain)
      oscillators.push(osc)
      gains.push(gain)
    }

    // Filter per voice
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = this.config.filterCutoff
    filter.Q.value = this.config.filterResonance

    // Connect LFO to filter
    this.lfoGain.connect(filter.frequency)

    // Envelope
    const envelope = ctx.createGain()
    envelope.gain.value = 0

    // Connect: oscillators → gains → filter → envelope → master
    for (const gain of gains) {
      gain.connect(filter)
    }
    filter.connect(envelope)
    envelope.connect(this.masterGain)

    // Start oscillators
    for (const osc of oscillators) {
      osc.start(time)
    }

    // Envelope: Attack → Decay → Sustain
    const peakLevel = vel * 0.8
    const sustainLevel = peakLevel * this.config.sustainLevel

    envelope.gain.setValueAtTime(0, time)
    envelope.gain.linearRampToValueAtTime(peakLevel, time + this.config.attackTime)
    envelope.gain.linearRampToValueAtTime(
      sustainLevel,
      time + this.config.attackTime + this.config.decayTime
    )

    // Store voice
    this.voices.set(note, {
      oscillators,
      gains,
      filter,
      envelope,
      noteFrequency: frequency,
    })
  }

  /**
   * Release a note
   */
  noteOff(note: string, time: number): void {
    const voice = this.voices.get(note)
    if (!voice) return

    const { oscillators, gains, filter, envelope } = voice

    // Release envelope
    envelope.gain.cancelScheduledValues(time)
    envelope.gain.setValueAtTime(envelope.gain.value, time)
    envelope.gain.linearRampToValueAtTime(0, time + this.config.releaseTime)

    // Schedule cleanup after release
    const cleanupTime = time + this.config.releaseTime + 0.1

    for (const osc of oscillators) {
      osc.stop(cleanupTime)
      osc.onended = () => osc.disconnect()
    }

    // Disconnect LFO from this voice's filter
    if (this.lfoGain) {
      setTimeout(() => {
        try {
          this.lfoGain?.disconnect(filter.frequency)
        } catch {
          // May already be disconnected
        }
      }, (this.config.releaseTime + 0.2) * 1000)
    }

    // Schedule node cleanup
    setTimeout(() => {
      for (const gain of gains) gain.disconnect()
      filter.disconnect()
      envelope.disconnect()
    }, (this.config.releaseTime + 0.3) * 1000)

    this.voices.delete(note)
  }

  /**
   * Play a chord (multiple notes)
   */
  chordOn(chordName: string, time: number, octave: number = 3, velocity: number = 1): void {
    const notes = getChordNotes(chordName, octave)
    for (const note of notes) {
      this.noteOn(note, time, velocity)
    }
  }

  /**
   * Release a chord
   */
  chordOff(chordName: string, time: number, octave: number = 3): void {
    const notes = getChordNotes(chordName, octave)
    for (const note of notes) {
      this.noteOff(note, time)
    }
  }

  /**
   * Release all notes
   */
  allNotesOff(time?: number): void {
    const releaseTime = time ?? (this.ctx?.currentTime ?? 0)
    for (const note of this.voices.keys()) {
      this.noteOff(note, releaseTime)
    }
  }

  /**
   * Immediately silence all
   */
  silence(): void {
    for (const voice of this.voices.values()) {
      voice.envelope.gain.cancelScheduledValues(0)
      voice.envelope.gain.value = 0
      for (const osc of voice.oscillators) {
        try {
          osc.stop()
          osc.disconnect()
        } catch {
          // Already stopped
        }
      }
    }
    this.voices.clear()
  }

  /**
   * Get detune values for oscillators (spread around center)
   */
  private getDetuneValues(): number[] {
    const count = this.config.voiceCount
    const spread = this.config.detuneSpread
    const values: number[] = []

    for (let i = 0; i < count; i++) {
      // Spread evenly: -spread to +spread
      const position = count === 1 ? 0 : (i / (count - 1)) * 2 - 1
      values.push(position * spread)
    }

    return values
  }

  /**
   * Clean up
   */
  dispose(): void {
    this.silence()

    if (this.lfo) {
      this.lfo.stop()
      this.lfo.disconnect()
      this.lfo = null
    }
    if (this.lfoGain) {
      this.lfoGain.disconnect()
      this.lfoGain = null
    }
    if (this.masterGain) {
      this.masterGain.disconnect()
      this.masterGain = null
    }

    this.ctx = null
  }
}

// Singleton
let padSynthInstance: PadSynth | null = null

export function getPadSynth(): PadSynth {
  if (!padSynthInstance) {
    padSynthInstance = new PadSynth()
  }
  return padSynthInstance
}

export function disposePadSynth(): void {
  if (padSynthInstance) {
    padSynthInstance.dispose()
    padSynthInstance = null
  }
}
