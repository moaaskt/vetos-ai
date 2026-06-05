import { 
  BarChart3, 
  CalendarDays, 
  Users, 
  PawPrint, 
  ShieldAlert, 
  UserMinus, 
  Mail, 
  PhoneCall, 
  CheckCircle, 
  XCircle, 
  Clock, 
  RefreshCw, 
  AlertCircle
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { api, type AnalyticsOverview } from '../lib/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { Skeleton } from '../components/ui/skeleton'
import { Button } from '../components/ui/button'

export function Analytics() {
  const [data, setData] = useState<AnalyticsOverview | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadAnalytics() {
    setIsLoading(true)
    setError('')
    try {
      const response = await api.get<AnalyticsOverview>('/analytics/overview')
      setData(response.data)
    } catch {
      setError('Não foi possível carregar os relatórios e estatísticas da clínica.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadAnalytics()
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-8 animate-in fade-in-0 duration-500">
        <div className="flex items-center justify-between pb-2">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48 rounded bg-muted" />
            <Skeleton className="h-4 w-72 rounded bg-muted" />
          </div>
          <Skeleton className="h-10 w-32 rounded bg-muted" />
        </div>
        <div className="grid gap-6 md:grid-cols-4">
          {[1, 2, 3, 4].map((n) => (
            <Skeleton key={n} className="h-32 rounded-2xl bg-muted" />
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-[300px] rounded-2xl bg-muted" />
          <Skeleton className="h-[300px] rounded-2xl bg-muted" />
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 rounded-xl bg-destructive/15 border border-destructive/30 px-5 py-4 text-sm font-medium text-destructive-foreground shadow-sm max-w-2xl">
          <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />
          <span>{error || 'Ocorreu um erro ao buscar dados analíticos.'}</span>
        </div>
        <Button onClick={loadAnalytics} variant="outline" className="border-border hover:border-primary/30 font-semibold">
          Tentar novamente
        </Button>
      </div>
    )
  }

  // Total de consultas para proporções do status
  const totalAppointmentsStatus = 
    data.appointmentsByStatus.SCHEDULED + 
    data.appointmentsByStatus.COMPLETED + 
    data.appointmentsByStatus.CANCELLED
  
  const getPercentage = (value: number) => {
    if (totalAppointmentsStatus === 0) return 0
    return Math.round((value / totalAppointmentsStatus) * 100)
  }

  // Total de notificações na semana para proporções
  const totalNotifications = data.notificationsLast7Days.sent + data.notificationsLast7Days.failed

  return (
    <div className="space-y-8 animate-in fade-in-0 duration-500">
      {/* Title & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-primary" />
            Relatórios Operacionais
          </h1>
          <p className="text-sm text-muted-foreground font-normal mt-1">
            Indicadores gerenciais atualizados em tempo real com base no histórico da clínica.
          </p>
        </div>
        <Button 
          onClick={loadAnalytics} 
          variant="outline" 
          className="self-start sm:self-center border-border hover:bg-muted font-semibold gap-2 transition-all hover:scale-[1.02]"
        >
          <RefreshCw className="h-4 w-4" />
          Atualizar Dados
        </Button>
      </div>

      {/* Overview Core Metrics Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Appointments Today */}
        <Card className="group relative overflow-hidden border-border bg-card transition-all duration-300 hover:border-primary/25 hover:shadow-lg">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-primary to-violet-500" />
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/15 shadow-sm text-primary font-bold">
                <CalendarDays className="h-6 w-6" />
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase bg-primary/10 text-primary border border-primary/20">
                Hoje
              </span>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Consultas Hoje</p>
              <div className="flex items-baseline gap-2 mt-1">
                <p className="text-4xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                  {data.appointmentsToday}
                </p>
                <span className="text-xs text-muted-foreground">agendadas</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Clients */}
        <Card className="group relative overflow-hidden border-border bg-card transition-all duration-300 hover:border-sky-500/25 hover:shadow-lg">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-sky-400 to-sky-600" />
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/10 border border-sky-500/15 shadow-sm text-sky-400 font-bold">
                <Users className="h-6 w-6" />
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase bg-sky-500/10 text-sky-400 border border-sky-500/20">
                Total
              </span>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tutores Cadastrados</p>
              <div className="flex items-baseline gap-2 mt-1">
                <p className="text-4xl font-bold tracking-tight text-foreground group-hover:text-sky-400 transition-colors">
                  {data.totalClients}
                </p>
                <span className="text-xs text-muted-foreground">responsáveis</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Pets */}
        <Card className="group relative overflow-hidden border-border bg-card transition-all duration-300 hover:border-emerald-500/25 hover:shadow-lg">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-emerald-400 to-emerald-600" />
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/15 shadow-sm text-emerald-400 font-bold">
                <PawPrint className="h-6 w-6" />
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Pacientes
              </span>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pacientes Ativos</p>
              <div className="flex items-baseline gap-2 mt-1">
                <p className="text-4xl font-bold tracking-tight text-foreground group-hover:text-emerald-400 transition-colors">
                  {data.totalPets}
                </p>
                <span className="text-xs text-muted-foreground">animais</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vaccines Alert */}
        <Card className="group relative overflow-hidden border-border bg-card transition-all duration-300 hover:border-amber-500/25 hover:shadow-lg">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-amber-400 to-amber-600" />
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/15 shadow-sm text-amber-400 font-bold">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse">
                Atenção
              </span>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Vacinas nos Próximos 7 Dias</p>
              <div className="flex items-baseline gap-2 mt-1">
                <p className="text-4xl font-bold tracking-tight text-foreground group-hover:text-amber-400 transition-colors">
                  {data.upcomingVaccinesNext7Days}
                </p>
                <span className="text-xs text-muted-foreground">doses vencendo</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analysis Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Appointments Status & Periodicity */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-4 border-b border-border/60">
            <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Agendamentos & Fluxo
            </CardTitle>
            <CardDescription className="text-xs">Detalhamento dos agendamentos efetuados e taxa de comparecimento</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-secondary/30 border border-border/60">
                <span className="text-xs font-medium text-muted-foreground block">Agendados para esta Semana</span>
                <span className="text-2xl font-bold text-foreground mt-1 block">{data.appointmentsThisWeek}</span>
              </div>
              <div className="p-4 rounded-xl bg-secondary/30 border border-border/60">
                <span className="text-xs font-medium text-muted-foreground block">Clientes Sem Consultas (90d)</span>
                <span className="text-2xl font-bold text-rose-400/90 mt-1 block flex items-center gap-1.5">
                  <UserMinus className="h-5 w-5 shrink-0" />
                  {data.inactiveClients90Days}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-foreground">Distribuição por Status (Geral)</h4>
              
              {/* Scheduled Progress */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-muted-foreground">Agendadas (Scheduled)</span>
                  <span className="text-foreground">{data.appointmentsByStatus.SCHEDULED} ({getPercentage(data.appointmentsByStatus.SCHEDULED)}%)</span>
                </div>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-500" 
                    style={{ width: `${getPercentage(data.appointmentsByStatus.SCHEDULED)}%` }}
                  />
                </div>
              </div>

              {/* Completed Progress */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-muted-foreground">Concluídas (Completed)</span>
                  <span className="text-foreground">{data.appointmentsByStatus.COMPLETED} ({getPercentage(data.appointmentsByStatus.COMPLETED)}%)</span>
                </div>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                    style={{ width: `${getPercentage(data.appointmentsByStatus.COMPLETED)}%` }}
                  />
                </div>
              </div>

              {/* Cancelled Progress */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-muted-foreground">Canceladas (Cancelled)</span>
                  <span className="text-foreground">{data.appointmentsByStatus.CANCELLED} ({getPercentage(data.appointmentsByStatus.CANCELLED)}%)</span>
                </div>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-rose-500 rounded-full transition-all duration-500" 
                    style={{ width: `${getPercentage(data.appointmentsByStatus.CANCELLED)}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications & Messaging Stats */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-4 border-b border-border/60">
            <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Mail className="h-5 w-5 text-sky-400" />
              Notificações (Últimos 7 dias)
            </CardTitle>
            <CardDescription className="text-xs">Histórico de entrega de lembretes e alertas automáticos</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-emerald-500/15 bg-emerald-500/5 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-xs font-medium text-muted-foreground block">Enviadas</span>
                  <span className="text-xl font-bold text-emerald-400">{data.notificationsLast7Days.sent}</span>
                </div>
              </div>
              <div className="p-4 rounded-xl border border-rose-500/15 bg-rose-500/5 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-500/10 text-rose-400">
                  <XCircle className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-xs font-medium text-muted-foreground block">Falhas</span>
                  <span className="text-xl font-bold text-rose-400">{data.notificationsLast7Days.failed}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-foreground">Canais Utilizados</h4>

              {/* Email Usage */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    Correio Eletrônico (Email)
                  </span>
                  <span className="text-foreground">{data.notificationsLast7Days.byChannel.EMAIL} envios</span>
                </div>
                <div className="h-2.5 w-full bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-sky-400 rounded-full transition-all duration-500" 
                    style={{ width: `${totalNotifications > 0 ? (data.notificationsLast7Days.byChannel.EMAIL / totalNotifications) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* WhatsApp Usage */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <PhoneCall className="h-3.5 w-3.5 text-muted-foreground" />
                    WhatsApp
                  </span>
                  <span className="text-foreground">{data.notificationsLast7Days.byChannel.WHATSAPP} envios</span>
                </div>
                <div className="h-2.5 w-full bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-400 rounded-full transition-all duration-500" 
                    style={{ width: `${totalNotifications > 0 ? (data.notificationsLast7Days.byChannel.WHATSAPP / totalNotifications) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
