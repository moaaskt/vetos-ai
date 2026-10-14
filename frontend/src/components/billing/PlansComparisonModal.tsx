import { useState, useEffect } from 'react';
import type { SaaSPlan } from '../../api/billing';
import { billingApi } from '../../api/billing';
import { Modal } from '../Modal';
import { Button } from '../ui/button';
import {
  Check,
  Crown,
  Loader2,
  Sparkles,
  Zap,
} from 'lucide-react';

interface PlansComparisonModalProps {
  currentPlanId: string;
  onClose: () => void;
  onPlanChanged: () => void;
}

export function PlansComparisonModal({
  currentPlanId,
  onClose,
  onPlanChanged,
}: PlansComparisonModalProps) {
  const [plans, setPlans] = useState<SaaSPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [changingPlanId, setChangingPlanId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  useEffect(() => {
    async function loadPlans() {
      setIsLoading(true);
      try {
        const data = await billingApi.getPlans();
        setPlans(data);
      } catch {
        setFeedback({
          type: 'error',
          text: 'Não foi possível carregar os planos disponíveis.',
        });
      } finally {
        setIsLoading(false);
      }
    }
    loadPlans();
  }, []);

  async function handleSelectPlan(plan: SaaSPlan) {
    if (plan.id === currentPlanId) return;

    setChangingPlanId(plan.id);
    setFeedback(null);
    try {
      const res = await billingApi.changePlan(plan.id);
      setFeedback({
        type: 'success',
        text: res.message || `Plano alterado para ${plan.name} com sucesso!`,
      });
      setTimeout(() => {
        onPlanChanged();
        onClose();
      }, 1200);
    } catch (err: any) {
      setFeedback({
        type: 'error',
        text:
          err.response?.data?.message || 'Falha ao alterar o plano da clínica.',
      });
      setChangingPlanId(null);
    }
  }

  function formatStorage(mb: number) {
    if (mb >= 1024) {
      return `${mb / 1024} GB`;
    }
    return `${mb} MB`;
  }

  function getFeatureLabel(key: string) {
    const labels: Record<string, string> = {
      email_notifications: 'Notificações por E-mail (SMTP)',
      whatsapp_notifications: 'WhatsApp Oficial (Meta Cloud API)',
      calendar: 'Agenda de Consultas e Vacinas',
      analytics: 'Relatórios Operacionais e Retorno',
      signatures: 'Assinatura Digital de Termos e Laudos',
      ai_copilot: 'AI Copilot Veterinário',
    };
    return labels[key] || key;
  }

  function getPlanIcon(name: string) {
    switch (name.toLowerCase()) {
      case 'enterprise':
        return <Crown className="h-5 w-5 text-amber-500" />;
      case 'professional':
        return <Sparkles className="h-5 w-5 text-indigo-500" />;
      default:
        return <Zap className="h-5 w-5 text-sky-500" />;
    }
  }

  return (
    <Modal title="Planos de Assinatura VetOS AI" onClose={onClose}>
      <div className="space-y-4">
        <p className="text-xs text-muted-foreground">
          Escolha o plano que melhor atende à escala de atendimento da sua clínica veterinária.
        </p>

        {feedback && (
          <div
            className={`p-3 rounded-lg text-xs font-medium ${
              feedback.type === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                : 'bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400'
            }`}
          >
            {feedback.text}
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-8 space-y-2">
            <Loader2 className="h-6 w-6 text-primary animate-spin" />
            <span className="text-xs text-muted-foreground">Carregando planos...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {plans.map((plan) => {
              const isCurrent = plan.id === currentPlanId;
              const isChanging = changingPlanId === plan.id;

              return (
                <div
                  key={plan.id}
                  className={`p-4 rounded-xl border flex flex-col justify-between transition-all relative ${
                    isCurrent
                      ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                      : 'border-border/80 bg-card hover:border-primary/50'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-foreground">
                        {getPlanIcon(plan.name)}
                        <span>{plan.name}</span>
                      </div>
                      {isCurrent && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
                          Plano Atual
                        </span>
                      )}
                    </div>

                    {/* Cotas Resumidas */}
                    <div className="space-y-1.5 py-2 border-y border-border/60 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Equipe:</span>
                        <span className="font-semibold text-foreground">
                          {plan.maxStaffSeats >= 999 ? 'Ilimitado' : `Até ${plan.maxStaffSeats} membros`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Notificações:</span>
                        <span className="font-semibold text-foreground">
                          {plan.maxNotifications >= 99999 ? 'Ilimitado' : `${plan.maxNotifications}/mês`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Armazenamento:</span>
                        <span className="font-semibold text-foreground">
                          {formatStorage(plan.maxStorage)}
                        </span>
                      </div>
                    </div>

                    {/* Features List */}
                    <div className="space-y-1.5 text-xs">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                        Recursos inclusos:
                      </p>
                      <ul className="space-y-1">
                        {plan.features.map((feat, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-1.5 text-[11px] text-muted-foreground"
                          >
                            <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{getFeatureLabel(feat)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-4 mt-2">
                    <Button
                      size="sm"
                      variant={isCurrent ? 'outline' : 'default'}
                      disabled={isCurrent || isChanging || changingPlanId !== null}
                      onClick={() => handleSelectPlan(plan)}
                      className="w-full text-xs font-semibold h-8"
                    >
                      {isChanging ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                          Atualizando...
                        </>
                      ) : isCurrent ? (
                        'Seu Plano Ativo'
                      ) : (
                        'Mudar para este Plano'
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
}
