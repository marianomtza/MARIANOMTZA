import React from 'react'
import ReactDOM from 'react-dom/client'
import { AudioProvider } from './contexts/AudioContext'
import { ThemeProvider } from './contexts/ThemeContext'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AudioProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </AudioProvider>
  </React.StrictMode>
)
