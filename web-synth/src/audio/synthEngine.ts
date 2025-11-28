import { createVoice, releaseVoice } from './voice'
import type { EnvelopeConfig, SynthConfig, VoiceHandle, Waveform } from './types'

export class SynthEngine {
  private config: SynthConfig
  private voices = new Map<string, VoiceHandle>()

  constructor(initialConfig?: Partial<SynthConfig>) {
    this.config = {
      waveform: 'sawtooth',
      envelope: { attack: 0.01, release: 0.2 },
      masterGain: 0.4,
      maxVoices: 8,
      ...initialConfig,
    }
  }

  setWaveform(waveform: Waveform): void {
    this.config.waveform = waveform
  }

  setEnvelope(partial: Partial<EnvelopeConfig>): void {
    this.config.envelope = { ...this.config.envelope, ...partial }
  }

  setMasterGain(gain: number): void {
    this.config.masterGain = gain
  }

  noteOn(noteId: string, frequency: number): void {
    // Prevent duplicate voices for same note
    if (this.voices.has(noteId)) return

    // Voice stealing: release oldest voice if at max polyphony
    if (this.voices.size >= this.config.maxVoices) {
      const [firstKey] = this.voices.keys()
      if (firstKey) this.noteOff(firstKey)
    }

    const voice = createVoice(noteId, frequency, this.config)
    this.voices.set(noteId, voice)
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
