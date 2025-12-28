/**
 * useSetPlayer Hook
 *
 * React wrapper around the SetPlayer singleton for clean state management.
 * Provides reactive state updates and transport controls.
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { getSetPlayer } from '../audio/composer/setPlayer'
import { getStyle } from '../audio/composer/styles'
import type { SetPlayerState, BlockConfig } from '../audio/composer/types'

interface UseSetPlayerReturn {
  // State
  isPlaying: boolean
  isPaused: boolean
  currentBlockIndex: number
  progress: number
  totalBlocks: number
  isLoaded: boolean

  // Current block info
  currentBlock: BlockConfig | null
  currentStyle: string | null
  currentBpm: number | null

  // Actions
  loadSet: (blocks: BlockConfig[]) => void
  play: () => void
  pause: () => void
  stop: () => void
  skip: () => void
  jumpToBlock: (index: number) => void

  // Helpers
  formatTime: (progress: number, durationSeconds?: number) => string
  getElapsedSeconds: (durationSeconds?: number) => number
}

const DEFAULT_STATE: SetPlayerState = {
  isPlaying: false,
  isPaused: false,
  currentBlockIndex: 0,
  blockProgress: 0,
  totalBlocks: 0,
}

export function useSetPlayer(): UseSetPlayerReturn {
  const playerRef = useRef(getSetPlayer())
  const [state, setState] = useState<SetPlayerState>(DEFAULT_STATE)

  // Subscribe to state changes
  useEffect(() => {
    const player = playerRef.current

    // Get initial state
    setState(player.getState())

    // Subscribe to updates
    const unsubscribe = player.onStateChange((newState) => {
      setState(newState)
    })

    return () => {
      unsubscribe()
    }
  }, [])

  // Actions
  const loadSet = useCallback((blocks: BlockConfig[]) => {
    playerRef.current.loadSet(blocks)
  }, [])

  const play = useCallback(() => {
    playerRef.current.play()
  }, [])

  const pause = useCallback(() => {
    playerRef.current.pause()
  }, [])

  const stop = useCallback(() => {
    playerRef.current.stop()
  }, [])

  const skip = useCallback(() => {
    playerRef.current.skip()
  }, [])

  const jumpToBlock = useCallback((index: number) => {
    playerRef.current.jumpToBlock(index)
  }, [])

  // Current block info
  const currentBlock = useMemo(() => {
    return playerRef.current.getCurrentBlock()
  }, [state.currentBlockIndex, state.totalBlocks])

  const currentStyle = useMemo(() => {
    if (!currentBlock) return null
    const style = getStyle(currentBlock.style)
    return style.displayName || currentBlock.style
  }, [currentBlock])

  const currentBpm = useMemo(() => {
    return currentBlock?.bpm ?? null
  }, [currentBlock])

  // Helpers
  const formatTime = useCallback((progress: number, durationSeconds: number = 300): string => {
    const elapsed = Math.floor(progress * durationSeconds)
    const minutes = Math.floor(elapsed / 60)
    const seconds = elapsed % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }, [])

  const getElapsedSeconds = useCallback((durationSeconds: number = 300): number => {
    return Math.floor(state.blockProgress * durationSeconds)
  }, [state.blockProgress])

  return {
    // State
    isPlaying: state.isPlaying,
    isPaused: state.isPaused,
    currentBlockIndex: state.currentBlockIndex,
    progress: state.blockProgress,
    totalBlocks: state.totalBlocks,
    isLoaded: state.totalBlocks > 0,

    // Current block info
    currentBlock,
    currentStyle,
    currentBpm,

    // Actions
    loadSet,
    play,
    pause,
    stop,
    skip,
    jumpToBlock,

    // Helpers
    formatTime,
    getElapsedSeconds,
  }
}
