import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'
import { UnifiedThemeProvider } from '../../shared/theme/UnifiedThemeProvider'
import { ThemeProvider } from './components/ThemeProvider'
import { applyGlobalUiConfig } from './appearance/globalUi'
import './index.css'

applyGlobalUiConfig()
window.addEventListener('storage', (e) => {
  if (e.key === 'ycc-ui-config') applyGlobalUiConfig()
})
window.addEventListener('ycc-ui-config-change' as any, applyGlobalUiConfig as any)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <UnifiedThemeProvider module="pos" enableSync={true}>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </UnifiedThemeProvider>
  </React.StrictMode>,
)
