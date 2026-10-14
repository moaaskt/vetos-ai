import { useState, useEffect, type FormEvent } from 'react';
import { vaccinesApi } from '../../api/vaccines';
import type {
  UpcomingVaccineReminder,
  VaccineWindow,
} from '../../api/vaccines';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Modal } from '../Modal';
import { EmptyState } from '../EmptyState';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  Loader2,
  Mail,
  MessageSquare,
  PawPrint,
  RefreshCw,
  Search,
  Send,
  ShieldAlert,
  Syringe,
  User,
  XCircle,
} from 'lucide-react';

interface VaccineRemindersQueueProps {
  onRefreshStats?: () => void;
}

export function VaccineRemindersQueue({ onRefreshStats }: VaccineRemindersQueueProps) {
  const [reminders, setReminders] = useState<UpcomingVaccineReminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [activeWindow, setActiveWindow] = useState<'ALL' | VaccineWindow>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Manual Trigger Modal
  const [selectedReminder, setSelectedReminder] = useState<UpcomingVaccineReminder | null>(null);
  const [sendViaEmail, setSendViaEmail] = useState(true);
  const [sendViaWhatsapp, setSendViaWhatsapp] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  async function loadReminders() {
    setIsLoading(true);
    setError(null);
    try {
      const data = await vaccinesApi.getUpcomingReminders({
        window: activeWindow === 'ALL' ? undefined : (activeWindow as any),
        search: searchQuery.trim() || undefined,
      });
      setReminders(data);
    } catch {
      setError('Não foi possível carregar a fila de vacinas.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadReminders();
  }, [activeWindow]);

  function handleSearchSubmit(e: FormEvent) {
    e.preventDefault();
    loadReminders();
  }

  function openTriggerModal(reminder: UpcomingVaccineReminder) {
    setSelectedReminder(reminder);
    setSendViaEmail(Boolean(reminder.pet.client.email));
    setSendViaWhatsapp(Boolean(reminder.pet.client.phone));
    setFeedbackMessage(null);
  }

  function closeTriggerModal() {
    setSelectedReminder(null);
    setIsSubmitting(false);
  }

  async function handleConfirmTrigger() {
    if (!selectedReminder) return;

    const channels: ('EMAIL' | 'WHATSAPP')[] = [];
    if (sendViaEmail && selectedReminder.pet.client.email) channels.push('EMAIL');
    if (sendViaWhatsapp && selectedReminder.pet.client.phone) channels.push('WHATSAPP');

    if (channels.length === 0) {
      setFeedbackMessage({
        type: 'error',
        text: 'Selecione pelo menos um canal de envio ativo com contato cadastrado.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await vaccinesApi.triggerReminder(selectedReminder.id, channels);
      setFeedbackMessage({
        type: 'success',
        text: res.message || 'Lembrete enviado com sucesso!',
      });
      setTimeout(() => {
        closeTriggerModal();
        loadReminders();
        if (onRefreshStats) onRefreshStats();
      }, 1200);
    } catch (err: any) {
      const message =
        err.response?.data?.message || 'Falha ao enfileirar notificação manual.';
      setFeedbackMessage({
        type: 'error',
        text: message,
      });
      setIsSubmitting(false);
    }
  }

  function getWindowBadge(window: VaccineWindow, daysUntilDue: number) {
    switch (window) {
      case 'OVERDUE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/25">
            <ShieldAlert className="w-3.5 h-3.5" />
            Atrasada ({Math.abs(daysUntilDue)}d)
          </span>
        );
      case 'D0':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            Vence Hoje
          </span>
        );
      case 'D-1':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/25">
            <Clock className="w-3.5 h-3.5" />
            Vence Amanhã
          </span>
        );
      case 'D-7':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/25">
            <Calendar className="w-3.5 h-3.5" />
            Em {daysUntilDue} dias
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
            {daysUntilDue > 0 ? `Em ${daysUntilDue} dias` : 'Agendada'}
          </span>
        );
    }
  }

  function formatDate(dateStr: string) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  return (
    <div className="space-y-4">
      {/* Top Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-card p-4 rounded-xl border border-border/70 shadow-sm">
        {/* Quick Window Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          <Button
            size="sm"
            variant={activeWindow === 'ALL' ? 'default' : 'outline'}
            onClick={() => setActiveWindow('ALL')}
            className="text-xs h-8"
          >
            Todas
          </Button>
          <Button
            size="sm"
            variant={activeWindow === 'D0' ? 'default' : 'outline'}
            onClick={() => setActiveWindow('D0')}
            className={`text-xs h-8 ${
              activeWindow === 'D0' ? 'bg-amber-600 hover:bg-amber-700 text-white' : ''
            }`}
          >
            D0 - Hoje
          </Button>
          <Button
            size="sm"
            variant={activeWindow === 'D-1' ? 'default' : 'outline'}
            onClick={() => setActiveWindow('D-1')}
            className="text-xs h-8"
          >
            D-1 - Amanhã
          </Button>
          <Button
            size="sm"
            variant={activeWindow === 'D-7' ? 'default' : 'outline'}
            onClick={() => setActiveWindow('D-7')}
            className="text-xs h-8"
          >
            D-7 - Próx. 7 dias
          </Button>
          <Button
            size="sm"
            variant={activeWindow === 'OVERDUE' ? 'destructive' : 'outline'}
            onClick={() => setActiveWindow('OVERDUE')}
            className="text-xs h-8"
          >
            Atrasadas
          </Button>
        </div>

        {/* Search input */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 max-w-sm w-full">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar pet, tutor ou telefone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-xs bg-background"
            />
          </div>
          <Button type="submit" size="sm" variant="secondary" className="h-8 px-2.5 text-xs">
            <Filter className="h-3.5 w-3.5 mr-1" /> Filtrar
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={loadReminders}
            title="Recarregar fila"
            className="h-8 px-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </form>
      </div>

      {/* Main Table / State View */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-12 bg-card rounded-xl border border-border">
          <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
          <p className="text-sm text-muted-foreground">Carregando fila de vacinas e lembretes...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-600 dark:text-rose-400 text-sm flex items-center justify-between">
          <span>{error}</span>
          <Button size="sm" variant="outline" onClick={loadReminders}>
            Tentar Novamente
          </Button>
        </div>
      ) : reminders.length === 0 ? (
        <EmptyState
          title="Nenhuma vacina nesta janela"
          description="Não encontramos doses agendadas ou em atraso para o filtro selecionado."
          icon={Syringe}
          actionLabel="Ver Todas as Doses"
          onAction={() => {
            setActiveWindow('ALL');
            setSearchQuery('');
          }}
        />
      ) : (
        <div className="bg-card rounded-xl border border-border/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 border-b border-border text-xs uppercase font-medium text-muted-foreground">
                <tr>
                  <th className="py-3 px-4">Paciente (Pet)</th>
                  <th className="py-3 px-4">Tutor & Contato</th>
                  <th className="py-3 px-4">Vacina & Protocolo</th>
                  <th className="py-3 px-4">Vencimento / Janela</th>
                  <th className="py-3 px-4">Última Notificação</th>
                  <th className="py-3 px-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {reminders.map((reminder) => (
                  <tr
                    key={reminder.id}
                    className="hover:bg-muted/30 transition-colors group"
                  >
                    {/* Pet */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                          <PawPrint className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground leading-tight">
                            {reminder.pet.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {reminder.pet.species === 'DOG'
                              ? 'Cão'
                              : reminder.pet.species === 'CAT'
                              ? 'Gato'
                              : 'Outro'}
                            {reminder.pet.breed ? ` • ${reminder.pet.breed}` : ''}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Tutor */}
                    <td className="py-3 px-4">
                      <div className="space-y-0.5">
                        <p className="font-medium text-foreground text-xs flex items-center gap-1.5">
                          <User className="h-3 w-3 text-muted-foreground" />
                          {reminder.pet.client.name}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {reminder.pet.client.phone ? (
                            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-mono text-[11px]">
                              <MessageSquare className="h-3 w-3" />
                              {reminder.pet.client.phone}
                            </span>
                          ) : (
                            <span className="text-muted-foreground/60 text-[11px]">Sem tel.</span>
                          )}
                          {reminder.pet.client.email && (
                            <span className="inline-flex items-center gap-1 text-sky-600 dark:text-sky-400 text-[11px] truncate max-w-[140px]">
                              <Mail className="h-3 w-3" />
                              {reminder.pet.client.email}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Vacina & Protocolo */}
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-foreground flex items-center gap-1.5">
                          <Syringe className="h-3.5 w-3.5 text-primary" />
                          {reminder.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {reminder.protocol
                            ? `${reminder.protocol.name}${
                                reminder.protocolDose
                                  ? ` (Dose ${reminder.protocolDose.doseOrder})`
                                  : ''
                              }`
                            : 'Dose Isolada'}
                        </p>
                      </div>
                    </td>

                    {/* Vencimento / Janela */}
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <div className="text-xs font-medium text-foreground">
                          {formatDate(reminder.targetDate)}
                        </div>
                        <div>
                          {getWindowBadge(reminder.window, reminder.daysUntilDue)}
                        </div>
                      </div>
                    </td>

                    {/* Último Lembrete */}
                    <td className="py-3 px-4">
                      {reminder.lastNotification ? (
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1 text-xs">
                            {reminder.lastNotification.status === 'SENT' ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                            ) : reminder.lastNotification.status === 'FAILED' ? (
                              <XCircle className="h-3.5 w-3.5 text-rose-500" />
                            ) : (
                              <Clock className="h-3.5 w-3.5 text-amber-500" />
                            )}
                            <span className="font-medium text-foreground text-xs">
                              {reminder.lastNotification.channel === 'WHATSAPP'
                                ? 'WhatsApp'
                                : 'E-mail'}
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground">
                            {formatDate(
                              reminder.lastNotification.sentAt ||
                                reminder.lastNotification.createdAt,
                            )}
                          </p>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground/70 italic">
                          Nunca enviado
                        </span>
                      )}
                    </td>

                    {/* Ação: Disparar */}
                    <td className="py-3 px-4 text-right">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => openTriggerModal(reminder)}
                        className="h-8 text-xs font-medium shadow-none hover:bg-primary hover:text-primary-foreground transition-all"
                      >
                        <Send className="h-3.5 w-3.5 mr-1.5" />
                        Disparar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de Disparo Manual de Lembrete */}
      {selectedReminder && (
        <Modal
          title="Disparo Manual de Lembrete Vacinal"
          onClose={closeTriggerModal}
        >
          <div className="space-y-4">
            {/* Resumo do Destinatário */}
            <div className="p-3.5 bg-muted/40 rounded-lg border border-border/70 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Paciente:</span>
                <span className="text-xs font-semibold text-foreground">
                  {selectedReminder.pet.name} (
                  {selectedReminder.pet.species === 'DOG' ? 'Cão' : 'Gato'})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Tutor:</span>
                <span className="text-xs font-medium text-foreground">
                  {selectedReminder.pet.client.name}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Vacina:</span>
                <span className="text-xs font-medium text-primary">
                  {selectedReminder.name}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Vencimento:</span>
                <span className="text-xs font-semibold text-foreground">
                  {formatDate(selectedReminder.targetDate)}
                </span>
              </div>
            </div>

            {/* Seleção de Canais */}
            <div className="space-y-2.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Selecione os canais de envio:
              </label>

              {/* WhatsApp Meta Cloud API */}
              <label
                className={`flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                  sendViaWhatsapp
                    ? 'border-emerald-500/50 bg-emerald-500/5'
                    : 'border-border bg-background'
                } ${!selectedReminder.pet.client.phone ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <input
                  type="checkbox"
                  disabled={!selectedReminder.pet.client.phone}
                  checked={sendViaWhatsapp && Boolean(selectedReminder.pet.client.phone)}
                  onChange={(e) => setSendViaWhatsapp(e.target.checked)}
                  className="mt-1 rounded border-border text-emerald-600 focus:ring-emerald-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 font-medium text-xs text-foreground">
                    <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
                    WhatsApp Oficial (Meta Cloud API v20.0)
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {selectedReminder.pet.client.phone
                      ? `Destinatário: ${selectedReminder.pet.client.phone}`
                      : 'Nenhum telefone cadastrado na ficha do tutor'}
                  </p>
                </div>
              </label>

              {/* Email SMTP */}
              <label
                className={`flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                  sendViaEmail
                    ? 'border-sky-500/50 bg-sky-500/5'
                    : 'border-border bg-background'
                } ${!selectedReminder.pet.client.email ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <input
                  type="checkbox"
                  disabled={!selectedReminder.pet.client.email}
                  checked={sendViaEmail && Boolean(selectedReminder.pet.client.email)}
                  onChange={(e) => setSendViaEmail(e.target.checked)}
                  className="mt-1 rounded border-border text-sky-600 focus:ring-sky-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 font-medium text-xs text-foreground">
                    <Mail className="h-3.5 w-3.5 text-sky-600" />
                    E-mail (SMTP)
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {selectedReminder.pet.client.email
                      ? `Destinatário: ${selectedReminder.pet.client.email}`
                      : 'Nenhum e-mail cadastrado na ficha do tutor'}
                  </p>
                </div>
              </label>
            </div>

            {/* Feedback messages */}
            {feedbackMessage && (
              <div
                className={`p-3 rounded-lg text-xs font-medium ${
                  feedbackMessage.type === 'success'
                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                    : 'bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400'
                }`}
              >
                {feedbackMessage.text}
              </div>
            )}

            {/* Ações */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={closeTriggerModal}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleConfirmTrigger}
                disabled={isSubmitting || (!sendViaEmail && !sendViaWhatsapp)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                    Enfileirando...
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5 mr-1.5" />
                    Enviar Lembrete Agora
                  </>
                )}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
