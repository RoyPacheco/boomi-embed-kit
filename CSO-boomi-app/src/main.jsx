import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
// ?raw bypasses Vite's PostCSS pipeline (avoids the "@layer base without @tailwind base"
// error), then we inject the stylesheet manually before the React tree mounts.
import embedkitCss from '@boomi-demo/embedkit-cdn/embedkit-cdn.css?raw'
import App from './App.jsx'
import { AuthProvider } from './state/authContext.jsx'

const _boomiStyle = document.createElement('style')
_boomiStyle.id = 'boomi-embedkit-styles'
_boomiStyle.textContent = embedkitCss
document.head.appendChild(_boomiStyle)

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
)
