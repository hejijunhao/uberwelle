import './Switch.css'

interface SwitchProps {
  value: boolean
  label: string
  onChange: (value: boolean) => void
  size?: 'small' | 'medium'
}

export function Switch({ value, label, onChange, size = 'medium' }: SwitchProps) {
  return (
    <div className={`switch-container switch-${size}`}>
      <div className="switch-label">{label}</div>
      <button
        className={`switch ${value ? 'on' : 'off'}`}
        onClick={() => onChange(!value)}
        aria-pressed={value}
      >
        <div className="switch-track">
          <div className="switch-thumb" />
        </div>
        <div className={`switch-led ${value ? 'active' : ''}`} />
      </button>
    </div>
  )
}

interface ToggleGroupProps<T extends string> {
  value: T
  options: { value: T; label: string }[]
  label: string
  onChange: (value: T) => void
  layout?: 'horizontal' | 'vertical'
}

export function ToggleGroup<T extends string>({
  value,
  options,
  label,
  onChange,
  layout = 'horizontal',
}: ToggleGroupProps<T>) {
  return (
    <div className={`toggle-group toggle-group-${layout}`}>
      <div className="toggle-group-label">{label}</div>
      <div className="toggle-group-options">
        {options.map((option) => (
          <button
            key={option.value}
            className={`toggle-option ${value === option.value ? 'active' : ''}`}
            onClick={() => onChange(option.value)}
          >
            <span className="toggle-option-label">{option.label}</span>
            <div className={`toggle-led ${value === option.value ? 'active' : ''}`} />
          </button>
        ))}
      </div>
    </div>
  )
}
