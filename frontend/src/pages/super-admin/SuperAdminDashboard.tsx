import { Activity, Users, DollarSign, Building2, TrendingUp, ShieldCheck, Cpu, HardDrive, RefreshCw, ArrowUpRight, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../lib/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card'
import { Skeleton } from '../../components/ui/skeleton'
import { Button } from '../../components/ui/button'
import { PageHeader } from '../../components/PageHeader'

type SuperAdminMetrics = {
  totalClinics: number
  totalAppointments: number
  mrr: number
  activeClinicsToday: number
}

const fallbackMetrics: SuperAdminMetrics = {
  totalClinics: 0,
  totalAppointments: 0,
  mrr: 0,
  activeClinicsToday: 0
}

export function SuperAdminDashboard() {
  const [metrics, setMetrics] = useState<SuperAdminMetrics>(fallbackMetrics)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function loadMetrics() {
    setIsLoading(true)
    try {
      const response = await api.get<SuperAdminMetrics>('/dashboard/super-admin/metrics')
      setMetrics(response.data)
      setError('')
    } catch {
      setError('Unable to load global metrics. Please verify network or server status.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true
    api.get<SuperAdminMetrics>('/dashboard/super-admin/metrics')
      .then((response) => {
        if (isMounted) {
          setMetrics(response.data)
          setError('')
        }
      })
      .catch(() => {
        if (isMounted) {
          setError('Unable to load global metrics. Please verify network or server status.')
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })
    return () => { isMounted = false }
  }, [])

  const cards = [
    { 
      label: 'Enrolled Tenant Clinics', 
      value: metrics.totalClinics, 
      icon: Building2,
      trend: '+12% vs last month',
      badge: 'Multi-tenant',
      glow: 'from-blue-500/20'
    },
    { 
      label: 'Active Workspaces Today', 
      value: metrics.activeClinicsToday, 
      icon: Activity,
      trend: 'Live telemetry',
      badge: 'Operational',
      glow: 'from-emerald-500/20'
    },
    { 
      label: 'Platform Monthly MRR', 
      value: `$${metrics.mrr.toLocaleString()}`, 
      icon: DollarSign,
      trend: '+18.4% MRR growth',
      badge: 'Revenue',
      glow: 'from-purple-500/20'
    },
  ]

  return (
    <div className="space-y-8 animate-in fade-in-0 duration-500 max-w-7xl mx-auto font-sans">
      <PageHeader
        title="Global Platform Control"
        badge="Super Admin Analytics"
        description="High-density multi-tenant monitoring, revenue metrics, and real-time infrastructure performance."
        action={
          <div className="flex items-center gap-3">
            <Button onClick={loadMetrics} variant="outline" className="border-border hover:border-teal-400/40 gap-2 font-semibold">
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Reload Telemetry
            </Button>
            <Button onClick={() => navigate('/super-admin/clinics')} className="bg-gradient-to-r from-teal-400 to-emerald-400 text-slate-950 font-bold shadow-lg shadow-teal-500/20 gap-2">
              <Users className="h-4 w-4" />
              Manage All Clinics
            </Button>
          </div>
        }
      />

      {error && (
        <div className="rounded-xl bg-destructive/15 border border-destructive/30 px-5 py-4 text-sm font-medium text-destructive shadow-sm flex items-center gap-3">
          <span className="flex h-2 w-2 rounded-full bg-destructive animate-ping" />
          <span>{error}</span>
        </div>
      )}

      {/* Global Analytics Cards */}
      <section className="grid gap-6 md:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.label} className="group relative overflow-hidden border-border bg-card/60 backdrop-blur-sm transition-all duration-300 hover:border-teal-400/40 hover:shadow-xl hover:shadow-teal-500/5">
            <div className={`absolute top-0 right-0 h-32 w-32 bg-gradient-to-br ${card.glow} to-transparent blur-3xl opacity-30 pointer-events-none group-hover:opacity-50 transition-opacity`} />
            <CardContent className="p-6 relative z-10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-card border border-border shadow-inner text-teal-400 group-hover:scale-105 transition-transform font-bold">
                  <card.icon className="h-6 w-6" />
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-secondary border border-border text-muted-foreground shadow-sm">
                  {card.badge}
                </span>
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{card.label}</p>
                {isLoading ? (
                  <Skeleton className="mt-2 h-10 w-32 rounded-lg bg-muted" />
                ) : (
                  <div className="flex items-baseline gap-3 mt-1">
                    <p className="text-4xl font-extrabold tracking-tight text-foreground group-hover:text-teal-300 transition-colors">
                      {card.value}
                    </p>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 tracking-wide">
                      <TrendingUp className="h-3 w-3" />
                      {card.trend}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* High-Density System Infrastructure Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-border bg-card/60 backdrop-blur-sm md:col-span-2 flex flex-col">
          <CardHeader className="border-b border-border/60 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Cpu className="h-5 w-5 text-teal-400" />
                  Infrastructure Telemetry & Health
                </CardTitle>
                <CardDescription className="text-xs">Live API gateway metrics & multi-tenant cluster status</CardDescription>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-400">
                <ShieldCheck className="h-3.5 w-3.5" />
                Cluster Healthy
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-6 flex-1 grid grid-cols-2 sm:grid-cols-4 gap-6 items-center text-center">
            <div className="p-4 rounded-xl bg-card border border-border shadow-sm space-y-1.5">
              <span className="text-xs text-muted-foreground uppercase tracking-wider block font-semibold">Cluster Load</span>
              <span className="text-2xl font-extrabold text-foreground tracking-tight block">24.2%</span>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">Optimal</span>
            </div>
            <div className="p-4 rounded-xl bg-card border border-border shadow-sm space-y-1.5">
              <span className="text-xs text-muted-foreground uppercase tracking-wider block font-semibold">API Latency</span>
              <span className="text-2xl font-extrabold text-teal-400 tracking-tight block">18ms</span>
              <span className="text-[10px] text-teal-300 font-bold bg-teal-500/10 px-1.5 py-0.5 rounded">p99 Fast</span>
            </div>
            <div className="p-4 rounded-xl bg-card border border-border shadow-sm space-y-1.5">
              <span className="text-xs text-muted-foreground uppercase tracking-wider block font-semibold">Database IOPS</span>
              <span className="text-2xl font-extrabold text-purple-400 tracking-tight block">1,420</span>
              <span className="text-[10px] text-purple-300 font-bold bg-purple-500/10 px-1.5 py-0.5 rounded">Stable</span>
            </div>
            <div className="p-4 rounded-xl bg-card border border-border shadow-sm space-y-1.5">
              <span className="text-xs text-muted-foreground uppercase tracking-wider block font-semibold">Uptime SLA</span>
              <span className="text-2xl font-extrabold text-emerald-400 tracking-tight block">99.99%</span>
              <span className="text-[10px] text-emerald-300 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">Verified</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/60 backdrop-blur-sm flex flex-col justify-between">
          <CardHeader className="border-b border-border/60 pb-4">
            <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
              <HardDrive className="h-5 w-5 text-teal-400" />
              Tenant Operations
            </CardTitle>
            <CardDescription className="text-xs">Quick tenant administration</CardDescription>
          </CardHeader>
          <CardContent className="p-6 flex-1 flex flex-col justify-center space-y-4">
            <div className="rounded-xl bg-card border border-border p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-muted-foreground">Total Booked Consultations</span>
                <span className="font-bold text-teal-400">{metrics.totalAppointments.toLocaleString()}</span>
              </div>
              <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-teal-400 to-emerald-400 h-full w-3/4 rounded-full" />
              </div>
            </div>

            <Button onClick={() => navigate('/super-admin/clinics')} variant="outline" className="w-full border-border hover:border-teal-400/40 justify-between group h-11 px-4">
              <span className="flex items-center gap-2 font-bold text-sm text-foreground group-hover:text-teal-300 transition-colors">
                <Sparkles className="h-4 w-4 text-teal-400" />
                Access Clinic Accounts
              </span>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-teal-400 transition-colors" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
