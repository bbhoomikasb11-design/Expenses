import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { SplitGridProvider } from './context/SplitGridContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SplitGridProvider>
      <App />
    </SplitGridProvider>
  </React.StrictMode>,
)
