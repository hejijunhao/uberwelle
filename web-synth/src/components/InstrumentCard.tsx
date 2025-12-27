import './InstrumentCard.css'

export interface InstrumentCardProps {
  id: string
  number: string
  name: string
  description: string
  status: 'ready' | 'coming'
  visual?: React.ReactNode
  onClick?: () => void
}

export function InstrumentCard({
  number,
  name,
  description,
  status,
  visual,
  onClick,
}: InstrumentCardProps) {
  const isReady = status === 'ready'

  return (
    <button
      className={`instrument-card ${isReady ? 'instrument-card--ready' : 'instrument-card--coming'}`}
      onClick={isReady ? onClick : undefined}
      disabled={!isReady}
      type="button"
    >
      <div className="instrument-card__header">
        <span className="instrument-card__number">[{number}]</span>
        <span className={`instrument-card__status ${isReady ? 'instrument-card__status--ready' : ''}`}>
          {isReady ? 'READY' : 'COMING'}
        </span>
      </div>

      <h3 className="instrument-card__name">{name}</h3>

      {visual && (
        <div className="instrument-card__visual">
          {visual}
        </div>
      )}

      <p className="instrument-card__description">{description}</p>

      {isReady && (
        <div className="instrument-card__cta">
          LAUNCH →
        </div>
      )}
    </button>
  )
}
