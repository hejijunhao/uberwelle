import { getAudioContext } from './audioContext'
import type { SynthConfig, VoiceHandle } from './types'

export function createVoice(
  noteId: string,
  frequency: number,
  config: SynthConfig
): VoiceHandle {
  const ctx = getAudioContext()

  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = config.waveform
  osc.frequency.value = frequency

  // Attack envelope
  const now = ctx.currentTime
  gain.gain.setValueAtTime(0, now)
  gain.gain.linearRampToValueAtTime(config.masterGain, now + config.envelope.attack)

  // Connect the audio graph
  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.start()

  return { osc, gain, noteId, frequency }
}

export function releaseVoice(voice: VoiceHandle, config: SynthConfig): void {
  const ctx = getAudioContext()
  const now = ctx.currentTime

  // Release envelope
  voice.gain.gain.cancelScheduledValues(now)
  voice.gain.gain.setValueAtTime(voice.gain.gain.value, now)
  voice.gain.gain.linearRampToValueAtTime(0, now + config.envelope.release)

  // Stop oscillator after release completes (with small buffer)
  voice.osc.stop(now + config.envelope.release + 0.05)
}
