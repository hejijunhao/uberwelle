import { useState, useEffect } from 'react'
import { InstrumentCard } from './InstrumentCard'
import { CompactSynth } from './CompactSynth'
import './HomePage.css'

interface HomePageProps {
  onSelectInstrument: (id: string) => void
  onStartPlaylist: () => void
  activeInstrument: string | null
  onCloseInstrument: () => void
  onExpandInstrument: () => void
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

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

export function HomePage({
  onSelectInstrument,
  onStartPlaylist,
  activeInstrument,
  onCloseInstrument,
  onExpandInstrument,
}: HomePageProps) {
  const [currentTime, setCurrentTime] = useState(() => formatTime(new Date()))

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(formatTime(new Date()))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="home-page">
      <header className="home-header">
        <div className="home-header__inner">
          <div className="home-header__brand">
            <img
              src="/Main Icon small.png"
              alt="Motherboard Instruments"
              className="home-header__logo"
            />
            <div className="home-header__text">
              <span className="home-header__label">SYS.AUDIO</span>
              <h1 className="home-header__title">MOTHERBOARD INSTRUMENTS</h1>
            </div>
          </div>
          <div className="home-header__tagline">
            Programmed instruments for the modern era
          </div>
        </div>
      </header>

      <main className="home-main">
        {activeInstrument === 'synth' ? (
          <div className="active-instrument">
            <CompactSynth
              onClose={onCloseInstrument}
              onFullscreen={onExpandInstrument}
            />
          </div>
        ) : (
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
        )}
      </main>

      <footer className="home-footer">
        <div className="home-footer__inner">
          <div className="home-footer__left">
            <span className="home-footer__status">
              <span className="status-light" />
              SYS.ONLINE
            </span>
            <span className="home-footer__divider" />
            <span className="home-footer__coord">1.3521°N 103.8198°E</span>
          </div>
          <div className="home-footer__right">
            <span className="home-footer__time">{currentTime} SGT</span>
            <span className="home-footer__divider" />
            <span className="home-footer__version">v1.1.0</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
