# Phase 6: UI Controls - Implementation Plan

> Status: Planned

## Overview

Phase 6 connects the Composer audio engine to the UI, allowing users to build and play their sets.

---

## Components to Create

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
- Play/Pause toggle button
- Stop button (resets to beginning)
- Skip button (next block)
- Block indicator: "BLOCK X/Y"
- Progress bar with elapsed/total time
- Current style and BPM display

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

1. **BUILD SET button** - Currently does nothing. Wire it to:
   ```ts
   const setPlayer = getSetPlayer()
   setPlayer.loadSet(configuredBlocks)
   ```

2. **Show controls after build** - Render `<SetPlayerControls />` when set is loaded

3. **Playing block indicator** - Highlight currently playing block in the grid

4. **Block click during playback** - Option to jump to clicked block

---

### 3. useSetPlayer Hook (`src/hooks/useSetPlayer.ts`)

React hook wrapping SetPlayer for clean state management.

```ts
function useSetPlayer() {
  const [state, setState] = useState<SetPlayerState>(...)
  const playerRef = useRef(getSetPlayer())

  useEffect(() => {
    const unsub = playerRef.current.onStateChange(setState)
    return unsub
  }, [])

  return {
    // State
    isPlaying: state.isPlaying,
    isPaused: state.isPaused,
    currentBlockIndex: state.currentBlockIndex,
    progress: state.blockProgress,
    totalBlocks: state.totalBlocks,

    // Actions
    loadSet: (blocks) => playerRef.current.loadSet(blocks),
    play: () => playerRef.current.play(),
    pause: () => playerRef.current.pause(),
    stop: () => playerRef.current.stop(),
    skip: () => playerRef.current.skip(),

    // Helpers
    currentBlock: playerRef.current.getCurrentBlock(),
  }
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

### Playing
- Play button becomes Pause
- Stop/Skip enabled
- Progress bar animating
- Current block highlighted in grid
- Time counting up

### Paused
- Pause button becomes Play (resume)
- Progress frozen
- Stop resets, Skip advances

---

## Styling (`src/components/SetPlayerControls.css`)

Match existing brutalist aesthetic:
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

.transport-btn:hover {
  border-color: var(--color-accent);
  box-shadow: 0 0 8px var(--color-accent);
}

.transport-btn--playing {
  background: var(--color-accent);
  color: var(--color-gray-900);
}
```

**Progress bar:**
```css
.progress-bar {
  height: 4px;
  background: var(--color-gray-700);
}

.progress-bar__fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-style-techno), var(--color-style-house));
  transition: width 100ms linear;
}
```

---

## Implementation Steps

1. **Create useSetPlayer hook**
   - Wrap SetPlayer singleton
   - Expose state and actions
   - Handle cleanup on unmount

2. **Create SetPlayerControls component**
   - Transport buttons (Play/Pause/Stop/Skip)
   - Progress display
   - Block/style info

3. **Style the controls**
   - Match existing design system
   - Responsive layout

4. **Wire BUILD SET button**
   - Collect configured blocks
   - Call `loadSet()`
   - Show controls

5. **Add playing block highlight**
   - Pass `currentBlockIndex` to Composer
   - Style active block differently

6. **Test full flow**
   - Configure blocks
   - Build set
   - Play through
   - Verify transitions

---

## Future Enhancements (Post-Phase 6)

- **Keyboard shortcuts**: Space = play/pause, Escape = stop
- **Block click-to-jump**: Click block during playback to skip to it
- **Waveform visualization**: Canvas-based audio visualization
- **Volume control**: Master volume slider
- **Remaining time**: Show time left in set, not just block
