import { useEffect, useRef, useState, useCallback } from 'react'
import { SynthEngine } from '../audio/synthEngine'
import type { Waveform } from '../audio/types'
import { getAudioContext } from '../audio/audioContext'

export function useSynth() {
  const engineRef = useRef<SynthEngine | null>(null)
  const [waveform, setWaveform] = useState<Waveform>('sawtooth')
  const [attack, setAttack] = useState(0.01)
  const [release, setRelease] = useState(0.2)
  const [masterGain, setMasterGainState] = useState(0.4)

  useEffect(() => {
    engineRef.current = new SynthEngine({
      waveform,
      envelope: { attack, release },
      masterGain,
    })

    return () => {
      engineRef.current?.panic()
    }
  }, []) // Initialize once

  const updateWaveform = useCallback((wf: Waveform) => {
    setWaveform(wf)
    engineRef.current?.setWaveform(wf)
  }, [])

  const updateAttack = useCallback((a: number) => {
    setAttack(a)
    engineRef.current?.setEnvelope({ attack: a })
  }, [])

  const updateRelease = useCallback((r: number) => {
    setRelease(r)
    engineRef.current?.setEnvelope({ release: r })
  }, [])

  const updateMasterGain = useCallback((g: number) => {
    setMasterGainState(g)
    engineRef.current?.setMasterGain(g)
  }, [])

  // Lazy-start AudioContext on first user interaction
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
  }
}
