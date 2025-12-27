import { useState } from 'react'
import { HomePage } from './components/HomePage'
import { Synth } from './components/Synth'

type View = 'home' | 'synth-inline' | 'synth-fullscreen'

function App() {
  const [currentView, setCurrentView] = useState<View>('home')

  const handleSelectInstrument = (id: string) => {
    if (id === 'synth') {
      setCurrentView('synth-inline')
    }
    // Future instruments will be added here
  }

  const handleCloseSynth = () => {
    setCurrentView('home')
  }

  const handleExpandSynth = () => {
    setCurrentView('synth-fullscreen')
  }

  const handleBack = () => {
    setCurrentView('home')
  }

  if (currentView === 'synth-fullscreen') {
    return <Synth onBack={handleBack} />
  }

  return (
    <HomePage
      onSelectInstrument={handleSelectInstrument}
      activeInstrument={currentView === 'synth-inline' ? 'synth' : null}
      onCloseInstrument={handleCloseSynth}
      onExpandInstrument={handleExpandSynth}
    />
  )
}

export default App
