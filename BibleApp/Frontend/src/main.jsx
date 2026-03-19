import * as Sentry from '@sentry/react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import './styles/global.css'
import './styles/animations.css'
import './styles/App.css'
import App from './App.jsx'
// Quill CSS imports
import 'quill/dist/quill.snow.css'

Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,        // 'development' | 'production'
    enabled: import.meta.env.PROD,            // Solo activo en builds de producción
    tracesSampleRate: 0.1,                    // 10% de transacciones para performance
    replaysOnErrorSampleRate: 1.0,            // 100% de errores con replay de sesión
    integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration(),
    ],
});


createRoot(document.getElementById('root')).render(
    <StrictMode>
        <App />
    </StrictMode>,
)
