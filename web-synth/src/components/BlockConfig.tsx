import { useState, useEffect } from 'react'
import { Knob } from './Knob'
import type { BlockData } from './ComposerBlock'
import './BlockConfig.css'

export const STYLES = [
  { id: 'ambient', label: 'AMBIENT', color: 'var(--color-style-ambient)' },
  { id: 'techno', label: 'TECHNO', color: 'var(--color-style-techno)' },
  { id: 'house', label: 'HOUSE', color: 'var(--color-style-house)' },
  { id: 'jazz', label: 'JAZZ', color: 'var(--color-style-jazz)' },
  { id: 'experimental', label: 'EXPRMNTL', color: 'var(--color-style-experimental)' },
  { id: 'drone', label: 'DRONE', color: 'var(--color-style-drone)' },
  { id: 'minimal', label: 'MINIMAL', color: 'var(--color-style-minimal)' },
  { id: 'breaks', label: 'BREAKS', color: 'var(--color-style-breaks)' },
]

const AVAILABLE_INSTRUMENTS = [
  { id: 'synth', label: 'SYNTH' },
  { id: 'drums', label: 'DRUMS' },
  { id: 'sampler', label: 'SAMPLER' },
  { id: 'ambient', label: 'AMBIENT' },
]

interface BlockConfigProps {
  block: BlockData
  blockIndex: number
  onSave: (block: BlockData) => void
  onClear: () => void
  onClose: () => void
}

export function BlockConfig({ block, blockIndex, onSave, onClear, onClose }: BlockConfigProps) {
  const [bpm, setBpm] = useState(block.bpm)
  const [style, setStyle] = useState(block.style)
  const [instruments, setInstruments] = useState<string[]>(block.instruments)

  useEffect(() => {
    setBpm(block.bpm)
    setStyle(block.style)
    setInstruments(block.instruments)
  }, [block])

  const toggleInstrument = (id: string) => {
    setInstruments(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    )
  }

  const handleSave = () => {
    onSave({
      ...block,
      configured: true,
      bpm,
      style,
      instruments,
    })
    onClose()
  }

  const handleClear = () => {
    onClear()
    onClose()
  }

  const currentStyleColor = STYLES.find(s => s.id === style)?.color || 'var(--color-gray-500)'

  return (
    <div className="block-config-overlay" onClick={onClose}>
      <div className="block-config" onClick={(e) => e.stopPropagation()}>
        <div className="block-config__header">
          <span className="block-config__title">
            <span
              className="block-config__block-indicator"
              style={{ backgroundColor: currentStyleColor }}
            />
            BLOCK {blockIndex + 1}
          </span>
          <button
            type="button"
            className="block-config__close"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="block-config__body">
          <div className="block-config__section block-config__section--styles">
            <label className="block-config__label">STYLE</label>
            <div className="block-config__styles">
              {STYLES.map(s => (
                <button
                  key={s.id}
                  type="button"
                  className={`block-config__style ${style === s.id ? 'block-config__style--active' : ''}`}
                  onClick={() => setStyle(s.id)}
                  style={{
                    '--style-color': s.color,
                    borderColor: style === s.id ? s.color : undefined,
                    color: style === s.id ? s.color : undefined,
                  } as React.CSSProperties}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="block-config__row">
            <div className="block-config__section block-config__section--bpm">
              <Knob
                value={bpm}
                min={60}
                max={200}
                step={1}
                label="BPM"
                onChange={setBpm}
                size="small"
              />
            </div>

            <div className="block-config__section block-config__section--instruments">
              <label className="block-config__label">INSTRUMENTS</label>
              <div className="block-config__instruments">
                {AVAILABLE_INSTRUMENTS.map(inst => (
                  <button
                    key={inst.id}
                    type="button"
                    className={`block-config__instrument ${instruments.includes(inst.id) ? 'block-config__instrument--active' : ''}`}
                    onClick={() => toggleInstrument(inst.id)}
                  >
                    <span className="block-config__instrument-check">
                      {instruments.includes(inst.id) ? '×' : '○'}
                    </span>
                    {inst.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="block-config__actions">
            <button
              type="button"
              className="block-config__btn block-config__btn--save"
              onClick={handleSave}
              style={{
                backgroundColor: currentStyleColor,
                borderColor: currentStyleColor,
              }}
            >
              SAVE BLOCK
            </button>
            <button
              type="button"
              className="block-config__btn block-config__btn--clear"
              onClick={handleClear}
            >
              CLEAR
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
