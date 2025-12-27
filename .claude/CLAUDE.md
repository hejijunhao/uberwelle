# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Überwelle is a browser-based polyphonic synthesizer built with Vite + React + TypeScript and the Web Audio API. It features a 2-octave virtual keyboard (C3-C5), 4 waveform types, full ADSR envelope, filter with envelope modulation, LFO, portamento, and computer keyboard support.

## Commands

All commands run from the `web-synth/` directory:

```bash
npm run dev      # Start dev server at http://localhost:5173
npm run build    # TypeScript check + production build
npm run lint     # ESLint
npm run preview  # Preview production build
```

## Architecture

### Audio Engine (`src/audio/`) - Pure TypeScript, no React dependencies

The audio layer follows a clear separation of concerns:

- **audioContext.ts** - Singleton `AudioContext` with lazy initialization (required for browser autoplay policies)
- **types.ts** - Core interfaces and config types: `VoiceHandle`, `SynthConfig`, `EnvelopeConfig`, `FilterConfig`, `LfoConfig`, `OscillatorConfig`. Also exports `createDefaultConfig()` factory
- **voice.ts** - Low-level voice creation/release: `createVoice`, `releaseVoice`, `updateVoiceOscillator`, `updateVoiceFilter`
- **synthEngine.ts** - `SynthEngine` class managing active voices in `Map<noteId, VoiceHandle>`, polyphony (max 8), voice stealing, and global LFO
- **noteFrequencies.ts** - Note definitions (C3-C5) with MIDI-to-frequency calculations and keyboard mappings

**Voice signal flow:** `OscillatorNode → BiquadFilterNode → GainNode → AudioContext.destination`

**LFO signal flow:** `LfoOscillator → LfoGain → target (osc.detune | filter.frequency | voice.gain.gain)`

### React Layer (`src/components/`, `src/hooks/`)

- **useSynth.ts** - Hook wrapping `SynthEngine` via `useRef`. Exposes full synth state (oscillator, envelope, filter, LFO, master) with update callbacks. Uses `createDefaultConfig()` for initial values
- **Synth.tsx** - Main container composing ModulePanel components + Keyboard
- **Keyboard.tsx** - Piano UI with mouse/keyboard event handling
- **ModulePanel.tsx** - Reusable container for synth module sections
- **Knob.tsx**, **Switch.tsx** - Hardware-inspired UI controls
- **ControlPanel.tsx** - Legacy control panel (waveform, attack/release, volume only)

### Key Design Patterns

1. **Lazy AudioContext** - Created on first `noteOn()`, resumed if suspended
2. **useRef for engine** - SynthEngine persists across renders without triggering re-renders
3. **ADSR envelope automation** - Uses `setValueAtTime()` + `linearRampToValueAtTime()` for attack→peak→decay→sustain
4. **Graceful release** - `cancelScheduledValues()` before release prevents clicks during attack/decay phase
5. **Filter envelope** - Parallel envelope on `filter.frequency` controlled by `envAmount` (-1 to 1)
6. **Global LFO** - Single LFO oscillator modulates all active voices; reconnects when voices are added/removed
7. **Portamento** - Uses `exponentialRampToValueAtTime()` to glide from last played frequency
