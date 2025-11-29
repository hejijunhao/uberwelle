import { getAudioContext } from './audioContext'
import type { SynthConfig, VoiceHandle } from './types'

export function createVoice(
  noteId: string,
  frequency: number,
  config: SynthConfig,
  lastFrequency?: number
): VoiceHandle {
  const ctx = getAudioContext()
  const now = ctx.currentTime

  // Calculate actual frequency with octave shift
  const octaveMultiplier = Math.pow(2, config.oscillator.octave)
  const targetFrequency = frequency * octaveMultiplier

  // Create nodes: OSC → FILTER → GAIN → destination
  const osc = ctx.createOscillator()
  const filter = ctx.createBiquadFilter()
  const gain = ctx.createGain()

  // Oscillator setup
  osc.type = config.oscillator.waveform
  osc.detune.value = config.oscillator.detune

  // Portamento (glide from last note)
  if (lastFrequency && config.portamento > 0) {
    const lastAdjustedFreq = lastFrequency * octaveMultiplier
    osc.frequency.setValueAtTime(lastAdjustedFreq, now)
    osc.frequency.exponentialRampToValueAtTime(targetFrequency, now + config.portamento)
  } else {
    osc.frequency.value = targetFrequency
  }

  // Filter setup
  filter.type = config.filter.type
  filter.Q.value = config.filter.resonance

  // Filter envelope modulation
  const envAmount = config.filter.envAmount
  const baseCutoff = config.filter.cutoff

  if (Math.abs(envAmount) > 0.01) {
    // Calculate cutoff range based on envelope amount
    const minCutoff = 20
    const maxCutoff = 20000
    const envCutoffRange = (maxCutoff - baseCutoff) * envAmount

    // Start at base (or below if negative envAmount)
    const startCutoff = envAmount > 0 ? baseCutoff : baseCutoff + envCutoffRange
    const peakCutoff = Math.max(minCutoff, Math.min(maxCutoff, baseCutoff + envCutoffRange))
    const sustainCutoff = baseCutoff + envCutoffRange * config.envelope.sustain

    filter.frequency.setValueAtTime(startCutoff, now)
    filter.frequency.linearRampToValueAtTime(peakCutoff, now + config.envelope.attack)
    filter.frequency.linearRampToValueAtTime(sustainCutoff, now + config.envelope.attack + config.envelope.decay)
  } else {
    filter.frequency.value = baseCutoff
  }

  // ADSR envelope on gain
  const { attack, decay, sustain } = config.envelope
  const peakGain = config.masterGain
  const sustainGain = peakGain * sustain

  gain.gain.setValueAtTime(0, now)
  gain.gain.linearRampToValueAtTime(peakGain, now + attack)
  gain.gain.linearRampToValueAtTime(sustainGain, now + attack + decay)

  // Connect the audio graph: OSC → FILTER → GAIN → destination
  osc.connect(filter)
  filter.connect(gain)
  gain.connect(ctx.destination)

  osc.start()

  return { osc, gain, filter, noteId, frequency, startTime: now }
}

export function releaseVoice(voice: VoiceHandle, config: SynthConfig): void {
  const ctx = getAudioContext()
  const now = ctx.currentTime

  // Release envelope
  voice.gain.gain.cancelScheduledValues(now)
  voice.gain.gain.setValueAtTime(voice.gain.gain.value, now)
  voice.gain.gain.linearRampToValueAtTime(0, now + config.envelope.release)

  // Release filter envelope if using env modulation
  if (Math.abs(config.filter.envAmount) > 0.01) {
    voice.filter.frequency.cancelScheduledValues(now)
    voice.filter.frequency.setValueAtTime(voice.filter.frequency.value, now)
    voice.filter.frequency.linearRampToValueAtTime(config.filter.cutoff, now + config.envelope.release)
  }

  // Stop oscillator after release completes (with small buffer)
  voice.osc.stop(now + config.envelope.release + 0.05)
}

export function updateVoiceFilter(voice: VoiceHandle, config: SynthConfig): void {
  voice.filter.type = config.filter.type
  voice.filter.Q.value = config.filter.resonance
  // Don't update frequency here as it may be under envelope control
}

export function updateVoiceOscillator(voice: VoiceHandle, config: SynthConfig): void {
  voice.osc.type = config.oscillator.waveform
  voice.osc.detune.value = config.oscillator.detune
}
