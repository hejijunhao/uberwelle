import './ComposerBlock.css'

export interface BlockData {
  id: string
  configured: boolean
  bpm: number
  style: string
  instruments: string[]
}

export interface ComposerBlockProps {
  block: BlockData
  index: number
  isActive: boolean
  onClick: () => void
}

export function ComposerBlock({ block, index, isActive, onClick }: ComposerBlockProps) {
  return (
    <button
      className={`composer-block ${isActive ? 'composer-block--active' : ''} ${block.configured ? 'composer-block--configured' : ''}`}
      onClick={onClick}
      type="button"
    >
      <span className="composer-block__number">{index + 1}</span>
      {block.configured && (
        <div className="composer-block__info">
          <span className="composer-block__bpm">{block.bpm}</span>
          <span className="composer-block__style">{block.style.slice(0, 3).toUpperCase()}</span>
        </div>
      )}
    </button>
  )
}
