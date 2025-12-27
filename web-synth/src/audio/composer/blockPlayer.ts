/**
 * Block Player
 *
 * Orchestrates a single 5-minute block of generated music.
 * Manages the "arc" of the track: intro → build → main → outro
 * Coordinates all instruments (drums, bass, pads) based on style.
 */

import { Clock } from './clock'
import { DrumSynth } from './drumSynth'
import { BassSynth } from './bassSynth'
import { PadSynth } from './padSynth'
import { PatternPlayer } from './patternPlayer'
import { getStyle } from './styles'
import type { StyleDefinition, BlockConfig } from './types'

// Block duration: 5 minutes = 300 seconds
const BLOCK_DURATION_SECONDS = 300

// Arc timings (as fraction of block duration)
const ARC = {
  INTRO_END: 0.1,      // 0-10%: intro (30 seconds)
  BUILD_END: 0.2,      // 10-20%: build (30 seconds)
  MAIN_END: 0.85,      // 20-85%: main section (195 seconds / 3.25 min)
  OUTRO_START: 0.85,   // 85-100%: outro (45 seconds)
}

export type BlockPhase = 'intro' | 'build' | 'main' | 'outro' | 'stopped'

export interface BlockPlayerState {
  isPlaying: boolean
  phase: BlockPhase
  progress: number        // 0-1
  elapsedSeconds: number
  totalSeconds: number
  currentBar: number
}

type StateChangeCallback = (state: BlockPlayerState) => void

export class BlockPlayer {
  private clock: Clock
  private drums: DrumSynth
  private bass: BassSynth
  private pads: PadSynth
  private patternPlayer: PatternPlayer

  private style: StyleDefinition
  private config: BlockConfig | null = null

  // Playback state
  private isPlaying: boolean = false
  private startTime: number = 0
  private currentPhase: BlockPhase = 'stopped'
  private currentBar: number = 0

  // Timing
  private progressInterval: number | null = null
  private unsubscribers: (() => void)[] = []

  // Callbacks
  private onStateChangeCallbacks: StateChangeCallback[] = []
  private onCompleteCallbacks: (() => void)[] = []

  constructor(
    clock: Clock,
    drums: DrumSynth,
    bass: BassSynth,
    pads: PadSynth
  ) {
    this.clock = clock
    this.drums = drums
    this.bass = bass
    this.pads = pads
    this.patternPlayer = new PatternPlayer(clock, drums)
    this.style = getStyle('deepHouse')
  }

  /**
   * Load a block configuration
   */
  load(block: BlockConfig): void {
    this.config = block
    this.style = getStyle(block.style)
    this.patternPlayer.setStyle(block.style)
    this.clock.setBpm(block.bpm)
  }

  /**
   * Start playing the loaded block
   */
  play(): void {
    if (!this.config || this.isPlaying) return

    this.isPlaying = true
    this.startTime = Date.now()
    this.currentPhase = 'intro'
    this.currentBar = 0

    // Subscribe to bar changes for musical structure
    const unsubBar = this.clock.onBar((bar, time) => {
      this.currentBar = bar
      this.onBar(bar, time)
    })
    this.unsubscribers.push(unsubBar)

    // Subscribe to 16th notes for bass/pad sequencing
    const unsubStep = this.clock.onSixteenth((step, time) => {
      this.onStep(step, time)
    })
    this.unsubscribers.push(unsubStep)

    // Start pattern player (drums)
    this.patternPlayer.start()

    // Start progress tracking
    this.progressInterval = window.setInterval(() => {
      this.updateProgress()
    }, 100)

    // Start the clock
    this.clock.start()

    this.emitStateChange()
  }

  /**
   * Stop playback
   */
  stop(): void {
    this.isPlaying = false
    this.currentPhase = 'stopped'

    // Stop all
    this.clock.stop()
    this.patternPlayer.stop()
    this.bass.silence()
    this.pads.allNotesOff()

    // Cleanup subscriptions
    for (const unsub of this.unsubscribers) {
      unsub()
    }
    this.unsubscribers = []

    // Stop progress tracking
    if (this.progressInterval) {
      clearInterval(this.progressInterval)
      this.progressInterval = null
    }

    this.emitStateChange()
  }

  /**
   * Get current playback state
   */
  getState(): BlockPlayerState {
    const elapsed = this.isPlaying ? (Date.now() - this.startTime) / 1000 : 0
    return {
      isPlaying: this.isPlaying,
      phase: this.currentPhase,
      progress: Math.min(1, elapsed / BLOCK_DURATION_SECONDS),
      elapsedSeconds: elapsed,
      totalSeconds: BLOCK_DURATION_SECONDS,
      currentBar: this.currentBar,
    }
  }

  /**
   * Register callback for state changes
   */
  onStateChange(callback: StateChangeCallback): () => void {
    this.onStateChangeCallbacks.push(callback)
    return () => {
      this.onStateChangeCallbacks = this.onStateChangeCallbacks.filter(
        cb => cb !== callback
      )
    }
  }

  /**
   * Register callback for block completion
   */
  onComplete(callback: () => void): () => void {
    this.onCompleteCallbacks.push(callback)
    return () => {
      this.onCompleteCallbacks = this.onCompleteCallbacks.filter(
        cb => cb !== callback
      )
    }
  }

  /**
   * Update progress and check phase transitions
   */
  private updateProgress(): void {
    const state = this.getState()
    const progress = state.progress

    // Check phase transitions
    const newPhase = this.getPhaseForProgress(progress)
    if (newPhase !== this.currentPhase) {
      this.transitionToPhase(newPhase)
    }

    // Check completion
    if (progress >= 1) {
      this.stop()
      for (const cb of this.onCompleteCallbacks) {
        cb()
      }
      return
    }

    this.emitStateChange()
  }

  /**
   * Determine phase based on progress
   */
  private getPhaseForProgress(progress: number): BlockPhase {
    if (progress < ARC.INTRO_END) return 'intro'
    if (progress < ARC.BUILD_END) return 'build'
    if (progress < ARC.OUTRO_START) return 'main'
    return 'outro'
  }

  /**
   * Handle phase transitions
   */
  private transitionToPhase(newPhase: BlockPhase): void {
    this.currentPhase = newPhase

    // Adjust instruments based on phase
    switch (newPhase) {
      case 'intro':
        // Minimal: just drums, no bass/pads
        this.drums.setVolume(0.6)
        this.bass.setVolume(0)
        this.pads.setVolume(0)
        break

      case 'build':
        // Add bass, start bringing in pads
        this.drums.setVolume(0.7)
        this.bass.setVolume(0.4)
        this.pads.setVolume(0.2)
        break

      case 'main':
        // Full arrangement
        this.drums.setVolume(0.8)
        this.bass.setVolume(0.6)
        this.pads.setVolume(0.4)
        break

      case 'outro':
        // Fade out layers
        this.drums.setVolume(0.6)
        this.bass.setVolume(0.3)
        this.pads.setVolume(0.2)
        break
    }
  }

  /**
   * Called on each bar - handle chord changes
   */
  private onBar(bar: number, time: number): void {
    if (!this.isPlaying || this.currentPhase === 'intro') return

    const chords = this.style.chords
    const barsPerChord = chords.barsPerChord
    const chordIndex = Math.floor(bar / barsPerChord) % chords.chords.length

    // Play chord on first beat of each chord change
    if (bar % barsPerChord === 0) {
      const chordName = chords.chords[chordIndex]

      // Release previous chord, play new one
      if (this.currentPhase !== 'outro') {
        this.pads.allNotesOff(time)
        this.pads.chordOn(chordName, time + 0.01, 3, 0.7)
      }
    }
  }

  /**
   * Called on each 16th note - handle bass pattern
   */
  private onStep(step: number, time: number): void {
    if (!this.isPlaying) return
    if (this.currentPhase === 'intro') return

    const bassPattern = this.style.bass
    const bassNote = bassPattern.notes.find(n => n.step === step)

    if (bassNote) {
      // Release previous note briefly before new one
      this.bass.noteOff(time)
      this.bass.noteOn(bassNote.note, time + 0.005, 0.8)
    }
  }

  /**
   * Emit state change to all listeners
   */
  private emitStateChange(): void {
    const state = this.getState()
    for (const cb of this.onStateChangeCallbacks) {
      cb(state)
    }
  }

  /**
   * Clean up
   */
  dispose(): void {
    this.stop()
    this.patternPlayer.dispose()
    this.onStateChangeCallbacks = []
    this.onCompleteCallbacks = []
  }
}
