import { useSynth } from '../hooks/useSynth'
import { Keyboard } from './Keyboard'
import { ModulePanel, PatchPoint } from './ModulePanel'
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
  { value: 'notch', label: 'NOTCH' },
]

const LFO_TARGET_OPTIONS: { value: LfoTarget; label: string }[] = [
  { value: 'pitch', label: 'PITCH' },
  { value: 'filter', label: 'FILTER' },
  { value: 'amplitude', label: 'AMP' },
]

export function Synth() {
  const {
    // Oscillator
    waveform,
    detune,
    octave,
    updateWaveform,
    updateDetune,
    updateOctave,

    // Envelope
    attack,
    decay,
    sustain,
    release,
    updateAttack,
    updateDecay,
    updateSustain,
    updateRelease,

    // Filter
    filterType,
    filterCutoff,
    filterResonance,
    filterEnvAmount,
    updateFilterType,
    updateFilterCutoff,
    updateFilterResonance,
    updateFilterEnvAmount,

    // LFO
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

    // Master
    masterGain,
    portamento,
    updateMasterGain,
    updatePortamento,

    // Notes
    noteOn,
    noteOff,
  } = useSynth()

  return (
    <div className="synth-root">
      <header className="synth-header">
        <h1>Überwelle</h1>
        <p className="synth-subtitle">Polyphonic Web Synthesizer</p>
        <p className="synth-model-badge">Model 002</p>
      </header>

      <div className="synth-housing">
        <div className="synth-inner">
          {/* Main control area with modules */}
          <div className="synth-modules">
            {/* ─── OSCILLATOR MODULE ─────────────────────────────────── */}
            <ModulePanel title="VCO" color="primary">
              <div className="module-column">
                <ToggleGroup
                  value={waveform}
                  options={WAVEFORM_OPTIONS}
                  label="Waveform"
                  onChange={updateWaveform}
                />
              </div>
              <div className="module-divider" />
              <div className="module-column">
                <Knob
                  value={detune}
                  min={-100}
                  max={100}
                  step={1}
                  label="Detune"
                  unit="¢"
                  formatValue={(v) => v.toFixed(0)}
                  onChange={updateDetune}
                  size="medium"
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
              <div className="patch-row">
                <PatchPoint type="output" label="OUT" />
              </div>
            </ModulePanel>

            {/* ─── FILTER MODULE ─────────────────────────────────────── */}
            <ModulePanel title="VCF" color="secondary">
              <div className="module-column">
                <ToggleGroup
                  value={filterType}
                  options={FILTER_TYPE_OPTIONS}
                  label="Type"
                  onChange={updateFilterType}
                />
              </div>
              <div className="module-divider" />
              <div className="module-column">
                <Knob
                  value={filterCutoff}
                  min={20}
                  max={20000}
                  step={10}
                  label="Cutoff"
                  unit="Hz"
                  formatValue={(v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v.toFixed(0))}
                  onChange={updateFilterCutoff}
                  size="large"
                  color="secondary"
                />
              </div>
              <div className="module-column">
                <Knob
                  value={filterResonance}
                  min={0}
                  max={30}
                  step={0.1}
                  label="Resonance"
                  formatValue={(v) => v.toFixed(1)}
                  onChange={updateFilterResonance}
                  size="medium"
                  color="secondary"
                />
                <Knob
                  value={filterEnvAmount}
                  min={-1}
                  max={1}
                  step={0.01}
                  label="Env Amt"
                  formatValue={(v) => `${(v * 100).toFixed(0)}%`}
                  onChange={updateFilterEnvAmount}
                  size="small"
                  color="secondary"
                />
              </div>
              <div className="patch-row">
                <PatchPoint type="input" label="IN" />
                <PatchPoint type="output" label="OUT" />
              </div>
            </ModulePanel>

            {/* ─── ENVELOPE MODULE ───────────────────────────────────── */}
            <ModulePanel title="ENV" color="hot">
              <div className="env-knobs">
                <Knob
                  value={attack}
                  min={0.001}
                  max={2}
                  step={0.01}
                  label="Attack"
                  unit="s"
                  formatValue={(v) => (v < 1 ? `${(v * 1000).toFixed(0)}ms` : `${v.toFixed(2)}s`)}
                  onChange={updateAttack}
                  size="medium"
                  color="hot"
                />
                <Knob
                  value={decay}
                  min={0.001}
                  max={2}
                  step={0.01}
                  label="Decay"
                  unit="s"
                  formatValue={(v) => (v < 1 ? `${(v * 1000).toFixed(0)}ms` : `${v.toFixed(2)}s`)}
                  onChange={updateDecay}
                  size="medium"
                  color="hot"
                />
                <Knob
                  value={sustain}
                  min={0}
                  max={1}
                  step={0.01}
                  label="Sustain"
                  formatValue={(v) => `${(v * 100).toFixed(0)}%`}
                  onChange={updateSustain}
                  size="medium"
                  color="hot"
                />
                <Knob
                  value={release}
                  min={0.01}
                  max={4}
                  step={0.01}
                  label="Release"
                  unit="s"
                  formatValue={(v) => (v < 1 ? `${(v * 1000).toFixed(0)}ms` : `${v.toFixed(2)}s`)}
                  onChange={updateRelease}
                  size="medium"
                  color="hot"
                />
              </div>
              <div className="patch-row">
                <PatchPoint type="output" label="OUT" />
              </div>
            </ModulePanel>

            {/* ─── LFO MODULE ────────────────────────────────────────── */}
            <ModulePanel title="LFO" color="cool">
              <div className="module-column">
                <Switch
                  value={lfoEnabled}
                  label="Active"
                  onChange={updateLfoEnabled}
                />
                <ToggleGroup
                  value={lfoWaveform}
                  options={WAVEFORM_OPTIONS}
                  label="Wave"
                  onChange={updateLfoWaveform}
                />
              </div>
              <div className="module-divider" />
              <div className="module-column">
                <Knob
                  value={lfoRate}
                  min={0.1}
                  max={30}
                  step={0.1}
                  label="Rate"
                  unit="Hz"
                  formatValue={(v) => v.toFixed(1)}
                  onChange={updateLfoRate}
                  size="medium"
                  color="cool"
                />
                <Knob
                  value={lfoDepth}
                  min={0}
                  max={1}
                  step={0.01}
                  label="Depth"
                  formatValue={(v) => `${(v * 100).toFixed(0)}%`}
                  onChange={updateLfoDepth}
                  size="medium"
                  color="cool"
                />
              </div>
              <div className="module-divider" />
              <div className="module-column">
                <ToggleGroup
                  value={lfoTarget}
                  options={LFO_TARGET_OPTIONS}
                  label="Target"
                  onChange={updateLfoTarget}
                  layout="vertical"
                />
              </div>
              <div className="patch-row">
                <PatchPoint type="output" label="OUT" />
              </div>
            </ModulePanel>

            {/* ─── MASTER MODULE ─────────────────────────────────────── */}
            <ModulePanel title="MASTER" color="primary">
              <div className="module-column">
                <Knob
                  value={masterGain}
                  min={0}
                  max={1}
                  step={0.01}
                  label="Volume"
                  formatValue={(v) => `${(v * 100).toFixed(0)}%`}
                  onChange={updateMasterGain}
                  size="large"
                />
              </div>
              <div className="module-column">
                <Knob
                  value={portamento}
                  min={0}
                  max={1}
                  step={0.01}
                  label="Glide"
                  unit="s"
                  formatValue={(v) => (v < 0.1 ? `${(v * 1000).toFixed(0)}ms` : `${v.toFixed(2)}s`)}
                  onChange={updatePortamento}
                  size="medium"
                />
              </div>
              <div className="patch-row">
                <PatchPoint type="input" label="IN" />
              </div>
            </ModulePanel>
          </div>

          {/* Keyboard at the bottom */}
          <Keyboard
            notes={NOTES}
            onNoteDown={(id, freq) => noteOn(id, freq)}
            onNoteUp={(id) => noteOff(id)}
          />
        </div>
      </div>

      <footer className="synth-footer">
        <p>
          <kbd>Z</kbd>–<kbd>M</kbd> lower octave · <kbd>Q</kbd>–<kbd>I</kbd> upper octave
        </p>
      </footer>

      {/* Noise texture overlay for that analog feel */}
      <div className="noise-overlay" aria-hidden="true" />
    </div>
  )
}
