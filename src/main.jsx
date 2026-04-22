import React from 'react'
import ReactDOM from 'react-dom/client'
import { AudioProvider } from './contexts/AudioContext'
import { MotionProvider } from './contexts/MotionContext'
import { ThemeProvider } from './contexts/ThemeContext'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AudioProvider>
      <MotionProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </MotionProvider>
    </AudioProvider>
  </React.StrictMode>
)
