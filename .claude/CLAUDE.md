# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Überwelle is a browser-based polyphonic synthesizer built with Vite + React + TypeScript and the Web Audio API. It features a 2-octave virtual keyboard, 4 waveform types, attack/release envelope controls, and computer keyboard support.

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
- **types.ts** - Core interfaces: `VoiceHandle`, `SynthConfig`, `EnvelopeConfig`, `Waveform`
- **voice.ts** - Low-level voice creation/release with envelope automation (`createVoice`, `releaseVoice`)
- **synthEngine.ts** - `SynthEngine` class managing active voices in `Map<noteId, VoiceHandle>`, polyphony (max 8), and voice stealing
- **noteFrequencies.ts** - Note definitions (C3-C5) with MIDI-to-frequency calculations and keyboard mappings

**Voice signal flow:** `OscillatorNode → GainNode → AudioContext.destination`

### React Layer (`src/components/`, `src/hooks/`)

- **useSynth.ts** - Hook wrapping `SynthEngine` via `useRef`, exposes state + callbacks, handles AudioContext resume
- **Synth.tsx** - Main container composing ControlPanel + Keyboard
- **Keyboard.tsx** - Piano UI with mouse/keyboard event handling
- **ControlPanel.tsx** - Waveform selector, attack/release sliders, volume

### Key Design Patterns

1. **Lazy AudioContext** - Created on first `noteOn()`, resumed if suspended
2. **useRef for engine** - SynthEngine persists across renders without triggering re-renders
3. **Envelope automation** - Uses `setValueAtTime()` + `linearRampToValueAtTime()` for smooth attack/release
4. **Graceful release** - `cancelScheduledValues()` before release prevents clicks during attack phase
