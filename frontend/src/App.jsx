import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './components/Navbar'
import { Toaster } from 'react-hot-toast'
import AnimatedBackground from './components/AnimatedBackground'
import { ThemeProvider } from './context/ThemeContext'
import { LanguageProvider } from './context/LanguageContext'

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <div className="App">
          <AnimatedBackground />
          <Toaster
            position="bottom-right"
            toastOptions={{
              success: {
                duration: 3000,
              },
              error: {
                duration: 5000,
              },
            }}
          />

          <Navbar />
          <div className="page-container">
            <Outlet />
          </div>
        </div>
      </LanguageProvider>
    </ThemeProvider>
  )
}

export default App