import type { Waveform } from '../audio/types'
import './ControlPanel.css'

interface ControlPanelProps {
  waveform: Waveform
  attack: number
  release: number
  masterGain: number
  onWaveformChange: (wf: Waveform) => void
  onAttackChange: (a: number) => void
  onReleaseChange: (r: number) => void
  onMasterGainChange: (g: number) => void
}

const WAVEFORMS: Waveform[] = ['sine', 'square', 'sawtooth', 'triangle']

export function ControlPanel({
  waveform,
  attack,
  release,
  masterGain,
  onWaveformChange,
  onAttackChange,
  onReleaseChange,
  onMasterGainChange,
}: ControlPanelProps) {
  return (
    <div className="control-panel">
      <div className="control-group">
        <label htmlFor="waveform">Waveform</label>
        <select
          id="waveform"
          value={waveform}
          onChange={(e) => onWaveformChange(e.target.value as Waveform)}
        >
          {WAVEFORMS.map((wf) => (
            <option key={wf} value={wf}>
              {wf.charAt(0).toUpperCase() + wf.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="control-group">
        <label htmlFor="attack">Attack: {attack.toFixed(2)}s</label>
        <input
          id="attack"
          type="range"
          min="0.001"
          max="1"
          step="0.01"
          value={attack}
          onChange={(e) => onAttackChange(parseFloat(e.target.value))}
        />
      </div>

      <div className="control-group">
        <label htmlFor="release">Release: {release.toFixed(2)}s</label>
        <input
          id="release"
          type="range"
          min="0.01"
          max="2"
          step="0.01"
          value={release}
          onChange={(e) => onReleaseChange(parseFloat(e.target.value))}
        />
      </div>

      <div className="control-group">
        <label htmlFor="volume">Volume: {Math.round(masterGain * 100)}%</label>
        <input
          id="volume"
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={masterGain}
          onChange={(e) => onMasterGainChange(parseFloat(e.target.value))}
        />
      </div>
    </div>
  )
}
