import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import './styles/global.css'
import './styles/App.css'
import App from './App.jsx'
// Quill CSS imports
import 'quill/dist/quill.snow.css'

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <App />
    </StrictMode>,
)
