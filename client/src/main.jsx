import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// grab the <div id="root"> from index.html
const root = createRoot(document.getElementById('root'))

// render our App component inside it
// StrictMode is a dev tool — highlights potential problems, no effect in production
root.render(
  <StrictMode>
    <App />
  </StrictMode>
)
