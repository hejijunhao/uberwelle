# Phases 3-5: Synths and Players - Implementation Notes

> Completed: Bass Synth, Pad Synth, Block Player, Set Player

## Overview

These phases complete the audio engine by adding tonal instruments (bass, pads) and the orchestration layer (block/set players) that ties everything together.

---

## Files Created

```
src/audio/composer/
  noteUtils.ts      # Note/frequency conversion utilities
  bassSynth.ts      # Monophonic bass synthesizer
  padSynth.ts       # Polyphonic pad synthesizer
  blockPlayer.ts    # Single block orchestration (5 min)
  setPlayer.ts      # Multi-block set orchestration
```

---

## Phase 3: Bass Synth (`bassSynth.ts`)

### Purpose
Monophonic bass synthesizer for low-frequency content. Provides the rhythmic and harmonic foundation.

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     BASS SYNTH                          │
│  ┌─────────┐    ┌─────────┐                            │
│  │  Osc 1  │───▶│  Gain 1 │───┐                        │
│  │ Sawtooth│    │(1-mix)  │   │    ┌────────┐         │
│  └─────────┘    └─────────┘   ├───▶│ Filter │──▶ Env ─▶ Out
│  ┌─────────┐    ┌─────────┐   │    │Lowpass │         │
│  │  Osc 2  │───▶│  Gain 2 │───┘    └────────┘         │
│  │ Square  │    │ (mix)   │                            │
│  └─────────┘    └─────────┘                            │
└─────────────────────────────────────────────────────────┘
```

### Key Features

| Feature | Implementation |
|---------|----------------|
| Dual oscillators | Saw + Square, detuned ±5 cents |
| Filter envelope | Cutoff sweeps on note attack |
| Portamento | Exponential ramp between frequencies |
| Persistent nodes | Oscillators run continuously, gain envelope controls sound |

### Configuration

```ts
interface BassSynthConfig {
  filterCutoff: number     // Hz (default 800)
  filterResonance: number  // Q (default 2)
  filterEnvAmount: number  // 0-1 (default 0.5)
  attackTime: number       // seconds (default 0.01)
  decayTime: number        // seconds (default 0.1)
  sustainLevel: number     // 0-1 (default 0.7)
  releaseTime: number      // seconds (default 0.15)
  glideTime: number        // seconds (default 0.03)
  oscMix: number           // 0=saw, 1=square (default 0.3)
  detuneAmount: number     // cents (default 5)
}
```

### Why Persistent Nodes

Unlike the drum synth (which creates new nodes per hit), the bass synth keeps oscillators running:

1. **Glide/portamento** - Can smoothly transition frequency between notes
2. **No clicks** - Stopping/starting oscillators can cause audible pops
3. **Lower CPU** - Fewer node creations per second

The gain envelope acts as the "gate" - setting gain to 0 silences the output.

---

## Phase 4: Pad Synth (`padSynth.ts`)

### Purpose
Polyphonic pad synthesizer for warm, evolving chords. Creates the harmonic backdrop.

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      PAD SYNTH                          │
│                                                         │
│  Per Voice (one per note):                             │
│  ┌─────────────────────────────────────┐               │
│  │  Osc1 ─┬─▶ Gain1 ─┐                 │               │
│  │  Osc2 ─┼─▶ Gain2 ─┼─▶ Filter ─▶ Env │──┐           │
│  │  Osc3 ─┴─▶ Gain3 ─┘       ▲         │  │           │
│  └───────────────────────────┼─────────┘  │           │
│                              │            ├──▶ Master │
│  LFO ───▶ LFO Gain ──────────┘            │           │
│                                           │           │
│  [Voice 2] ───────────────────────────────┤           │
│  [Voice 3] ───────────────────────────────┤           │
│  ...                                      │           │
└─────────────────────────────────────────────────────────┘
```

### Key Features

| Feature | Implementation |
|---------|----------------|
| Polyphony | Unlimited voices (one per note) |
| Detuned oscillators | 3 oscillators per voice, spread ±8 cents |
| Slow envelopes | 500ms attack, 2s release for pad character |
| LFO modulation | Slow sine LFO modulates all voice filters |
| Chord helper | `chordOn('Cm7', time)` parses and plays chord |

### Configuration

```ts
interface PadSynthConfig {
  attackTime: number       // seconds (default 0.5)
  decayTime: number        // seconds (default 0.3)
  sustainLevel: number     // 0-1 (default 0.7)
  releaseTime: number      // seconds (default 2.0)
  filterCutoff: number     // Hz (default 2000)
  filterResonance: number  // Q (default 1)
  lfoRate: number          // Hz (default 0.2)
  lfoDepth: number         // 0-1 (default 0.3)
  detuneSpread: number     // cents (default 8)
  voiceCount: number       // oscillators per note (default 3)
}
```

### Chord Parsing (`noteUtils.ts`)

The `getChordNotes()` function parses chord symbols:

```ts
getChordNotes('Cm7', 3)  // Returns ['C3', 'D#3', 'G3', 'A#3']
getChordNotes('F', 4)    // Returns ['F4', 'A4', 'C5']
```

Supported chord types:
- Major: `C`, `Cmaj`
- Minor: `Cm`, `Cmin`
- Seventh: `C7`, `Cmaj7`, `Cm7`
- Diminished: `Cdim`
- Augmented: `Caug`
- Sus: `Csus2`, `Csus4`
- Power: `C5`

---

## Phase 5: Block Player (`blockPlayer.ts`)

### Purpose
Orchestrates a single 5-minute block, managing the "arc" of the track and coordinating all instruments.

### Block Arc

Each block follows this structure:

```
|  INTRO  |  BUILD  |          MAIN          | OUTRO |
|  0-10%  | 10-20%  |        20-85%          | 85-100%|
|   30s   |   30s   |         3.25min        |  45s  |
```

| Phase | Drums | Bass | Pads | Character |
|-------|-------|------|------|-----------|
| Intro | 60% | 0% | 0% | Minimal, just groove |
| Build | 70% | 40% | 20% | Layers enter |
| Main | 80% | 60% | 40% | Full arrangement |
| Outro | 60% | 30% | 20% | Layers fade |

### Components Managed

```ts
class BlockPlayer {
  private clock: Clock           // Timing
  private drums: DrumSynth       // Percussion
  private bass: BassSynth        // Bass line
  private pads: PadSynth         // Chords
  private patternPlayer: PatternPlayer  // Drum sequencing
}
```

### Event Handling

**On each bar:**
- Check for chord changes based on style's `barsPerChord`
- Release old chord, trigger new chord

**On each 16th note:**
- Check bass pattern for notes to trigger
- Handle note-off slightly before note-on to prevent overlap

### State Emission

The block player emits state for UI updates:

```ts
interface BlockPlayerState {
  isPlaying: boolean
  phase: 'intro' | 'build' | 'main' | 'outro' | 'stopped'
  progress: number        // 0-1
  elapsedSeconds: number
  totalSeconds: number    // 300 (5 min)
  currentBar: number
}
```

---

## Phase 5: Set Player (`setPlayer.ts`)

### Purpose
Top-level controller that orchestrates multiple blocks in sequence. This is what the UI interacts with.

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      SET PLAYER                         │
│                                                         │
│  blocks: [Block1, Block2, Block3, ...]                 │
│                    ↓                                    │
│              ┌─────────────┐                           │
│              │BlockPlayer  │ (one at a time)           │
│              │  - Clock    │                           │
│              │  - Drums    │                           │
│              │  - Bass     │                           │
│              │  - Pads     │                           │
│              └─────────────┘                           │
│                    ↓                                    │
│              onComplete → next block                   │
└─────────────────────────────────────────────────────────┘
```

### API

```ts
class SetPlayer {
  loadSet(blocks: BlockConfig[]): void

  play(): void      // Start or resume
  pause(): void     // Pause playback
  stop(): void      // Stop and reset to beginning
  skip(): void      // Jump to next block

  getState(): SetPlayerState
  getCurrentBlock(): BlockConfig | null

  onStateChange(callback): () => void  // Subscribe to updates

  dispose(): void   // Clean up all resources
}

// Singleton access
getSetPlayer(): SetPlayer
disposeSetPlayer(): void
```

### State

```ts
interface SetPlayerState {
  isPlaying: boolean
  isPaused: boolean
  currentBlockIndex: number
  blockProgress: number  // 0-1 within current block
  totalBlocks: number
}
```

### Block Sequencing

1. `loadSet()` filters to only configured blocks
2. `play()` starts the first block via BlockPlayer
3. BlockPlayer emits `onComplete` when 5 minutes finish
4. SetPlayer advances to next block, or stops if last

---

## Note Utilities (`noteUtils.ts`)

### Functions

```ts
// Convert MIDI note number to frequency
midiToFrequency(69)  // 440 (A4)

// Parse note name to MIDI
noteNameToMidi('C4')  // 60

// Note name directly to frequency
noteNameToFrequency('A4')  // 440

// Get notes in a chord
getChordNotes('Cm7', 3)  // ['C3', 'D#3', 'G3', 'A#3']

// MIDI to note name
midiToNoteName(60)  // 'C4'
```

### Pre-computed Bass Frequencies

For performance, common bass notes are pre-computed:

```ts
export const BASS_FREQUENCIES: Record<string, number> = {
  'C1': 32.70,
  'C2': 65.41,
  'E1': 41.20,
  // ...
}
```

---

## Design Decisions

### 1. Singleton Pattern for All Audio Components

**Why**: Ensures single AudioContext, prevents resource conflicts:
```ts
const player = getSetPlayer()  // Same instance everywhere
```

### 2. Callback-Based State Updates

**Why**: React-friendly, allows multiple listeners:
```ts
const unsub = player.onStateChange(state => {
  setUIState(state)
})
// Later: unsub()
```

### 3. Volume-Based Phase Transitions

**Why**: Simpler than adding/removing nodes:
```ts
// Intro: bass silent
this.bass.setVolume(0)

// Build: bass fades in
this.bass.setVolume(0.4)
```

### 4. BlockPlayer Owns Pattern Sequencing

**Why**: Separation of concerns:
- SetPlayer: "which block, play/pause/skip"
- BlockPlayer: "how to play this specific block"
- PatternPlayer: "how to sequence drum patterns"

---

## File Structure Summary

```
src/audio/composer/
  index.ts           # All exports
  types.ts           # Shared interfaces

  # Core components
  clock.ts           # Tempo scheduler
  drumSynth.ts       # Synthesized drums
  bassSynth.ts       # Mono bass
  padSynth.ts        # Poly pads
  noteUtils.ts       # Note/chord helpers

  # Pattern system
  patternPlayer.ts   # Drum sequencing
  styles/
    index.ts
    deepHouse.ts
    progressiveHouse.ts
    techno.ts

  # Orchestration
  blockPlayer.ts     # 5-min block
  setPlayer.ts       # Multi-block set
```

---

## Next Steps

Phase 6 (UI) will add:
- `SetPlayerControls.tsx` - Play/Pause/Stop/Skip buttons
- Progress bar with elapsed time
- Current block indicator
- Integration with existing Composer component
