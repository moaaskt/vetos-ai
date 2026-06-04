import { Navigate, Outlet, RouterProvider, createBrowserRouter } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { Layout } from './components/Layout'
import { Appointments } from './pages/Appointments'
import { Clients } from './pages/Clients'
import { Dashboard } from './pages/Dashboard'
import { Login } from './pages/Login'
import { Pets } from './pages/Pets'
import { PetDetails } from './pages/PetDetails'
import { Register } from './pages/Register'
import { SuperAdminDashboard } from './pages/super-admin/SuperAdminDashboard'
import { SuperAdminClinics } from './pages/super-admin/SuperAdminClinics'
import { MessagingPage } from './pages/messaging/MessagingPage'

function defaultAuthenticatedRoute(role?: string) {
  return role === 'SUPERADMIN' ? '/super-admin/dashboard' : '/dashboard'
}

function SuperAdminRoute() {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated || user?.role !== 'SUPERADMIN') {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  )
}

function ProtectedRoute() {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (user?.role === 'SUPERADMIN' && !user.isImpersonating) {
    return <Navigate to="/super-admin/dashboard" replace />
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  )
}

function PublicOnlyRoute() {
  const { isAuthenticated, user } = useAuth()

  if (isAuthenticated) {
    return <Navigate to={defaultAuthenticatedRoute(user?.role)} replace />
  }

  return <Outlet />
}

function RootRedirect() {
  const { user } = useAuth()
  return <Navigate to={defaultAuthenticatedRoute(user?.role)} replace />
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
      { path: '/', element: <RootRedirect /> },
      { path: '/dashboard', element: <Dashboard /> },
      { path: '/clients', element: <Clients /> },
      { path: '/pets', element: <Pets /> },
      { path: '/pets/:id', element: <PetDetails /> },
      { path: '/appointments', element: <Appointments /> },
      { path: '/settings/messaging', element: <MessagingPage /> },
    ],
  },
  {
    element: <SuperAdminRoute />,
    children: [
      { path: '/super-admin/dashboard', element: <SuperAdminDashboard /> },
      { path: '/super-admin/clinics', element: <SuperAdminClinics /> },
    ],
  },
  { path: '*', element: <RootRedirect /> },
])

import { ThemeProvider } from './context/ThemeContext'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ThemeProvider>
  )
}

