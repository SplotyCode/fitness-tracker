import React from 'react'
import ReactDOM from 'react-dom/client'
import WeightTracker from './components/WeightTracker'
import './index.css' // We'll create this file next

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WeightTracker />
  </React.StrictMode>,
) 