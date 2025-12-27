/**
 * Pattern Player
 *
 * Connects the Clock to the DrumSynth, playing patterns
 * defined by a StyleDefinition. Handles pattern sequencing
 * and applies subtle variations for a more organic feel.
 */

import { Clock } from './clock'
import { DrumSynth } from './drumSynth'
import { getStyle } from './styles'
import type { StyleDefinition, DrumPatterns } from './types'

// Humanization settings
const VELOCITY_VARIANCE = 0.1 // ±10% velocity randomization
const TIMING_VARIANCE_MS = 3 // ±3ms timing humanization

export class PatternPlayer {
  private clock: Clock
  private drums: DrumSynth
  private style: StyleDefinition
  private isPlaying: boolean = false

  // Current patterns (can be modified for variations)
  private currentPatterns: DrumPatterns

  // Unsubscribe functions for clock callbacks
  private unsubscribers: (() => void)[] = []

  constructor(clock: Clock, drums: DrumSynth, styleName: string = 'deepHouse') {
    this.clock = clock
    this.drums = drums
    this.style = getStyle(styleName)
    this.currentPatterns = { ...this.style.drums }
  }

  /**
   * Set the style (changes patterns)
   */
  setStyle(styleName: string): void {
    this.style = getStyle(styleName)
    this.currentPatterns = { ...this.style.drums }
  }

  /**
   * Get current style name
   */
  getStyleName(): string {
    return this.style.name
  }

  /**
   * Start playing the pattern
   */
  start(): void {
    if (this.isPlaying) return
    this.isPlaying = true

    // Subscribe to 16th notes
    const unsubSixteenth = this.clock.onSixteenth((step, time) => {
      this.playStep(step, time)
    })

    this.unsubscribers.push(unsubSixteenth)
  }

  /**
   * Stop playing
   */
  stop(): void {
    this.isPlaying = false

    // Unsubscribe from all callbacks
    for (const unsub of this.unsubscribers) {
      unsub()
    }
    this.unsubscribers = []
  }

  /**
   * Play one step of the pattern
   */
  private playStep(step: number, time: number): void {
    const patterns = this.currentPatterns

    // Apply slight timing humanization
    const humanizedTime = time + this.getTimingVariance()

    // Kick
    const kickVel = patterns.kick[step]
    if (kickVel > 0) {
      this.drums.kick(humanizedTime, this.humanizeVelocity(kickVel))
    }

    // Snare
    const snareVel = patterns.snare[step]
    if (snareVel > 0) {
      this.drums.snare(humanizedTime, this.humanizeVelocity(snareVel))
    }

    // Closed hi-hat
    const hatClosedVel = patterns.hatClosed[step]
    if (hatClosedVel > 0) {
      this.drums.hihatClosed(humanizedTime, this.humanizeVelocity(hatClosedVel))
    }

    // Open hi-hat
    const hatOpenVel = patterns.hatOpen[step]
    if (hatOpenVel > 0) {
      this.drums.hihatOpen(humanizedTime, this.humanizeVelocity(hatOpenVel))
    }

    // Clap
    const clapVel = patterns.clap[step]
    if (clapVel > 0) {
      this.drums.clap(humanizedTime, this.humanizeVelocity(clapVel))
    }
  }

  /**
   * Add slight velocity variation for more organic feel
   */
  private humanizeVelocity(velocity: number): number {
    const variance = (Math.random() * 2 - 1) * VELOCITY_VARIANCE
    return Math.max(0.1, Math.min(1, velocity + variance))
  }

  /**
   * Add slight timing variation (in seconds)
   */
  private getTimingVariance(): number {
    return ((Math.random() * 2 - 1) * TIMING_VARIANCE_MS) / 1000
  }

  /**
   * Override a specific drum pattern temporarily
   * (used for variations during playback)
   */
  setDrumPattern(drum: keyof DrumPatterns, pattern: number[]): void {
    if (pattern.length === 16) {
      this.currentPatterns[drum] = pattern
    }
  }

  /**
   * Reset patterns to style defaults
   */
  resetPatterns(): void {
    this.currentPatterns = { ...this.style.drums }
  }

  /**
   * Get recommended BPM for current style
   */
  getRecommendedBpm(): number {
    const [min, max] = this.style.bpmRange
    return Math.round((min + max) / 2)
  }

  /**
   * Clean up
   */
  dispose(): void {
    this.stop()
  }
}

/**
 * Factory function to create a fully wired PatternPlayer
 */
export function createPatternPlayer(
  clock: Clock,
  drums: DrumSynth,
  styleName?: string
): PatternPlayer {
  return new PatternPlayer(clock, drums, styleName)
}
