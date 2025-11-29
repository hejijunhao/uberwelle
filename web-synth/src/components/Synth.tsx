import { useSynth } from '../hooks/useSynth'
import { Keyboard } from './Keyboard'
import { ModulePanel } from './ModulePanel'
import { Knob } from './Knob'
import { Switch, ToggleGroup } from './Switch'
import { NOTES } from '../audio/noteFrequencies'
import type { Waveform, FilterType, LfoTarget } from '../audio/types'
import './Synth.css'

const WAVEFORM_OPTIONS: { value: Waveform; label: string }[] = [
  { value: 'sine', label: 'SIN' },
  { value: 'triangle', label: 'TRI' },
  { value: 'sawtooth', label: 'SAW' },
  { value: 'square', label: 'SQR' },
]

const FILTER_TYPE_OPTIONS: { value: FilterType; label: string }[] = [
  { value: 'lowpass', label: 'LP' },
  { value: 'highpass', label: 'HP' },
  { value: 'bandpass', label: 'BP' },
  { value: 'notch', label: 'NT' },
]

const LFO_TARGET_OPTIONS: { value: LfoTarget; label: string }[] = [
  { value: 'pitch', label: 'PIT' },
  { value: 'filter', label: 'FLT' },
  { value: 'amplitude', label: 'AMP' },
]

export function Synth() {
  const {
    waveform,
    detune,
    octave,
    updateWaveform,
    updateDetune,
    updateOctave,
    attack,
    decay,
    sustain,
    release,
    updateAttack,
    updateDecay,
    updateSustain,
    updateRelease,
    filterType,
    filterCutoff,
    filterResonance,
    filterEnvAmount,
    updateFilterType,
    updateFilterCutoff,
    updateFilterResonance,
    updateFilterEnvAmount,
    lfoEnabled,
    lfoWaveform,
    lfoRate,
    lfoDepth,
    lfoTarget,
    updateLfoEnabled,
    updateLfoWaveform,
    updateLfoRate,
    updateLfoDepth,
    updateLfoTarget,
    masterGain,
    portamento,
    updateMasterGain,
    updatePortamento,
    noteOn,
    noteOff,
  } = useSynth()

  return (
    <div className="synth-root">
      <header className="page-header">
        <h1 className="brand">Motherboard Instruments</h1>
      </header>

      <div className="instrument-header">
        <h2 className="instrument-name">Überwelle</h2>
        <span className="instrument-type">Polyphonic Synthesizer</span>
        <span className="instrument-version">v0.2.0</span>
      </div>

      <div className="synth-housing">
        <div className="synth-inner">
          <div className="synth-modules">
            {/* VCO */}
            <ModulePanel title="[01] VCO">
              <div className="module-column">
                <ToggleGroup
                  value={waveform}
                  options={WAVEFORM_OPTIONS}
                  label="Wave"
                  onChange={updateWaveform}
                />
                <Knob
                  value={detune}
                  min={-100}
                  max={100}
                  step={1}
                  label="Detune"
                  unit="¢"
                  formatValue={(v) => v.toFixed(0)}
                  onChange={updateDetune}
                  size="small"
                />
                <Knob
                  value={octave}
                  min={-2}
                  max={2}
                  step={1}
                  label="Octave"
                  formatValue={(v) => (v > 0 ? `+${v}` : v.toString())}
                  onChange={updateOctave}
                  size="small"
                />
              </div>
            </ModulePanel>

            {/* VCF */}
            <ModulePanel title="[02] VCF">
              <div className="module-column">
                <ToggleGroup
                  value={filterType}
                  options={FILTER_TYPE_OPTIONS}
                  label="Type"
                  onChange={updateFilterType}
                />
                <Knob
                  value={filterCutoff}
                  min={20}
                  max={20000}
                  step={10}
                  label="Cutoff"
                  unit="Hz"
                  formatValue={(v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v.toFixed(0))}
                  onChange={updateFilterCutoff}
                  size="medium"
                />
                <Knob
                  value={filterResonance}
                  min={0}
                  max={30}
                  step={0.1}
                  label="Q"
                  formatValue={(v) => v.toFixed(1)}
                  onChange={updateFilterResonance}
                  size="small"
                />
                <Knob
                  value={filterEnvAmount}
                  min={-1}
                  max={1}
                  step={0.01}
                  label="Env"
                  formatValue={(v) => `${(v * 100).toFixed(0)}%`}
                  onChange={updateFilterEnvAmount}
                  size="small"
                />
              </div>
            </ModulePanel>

            {/* ENV */}
            <ModulePanel title="[03] ENV">
              <div className="env-knobs">
                <Knob
                  value={attack}
                  min={0.001}
                  max={2}
                  step={0.01}
                  label="A"
                  formatValue={(v) => (v < 1 ? `${(v * 1000).toFixed(0)}` : `${v.toFixed(1)}s`)}
                  onChange={updateAttack}
                  size="small"
                />
                <Knob
                  value={decay}
                  min={0.001}
                  max={2}
                  step={0.01}
                  label="D"
                  formatValue={(v) => (v < 1 ? `${(v * 1000).toFixed(0)}` : `${v.toFixed(1)}s`)}
                  onChange={updateDecay}
                  size="small"
                />
                <Knob
                  value={sustain}
                  min={0}
                  max={1}
                  step={0.01}
                  label="S"
                  formatValue={(v) => `${(v * 100).toFixed(0)}%`}
                  onChange={updateSustain}
                  size="small"
                />
                <Knob
                  value={release}
                  min={0.01}
                  max={4}
                  step={0.01}
                  label="R"
                  formatValue={(v) => (v < 1 ? `${(v * 1000).toFixed(0)}` : `${v.toFixed(1)}s`)}
                  onChange={updateRelease}
                  size="small"
                />
              </div>
            </ModulePanel>

            {/* LFO */}
            <ModulePanel title="[04] LFO">
              <div className="module-column">
                <Switch
                  value={lfoEnabled}
                  label="On"
                  onChange={updateLfoEnabled}
                />
                <ToggleGroup
                  value={lfoWaveform}
                  options={WAVEFORM_OPTIONS}
                  label="Wave"
                  onChange={updateLfoWaveform}
                />
                <Knob
                  value={lfoRate}
                  min={0.1}
                  max={30}
                  step={0.1}
                  label="Rate"
                  unit="Hz"
                  formatValue={(v) => v.toFixed(1)}
                  onChange={updateLfoRate}
                  size="small"
                />
                <Knob
                  value={lfoDepth}
                  min={0}
                  max={1}
                  step={0.01}
                  label="Depth"
                  formatValue={(v) => `${(v * 100).toFixed(0)}%`}
                  onChange={updateLfoDepth}
                  size="small"
                />
                <ToggleGroup
                  value={lfoTarget}
                  options={LFO_TARGET_OPTIONS}
                  label="Target"
                  onChange={updateLfoTarget}
                />
              </div>
            </ModulePanel>

            {/* MASTER */}
            <ModulePanel title="[05] OUT">
              <div className="module-column">
                <Knob
                  value={masterGain}
                  min={0}
                  max={1}
                  step={0.01}
                  label="Volume"
                  formatValue={(v) => `${(v * 100).toFixed(0)}%`}
                  onChange={updateMasterGain}
                  size="medium"
                />
                <Knob
                  value={portamento}
                  min={0}
                  max={1}
                  step={0.01}
                  label="Glide"
                  formatValue={(v) => (v < 0.1 ? `${(v * 1000).toFixed(0)}ms` : `${v.toFixed(2)}s`)}
                  onChange={updatePortamento}
                  size="small"
                />
              </div>
            </ModulePanel>
          </div>

          <Keyboard
            notes={NOTES}
            onNoteDown={(id, freq) => noteOn(id, freq)}
            onNoteUp={(id) => noteOff(id)}
          />
        </div>
      </div>

      <footer className="status-bar">
        <div className="status-bar-left">
          <span className="status-item active">AUDIO READY</span>
          <span className="status-divider" />
          <span className="status-item">VOICES: 0/8</span>
          <span className="status-divider" />
          <span className="status-item">48kHz / 32-bit</span>
        </div>
        <div className="status-bar-right">
          <span><kbd>Z</kbd>–<kbd>M</kbd> lower</span>
          <span><kbd>Q</kbd>–<kbd>I</kbd> upper</span>
          <span className="status-divider" />
          <span>Web Audio API</span>
        </div>
      </footer>
    </div>
  )
}
