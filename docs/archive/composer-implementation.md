# Composer Implementation Plan

> Generative music system for deep work background sets

## Overview

The Composer allows users to build a "live set" of 16 blocks, each representing a 5-minute generative track. The system uses deterministic, pattern-based synthesis (pure Web Audio, no samples) to create continuous background music for focus sessions.

---

## Scope (v1)

- **Playback**: Sequential block-by-block
- **Styles**: Deep House, Progressive House, Techno
- **Block duration**: Fixed 5 minutes
- **Generation**: Deterministic patterns with subtle variation
- **Persistence**: None (ephemeral, resets on refresh)
- **Audio**: Pure Web Audio synthesis (no samples)

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     SET PLAYER                          │
│  (orchestrates blocks, handles transitions)             │
└─────────────────────────┬───────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────┐
│                    BLOCK PLAYER                         │
│  (plays one block for 5 min, manages arc/layers)        │
└─────────────────────────┬───────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────┐
│                   PATTERN ENGINE                        │
│  - Clock/Sequencer (tempo-synced scheduling)            │
│  - Style Patterns (kick, hat, bass, pad, arp)           │
│  - Variation Rules (subtle changes over time)           │
└─────────────────────────┬───────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────┐
│                 SOUND GENERATORS                        │
│  - DrumSynth (kick, snare, hats, clap)                  │
│  - BassSynth (monophonic, filtered)                     │
│  - PadSynth (polyphonic, lush)                          │
│  - ArpSynth (for progressive patterns)                  │
└─────────────────────────────────────────────────────────┘
```

---

## Style Definitions

| Style | BPM Range | Character |
|-------|-----------|-----------|
| **Deep House** | 118-124 | 4/4 kick, shuffled hats, warm pads, mellow bass, subtle chords |
| **Progressive House** | 122-128 | Building arpeggios, filter sweeps, evolving layers, longer phrases |
| **Techno** | 128-138 | Driving kick, sharp hats, minimal melody, percussive, hypnotic |

---

## Implementation Phases

### Phase 1: Audio Foundation

#### 1.1 Clock/Scheduler
**File:** `src/audio/composer/clock.ts`

Tempo-synced scheduler using Web Audio's precise timing:
- Schedule callbacks on beats/16th notes using `AudioContext.currentTime`
- Lookahead scheduling (schedule ~100ms ahead, check every ~25ms)
- Start/stop/pause controls
- Emit beat/bar events for UI sync

```ts
interface Clock {
  start(): void
  stop(): void
  pause(): void
  resume(): void
  setBpm(bpm: number): void
  onSixteenth(callback: (step: number, time: number) => void): void
  onBeat(callback: (beat: number, time: number) => void): void
  onBar(callback: (bar: number, time: number) => void): void
}
```

#### 1.2 Drum Synthesizer
**File:** `src/audio/composer/drumSynth.ts`

All drums synthesized with Web Audio nodes:

| Sound | Synthesis Method |
|-------|------------------|
| **Kick** | Sine oscillator with pitch envelope (150Hz → 50Hz), gain envelope |
| **Snare** | Noise (bandpass ~1kHz) + sine tone (~180Hz), short decay |
| **Hi-hat (closed)** | Noise (highpass ~7kHz), very short decay (~50ms) |
| **Hi-hat (open)** | Noise (highpass ~7kHz), longer decay (~200ms) |
| **Clap** | Layered noise bursts with slight delays, bandpass filter |

```ts
interface DrumSynth {
  kick(time: number, velocity?: number): void
  snare(time: number, velocity?: number): void
  hihatClosed(time: number, velocity?: number): void
  hihatOpen(time: number, velocity?: number): void
  clap(time: number, velocity?: number): void
}
```

---

### Phase 2: Pattern Engine

#### 2.1 Style Pattern Definitions
**Files:** `src/audio/composer/styles/deepHouse.ts`, `progressiveHouse.ts`, `techno.ts`

Patterns as arrays (16 steps = 1 bar of 16th notes):

```ts
// Example: Deep House
const deepHouse: StyleDefinition = {
  name: 'deepHouse',
  bpmRange: [118, 124],

  drums: {
    kick:   [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0],  // 4-on-the-floor
    snare:  [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],  // 2 and 4
    hatClosed: [0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0],  // offbeats
    hatOpen:   [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,1],  // occasional
  },

  bass: {
    pattern: [1,0,0,0, 0,0,1,0, 0,0,0,0, 0,0,1,0],
    notes: ['C2', 'C2', 'G2'],  // root-fifth movement
  },

  chords: {
    progression: ['Cm7', 'Fm7', 'Gm7', 'Fm7'],
    barsPerChord: 2,
  },

  arp: null,  // Deep house typically no arp
}
```

#### 2.2 Pattern Player
**File:** `src/audio/composer/patternPlayer.ts`

- Receives style definition + instruments
- On each 16th note from clock, triggers appropriate sounds
- Handles chord/bass note selection based on current bar
- Applies subtle variations:
  - Velocity variation (±10%)
  - Occasional ghost notes
  - Timing humanization (±5ms)

---

### Phase 3: Instrument Synths

#### 3.1 Bass Synth
**File:** `src/audio/composer/bassSynth.ts`

Monophonic bass synthesizer:
- Sawtooth + square oscillators (detuned)
- Lowpass filter with envelope
- Glide/portamento between notes
- Configurable filter cutoff per style

#### 3.2 Pad Synth
**File:** `src/audio/composer/padSynth.ts`

Polyphonic pad synthesizer:
- 3-4 detuned oscillators per voice
- Slow attack (~500ms), long release (~2s)
- Lowpass filter with slow LFO modulation
- Stereo spread

#### 3.3 Arp Synth
**File:** `src/audio/composer/arpSynth.ts`

For progressive house patterns:
- Monophonic or paraphonic
- Pattern types: up, down, up-down, random
- Synced to clock divisions (8th, 16th notes)
- Filter envelope per note

---

### Phase 4: Block & Set Player

#### 4.1 Block Player
**File:** `src/audio/composer/blockPlayer.ts`

Orchestrates one 5-minute block:

```ts
interface BlockPlayer {
  load(block: BlockData): void
  play(): void
  stop(): void
  getProgress(): number  // 0-1
  onProgress(callback: (progress: number) => void): void
}
```

**Block Arc Structure** (5 minutes):
| Section | Time | Behavior |
|---------|------|----------|
| Intro | 0:00-0:30 | Kick + hats only, other layers fade in |
| Build | 0:30-1:00 | Bass enters, pad fades in |
| Main | 1:00-4:00 | Full pattern, subtle variations |
| Outro | 4:00-5:00 | Layers gradually fade out |

#### 4.2 Set Player
**File:** `src/audio/composer/setPlayer.ts`

Orchestrates the full set:

```ts
interface SetPlayer {
  loadSet(blocks: BlockData[]): void
  play(): void
  pause(): void
  stop(): void
  skip(): void  // Jump to next block

  // State
  isPlaying: boolean
  currentBlockIndex: number
  blockProgress: number  // 0-1 within current block

  // Events
  onStateChange(callback: (state: SetPlayerState) => void): void
}
```

---

### Phase 5: UI Updates

#### 5.1 Playback Controls Component
**File:** `src/components/SetPlayerControls.tsx`

```
┌──────────────────────────────────────────────────────────┐
│  [▶ PLAY]  [⏸ PAUSE]  [⏹ STOP]  [⏭ SKIP]                │
│                                                          │
│  BLOCK 3/16  ████████████░░░░░░░░░░░░░░  2:34 / 5:00    │
│  DEEP HOUSE @ 122 BPM                                    │
└──────────────────────────────────────────────────────────┘
```

- Play/Pause toggle, Stop, Skip buttons
- Current block indicator with style/BPM
- Progress bar with elapsed/total time

#### 5.2 Composer Updates
- "BUILD SET" validates blocks (at least 1 configured) and initializes SetPlayer
- Playback controls appear below composer after building
- Currently playing block highlighted in grid
- Playing state indicated on blocks

---

## Build Order

| Step | Deliverable | Validates |
|------|-------------|-----------|
| 1 | Clock + Kick only | Timing precision works |
| 2 | Full drum kit | All synthesis sounds good |
| 3 | Deep House drum patterns | Pattern system works |
| 4 | Bass synth + patterns | Tonal elements work |
| 5 | Pad synth + chords | Polyphony works |
| 6 | Block player (5 min arc) | Full block plays correctly |
| 7 | Set player + UI controls | End-to-end flow |
| 8 | Progressive House style | Second style works |
| 9 | Techno style | Third style works |

---

## File Structure

```
src/audio/composer/
  clock.ts              # Tempo-synced scheduler
  drumSynth.ts          # Synthesized drums
  bassSynth.ts          # Mono bass synth
  padSynth.ts           # Poly pad synth
  arpSynth.ts           # Arpeggiator synth
  patternPlayer.ts      # Pattern sequencing
  blockPlayer.ts        # Single block orchestration
  setPlayer.ts          # Full set orchestration
  types.ts              # Shared interfaces
  styles/
    index.ts            # Style registry
    deepHouse.ts
    progressiveHouse.ts
    techno.ts

src/components/
  SetPlayerControls.tsx
  SetPlayerControls.css
```

---

## Future Enhancements (Post-v1)

- Block transitions (crossfade between blocks)
- More styles (Ambient, Minimal, Breaks, etc.)
- Per-block duration (3/4/5 min toggle)
- Visualization (waveform, spectrum analyzer)
- Preset sets (curated block configurations)
- Export to audio file
- LocalStorage persistence
