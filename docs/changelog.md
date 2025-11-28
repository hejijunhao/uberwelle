# Changelog

All notable changes to Überwelle Web Synth will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2025-11-29

### Added

#### Audio Engine
- **Polyphonic synthesis** with up to 8 simultaneous voices and automatic voice stealing
- **4 waveform types**: Sine, Square, Sawtooth, Triangle
- **Attack/Release envelope** using Web Audio API's `linearRampToValueAtTime()` for smooth transitions
- **Master volume control** (0-100%)
- **Singleton AudioContext** with lazy initialization to comply with browser autoplay policies

#### User Interface
- **2-octave virtual keyboard** (C3 to C5) with realistic piano layout
- **Visual feedback** on active keys (green highlight)
- **Control panel** with waveform selector and sliders for Attack, Release, and Volume
- **Dark theme** with gradient background and emerald accent colors

#### Keyboard Support
- **Lower octave** (C3-B3): `Z S X D C V G B H N J M`
- **Upper octave** (C4-C5): `Q 2 W 3 E R 5 T 6 Y 7 U I`

#### Technical
- Vite + React + TypeScript project scaffold
- Modular architecture separating audio engine from React layer
- `useSynth` hook for clean state management
- MIDI-to-frequency calculation using standard formula: `440 × 2^((n-69)/12)`

---

## [Unreleased]

### Planned
- Full ADSR envelope (Decay + Sustain parameters)
- Low-pass filter per voice with cutoff and resonance controls
- Oscilloscope visualization using AnalyserNode
- Preset system for saving/loading sound configurations
- Effects chain (Reverb, Delay)
