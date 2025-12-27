/**
 * Note Utilities
 *
 * Helpers for converting between note names, MIDI numbers, and frequencies.
 * Covers the full range needed for bass (C1) to leads (C6).
 */

// Note name to semitone offset (within octave)
const NOTE_OFFSETS: Record<string, number> = {
  'C': 0,
  'C#': 1, 'Db': 1,
  'D': 2,
  'D#': 3, 'Eb': 3,
  'E': 4,
  'F': 5,
  'F#': 6, 'Gb': 6,
  'G': 7,
  'G#': 8, 'Ab': 8,
  'A': 9,
  'A#': 10, 'Bb': 10,
  'B': 11,
}

/**
 * Convert MIDI note number to frequency
 * A4 (MIDI 69) = 440Hz
 */
export function midiToFrequency(midiNote: number): number {
  return 440 * Math.pow(2, (midiNote - 69) / 12)
}

/**
 * Parse note name (e.g., "C4", "F#2") to MIDI note number
 * C4 = middle C = MIDI 60
 */
export function noteNameToMidi(noteName: string): number {
  // Parse note name and octave
  const match = noteName.match(/^([A-Ga-g][#b]?)(\d+)$/)
  if (!match) {
    console.warn(`Invalid note name: ${noteName}, defaulting to C4`)
    return 60
  }

  const [, note, octaveStr] = match
  const noteUpper = note.charAt(0).toUpperCase() + note.slice(1)
  const octave = parseInt(octaveStr, 10)

  const offset = NOTE_OFFSETS[noteUpper]
  if (offset === undefined) {
    console.warn(`Unknown note: ${noteUpper}, defaulting to C`)
    return 60
  }

  // MIDI note = 12 * (octave + 1) + offset
  // C4 = 12 * 5 + 0 = 60
  return 12 * (octave + 1) + offset
}

/**
 * Convert note name directly to frequency
 */
export function noteNameToFrequency(noteName: string): number {
  return midiToFrequency(noteNameToMidi(noteName))
}

/**
 * Get the notes in a chord (simplified, triads and 7ths)
 * Returns array of note names
 */
export function getChordNotes(chordName: string, octave: number = 3): string[] {
  // Parse chord name: root + quality
  const match = chordName.match(/^([A-G][#b]?)(.*)$/)
  if (!match) return [`C${octave}`, `E${octave}`, `G${octave}`]

  const [, root, quality] = match

  // Semitone intervals from root
  let intervals: number[]

  switch (quality.toLowerCase()) {
    case '':
    case 'maj':
      intervals = [0, 4, 7] // Major triad
      break
    case 'm':
    case 'min':
      intervals = [0, 3, 7] // Minor triad
      break
    case '7':
    case 'dom7':
      intervals = [0, 4, 7, 10] // Dominant 7th
      break
    case 'maj7':
      intervals = [0, 4, 7, 11] // Major 7th
      break
    case 'm7':
    case 'min7':
      intervals = [0, 3, 7, 10] // Minor 7th
      break
    case 'dim':
      intervals = [0, 3, 6] // Diminished
      break
    case 'aug':
      intervals = [0, 4, 8] // Augmented
      break
    case '5':
      intervals = [0, 7] // Power chord
      break
    case 'sus2':
      intervals = [0, 2, 7]
      break
    case 'sus4':
      intervals = [0, 5, 7]
      break
    default:
      intervals = [0, 4, 7] // Default to major
  }

  // Convert root to MIDI, add intervals, convert back to names
  const rootMidi = noteNameToMidi(`${root}${octave}`)

  return intervals.map(interval => {
    const midi = rootMidi + interval
    return midiToNoteName(midi)
  })
}

/**
 * Convert MIDI note to note name
 */
export function midiToNoteName(midi: number): string {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  const octave = Math.floor(midi / 12) - 1
  const noteIndex = midi % 12
  return `${noteNames[noteIndex]}${octave}`
}

/**
 * Frequency table for common bass notes (pre-computed for performance)
 */
export const BASS_FREQUENCIES: Record<string, number> = {
  'C1': midiToFrequency(24),
  'D1': midiToFrequency(26),
  'E1': midiToFrequency(28),
  'F1': midiToFrequency(29),
  'G1': midiToFrequency(31),
  'A1': midiToFrequency(33),
  'B1': midiToFrequency(35),
  'C2': midiToFrequency(36),
  'D2': midiToFrequency(38),
  'E2': midiToFrequency(40),
  'F2': midiToFrequency(41),
  'G2': midiToFrequency(43),
  'A2': midiToFrequency(45),
  'B2': midiToFrequency(47),
  'C3': midiToFrequency(48),
  'D3': midiToFrequency(50),
  'E3': midiToFrequency(52),
  'F3': midiToFrequency(53),
  'G3': midiToFrequency(55),
}
