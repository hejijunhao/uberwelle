/**
 * Techno Style Definition
 *
 * Character: Driving, hypnotic, industrial, minimal
 * BPM: 128-138 (default 132)
 * Drums: Hard kick, sharp hats, minimal but powerful
 */

import type { StyleDefinition } from '../types'

export const techno: StyleDefinition = {
  name: 'techno',
  displayName: 'Techno',
  bpmRange: [128, 138],

  drums: {
    // Hard 4-on-the-floor, all kicks equal weight
    kick: [
      1, 0, 0, 0,
      1, 0, 0, 0,
      1, 0, 0, 0,
      1, 0, 0, 0,
    ],

    // Snare on 2 and 4, harder than house
    snare: [
      0, 0, 0, 0,
      0.9, 0, 0, 0,
      0, 0, 0, 0,
      0.9, 0, 0, 0,
    ],

    // Sharp, consistent 16th note hats
    hatClosed: [
      0.7, 0.5, 0.8, 0.5,
      0.7, 0.5, 0.8, 0.5,
      0.7, 0.5, 0.8, 0.5,
      0.7, 0.5, 0.8, 0.6,
    ],

    // Open hat accents
    hatOpen: [
      0, 0, 0, 0,
      0, 0, 0.5, 0,
      0, 0, 0, 0,
      0, 0, 0.5, 0,
    ],

    // Clap layered with snare for power
    clap: [
      0, 0, 0, 0,
      0.8, 0, 0, 0,
      0, 0, 0, 0,
      0.8, 0, 0, 0,
    ],
  },

  bass: {
    // Driving, repetitive bass pattern
    notes: [
      { note: 'E1', step: 0 },
      { note: 'E1', step: 2 },
      { note: 'E1', step: 4 },
      { note: 'E1', step: 6 },
      { note: 'G1', step: 8 },
      { note: 'G1', step: 10 },
      { note: 'E1', step: 12 },
      { note: 'E1', step: 14 },
    ],
  },

  chords: {
    // Minimal chord usage - mostly single notes or power chords
    chords: ['E5', 'E5', 'G5', 'E5'],
    barsPerChord: 4,
  },

  arp: null, // Techno uses basslines more than arps
}

export const technoVariations = {
  // Intro - just kick and minimal hats
  drums_intro: {
    snare: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    clap: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    hatClosed: [
      0, 0, 0.6, 0,
      0, 0, 0.6, 0,
      0, 0, 0.6, 0,
      0, 0, 0.6, 0,
    ],
  },

  // Build with rolling hats
  drums_build: {
    hatClosed: [
      0.8, 0.6, 0.9, 0.6,
      0.8, 0.6, 0.9, 0.7,
      0.8, 0.7, 0.9, 0.7,
      0.9, 0.7, 1.0, 0.8,
    ],
  },

  // Breakdown - kick drops
  drums_breakdown: {
    kick: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },

  // Peak - extra percussion feel
  drums_peak: {
    kick: [
      1, 0, 0, 0,
      1, 0, 0.4, 0,
      1, 0, 0, 0,
      1, 0, 0.4, 0,
    ],
    hatOpen: [
      0, 0, 0.6, 0,
      0, 0, 0, 0,
      0, 0, 0.6, 0,
      0, 0, 0, 0.4,
    ],
  },
}
