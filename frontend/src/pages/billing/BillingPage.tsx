import { useState, useEffect } from 'react';
import { billingApi } from '../../api/billing';
import type { ResourceUsageMetrics } from '../../api/billing';
import { PageHeader } from '../../components/PageHeader';
import { ResourceUsageMeter } from '../../components/billing/ResourceUsageMeter';
import { PlansComparisonModal } from '../../components/billing/PlansComparisonModal';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import {
  CreditCard,
  Crown,
  HelpCircle,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';

export function BillingPage() {
  const [data, setData] = useState<ResourceUsageMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  async function loadSubscription() {
    setIsLoading(true);
    setError(null);
    try {
      const res = await billingApi.getSubscription();
      setData(res);
    } catch {
      setError('Não foi possível carregar as informações de faturamento da clínica.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadSubscription();
  }, []);

  function getPlanIcon(name: string) {
    switch (name?.toLowerCase()) {
      case 'enterprise':
        return <Crown className="h-6 w-6 text-amber-500" />;
      case 'professional':
        return <Sparkles className="h-6 w-6 text-indigo-500" />;
      default:
        return <Zap className="h-6 w-6 text-sky-500" />;
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {/* Header */}
      <PageHeader
        title="Faturamento & Assinatura SaaS"
        description="Acompanhe o consumo de recursos contratados da sua clínica, limites mensais e gerencie seu plano de assinatura."
        badge="Gestão SaaS"
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadSubscription}
              disabled={isLoading}
              className="h-9 gap-1.5 text-xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            <Button
              size="sm"
              onClick={() => setIsModalOpen(true)}
              className="h-9 gap-1.5 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <CreditCard className="h-3.5 w-3.5" />
              Trocar de Plano
            </Button>
          </div>
        }
      />

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-12 bg-card rounded-xl border border-border">
          <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
          <p className="text-sm text-muted-foreground">
            Carregando cotas e faturamento da clínica...
          </p>
        </div>
      ) : error ? (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-600 dark:text-rose-400 text-sm flex items-center justify-between">
          <span>{error}</span>
          <Button size="sm" variant="outline" onClick={loadSubscription}>
            Tentar Novamente
          </Button>
        </div>
      ) : data ? (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          {/* Card de Resumo do Plano Atual */}
          <Card className="border-border/80 shadow-xs relative overflow-hidden bg-gradient-to-r from-card via-card to-primary/5">
            <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  {getPlanIcon(data.plan.name)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-foreground">
                      Plano {data.plan.name}
                    </h2>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                      Assinatura Ativa
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    ID da Assinatura: <span className="font-mono text-[11px]">{data.subscriptionId}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <Button
                  size="sm"
                  onClick={() => setIsModalOpen(true)}
                  className="text-xs font-semibold h-8"
                >
                  Fazer Upgrade / Trocar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Medidores de Recursos (Resource Usage Meter) */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Consumo de Recursos & Limites Contratados
            </h3>
            <ResourceUsageMeter
              metrics={data.metrics}
              onUpgradeClick={() => setIsModalOpen(true)}
            />
          </div>

          {/* Seção Informativa de Políticas SaaS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 bg-card rounded-xl border border-border/70 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <HelpCircle className="h-4 w-4 text-primary" />
                Como funcionam as cotas de equipe?
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Cada veterinário ou recepcionista cadastrado com acesso ao sistema ocupa 1 assento de equipe. Ao atingir o teto contratado, novos convites são temporariamente bloqueados até que seja feito o upgrade ou exclusão de membros inativos.
              </p>
            </div>

            <div className="p-4 bg-card rounded-xl border border-border/70 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <HelpCircle className="h-4 w-4 text-sky-500" />
                Renovação mensal de notificações
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Os envios de lembretes via Meta WhatsApp Oficial e E-mail são contabilizados mensalmente e resetados automaticamente no primeiro dia de cada mês às 00:00 UTC. Lembretes manuais e agendamentos respeitam o mesmo teto.
              </p>
            </div>

            <div className="p-4 bg-card rounded-xl border border-border/70 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <HelpCircle className="h-4 w-4 text-purple-500" />
                Armazenamento de exames e laudos
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                PDFs, imagens médicas e termos de consentimento assinados ficam armazenados em servidores isolados para cada clínica. O espaço total contratado pode ser expandido a qualquer momento sem interrupção dos serviços.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {/* Modal de Comparação e Troca de Planos */}
      {isModalOpen && data && (
        <PlansComparisonModal
          currentPlanId={data.plan.id}
          onClose={() => setIsModalOpen(false)}
          onPlanChanged={loadSubscription}
        />
      )}
    </div>
  );
}
