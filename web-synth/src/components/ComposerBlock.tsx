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
  isPlaying?: boolean
  onClick: () => void
}

const STYLE_COLORS: Record<string, string> = {
  ambient: 'var(--color-style-ambient)',
  techno: 'var(--color-style-techno)',
  house: 'var(--color-style-house)',
  jazz: 'var(--color-style-jazz)',
  experimental: 'var(--color-style-experimental)',
  drone: 'var(--color-style-drone)',
  minimal: 'var(--color-style-minimal)',
  breaks: 'var(--color-style-breaks)',
}

export function ComposerBlock({ block, index, isActive, isPlaying, onClick }: ComposerBlockProps) {
  const styleColor = block.configured ? STYLE_COLORS[block.style] || 'var(--color-gray-500)' : undefined

  const classNames = [
    'composer-block',
    isActive && 'composer-block--active',
    isPlaying && 'composer-block--playing',
    block.configured && 'composer-block--configured',
  ].filter(Boolean).join(' ')

  return (
    <button
      className={classNames}
      onClick={onClick}
      type="button"
      style={block.configured ? {
        '--block-color': styleColor,
        borderColor: isActive ? styleColor : undefined,
      } as React.CSSProperties : undefined}
    >
      <span className="composer-block__number">{index + 1}</span>
      {block.configured && (
        <div className="composer-block__info">
          <span className="composer-block__bpm">{block.bpm}</span>
          <span
            className="composer-block__style"
            style={{ color: styleColor }}
          >
            {block.style.slice(0, 3).toUpperCase()}
          </span>
        </div>
      )}
      {block.configured && (
        <span
          className="composer-block__color-bar"
          style={{ backgroundColor: styleColor }}
        />
      )}
    </button>
  )
}
