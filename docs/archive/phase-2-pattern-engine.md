# Phase 2: Pattern Engine - Implementation Notes

> Completed: Style definitions and Pattern Player

## Overview

Phase 2 builds on the Clock and DrumSynth from Phase 1 to create a pattern-based sequencing system. Three musical styles are defined (Deep House, Progressive House, Techno), each with characteristic drum patterns.

---

## Files Created

```
src/audio/composer/
  patternPlayer.ts           # Sequences patterns using clock + drums
  styles/
    index.ts                 # Style registry and helpers
    deepHouse.ts             # Deep House patterns
    progressiveHouse.ts      # Progressive House patterns
    techno.ts                # Techno patterns
```

---

## Style Definitions

### Pattern Format

Each style defines drum patterns as arrays of 16 values (one bar of 16th notes):

```ts
// Steps map to musical positions:
// [0]  [1]  [2]  [3]  [4]  [5]  [6]  [7]  [8]  [9]  [10] [11] [12] [13] [14] [15]
//  1    e    +    a    2    e    +    a    3    e    +    a    4    e    +    a
//  ↑              ↑              ↑              ↑
// beat 1        beat 2        beat 3        beat 4

// Example: 4-on-the-floor kick
kick: [1, 0, 0, 0,  1, 0, 0, 0,  1, 0, 0, 0,  1, 0, 0, 0]
//     ↑           ↑           ↑           ↑
//    beat 1     beat 2     beat 3     beat 4
```

Values are velocities (0-1):
- `0` = no hit
- `0.5` = half velocity (ghost note)
- `1` = full velocity

### Deep House (`deepHouse.ts`)

**Character**: Warm, groovy, soulful

| Element | Pattern Description |
|---------|---------------------|
| Kick | 4-on-the-floor (all beats) |
| Snare | None (uses clap instead) |
| Closed Hat | Offbeats (steps 2, 6, 10, 14) with ghost notes |
| Open Hat | Occasional accent at bar end |
| Clap | Beats 2 and 4 (backbeat) |

```
BPM Range: 118-124
Default: 122
```

**Why these choices**: Deep house is known for its shuffled, relaxed groove. The offbeat hats and no snare (clap only) give it that warm, club-friendly character.

### Progressive House (`progressiveHouse.ts`)

**Character**: Building, evolving, melodic, hypnotic

| Element | Pattern Description |
|---------|---------------------|
| Kick | 4-on-the-floor with slight accent on beat 1 |
| Snare | Light hits on beats 2 and 4 |
| Closed Hat | Busy 8th note pattern with 16th fills |
| Open Hat | Offbeat accents for drive |
| Clap | Layered with snare on 2 and 4 |

```
BPM Range: 122-128
Default: 124
```

**Why these choices**: Progressive house has more layers and forward momentum. The busier hat pattern and layered snare+clap create energy that builds over time.

### Techno (`techno.ts`)

**Character**: Driving, hypnotic, industrial, minimal

| Element | Pattern Description |
|---------|---------------------|
| Kick | Hard 4-on-the-floor, equal weight |
| Snare | Hard hits on 2 and 4 |
| Closed Hat | Consistent 16th notes throughout |
| Open Hat | Accents on offbeats |
| Clap | Layered with snare for power |

```
BPM Range: 128-138
Default: 132
```

**Why these choices**: Techno is relentless and mechanical. The constant 16th note hats and equal-weight kicks create a hypnotic, driving feel.

### Variation Patterns

Each style includes variation patterns for extended play:

```ts
export const deepHouseVariations = {
  drums_hatsActive: { ... },  // More active hat pattern
  drums_breakdown: { ... },   // Kick drops out
  drums_build: { ... },       // More percussion
}
```

These will be used by the Block Player (Phase 4) to create the intro/main/outro arc.

---

## Pattern Player (`patternPlayer.ts`)

### Purpose

Connects the Clock to the DrumSynth, triggering drum hits based on the current style's patterns.

### Architecture

```
┌─────────────────┐
│     Clock       │
│  (onSixteenth)  │
└────────┬────────┘
         │ step, time
         ▼
┌─────────────────┐
│  PatternPlayer  │
│                 │
│  - Look up step │
│    in patterns  │
│  - Humanize     │
│  - Trigger drums│
└────────┬────────┘
         │ kick(time, vel), etc.
         ▼
┌─────────────────┐
│    DrumSynth    │
└─────────────────┘
```

### Humanization

To avoid a robotic feel, the Pattern Player adds subtle variations:

| Parameter | Value | Effect |
|-----------|-------|--------|
| Velocity variance | ±10% | Slight dynamic variation |
| Timing variance | ±3ms | Subtle groove/swing feel |

```ts
private humanizeVelocity(velocity: number): number {
  const variance = (Math.random() * 2 - 1) * 0.1  // ±10%
  return Math.max(0.1, Math.min(1, velocity + variance))
}

private getTimingVariance(): number {
  return ((Math.random() * 2 - 1) * 3) / 1000  // ±3ms
}
```

### API

```ts
class PatternPlayer {
  constructor(clock: Clock, drums: DrumSynth, styleName?: string)

  setStyle(styleName: string): void
  getStyleName(): string
  getRecommendedBpm(): number

  start(): void   // Begin sequencing
  stop(): void    // Stop sequencing

  // For variations during playback
  setDrumPattern(drum: keyof DrumPatterns, pattern: number[]): void
  resetPatterns(): void

  dispose(): void
}
```

### Usage Example

```ts
import { getClock, getDrumSynth, createPatternPlayer } from './audio/composer'

const clock = getClock()
const drums = getDrumSynth()
const player = createPatternPlayer(clock, drums, 'deepHouse')

clock.setBpm(player.getRecommendedBpm())  // 122
player.start()
clock.start()

// Later...
player.setStyle('techno')
clock.setBpm(player.getRecommendedBpm())  // 132
```

---

## Style Registry (`styles/index.ts`)

### Exports

```ts
// All styles as a record
export const styles: Record<string, StyleDefinition>

// Get style by name (with fallback to deepHouse)
export function getStyle(name: string): StyleDefinition

// Get midpoint BPM for a style
export function getDefaultBpm(styleName: string): number

// List of available style names
export const styleNames: string[]
```

---

## Design Decisions

### 1. Patterns as Arrays, Not Objects

**Why**: Arrays map directly to step indices:
```ts
const velocity = pattern[step]  // O(1) lookup
```

Objects would require parsing or mapping step names.

### 2. Velocity-Based Patterns (Not Boolean)

**Why**: Allows ghost notes and accents:
```ts
hatClosed: [0, 0, 0.8, 0.3, ...]  // Main hit + ghost
```

Boolean patterns would lose this expressiveness.

### 3. Humanization in PatternPlayer, Not DrumSynth

**Why**: Separation of concerns:
- DrumSynth: "Play this sound at this exact time with this velocity"
- PatternPlayer: "Create musical patterns with human feel"

This allows DrumSynth to be used for precise, non-humanized triggering if needed.

### 4. Style Variations as Separate Objects

**Why**: Keeps the base style clean and immutable. Variations are applied by the Block Player when creating the track arc.

---

## Future Patterns (Phase 3+)

The style definitions also include placeholders for:

```ts
bass: {
  notes: [
    { note: 'C2', step: 0 },
    { note: 'G2', step: 6 },
    ...
  ]
}

chords: {
  chords: ['Cm7', 'Fm7', 'Gm7', 'Fm7'],
  barsPerChord: 2,
}

arp: {
  pattern: [1, 0, 0.7, 0, ...],
  octaveRange: 2,
}
```

These will be used by the Bass Synth and Pad Synth in Phase 3.

---

## Testing

To test the pattern engine:

```ts
import { getClock, getDrumSynth, createPatternPlayer } from './audio/composer'

// In a click handler (to satisfy autoplay policy):
const clock = getClock()
const drums = getDrumSynth()
const player = createPatternPlayer(clock, drums, 'techno')

clock.setBpm(130)
player.start()
clock.start()

// After 10 seconds, switch style
setTimeout(() => {
  player.setStyle('deepHouse')
  clock.setBpm(122)
}, 10000)
```

---

## Next Phase

Phase 3 will add:
- Bass synthesizer (monophonic, filtered)
- Bass pattern sequencing
- Pad synthesizer (polyphonic, lush)
- Chord progression playback
