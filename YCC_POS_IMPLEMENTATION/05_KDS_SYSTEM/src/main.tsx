import React from 'react'
import ReactDOM from 'react-dom/client'
import AppNew from './AppNew'
import { UnifiedThemeProvider } from '../../shared/theme/UnifiedThemeProvider'
import { ThemeProvider } from './components/ThemeProvider'
import './index.css'
import { applyGlobalUiConfig } from './appearance/globalUi'

applyGlobalUiConfig()
window.addEventListener('storage', (e) => {
  if (e.key === 'ycc-ui-config') applyGlobalUiConfig()
})
window.addEventListener('ycc-ui-config-change' as any, applyGlobalUiConfig as any)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <UnifiedThemeProvider module="kds" enableSync={true}>
      <ThemeProvider>
        <AppNew />
      </ThemeProvider>
    </UnifiedThemeProvider>
  </React.StrictMode>,
)


