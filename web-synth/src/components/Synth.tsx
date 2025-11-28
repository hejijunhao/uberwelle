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
        <p className="synth-subtitle">Web Synthesizer V1</p>
      </header>

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

      <footer className="synth-footer">
        <p>
          🎹 Click keys or use your keyboard: <kbd>Z</kbd>-<kbd>M</kbd> (lower octave),{' '}
          <kbd>Q</kbd>-<kbd>I</kbd> (upper octave)
        </p>
      </footer>
    </div>
  )
}
