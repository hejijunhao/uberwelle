import { InstrumentCard } from './InstrumentCard'
import './HomePage.css'

interface HomePageProps {
  onSelectInstrument: (id: string) => void
  onStartPlaylist: () => void
}

const INSTRUMENTS = [
  {
    id: 'synth',
    number: '01',
    name: 'SYNTH',
    description: 'Polyphonic synthesizer with ADSR, filter, and LFO',
    status: 'ready' as const,
    visual: '~∿~∿~∿~∿~',
  },
  {
    id: 'drums',
    number: '02',
    name: 'DRUMS',
    description: 'Step sequencer with drum samples',
    status: 'coming' as const,
    visual: '▪ ▪ ▪ ▪',
  },
  {
    id: 'sampler',
    number: '03',
    name: 'SAMPLER',
    description: 'Load and manipulate audio samples',
    status: 'coming' as const,
    visual: '▓░▓░▓░▓░',
  },
  {
    id: 'ambient',
    number: '04',
    name: 'AMBIENT',
    description: 'Generative textures and drones',
    status: 'coming' as const,
    visual: '· · ·   · ·',
  },
]

export function HomePage({ onSelectInstrument, onStartPlaylist }: HomePageProps) {
  return (
    <div className="home-page">
      <header className="home-header">
        <div className="home-header__brand">
          <span className="home-header__label">SYS.AUDIO</span>
          <h1 className="home-header__title">MOTHERBOARD INSTRUMENTS</h1>
        </div>
        <div className="home-header__tagline">
          Browser-based instruments for the modern era
        </div>
      </header>

      <main className="home-main">
        <div className="instruments-grid">
          {INSTRUMENTS.map((instrument) => (
            <InstrumentCard
              key={instrument.id}
              {...instrument}
              visual={<span>{instrument.visual}</span>}
              onClick={() => onSelectInstrument(instrument.id)}
            />
          ))}

          <button
            className="playlist-card"
            onClick={onStartPlaylist}
            type="button"
          >
            <div className="playlist-card__header">
              <span className="playlist-card__icon">[▶▶]</span>
              <span className="playlist-card__label">DEEP FOCUS</span>
            </div>
            <h3 className="playlist-card__title">PLAYLIST</h3>
            <p className="playlist-card__description">
              AI-generated background music for concentration and flow.
              Select your mood and let the algorithm compose.
            </p>
            <div className="playlist-card__cta">
              START SESSION →
            </div>
          </button>
        </div>
      </main>

      <footer className="home-footer">
        <span className="home-footer__status">SYS.READY</span>
        <span className="home-footer__version">v1.0.0</span>
      </footer>
    </div>
  )
}
