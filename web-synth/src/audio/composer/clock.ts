/**
 * Clock - Tempo-synced scheduler using Web Audio timing
 *
 * Uses lookahead scheduling pattern:
 * - A timer runs frequently (every ~25ms) checking what needs to be scheduled
 * - Events are scheduled ~100ms ahead using AudioContext.currentTime
 * - This provides sample-accurate timing while remaining responsive
 */

import { getAudioContext } from '../audioContext'
import type { ClockState } from './types'

const LOOKAHEAD_MS = 100 // How far ahead to schedule (ms)
const SCHEDULE_INTERVAL_MS = 25 // How often to check for scheduling (ms)
const STEPS_PER_BEAT = 4 // 16th notes per quarter note

export class Clock {
  private bpm: number = 120
  private isPlaying: boolean = false
  private isPaused: boolean = false

  // Scheduling state
  private nextStepTime: number = 0 // AudioContext time of next step
  private currentStep: number = 0 // 0-15
  private currentBar: number = 0
  private schedulerTimer: number | null = null

  // Pause state
  private pausedAtStep: number = 0
  private pausedAtBar: number = 0

  // Callbacks
  private onSixteenthCallbacks: ((step: number, time: number) => void)[] = []
  private onBeatCallbacks: ((beat: number, time: number) => void)[] = []
  private onBarCallbacks: ((bar: number, time: number) => void)[] = []

  constructor(bpm: number = 120) {
    this.bpm = bpm
  }

  /**
   * Get the duration of one 16th note in seconds
   */
  private get stepDuration(): number {
    // BPM = quarter notes per minute
    // One quarter note = 60/BPM seconds
    // One 16th note = (60/BPM) / 4 seconds
    return 60 / this.bpm / STEPS_PER_BEAT
  }

  /**
   * Start the clock from the beginning
   */
  start(): void {
    if (this.isPlaying && !this.isPaused) return

    const ctx = getAudioContext()
    if (ctx.state === 'suspended') {
      ctx.resume()
    }

    this.isPlaying = true
    this.isPaused = false
    this.currentStep = 0
    this.currentBar = 0
    this.nextStepTime = ctx.currentTime + 0.05 // Small delay to allow setup

    this.startScheduler()
  }

  /**
   * Stop the clock and reset to beginning
   */
  stop(): void {
    this.stopScheduler()
    this.isPlaying = false
    this.isPaused = false
    this.currentStep = 0
    this.currentBar = 0
  }

  /**
   * Pause the clock at current position
   */
  pause(): void {
    if (!this.isPlaying || this.isPaused) return

    this.stopScheduler()
    this.isPaused = true
    this.pausedAtStep = this.currentStep
    this.pausedAtBar = this.currentBar
  }

  /**
   * Resume from paused position
   */
  resume(): void {
    if (!this.isPaused) return

    const ctx = getAudioContext()
    if (ctx.state === 'suspended') {
      ctx.resume()
    }

    this.isPaused = false
    this.currentStep = this.pausedAtStep
    this.currentBar = this.pausedAtBar
    this.nextStepTime = ctx.currentTime + 0.05

    this.startScheduler()
  }

  /**
   * Set BPM (can be called while playing)
   */
  setBpm(bpm: number): void {
    this.bpm = Math.max(60, Math.min(200, bpm))
  }

  getBpm(): number {
    return this.bpm
  }

  /**
   * Get current state
   */
  getState(): ClockState {
    return {
      isPlaying: this.isPlaying,
      isPaused: this.isPaused,
      bpm: this.bpm,
      currentStep: this.currentStep,
      currentBeat: Math.floor(this.currentStep / STEPS_PER_BEAT),
      currentBar: this.currentBar,
    }
  }

  /**
   * Register callback for every 16th note
   */
  onSixteenth(callback: (step: number, time: number) => void): () => void {
    this.onSixteenthCallbacks.push(callback)
    return () => {
      this.onSixteenthCallbacks = this.onSixteenthCallbacks.filter(
        (cb) => cb !== callback
      )
    }
  }

  /**
   * Register callback for every beat (quarter note)
   */
  onBeat(callback: (beat: number, time: number) => void): () => void {
    this.onBeatCallbacks.push(callback)
    return () => {
      this.onBeatCallbacks = this.onBeatCallbacks.filter((cb) => cb !== callback)
    }
  }

  /**
   * Register callback for every bar
   */
  onBar(callback: (bar: number, time: number) => void): () => void {
    this.onBarCallbacks.push(callback)
    return () => {
      this.onBarCallbacks = this.onBarCallbacks.filter((cb) => cb !== callback)
    }
  }

  /**
   * Start the scheduler timer
   */
  private startScheduler(): void {
    if (this.schedulerTimer !== null) return

    this.schedulerTimer = window.setInterval(() => {
      this.schedule()
    }, SCHEDULE_INTERVAL_MS)
  }

  /**
   * Stop the scheduler timer
   */
  private stopScheduler(): void {
    if (this.schedulerTimer !== null) {
      clearInterval(this.schedulerTimer)
      this.schedulerTimer = null
    }
  }

  /**
   * Main scheduling loop - called frequently to schedule upcoming events
   */
  private schedule(): void {
    const ctx = getAudioContext()
    const lookaheadTime = ctx.currentTime + LOOKAHEAD_MS / 1000

    // Schedule all steps that fall within our lookahead window
    while (this.nextStepTime < lookaheadTime) {
      this.scheduleStep(this.currentStep, this.nextStepTime)

      // Advance to next step
      this.currentStep++
      if (this.currentStep >= 16) {
        this.currentStep = 0
        this.currentBar++
      }

      this.nextStepTime += this.stepDuration
    }
  }

  /**
   * Schedule callbacks for a single step
   */
  private scheduleStep(step: number, time: number): void {
    // Fire 16th note callbacks
    for (const cb of this.onSixteenthCallbacks) {
      try {
        cb(step, time)
      } catch (e) {
        console.error('Error in onSixteenth callback:', e)
      }
    }

    // Fire beat callbacks on quarter notes (steps 0, 4, 8, 12)
    if (step % STEPS_PER_BEAT === 0) {
      const beat = step / STEPS_PER_BEAT
      for (const cb of this.onBeatCallbacks) {
        try {
          cb(beat, time)
        } catch (e) {
          console.error('Error in onBeat callback:', e)
        }
      }
    }

    // Fire bar callbacks on step 0
    if (step === 0) {
      for (const cb of this.onBarCallbacks) {
        try {
          cb(this.currentBar, time)
        } catch (e) {
          console.error('Error in onBar callback:', e)
        }
      }
    }
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    this.stop()
    this.onSixteenthCallbacks = []
    this.onBeatCallbacks = []
    this.onBarCallbacks = []
  }
}

// Singleton instance for global use
let clockInstance: Clock | null = null

export function getClock(): Clock {
  if (!clockInstance) {
    clockInstance = new Clock()
  }
  return clockInstance
}

export function disposeClock(): void {
  if (clockInstance) {
    clockInstance.dispose()
    clockInstance = null
  }
}
