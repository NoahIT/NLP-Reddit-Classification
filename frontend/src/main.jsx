import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import App from './App.jsx'
import './index.css'

// Import our page components
import DashboardPage from './pages/DashboardPage.jsx'
import TablePage from './pages/TablePage.jsx'
import ComparisonPage from './pages/ComparisonPage.jsx'

// This sets up our multi-page navigation
const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { path: '/', element: <DashboardPage /> },
      { path: '/table', element: <TablePage /> },
      { path: '/comparison', element: <ComparisonPage /> },
    ],
  },
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)