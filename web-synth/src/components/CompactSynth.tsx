import { useSynth } from '../hooks/useSynth'
import { Keyboard } from './Keyboard'
import { Knob } from './Knob'
import { ToggleGroup } from './Switch'
import { NOTES } from '../audio/noteFrequencies'
import type { Waveform } from '../audio/types'
import './CompactSynth.css'

const WAVEFORM_OPTIONS: { value: Waveform; label: string }[] = [
  { value: 'sine', label: 'SIN' },
  { value: 'triangle', label: 'TRI' },
  { value: 'sawtooth', label: 'SAW' },
  { value: 'square', label: 'SQR' },
]

interface CompactSynthProps {
  onClose: () => void
  onFullscreen: () => void
}

export function CompactSynth({ onClose, onFullscreen }: CompactSynthProps) {
  const {
    waveform,
    updateWaveform,
    attack,
    release,
    updateAttack,
    updateRelease,
    filterCutoff,
    updateFilterCutoff,
    masterGain,
    updateMasterGain,
    noteOn,
    noteOff,
  } = useSynth()

  return (
    <div className="compact-synth">
      <div className="compact-synth__header">
        <div className="compact-synth__title">
          <span className="compact-synth__name">Uberwelle</span>
          <span className="compact-synth__type">Polyphonic Synth</span>
        </div>
        <div className="compact-synth__actions">
          <button
            className="compact-synth__btn compact-synth__btn--expand"
            onClick={onFullscreen}
            title="Open full view"
          >
            [EXPAND]
          </button>
          <button
            className="compact-synth__btn compact-synth__btn--close"
            onClick={onClose}
            title="Close"
          >
            [X]
          </button>
        </div>
      </div>

      <div className="compact-synth__controls">
        <div className="compact-synth__section">
          <ToggleGroup
            value={waveform}
            options={WAVEFORM_OPTIONS}
            label="Wave"
            onChange={updateWaveform}
          />
        </div>

        <div className="compact-synth__section compact-synth__knobs">
          <Knob
            value={filterCutoff}
            min={20}
            max={20000}
            step={10}
            label="Cutoff"
            unit="Hz"
            formatValue={(v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v.toFixed(0))}
            onChange={updateFilterCutoff}
            size="small"
          />
          <Knob
            value={attack}
            min={0.001}
            max={2}
            step={0.01}
            label="Attack"
            formatValue={(v) => (v < 1 ? `${(v * 1000).toFixed(0)}ms` : `${v.toFixed(1)}s`)}
            onChange={updateAttack}
            size="small"
          />
          <Knob
            value={release}
            min={0.01}
            max={4}
            step={0.01}
            label="Release"
            formatValue={(v) => (v < 1 ? `${(v * 1000).toFixed(0)}ms` : `${v.toFixed(1)}s`)}
            onChange={updateRelease}
            size="small"
          />
          <Knob
            value={masterGain}
            min={0}
            max={1}
            step={0.01}
            label="Volume"
            formatValue={(v) => `${(v * 100).toFixed(0)}%`}
            onChange={updateMasterGain}
            size="small"
          />
        </div>
      </div>

      <div className="compact-synth__keyboard">
        <Keyboard
          notes={NOTES}
          onNoteDown={(id, freq) => noteOn(id, freq)}
          onNoteUp={(id) => noteOff(id)}
        />
      </div>

      <div className="compact-synth__hint">
        <span><kbd>Z</kbd>-<kbd>M</kbd> lower octave</span>
        <span><kbd>Q</kbd>-<kbd>I</kbd> upper octave</span>
      </div>
    </div>
  )
}
