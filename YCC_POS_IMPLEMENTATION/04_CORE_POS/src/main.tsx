import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'
import { ThemeProvider } from '../../shared/theme'
import { API_URL } from './lib/apiClient'
import './index.css'
import '../../shared/theme/tokens.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider module="pos" apiUrl={API_URL}>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
)
