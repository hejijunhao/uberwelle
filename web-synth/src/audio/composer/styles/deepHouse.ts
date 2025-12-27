/**
 * Deep House Style Definition
 *
 * Character: Warm, groovy, soulful
 * BPM: 118-124 (default 122)
 * Drums: 4-on-the-floor kick, offbeat hats, clap on 2 and 4
 */

import type { StyleDefinition } from '../types'

// 16 steps = 1 bar of 16th notes
// Steps 0,4,8,12 = beats 1,2,3,4

export const deepHouse: StyleDefinition = {
  name: 'deepHouse',
  displayName: 'Deep House',
  bpmRange: [118, 124],

  drums: {
    // 4-on-the-floor: kick on every beat
    kick: [
      1, 0, 0, 0, // beat 1
      1, 0, 0, 0, // beat 2
      1, 0, 0, 0, // beat 3
      1, 0, 0, 0, // beat 4
    ],

    // Snare: none (use clap instead for deep house)
    snare: [
      0, 0, 0, 0,
      0, 0, 0, 0,
      0, 0, 0, 0,
      0, 0, 0, 0,
    ],

    // Closed hat: offbeats with some ghost notes
    // Main hits on 2, 6, 10, 14 (offbeats)
    // Ghost notes at lower velocity
    hatClosed: [
      0, 0, 0.8, 0,   // offbeat after 1
      0, 0, 0.8, 0.3, // offbeat after 2 + ghost
      0, 0, 0.8, 0,   // offbeat after 3
      0, 0, 0.8, 0.3, // offbeat after 4 + ghost
    ],

    // Open hat: occasional accent
    hatOpen: [
      0, 0, 0, 0,
      0, 0, 0, 0,
      0, 0, 0, 0,
      0, 0, 0, 0.5, // end of bar accent
    ],

    // Clap: beats 2 and 4 (the backbeat)
    clap: [
      0, 0, 0, 0, // beat 1
      1, 0, 0, 0, // beat 2 - CLAP
      0, 0, 0, 0, // beat 3
      1, 0, 0, 0, // beat 4 - CLAP
    ],
  },

  bass: {
    notes: [
      { note: 'C2', step: 0 },  // root on beat 1
      { note: 'C2', step: 6 },  // syncopation
      { note: 'G2', step: 10 }, // fifth
      { note: 'C2', step: 14 }, // lead back to root
    ],
  },

  chords: {
    // Classic deep house minor progression
    chords: ['Cm7', 'Fm7', 'Gm7', 'Fm7'],
    barsPerChord: 2,
  },

  arp: null, // Deep house typically doesn't use arpeggios
}

/**
 * Variation patterns for extended play
 * These can be swapped in every N bars for variety
 */
export const deepHouseVariations = {
  // More active hat pattern
  drums_hatsActive: {
    hatClosed: [
      0.5, 0, 0.8, 0.3,
      0.5, 0, 0.8, 0.3,
      0.5, 0, 0.8, 0.3,
      0.5, 0, 0.8, 0.3,
    ],
  },

  // Breakdown - kick drops out
  drums_breakdown: {
    kick: [
      0, 0, 0, 0,
      0, 0, 0, 0,
      0, 0, 0, 0,
      0, 0, 0, 0,
    ],
  },

  // Build - add more percussion
  drums_build: {
    hatOpen: [
      0, 0, 0, 0,
      0, 0, 0, 0.4,
      0, 0, 0, 0,
      0, 0, 0, 0.6,
    ],
  },
}
