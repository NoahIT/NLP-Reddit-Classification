import React from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useLanguage } from '../context/LanguageContext'
import { useTranslation } from '../i18n/translations'
import './Navbar.css' // We will create this CSS file next

function Navbar() {
  const { theme, toggleTheme } = useTheme()
  const { language, toggleLanguage } = useLanguage()
  const t = useTranslation(language)

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          {t('appTitle')}
        </Link>
        <ul className="nav-menu">
          <li className="nav-item">
            <Link to="/" className="nav-link">
              {t('dashboard')}
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/table" className="nav-link">
              {t('dataTable')}
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/comparison" className="nav-link">
              {t('comparison')}
            </Link>
          </li>
          <li className="nav-item">
            <div className="toggle-buttons">
              <button onClick={toggleTheme} className="toggle-btn theme-toggle" aria-label="Toggle Theme">
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>
              <button onClick={toggleLanguage} className="toggle-btn language-toggle" aria-label="Toggle Language">
                {language === 'en' ? 'LT' : 'EN'}
              </button>
            </div>
          </li>
        </ul>
      </div>
    </nav>
  )
}

export default Navbar