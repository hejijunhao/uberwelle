import { useEffect, useRef, useState, useCallback } from 'react'
import { SynthEngine } from '../audio/synthEngine'
import { createDefaultConfig, type FilterType, type LfoTarget, type Waveform } from '../audio/types'
import { getAudioContext } from '../audio/audioContext'

export function useSynth() {
  const engineRef = useRef<SynthEngine | null>(null)

  // Initialize with default config
  const defaultConfig = createDefaultConfig()

  // Oscillator state
  const [waveform, setWaveform] = useState<Waveform>(defaultConfig.oscillator.waveform)
  const [detune, setDetune] = useState(defaultConfig.oscillator.detune)
  const [octave, setOctave] = useState(defaultConfig.oscillator.octave)

  // Envelope state (ADSR)
  const [attack, setAttack] = useState(defaultConfig.envelope.attack)
  const [decay, setDecay] = useState(defaultConfig.envelope.decay)
  const [sustain, setSustain] = useState(defaultConfig.envelope.sustain)
  const [release, setRelease] = useState(defaultConfig.envelope.release)

  // Filter state
  const [filterType, setFilterType] = useState<FilterType>(defaultConfig.filter.type)
  const [filterCutoff, setFilterCutoff] = useState(defaultConfig.filter.cutoff)
  const [filterResonance, setFilterResonance] = useState(defaultConfig.filter.resonance)
  const [filterEnvAmount, setFilterEnvAmount] = useState(defaultConfig.filter.envAmount)

  // LFO state
  const [lfoEnabled, setLfoEnabled] = useState(defaultConfig.lfo.enabled)
  const [lfoWaveform, setLfoWaveform] = useState<Waveform>(defaultConfig.lfo.waveform)
  const [lfoRate, setLfoRate] = useState(defaultConfig.lfo.rate)
  const [lfoDepth, setLfoDepth] = useState(defaultConfig.lfo.depth)
  const [lfoTarget, setLfoTarget] = useState<LfoTarget>(defaultConfig.lfo.target)

  // Master state
  const [masterGain, setMasterGainState] = useState(defaultConfig.masterGain)
  const [portamento, setPortamento] = useState(defaultConfig.portamento)

  // Initialize engine
  useEffect(() => {
    engineRef.current = new SynthEngine(defaultConfig)

    return () => {
      engineRef.current?.panic()
    }
  }, [])

  // ─── Oscillator Updates ──────────────────────────────────────────────────
  const updateWaveform = useCallback((wf: Waveform) => {
    setWaveform(wf)
    engineRef.current?.setWaveform(wf)
  }, [])

  const updateDetune = useCallback((d: number) => {
    setDetune(d)
    engineRef.current?.setDetune(d)
  }, [])

  const updateOctave = useCallback((o: number) => {
    setOctave(o)
    engineRef.current?.setOctave(o)
  }, [])

  // ─── Envelope Updates ────────────────────────────────────────────────────
  const updateAttack = useCallback((a: number) => {
    setAttack(a)
    engineRef.current?.setEnvelope({ attack: a })
  }, [])

  const updateDecay = useCallback((d: number) => {
    setDecay(d)
    engineRef.current?.setEnvelope({ decay: d })
  }, [])

  const updateSustain = useCallback((s: number) => {
    setSustain(s)
    engineRef.current?.setEnvelope({ sustain: s })
  }, [])

  const updateRelease = useCallback((r: number) => {
    setRelease(r)
    engineRef.current?.setEnvelope({ release: r })
  }, [])

  // ─── Filter Updates ──────────────────────────────────────────────────────
  const updateFilterType = useCallback((t: FilterType) => {
    setFilterType(t)
    engineRef.current?.setFilterType(t)
  }, [])

  const updateFilterCutoff = useCallback((c: number) => {
    setFilterCutoff(c)
    engineRef.current?.setFilterCutoff(c)
  }, [])

  const updateFilterResonance = useCallback((r: number) => {
    setFilterResonance(r)
    engineRef.current?.setFilterResonance(r)
  }, [])

  const updateFilterEnvAmount = useCallback((a: number) => {
    setFilterEnvAmount(a)
    engineRef.current?.setFilterEnvAmount(a)
  }, [])

  // ─── LFO Updates ─────────────────────────────────────────────────────────
  const updateLfoEnabled = useCallback((e: boolean) => {
    setLfoEnabled(e)
    engineRef.current?.setLfoEnabled(e)
  }, [])

  const updateLfoWaveform = useCallback((wf: Waveform) => {
    setLfoWaveform(wf)
    engineRef.current?.setLfoWaveform(wf)
  }, [])

  const updateLfoRate = useCallback((r: number) => {
    setLfoRate(r)
    engineRef.current?.setLfoRate(r)
  }, [])

  const updateLfoDepth = useCallback((d: number) => {
    setLfoDepth(d)
    engineRef.current?.setLfoDepth(d)
  }, [])

  const updateLfoTarget = useCallback((t: LfoTarget) => {
    setLfoTarget(t)
    engineRef.current?.setLfoTarget(t)
  }, [])

  // ─── Master Updates ──────────────────────────────────────────────────────
  const updateMasterGain = useCallback((g: number) => {
    setMasterGainState(g)
    engineRef.current?.setMasterGain(g)
  }, [])

  const updatePortamento = useCallback((p: number) => {
    setPortamento(p)
    engineRef.current?.setPortamento(p)
  }, [])

  // ─── Note Handling ───────────────────────────────────────────────────────
  const ensureContext = useCallback(() => {
    const ctx = getAudioContext()
    if (ctx.state === 'suspended') {
      ctx.resume()
    }
  }, [])

  const noteOn = useCallback(
    (noteId: string, frequency: number) => {
      ensureContext()
      engineRef.current?.noteOn(noteId, frequency)
    },
    [ensureContext]
  )

  const noteOff = useCallback((noteId: string) => {
    engineRef.current?.noteOff(noteId)
  }, [])

  return {
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
  }
}
