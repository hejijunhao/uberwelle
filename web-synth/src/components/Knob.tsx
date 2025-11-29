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
}: KnobProps) {
  const knobRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef<{ y: number; value: number } | null>(null)

  // Normalized value 0-1
  const normalized = (value - min) / (max - min)

  // SVG arc calculation (270° sweep)
  const radius = size === 'small' ? 20 : size === 'large' ? 36 : 28
  const strokeWidth = size === 'small' ? 3 : size === 'large' ? 5 : 4
  const circumference = 2 * Math.PI * radius
  const arcLength = circumference * 0.75 // 270 degrees
  const offset = arcLength * (1 - normalized)

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
      const sensitivity = range / 150
      const newValue = dragStartRef.current.value + deltaY * sensitivity

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

  const handleDoubleClick = useCallback(() => {
    const center = (min + max) / 2
    onChange(center)
  }, [min, max, onChange])

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

  const svgSize = size === 'small' ? 48 : size === 'large' ? 80 : 64
  const center = svgSize / 2

  return (
    <div className={`knob-container knob-${size}`}>
      <div className="knob-label">{label}</div>
      <div
        ref={knobRef}
        className={`knob ${isDragging ? 'dragging' : ''}`}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
        onWheel={handleWheel}
      >
        {/* SVG Arc indicator */}
        <svg className="knob-arc" viewBox={`0 0 ${svgSize} ${svgSize}`}>
          {/* Track (background arc) */}
          <circle
            className="arc-track"
            cx={center}
            cy={center}
            r={radius}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={0}
            transform={`rotate(135 ${center} ${center})`}
          />
          {/* Value arc */}
          <circle
            className="arc-value"
            cx={center}
            cy={center}
            r={radius}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={offset}
            transform={`rotate(135 ${center} ${center})`}
          />
        </svg>

        {/* Center display */}
        <div className="knob-body" />
        <div className="knob-cap" />
      </div>
      <div className="knob-value">
        {displayValue}
        {unit && <span className="knob-unit">{unit}</span>}
      </div>
    </div>
  )
}
