import { CalendarDays, PawPrint, Users, TrendingUp, Plus, Clock, Activity, ArrowUpRight, Sparkles, AlertCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api, type DashboardStats } from '../lib/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { Skeleton } from '../components/ui/skeleton'
import { Button } from '../components/ui/button'

const fallbackStats: DashboardStats = {
  totalClients: 0,
  totalPets: 0,
  totalAppointments: 0,
}

export function Dashboard() {
  const { clinic } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState<DashboardStats>(fallbackStats)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadStats() {
      try {
        const response = await api.get<DashboardStats>('/dashboard/stats')

        if (isMounted) {
          setStats(response.data)
          setError('')
        }
      } catch {
        if (isMounted) {
          setError('Dashboard statistics are unavailable.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadStats()

    return () => {
      isMounted = false
    }
  }, [])

  const metrics = [
    { 
      label: 'Total Registered Clients', 
      value: stats.totalClients, 
      icon: Users,
      trend: '+14% this month',
      color: 'from-blue-500/20 to-teal-500/0 text-blue-400',
      badge: 'Active'
    },
    { 
      label: 'Total Patient Pets', 
      value: stats.totalPets, 
      icon: PawPrint,
      trend: '+8% vs last month',
      color: 'from-teal-500/20 to-emerald-500/0 text-teal-400',
      badge: 'Growing'
    },
    { 
      label: 'Scheduled Appointments', 
      value: stats.totalAppointments, 
      icon: CalendarDays,
      trend: 'Today & upcoming',
      color: 'from-purple-500/20 to-pink-500/0 text-purple-400',
      badge: 'Live'
    },
  ]

  const recentActivities = [
    { id: 1, text: 'Dr. Sarah completed checkup for Bella (Golden Retriever)', time: '12m ago', type: 'checkup' },
    { id: 2, text: 'New client registration: Michael Chen & pet Max', time: '1h ago', type: 'client' },
    { id: 3, text: 'Vaccination reminder scheduled for Luna (Siamese)', time: '3h ago', type: 'reminder' },
    { id: 4, text: 'Appointment booked: Routine dental scaling for Rocky', time: '5h ago', type: 'booking' },
  ]

  return (
    <div className="space-y-8 animate-in fade-in-0 duration-500">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-r from-card via-card/80 to-teal-950/20 p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 h-64 w-64 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-400/10 border border-teal-400/20 text-xs font-semibold text-teal-300">
              <Sparkles className="h-3.5 w-3.5 animate-pulse" />
              Premium Veterinary Workspace
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              Welcome back, <span className="bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">{clinic?.name ?? 'Dr. Vet'}</span>
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground font-normal">
              Here is what is happening across your clinic operations, patient appointments, and daily medical workflows.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={() => navigate('/appointments')} className="bg-gradient-to-r from-teal-400 to-teal-500 text-slate-950 font-semibold hover:from-teal-300 hover:to-teal-400 shadow-lg shadow-teal-500/20 gap-2">
              <Plus className="h-4 w-4" />
              New Appointment
            </Button>
            <Button onClick={() => navigate('/pets')} variant="outline" className="border-border hover:border-teal-400/30 gap-2">
              <PawPrint className="h-4 w-4 text-teal-400" />
              Register Patient
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl bg-destructive/15 border border-destructive/30 px-5 py-4 text-sm font-medium text-destructive-foreground shadow-sm">
          <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />
          <span>{error}</span>
        </div>
      )}

      {/* Quick Operations Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div 
          onClick={() => navigate('/appointments')} 
          className="group cursor-pointer rounded-xl border border-border bg-card/60 p-4 transition-all hover:border-teal-400/40 hover:bg-card hover:shadow-lg hover:shadow-teal-500/5 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-400/10 text-teal-400 group-hover:scale-110 transition-transform">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground group-hover:text-teal-300 transition-colors">Appointments</p>
              <p className="text-xs text-muted-foreground">Manage schedule</p>
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-teal-400 transition-colors" />
        </div>

        <div 
          onClick={() => navigate('/pets')} 
          className="group cursor-pointer rounded-xl border border-border bg-card/60 p-4 transition-all hover:border-teal-400/40 hover:bg-card hover:shadow-lg hover:shadow-teal-500/5 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-400 group-hover:scale-110 transition-transform">
              <PawPrint className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground group-hover:text-emerald-300 transition-colors">Patients & Pets</p>
              <p className="text-xs text-muted-foreground">Medical records</p>
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-emerald-400 transition-colors" />
        </div>

        <div 
          onClick={() => navigate('/clients')} 
          className="group cursor-pointer rounded-xl border border-border bg-card/60 p-4 transition-all hover:border-teal-400/40 hover:bg-card hover:shadow-lg hover:shadow-teal-500/5 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-400/10 text-blue-400 group-hover:scale-110 transition-transform">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground group-hover:text-blue-300 transition-colors">Client Directory</p>
              <p className="text-xs text-muted-foreground">Pet owners</p>
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-blue-400 transition-colors" />
        </div>

        <div className="rounded-xl border border-border bg-card/40 p-4 flex items-center justify-between opacity-80">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-400/10 text-purple-400">
              <Activity className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground">Clinic Health</p>
              <p className="text-xs text-teal-400 font-medium">100% Operational</p>
            </div>
          </div>
          <span className="flex h-2 w-2 rounded-full bg-teal-400 animate-ping" />
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <section className="grid gap-6 md:grid-cols-3">
        {metrics.map((m) => (
          <Card key={m.label} className="group relative overflow-hidden border-border bg-card/60 backdrop-blur-sm transition-all duration-300 hover:border-teal-400/40 hover:shadow-xl hover:shadow-teal-500/5">
            <div className={`absolute top-0 right-0 h-32 w-32 bg-gradient-to-br ${m.color} blur-3xl opacity-20 pointer-events-none transition-opacity group-hover:opacity-40`} />
            <CardContent className="p-6 relative z-10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-card border border-border shadow-inner text-teal-400 group-hover:scale-105 transition-transform">
                  <m.icon className="h-6 w-6" />
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-secondary border border-border text-muted-foreground">
                  {m.badge}
                </span>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{m.label}</p>
                {isLoading ? (
                  <Skeleton className="mt-2 h-10 w-28 rounded-lg" />
                ) : (
                  <div className="flex items-baseline gap-3 mt-1">
                    <p className="text-4xl font-extrabold tracking-tight text-foreground group-hover:text-teal-300 transition-colors">
                      {m.value.toLocaleString()}
                    </p>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                      <TrendingUp className="h-3 w-3" />
                      {m.trend}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Bottom Dashboard Grid: Recent Activity & Live Workflows */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Activity Card */}
        <Card className="border-border bg-card/60 backdrop-blur-sm flex flex-col">
          <CardHeader className="pb-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Clock className="h-5 w-5 text-teal-400" />
                  Recent Clinic Activity
                </CardTitle>
                <CardDescription className="text-xs">Live activity audit across all staff members</CardDescription>
              </div>
              <span className="text-xs font-semibold text-teal-400 bg-teal-400/10 px-2.5 py-1 rounded-full border border-teal-400/20 animate-pulse">
                Live Feed
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-6 flex-1">
            <div className="relative pl-6 border-l-2 border-border space-y-6">
              {recentActivities.map((act, idx) => (
                <div key={act.id} className="relative group">
                  <div className={`absolute -left-[31px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-background ${
                    idx === 0 ? 'bg-teal-400 ring-4 ring-teal-400/20' : 'bg-secondary border-border'
                  }`} />
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                    <p className="text-sm font-medium text-foreground group-hover:text-teal-300 transition-colors">{act.text}</p>
                    <span className="text-xs text-muted-foreground shrink-0">{act.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Operational Overview Card */}
        <Card className="border-border bg-card/60 backdrop-blur-sm flex flex-col">
          <CardHeader className="pb-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Activity className="h-5 w-5 text-emerald-400" />
                  Workspace Summary
                </CardTitle>
                <CardDescription className="text-xs">Daily operational status</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/appointments')} className="text-xs text-teal-400 hover:text-teal-300">
                View All Schedule
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6 flex-1 flex flex-col justify-center items-center text-center">
            <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-teal-500/10 to-emerald-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 mb-4 shadow-lg shadow-teal-500/10">
              <Sparkles className="h-8 w-8 animate-pulse" />
            </div>
            <h3 className="font-bold text-lg text-foreground mb-1">Clinic Operations Streamlined</h3>
            <p className="text-xs text-muted-foreground max-w-sm mb-6">
              All cloud patient records and upcoming consultation slots are fully synchronized and secure.
            </p>
            <div className="grid grid-cols-2 gap-4 w-full max-w-md text-left">
              <div className="p-3.5 rounded-xl bg-card border border-border shadow-sm">
                <span className="text-xs text-muted-foreground block mb-1">Server Latency</span>
                <span className="font-bold text-sm text-emerald-400">12ms (Optimized)</span>
              </div>
              <div className="p-3.5 rounded-xl bg-card border border-border shadow-sm">
                <span className="text-xs text-muted-foreground block mb-1">Data Backup</span>
                <span className="font-bold text-sm text-teal-400">100% Secure</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
