export interface NoteDef {
  id: string
  label: string
  frequency: number
  isBlack: boolean
}

// Standard formula: frequency = 440 * 2^((n-69)/12)
// where n is the MIDI note number (A4 = 69)
function midiToFrequency(midiNote: number): number {
  return 440 * Math.pow(2, (midiNote - 69) / 12)
}

// Generate 2 octaves starting from C3 (MIDI 48)
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const BLACK_KEYS = new Set(['C#', 'D#', 'F#', 'G#', 'A#'])

function generateNotes(startOctave: number, numOctaves: number): NoteDef[] {
  const notes: NoteDef[] = []
  const startMidi = 48 + (startOctave - 3) * 12 // C3 = MIDI 48

  for (let octave = 0; octave < numOctaves; octave++) {
    for (let i = 0; i < 12; i++) {
      const noteName = NOTE_NAMES[i]
      const octaveNum = startOctave + octave
      const midiNote = startMidi + octave * 12 + i

      notes.push({
        id: `${noteName}${octaveNum}`,
        label: noteName,
        frequency: midiToFrequency(midiNote),
        isBlack: BLACK_KEYS.has(noteName),
      })
    }
  }

  // Add final C to complete the last octave
  const finalOctave = startOctave + numOctaves
  const finalMidi = startMidi + numOctaves * 12
  notes.push({
    id: `C${finalOctave}`,
    label: 'C',
    frequency: midiToFrequency(finalMidi),
    isBlack: false,
  })

  return notes
}

// 2 octaves from C3 to C5
export const NOTES = generateNotes(3, 2)

// Keyboard mapping: computer keys to note IDs
export const KEY_TO_NOTE: Record<string, string> = {
  // Lower row: C3 to B3
  'z': 'C3',
  's': 'C#3',
  'x': 'D3',
  'd': 'D#3',
  'c': 'E3',
  'v': 'F3',
  'g': 'F#3',
  'b': 'G3',
  'h': 'G#3',
  'n': 'A3',
  'j': 'A#3',
  'm': 'B3',
  // Upper row: C4 to C5
  'q': 'C4',
  '2': 'C#4',
  'w': 'D4',
  '3': 'D#4',
  'e': 'E4',
  'r': 'F4',
  '5': 'F#4',
  't': 'G4',
  '6': 'G#4',
  'y': 'A4',
  '7': 'A#4',
  'u': 'B4',
  'i': 'C5',
}
