# Changelog

All notable changes to Uberwelle Web Synth will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned
- **Drum Machine** - Step sequencer with drum samples
- **Sampler** - Load and manipulate audio samples
- **Ambient Generator** - Generative textures and drones
- Oscilloscope visualization using AnalyserNode
- Preset system for saving/loading sound configurations
- Effects chain (Reverb, Delay)

---

## [1.2.1] - 2025-12-27

> Composer UI overhaul with overlay modal and style-based color system.

### Changed

#### Block Configuration Overlay
- **Overlay modal** - config panel now appears as a centered modal with dark backdrop
- **Click-to-dismiss** - click outside or × button to close
- **Smooth animations** - fade-in backdrop with slide-up panel

#### Style Selector Redesign
- **Button grid** - replaced dropdown with 4×2 button grid for style selection
- **Color-coded styles** - each style has a distinct color:
  - Ambient (blue), Techno (red-pink), House (orange), Jazz (purple)
  - Experimental (cyan), Drone (indigo), Minimal (lime), Breaks (pink)
- **Visual feedback** - buttons highlight in their style color on hover and when active

#### Colored Blocks
- **Color bar indicator** - configured blocks display a colored bar at the bottom
- **Style abbreviation** - 3-letter style code shown in the style's color
- **Border accents** - block borders highlight in style color on hover/active

#### BUILD SET Button
- **Gradient background** - red-pink to orange gradient (techno → house)
- **Hover effects** - brightness boost with subtle lift animation

### Added
- **Style color palette** - 8 CSS variables for style-specific colors in design system

---

## [1.2.0] - 2025-12-27

> Composer set builder and instrument card images.

### Added

#### Composer (Set Builder)
- **16-block step sequencer** - visual timeline for building sets
- **Block configuration panel** - inline UI appears when clicking a block
- **BPM control** - adjustable tempo per block (60-200 BPM)
- **Style selector** - ambient, techno, house, jazz, experimental, drone, minimal, breaks
- **Instrument selection** - choose which instruments play in each block (synth, drums, sampler, ambient)
- **Progress indicator** - shows configured blocks count
- **BUILD SET button** - appears when blocks are configured

#### New Components
- `Composer.tsx` - Main set builder container with 16-block grid
- `ComposerBlock.tsx` - Individual block showing number, BPM badge, and style indicator
- `BlockConfig.tsx` - Inline configuration panel with knob, dropdown, and checkboxes

#### Instrument Card Images
- **Image support** - instrument cards can now display images in a dedicated 16:9 area
- **Hover effect** - subtle zoom on image when hovering ready instruments
- **Fallback** - cards without images display ASCII visual as before

### Changed
- **SYNTH renamed to UEBERWELLE** - with dedicated instrument artwork
- **Playlist replaced by Composer** - set builder replaces the Deep Focus Playlist card
- **Composer full-width layout** - spans entire content area (1200px max)

---

## [1.1.1] - 2025-12-27

> Inline instrument experience with compact synth view and high-tech UI polish.

### Added

#### Compact Synth View
- **Inline instrument mode** - synth now appears embedded on homepage instead of full-screen takeover
- **`CompactSynth` component** - simplified controls (waveform, cutoff, attack, release, volume) with full keyboard
- **Expand button** `[EXPAND]` to open full-screen synth view
- **Close button** `[X]` to collapse back to instrument grid

#### Branding & Assets
- **Custom favicon** replacing Vite placeholder
- **Logo in header** using `Main Icon small.png`
- Header content now aligns with main grid (max-width 1200px)

#### Footer Redesign
- **Pulsing status light** with `SYS.ONLINE` indicator
- **Singapore coordinates** (1.3521°N 103.8198°E)
- **Live clock** displaying current time with SGT timezone
- Footer aligns with content grid

### Changed
- Tagline updated to "Programmed instruments for the modern era"

---

## [1.1.0] - 2025-12-27

> Multi-instrument platform with homepage grid and navigation system.

### Added

#### Multi-Instrument Platform
- **Homepage** with "Command Center" brutalist grid layout
- **Instrument selection** - grid of instrument cards with ready/coming soon states
- **State-based navigation** between homepage and instruments (no router dependency)
- **Deep Focus Playlist card** - prominent CTA for upcoming AI-generated music feature

#### New Components
- `HomePage.tsx` - Landing page with instrument grid and playlist feature
- `InstrumentCard.tsx` - Reusable card component with visual status indicators
- Back navigation button on instrument pages

#### Instruments Roadmap
- **[01] SYNTH** - Polyphonic synthesizer (ready)
- **[02] DRUMS** - Step sequencer (coming soon)
- **[03] SAMPLER** - Audio sampler (coming soon)
- **[04] AMBIENT** - Generative textures (coming soon)

#### UI/UX
- ASCII-style visual hints for each instrument type
- Responsive grid layout adapts to screen size
- Hover glow effects on interactive cards
- Consistent brutalist design language across all pages

---

## [1.0.0] - 2025-11-29

> Initial release with polyphonic Web Audio synthesizer and virtual keyboard.

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
- MIDI-to-frequency calculation using standard formula: `440 * 2^((n-69)/12)`
