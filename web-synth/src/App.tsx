import { useState } from 'react'
import { HomePage } from './components/HomePage'
import { Synth } from './components/Synth'

type View = 'home' | 'synth'

function App() {
  const [currentView, setCurrentView] = useState<View>('home')

  const handleSelectInstrument = (id: string) => {
    if (id === 'synth') {
      setCurrentView('synth')
    }
    // Future instruments will be added here
  }

  const handleStartPlaylist = () => {
    // Placeholder - will implement playlist feature later
    console.log('Playlist feature coming soon!')
  }

  const handleBack = () => {
    setCurrentView('home')
  }

  if (currentView === 'synth') {
    return <Synth onBack={handleBack} />
  }

  return (
    <HomePage
      onSelectInstrument={handleSelectInstrument}
      onStartPlaylist={handleStartPlaylist}
    />
  )
}

export default App
