import { useRef, useCallback, useState, useEffect } from 'react'
import './Knob.css'

interface KnobProps {
  value: number
  min: number
  max: number
  step?: number
  label: string
  unit?: string
  formatValue?: (value: number) => string
  onChange: (value: number) => void
  size?: 'small' | 'medium' | 'large'
  color?: 'primary' | 'secondary' | 'hot' | 'cool'
}

export function Knob({
  value,
  min,
  max,
  step = 0.01,
  label,
  unit = '',
  formatValue,
  onChange,
  size = 'medium',
  color = 'primary',
}: KnobProps) {
  const knobRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef<{ y: number; value: number } | null>(null)

  // Convert value to rotation angle (270° sweep from -135° to +135°)
  const normalized = (value - min) / (max - min)
  const rotation = -135 + normalized * 270

  const displayValue = formatValue ? formatValue(value) : value.toFixed(2)

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      setIsDragging(true)
      dragStartRef.current = { y: e.clientY, value }
    },
    [value]
  )

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !dragStartRef.current) return

      const deltaY = dragStartRef.current.y - e.clientY
      const range = max - min
      // 200px of drag = full range
      const sensitivity = range / 200
      const newValue = dragStartRef.current.value + deltaY * sensitivity

      // Clamp and round to step
      const clamped = Math.max(min, Math.min(max, newValue))
      const stepped = Math.round(clamped / step) * step
      onChange(stepped)
    },
    [isDragging, min, max, step, onChange]
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    dragStartRef.current = null
  }, [])

  // Double-click to reset to center/default
  const handleDoubleClick = useCallback(() => {
    const center = (min + max) / 2
    onChange(center)
  }, [min, max, onChange])

  // Wheel support for fine-tuning
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault()
      const direction = e.deltaY > 0 ? -1 : 1
      const newValue = value + direction * step * 5
      const clamped = Math.max(min, Math.min(max, newValue))
      onChange(clamped)
    },
    [value, min, max, step, onChange]
  )

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  return (
    <div className={`knob-container knob-${size}`}>
      <div className="knob-label">{label}</div>
      <div
        ref={knobRef}
        className={`knob knob-color-${color} ${isDragging ? 'dragging' : ''}`}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
        onWheel={handleWheel}
      >
        {/* Tick marks around the knob */}
        <div className="knob-ticks">
          {[...Array(11)].map((_, i) => (
            <div
              key={i}
              className={`knob-tick ${i === 0 || i === 10 ? 'major' : ''} ${i === 5 ? 'center' : ''}`}
              style={{ transform: `rotate(${-135 + i * 27}deg)` }}
            />
          ))}
        </div>

        {/* The rotatable knob body */}
        <div
          className="knob-body"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          <div className="knob-indicator" />
        </div>

        {/* Center cap */}
        <div className="knob-cap" />
      </div>
      <div className="knob-value">
        {displayValue}
        {unit && <span className="knob-unit">{unit}</span>}
      </div>
    </div>
  )
}
