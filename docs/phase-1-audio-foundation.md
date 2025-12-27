# Phase 1: Audio Foundation - Implementation Notes

> Completed: Clock/Scheduler and Drum Synthesizer

## Overview

Phase 1 establishes the timing infrastructure and synthesized drum sounds that all other Composer features will build upon.

---

## Files Created

```
src/audio/composer/
  types.ts        # Shared type definitions
  clock.ts        # Tempo-synced scheduler
  drumSynth.ts    # Synthesized drum sounds
  index.ts        # Module exports
```

---

## Clock (`clock.ts`)

### Purpose
Provides sample-accurate timing for sequencing musical events. Uses Web Audio's precise `AudioContext.currentTime` rather than JavaScript's unreliable `setTimeout`/`setInterval` for actual event timing.

### Architecture: Lookahead Scheduling

The clock uses the standard Web Audio lookahead pattern:

```
┌─────────────────────────────────────────────────────────────┐
│  setInterval (25ms)                                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Check: what events fall within next 100ms?         │   │
│  │  Schedule those events using AudioContext.currentTime│   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

- **Lookahead window**: 100ms ahead of current time
- **Check interval**: Every 25ms
- **Why**: JavaScript timers are imprecise (can drift 10-50ms). By scheduling audio events ahead of time using `AudioContext.currentTime`, we get sample-accurate timing.

### Key Constants

| Constant | Value | Purpose |
|----------|-------|---------|
| `LOOKAHEAD_MS` | 100 | How far ahead to schedule events |
| `SCHEDULE_INTERVAL_MS` | 25 | How often the scheduler checks for events |
| `STEPS_PER_BEAT` | 4 | 16th notes per quarter note |

### Step Duration Formula

```ts
stepDuration = 60 / bpm / 4
// At 120 BPM: 60/120/4 = 0.125 seconds (125ms per 16th note)
```

### API

```ts
class Clock {
  start(): void           // Start from beginning
  stop(): void            // Stop and reset
  pause(): void           // Pause at current position
  resume(): void          // Resume from paused position
  setBpm(bpm: number): void
  getBpm(): number
  getState(): ClockState

  // Callbacks (return unsubscribe function)
  onSixteenth(cb: (step: number, time: number) => void): () => void
  onBeat(cb: (beat: number, time: number) => void): () => void
  onBar(cb: (bar: number, time: number) => void): () => void

  dispose(): void         // Clean up
}

// Singleton access
getClock(): Clock
disposeClock(): void
```

### Callback Parameters

- `step`: 0-15 (which 16th note in the bar)
- `beat`: 0-3 (which quarter note in the bar)
- `bar`: 0+ (which bar since start)
- `time`: Precise `AudioContext.currentTime` when the event should occur

### Usage Example

```ts
const clock = getClock()
clock.setBpm(122)

// Schedule a kick on every beat
clock.onBeat((beat, time) => {
  drumSynth.kick(time, 1.0)
})

// Schedule hi-hats on every 16th note
clock.onSixteenth((step, time) => {
  drumSynth.hihatClosed(time, 0.3)
})

clock.start()
```

---

## Drum Synthesizer (`drumSynth.ts`)

### Purpose
Generate all drum sounds purely from Web Audio nodes (oscillators, noise, filters). No samples required.

### Why Synthesis Over Samples
1. **Zero loading time** - no audio files to fetch
2. **Infinite variation** - velocity affects multiple parameters
3. **Smaller bundle** - no audio assets
4. **Consistent quality** - no sample rate conversion issues

### Sound Design

#### Kick
```
Signal Flow:
  Sine Oscillator (pitch envelope: 150Hz → 50Hz)
    → GainNode (attack: 5ms, decay: 300ms)
    → Master

  + Click Oscillator (1000Hz → 100Hz, 20ms)
    → GainNode (very short, adds transient)
    → Master
```

The "thump" comes from the rapid pitch drop. The click transient adds attack definition.

#### Snare
```
Signal Flow:
  Noise Buffer
    → Bandpass Filter (3kHz, Q=1)
    → GainNode (2ms attack, 150ms decay)
    → Master

  + Sine Oscillator (180Hz, body resonance)
    → GainNode (1ms attack, 80ms decay)
    → Master
```

Combines the "snare wire" rattle (filtered noise) with drum body resonance (short sine).

#### Hi-Hat (Closed)
```
Signal Flow:
  Noise Buffer
    → Highpass Filter (7kHz)
    → Bandpass Filter (10kHz, Q=1)
    → GainNode (1ms attack, 50ms decay)
    → Master
```

Very short, high-frequency noise burst.

#### Hi-Hat (Open)
```
Signal Flow:
  Same as closed but:
    - Highpass at 6kHz
    - Longer decay: 250ms
```

#### Clap
```
Signal Flow:
  4× Noise Bursts at offsets [0, 10ms, 20ms, 35ms]
    → Bandpass Filter (1500Hz, Q=0.5)
    → GainNode (short attacks, staggered decays)
    → Master
```

Multiple overlapping noise bursts create the "many hands clapping" effect.

### API

```ts
class DrumSynth {
  setVolume(volume: number): void  // 0-1 master volume

  kick(time: number, velocity?: number): void
  snare(time: number, velocity?: number): void
  hihatClosed(time: number, velocity?: number): void
  hihatOpen(time: number, velocity?: number): void
  clap(time: number, velocity?: number): void

  dispose(): void
}

// Singleton access
getDrumSynth(): DrumSynth
disposeDrumSynth(): void
```

### Velocity Response
All drum sounds accept velocity (0-1). This scales:
- Peak gain level
- For more realistic feel, consider also scaling:
  - Filter cutoff (louder = brighter)
  - Decay time (louder = slightly longer)

### Node Cleanup
Each hit creates fresh audio nodes that self-destruct after playing:
```ts
osc.onended = () => {
  osc.disconnect()
  gainNode.disconnect()
}
```

This prevents memory leaks from accumulated detached nodes.

---

## Type Definitions (`types.ts`)

### Clock Types
```ts
interface ClockState {
  isPlaying: boolean
  isPaused: boolean
  bpm: number
  currentStep: number  // 0-15
  currentBeat: number  // 0-3
  currentBar: number
}
```

### Pattern Types (for future phases)
```ts
type DrumPattern = number[]  // 16 values, 0-1

interface DrumPatterns {
  kick: DrumPattern
  snare: DrumPattern
  hatClosed: DrumPattern
  hatOpen: DrumPattern
  clap: DrumPattern
}

interface StyleDefinition {
  name: string
  displayName: string
  bpmRange: [number, number]
  drums: DrumPatterns
  bass: BassPattern
  chords: ChordProgression
  arp: null | { pattern: number[], octaveRange: number }
}
```

---

## Design Decisions

### 1. Singleton Pattern for Clock and DrumSynth
**Why**: The Composer needs exactly one clock and one drum engine. Singletons ensure:
- Same clock instance across all components
- Single AudioContext connection
- Easy cleanup via `dispose*()` functions

### 2. Callback-Based Event System
**Why**: Allows multiple listeners to react to timing events:
- Pattern player can trigger drums
- UI can update visual indicators
- Future visualizations can sync to beat

### 3. Noise Buffer Recreation
**Why**: Each hit creates a fresh noise buffer rather than reusing one:
- Prevents phase artifacts when hits overlap
- Small memory cost, quickly garbage collected
- Simpler code (no buffer management)

### 4. Velocity as Optional Parameter
**Why**: Defaulting to 1.0 means basic usage is simple:
```ts
drums.kick(time)  // Full velocity
drums.kick(time, 0.5)  // Half velocity
```

---

## Testing

To verify Phase 1 works, temporarily add to any component:

```ts
import { getClock, getDrumSynth } from '../audio/composer'

// In a button click handler:
const clock = getClock()
const drums = getDrumSynth()

clock.setBpm(120)

// 4-on-the-floor kick pattern
clock.onBeat((beat, time) => {
  drums.kick(time, 1)
})

// Hi-hats on offbeats (steps 2, 6, 10, 14)
clock.onSixteenth((step, time) => {
  if (step % 4 === 2) {
    drums.hihatClosed(time, 0.4)
  }
})

clock.start()
```

---

## Next Phase

Phase 2 will add:
- Style pattern definitions (Deep House, Progressive House, Techno)
- Pattern player that uses Clock + DrumSynth to play drum patterns
