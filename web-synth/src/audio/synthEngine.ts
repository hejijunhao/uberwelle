import { createVoice, releaseVoice, updateVoiceOscillator } from './voice'
import { getAudioContext } from './audioContext'
import type {
  EnvelopeConfig,
  SynthConfig,
  VoiceHandle,
  Waveform,
  FilterType,
  LfoTarget,
} from './types'

export class SynthEngine {
  private config: SynthConfig
  private voices = new Map<string, VoiceHandle>()
  private lastPlayedFrequency: number | null = null

  // LFO nodes (persistent, modulates all voices)
  private lfoNode: OscillatorNode | null = null
  private lfoGain: GainNode | null = null
  private lfoStarted = false

  constructor(initialConfig: SynthConfig) {
    this.config = { ...initialConfig }
  }

  getConfig(): SynthConfig {
    return { ...this.config }
  }

  // ─── Oscillator Settings ─────────────────────────────────────────────────
  setWaveform(waveform: Waveform): void {
    this.config.oscillator.waveform = waveform
    // Update active voices
    for (const voice of this.voices.values()) {
      updateVoiceOscillator(voice, this.config)
    }
  }

  setDetune(detune: number): void {
    this.config.oscillator.detune = detune
    for (const voice of this.voices.values()) {
      voice.osc.detune.value = detune
    }
  }

  setOctave(octave: number): void {
    this.config.oscillator.octave = octave
    // Octave changes don't affect currently playing notes
  }

  // ─── Envelope Settings ───────────────────────────────────────────────────
  setEnvelope(partial: Partial<EnvelopeConfig>): void {
    this.config.envelope = { ...this.config.envelope, ...partial }
  }

  // ─── Filter Settings ─────────────────────────────────────────────────────
  setFilterType(type: FilterType): void {
    this.config.filter.type = type
    for (const voice of this.voices.values()) {
      voice.filter.type = type
    }
  }

  setFilterCutoff(cutoff: number): void {
    this.config.filter.cutoff = cutoff
    // Only update if no envelope modulation
    if (Math.abs(this.config.filter.envAmount) < 0.01) {
      for (const voice of this.voices.values()) {
        voice.filter.frequency.value = cutoff
      }
    }
  }

  setFilterResonance(resonance: number): void {
    this.config.filter.resonance = resonance
    for (const voice of this.voices.values()) {
      voice.filter.Q.value = resonance
    }
  }

  setFilterEnvAmount(amount: number): void {
    this.config.filter.envAmount = amount
  }

  // ─── LFO Settings ────────────────────────────────────────────────────────
  setLfoEnabled(enabled: boolean): void {
    this.config.lfo.enabled = enabled
    this.updateLfo()
  }

  setLfoWaveform(waveform: Waveform): void {
    this.config.lfo.waveform = waveform
    if (this.lfoNode) {
      this.lfoNode.type = waveform
    }
  }

  setLfoRate(rate: number): void {
    this.config.lfo.rate = rate
    if (this.lfoNode) {
      this.lfoNode.frequency.value = rate
    }
  }

  setLfoDepth(depth: number): void {
    this.config.lfo.depth = depth
    this.updateLfoDepth()
  }

  setLfoTarget(target: LfoTarget): void {
    this.config.lfo.target = target
    this.reconnectLfo()
  }

  private updateLfo(): void {
    const ctx = getAudioContext()

    if (this.config.lfo.enabled) {
      if (!this.lfoNode) {
        this.lfoNode = ctx.createOscillator()
        this.lfoGain = ctx.createGain()
        this.lfoNode.type = this.config.lfo.waveform
        this.lfoNode.frequency.value = this.config.lfo.rate
        this.lfoNode.connect(this.lfoGain)

        if (!this.lfoStarted) {
          this.lfoNode.start()
          this.lfoStarted = true
        }
      }
      this.updateLfoDepth()
      this.reconnectLfo()
    } else {
      this.disconnectLfo()
    }
  }

  private updateLfoDepth(): void {
    if (!this.lfoGain) return

    const { depth, target } = this.config.lfo
    switch (target) {
      case 'pitch':
        // Depth in cents (100 = 1 semitone)
        this.lfoGain.gain.value = depth * 100
        break
      case 'filter':
        // Depth in Hz range
        this.lfoGain.gain.value = depth * 2000
        break
      case 'amplitude':
        // Depth as gain multiplier
        this.lfoGain.gain.value = depth * 0.5
        break
    }
  }

  private reconnectLfo(): void {
    if (!this.lfoGain) return

    // Disconnect from all current targets
    this.lfoGain.disconnect()

    if (!this.config.lfo.enabled) return

    const { target } = this.config.lfo

    // Connect to all active voices
    for (const voice of this.voices.values()) {
      switch (target) {
        case 'pitch':
          this.lfoGain.connect(voice.osc.detune)
          break
        case 'filter':
          this.lfoGain.connect(voice.filter.frequency)
          break
        case 'amplitude':
          this.lfoGain.connect(voice.gain.gain)
          break
      }
    }
  }

  private disconnectLfo(): void {
    if (this.lfoGain) {
      this.lfoGain.disconnect()
    }
  }

  private connectLfoToVoice(voice: VoiceHandle): void {
    if (!this.config.lfo.enabled || !this.lfoGain) return

    switch (this.config.lfo.target) {
      case 'pitch':
        this.lfoGain.connect(voice.osc.detune)
        break
      case 'filter':
        this.lfoGain.connect(voice.filter.frequency)
        break
      case 'amplitude':
        this.lfoGain.connect(voice.gain.gain)
        break
    }
  }

  // ─── Master Settings ─────────────────────────────────────────────────────
  setMasterGain(gain: number): void {
    this.config.masterGain = gain
  }

  setPortamento(time: number): void {
    this.config.portamento = time
  }

  // ─── Note Handling ───────────────────────────────────────────────────────
  noteOn(noteId: string, frequency: number): void {
    // Prevent duplicate voices for same note
    if (this.voices.has(noteId)) return

    // Voice stealing: release oldest voice if at max polyphony
    if (this.voices.size >= this.config.maxVoices) {
      const [firstKey] = this.voices.keys()
      if (firstKey) this.noteOff(firstKey)
    }

    // Initialize LFO if needed
    if (this.config.lfo.enabled && !this.lfoNode) {
      this.updateLfo()
    }

    const voice = createVoice(noteId, frequency, this.config, this.lastPlayedFrequency ?? undefined)
    this.voices.set(noteId, voice)

    // Connect LFO to this voice
    this.connectLfoToVoice(voice)

    this.lastPlayedFrequency = frequency
  }

  noteOff(noteId: string): void {
    const voice = this.voices.get(noteId)
    if (!voice) return

    releaseVoice(voice, this.config)
    this.voices.delete(noteId)
  }

  panic(): void {
    for (const [noteId] of this.voices) {
      const voice = this.voices.get(noteId)
      if (voice) {
        releaseVoice(voice, this.config)
      }
    }
    this.voices.clear()
  }
}
