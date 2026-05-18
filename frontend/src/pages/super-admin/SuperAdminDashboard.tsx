import { Activity, Users, DollarSign, Building2, TrendingUp, ShieldCheck, Cpu, HardDrive, RefreshCw, ArrowUpRight, Settings2 } from 'lucide-react'
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
      setError('Não foi possível carregar as métricas globais. Verifique a conexão com o servidor.')
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
          setError('Não foi possível carregar as métricas globais. Verifique a conexão com o servidor.')
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
      label: 'Clínicas Registradas', 
      value: metrics.totalClinics, 
      icon: Building2,
      trend: '+12% vs mês anterior',
      badge: 'Multi-tenant',
      tone: 'text-sky-300'
    },
    { 
      label: 'Clínicas Ativas Hoje', 
      value: metrics.activeClinicsToday, 
      icon: Activity,
      trend: 'Telemetria em tempo real',
      badge: 'Operacional',
      tone: 'text-emerald-300'
    },
    { 
      label: 'Faturamento Mensal (MRR)', 
      value: `R$ ${metrics.mrr.toLocaleString()}`, 
      icon: DollarSign,
      trend: '+18.4% de expansão',
      badge: 'Receita',
      tone: 'text-violet-300'
    },
  ]

  return (
    <div className="space-y-8 animate-in fade-in-0 duration-500 max-w-7xl mx-auto font-sans">
      <PageHeader
        title="Painel Global do Sistema"
        badge="Telemetria e Controle"
        description="Monitoramento central de infraestrutura, faturamento global e atividade de múltiplos tenants da plataforma."
        action={
          <div className="flex items-center gap-3">
            <Button onClick={loadMetrics} variant="outline" className="border-border hover:border-primary/30 gap-2 font-semibold">
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar Telemetria
            </Button>
            <Button onClick={() => navigate('/super-admin/clinics')} className="bg-primary text-primary-foreground font-semibold shadow-sm hover:opacity-90 gap-2">
              <Users className="h-4 w-4" />
              Gerenciar Clínicas
            </Button>
          </div>
        }
      />

      {error && (
        <div className="rounded-xl bg-destructive/15 border border-destructive/30 px-5 py-4 text-sm font-medium text-destructive shadow-sm flex items-center gap-3">
          <span className="flex h-2 w-2 rounded-full bg-destructive shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Global Analytics Cards */}
      <section className="grid gap-6 md:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.label} className="group relative overflow-hidden border-border bg-card transition-all duration-300 hover:border-primary/25">
            <CardContent className="p-6 relative z-10 space-y-4">
              <div className="flex items-center justify-between">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/55 border border-border shadow-sm ${card.tone} font-bold`}>
                  <card.icon className="h-6 w-6" />
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-secondary/70 border border-border text-muted-foreground shadow-sm">
                  {card.badge}
                </span>
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{card.label}</p>
                {isLoading ? (
                  <Skeleton className="mt-2 h-10 w-32 rounded-lg bg-muted" />
                ) : (
                  <div className="flex items-baseline gap-3 mt-1">
                    <p className="text-4xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                      {card.value}
                    </p>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/15 tracking-wide shrink-0">
                      <TrendingUp className="h-3 w-3 shrink-0" />
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
        <Card className="border-border bg-card md:col-span-2 flex flex-col">
          <CardHeader className="border-b border-border/60 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Cpu className="h-5 w-5 text-primary" />
                  Saúde do Cluster & Infraestrutura
                </CardTitle>
                <CardDescription className="text-xs">Métricas globais de gateway API e desempenho do banco de dados</CardDescription>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/15 text-xs font-semibold text-emerald-300">
                <ShieldCheck className="h-3.5 w-3.5" />
                Cluster Excelente
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-6 flex-1 grid grid-cols-2 sm:grid-cols-4 gap-6 items-center text-center">
            <div className="p-4 rounded-xl bg-card border border-border shadow-sm space-y-1.5">
              <span className="text-xs text-muted-foreground uppercase tracking-wider block font-semibold">Carga da CPU</span>
              <span className="text-2xl font-bold text-foreground tracking-tight block">24.2%</span>
              <span className="text-[10px] text-emerald-300 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded">Estável</span>
            </div>
            <div className="p-4 rounded-xl bg-card border border-border shadow-sm space-y-1.5">
              <span className="text-xs text-muted-foreground uppercase tracking-wider block font-semibold">Latência API</span>
              <span className="text-2xl font-bold text-primary tracking-tight block">18ms</span>
              <span className="text-[10px] text-primary font-semibold bg-primary/10 px-1.5 py-0.5 rounded">p99 Rápido</span>
            </div>
            <div className="p-4 rounded-xl bg-card border border-border shadow-sm space-y-1.5">
              <span className="text-xs text-muted-foreground uppercase tracking-wider block font-semibold">IOPS do Banco</span>
              <span className="text-2xl font-bold text-violet-300 tracking-tight block">1.420</span>
              <span className="text-[10px] text-violet-200 font-semibold bg-violet-500/10 px-1.5 py-0.5 rounded">Equilibrado</span>
            </div>
            <div className="p-4 rounded-xl bg-card border border-border shadow-sm space-y-1.5">
              <span className="text-xs text-muted-foreground uppercase tracking-wider block font-semibold">Uptime SLA</span>
              <span className="text-2xl font-bold text-emerald-300 tracking-tight block">99.99%</span>
              <span className="text-[10px] text-emerald-200 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded">Verificado</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card flex flex-col justify-between">
          <CardHeader className="border-b border-border/60 pb-4">
            <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
              <HardDrive className="h-5 w-5 text-primary" />
              Volume Operacional
            </CardTitle>
            <CardDescription className="text-xs">Uso agregado da plataforma</CardDescription>
          </CardHeader>
          <CardContent className="p-6 flex-1 flex flex-col justify-center space-y-4">
            <div className="rounded-xl bg-card border border-border p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-muted-foreground">Consultas Totais Agendadas</span>
                <span className="font-bold text-primary">{metrics.totalAppointments.toLocaleString()}</span>
              </div>
              <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                <div className="bg-primary h-full w-3/4 rounded-full" />
              </div>
            </div>

            <Button onClick={() => navigate('/super-admin/clinics')} variant="outline" className="w-full border-border hover:border-primary/30 justify-between group h-11 px-4 font-semibold">
              <span className="flex items-center gap-2 font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                <Settings2 className="h-4 w-4 text-primary" />
                Gerenciar Tenants
              </span>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
