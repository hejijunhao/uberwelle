/**
 * SetPlayerControls
 *
 * Transport controls for the Composer's set playback.
 * Displays play/pause/stop/skip buttons, progress bar, and current block info.
 */

import { useSetPlayer } from '../hooks/useSetPlayer'
import './SetPlayerControls.css'

const BLOCK_DURATION = 300 // 5 minutes in seconds

const STYLE_COLORS: Record<string, string> = {
  deepHouse: 'var(--color-style-house)',
  progressiveHouse: 'var(--color-style-house)',
  techno: 'var(--color-style-techno)',
  ambient: 'var(--color-style-ambient)',
  house: 'var(--color-style-house)',
  jazz: 'var(--color-style-jazz)',
  experimental: 'var(--color-style-experimental)',
  drone: 'var(--color-style-drone)',
  minimal: 'var(--color-style-minimal)',
  breaks: 'var(--color-style-breaks)',
}

export function SetPlayerControls() {
  const {
    isPlaying,
    isPaused,
    currentBlockIndex,
    progress,
    totalBlocks,
    currentBlock,
    currentStyle,
    currentBpm,
    play,
    pause,
    stop,
    skip,
    formatTime,
  } = useSetPlayer()

  const elapsed = formatTime(progress, BLOCK_DURATION)
  const total = formatTime(1, BLOCK_DURATION) // "5:00"
  const styleColor = currentBlock ? STYLE_COLORS[currentBlock.style] || 'var(--color-gray-400)' : 'var(--color-gray-400)'

  const handlePlayPause = () => {
    if (isPlaying && !isPaused) {
      pause()
    } else {
      play()
    }
  }

  return (
    <div className="set-player-controls">
      {/* Transport buttons */}
      <div className="set-player-controls__transport">
        <button
          type="button"
          className={`transport-btn ${isPlaying && !isPaused ? 'transport-btn--active' : ''}`}
          onClick={handlePlayPause}
          title={isPlaying && !isPaused ? 'Pause' : 'Play'}
        >
          {isPlaying && !isPaused ? '⏸ PAUSE' : '▶ PLAY'}
        </button>

        <button
          type="button"
          className="transport-btn"
          onClick={stop}
          disabled={!isPlaying && !isPaused}
          title="Stop"
        >
          ⏹ STOP
        </button>

        <button
          type="button"
          className="transport-btn"
          onClick={skip}
          disabled={!isPlaying || currentBlockIndex >= totalBlocks - 1}
          title="Skip to next block"
        >
          ⏭ SKIP
        </button>
      </div>

      {/* Progress section */}
      <div className="set-player-controls__progress-section">
        <div className="set-player-controls__info">
          <span className="set-player-controls__block-indicator">
            BLOCK {currentBlockIndex + 1}/{totalBlocks}
          </span>
          <span className="set-player-controls__time">
            {elapsed} / {total}
          </span>
        </div>

        <div className="set-player-controls__progress-bar">
          <div
            className="set-player-controls__progress-fill"
            style={{
              width: `${progress * 100}%`,
              background: `linear-gradient(90deg, ${styleColor}, ${styleColor})`,
            }}
          />
        </div>

        <div className="set-player-controls__style-info" style={{ color: styleColor }}>
          {currentStyle?.toUpperCase() || 'NO STYLE'} @ {currentBpm || '--'} BPM
        </div>
      </div>
    </div>
  )
}
