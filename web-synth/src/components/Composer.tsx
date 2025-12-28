import { useState } from 'react'
import { ComposerBlock } from './ComposerBlock'
import type { BlockData } from './ComposerBlock'
import { BlockConfig } from './BlockConfig'
import { SetPlayerControls } from './SetPlayerControls'
import { useSetPlayer } from '../hooks/useSetPlayer'
import type { BlockConfig as AudioBlockConfig } from '../audio/composer/types'
import './Composer.css'

const createEmptyBlock = (id: string): BlockData => ({
  id,
  configured: false,
  bpm: 120,
  style: 'ambient',
  instruments: [],
})

const INITIAL_BLOCKS: BlockData[] = Array.from({ length: 16 }, (_, i) =>
  createEmptyBlock(`block-${i}`)
)

/**
 * Convert UI BlockData to audio engine BlockConfig
 */
function toAudioBlockConfig(block: BlockData): AudioBlockConfig {
  return {
    id: block.id,
    configured: block.configured,
    bpm: block.bpm,
    style: block.style,
    instruments: block.instruments,
    duration: 300, // 5 minutes
  }
}

export function Composer() {
  const [blocks, setBlocks] = useState<BlockData[]>(INITIAL_BLOCKS)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const {
    isLoaded,
    isPlaying,
    isPaused,
    currentBlockIndex,
    loadSet,
    stop,
  } = useSetPlayer()

  const handleBlockClick = (index: number) => {
    // If playing, allow clicking to jump to block
    // For now, just toggle config panel
    setActiveIndex(activeIndex === index ? null : index)
  }

  const handleSave = (updatedBlock: BlockData) => {
    setBlocks(prev =>
      prev.map((b, i) => (i === activeIndex ? updatedBlock : b))
    )
  }

  const handleClear = () => {
    if (activeIndex !== null) {
      setBlocks(prev =>
        prev.map((b, i) =>
          i === activeIndex ? createEmptyBlock(b.id) : b
        )
      )
    }
  }

  const handleBuildSet = () => {
    // Convert to audio engine format and load
    const audioBlocks = blocks.map(toAudioBlockConfig)
    loadSet(audioBlocks)
  }

  const handleReset = () => {
    stop()
  }

  const configuredCount = blocks.filter(b => b.configured).length

  // Find the index in the full blocks array that corresponds to current playing block
  // The setPlayer only contains configured blocks, so we need to map back
  const getPlayingBlockIndex = (): number | null => {
    if (!isPlaying && !isPaused) return null

    // Get configured block indices
    const configuredIndices = blocks
      .map((b, i) => b.configured ? i : -1)
      .filter(i => i !== -1)

    // Map the current block index in the set to the original block index
    if (currentBlockIndex < configuredIndices.length) {
      return configuredIndices[currentBlockIndex]
    }
    return null
  }

  const playingBlockIndex = getPlayingBlockIndex()

  return (
    <div className="composer">
      <div className="composer__header">
        <div className="composer__title-row">
          <span className="composer__icon">[◆]</span>
          <span className="composer__label">SET BUILDER</span>
        </div>
        <h3 className="composer__title">COMPOSER</h3>
        <p className="composer__description">
          Configure each block to build your set. Click a block to edit its BPM, style, and instruments.
        </p>
      </div>

      <div className="composer__blocks">
        {blocks.map((block, index) => (
          <ComposerBlock
            key={block.id}
            block={block}
            index={index}
            isActive={activeIndex === index}
            isPlaying={playingBlockIndex === index}
            onClick={() => handleBlockClick(index)}
          />
        ))}
      </div>

      {activeIndex !== null && (
        <BlockConfig
          block={blocks[activeIndex]}
          blockIndex={activeIndex}
          onSave={handleSave}
          onClear={handleClear}
          onClose={() => setActiveIndex(null)}
        />
      )}

      {/* Show controls when set is loaded */}
      {isLoaded && <SetPlayerControls />}

      <div className="composer__footer">
        <span className="composer__status">
          {configuredCount}/16 BLOCKS CONFIGURED
        </span>
        <div className="composer__actions">
          {isLoaded && (
            <button
              type="button"
              className="composer__reset-btn"
              onClick={handleReset}
            >
              RESET
            </button>
          )}
          {configuredCount > 0 && (
            <button
              type="button"
              className="composer__build-btn"
              onClick={handleBuildSet}
            >
              {isLoaded ? 'REBUILD SET →' : 'BUILD SET →'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
