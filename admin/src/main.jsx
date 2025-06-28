import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import App from './App.jsx'
import Ongoing from './pages/Ongoing/Ongoing.jsx'
import Completed from './pages/Completed/Completed.jsx'
import Ship_Settings from './pages/Ship Settings/Ship_Settings.jsx'
import Login from './pages/Login/Login.jsx'

const router = createBrowserRouter([
  {  // Main Paths
    path: '/dashboard',
    element: <App />,
    children: [
      {
        path: '/dashboard/ongoing',
        element: <Ongoing />,
      },
      {
        path: '/dashboard/completed',
        element: <Completed />,
      },
      {
        path: '/dashboard/ship-settings',
        element: <Ship_Settings />,
      },
    ],
  },
  {
    path: '/login',
    element: <Login />
  },
  {  // Redirects
    path: '/',
    element: <Navigate to="/dashboard/ongoing" replace />
  },
  {
    path: '/dashboard',
    element: <Navigate to="/dashboard/ongoing" replace />
  },
  {
    path: '/ongoing',
    element: <Navigate to="/dashboard/ongoing" replace />
  },
  {
    path: '/completed',
    element: <Navigate to="/dashboard/completed" replace />
  },
  {
    path: '/ship-settings',
    element: <Navigate to="/dashboard/ship-settings" replace />
  },
]
)

createRoot(document.getElementById('root')).render(
  <RouterProvider router={router} />
)
