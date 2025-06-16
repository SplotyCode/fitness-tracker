import React from 'react'
import ReactDOM from 'react-dom/client'
import WeightTracker from './components/WeightTracker'
import './index.css'

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error("Root element with id 'root' not found");

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <WeightTracker />
  </React.StrictMode>,
) 