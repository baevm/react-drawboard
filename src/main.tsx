import React from 'react'
import ReactDOM from 'react-dom/client'
import { IconContext } from 'react-icons'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <IconContext.Provider value={{ color: '#707579', size: '20' }}>
      <App />
    </IconContext.Provider>
  </React.StrictMode>
)
