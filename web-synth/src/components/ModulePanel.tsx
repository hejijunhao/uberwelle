import type { ReactNode } from 'react'
import './ModulePanel.css'

interface ModulePanelProps {
  title: string
  children: ReactNode
  color?: 'primary' | 'secondary' | 'hot' | 'cool'
}

export function ModulePanel({ title, children, color = 'primary' }: ModulePanelProps) {
  return (
    <div className={`module-panel module-panel-${color}`}>
      <div className="module-header">
        <div className={`module-led led-${color}`} />
        <h3 className="module-title">{title}</h3>
      </div>
      <div className="module-content">{children}</div>
    </div>
  )
}

interface PatchPointProps {
  label?: string
  type: 'input' | 'output'
}

export function PatchPoint({ label, type }: PatchPointProps) {
  return (
    <div className={`patch-point patch-${type}`}>
      <div className="patch-jack" />
      {label && <span className="patch-label">{label}</span>}
    </div>
  )
}
