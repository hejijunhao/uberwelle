import { useSynth } from '../hooks/useSynth'
import { Keyboard } from './Keyboard'
import { ControlPanel } from './ControlPanel'
import { NOTES } from '../audio/noteFrequencies'
import './Synth.css'

export function Synth() {
  const {
    waveform,
    attack,
    release,
    masterGain,
    updateWaveform,
    updateAttack,
    updateRelease,
    updateMasterGain,
    noteOn,
    noteOff,
  } = useSynth()

  return (
    <div className="synth-root">
      <header className="synth-header">
        <h1>Überwelle</h1>
        <p className="synth-subtitle">Polyphonic Web Synthesizer</p>
        <p className="synth-model-badge">Model 001</p>
      </header>

      <div className="synth-housing">
        <div className="synth-inner">
          <ControlPanel
            waveform={waveform}
            attack={attack}
            release={release}
            masterGain={masterGain}
            onWaveformChange={updateWaveform}
            onAttackChange={updateAttack}
            onReleaseChange={updateRelease}
            onMasterGainChange={updateMasterGain}
          />

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
