import { useState } from 'react'
import './App.css'
import ModeSelector from './components/ModeSelector'
import GuessMode from './components/GuessMode'
import AssignMode from './components/AssignMode'

function App() {
  const [mode, setMode] = useState(null)

  const handleBackToMenu = () => {
    setMode(null)
  }

  return (
    <div className="app-container">
      {mode === null && <ModeSelector onSelectMode={setMode} />}
      {mode === 'guess' && <GuessMode onBack={handleBackToMenu} />}
      {mode === 'assign' && <AssignMode onBack={handleBackToMenu} />}
    </div>
  )
}

export default App
