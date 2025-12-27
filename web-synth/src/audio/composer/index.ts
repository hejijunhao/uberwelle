// Composer audio engine exports

// Core components
export { Clock, getClock, disposeClock } from './clock'
export { DrumSynth, getDrumSynth, disposeDrumSynth } from './drumSynth'
export { BassSynth, getBassSynth, disposeBassSynth } from './bassSynth'
export { PadSynth, getPadSynth, disposePadSynth } from './padSynth'

// Pattern and style system
export { PatternPlayer, createPatternPlayer } from './patternPlayer'
export { styles, getStyle, getDefaultBpm, styleNames } from './styles'

// Playback orchestration
export { BlockPlayer } from './blockPlayer'
export type { BlockPhase, BlockPlayerState } from './blockPlayer'
export { SetPlayer, getSetPlayer, disposeSetPlayer } from './setPlayer'

// Utilities
export * from './noteUtils'
export * from './types'
