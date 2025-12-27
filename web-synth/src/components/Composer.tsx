import { useState } from 'react'
import { ComposerBlock } from './ComposerBlock'
import type { BlockData } from './ComposerBlock'
import { BlockConfig } from './BlockConfig'
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

export function Composer() {
  const [blocks, setBlocks] = useState<BlockData[]>(INITIAL_BLOCKS)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const handleBlockClick = (index: number) => {
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

  const configuredCount = blocks.filter(b => b.configured).length

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
        />
      )}

      <div className="composer__footer">
        <span className="composer__status">
          {configuredCount}/16 BLOCKS CONFIGURED
        </span>
        {configuredCount > 0 && (
          <button type="button" className="composer__build-btn">
            BUILD SET →
          </button>
        )}
      </div>
    </div>
  )
}
