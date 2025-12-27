/**
 * DrumSynth - Synthesized drum sounds using Web Audio
 *
 * All drums are created from scratch using oscillators and noise,
 * no samples required. Each hit creates fresh nodes that are
 * scheduled precisely and clean themselves up after playing.
 */

import { getAudioContext } from '../audioContext'

export class DrumSynth {
  private masterGain: GainNode | null = null
  private ctx: AudioContext | null = null

  /**
   * Initialize the drum synth (call before first use)
   */
  private ensureContext(): AudioContext {
    if (!this.ctx) {
      this.ctx = getAudioContext()
    }
    if (!this.masterGain) {
      this.masterGain = this.ctx.createGain()
      this.masterGain.gain.value = 0.8
      this.masterGain.connect(this.ctx.destination)
    }
    return this.ctx
  }

  /**
   * Set master volume for all drums
   */
  setVolume(volume: number): void {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, volume))
    }
  }

  /**
   * Kick drum - sine wave with pitch envelope
   *
   * The "thump" comes from a sine wave that starts at a higher
   * frequency (~150Hz) and rapidly drops to the fundamental (~50Hz).
   * A short gain envelope shapes the transient.
   */
  kick(time: number, velocity: number = 1): void {
    const ctx = this.ensureContext()
    const vel = Math.max(0, Math.min(1, velocity))

    // Oscillator for the body
    const osc = ctx.createOscillator()
    osc.type = 'sine'

    // Gain envelope
    const gainNode = ctx.createGain()

    // Pitch envelope - start high, drop quickly
    osc.frequency.setValueAtTime(150, time)
    osc.frequency.exponentialRampToValueAtTime(50, time + 0.04)

    // Gain envelope - quick attack, medium decay
    gainNode.gain.setValueAtTime(0, time)
    gainNode.gain.linearRampToValueAtTime(vel * 0.9, time + 0.005) // 5ms attack
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.3) // 300ms decay

    // Add a click transient for attack
    const clickOsc = ctx.createOscillator()
    const clickGain = ctx.createGain()
    clickOsc.type = 'sine'
    clickOsc.frequency.setValueAtTime(1000, time)
    clickOsc.frequency.exponentialRampToValueAtTime(100, time + 0.02)
    clickGain.gain.setValueAtTime(0, time)
    clickGain.gain.linearRampToValueAtTime(vel * 0.3, time + 0.001)
    clickGain.gain.exponentialRampToValueAtTime(0.001, time + 0.02)

    // Connect
    osc.connect(gainNode)
    clickOsc.connect(clickGain)
    gainNode.connect(this.masterGain!)
    clickGain.connect(this.masterGain!)

    // Schedule
    osc.start(time)
    osc.stop(time + 0.35)
    clickOsc.start(time)
    clickOsc.stop(time + 0.03)

    // Cleanup
    osc.onended = () => {
      osc.disconnect()
      gainNode.disconnect()
    }
    clickOsc.onended = () => {
      clickOsc.disconnect()
      clickGain.disconnect()
    }
  }

  /**
   * Snare drum - noise burst + tonal component
   *
   * Combines filtered noise (the "snare" rattle) with a short
   * tonal component (the drum body resonance).
   */
  snare(time: number, velocity: number = 1): void {
    const ctx = this.ensureContext()
    const vel = Math.max(0, Math.min(1, velocity))

    // Noise component (snare wires)
    const noiseBuffer = this.createNoiseBuffer(ctx, 0.2)
    const noise = ctx.createBufferSource()
    noise.buffer = noiseBuffer

    const noiseFilter = ctx.createBiquadFilter()
    noiseFilter.type = 'bandpass'
    noiseFilter.frequency.value = 3000
    noiseFilter.Q.value = 1

    const noiseGain = ctx.createGain()
    noiseGain.gain.setValueAtTime(0, time)
    noiseGain.gain.linearRampToValueAtTime(vel * 0.5, time + 0.002)
    noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.15)

    // Tonal component (drum body)
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = 180

    const oscGain = ctx.createGain()
    oscGain.gain.setValueAtTime(0, time)
    oscGain.gain.linearRampToValueAtTime(vel * 0.4, time + 0.001)
    oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.08)

    // Connect
    noise.connect(noiseFilter)
    noiseFilter.connect(noiseGain)
    noiseGain.connect(this.masterGain!)

    osc.connect(oscGain)
    oscGain.connect(this.masterGain!)

    // Schedule
    noise.start(time)
    noise.stop(time + 0.2)
    osc.start(time)
    osc.stop(time + 0.1)

    // Cleanup
    noise.onended = () => {
      noise.disconnect()
      noiseFilter.disconnect()
      noiseGain.disconnect()
    }
    osc.onended = () => {
      osc.disconnect()
      oscGain.disconnect()
    }
  }

  /**
   * Closed hi-hat - filtered noise, very short decay
   */
  hihatClosed(time: number, velocity: number = 1): void {
    const ctx = this.ensureContext()
    const vel = Math.max(0, Math.min(1, velocity))

    const noiseBuffer = this.createNoiseBuffer(ctx, 0.1)
    const noise = ctx.createBufferSource()
    noise.buffer = noiseBuffer

    // Highpass filter for that "tss" sound
    const hpFilter = ctx.createBiquadFilter()
    hpFilter.type = 'highpass'
    hpFilter.frequency.value = 7000

    // Bandpass to shape the tone
    const bpFilter = ctx.createBiquadFilter()
    bpFilter.type = 'bandpass'
    bpFilter.frequency.value = 10000
    bpFilter.Q.value = 1

    const gainNode = ctx.createGain()
    gainNode.gain.setValueAtTime(0, time)
    gainNode.gain.linearRampToValueAtTime(vel * 0.3, time + 0.001)
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.05)

    // Connect
    noise.connect(hpFilter)
    hpFilter.connect(bpFilter)
    bpFilter.connect(gainNode)
    gainNode.connect(this.masterGain!)

    // Schedule
    noise.start(time)
    noise.stop(time + 0.1)

    // Cleanup
    noise.onended = () => {
      noise.disconnect()
      hpFilter.disconnect()
      bpFilter.disconnect()
      gainNode.disconnect()
    }
  }

  /**
   * Open hi-hat - filtered noise, longer decay
   */
  hihatOpen(time: number, velocity: number = 1): void {
    const ctx = this.ensureContext()
    const vel = Math.max(0, Math.min(1, velocity))

    const noiseBuffer = this.createNoiseBuffer(ctx, 0.4)
    const noise = ctx.createBufferSource()
    noise.buffer = noiseBuffer

    const hpFilter = ctx.createBiquadFilter()
    hpFilter.type = 'highpass'
    hpFilter.frequency.value = 6000

    const bpFilter = ctx.createBiquadFilter()
    bpFilter.type = 'bandpass'
    bpFilter.frequency.value = 9000
    bpFilter.Q.value = 0.8

    const gainNode = ctx.createGain()
    gainNode.gain.setValueAtTime(0, time)
    gainNode.gain.linearRampToValueAtTime(vel * 0.35, time + 0.002)
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.25)

    // Connect
    noise.connect(hpFilter)
    hpFilter.connect(bpFilter)
    bpFilter.connect(gainNode)
    gainNode.connect(this.masterGain!)

    // Schedule
    noise.start(time)
    noise.stop(time + 0.4)

    // Cleanup
    noise.onended = () => {
      noise.disconnect()
      hpFilter.disconnect()
      bpFilter.disconnect()
      gainNode.disconnect()
    }
  }

  /**
   * Clap - layered noise bursts
   *
   * Multiple short noise bursts slightly offset create
   * the "clappy" sound of many hands.
   */
  clap(time: number, velocity: number = 1): void {
    const ctx = this.ensureContext()
    const vel = Math.max(0, Math.min(1, velocity))

    // Create multiple offset bursts
    const burstTimes = [0, 0.01, 0.02, 0.035]

    for (const offset of burstTimes) {
      const noiseBuffer = this.createNoiseBuffer(ctx, 0.15)
      const noise = ctx.createBufferSource()
      noise.buffer = noiseBuffer

      const bpFilter = ctx.createBiquadFilter()
      bpFilter.type = 'bandpass'
      bpFilter.frequency.value = 1500
      bpFilter.Q.value = 0.5

      const gainNode = ctx.createGain()
      const burstTime = time + offset
      const isLast = offset === burstTimes[burstTimes.length - 1]

      gainNode.gain.setValueAtTime(0, burstTime)
      gainNode.gain.linearRampToValueAtTime(vel * 0.3, burstTime + 0.001)

      if (isLast) {
        // Last burst has longer tail
        gainNode.gain.exponentialRampToValueAtTime(0.001, burstTime + 0.12)
      } else {
        // Earlier bursts are shorter
        gainNode.gain.exponentialRampToValueAtTime(0.001, burstTime + 0.02)
      }

      noise.connect(bpFilter)
      bpFilter.connect(gainNode)
      gainNode.connect(this.masterGain!)

      noise.start(burstTime)
      noise.stop(burstTime + 0.15)

      noise.onended = () => {
        noise.disconnect()
        bpFilter.disconnect()
        gainNode.disconnect()
      }
    }
  }

  /**
   * Create a buffer filled with white noise
   */
  private createNoiseBuffer(ctx: AudioContext, duration: number): AudioBuffer {
    const sampleRate = ctx.sampleRate
    const length = Math.ceil(sampleRate * duration)
    const buffer = ctx.createBuffer(1, length, sampleRate)
    const data = buffer.getChannelData(0)

    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1
    }

    return buffer
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    if (this.masterGain) {
      this.masterGain.disconnect()
      this.masterGain = null
    }
    this.ctx = null
  }
}

// Singleton instance
let drumSynthInstance: DrumSynth | null = null

export function getDrumSynth(): DrumSynth {
  if (!drumSynthInstance) {
    drumSynthInstance = new DrumSynth()
  }
  return drumSynthInstance
}

export function disposeDrumSynth(): void {
  if (drumSynthInstance) {
    drumSynthInstance.dispose()
    drumSynthInstance = null
  }
}
