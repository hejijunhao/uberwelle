/**
 * Set Player
 *
 * Orchestrates playback of multiple blocks in sequence.
 * This is the top-level controller for the Composer's playback.
 */

import { getClock, disposeClock } from './clock'
import { getDrumSynth, disposeDrumSynth } from './drumSynth'
import { getBassSynth, disposeBassSynth } from './bassSynth'
import { getPadSynth, disposePadSynth } from './padSynth'
import { BlockPlayer } from './blockPlayer'
import type { BlockConfig, SetPlayerState } from './types'

type StateChangeCallback = (state: SetPlayerState) => void

export class SetPlayer {
  private blocks: BlockConfig[] = []
  private blockPlayer: BlockPlayer | null = null

  // Playback state
  private _isPlaying: boolean = false
  private _isPaused: boolean = false
  private _currentBlockIndex: number = 0

  // Callbacks
  private onStateChangeCallbacks: StateChangeCallback[] = []

  constructor() {
    // BlockPlayer will be created when needed
  }

  /**
   * Load a set of blocks
   */
  loadSet(blocks: BlockConfig[]): void {
    // Filter to only configured blocks
    this.blocks = blocks.filter(b => b.configured)
    this._currentBlockIndex = 0
    this._isPlaying = false
    this._isPaused = false

    this.emitStateChange()
  }

  /**
   * Get the loaded blocks
   */
  getBlocks(): BlockConfig[] {
    return this.blocks
  }

  /**
   * Start playback from the beginning or current position
   */
  play(): void {
    if (this.blocks.length === 0) return

    if (this._isPaused) {
      // Resume from pause
      this._isPaused = false
      // TODO: Implement true pause/resume in BlockPlayer
      this.playCurrentBlock()
    } else if (!this._isPlaying) {
      // Start fresh
      this._isPlaying = true
      this._currentBlockIndex = 0
      this.playCurrentBlock()
    }

    this.emitStateChange()
  }

  /**
   * Pause playback
   */
  pause(): void {
    if (!this._isPlaying || this._isPaused) return

    this._isPaused = true
    if (this.blockPlayer) {
      this.blockPlayer.stop()
    }

    this.emitStateChange()
  }

  /**
   * Stop playback and reset to beginning
   */
  stop(): void {
    this._isPlaying = false
    this._isPaused = false
    this._currentBlockIndex = 0

    if (this.blockPlayer) {
      this.blockPlayer.stop()
    }

    this.emitStateChange()
  }

  /**
   * Skip to the next block
   */
  skip(): void {
    if (!this._isPlaying || this.blocks.length === 0) return

    // Stop current block
    if (this.blockPlayer) {
      this.blockPlayer.stop()
    }

    // Move to next block
    this._currentBlockIndex++

    if (this._currentBlockIndex >= this.blocks.length) {
      // End of set
      this.stop()
      return
    }

    // Play next block
    this.playCurrentBlock()
    this.emitStateChange()
  }

  /**
   * Jump to a specific block
   */
  jumpToBlock(index: number): void {
    if (index < 0 || index >= this.blocks.length) return

    const wasPlaying = this._isPlaying

    if (this.blockPlayer) {
      this.blockPlayer.stop()
    }

    this._currentBlockIndex = index

    if (wasPlaying) {
      this.playCurrentBlock()
    }

    this.emitStateChange()
  }

  /**
   * Get current state
   */
  getState(): SetPlayerState {
    const blockState = this.blockPlayer?.getState()

    return {
      isPlaying: this._isPlaying,
      isPaused: this._isPaused,
      currentBlockIndex: this._currentBlockIndex,
      blockProgress: blockState?.progress ?? 0,
      totalBlocks: this.blocks.length,
    }
  }

  /**
   * Get current block info
   */
  getCurrentBlock(): BlockConfig | null {
    if (this._currentBlockIndex >= this.blocks.length) return null
    return this.blocks[this._currentBlockIndex]
  }

  /**
   * Register state change callback
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
   * Play the current block
   */
  private playCurrentBlock(): void {
    if (this._currentBlockIndex >= this.blocks.length) {
      this.stop()
      return
    }

    const block = this.blocks[this._currentBlockIndex]

    // Ensure block player exists
    if (!this.blockPlayer) {
      this.blockPlayer = new BlockPlayer(
        getClock(),
        getDrumSynth(),
        getBassSynth(),
        getPadSynth()
      )
    }

    // Listen for block completion
    const unsubComplete = this.blockPlayer.onComplete(() => {
      unsubComplete()
      this.onBlockComplete()
    })

    // Listen for block state changes (subscription managed by blockPlayer lifecycle)
    this.blockPlayer.onStateChange(() => {
      this.emitStateChange()
    })

    // Load and play
    this.blockPlayer.load({
      ...block,
      duration: 300, // 5 minutes
    })
    this.blockPlayer.play()
  }

  /**
   * Handle block completion
   */
  private onBlockComplete(): void {
    this._currentBlockIndex++

    if (this._currentBlockIndex >= this.blocks.length) {
      // End of set
      this.stop()
    } else {
      // Play next block
      this.playCurrentBlock()
    }

    this.emitStateChange()
  }

  /**
   * Emit state change to listeners
   */
  private emitStateChange(): void {
    const state = this.getState()
    for (const cb of this.onStateChangeCallbacks) {
      cb(state)
    }
  }

  /**
   * Clean up all resources
   */
  dispose(): void {
    this.stop()

    if (this.blockPlayer) {
      this.blockPlayer.dispose()
      this.blockPlayer = null
    }

    // Dispose all singletons
    disposeClock()
    disposeDrumSynth()
    disposeBassSynth()
    disposePadSynth()

    this.onStateChangeCallbacks = []
    this.blocks = []
  }
}

// Singleton instance
let setPlayerInstance: SetPlayer | null = null

export function getSetPlayer(): SetPlayer {
  if (!setPlayerInstance) {
    setPlayerInstance = new SetPlayer()
  }
  return setPlayerInstance
}

export function disposeSetPlayer(): void {
  if (setPlayerInstance) {
    setPlayerInstance.dispose()
    setPlayerInstance = null
  }
}
