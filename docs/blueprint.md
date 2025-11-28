Good. Let’s turn this into something you can actually build in an evening.

Below is a **blueprint you can literally follow step-by-step** to get a clean V1 out the door.

---

## 0. Scope V1 ruthlessly

**V1 features:**

* Pure frontend (Vite + React + TS)
* One `AudioContext`
* Polyphonic synth (e.g. max 8 voices)
* Waveform selector: `sine | square | sawtooth | triangle`
* Simple ADSR envelope (A/R to start, add D/S later if you want)
* Clickable on-screen keyboard (1–2 octaves)
* Optional: map computer keys (`ASDF...`) to notes

**Non-goals (for V1):**

* No AudioWorklet
* No effects (reverb, delay, etc.)
* No presets, saving, backend, auth
* No mobile optimization beyond “works ok”

---

## 1. Tech stack & file structure

Use **Vite + React + TypeScript**:

```bash
npm create vite@latest web-synth -- --template react-ts
cd web-synth
npm install
npm run dev
```

Then shape your `src/` roughly like this:

```text
src/
  audio/
    audioContext.ts      // singleton AudioContext helper
    types.ts             // voice type, config types
    voice.ts             // create/release single note
    synthEngine.ts       // manages active voices, API for UI
  components/
    Synth.tsx            // main container
    Keyboard.tsx         // visual keyboard, mouse & key events
    ControlPanel.tsx     // waveform selector, ADSR sliders, volume
  hooks/
    useSynth.ts          // React hook wrapping SynthEngine
  main.tsx               // entry
  App.tsx                // just renders <Synth />
```

Nothing else. Keep it small.

---

## 2. Audio engine design (core of the whole thing)

### 2.1 AudioContext singleton

**Goal:** one `AudioContext` for the entire app, lazy-initialised on first interaction (to satisfy autoplay policies).

`src/audio/audioContext.ts`:

* `let audioCtx: AudioContext | null = null;`
* `export function getAudioContext(): AudioContext`:

  * if `!audioCtx`, create `new AudioContext()`
  * return it

Optional: helper to resume if state is `suspended`.

---

### 2.2 Voice model

You want a small, explicit “voice” abstraction:

* A voice has:

  * `osc: OscillatorNode`
  * `gain: GainNode`
  * `frequency: number`
  * maybe `noteId: string` (e.g. `"C4"`)

`src/audio/types.ts`:

```ts
export type Waveform = OscillatorType

export interface VoiceHandle {
  osc: OscillatorNode
  gain: GainNode
  noteId: string
  frequency: number
}

export interface EnvelopeConfig {
  attack: number
  release: number
}

export interface SynthConfig {
  waveform: Waveform
  envelope: EnvelopeConfig
  masterGain: number
  maxVoices: number
}
```

---

### 2.3 Creating & releasing a single voice

`src/audio/voice.ts`:

* `createVoice(noteId: string, frequency: number, config: SynthConfig): VoiceHandle`

  * get `ctx = getAudioContext()`
  * `const osc = ctx.createOscillator()`
  * `const gain = ctx.createGain()`
  * wire up:

    * `osc.type = config.waveform`
    * `osc.frequency.value = frequency`
    * envelope:

      * `const now = ctx.currentTime`
      * `gain.gain.setValueAtTime(0, now)`
      * `gain.gain.linearRampToValueAtTime(config.masterGain, now + config.envelope.attack)`
  * connections:

    * `osc.connect(gain)`
    * `gain.connect(ctx.destination)`
  * start oscillator:

    * `osc.start()`
  * return handle

* `releaseVoice(voice: VoiceHandle, config: SynthConfig)`

  * `const ctx = getAudioContext()`
  * `const now = ctx.currentTime`
  * ramp down:

    * `gain.gain.cancelScheduledValues(now)`
    * `gain.gain.setValueAtTime(gain.gain.value, now)`
    * `gain.gain.linearRampToValueAtTime(0, now + config.envelope.release)`
  * `osc.stop(now + config.envelope.release + 0.05)`

No magic. Very explicit.

---

### 2.4 SynthEngine: manage voices & external API

`src/audio/synthEngine.ts`:

Responsibility:

* Track active voices in a `Map<string, VoiceHandle>` keyed by `noteId`
* Enforce max polyphony
* Expose simple API to UI:

```ts
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

  setWaveform(waveform: Waveform) {
    this.config.waveform = waveform
  }

  setEnvelope(partial: Partial<EnvelopeConfig>) {
    this.config.envelope = { ...this.config.envelope, ...partial }
  }

  setMasterGain(g: number) {
    this.config.masterGain = g
  }

  noteOn(noteId: string, frequency: number) {
    if (this.voices.has(noteId)) return

    // polyphony guard
    if (this.voices.size >= this.config.maxVoices) {
      // naive voice stealing: first key in Map
      const [firstKey] = this.voices.keys()
      if (firstKey) this.noteOff(firstKey)
    }

    const voice = createVoice(noteId, frequency, this.config)
    this.voices.set(noteId, voice)
  }

  noteOff(noteId: string) {
    const voice = this.voices.get(noteId)
    if (!voice) return
    releaseVoice(voice, this.config)
    this.voices.delete(noteId)
  }

  panic() {
    for (const [noteId, v] of this.voices) {
      releaseVoice(v, this.config)
      this.voices.delete(noteId)
    }
  }
}
```

That’s your entire “engine”.

---

## 3. React layer: hook + components

### 3.1 `useSynth` hook

`src/hooks/useSynth.ts`:

* Create and keep a single `SynthEngine` instance in a `useRef`
* Provide convenient callbacks for UI

```ts
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
    return () => engineRef.current?.panic()
  }, []) // init once

  // sync helpers
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

  // lazy-start AudioContext on first note
  const ensureContext = useCallback(() => {
    const ctx = getAudioContext()
    if (ctx.state === 'suspended') ctx.resume()
  }, [])

  const noteOn = useCallback((noteId: string, frequency: number) => {
    ensureContext()
    engineRef.current?.noteOn(noteId, frequency)
  }, [ensureContext])

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
```

---

### 3.2 Note mapping helper

`src/audio/noteFrequencies.ts`:

* A simple array of notes (e.g. C3–C5)
* Each: `{ id: 'C4', label: 'C', frequency: number }`
* Use standard formula `440 * 2^((n-69)/12)` if you care, or just hardcode a small table.

---

### 3.3 `Keyboard` component

`src/components/Keyboard.tsx`:

Props:

* `notes: NoteDef[]` (from your table)
* `onNoteDown(noteId: string, freq: number)`
* `onNoteUp(noteId: string)`

Implementation:

* Render a row of `div` or `button` keys.
* Handle:

  * `onMouseDown` → `onNoteDown`
  * `onMouseUp` and `onMouseLeave` → `onNoteUp`
* Optionally attach `keydown`/`keyup` listeners on window for computer keyboard mapping.

---

### 3.4 `ControlPanel` component

`src/components/ControlPanel.tsx`:

Props:

* `waveform`, `attack`, `release`, `masterGain`
* `onWaveformChange`, `onAttackChange`, etc.

Implementation:

* Waveform: `<select>` with four options
* Attack / Release sliders:

  * `<input type="range" min="0" max="1" step="0.01" />`
  * or narrower ranges, e.g. `max="0.5"` for attack
* Master volume slider 0–1

---

### 3.5 Main `Synth` component

`src/components/Synth.tsx`:

* Calls `useSynth`
* Imports note table
* Passes down handlers

```tsx
import { useSynth } from '../hooks/useSynth'
import { Keyboard } from './Keyboard'
import { ControlPanel } from './ControlPanel'
import { NOTES } from '../audio/noteFrequencies'

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
      <h1>Web Synth V1</h1>
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
  )
}
```

`App.tsx` just renders `<Synth />`.

---

## 4. Implementation order (if you want a clear sequence)

**Step 1 – Project skeleton (30–45 min)**

* Vite + React TS
* File structure + stub components/hooks

**Step 2 – Audio context + hardcoded tone (30 min)**

* Implement `getAudioContext`
* In `Synth`, add a temporary “Play Test Tone” button that:

  * Creates an osc & gain
  * Plays 440Hz for 0.5s
* Verify you actually hear sound.

**Step 3 – Voices & SynthEngine (1–2 h)**

* Implement `types.ts`, `voice.ts`, `synthEngine.ts`
* Add `useSynth` with `noteOn/noteOff`
* Hardcode a single note in the UI and verify you can trigger it.

**Step 4 – Note mapping & Keyboard (1–2 h)**

* Add `NOTE` definitions (C-major scale or 1 octave)
* Implement `Keyboard` with clickable keys calling `noteOn/noteOff`
* Confirm polyphony works (click multiple keys).

**Step 5 – ControlPanel & live parameter changes (1 h)**

* Add waveform selector and ADSR sliders
* Wire them to `updateWaveform/Attack/Release/MasterGain`
* Play around and tweak defaults.

At that point, you have a **legit V1 toy synth**.

---

## 5. Obvious v2+ upgrades (once you’re bored)

* Add **Decay + Sustain** to make a proper ADSR
* Add a simple **filter** (Biquad low-pass) per voice
* Add **keyboard mapping** (`z, s, x, d, c, ...`) like DAWs
* Add a crude **oscilloscope** via AnalyserNode + canvas
* Add a header with 1–3 “pseudo-presets” (just pre-baked config objects)

