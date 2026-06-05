import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  History,
  Mail,
  MessageSquare,
  Check,
  XCircle,
  RotateCcw,
  Loader2,
  Eye,
  Search,
  CheckCircle,
  ArrowLeft,
} from 'lucide-react'
import { notificationsApi } from '../../api/notifications'
import type { NotificationLog, GetLogsParams } from '../../api/notifications'

export function NotificationLogsPage() {
  const [logs, setLogs] = useState<NotificationLog[]>([])
  const [totalLogs, setTotalLogs] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoadingLogs, setIsLoadingLogs] = useState(false)
  const [logsFilters, setLogsFilters] = useState<GetLogsParams>({
    page: 1,
    limit: 10,
    status: '',
    channel: '',
    event: '',
    to: '',
  })
  const [retryingLogId, setRetryingLogId] = useState<string | null>(null)
  const [selectedLogForPreview, setSelectedLogForPreview] = useState<NotificationLog | null>(null)

  // Global Alert
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const showAlert = (message: string, type: 'success' | 'error' = 'success') => {
    setAlert({ message, type })
    setTimeout(() => setAlert(null), 5000)
  }

  const loadLogs = async () => {
    setIsLoadingLogs(true)
    try {
      const data = await notificationsApi.getLogs(logsFilters)
      setLogs(data.items)
      setTotalLogs(data.total)
      setTotalPages(data.totalPages)
    } catch (err) {
      console.error(err)
      showAlert('Falha ao carregar o histórico de envios.', 'error')
    } finally {
      setIsLoadingLogs(false)
    }
  }

  useEffect(() => {
    loadLogs()
  }, [logsFilters.page, logsFilters.status, logsFilters.channel, logsFilters.event])

  const handleRetryLog = async (id: string) => {
    setRetryingLogId(id)
    try {
      await notificationsApi.retryNotification(id)
      showAlert('Envio enfileirado novamente com sucesso!')
      setTimeout(() => {
        loadLogs()
      }, 1000)
    } catch (err) {
      console.error(err)
      showAlert('Falha ao re-tentar o envio do log.', 'error')
    } finally {
      setRetryingLogId(null)
    }
  }

  const getEventLabel = (event: string) => {
    switch (event) {
      case 'APPOINTMENT_CREATED':
        return 'Agendamento Criado'
      case 'APPOINTMENT_REMINDER_24H':
        return 'Lembrete de Consulta (24h antes)'
      case 'APPOINTMENT_REMINDER_2H':
        return 'Lembrete de Consulta (2h antes)'
      case 'APPOINTMENT_FOLLOW_UP':
        return 'Acompanhamento Pós-Consulta'
      case 'VACCINE_EXPIRATION':
        return 'Vencimento de Vacina'
      case 'RETENTION':
        return 'Reengajamento de Clientes Inativos'
      case 'TEST_EMAIL':
        return 'Teste de E-mail'
      case 'TEST_WHATSAPP':
        return 'Teste de WhatsApp'
      default:
        return event
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-300">
      {/* Alert Header */}
      {alert && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg flex items-center gap-3 border transition-all animate-in fade-in slide-in-from-top duration-300 ${
            alert.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
              : 'bg-destructive/10 border-destructive/20 text-destructive'
          }`}
        >
          {alert.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
          <span className="text-sm font-semibold">{alert.message}</span>
        </div>
      )}

      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <Link to="/settings" className="hover:text-foreground transition-colors cursor-pointer">Configurações</Link>
            <span>/</span>
            <Link to="/settings/messaging" className="hover:text-foreground transition-colors cursor-pointer">Mensageria</Link>
            <span>/</span>
            <span className="text-foreground font-medium">Histórico</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <History className="h-6 w-6 text-primary" />
            Histórico de Envios (Logs)
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            Monitore o status e veja o conteúdo de todas as mensagens enviadas aos tutores.
          </p>
        </div>
        <Link
          to="/settings/messaging"
          className="px-4 py-2 text-xs font-bold border border-border hover:bg-muted/80 rounded-xl text-foreground inline-flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Voltar ao Hub
        </Link>
      </div>

      {/* Filters bar */}
      <div className="bg-card border border-border p-4 rounded-2xl shadow-sm flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[200px] relative">
          <input
            type="text"
            placeholder="Pesquisar por destinatário..."
            value={logsFilters.to || ''}
            onChange={(e) => setLogsFilters({ ...logsFilters, to: e.target.value })}
            className="w-full rounded-lg border border-border bg-background pl-8 pr-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
        </div>

        {/* Status filter */}
        <select
          value={logsFilters.status || ''}
          onChange={(e) => setLogsFilters({ ...logsFilters, status: e.target.value, page: 1 })}
          className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
        >
          <option value="">Todos os status</option>
          <option value="SENT">Enviado</option>
          <option value="FAILED">Falhou</option>
          <option value="PENDING">Pendente</option>
        </select>

        {/* Channel filter */}
        <select
          value={logsFilters.channel || ''}
          onChange={(e) => setLogsFilters({ ...logsFilters, channel: e.target.value, page: 1 })}
          className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
        >
          <option value="">Todos os canais</option>
          <option value="EMAIL">E-mail</option>
          <option value="WHATSAPP">WhatsApp</option>
        </select>

        {/* Event filter */}
        <select
          value={logsFilters.event || ''}
          onChange={(e) => setLogsFilters({ ...logsFilters, event: e.target.value, page: 1 })}
          className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
        >
          <option value="">Todos os gatilhos</option>
          <option value="APPOINTMENT_CREATED">Agendamento Criado</option>
          <option value="APPOINTMENT_REMINDER_24H">Lembrete 24h</option>
          <option value="APPOINTMENT_REMINDER_2H">Lembrete 2h</option>
          <option value="APPOINTMENT_FOLLOW_UP">Acompanhamento</option>
          <option value="VACCINE_EXPIRATION">Vacinação</option>
          <option value="RETENTION">Reengajamento</option>
          <option value="TEST_EMAIL">Teste de E-mail</option>
          <option value="TEST_WHATSAPP">Teste de WhatsApp</option>
        </select>

        <button
          onClick={loadLogs}
          className="px-3.5 py-1.5 bg-secondary text-secondary-foreground hover:bg-muted text-xs font-bold rounded-lg border border-border transition-colors cursor-pointer"
        >
          Filtrar
        </button>
      </div>

      {/* Table Area */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        {isLoadingLogs ? (
          <div className="p-12 flex flex-col items-center justify-center text-muted-foreground gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span>Carregando histórico...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground text-sm">
            Nenhum registro de notificação encontrado com os filtros atuais.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-muted/20 border-b border-border text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  <th className="px-6 py-3">Destinatário</th>
                  <th className="px-6 py-3">Canal / Gatilho</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Data de Envio</th>
                  <th className="px-6 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/10 transition-colors align-middle">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-xs md:text-sm">{log.to}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {log.client?.name || log.appointment?.client?.name || 'Cliente Geral'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        {log.channel === 'EMAIL' ? (
                          <span className="inline-flex items-center gap-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded text-[10px] font-bold">
                            <Mail className="h-2.5 w-2.5" /> E-MAIL
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold">
                            <MessageSquare className="h-2.5 w-2.5" /> WHATSAPP
                          </span>
                        )}
                        <span className="text-xs bg-muted border border-border px-2 py-0.5 rounded text-muted-foreground max-w-[150px] truncate">
                          {getEventLabel(log.event)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {log.status === 'SENT' ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold">
                          <Check className="h-3 w-3" /> ENVIADO
                        </span>
                      ) : log.status === 'FAILED' ? (
                        <div className="flex flex-col items-start gap-1">
                          <span className="inline-flex items-center gap-1 bg-destructive/10 text-destructive px-2 py-0.5 rounded text-[10px] font-bold">
                            <XCircle className="h-3 w-3" /> FALHOU
                          </span>
                          {log.errorMessage && (
                            <span className="text-[10px] text-destructive max-w-[180px] truncate" title={log.errorMessage}>
                              {log.errorMessage}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded text-[10px] font-bold">
                          <Loader2 className="h-3 w-3 animate-spin" /> PENDENTE
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">
                      {new Date(log.createdAt).toLocaleString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setSelectedLogForPreview(log)}
                          title="Visualizar mensagem"
                          className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        {log.status === 'FAILED' && (
                          <button
                            onClick={() => handleRetryLog(log.id)}
                            disabled={retryingLogId === log.id}
                            title="Reenviar notificação"
                            className="p-1.5 rounded-lg border border-border hover:bg-muted text-primary hover:text-primary/90 transition-colors disabled:opacity-50 cursor-pointer"
                          >
                            {retryingLogId === log.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <RotateCcw className="h-3.5 w-3.5" />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="bg-muted/10 border-t border-border px-6 py-3.5 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Página <strong>{logsFilters.page}</strong> de <strong>{totalPages}</strong> (Total de {totalLogs} registros)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLogsFilters({ ...logsFilters, page: Number(logsFilters.page) - 1 })}
                disabled={Number(logsFilters.page) === 1}
                className="px-3 py-1.5 text-xs border border-border rounded-lg hover:bg-muted disabled:opacity-50 cursor-pointer font-semibold transition-colors"
              >
                Anterior
              </button>
              <button
                onClick={() => setLogsFilters({ ...logsFilters, page: Number(logsFilters.page) + 1 })}
                disabled={Number(logsFilters.page) === totalPages}
                className="px-3 py-1.5 text-xs border border-border rounded-lg hover:bg-muted disabled:opacity-50 cursor-pointer font-semibold transition-colors"
              >
                Próxima
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: LOG MESSAGE PREVIEW */}
      {selectedLogForPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-200">
          <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm" onClick={() => setSelectedLogForPreview(null)} />
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg p-6 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-200 flex flex-col space-y-4">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <div>
                <h3 className="text-base font-bold text-foreground">Conteúdo da Notificação</h3>
                <span className="text-[10px] text-muted-foreground font-mono mt-0.5">ID: {selectedLogForPreview.id}</span>
              </div>
              <button
                onClick={() => setSelectedLogForPreview(null)}
                className="text-xs font-bold hover:underline text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Fechar
              </button>
            </div>

            <div className="space-y-3 text-xs md:text-sm">
              <div className="grid grid-cols-3 gap-2 border-b border-border/30 pb-2">
                <span className="text-muted-foreground font-semibold">Destinatário:</span>
                <span className="col-span-2 font-mono text-foreground font-semibold">{selectedLogForPreview.to}</span>
              </div>
              {selectedLogForPreview.subject && (
                <div className="grid grid-cols-3 gap-2 border-b border-border/30 pb-2">
                  <span className="text-muted-foreground font-semibold">Assunto:</span>
                  <span className="col-span-2 font-medium text-foreground">{selectedLogForPreview.subject}</span>
                </div>
              )}
              <div className="grid grid-cols-3 gap-2 border-b border-border/30 pb-2">
                <span className="text-muted-foreground font-semibold">Gatilho / Evento:</span>
                <span className="col-span-2 text-foreground font-medium">{getEventLabel(selectedLogForPreview.event)}</span>
              </div>
              <div className="space-y-1.5">
                <span className="text-muted-foreground font-semibold block">Texto Enviado:</span>
                <div className="bg-muted/40 border border-border/80 rounded-xl p-3.5 text-xs text-foreground font-sans whitespace-pre-wrap leading-relaxed">
                  {selectedLogForPreview.body}
                </div>
              </div>
              {selectedLogForPreview.errorMessage && (
                <div className="p-3 bg-destructive/10 border border-destructive/15 text-destructive rounded-xl space-y-1">
                  <span className="font-bold text-[11px] block">Mensagem de Erro do Servidor:</span>
                  <p className="text-[11px] font-mono leading-relaxed">{selectedLogForPreview.errorMessage}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
