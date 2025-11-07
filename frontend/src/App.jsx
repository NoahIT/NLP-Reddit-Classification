import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './components/Navbar'

// This is the main "shell" of our application
function App() {
  return (
    <div className="App">
      <Navbar />
      <div className="page-container">
        {/* The Outlet renders the current page (e.g., DashboardPage) */}
        <Outlet />
      </div>
    </div>
  )
}

export default App