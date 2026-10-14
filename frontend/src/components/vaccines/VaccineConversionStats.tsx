import { useState, useEffect } from 'react';
import { vaccinesApi } from '../../api/vaccines';
import type { VaccineConversionStats as VaccineConversionStatsType } from '../../api/vaccines';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import {
  Bell,
  Percent,
  RefreshCw,
  ShieldAlert,
  Syringe,
  TrendingUp,
} from 'lucide-react';

interface VaccineConversionStatsProps {
  onRefreshTrigger?: number;
}

export function VaccineConversionStats({ onRefreshTrigger }: VaccineConversionStatsProps) {
  const [stats, setStats] = useState<VaccineConversionStatsType | null>(null);
  const [selectedDays, setSelectedDays] = useState<number>(30);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadStats() {
    setIsLoading(true);
    setError(null);
    try {
      const data = await vaccinesApi.getConversionStats(selectedDays);
      setStats(data);
    } catch {
      setError('Falha ao carregar indicadores de conversão vacinal.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadStats();
  }, [selectedDays, onRefreshTrigger]);

  return (
    <div className="space-y-4">
      {/* Header com Seletor de Período */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-card p-3.5 rounded-xl border border-border/70 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <TrendingUp className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Desempenho da Imunização Preventiva
            </h3>
            <p className="text-xs text-muted-foreground">
              Monitoramento de retorno à clínica e efetividade dos lembretes automáticos
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="flex items-center rounded-lg border border-border p-0.5 bg-muted/40">
            <button
              type="button"
              onClick={() => setSelectedDays(30)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                selectedDays === 30
                  ? 'bg-background text-foreground shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Últimos 30 dias
            </button>
            <button
              type="button"
              onClick={() => setSelectedDays(90)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                selectedDays === 90
                  ? 'bg-background text-foreground shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Últimos 90 dias
            </button>
          </div>

          <Button
            size="sm"
            variant="ghost"
            onClick={loadStats}
            title="Atualizar métricas"
            className="h-7 w-7 p-0"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse bg-card/60">
              <CardContent className="p-4 space-y-3">
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-8 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-600 dark:text-rose-400 text-sm flex items-center justify-between">
          <span>{error}</span>
          <Button size="sm" variant="outline" onClick={loadStats}>
            Recarregar
          </Button>
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Doses Aplicadas */}
          <Card className="border-border/80 shadow-xs relative overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground">
                  Doses Aplicadas
                </span>
                <div className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Syringe className="h-4 w-4" />
                </div>
              </div>
              <div className="text-2xl font-bold tracking-tight text-foreground">
                {stats.appliedDosesCount}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Registradas nos últimos {stats.days} dias
              </p>
            </CardContent>
          </Card>

          {/* Card 2: Lembretes Notificados */}
          <Card className="border-border/80 shadow-xs relative overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground">
                  Lembretes Notificados
                </span>
                <div className="h-7 w-7 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                  <Bell className="h-4 w-4" />
                </div>
              </div>
              <div className="text-2xl font-bold tracking-tight text-foreground">
                {stats.totalNotificationsSent}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                Disparos via WhatsApp & E-mail
              </p>
            </CardContent>
          </Card>

          {/* Card 3: Taxa de Conversão Vacinal */}
          <Card className="border-border/80 shadow-xs relative overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground">
                  Taxa de Retorno (Conversão)
                </span>
                <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Percent className="h-4 w-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold tracking-tight text-foreground">
                  {stats.conversionRate}%
                </span>
                <span className="text-xs text-muted-foreground">
                  ({stats.appliedAfterNotificationCount} de {stats.notifiedVaccinesCount} notificadas)
                </span>
              </div>
              {/* Barra de Progresso Visual */}
              <div className="w-full bg-muted rounded-full h-1.5 mt-2 overflow-hidden">
                <div
                  className="bg-primary h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, stats.conversionRate))}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          {/* Card 4: Atrasos Críticos */}
          <Card
            className={`shadow-xs relative overflow-hidden border ${
              stats.criticalOverdueCount > 0
                ? 'border-rose-500/40 bg-rose-500/5'
                : 'border-border/80'
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground">
                  Atraso Crítico (&gt;15 dias)
                </span>
                <div
                  className={`h-7 w-7 rounded-lg flex items-center justify-center ${
                    stats.criticalOverdueCount > 0
                      ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <ShieldAlert className="h-4 w-4" />
                </div>
              </div>
              <div
                className={`text-2xl font-bold tracking-tight ${
                  stats.criticalOverdueCount > 0
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-foreground'
                }`}
              >
                {stats.criticalOverdueCount}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                Total em atraso no sistema: <strong>{stats.overdueCount}</strong> doses
              </p>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
