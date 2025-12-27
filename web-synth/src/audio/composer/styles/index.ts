/**
 * Style Registry
 *
 * Central export for all style definitions
 */

import { deepHouse, deepHouseVariations } from './deepHouse'
import { progressiveHouse, progressiveHouseVariations } from './progressiveHouse'
import { techno, technoVariations } from './techno'
import type { StyleDefinition } from '../types'

// All available styles
export const styles: Record<string, StyleDefinition> = {
  deepHouse,
  progressiveHouse,
  techno,
}

// Style variations for extended play
export const styleVariations = {
  deepHouse: deepHouseVariations,
  progressiveHouse: progressiveHouseVariations,
  techno: technoVariations,
}

// Get style by name (with fallback)
export function getStyle(name: string): StyleDefinition {
  return styles[name] || styles.deepHouse
}

// Get default BPM for a style
export function getDefaultBpm(styleName: string): number {
  const style = getStyle(styleName)
  // Return midpoint of BPM range
  return Math.round((style.bpmRange[0] + style.bpmRange[1]) / 2)
}

// List of style names for UI
export const styleNames = Object.keys(styles)

// Re-export individual styles
export { deepHouse, progressiveHouse, techno }
