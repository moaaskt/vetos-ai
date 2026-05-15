import { Navigate, Outlet, RouterProvider, createBrowserRouter } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { Layout } from './components/Layout'
import { Appointments } from './pages/Appointments'
import { Clients } from './pages/Clients'
import { Dashboard } from './pages/Dashboard'
import { Login } from './pages/Login'
import { Pets } from './pages/Pets'
import { Register } from './pages/Register'

function ProtectedRoute() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  )
}

function PublicOnlyRoute() {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}

const router = createBrowserRouter([
  {
    element: <PublicOnlyRoute />,
    children: [
      { path: '/login', element: <Login /> },
      { path: '/register', element: <Register /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      { path: '/', element: <Navigate to="/dashboard" replace /> },
      { path: '/dashboard', element: <Dashboard /> },
      { path: '/clients', element: <Clients /> },
      { path: '/pets', element: <Pets /> },
      { path: '/appointments', element: <Appointments /> },
    ],
  },
  { path: '*', element: <Navigate to="/dashboard" replace /> },
])

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}
