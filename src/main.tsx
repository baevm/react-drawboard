import React from 'react'
import ReactDOM from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { IconContext } from 'react-icons'
import App from './App'
import './index.css'

const helmetContext = {}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <HelmetProvider context={helmetContext}>
      <IconContext.Provider value={{ color: 'var(--icon-color)', size: '20' }}>
        <App />
      </IconContext.Provider>
    </HelmetProvider>
  </React.StrictMode>
)
