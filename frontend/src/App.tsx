import { Navigate, Outlet, RouterProvider, createBrowserRouter } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { TutorAuthProvider, useTutorAuth } from './context/TutorAuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { Layout } from './components/Layout'
import { lazy, Suspense } from 'react'
import { RouteLoader } from './components/tutor/RouteLoader'
import { AdminRouteLoader } from './components/AdminRouteLoader'

// ─── Lazy-loaded Admin Pages ──────────────────────────────────────────────────
const Login = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })))
const Register = lazy(() => import('./pages/Register').then(m => ({ default: m.Register })))
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })))
const Clients = lazy(() => import('./pages/Clients').then(m => ({ default: m.Clients })))
const Pets = lazy(() => import('./pages/Pets').then(m => ({ default: m.Pets })))
const PetDetails = lazy(() => import('./pages/PetDetails').then(m => ({ default: m.PetDetails })))
const Appointments = lazy(() => import('./pages/Appointments').then(m => ({ default: m.Appointments })))
const Analytics = lazy(() => import('./pages/Analytics').then(m => ({ default: m.Analytics })))
const SettingsPage = lazy(() => import('./pages/settings/SettingsPage').then(m => ({ default: m.SettingsPage })))
const VaccineProtocolsPage = lazy(() => import('./pages/settings/VaccineProtocolsPage').then(m => ({ default: m.VaccineProtocolsPage })))
const MessagingHubPage = lazy(() => import('./pages/messaging/MessagingHubPage').then(m => ({ default: m.MessagingHubPage })))
const SmtpSettingsPage = lazy(() => import('./pages/messaging/SmtpSettingsPage').then(m => ({ default: m.SmtpSettingsPage })))
const WhatsappSettingsPage = lazy(() => import('./pages/messaging/WhatsappSettingsPage').then(m => ({ default: m.WhatsappSettingsPage })))
const NotificationTemplatesPage = lazy(() => import('./pages/messaging/NotificationTemplatesPage').then(m => ({ default: m.NotificationTemplatesPage })))
const NotificationLogsPage = lazy(() => import('./pages/messaging/NotificationLogsPage').then(m => ({ default: m.NotificationLogsPage })))
const SuperAdminDashboard = lazy(() => import('./pages/super-admin/SuperAdminDashboard').then(m => ({ default: m.SuperAdminDashboard })))
const SuperAdminClinics = lazy(() => import('./pages/super-admin/SuperAdminClinics').then(m => ({ default: m.SuperAdminClinics })))
const PublicDocumentView = lazy(() => import('./pages/PublicDocumentView').then(m => ({ default: m.PublicDocumentView })))

// ─── Lazy-loaded Tutor Pages ──────────────────────────────────────────────────
const TutorLogin = lazy(() => import('./pages/tutor/TutorLogin').then(m => ({ default: m.TutorLogin })))
const TutorVerify = lazy(() => import('./pages/tutor/TutorVerify').then(m => ({ default: m.TutorVerify })))
const TutorDashboard = lazy(() => import('./pages/tutor/TutorDashboard').then(m => ({ default: m.TutorDashboard })))
const TutorPetDetails = lazy(() => import('./pages/tutor/TutorPetDetails').then(m => ({ default: m.TutorPetDetails })))


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
      <Suspense fallback={<AdminRouteLoader />}>
        <Outlet />
      </Suspense>
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
      <Suspense fallback={<AdminRouteLoader />}>
        <Outlet />
      </Suspense>
    </Layout>
  )
}

function PublicOnlyRoute() {
  const { isAuthenticated, user } = useAuth()

  if (isAuthenticated) {
    return <Navigate to={defaultAuthenticatedRoute(user?.role)} replace />
  }

  return (
    <Suspense fallback={<AdminRouteLoader />}>
      <Outlet />
    </Suspense>
  )
}

function RootRedirect() {
  const { user } = useAuth()
  return <Navigate to={defaultAuthenticatedRoute(user?.role)} replace />
}

function TutorPlatformLayout() {
  return (
    <TutorAuthProvider>
      <Suspense fallback={<RouteLoader />}>
        <Outlet />
      </Suspense>
    </TutorAuthProvider>
  )
}

function TutorProtectedRoute() {
  const { isAuthenticated, isLoading } = useTutorAuth()
  
  if (isLoading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Carregando...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/tutor/login" replace />
  }

  return <Outlet />
}

function TutorPublicRoute() {
  const { isAuthenticated, isLoading } = useTutorAuth()

  if (isLoading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Carregando...</div>
  }

  if (isAuthenticated) {
    return <Navigate to="/tutor" replace />
  }

  return <Outlet />
}

const router = createBrowserRouter([
  // Tutor Platform Routes
  {
    element: <TutorPlatformLayout />,
    children: [
      {
        element: <TutorPublicRoute />,
        children: [
          { path: '/tutor/login', element: <TutorLogin /> },
          { path: '/tutor/auth/verify', element: <TutorVerify /> },
        ],
      },
      {
        element: <TutorProtectedRoute />,
        children: [
          { path: '/tutor', element: <TutorDashboard /> },
          { path: '/tutor/pets/:id', element: <TutorPetDetails /> },
        ],
      },
    ],
  },
  
  // Admin Routes
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
      { path: '/analytics', element: <Analytics /> },
      { path: '/settings', element: <SettingsPage /> },
      { path: '/settings/vaccines', element: <VaccineProtocolsPage /> },
      { path: '/settings/messaging', element: <MessagingHubPage /> },
      { path: '/settings/messaging/smtp', element: <SmtpSettingsPage /> },
      { path: '/settings/messaging/whatsapp', element: <WhatsappSettingsPage /> },
      { path: '/settings/messaging/templates', element: <NotificationTemplatesPage /> },
      { path: '/settings/messaging/logs', element: <NotificationLogsPage /> },
    ],
  },
  {
    element: <SuperAdminRoute />,
    children: [
      { path: '/super-admin/dashboard', element: <SuperAdminDashboard /> },
      { path: '/super-admin/clinics', element: <SuperAdminClinics /> },
    ],
  },
  {
    path: '/documento/:hash',
    element: (
      <Suspense fallback={<AdminRouteLoader />}>
        <PublicDocumentView />
      </Suspense>
    ),
  },
  { path: '*', element: <RootRedirect /> },
])

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ThemeProvider>
  )
}
