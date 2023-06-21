import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import {HelmetProvider} from 'react-helmet-async'
import { AppStateProvider } from './contexts/AppState'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
  <AppStateProvider>
  <HelmetProvider>
    <App />
  </HelmetProvider>
  </AppStateProvider>
  </React.StrictMode>,
)
