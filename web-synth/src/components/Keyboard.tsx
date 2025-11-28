import { useEffect, useState, useCallback } from 'react'
import type { NoteDef } from '../audio/noteFrequencies'
import { KEY_TO_NOTE, NOTES } from '../audio/noteFrequencies'
import './Keyboard.css'

interface KeyboardProps {
  notes: NoteDef[]
  onNoteDown: (noteId: string, frequency: number) => void
  onNoteUp: (noteId: string) => void
}

export function Keyboard({ notes, onNoteDown, onNoteUp }: KeyboardProps) {
  const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set())

  const handleNoteDown = useCallback(
    (note: NoteDef) => {
      if (!activeNotes.has(note.id)) {
        setActiveNotes((prev) => new Set(prev).add(note.id))
        onNoteDown(note.id, note.frequency)
      }
    },
    [activeNotes, onNoteDown]
  )

  const handleNoteUp = useCallback(
    (noteId: string) => {
      setActiveNotes((prev) => {
        const next = new Set(prev)
        next.delete(noteId)
        return next
      })
      onNoteUp(noteId)
    },
    [onNoteUp]
  )

  // Computer keyboard support
  useEffect(() => {
    const noteMap = new Map(NOTES.map((n) => [n.id, n]))

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return
      const noteId = KEY_TO_NOTE[e.key.toLowerCase()]
      if (noteId) {
        const note = noteMap.get(noteId)
        if (note) {
          handleNoteDown(note)
        }
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      const noteId = KEY_TO_NOTE[e.key.toLowerCase()]
      if (noteId) {
        handleNoteUp(noteId)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [handleNoteDown, handleNoteUp])

  // Separate white and black keys for proper rendering
  const whiteKeys = notes.filter((n) => !n.isBlack)
  const blackKeys = notes.filter((n) => n.isBlack)

  // Calculate black key positions (they sit between white keys)
  const getBlackKeyOffset = (noteId: string): number => {
    const noteName = noteId.replace(/\d/, '')
    const octave = parseInt(noteId.match(/\d/)?.[0] || '3')

    // Find the index of the white key to the left
    const whiteKeysBefore = whiteKeys.findIndex((w) => {
      const wName = w.id.replace(/\d/, '')
      const wOctave = parseInt(w.id.match(/\d/)?.[0] || '3')

      // Black key should be positioned after this white key
      if (noteName === 'C#' && wName === 'C' && wOctave === octave) return true
      if (noteName === 'D#' && wName === 'D' && wOctave === octave) return true
      if (noteName === 'F#' && wName === 'F' && wOctave === octave) return true
      if (noteName === 'G#' && wName === 'G' && wOctave === octave) return true
      if (noteName === 'A#' && wName === 'A' && wOctave === octave) return true
      return false
    })

    return whiteKeysBefore
  }

  return (
    <div className="keyboard">
      <div className="white-keys">
        {whiteKeys.map((note) => (
          <button
            key={note.id}
            className={`key white-key ${activeNotes.has(note.id) ? 'active' : ''}`}
            onMouseDown={() => handleNoteDown(note)}
            onMouseUp={() => handleNoteUp(note.id)}
            onMouseLeave={() => {
              if (activeNotes.has(note.id)) handleNoteUp(note.id)
            }}
          >
            <span className="key-label">{note.label}</span>
          </button>
        ))}
      </div>
      <div className="black-keys">
        {blackKeys.map((note) => {
          const offset = getBlackKeyOffset(note.id)
          return (
            <button
              key={note.id}
              className={`key black-key ${activeNotes.has(note.id) ? 'active' : ''}`}
              style={{ left: `calc(${offset} * var(--white-key-width) + var(--white-key-width) * 0.65)` }}
              onMouseDown={() => handleNoteDown(note)}
              onMouseUp={() => handleNoteUp(note.id)}
              onMouseLeave={() => {
                if (activeNotes.has(note.id)) handleNoteUp(note.id)
              }}
            >
              <span className="key-label">{note.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
