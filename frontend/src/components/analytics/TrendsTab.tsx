import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { MiniBarChart } from './MiniBarChart'
import { NotificationTrendChart } from './NotificationTrendChart'
import { ChannelDistribution } from './ChannelDistribution'
import { TrendingUp, Activity, MessageSquare } from 'lucide-react'
import type { AnalyticsTrends } from '../../lib/api'

interface TrendsTabProps {
  trends: AnalyticsTrends
}

export function TrendsTab({ trends }: TrendsTabProps) {
  return (
    <div className="space-y-6 animate-in fade-in-0 duration-300">
      {/* 30 Days Trends Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Appointments Trend */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Fluxo de Consultas (Últimos 30 Dias)
            </CardTitle>
            <CardDescription className="text-xs">
              Histórico diário de consultas agendadas e realizadas na clínica
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <MiniBarChart data={trends.appointmentsTrend} />
          </CardContent>
        </Card>

        {/* Notifications Trend */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Activity className="h-5 w-5 text-emerald-400" />
              Notificações Diárias (Últimos 30 Dias)
            </CardTitle>
            <CardDescription className="text-xs">
              Lembretes e envios diários divididos por sucesso (verde) e falha (vermelho)
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <NotificationTrendChart data={trends.notificationsTrend} />
          </CardContent>
        </Card>
      </div>

      {/* Channel Distribution Trend */}
      <Card className="border-border bg-card max-w-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-sky-400" />
            Canais de Comunicação (Últimos 30 Dias)
          </CardTitle>
          <CardDescription className="text-xs">
            Volume de entregas comparativo entre E-mail e WhatsApp no período
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <ChannelDistribution data={trends.notificationsByChannel} />
        </CardContent>
      </Card>
    </div>
  )
}
