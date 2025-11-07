import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

// --- THIS IS THE FIX (PART 1) ---
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';

import App from './App.jsx'
import './index.css'
import 'ag-grid-community/styles/ag-grid.css'; // Core grid CSS
import 'ag-grid-community/styles/ag-theme-quartz.css'; // New Theme

// Import our page components
import DashboardPage from './pages/DashboardPage.jsx'
import TablePage from './pages/TablePage.jsx'
import DataToolsPage from './pages/DataToolsPage.jsx'

// --- THIS IS THE FIX (PART 2) ---
// Register all the Community features (sorting, filtering, etc.)
ModuleRegistry.registerModules([ AllCommunityModule ]);

// This sets up our multi-page navigation
const router = createBrowserRouter([
  {
    path: '/',
    element: <App />, 
    children: [
      { path: '/', element: <DashboardPage /> },
      { path: '/table', element: <TablePage /> },
      { path: '/tools', element: <DataToolsPage /> },
    ],
  },
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)