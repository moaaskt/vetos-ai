import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FileText,
  Mail,
  MessageSquare,
  Info,
  CheckCircle,
  XCircle,
  Loader2,
  ArrowLeft,
} from 'lucide-react'
import { notificationsApi } from '../../api/notifications'
import type { NotificationTemplate } from '../../api/notifications'

export function NotificationTemplatesPage() {
  const [templates, setTemplates] = useState<NotificationTemplate[]>([])
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null)
  const [isSavingTemplate, setIsSavingTemplate] = useState(false)
  const [templateSubject, setTemplateSubject] = useState('')
  const [templateBody, setTemplateBody] = useState('')
  const [templateActive, setTemplateActive] = useState(true)

  // Global Alert
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const showAlert = (message: string, type: 'success' | 'error' = 'success') => {
    setAlert({ message, type })
    setTimeout(() => setAlert(null), 5000)
  }

  const loadTemplates = async () => {
    setIsLoadingTemplates(true)
    try {
      const data = await notificationsApi.getTemplates()
      setTemplates(data)
    } catch (err) {
      console.error(err)
      showAlert('Falha ao carregar os templates de mensagem.', 'error')
    } finally {
      setIsLoadingTemplates(false)
    }
  }

  useEffect(() => {
    loadTemplates()
  }, [])

  const handleEditTemplate = (template: NotificationTemplate) => {
    setEditingTemplate(template)
    setTemplateSubject(template.subject || '')
    setTemplateBody(template.body)
    setTemplateActive(template.active)
  }

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTemplate) return
    setIsSavingTemplate(true)
    try {
      await notificationsApi.updateTemplate({
        event: editingTemplate.event,
        channel: editingTemplate.channel,
        subject: editingTemplate.channel === 'EMAIL' ? templateSubject : undefined,
        body: templateBody,
        active: templateActive,
      })
      showAlert('Modelo de mensagem atualizado com sucesso!')
      setEditingTemplate(null)
      loadTemplates()
    } catch (err: any) {
      console.error(err)
      showAlert(err.response?.data?.message || 'Erro ao salvar modelo.', 'error')
    } finally {
      setIsSavingTemplate(false)
    }
  }

  const handleToggleTemplateActive = async (template: NotificationTemplate) => {
    try {
      await notificationsApi.updateTemplate({
        event: template.event,
        channel: template.channel,
        subject: template.subject || undefined,
        body: template.body,
        active: !template.active,
      })
      showAlert(`Modelo ${!template.active ? 'ativado' : 'desativado'} com sucesso!`)
      loadTemplates()
    } catch (err) {
      console.error(err)
      showAlert('Erro ao alterar status do modelo.', 'error')
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
      default:
        return event
    }
  }

  const getPlaceholdersForEvent = (event: string) => {
    const common = ['{{clientName}}', '{{petName}}']
    switch (event) {
      case 'APPOINTMENT_CREATED':
      case 'APPOINTMENT_REMINDER_24H':
      case 'APPOINTMENT_REMINDER_2H':
      case 'APPOINTMENT_FOLLOW_UP':
        return [...common, '{{appointmentDate}}']
      case 'VACCINE_EXPIRATION':
        return [...common, '{{vaccineName}}', '{{vaccineDate}}']
      case 'RETENTION':
        return [...common]
      default:
        return common
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
            <span className="text-foreground font-medium">Modelos</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <FileText className="h-6 w-6 text-primary" />
            Modelos de Notificação (Templates)
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            Customize o assunto e o corpo das mensagens automáticas enviadas aos tutores.
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

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        {isLoadingTemplates ? (
          <div className="p-12 flex flex-col items-center justify-center text-muted-foreground gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span>Carregando modelos de notificação...</span>
          </div>
        ) : templates.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            Nenhum template encontrado para esta clínica.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-muted/20 border-b border-border text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  <th className="px-6 py-3">Evento de Disparo</th>
                  <th className="px-6 py-3">Canal</th>
                  <th className="px-6 py-3">Assunto / Prévia</th>
                  <th className="px-6 py-3 text-center">Status</th>
                  <th className="px-6 py-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {templates.map((template) => (
                  <tr key={template.id} className="hover:bg-muted/10 transition-colors align-middle">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-xs md:text-sm">{getEventLabel(template.event)}</span>
                        <span className="text-[10px] text-muted-foreground font-mono mt-0.5">{template.event}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {template.channel === 'EMAIL' ? (
                        <span className="inline-flex items-center gap-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded text-xs font-medium">
                          <Mail className="h-3 w-3" /> E-mail
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded text-xs font-medium">
                          <MessageSquare className="h-3 w-3" /> WhatsApp
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 max-w-xs md:max-w-md">
                      <div className="truncate flex flex-col pr-4">
                        {template.channel === 'EMAIL' && (
                          <span className="font-medium text-xs truncate">Assunto: {template.subject || '(Sem assunto)'}</span>
                        )}
                        <span className="text-xs text-muted-foreground truncate">{template.body}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center">
                        <button
                          onClick={() => handleToggleTemplateActive(template)}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            template.active ? 'bg-primary' : 'bg-muted'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                              template.active ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleEditTemplate(template)}
                        className="text-xs font-bold text-primary hover:text-primary/85 hover:underline cursor-pointer"
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DRAWER / MODAL: EDIT TEMPLATE */}
      {editingTemplate && (
        <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
          <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm" onClick={() => setEditingTemplate(null)} />
          <div className="bg-card border-l border-border w-full max-w-xl p-6 shadow-2xl z-10 flex flex-col justify-between h-full animate-in slide-in-from-right duration-300">
            <div className="space-y-6 overflow-y-auto pr-1 flex-1">
              <div>
                <h3 className="text-lg font-bold text-foreground">Editar Modelo de Mensagem</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Customização de gatilhos e templates de notificação da clínica.
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 bg-muted/40 border border-border/60 p-3 rounded-xl text-xs">
                  <div>
                    <span className="text-muted-foreground block uppercase font-bold text-[10px]">Gatilho</span>
                    <span className="font-semibold text-foreground">{getEventLabel(editingTemplate.event)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block uppercase font-bold text-[10px]">Canal</span>
                    <span className="font-semibold text-foreground flex items-center gap-1 mt-0.5">
                      {editingTemplate.channel === 'EMAIL' ? <Mail className="h-3.5 w-3.5 text-blue-500" /> : <MessageSquare className="h-3.5 w-3.5 text-emerald-500" />}
                      {editingTemplate.channel}
                    </span>
                  </div>
                </div>

                {editingTemplate.channel === 'EMAIL' && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Assunto do E-mail</label>
                    <input
                      type="text"
                      value={templateSubject}
                      onChange={(e) => setTemplateSubject(e.target.value)}
                      placeholder="Insira o assunto"
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      required
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Conteúdo da Mensagem</label>
                  <textarea
                    rows={8}
                    value={templateBody}
                    onChange={(e) => setTemplateBody(e.target.value)}
                    placeholder="Digite a mensagem..."
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-sans leading-relaxed"
                    required
                  />
                </div>

                <div className="flex items-center justify-between border border-border/80 p-3 rounded-xl">
                  <div>
                    <span className="text-xs font-semibold text-foreground block">Modelo Ativo</span>
                    <span className="text-[10px] text-muted-foreground">Se desativado, notificações para este gatilho e canal não serão enviadas.</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={templateActive}
                      onChange={(e) => setTemplateActive(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div className="p-3 bg-muted/40 border border-border/50 rounded-xl space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                    <Info className="h-3.5 w-3.5 text-primary" />
                    <span>Variáveis disponíveis para este modelo</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {getPlaceholdersForEvent(editingTemplate.event).map((placeholder) => (
                      <button
                        key={placeholder}
                        type="button"
                        onClick={() => setTemplateBody(templateBody + ' ' + placeholder)}
                        title="Clique para inserir no texto"
                        className="text-[10px] bg-card hover:bg-muted font-bold font-mono text-primary border border-border/80 px-2 py-1 rounded transition-colors cursor-pointer"
                      >
                        {placeholder}
                      </button>
                    ))}
                  </div>
                  <span className="text-[10px] text-muted-foreground block mt-1">
                    Dica: Clique no botão da variável acima para inseri-la automaticamente no final do seu texto.
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t border-border/50 pt-4">
              <button
                type="button"
                onClick={() => setEditingTemplate(null)}
                className="px-4 py-2 text-xs font-bold border border-border hover:bg-muted text-muted-foreground rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveTemplate}
                disabled={isSavingTemplate}
                className="px-5 py-2 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/95 rounded-xl inline-flex items-center gap-1.5 disabled:opacity-50 transition-colors cursor-pointer shadow-sm"
              >
                {isSavingTemplate ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                Salvar Modelo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
