import React from 'react'
import ReactDOM from 'react-dom/client'
import AppNew from './AppNew'
import { ThemeProvider } from '../../shared/theme'
import { API_URL } from './lib/config'
import './index.css'
import '../../shared/theme/tokens.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider module="kds" apiUrl={API_URL}>
      <AppNew />
    </ThemeProvider>
  </React.StrictMode>,
)


