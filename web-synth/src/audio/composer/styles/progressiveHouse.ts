/**
 * Progressive House Style Definition
 *
 * Character: Building, evolving, melodic, hypnotic
 * BPM: 122-128 (default 124)
 * Drums: Driving kick, more hats, builds over time
 */

import type { StyleDefinition } from '../types'

export const progressiveHouse: StyleDefinition = {
  name: 'progressiveHouse',
  displayName: 'Progressive House',
  bpmRange: [122, 128],

  drums: {
    // 4-on-the-floor with slight accent on 1
    kick: [
      1, 0, 0, 0,   // beat 1
      0.9, 0, 0, 0, // beat 2 (slightly softer)
      0.9, 0, 0, 0, // beat 3
      0.9, 0, 0, 0, // beat 4
    ],

    // Light snare on 2 and 4
    snare: [
      0, 0, 0, 0,
      0.6, 0, 0, 0, // beat 2
      0, 0, 0, 0,
      0.6, 0, 0, 0, // beat 4
    ],

    // Busier hat pattern - 8th notes with 16th fills
    hatClosed: [
      0.6, 0, 0.8, 0.3,
      0.6, 0, 0.8, 0.3,
      0.6, 0, 0.8, 0.3,
      0.6, 0, 0.8, 0.4,
    ],

    // Open hat on offbeats for drive
    hatOpen: [
      0, 0, 0.4, 0,
      0, 0, 0, 0,
      0, 0, 0.4, 0,
      0, 0, 0, 0,
    ],

    // Clap layered with snare
    clap: [
      0, 0, 0, 0,
      0.7, 0, 0, 0, // beat 2
      0, 0, 0, 0,
      0.7, 0, 0, 0, // beat 4
    ],
  },

  bass: {
    notes: [
      { note: 'A2', step: 0 },
      { note: 'A2', step: 3 },
      { note: 'A2', step: 6 },
      { note: 'E2', step: 8 },
      { note: 'A2', step: 11 },
      { note: 'G2', step: 14 },
    ],
  },

  chords: {
    // Minor key progression with tension
    chords: ['Am', 'F', 'C', 'G'],
    barsPerChord: 4,
  },

  // Progressive house uses arpeggios
  arp: {
    pattern: [1, 0, 0.7, 0, 1, 0, 0.7, 0, 1, 0, 0.7, 0, 1, 0, 0.5, 0.5],
    octaveRange: 2,
  },
}

export const progressiveHouseVariations = {
  // Intro/breakdown - minimal
  drums_minimal: {
    kick: [
      0, 0, 0, 0,
      0, 0, 0, 0,
      0, 0, 0, 0,
      0, 0, 0, 0,
    ],
    hatClosed: [
      0, 0, 0.5, 0,
      0, 0, 0.5, 0,
      0, 0, 0.5, 0,
      0, 0, 0.5, 0,
    ],
  },

  // Build - more energy
  drums_build: {
    hatClosed: [
      0.7, 0.4, 0.9, 0.4,
      0.7, 0.4, 0.9, 0.4,
      0.7, 0.4, 0.9, 0.5,
      0.7, 0.5, 0.9, 0.6,
    ],
    snare: [
      0, 0, 0, 0,
      0.7, 0, 0, 0.3,
      0, 0, 0, 0,
      0.7, 0, 0.4, 0.5,
    ],
  },

  // Drop - full energy
  drums_drop: {
    kick: [
      1, 0, 0, 0,
      1, 0, 0, 0,
      1, 0, 0, 0,
      1, 0, 0.5, 0,
    ],
  },
}
