import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AudioProvider } from './audio/AudioProvider'
import { App } from './app/App'
import './styles/global.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode><AudioProvider><App /></AudioProvider></StrictMode>,
)
