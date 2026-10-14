import { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { VaccineRemindersQueue } from '../components/vaccines/VaccineRemindersQueue';
import { VaccineConversionStats } from '../components/vaccines/VaccineConversionStats';
import { VaccineProtocolsPage } from './settings/VaccineProtocolsPage';
import { Button } from '../components/ui/button';
import {
  BarChart3,
  BellRing,
  CalendarCheck,
  CheckCircle2,
  Layers,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Syringe,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function VaccinesManagementPage() {
  const [activeTab, setActiveTab] = useState<'reminders' | 'analytics' | 'protocols'>('reminders');
  const [refreshStatsTrigger, setRefreshStatsTrigger] = useState(0);

  function handleReminderDispatched() {
    setRefreshStatsTrigger((prev) => prev + 1);
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {/* Page Header */}
      <PageHeader
        title="Gestão de Imunização e Vacinas"
        description="Fila operacional de vacinas, observabilidade dos lembretes automáticos (Meta WhatsApp & E-mail) e saúde preventiva de pacientes."
        badge="Saúde Preventiva"
        action={
          <div className="flex items-center gap-2">
            <Link to="/settings/messaging">
              <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs">
                <MessageSquare className="h-3.5 w-3.5" />
                Configurar Mensageria
              </Button>
            </Link>
            <Button
              size="sm"
              onClick={() => setActiveTab('protocols')}
              className="h-9 gap-1.5 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Syringe className="h-3.5 w-3.5" />
              Protocolos Vacinais
            </Button>
          </div>
        }
      />

      {/* Tabs Navigation */}
      <div className="flex items-center border-b border-border/80 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('reminders')}
          className={`flex items-center gap-2 pb-3 px-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'reminders'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <BellRing className="h-4 w-4" />
          Fila de Lembretes & Disparos
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 pb-3 px-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'analytics'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          Métricas de Conversão
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('protocols')}
          className={`flex items-center gap-2 pb-3 px-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'protocols'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Layers className="h-4 w-4" />
          Protocolos da Clínica
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'reminders' && (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          {/* Quick Metrics Summary Bar */}
          <VaccineConversionStats onRefreshTrigger={refreshStatsTrigger} />

          {/* Operational Queue Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                  <CalendarCheck className="h-4 w-4 text-primary" />
                  Fila de Doses & Intervenção Manual
                </h2>
                <p className="text-xs text-muted-foreground">
                  Pacientes com vencimento em janelas D0 (Hoje), D-1 (Amanhã), D-7 (Próxima semana) ou com imunização atrasada.
                </p>
              </div>
            </div>

            <VaccineRemindersQueue onRefreshStats={handleReminderDispatched} />
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          <VaccineConversionStats onRefreshTrigger={refreshStatsTrigger} />

          {/* Clinical Insights Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 bg-card rounded-xl border border-border/80 space-y-3">
              <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                Como funciona o Motor de Vacinas (Phase 14A)
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Diariamente às <strong>02:00 UTC</strong>, o sistema varre a agenda de imunizações de todos os pacientes ativos da clínica. Doses que vencem hoje (D0), amanhã (D-1) e em 7 dias (D-7) são enfileiradas automaticamente no BullMQ e disparadas via <strong>Meta WhatsApp Cloud API v20.0</strong> ou <strong>E-mail</strong> para os tutores.
              </p>
              <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Deduplicação automática previne envio repetido para a mesma dose.
              </div>
            </div>

            <div className="p-5 bg-card rounded-xl border border-border/80 space-y-3">
              <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
                <Sparkles className="h-4 w-4 text-primary" />
                Boas Práticas de Retenção Vacinal
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                A taxa de conversão calcula a proporção de doses que foram notificadas e efetivamente aplicadas na clínica dentro da janela esperada. Intervenções ativas por mensagem direta no WhatsApp com pacientes em <em>Atraso Crítico (&gt;15 dias)</em> aumentam a adesão em até 40%.
              </p>
              <div className="flex items-center gap-2 text-xs text-primary font-medium">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Dispare lembretes manuais diretamente pela tabela de fila para recuperar tutores inativos.
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'protocols' && (
        <div className="animate-in fade-in-50 duration-200">
          <VaccineProtocolsPage />
        </div>
      )}
    </div>
  );
}
