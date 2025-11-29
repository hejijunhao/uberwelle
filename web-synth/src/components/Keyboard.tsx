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

  // Sort notes chromatically for grid layout
  const sortedNotes = [...notes].sort((a, b) => a.frequency - b.frequency)

  return (
    <div className="keyboard">
      {sortedNotes.map((note) => (
        <button
          key={note.id}
          className={`key ${note.isBlack ? 'black-key' : 'white-key'} ${activeNotes.has(note.id) ? 'active' : ''}`}
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
  )
}
