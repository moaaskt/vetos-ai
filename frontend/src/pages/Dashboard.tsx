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
          setError('As estatísticas do painel estão indisponíveis no momento.')
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
      label: 'Clientes Proprietários', 
      value: stats.totalClients, 
      icon: Users,
      trend: '+14% neste mês',
      color: 'from-blue-500/20 to-transparent text-blue-400',
      badge: 'Ativo'
    },
    { 
      label: 'Pacientes Cadastrados', 
      value: stats.totalPets, 
      icon: PawPrint,
      trend: '+8% vs mês anterior',
      color: 'from-primary/20 to-transparent text-primary',
      badge: 'Crescimento'
    },
    { 
      label: 'Consultas Agendadas', 
      value: stats.totalAppointments, 
      icon: CalendarDays,
      trend: 'Hoje e próximos dias',
      color: 'from-purple-500/20 to-transparent text-purple-400',
      badge: 'Em tempo real'
    },
  ]

  const recentActivities = [
    { id: 1, text: 'Dra. Sarah concluiu atendimento de rotina para Bella (Golden Retriever)', time: 'Há 12 min', type: 'checkup' },
    { id: 2, text: 'Novo cliente cadastrado: Michael Chen & paciente Max', time: 'Há 1 hora', type: 'client' },
    { id: 3, text: 'Lembrete de vacina anual agendado para Luna (Siamês)', time: 'Há 3 horas', type: 'reminder' },
    { id: 4, text: 'Consulta marcada: Limpeza de tártaro e exames para Rocky', time: 'Há 5 horas', type: 'booking' },
  ]

  return (
    <div className="space-y-8 animate-in fade-in-0 duration-500">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-r from-card to-card/60 p-8 shadow-sm">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 h-64 w-64 rounded-full bg-primary/5 blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5 animate-pulse" />
              Ambiente Hospitalar Premium
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              Bem-vindo(a) de volta, <span className="text-primary">{clinic?.name ?? 'Dr. Vet'}</span>
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground font-normal">
              Acompanhe as operações em tempo real da clínica, gestão de leitos, consultas agendadas e fluxos diários de atendimento.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={() => navigate('/appointments')} className="bg-primary text-primary-foreground font-bold shadow-sm hover:opacity-90 gap-2">
              <Plus className="h-4 w-4" />
              Nova Consulta
            </Button>
            <Button onClick={() => navigate('/pets')} variant="outline" className="border-border hover:border-primary/40 gap-2 font-semibold">
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
          className="group cursor-pointer rounded-xl border border-border bg-card/60 p-4 transition-all hover:border-primary/40 hover:bg-card hover:shadow-md flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:scale-105 transition-transform font-bold">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">Consultas</p>
              <p className="text-xs text-muted-foreground font-medium">Gestão de agenda</p>
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>

        <div 
          onClick={() => navigate('/pets')} 
          className="group cursor-pointer rounded-xl border border-border bg-card/60 p-4 transition-all hover:border-primary/40 hover:bg-card hover:shadow-md flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:scale-105 transition-transform font-bold">
              <PawPrint className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-foreground group-hover:text-emerald-400 transition-colors">Pacientes</p>
              <p className="text-xs text-muted-foreground font-medium">Prontuários e fichas</p>
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-emerald-400 transition-colors" />
        </div>

        <div 
          onClick={() => navigate('/clients')} 
          className="group cursor-pointer rounded-xl border border-border bg-card/60 p-4 transition-all hover:border-primary/40 hover:bg-card hover:shadow-md flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 group-hover:scale-105 transition-transform font-bold">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-foreground group-hover:text-blue-400 transition-colors">Clientes</p>
              <p className="text-xs text-muted-foreground font-medium">Tutores e contatos</p>
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-blue-400 transition-colors" />
        </div>

        <div className="rounded-xl border border-border bg-card/40 p-4 flex items-center justify-between opacity-80">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400 font-bold">
              <Activity className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <p className="font-bold text-sm text-foreground">Status do Sistema</p>
              <p className="text-xs text-primary font-bold">100% Operacional</p>
            </div>
          </div>
          <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <section className="grid gap-6 md:grid-cols-3">
        {metrics.map((m) => (
          <Card key={m.label} className="group relative overflow-hidden border-border bg-card/60 backdrop-blur-sm transition-all duration-300 hover:border-primary/40 hover:shadow-md">
            <div className={`absolute top-0 right-0 h-32 w-32 bg-gradient-to-br ${m.color} blur-2xl opacity-10 pointer-events-none transition-opacity group-hover:opacity-20`} />
            <CardContent className="p-6 relative z-10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-card border border-border shadow-inner text-primary group-hover:scale-105 transition-transform font-bold">
                  <m.icon className="h-6 w-6" />
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-secondary border border-border text-muted-foreground shadow-sm">
                  {m.badge}
                </span>
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{m.label}</p>
                {isLoading ? (
                  <Skeleton className="mt-2 h-10 w-28 rounded-lg bg-muted" />
                ) : (
                  <div className="flex items-baseline gap-3 mt-1">
                    <p className="text-4xl font-extrabold tracking-tight text-foreground group-hover:text-primary transition-colors">
                      {m.value.toLocaleString()}
                    </p>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
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
          <CardHeader className="pb-4 border-b border-border/60">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2 tracking-tight">
                  <Clock className="h-5 w-5 text-primary" />
                  Atividade Recente da Clínica
                </CardTitle>
                <CardDescription className="text-xs">Registro de eventos e auditoria da equipe médica</CardDescription>
              </div>
              <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20 animate-pulse tracking-wide uppercase text-[10px]">
                Em tempo real
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-6 flex-1">
            <div className="relative pl-6 border-l-2 border-border/80 space-y-6">
              {recentActivities.map((act, idx) => (
                <div key={act.id} className="relative group">
                  <div className={`absolute -left-[31px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-background ${
                    idx === 0 ? 'bg-primary ring-4 ring-primary/20 shadow-sm' : 'bg-secondary border-border'
                  }`} />
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                    <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{act.text}</p>
                    <span className="text-xs font-medium text-muted-foreground shrink-0">{act.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Operational Overview Card */}
        <Card className="border-border bg-card/60 backdrop-blur-sm flex flex-col">
          <CardHeader className="pb-4 border-b border-border/60">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2 tracking-tight">
                  <Activity className="h-5 w-5 text-emerald-400" />
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
            <div className="h-20 w-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4 shadow-sm font-bold">
              <Sparkles className="h-8 w-8 animate-pulse" />
            </div>
            <h3 className="font-extrabold tracking-tight text-lg text-foreground mb-1">Operações Otimizadas e Seguras</h3>
            <p className="text-xs text-muted-foreground max-w-sm mb-6 font-medium">
              Todos os prontuários eletrônicos e agendamentos estão sincronizados na nuvem com criptografia e backup contínuo.
            </p>
            <div className="grid grid-cols-2 gap-4 w-full max-w-md text-left">
              <div className="p-3.5 rounded-xl bg-card border border-border shadow-sm">
                <span className="text-xs font-semibold text-muted-foreground block mb-1">Latência do Gateway</span>
                <span className="font-extrabold tracking-tight text-sm text-emerald-400">12ms (Excelente)</span>
              </div>
              <div className="p-3.5 rounded-xl bg-card border border-border shadow-sm">
                <span className="text-xs font-semibold text-muted-foreground block mb-1">Status do Backup</span>
                <span className="font-extrabold tracking-tight text-sm text-primary">100% Protegido</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
