# Überwelle Web Synth - Implementation Summary

## Overview

A browser-based polyphonic synthesizer built with **Vite + React + TypeScript** and the **Web Audio API**. The synth features a 2-octave virtual keyboard, 4 waveform types, attack/release envelope controls, and computer keyboard support.

---

## Project Structure

```
web-synth/
├── src/
│   ├── audio/                    # Audio engine (pure TypeScript, no React)
│   │   ├── audioContext.ts       # Singleton AudioContext with lazy init
│   │   ├── types.ts              # TypeScript interfaces (VoiceHandle, SynthConfig, etc.)
│   │   ├── voice.ts              # Create/release individual oscillator voices
│   │   ├── synthEngine.ts        # Voice management, polyphony, external API
│   │   └── noteFrequencies.ts    # Note definitions (C3-C5) + keyboard mappings
│   │
│   ├── components/               # React UI components
│   │   ├── Synth.tsx + .css      # Main container component
│   │   ├── Keyboard.tsx + .css   # Visual piano keyboard with mouse/key events
│   │   └── ControlPanel.tsx + .css # Waveform selector, ADSR sliders, volume
│   │
│   ├── hooks/
│   │   └── useSynth.ts           # React hook wrapping SynthEngine
│   │
│   ├── App.tsx                   # Root component (renders <Synth />)
│   ├── main.tsx                  # Entry point
│   └── index.css                 # Global styles
│
├── package.json
├── tsconfig.json
├── vite.config.ts
└── index.html
```

---

## Key Implementation Details

### 1. Audio Engine (`src/audio/`)

| File | Purpose |
|------|---------|
| `audioContext.ts` | Singleton pattern for `AudioContext`. Lazy-initialized on first user interaction to comply with browser autoplay policies. |
| `types.ts` | Type definitions: `Waveform`, `VoiceHandle`, `EnvelopeConfig`, `SynthConfig` |
| `voice.ts` | `createVoice()` - Creates oscillator + gain nodes, applies attack envelope. `releaseVoice()` - Applies release envelope, schedules oscillator stop. |
| `synthEngine.ts` | `SynthEngine` class manages active voices in a `Map<noteId, VoiceHandle>`. Handles polyphony (max 8 voices) with voice stealing. |
| `noteFrequencies.ts` | Generates 2 octaves (C3-C5) using MIDI-to-frequency formula. Includes computer keyboard mappings (Z-M for lower octave, Q-I for upper). |

### 2. React Layer (`src/components/` + `src/hooks/`)

| File | Purpose |
|------|---------|
| `useSynth.ts` | Custom hook that creates a `SynthEngine` instance (via `useRef`) and exposes state + callbacks for UI. Handles AudioContext resume. |
| `Keyboard.tsx` | Renders white/black keys with proper piano layout. Handles `mousedown/up/leave` and `keydown/keyup` events. Tracks active notes for visual feedback. |
| `ControlPanel.tsx` | Waveform dropdown (sine, square, sawtooth, triangle), Attack slider (0.001-1s), Release slider (0.01-2s), Volume slider (0-100%). |
| `Synth.tsx` | Main container. Composes `ControlPanel` + `Keyboard`, passes handlers from `useSynth`. |

---

## Features Implemented

- ✅ **Polyphonic synthesis** - Up to 8 simultaneous voices with voice stealing
- ✅ **4 waveform types** - Sine, Square, Sawtooth, Triangle
- ✅ **Attack/Release envelope** - Smooth note on/off transitions using `linearRampToValueAtTime()`
- ✅ **Master volume control** - 0-100% gain adjustment
- ✅ **Visual keyboard** - 2 octaves (C3-C5), white and black keys with active state highlighting
- ✅ **Computer keyboard support** - Z-M (lower octave), Q-I (upper octave), with sharps on S/D/G/H/J and 2/3/5/6/7
- ✅ **Dark theme UI** - Modern gradient design with emerald accent colors

---

## How to Run

```bash
cd web-synth
npm install    # Already done
npm run dev    # Start dev server at http://localhost:5173
```

---

## Technical Notes

### Web Audio API Patterns Used

1. **Lazy AudioContext** - Created on first `noteOn()` call, resumed if suspended
2. **Per-voice graph** - Each note gets: `OscillatorNode → GainNode → destination`
3. **Envelope automation** - `gain.gain.setValueAtTime()` + `linearRampToValueAtTime()` for attack/release
4. **Graceful release** - `cancelScheduledValues()` before release to prevent clicks when releasing during attack phase

### React Patterns Used

1. **useRef for engine** - `SynthEngine` instance persists across renders without causing re-renders
2. **useCallback for handlers** - Stable function references for keyboard event listeners
3. **Controlled components** - All sliders/selects controlled via React state, synced to engine

---

## Future Enhancements (V2+)

Per the original blueprint:
- Full ADSR envelope (add Decay + Sustain)
- Filter per voice (Biquad low-pass with cutoff/resonance)
- Oscilloscope visualization (AnalyserNode + Canvas)
- Preset system (pre-configured sound patches)
- Effects (reverb, delay via ConvolverNode/DelayNode)
