import React from 'react'
import { Link } from 'react-router-dom'
import './Navbar.css' // We will create this CSS file next

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          RedditSentiment
        </Link>
        <ul className="nav-menu">
          <li className="nav-item">
            <Link to="/" className="nav-link">
              Dashboard
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/table" className="nav-link">
              Data Table
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/tools" className="nav-link">
              Data Tools
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  )
}

export default Navbar