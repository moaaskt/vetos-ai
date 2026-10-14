import type { ResourceUsageMetrics } from '../../api/billing';
import { Card, CardContent } from '../ui/card';
import {
  Users,
  Bell,
  HardDrive,
  AlertTriangle,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface ResourceUsageMeterProps {
  metrics: ResourceUsageMetrics['metrics'];
  onUpgradeClick?: () => void;
}

export function ResourceUsageMeter({
  metrics,
  onUpgradeClick,
}: ResourceUsageMeterProps) {
  const { staff, notifications, storage } = metrics;

  function getStatusColor(percentage: number, isExceeded: boolean) {
    if (isExceeded || percentage >= 90) {
      return {
        bg: 'bg-rose-500',
        text: 'text-rose-600 dark:text-rose-400',
        badgeBg: 'bg-rose-500/15',
        badgeBorder: 'border-rose-500/25',
      };
    }
    if (percentage >= 70) {
      return {
        bg: 'bg-amber-500',
        text: 'text-amber-600 dark:text-amber-400',
        badgeBg: 'bg-amber-500/15',
        badgeBorder: 'border-amber-500/25',
      };
    }
    return {
      bg: 'bg-emerald-500',
      text: 'text-emerald-600 dark:text-emerald-400',
      badgeBg: 'bg-emerald-500/15',
      badgeBorder: 'border-emerald-500/25',
    };
  }

  function formatResetDate(dateStr: string) {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
      });
    } catch {
      return 'início do próximo mês';
    }
  }

  const staffColor = getStatusColor(staff.percentage, staff.isExceeded);
  const notifColor = getStatusColor(
    notifications.percentage,
    notifications.isExceeded,
  );
  const storageColor = getStatusColor(storage.percentage, storage.isExceeded);

  const hasAnyAlert =
    staff.isExceeded ||
    notifications.isExceeded ||
    storage.isExceeded ||
    staff.percentage >= 85 ||
    notifications.percentage >= 85 ||
    storage.percentage >= 85;

  return (
    <div className="space-y-4">
      {hasAnyAlert && onUpgradeClick && (
        <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm text-amber-800 dark:text-amber-300">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>
              Você está próximo do limite de um ou mais recursos contratados na sua clínica.
            </span>
          </div>
          <button
            type="button"
            onClick={onUpgradeClick}
            className="text-xs font-semibold px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors shrink-0"
          >
            Fazer Upgrade Agora
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Membros da Equipe */}
        <Card className="border-border/80 shadow-xs relative overflow-hidden">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-foreground">
                    Equipe Clínica
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    Veterinários e funcionários
                  </p>
                </div>
              </div>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${staffColor.badgeBg} ${staffColor.text} ${staffColor.badgeBorder}`}
              >
                {staff.isExceeded ? 'Limite Atingido' : `${staff.percentage}%`}
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-baseline justify-between text-xs">
                <span className="font-semibold text-foreground text-base">
                  {staff.used}{' '}
                  <span className="text-xs font-normal text-muted-foreground">
                    de {staff.limit} vagas
                  </span>
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {Math.max(0, staff.limit - staff.used)} disponíveis
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${staffColor.bg}`}
                  style={{ width: `${Math.min(100, Math.max(0, staff.percentage))}%` }}
                />
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
              {staff.isExceeded ? (
                <>
                  <AlertCircle className="h-3 w-3 text-rose-500 shrink-0" />
                  <span className="text-rose-600 dark:text-rose-400 font-medium">
                    Bloqueio ativo para novos cadastros
                  </span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                  <span>Assentos disponíveis para equipe</span>
                </>
              )}
            </p>
          </CardContent>
        </Card>

        {/* Card 2: Notificações & Lembretes */}
        <Card className="border-border/80 shadow-xs relative overflow-hidden">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                  <Bell className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-foreground">
                    Notificações Mensais
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    WhatsApp e E-mail (Mês Atual)
                  </p>
                </div>
              </div>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${notifColor.badgeBg} ${notifColor.text} ${notifColor.badgeBorder}`}
              >
                {notifications.isExceeded
                  ? 'Cota Esgotada'
                  : `${notifications.percentage}%`}
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-baseline justify-between text-xs">
                <span className="font-semibold text-foreground text-base">
                  {notifications.used}{' '}
                  <span className="text-xs font-normal text-muted-foreground">
                    de {notifications.limit} disparos
                  </span>
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {Math.max(0, notifications.limit - notifications.used)} restantes
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${notifColor.bg}`}
                  style={{
                    width: `${Math.min(100, Math.max(0, notifications.percentage))}%`,
                  }}
                />
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3 shrink-0" />
              <span>
                Cota renova em{' '}
                <strong>{formatResetDate(notifications.resetDate)}</strong>
              </span>
            </p>
          </CardContent>
        </Card>

        {/* Card 3: Armazenamento de Arquivos */}
        <Card className="border-border/80 shadow-xs relative overflow-hidden">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <HardDrive className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-foreground">
                    Armazenamento
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    Laudos, exames e termos em PDF
                  </p>
                </div>
              </div>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${storageColor.badgeBg} ${storageColor.text} ${storageColor.badgeBorder}`}
              >
                {storage.isExceeded ? 'Espaço Cheio' : `${storage.percentage}%`}
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-baseline justify-between text-xs">
                <span className="font-semibold text-foreground text-base">
                  {storage.usedMB}{' '}
                  <span className="text-xs font-normal text-muted-foreground">
                    de {storage.limitMB >= 1024 ? `${storage.limitMB / 1024} GB` : `${storage.limitMB} MB`}
                  </span>
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {Math.max(0, Math.round(storage.limitMB - storage.usedMB))} MB livres
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${storageColor.bg}`}
                  style={{
                    width: `${Math.min(100, Math.max(0, storage.percentage))}%`,
                  }}
                />
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
              <span>Espaço seguro e isolado por clínica</span>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
