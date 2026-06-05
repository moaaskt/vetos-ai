import { BarChart3, RefreshCw, AlertCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { api, type AnalyticsOverview, type AnalyticsTrends } from '../lib/api'
import { Button } from '../components/ui/button'
import { Skeleton } from '../components/ui/skeleton'
import { OverviewTab } from '../components/analytics/OverviewTab'
import { TrendsTab } from '../components/analytics/TrendsTab'
import { AlertsActionsTab } from '../components/analytics/AlertsActionsTab'

export function Analytics() {
  const [overviewData, setOverviewData] = useState<AnalyticsOverview | null>(null)
  const [trendsData, setTrendsData] = useState<AnalyticsTrends | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'alerts'>('overview')

  async function loadAnalytics() {
    setIsLoading(true)
    setError('')
    try {
      const [overviewRes, trendsRes] = await Promise.all([
        api.get<AnalyticsOverview>('/analytics/overview'),
        api.get<AnalyticsTrends>('/analytics/trends')
      ])
      setOverviewData(overviewRes.data)
      setTrendsData(trendsRes.data)
    } catch {
      setError('Não foi possível carregar os relatórios e tendências da clínica.')
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
        <div className="flex gap-2 border-b border-border/60 pb-px">
          {[1, 2, 3].map((n) => (
            <Skeleton key={n} className="h-10 w-32 rounded-t-lg bg-muted" />
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-4">
          {[1, 2, 3, 4].map((n) => (
            <Skeleton key={n} className="h-32 rounded-2xl bg-muted" />
          ))}
        </div>
      </div>
    )
  }

  if (error || !overviewData || !trendsData) {
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

      {/* Tabs Navigation */}
      <div className="flex border-b border-border/60 gap-1.5 scrollbar-none overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all whitespace-nowrap outline-none ${
            activeTab === 'overview'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30'
          }`}
        >
          Visão Geral
        </button>
        <button
          onClick={() => setActiveTab('trends')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all whitespace-nowrap outline-none ${
            activeTab === 'trends'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30'
          }`}
        >
          Tendências (30 dias)
        </button>
        <button
          onClick={() => setActiveTab('alerts')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all whitespace-nowrap outline-none ${
            activeTab === 'alerts'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30'
          }`}
        >
          Alertas & Ações
        </button>
      </div>

      {/* Tab Contents */}
      <div className="focus:outline-none">
        {activeTab === 'overview' && <OverviewTab data={overviewData} />}
        {activeTab === 'trends' && <TrendsTab trends={trendsData} />}
        {activeTab === 'alerts' && <AlertsActionsTab trends={trendsData} />}
      </div>
    </div>
  )
}
