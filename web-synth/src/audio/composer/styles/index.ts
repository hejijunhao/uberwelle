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

// Map UI style names to audio engine style names
// UI uses user-friendly names, audio engine uses internal names
const styleNameMap: Record<string, string> = {
  // Direct matches
  deepHouse: 'deepHouse',
  progressiveHouse: 'progressiveHouse',
  techno: 'techno',
  // UI aliases → audio engine styles
  house: 'deepHouse',
  ambient: 'progressiveHouse',  // Progressive has smoother, pad-heavy sound
  jazz: 'deepHouse',            // Deep house has jazzy chord progressions
  experimental: 'techno',       // Techno is more experimental/driving
  drone: 'progressiveHouse',    // Progressive works for droney textures
  minimal: 'techno',            // Techno is inherently minimal
  breaks: 'deepHouse',          // Deep house has syncopated patterns
}

// Get style by name (with alias mapping and fallback)
export function getStyle(name: string): StyleDefinition {
  const mappedName = styleNameMap[name] || name
  return styles[mappedName] || styles.deepHouse
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
