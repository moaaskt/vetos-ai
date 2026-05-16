import React, { useState } from 'react'
import {
  CalendarDays,
  LayoutDashboard,
  LogOut,
  PawPrint,
  Users,
  ChevronLeft,
  ChevronRight,
  Menu,
  Bell,
  Sparkles,
  Building2,
  X,
  AlertTriangle,
  type LucideIcon,
} from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button } from './ui/button'

type NavItem = {
  to: string
  label: string
  icon: LucideIcon
}

const navItems: NavItem[] = [
  { to: '/dashboard', label: 'Painel', icon: LayoutDashboard },
  { to: '/clients', label: 'Clientes', icon: Users },
  { to: '/pets', label: 'Pacientes', icon: PawPrint },
  { to: '/appointments', label: 'Consultas', icon: CalendarDays },
]

const superAdminNavItems: NavItem[] = [
  { to: '/super-admin/dashboard', label: 'Métricas da Plataforma', icon: LayoutDashboard },
  { to: '/super-admin/clinics', label: 'Gerenciar Clínicas', icon: Users },
]

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, clinic, logout, exitImpersonation } = useAuth()
  const location = useLocation()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const currentNavItems = (user?.role === 'SUPERADMIN' && !user?.isImpersonating) 
    ? superAdminNavItems 
    : navItems

  const getBreadcrumb = () => {
    const path = location.pathname
    if (path.includes('super-admin/dashboard')) return 'Visão Geral da Plataforma'
    if (path.includes('super-admin/clinics')) return 'Gestão de Clínicas'
    if (path.includes('dashboard')) return 'Painel Central'
    if (path.includes('clients')) return 'Diretório de Tutores'
    if (path.includes('pets')) return 'Fichas de Pacientes'
    if (path.includes('appointments')) return 'Agenda de Consultas'
    return 'Ambiente de Trabalho'
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-teal-500/20 selection:text-teal-300">
      {/* Impersonation Premium Banner */}
      {user?.isImpersonating && (
        <div className="bg-gradient-to-r from-amber-500/20 via-red-500/20 to-amber-500/20 border-b border-amber-500/30 px-4 py-2.5 shadow-[0_0_15px_rgba(245,158,11,0.15)] text-center text-sm font-medium flex items-center justify-center gap-3 transition-all">
          <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
          <AlertTriangle className="h-4 w-4 text-amber-400" />
          <span className="text-amber-200">
            Sessão de Suporte Ativa: Acessando Unidade ID <strong className="text-white">{user.clinicId}</strong>
          </span>
          <button 
            onClick={exitImpersonation} 
            className="ml-4 inline-flex items-center gap-1.5 rounded-md bg-amber-500 px-3 py-1 text-xs font-semibold text-slate-950 hover:bg-amber-400 transition-colors shadow-sm"
          >
            Encerrar Sessão
          </button>
        </div>
      )}

      <div className="flex flex-1 flex-row min-h-0">
        {/* Desktop Collapsible Sidebar */}
        <aside 
          className={`fixed inset-y-0 left-0 z-30 hidden lg:flex flex-col border-r border-border bg-card/60 backdrop-blur-xl transition-all duration-300 ease-in-out ${
            isCollapsed ? 'w-20' : 'w-64'
          } ${user?.isImpersonating ? 'top-[41px]' : 'top-0'}`}
        >
          {/* Workspace Header */}
          <div className="flex h-16 items-center justify-between px-4 border-b border-border/60">
            <div className={`flex items-center gap-3 overflow-hidden transition-all ${isCollapsed ? 'justify-center w-full' : ''}`}>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 text-slate-950 shadow-[0_0_20px_rgba(45,212,191,0.3)] font-bold">
                <PawPrint className="h-5 w-5" />
              </div>
              {!isCollapsed && (
                <div className="flex flex-col overflow-hidden">
                  <span className="font-semibold tracking-wide text-foreground truncate text-sm">VetOS AI</span>
                  <span className="text-xs text-muted-foreground truncate flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse" />
                    {clinic?.name ?? (user?.role === 'SUPERADMIN' ? 'Administração Geral' : 'Clínica')}
                  </span>
                </div>
              )}
            </div>
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex h-7 w-7 rounded-lg hover:bg-muted items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              title={isCollapsed ? "Expandir menu" : "Recolher menu"}
            >
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 space-y-1.5 p-3 overflow-y-auto">
            {currentNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                title={isCollapsed ? item.label : undefined}
                className={({ isActive }) =>
                  [
                    'flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-all group relative',
                    isActive
                      ? 'bg-gradient-to-r from-teal-400/15 to-teal-400/5 text-teal-300 border border-teal-400/20 shadow-sm shadow-teal-500/5'
                      : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground border border-transparent',
                  ].join(' ')
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon className={`h-5 w-5 shrink-0 transition-colors ${isActive ? 'text-teal-400' : 'text-muted-foreground group-hover:text-foreground'}`} />
                    {!isCollapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                    {isActive && !isCollapsed && (
                      <span className="absolute right-3 h-1.5 w-1.5 rounded-full bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,1)]" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* User Profile Footer */}
          <div className="p-3 border-t border-border/60 bg-muted/20">
            <div className={`flex items-center gap-3 rounded-xl p-2 bg-card/80 border border-border ${isCollapsed ? 'justify-center' : ''}`}>
              <div className="h-8 w-8 rounded-lg bg-teal-400/10 border border-teal-400/20 flex items-center justify-center text-teal-400 font-semibold shrink-0 text-xs">
                {user?.email?.charAt(0).toUpperCase() ?? 'U'}
              </div>
              {!isCollapsed && (
                <div className="flex flex-col overflow-hidden text-xs flex-1">
                  <span className="font-medium text-foreground truncate">{user?.email ?? 'Usuário'}</span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    {user?.role === 'SUPERADMIN' ? 'Administrador' : 'Gestor'}
                  </span>
                </div>
              )}
            </div>
            {!isCollapsed && (
              <Button
                variant="ghost"
                onClick={logout}
                className="w-full mt-2 justify-start gap-2.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors rounded-lg text-xs h-8 px-2.5"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sair da conta</span>
              </Button>
            )}
            {isCollapsed && (
              <button
                onClick={logout}
                title="Sair da conta"
                className="w-full mt-2 flex items-center justify-center h-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={() => setIsMobileMenuOpen(false)} />
            <div className="fixed inset-y-0 left-0 w-72 bg-card border-r border-border p-6 shadow-2xl flex flex-col justify-between animate-in slide-in-from-left duration-300">
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-400 text-slate-950 font-bold shadow-md shadow-teal-500/20">
                      <PawPrint className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-bold text-foreground tracking-wide">VetOS AI</p>
                      <p className="text-xs text-muted-foreground">{clinic?.name ?? 'Clínica Operacional'}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)} className="rounded-lg">
                    <X className="h-5 w-5 text-muted-foreground" />
                  </Button>
                </div>
                <nav className="space-y-2">
                  {currentNavItems.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        [
                          'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all',
                          isActive
                            ? 'bg-teal-400/15 text-teal-300 border border-teal-400/20'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                        ].join(' ')
                      }
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </NavLink>
                  ))}
                </nav>
              </div>
              <div className="pt-4 border-t border-border space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border">
                  <div className="h-9 w-9 rounded-lg bg-teal-400/20 flex items-center justify-center text-teal-400 font-bold">
                    {user?.email?.charAt(0).toUpperCase() ?? 'U'}
                  </div>
                  <div className="overflow-hidden text-xs">
                    <p className="font-medium text-foreground truncate">{user?.email}</p>
                    <p className="text-muted-foreground uppercase text-[10px]">{user?.role === 'SUPERADMIN' ? 'Administrador' : 'Gestor'}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => { setIsMobileMenuOpen(false); logout(); }}
                  className="w-full gap-2 border-destructive/20 text-destructive hover:bg-destructive/10 font-bold"
                >
                  <LogOut className="h-4 w-4" />
                  Sair da conta
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${isCollapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
          {/* Sticky Top Navbar */}
          <header className="sticky top-0 z-20 h-16 border-b border-border bg-background/80 backdrop-blur-xl px-4 md:px-8 flex items-center justify-between transition-all">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden text-muted-foreground hover:text-foreground"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground hidden sm:inline font-medium">VetOS</span>
                <span className="text-muted-foreground hidden sm:inline">/</span>
                <span className="font-semibold text-foreground tracking-tight flex items-center gap-2">
                  {getBreadcrumb()}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Context Indicator Badge */}
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/60 border border-border text-xs font-medium text-muted-foreground shadow-inner">
                {user?.role === 'SUPERADMIN' ? (
                  <>
                    <Building2 className="h-3.5 w-3.5 text-teal-400" />
                    <span className="text-foreground font-bold">Plataforma Global</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5 text-teal-400 animate-pulse" />
                    <span className="text-foreground font-bold">{clinic?.name ?? 'Clínica Operacional'}</span>
                  </>
                )}
              </div>

              {/* Notifications Trigger */}
              <button title="Notificações do sistema" className="relative h-9 w-9 rounded-full border border-border bg-card/60 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-teal-400/40 hover:bg-muted transition-all shadow-sm">
                <Bell className="h-4 w-4" />
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-teal-400 ring-2 ring-background animate-pulse" />
              </button>

              {/* Profile Avatar Mobile Button */}
              <div className="lg:hidden h-9 w-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-slate-950 font-bold text-xs shadow-md">
                {user?.email?.charAt(0).toUpperCase() ?? 'U'}
              </div>
            </div>
          </header>

          <main className="flex-1 p-6 md:p-8 max-w-[1600px] w-full mx-auto animate-in fade-in-0 duration-500">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
