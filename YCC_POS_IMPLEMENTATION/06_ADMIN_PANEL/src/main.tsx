import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'
import { applyGlobalUiCssVariables, readGlobalUiConfig } from './appearance/globalUi'
import { UnifiedThemeProvider } from '../../shared/theme/UnifiedThemeProvider'
import './index.css'

applyGlobalUiCssVariables(readGlobalUiConfig())
window.addEventListener('storage', (e) => {
  if (e.key === 'ycc-ui-config') applyGlobalUiCssVariables(readGlobalUiConfig())
})
window.addEventListener('ycc-ui-config-change' as any, () => applyGlobalUiCssVariables(readGlobalUiConfig()))

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <UnifiedThemeProvider module="admin" enableSync={true}>
      <App />
    </UnifiedThemeProvider>
  </React.StrictMode>,
)
