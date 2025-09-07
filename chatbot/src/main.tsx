import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Analytics } from "@vercel/analytics/react"
import App from './app.tsx'
import { GlobalProvider } from './utils/global_context.tsx'
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary'
import DisplayError from './components/display_error.tsx'

const ErrorBoundary = (ReactErrorBoundary as unknown) as import('react').ComponentType<any>;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary FallbackComponent={DisplayError}>
      <GlobalProvider>
        <App />
        <Analytics />
      </GlobalProvider>
    </ErrorBoundary>
  </StrictMode >,
)

