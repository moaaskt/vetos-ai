import {
  CalendarDays,
  LayoutDashboard,
  LogOut,
  PawPrint,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

type NavItem = {
  to: string
  label: string
  icon: LucideIcon
}

const navItems: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/clients', label: 'Clients', icon: Users },
  { to: '/pets', label: 'Pets', icon: PawPrint },
  { to: '/appointments', label: 'Appointments', icon: CalendarDays },
]

const superAdminNavItems: NavItem[] = [
  { to: '/super-admin/dashboard', label: 'Platform Stats', icon: LayoutDashboard },
  { to: '/super-admin/clinics', label: 'Manage Clinics', icon: Users },
]

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, clinic, logout, exitImpersonation } = useAuth()
  
  const currentNavItems = (user?.role === 'SUPERADMIN' && !user?.isImpersonating) 
    ? superAdminNavItems 
    : navItems

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-border bg-background/95 px-5 py-6 lg:block">
        <div className="mb-10">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal-400 text-slate-950">
              <PawPrint className="h-6 w-6" />
            </div>
            <div>
              <p className="text-lg font-semibold tracking-wide">VetOS AI</p>
              <p className="text-sm text-slate-400">{clinic?.name ?? 'Clinic workspace'}</p>
            </div>
          </div>
        </div>

        <nav className="space-y-2">
          {currentNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition',
                  isActive
                    ? 'bg-white text-slate-950'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white',
                ].join(' ')
              }
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="lg:pl-72">
        {user?.isImpersonating && (
          <div className="bg-red-500 text-white p-2 text-center text-sm font-medium">
            Impersonating Clinic (ID: {user.clinicId}) 
            <button onClick={exitImpersonation} className="underline font-bold ml-2">
              Exit Impersonation
            </button>
          </div>
        )}
        <header className="sticky top-0 z-20 border-b border-border bg-background/85 px-4 py-4 backdrop-blur md:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-slate-400">Admin dashboard</p>
              <p className="font-medium">{user?.email ?? 'Signed in'}</p>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:hidden">
              {currentNavItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  aria-label={item.label}
                  title={item.label}
                  className={({ isActive }) =>
                    [
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition',
                      isActive
                        ? 'bg-white text-slate-950'
                        : 'bg-white/10 text-slate-200 hover:bg-white/15',
                    ].join(' ')
                  }
                >
                  <item.icon className="h-5 w-5" />
                </NavLink>
              ))}
            </div>
            <button
              type="button"
              onClick={logout}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-white/10 px-4 text-sm font-medium text-slate-200 transition hover:bg-white/10"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </header>

        <main className="px-4 py-8 md:px-8">{children}</main>
      </div>
    </div>
  )
}
