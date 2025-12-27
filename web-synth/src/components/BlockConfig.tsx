import { useState, useEffect } from 'react'
import { Knob } from './Knob'
import type { BlockData } from './ComposerBlock'
import './BlockConfig.css'

const STYLES = [
  'ambient',
  'techno',
  'house',
  'jazz',
  'experimental',
  'drone',
  'minimal',
  'breaks',
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
}

export function BlockConfig({ block, blockIndex, onSave, onClear }: BlockConfigProps) {
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
  }

  return (
    <div className="block-config">
      <div className="block-config__header">
        <span className="block-config__title">BLOCK {blockIndex + 1} CONFIG</span>
      </div>

      <div className="block-config__body">
        <div className="block-config__section">
          <div className="block-config__control">
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

          <div className="block-config__control block-config__control--style">
            <label className="block-config__label">STYLE</label>
            <select
              className="block-config__select"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
            >
              {STYLES.map(s => (
                <option key={s} value={s}>{s.toUpperCase()}</option>
              ))}
            </select>
          </div>
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

        <div className="block-config__actions">
          <button
            type="button"
            className="block-config__btn block-config__btn--save"
            onClick={handleSave}
          >
            SAVE
          </button>
          <button
            type="button"
            className="block-config__btn block-config__btn--clear"
            onClick={onClear}
          >
            CLEAR
          </button>
        </div>
      </div>
    </div>
  )
}
