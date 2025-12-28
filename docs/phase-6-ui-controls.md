# Phase 6: UI Controls - Implementation Plan

> Status: **Implemented** (2025-12-28)

## Overview

Phase 6 connects the Composer audio engine to the UI, allowing users to build and play their sets.

---

## Implementation Summary

### Files Created

| File | Description |
|------|-------------|
| `src/hooks/useSetPlayer.ts` | React hook wrapping SetPlayer singleton |
| `src/components/SetPlayerControls.tsx` | Transport controls component |
| `src/components/SetPlayerControls.css` | Brutalist styling for controls |

### Files Modified

| File | Changes |
|------|---------|
| `src/components/Composer.tsx` | Integrated useSetPlayer, wired BUILD SET button, shows controls when loaded |
| `src/components/ComposerBlock.tsx` | Added `isPlaying` prop for playing block highlight |
| `src/components/ComposerBlock.css` | Added pulsing glow animation for playing state |
| `src/components/Composer.css` | Added actions container and reset button styles |

---

## Components Created

### 1. SetPlayerControls (`src/components/SetPlayerControls.tsx`)

Transport controls and playback status display.

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│   [▶ PLAY]   [⏸ PAUSE]   [⏹ STOP]   [⏭ SKIP]               │
│                                                              │
│   BLOCK 3/16  ████████████░░░░░░░░░░░░░░░  2:34 / 5:00      │
│   DEEP HOUSE @ 122 BPM                                       │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Elements:**
- Play/Pause toggle button (single button that switches state)
- Stop button (resets to beginning)
- Skip button (next block)
- Block indicator: "BLOCK X/Y"
- Progress bar with elapsed/total time
- Current style and BPM display (color-coded by style)

**State from SetPlayer:**
```ts
interface SetPlayerState {
  isPlaying: boolean
  isPaused: boolean
  currentBlockIndex: number
  blockProgress: number  // 0-1
  totalBlocks: number
}
```

---

### 2. Composer Integration

**Updates to `Composer.tsx`:**

1. **BUILD SET button** - Wired to:
   ```ts
   const handleBuildSet = () => {
     const audioBlocks = blocks.map(toAudioBlockConfig)
     loadSet(audioBlocks)
   }
   ```

2. **Show controls after build** - Renders `<SetPlayerControls />` when `isLoaded` is true

3. **Playing block indicator** - Passes `isPlaying` prop to ComposerBlock for the currently playing block

4. **Block index mapping** - Maps SetPlayer's configured-only index back to the full block grid index

5. **RESET button** - Allows stopping and clearing the current set

6. **REBUILD SET** - Button text changes when set is already loaded

---

### 3. useSetPlayer Hook (`src/hooks/useSetPlayer.ts`)

React hook wrapping SetPlayer for clean state management.

```ts
function useSetPlayer(): UseSetPlayerReturn {
  // State
  isPlaying: boolean
  isPaused: boolean
  currentBlockIndex: number
  progress: number  // 0-1
  totalBlocks: number
  isLoaded: boolean

  // Current block info
  currentBlock: BlockConfig | null
  currentStyle: string | null
  currentBpm: number | null

  // Actions
  loadSet: (blocks: BlockConfig[]) => void
  play: () => void
  pause: () => void
  stop: () => void
  skip: () => void
  jumpToBlock: (index: number) => void

  // Helpers
  formatTime: (progress: number, durationSeconds?: number) => string
  getElapsedSeconds: (durationSeconds?: number) => number
}
```

---

## UI States

### Before Build
- Composer grid visible
- Block configuration modal works
- "BUILD SET" button visible (disabled if no blocks configured)
- No playback controls

### After Build (Stopped)
- Playback controls visible below composer
- Play button enabled
- Stop/Skip disabled
- Progress at 0:00
- "RESET" button visible
- "BUILD SET" becomes "REBUILD SET"

### Playing
- Play button becomes Pause
- Stop/Skip enabled
- Progress bar animating (color matches current style)
- Current block highlighted with pulsing glow
- Time counting up

### Paused
- Pause button becomes Play (resume)
- Progress frozen
- Stop resets, Skip advances

---

## Styling (`src/components/SetPlayerControls.css`)

Matches existing brutalist aesthetic:
- Monospace font
- Sharp borders
- Dark background with accent colors
- Button states: hover glow, active press

**Button styles:**
```css
.transport-btn {
  background: var(--color-gray-800);
  border: 1px solid var(--color-gray-600);
  color: var(--color-gray-100);
  font-family: var(--font-mono);
  padding: 0.5rem 1rem;
}

.transport-btn:hover:not(:disabled) {
  border-color: var(--color-accent);
  box-shadow: 0 0 8px var(--color-accent);
}

.transport-btn--active {
  background: var(--color-accent);
  color: var(--color-gray-900);
}
```

**Progress bar:**
```css
.set-player-controls__progress-bar {
  height: 4px;
  background: var(--color-gray-700);
}

.set-player-controls__progress-fill {
  height: 100%;
  /* Color set dynamically based on current style */
  transition: width 100ms linear;
}
```

**Playing block animation:**
```css
.composer-block--playing {
  animation: pulse-glow 1.5s ease-in-out infinite;
  border-color: var(--block-color, var(--color-accent)) !important;
  box-shadow: 0 0 12px var(--block-color, var(--color-accent));
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 8px var(--block-color); }
  50% { box-shadow: 0 0 16px var(--block-color); }
}
```

---

## Implementation Notes

### Block Index Mapping

The SetPlayer only contains configured blocks, but the UI shows all 16 blocks. When highlighting the playing block, we need to map back from the SetPlayer's index to the UI's index:

```ts
const getPlayingBlockIndex = (): number | null => {
  if (!isPlaying && !isPaused) return null

  // Get configured block indices
  const configuredIndices = blocks
    .map((b, i) => b.configured ? i : -1)
    .filter(i => i !== -1)

  // Map the current block index in the set to the original block index
  if (currentBlockIndex < configuredIndices.length) {
    return configuredIndices[currentBlockIndex]
  }
  return null
}
```

### Type Conversion

UI uses `BlockData`, audio engine uses `BlockConfig`. The conversion adds the required `duration` field:

```ts
function toAudioBlockConfig(block: BlockData): AudioBlockConfig {
  return {
    ...block,
    duration: 300, // 5 minutes
  }
}
```

---

## Future Enhancements (Post-Phase 6)

- **Keyboard shortcuts**: Space = play/pause, Escape = stop
- **Block click-to-jump**: Click block during playback to skip to it
- **Waveform visualization**: Canvas-based audio visualization
- **Volume control**: Master volume slider
- **Remaining time**: Show time left in set, not just block
