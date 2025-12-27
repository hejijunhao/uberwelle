/**
 * Bass Synthesizer
 *
 * Monophonic bass synth optimized for low-frequency content.
 * Features:
 * - Dual oscillators (saw + square, detuned)
 * - Lowpass filter with envelope
 * - Portamento/glide between notes
 */

import { getAudioContext } from '../audioContext'
import { noteNameToFrequency } from './noteUtils'

export interface BassSynthConfig {
  filterCutoff: number     // Hz (default 800)
  filterResonance: number  // Q value (default 2)
  filterEnvAmount: number  // How much envelope affects filter (0-1)
  attackTime: number       // seconds
  decayTime: number        // seconds
  sustainLevel: number     // 0-1
  releaseTime: number      // seconds
  glideTime: number        // seconds (portamento)
  oscMix: number           // saw vs square mix (0=saw, 1=square, 0.5=both)
  detuneAmount: number     // cents
}

const DEFAULT_CONFIG: BassSynthConfig = {
  filterCutoff: 800,
  filterResonance: 2,
  filterEnvAmount: 0.5,
  attackTime: 0.01,
  decayTime: 0.1,
  sustainLevel: 0.7,
  releaseTime: 0.15,
  glideTime: 0.03,
  oscMix: 0.3,
  detuneAmount: 5,
}

export class BassSynth {
  private ctx: AudioContext | null = null
  private config: BassSynthConfig

  // Audio nodes (persistent)
  private osc1: OscillatorNode | null = null
  private osc2: OscillatorNode | null = null
  private filter: BiquadFilterNode | null = null
  private gainNode: GainNode | null = null
  private masterGain: GainNode | null = null

  // State
  private isPlaying: boolean = false
  private currentFrequency: number = 0

  constructor(config?: Partial<BassSynthConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  /**
   * Initialize audio nodes
   */
  private ensureNodes(): void {
    if (this.ctx && this.osc1) return

    this.ctx = getAudioContext()

    // Create oscillators
    this.osc1 = this.ctx.createOscillator()
    this.osc1.type = 'sawtooth'
    this.osc1.detune.value = -this.config.detuneAmount

    this.osc2 = this.ctx.createOscillator()
    this.osc2.type = 'square'
    this.osc2.detune.value = this.config.detuneAmount

    // Gains for mixing oscillators
    const osc1Gain = this.ctx.createGain()
    const osc2Gain = this.ctx.createGain()
    osc1Gain.gain.value = 1 - this.config.oscMix
    osc2Gain.gain.value = this.config.oscMix

    // Filter
    this.filter = this.ctx.createBiquadFilter()
    this.filter.type = 'lowpass'
    this.filter.frequency.value = this.config.filterCutoff
    this.filter.Q.value = this.config.filterResonance

    // Amplitude envelope gain
    this.gainNode = this.ctx.createGain()
    this.gainNode.gain.value = 0

    // Master output
    this.masterGain = this.ctx.createGain()
    this.masterGain.gain.value = 0.6

    // Connect: osc1 → osc1Gain → filter
    //          osc2 → osc2Gain → filter → gainNode → masterGain → destination
    this.osc1.connect(osc1Gain)
    this.osc2.connect(osc2Gain)
    osc1Gain.connect(this.filter)
    osc2Gain.connect(this.filter)
    this.filter.connect(this.gainNode)
    this.gainNode.connect(this.masterGain)
    this.masterGain.connect(this.ctx.destination)

    // Start oscillators (they'll be silent until gain envelope opens)
    this.osc1.start()
    this.osc2.start()
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
   * Update synth configuration
   */
  setConfig(config: Partial<BassSynthConfig>): void {
    this.config = { ...this.config, ...config }

    // Apply immediate changes
    if (this.filter) {
      this.filter.frequency.value = this.config.filterCutoff
      this.filter.Q.value = this.config.filterResonance
    }
  }

  /**
   * Play a note at a scheduled time
   */
  noteOn(note: string, time: number, velocity: number = 1): void {
    this.ensureNodes()
    if (!this.ctx || !this.osc1 || !this.osc2 || !this.filter || !this.gainNode) return

    const frequency = noteNameToFrequency(note)
    const vel = Math.max(0, Math.min(1, velocity))

    // Glide to new frequency if already playing
    if (this.isPlaying && this.config.glideTime > 0) {
      this.osc1.frequency.cancelScheduledValues(time)
      this.osc2.frequency.cancelScheduledValues(time)
      this.osc1.frequency.setValueAtTime(this.currentFrequency, time)
      this.osc2.frequency.setValueAtTime(this.currentFrequency, time)
      this.osc1.frequency.exponentialRampToValueAtTime(frequency, time + this.config.glideTime)
      this.osc2.frequency.exponentialRampToValueAtTime(frequency, time + this.config.glideTime)
    } else {
      this.osc1.frequency.setValueAtTime(frequency, time)
      this.osc2.frequency.setValueAtTime(frequency, time)
    }

    this.currentFrequency = frequency

    // Amplitude envelope: Attack → Decay → Sustain
    const peakLevel = vel * 0.8
    const sustainLevel = peakLevel * this.config.sustainLevel

    this.gainNode.gain.cancelScheduledValues(time)
    this.gainNode.gain.setValueAtTime(this.isPlaying ? this.gainNode.gain.value : 0, time)
    this.gainNode.gain.linearRampToValueAtTime(peakLevel, time + this.config.attackTime)
    this.gainNode.gain.linearRampToValueAtTime(
      sustainLevel,
      time + this.config.attackTime + this.config.decayTime
    )

    // Filter envelope
    const baseFreq = this.config.filterCutoff
    const peakFreq = baseFreq + (4000 * this.config.filterEnvAmount)

    this.filter.frequency.cancelScheduledValues(time)
    this.filter.frequency.setValueAtTime(baseFreq, time)
    this.filter.frequency.linearRampToValueAtTime(peakFreq, time + this.config.attackTime)
    this.filter.frequency.linearRampToValueAtTime(
      baseFreq + (1000 * this.config.filterEnvAmount),
      time + this.config.attackTime + this.config.decayTime
    )

    this.isPlaying = true
  }

  /**
   * Release the current note
   */
  noteOff(time: number): void {
    if (!this.gainNode || !this.filter || !this.isPlaying) return

    // Release envelope
    this.gainNode.gain.cancelScheduledValues(time)
    this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, time)
    this.gainNode.gain.linearRampToValueAtTime(0, time + this.config.releaseTime)

    // Filter closes during release
    this.filter.frequency.cancelScheduledValues(time)
    this.filter.frequency.setValueAtTime(this.filter.frequency.value, time)
    this.filter.frequency.linearRampToValueAtTime(
      this.config.filterCutoff * 0.5,
      time + this.config.releaseTime
    )

    this.isPlaying = false
  }

  /**
   * Immediately silence (for panic/stop)
   */
  silence(): void {
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.cancelScheduledValues(this.ctx.currentTime)
      this.gainNode.gain.setValueAtTime(0, this.ctx.currentTime)
    }
    this.isPlaying = false
  }

  /**
   * Clean up all nodes
   */
  dispose(): void {
    this.silence()

    if (this.osc1) {
      this.osc1.stop()
      this.osc1.disconnect()
      this.osc1 = null
    }
    if (this.osc2) {
      this.osc2.stop()
      this.osc2.disconnect()
      this.osc2 = null
    }
    if (this.filter) {
      this.filter.disconnect()
      this.filter = null
    }
    if (this.gainNode) {
      this.gainNode.disconnect()
      this.gainNode = null
    }
    if (this.masterGain) {
      this.masterGain.disconnect()
      this.masterGain = null
    }

    this.ctx = null
  }
}

// Singleton instance
let bassSynthInstance: BassSynth | null = null

export function getBassSynth(): BassSynth {
  if (!bassSynthInstance) {
    bassSynthInstance = new BassSynth()
  }
  return bassSynthInstance
}

export function disposeBassSynth(): void {
  if (bassSynthInstance) {
    bassSynthInstance.dispose()
    bassSynthInstance = null
  }
}
