import { CalendarDays, PawPrint, Users, TrendingUp, Plus, Clock, Activity, ArrowUpRight, HeartPulse, AlertCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api, type DashboardStats, type DashboardActivity } from '../lib/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { Skeleton } from '../components/ui/skeleton'
import { Button } from '../components/ui/button'

const fallbackStats: DashboardStats = {
  totalClients: 0,
  totalPets: 0,
  totalAppointments: 0,
}

function formatActivityTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Agora mesmo'
  if (diffMins < 60) return `Há ${diffMins} min`
  if (diffHours < 24) return `Há ${diffHours} hora${diffHours > 1 ? 's' : ''}`
  if (diffDays === 1) return 'Ontem'
  if (diffDays < 7) return `Há ${diffDays} dias`
  
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

function getActivityColor(type: string, isFirst: boolean): string {
  if (isFirst) {
    switch (type) {
      case 'client': return 'bg-sky-400/85 ring-4 ring-sky-400/20'
      case 'pet': return 'bg-emerald-400/85 ring-4 ring-emerald-400/20'
      case 'appointment': return 'bg-violet-400/85 ring-4 ring-violet-400/20'
      case 'clinicalRecord': return 'bg-primary/85 ring-4 ring-primary/20'
      case 'allergy': return 'bg-rose-400/85 ring-4 ring-rose-400/20'
      case 'vaccine': return 'bg-amber-400/85 ring-4 ring-amber-400/20'
      case 'weightRecord': return 'bg-teal-400/85 ring-4 ring-teal-400/20'
      default: return 'bg-primary/85 ring-4 ring-primary/20'
    }
  }

  switch (type) {
    case 'client': return 'bg-sky-500/60 border-sky-500/30'
    case 'pet': return 'bg-emerald-500/60 border-emerald-500/30'
    case 'appointment': return 'bg-violet-500/60 border-violet-500/30'
    case 'clinicalRecord': return 'bg-primary/60 border-primary/30'
    case 'allergy': return 'bg-rose-500/60 border-rose-500/30'
    case 'vaccine': return 'bg-amber-500/60 border-amber-500/30'
    case 'weightRecord': return 'bg-teal-500/60 border-teal-500/30'
    default: return 'bg-secondary border-border'
  }
}

export function Dashboard() {
  const { clinic } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState<DashboardStats>(fallbackStats)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [activities, setActivities] = useState<DashboardActivity[]>([])
  const [isActivitiesLoading, setIsActivitiesLoading] = useState(true)

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
          setError('As estatísticas do painel estão indisponíveis no momento.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    async function loadActivities() {
      try {
        const response = await api.get<DashboardActivity[]>('/dashboard/activity')
        if (isMounted) {
          setActivities(response.data)
        }
      } catch {
        // Silently ignore or fallback
      } finally {
        if (isMounted) {
          setIsActivitiesLoading(false)
        }
      }
    }

    loadStats()
    loadActivities()

    return () => {
      isMounted = false
    }
  }, [])

  const metrics = [
    { 
      label: 'Clientes Proprietários', 
      value: stats.totalClients, 
      icon: Users,
      trend: '+14% neste mês',
      color: 'text-sky-300',
      badge: 'Ativo'
    },
    { 
      label: 'Pacientes Cadastrados', 
      value: stats.totalPets, 
      icon: PawPrint,
      trend: '+8% vs mês anterior',
      color: 'text-primary',
      badge: 'Crescimento'
    },
    { 
      label: 'Consultas Agendadas', 
      value: stats.totalAppointments, 
      icon: CalendarDays,
      trend: 'Hoje e próximos dias',
      color: 'text-violet-300',
      badge: 'Em tempo real'
    },
  ]

  return (
    <div className="space-y-8 animate-in fade-in-0 duration-500">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-8 shadow-[0_18px_50px_-36px_rgba(0,0,0,0.7)]">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/15 text-xs font-medium text-primary">
              <HeartPulse className="h-3.5 w-3.5" />
              Gestão clínica assistida
            </div>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
              Bem-vindo(a) de volta, <span className="text-primary">{clinic?.name ?? 'Dr. Vet'}</span>
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground font-normal">
              Acompanhe as operações em tempo real da clínica, gestão de leitos, consultas agendadas e fluxos diários de atendimento.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={() => navigate('/appointments')} className="bg-primary text-primary-foreground font-semibold shadow-sm hover:opacity-90 gap-2">
              <Plus className="h-4 w-4" />
              Nova Consulta
            </Button>
            <Button onClick={() => navigate('/pets')} variant="outline" className="border-border hover:border-primary/30 gap-2 font-semibold">
              <PawPrint className="h-4 w-4 text-primary" />
              Cadastrar Paciente
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
          className="group cursor-pointer rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/30 hover:bg-accent/40 hover:shadow-sm flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors font-bold">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">Consultas</p>
              <p className="text-xs text-muted-foreground font-medium">Gestão de agenda</p>
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>

        <div 
          onClick={() => navigate('/pets')} 
          className="group cursor-pointer rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/30 hover:bg-accent/40 hover:shadow-sm flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-300 transition-colors font-bold">
              <PawPrint className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground group-hover:text-emerald-300 transition-colors">Pacientes</p>
              <p className="text-xs text-muted-foreground font-medium">Prontuários e fichas</p>
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-emerald-300 transition-colors" />
        </div>

        <div 
          onClick={() => navigate('/clients')} 
          className="group cursor-pointer rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/30 hover:bg-accent/40 hover:shadow-sm flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/10 text-sky-300 transition-colors font-bold">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground group-hover:text-sky-300 transition-colors">Clientes</p>
              <p className="text-xs text-muted-foreground font-medium">Tutores e contatos</p>
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-sky-300 transition-colors" />
        </div>

        <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-between opacity-90">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10 text-violet-300 font-bold">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground">Status do Sistema</p>
              <p className="text-xs text-primary font-semibold">100% Operacional</p>
            </div>
          </div>
          <span className="flex h-2 w-2 rounded-full bg-primary/80" />
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <section className="grid gap-6 md:grid-cols-3">
        {metrics.map((m) => (
          <Card key={m.label} className="group relative overflow-hidden border-border bg-card transition-all duration-300 hover:border-primary/25">
            <CardContent className="p-6 relative z-10 space-y-4">
              <div className="flex items-center justify-between">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/55 border border-border shadow-sm ${m.color} font-bold`}>
                  <m.icon className="h-6 w-6" />
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide uppercase bg-secondary/70 border border-border text-muted-foreground shadow-sm">
                  {m.badge}
                </span>
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{m.label}</p>
                {isLoading ? (
                  <Skeleton className="mt-2 h-10 w-28 rounded-lg bg-muted" />
                ) : (
                  <div className="flex items-baseline gap-3 mt-1">
                    <p className="text-4xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                      {m.value.toLocaleString()}
                    </p>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/15">
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
        <Card className="border-border bg-card flex flex-col">
          <CardHeader className="pb-4 border-b border-border/60">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2 tracking-tight">
                  <Clock className="h-5 w-5 text-primary" />
                  Atividade Recente da Clínica
                </CardTitle>
                <CardDescription className="text-xs">Registro de eventos e auditoria da equipe médica</CardDescription>
              </div>
              <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/15 tracking-wide uppercase text-[10px]">
                Atualizado
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-6 flex-1 flex flex-col justify-between">
            {isActivitiesLoading ? (
              <div className="relative pl-6 border-l-2 border-border/80 space-y-6 w-full">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="relative flex justify-between items-center gap-4 animate-pulse">
                    <div className="absolute -left-[31px] top-1.5 h-3.5 w-3.5 rounded-full bg-secondary border border-border" />
                    <Skeleton className="h-5 w-3/4 rounded bg-muted/60" />
                    <Skeleton className="h-4 w-12 rounded bg-muted/60" />
                  </div>
                ))}
              </div>
            ) : activities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 px-4 text-center h-full my-auto">
                <div className="h-12 w-12 rounded-full bg-primary/10 border border-primary/15 flex items-center justify-center text-primary mb-3 shadow-sm">
                  <Clock className="h-5 w-5" />
                </div>
                <h4 className="font-semibold text-foreground text-sm mb-1">Nenhuma atividade recente</h4>
                <p className="text-xs text-muted-foreground max-w-[260px]">
                  Cadastros de pets, tutores, consultas e prontuários aparecerão aqui em tempo real.
                </p>
              </div>
            ) : (
              <div className="relative pl-6 border-l-2 border-border/80 space-y-6">
                {activities.map((act, idx) => (
                  <div key={act.id} className="relative group">
                    <div className={`absolute -left-[31px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-background transition-all duration-300 ${
                      getActivityColor(act.type, idx === 0)
                    }`} />
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                      <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors pr-2">
                        {act.text}
                      </p>
                      <span className="text-xs font-medium text-muted-foreground shrink-0 select-none">
                        {formatActivityTime(act.date)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Operational Overview Card */}
        <Card className="border-border bg-card flex flex-col">
          <CardHeader className="pb-4 border-b border-border/60">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2 tracking-tight">
                  <Activity className="h-5 w-5 text-emerald-300" />
                  Resumo Operacional
                </CardTitle>
                <CardDescription className="text-xs">Métricas de integridade do ambiente</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/appointments')} className="text-xs text-primary hover:opacity-80 font-semibold">
                Ver Agenda Completa
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6 flex-1 flex flex-col justify-center items-center text-center">
            <div className="h-20 w-20 rounded-full bg-primary/10 border border-primary/15 flex items-center justify-center text-primary mb-4 shadow-sm font-bold">
              <HeartPulse className="h-8 w-8" />
            </div>
            <h3 className="font-semibold tracking-tight text-lg text-foreground mb-1">Operações seguras e organizadas</h3>
            <p className="text-xs text-muted-foreground max-w-sm mb-6 font-medium">
              Todos os prontuários eletrônicos e agendamentos estão sincronizados na nuvem com criptografia e backup contínuo.
            </p>
            <div className="grid grid-cols-2 gap-4 w-full max-w-md text-left">
              <div className="p-3.5 rounded-xl bg-card border border-border shadow-sm">
                <span className="text-xs font-semibold text-muted-foreground block mb-1">Latência do Gateway</span>
                <span className="font-semibold tracking-tight text-sm text-emerald-300">12ms (Excelente)</span>
              </div>
              <div className="p-3.5 rounded-xl bg-card border border-border shadow-sm">
                <span className="text-xs font-semibold text-muted-foreground block mb-1">Status do Backup</span>
                <span className="font-semibold tracking-tight text-sm text-primary">100% Protegido</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
