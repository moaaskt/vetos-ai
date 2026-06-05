import React, { useEffect, useState } from 'react'
import {
  Bell,
  Mail,
  MessageSquare,
  Settings,
  History,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Loader2,
  Lock,
  Search,
  Eye,
  Info,
  Check,
} from 'lucide-react'
import { notificationsApi } from '../../api/notifications'
import type {
  NotificationConfig,
  NotificationTemplate,
  NotificationLog,
  GetLogsParams,
} from '../../api/notifications'

export function MessagingPage() {
  const [activeTab, setActiveTab] = useState<'config' | 'templates' | 'logs'>('config')

  // Config States
  const [config, setConfig] = useState<NotificationConfig | null>(null)
  const [isLoadingConfig, setIsLoadingConfig] = useState(true)
  const [isSavingConfig, setIsSavingConfig] = useState(false)
  const [isTestingSmtp, setIsTestingSmtp] = useState(false)
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false)
  const [testEmailDest, setTestEmailDest] = useState('')
  const [showTestEmailModal, setShowTestEmailModal] = useState(false)

  // Config Form
  const [smtpHost, setSmtpHost] = useState('')
  const [smtpPort, setSmtpPort] = useState(587)
  const [smtpUser, setSmtpUser] = useState('')
  const [smtpPassword, setSmtpPassword] = useState('')
  const [smtpFromName, setSmtpFromName] = useState('')
  const [smtpFromEmail, setSmtpFromEmail] = useState('')
  const [emailEnabled, setEmailEnabled] = useState(false)
  const [whatsappEnabled, setWhatsappEnabled] = useState(false)

  // Templates States
  const [templates, setTemplates] = useState<NotificationTemplate[]>([])
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null)
  const [isSavingTemplate, setIsSavingTemplate] = useState(false)
  const [templateSubject, setTemplateSubject] = useState('')
  const [templateBody, setTemplateBody] = useState('')
  const [templateActive, setTemplateActive] = useState(true)

  // Logs States
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

  // Load Config
  const loadConfig = async () => {
    setIsLoadingConfig(true)
    try {
      const data = await notificationsApi.getConfig()
      setConfig(data)
      setSmtpHost(data.smtpHost || '')
      setSmtpPort(data.smtpPort || 587)
      setSmtpUser(data.smtpUser || '')
      setSmtpPassword('') // Don't show password
      setSmtpFromName(data.smtpFromName || '')
      setSmtpFromEmail(data.smtpFromEmail || '')
      setEmailEnabled(data.emailEnabled)
      setWhatsappEnabled(data.whatsappEnabled)
    } catch (err: any) {
      console.error(err)
      showAlert('Falha ao carregar as configurações de notificação.', 'error')
    } finally {
      setIsLoadingConfig(false)
    }
  }

  // Load Templates
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

  // Load Logs
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
    if (activeTab === 'config') {
      loadConfig()
    } else if (activeTab === 'templates') {
      loadTemplates()
    } else if (activeTab === 'logs') {
      loadLogs()
    }
  }, [activeTab])

  useEffect(() => {
    if (activeTab === 'logs') {
      loadLogs()
    }
  }, [logsFilters.page, logsFilters.status, logsFilters.channel, logsFilters.event])

  // Save Config
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingConfig(true)
    try {
      const payload: any = {
        emailEnabled,
        smtpHost,
        smtpPort,
        smtpUser,
        smtpFromName,
        smtpFromEmail,
        whatsappEnabled,
      }
      if (smtpPassword) {
        payload.smtpPassword = smtpPassword
      }
      const data = await notificationsApi.updateConfig(payload)
      setConfig(data)
      setSmtpPassword('') // Clear input
      showAlert('Configurações salvas com sucesso!')
    } catch (err: any) {
      console.error(err)
      showAlert(err.response?.data?.message || 'Erro ao salvar configurações.', 'error')
    } finally {
      setIsSavingConfig(false)
    }
  }

  // Test Connection
  const handleTestConnection = async () => {
    setIsTestingSmtp(true)
    try {
      const result = await notificationsApi.testSmtpConnection()
      if (result.success) {
        showAlert('Conexão SMTP estabelecida e verificada com sucesso!')
      } else {
        showAlert(result.message || 'Falha ao testar conexão SMTP.', 'error')
      }
    } catch (err: any) {
      console.error(err)
      showAlert(err.response?.data?.message || 'Falha na conexão SMTP.', 'error')
    } finally {
      setIsTestingSmtp(false)
    }
  }

  // Send Test Email
  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!testEmailDest) return
    setIsSendingTestEmail(true)
    try {
      const result = await notificationsApi.sendTestEmail(testEmailDest)
      if (result.success) {
        showAlert(`E-mail de teste enviado com sucesso para ${testEmailDest}!`)
        setShowTestEmailModal(false)
        setTestEmailDest('')
      } else {
        showAlert(result.message || 'Falha ao enviar e-mail de teste.', 'error')
      }
    } catch (err: any) {
      console.error(err)
      showAlert(err.response?.data?.message || 'Falha ao enviar e-mail de teste.', 'error')
    } finally {
      setIsSendingTestEmail(false)
    }
  }

  // Open Template Editor
  const handleEditTemplate = (template: NotificationTemplate) => {
    setEditingTemplate(template)
    setTemplateSubject(template.subject || '')
    setTemplateBody(template.body)
    setTemplateActive(template.active)
  }

  // Save Template
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

  // Quick Toggle Template Status
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

  // Retry Log
  const handleRetryLog = async (id: string) => {
    setRetryingLogId(id)
    try {
      await notificationsApi.retryNotification(id)
      showAlert('Envio enfileirado novamente com sucesso!')
      // Espera um pouco e recarrega os logs para pegar o novo log pendente/enviado
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

  // Helper Labels
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
    <div className="space-y-6 max-w-6xl mx-auto">
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
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Bell className="h-6 w-6 text-primary" />
            Configuração de Mensageria
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            Gerencie servidores de e-mail, automatize templates e monitore o status de envio de notificações da clínica.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-muted/40 p-1.5 rounded-xl border border-border/80 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('config')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'config'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Settings className="h-3.5 w-3.5" />
            Canais de Envio
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'templates'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            Modelos (Templates)
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'logs'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <History className="h-3.5 w-3.5" />
            Histórico (Logs)
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="min-h-[400px]">
        {/* TAB 1: CONFIGURATION */}
        {activeTab === 'config' && (
          isLoadingConfig ? (
            <div className="p-12 flex flex-col items-center justify-center text-muted-foreground gap-3 bg-card rounded-2xl border border-border shadow-sm">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span>Carregando configurações de mensageria...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
              {/* SMTP Settings Form */}
              <form onSubmit={handleSaveConfig} className="lg:col-span-2 space-y-6">
                <div className="bg-card rounded-2xl border border-border p-6 shadow-sm space-y-6">
                  <div className="flex items-center justify-between border-b border-border/50 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                        <Mail className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="font-semibold text-foreground">Servidor de E-mail (SMTP)</h2>
                        <p className="text-xs text-muted-foreground">Configuração de credenciais para envios de e-mails reais.</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={emailEnabled}
                        onChange={(e) => setEmailEnabled(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      <span className="ml-2 text-xs font-medium text-foreground">Ativo</span>
                    </label>
                  </div>

                  {/* Form fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5 col-span-1 md:col-span-2">
                      <label className="text-xs font-semibold text-muted-foreground">Servidor Host SMTP</label>
                      <input
                        type="text"
                        value={smtpHost}
                        onChange={(e) => setSmtpHost(e.target.value)}
                        placeholder="ex: smtp.mailtrap.io ou smtp.gmail.com"
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        required={emailEnabled}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground">Porta SMTP</label>
                      <input
                        type="number"
                        value={smtpPort}
                        onChange={(e) => setSmtpPort(Number(e.target.value))}
                        placeholder="ex: 587 ou 465"
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        required={emailEnabled}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground">Usuário SMTP</label>
                      <input
                        type="text"
                        value={smtpUser}
                        onChange={(e) => setSmtpUser(e.target.value)}
                        placeholder="ex: seu-usuario@provedor.com"
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        required={emailEnabled}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                        Senha SMTP
                        {config?.hasSmtpPassword && (
                          <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded font-bold">Salva</span>
                        )}
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          value={smtpPassword}
                          onChange={(e) => setSmtpPassword(e.target.value)}
                          placeholder={config?.hasSmtpPassword ? "••••••••••••" : "Insira a senha do SMTP"}
                          className="w-full rounded-lg border border-border bg-background pl-8 pr-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                          required={emailEnabled && !config?.hasSmtpPassword}
                        />
                        <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground">E-mail do Remetente</label>
                      <input
                        type="email"
                        value={smtpFromEmail}
                        onChange={(e) => setSmtpFromEmail(e.target.value)}
                        placeholder="ex: notificacoes@suaclinica.com"
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        required={emailEnabled}
                      />
                    </div>

                    <div className="space-y-1.5 col-span-1 md:col-span-2">
                      <label className="text-xs font-semibold text-muted-foreground">Nome Exibido no Remetente</label>
                      <input
                        type="text"
                        value={smtpFromName}
                        onChange={(e) => setSmtpFromName(e.target.value)}
                        placeholder="ex: Clínica VetOS"
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div className="bg-muted/30 border border-border/50 rounded-xl p-3 flex gap-3 text-xs text-muted-foreground">
                    <Lock className="h-4 w-4 text-primary shrink-0" />
                    <span>
                      As informações confidenciais como a sua <strong>Senha SMTP</strong> são criptografadas localmente com chaves criptográficas específicas por tenant e ambiente antes de serem armazenadas de forma segura.
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/50 pt-4">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleTestConnection}
                        disabled={isTestingSmtp || !config?.id}
                        className="px-4 py-2 text-xs font-bold border border-border hover:bg-muted/80 rounded-xl text-foreground inline-flex items-center gap-1.5 disabled:opacity-50 transition-colors cursor-pointer"
                      >
                        {isTestingSmtp ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                        Testar Conexão SMTP
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowTestEmailModal(true)}
                        disabled={isSendingTestEmail || !config?.id}
                        className="px-4 py-2 text-xs font-bold border border-border hover:bg-muted/80 rounded-xl text-foreground inline-flex items-center gap-1.5 disabled:opacity-50 transition-colors cursor-pointer"
                      >
                        Enviar E-mail de Teste
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={isSavingConfig}
                      className="px-5 py-2 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/95 rounded-xl inline-flex items-center gap-1.5 disabled:opacity-50 transition-colors cursor-pointer shadow-sm"
                    >
                      {isSavingConfig ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                      Salvar Configurações
                    </button>
                  </div>
                </div>
              </form>

              {/* Sidebar for other channels (WhatsApp) */}
              <div className="space-y-6">
                {/* WhatsApp Card */}
                <div className="bg-card rounded-2xl border border-border p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-border/50 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                        <MessageSquare className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="font-semibold text-foreground">WhatsApp (Simulação)</h2>
                        <p className="text-xs text-muted-foreground">Envio de WhatsApp em sandbox.</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={whatsappEnabled}
                        onChange={(e) => setWhatsappEnabled(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      <span className="ml-2 text-xs font-medium text-foreground">Ativo</span>
                    </label>
                  </div>

                  <div className="p-3 bg-amber-500/10 border border-amber-500/15 text-amber-600 dark:text-amber-400 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 font-semibold text-xs">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      <span>Integração WhatsApp Mock Ativa</span>
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      Atualmente, o canal de WhatsApp está operando em modo <strong>Simulado (Mock)</strong>. As mensagens enviadas por aqui não serão entregues a aparelhos reais, mas serão registradas com sucesso no Histórico de Envios para testar os fluxos da plataforma.
                    </p>
                    <p className="text-[11px] font-medium leading-relaxed mt-1">
                      A integração real (Evolution API) está planejada para a próxima etapa (Wave 3B).
                    </p>
                  </div>
                </div>

                {/* Placeholders Card */}
                <div className="bg-card rounded-2xl border border-border p-6 shadow-sm space-y-3">
                  <h3 className="font-semibold text-xs text-foreground uppercase tracking-wider">Placeholders Suportados</h3>
                  <p className="text-xs text-muted-foreground">
                    Use as seguintes chaves nos seus modelos de mensagens para injetar dados dinâmicos das consultas e clientes:
                  </p>
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between text-xs border-b border-border/40 pb-1.5">
                      <code className="text-primary font-bold bg-primary/5 px-1.5 py-0.5 rounded">{"{{clientName}}"}</code>
                      <span className="text-muted-foreground text-[10px]">Nome do Tutor</span>
                    </div>
                    <div className="flex items-center justify-between text-xs border-b border-border/40 pb-1.5">
                      <code className="text-primary font-bold bg-primary/5 px-1.5 py-0.5 rounded">{"{{petName}}"}</code>
                      <span className="text-muted-foreground text-[10px]">Nome do Paciente</span>
                    </div>
                    <div className="flex items-center justify-between text-xs border-b border-border/40 pb-1.5">
                      <code className="text-primary font-bold bg-primary/5 px-1.5 py-0.5 rounded">{"{{appointmentDate}}"}</code>
                      <span className="text-muted-foreground text-[10px]">Data e Hora da Consulta</span>
                    </div>
                    <div className="flex items-center justify-between text-xs border-b border-border/40 pb-1.5">
                      <code className="text-primary font-bold bg-primary/5 px-1.5 py-0.5 rounded">{"{{vaccineName}}"}</code>
                      <span className="text-muted-foreground text-[10px]">Nome da Vacina</span>
                    </div>
                    <div className="flex items-center justify-between text-xs pb-1">
                      <code className="text-primary font-bold bg-primary/5 px-1.5 py-0.5 rounded">{"{{vaccineDate}}"}</code>
                      <span className="text-muted-foreground text-[10px]">Vencimento da Vacina</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        )}

        {/* TAB 2: TEMPLATES */}
        {activeTab === 'templates' && (
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
              <div className="divide-y divide-border">
                {/* Header Row */}
                <div className="grid grid-cols-12 bg-muted/20 px-6 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  <div className="col-span-4">Evento de Disparo</div>
                  <div className="col-span-2">Canal</div>
                  <div className="col-span-3">Assunto / Prévia do Conteúdo</div>
                  <div className="col-span-2 text-center">Status</div>
                  <div className="col-span-1 text-right">Ação</div>
                </div>

                {/* Items rows */}
                {templates.map((template) => (
                  <div key={template.id} className="grid grid-cols-12 px-6 py-4 items-center text-sm text-foreground hover:bg-muted/10 transition-colors">
                    <div className="col-span-4 flex flex-col">
                      <span className="font-semibold">{getEventLabel(template.event)}</span>
                      <span className="text-[10px] text-muted-foreground font-mono mt-0.5">{template.event}</span>
                    </div>
                    <div className="col-span-2 flex items-center gap-1.5">
                      {template.channel === 'EMAIL' ? (
                        <span className="inline-flex items-center gap-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded text-xs font-medium">
                          <Mail className="h-3 w-3" /> E-mail
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded text-xs font-medium">
                          <MessageSquare className="h-3 w-3" /> WhatsApp
                        </span>
                      )}
                    </div>
                    <div className="col-span-3 truncate flex flex-col pr-4">
                      {template.channel === 'EMAIL' && (
                        <span className="font-medium text-xs truncate">Assunto: {template.subject || '(Sem assunto)'}</span>
                      )}
                      <span className="text-xs text-muted-foreground truncate">{template.body}</span>
                    </div>
                    <div className="col-span-2 flex justify-center">
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
                    <div className="col-span-1 text-right">
                      <button
                        onClick={() => handleEditTemplate(template)}
                        className="text-xs font-bold text-primary hover:text-primary/85 hover:underline"
                      >
                        Editar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: LOGS */}
        {activeTab === 'logs' && (
          <div className="space-y-4">
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
              </select>

              {/* Search button trigger if manual search */}
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
          </div>
        )}
      </div>

      {/* MODAL 1: TEST EMAIL */}
      {showTestEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm" onClick={() => setShowTestEmailModal(false)} />
          <form onSubmit={handleSendTestEmail} className="bg-card border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-foreground">Enviar E-mail de Teste</h3>
            <p className="text-xs text-muted-foreground mt-1.5">
              Certifique-se de salvar as configurações SMTP antes de enviar o teste. Insira o endereço de destino.
            </p>
            <div className="mt-4 space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">E-mail de Destino</label>
              <input
                type="email"
                value={testEmailDest}
                onChange={(e) => setTestEmailDest(e.target.value)}
                placeholder="ex: seu-email@gmail.com"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>
            <div className="mt-6 flex justify-end gap-3 border-t border-border/50 pt-4">
              <button
                type="button"
                onClick={() => setShowTestEmailModal(false)}
                className="px-4 py-2 text-xs font-bold border border-border hover:bg-muted text-muted-foreground rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSendingTestEmail}
                className="px-5 py-2 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/95 rounded-xl inline-flex items-center gap-1.5 disabled:opacity-50 transition-colors cursor-pointer shadow-sm"
              >
                {isSendingTestEmail ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                Enviar E-mail
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DRAWER / MODAL 2: EDIT TEMPLATE */}
      {editingTemplate && (
        <div className="fixed inset-0 z-50 flex justify-end">
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
                {/* Event and Channel info */}
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

                {/* Subject for Email channel */}
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

                {/* Body text area */}
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

                {/* Active switch */}
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

                {/* Placeholders tips for this template */}
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
                        className="text-[10px] bg-card hover:bg-muted font-bold font-mono text-primary border border-border/80 px-2 py-1 rounded transition-colors"
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

      {/* MODAL 3: LOG MESSAGE PREVIEW */}
      {selectedLogForPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
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
