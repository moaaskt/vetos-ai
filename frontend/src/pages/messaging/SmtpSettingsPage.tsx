import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Mail,
  Loader2,
  Lock,
  CheckCircle,
  XCircle,
  ArrowLeft,
} from 'lucide-react'
import { notificationsApi } from '../../api/notifications'
import type { NotificationConfig } from '../../api/notifications'

export function SmtpSettingsPage() {
  const [config, setConfig] = useState<NotificationConfig | null>(null)
  const [isLoadingConfig, setIsLoadingConfig] = useState(true)
  const [isSavingConfig, setIsSavingConfig] = useState(false)
  const [isTestingSmtp, setIsTestingSmtp] = useState(false)
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false)
  const [testEmailDest, setTestEmailDest] = useState('')
  const [showTestEmailModal, setShowTestEmailModal] = useState(false)

  // SMTP Form States
  const [smtpHost, setSmtpHost] = useState('')
  const [smtpPort, setSmtpPort] = useState(587)
  const [smtpUser, setSmtpUser] = useState('')
  const [smtpPassword, setSmtpPassword] = useState('')
  const [smtpFromName, setSmtpFromName] = useState('')
  const [smtpFromEmail, setSmtpFromEmail] = useState('')
  const [emailEnabled, setEmailEnabled] = useState(false)

  // Global Alert
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const showAlert = (message: string, type: 'success' | 'error' = 'success') => {
    setAlert({ message, type })
    setTimeout(() => setAlert(null), 5000)
  }

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
    } catch (err: any) {
      console.error(err)
      showAlert('Falha ao carregar as configurações de notificação.', 'error')
    } finally {
      setIsLoadingConfig(false)
    }
  }

  useEffect(() => {
    loadConfig()
  }, [])

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

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
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
            <span className="text-foreground font-medium">SMTP</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Mail className="h-6 w-6 text-primary" />
            Servidor de E-mail (SMTP)
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            Configuração de credenciais de e-mail SMTP da clínica.
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

      {isLoadingConfig ? (
        <div className="p-12 flex flex-col items-center justify-center text-muted-foreground gap-3 bg-card rounded-2xl border border-border shadow-sm">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span>Carregando configurações de mensageria...</span>
        </div>
      ) : (
        <form onSubmit={handleSaveConfig} className="space-y-6">
          <div className="bg-card rounded-2xl border border-border p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-border/50 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">Credenciais SMTP</h2>
                  <p className="text-xs text-muted-foreground">Insira as credenciais para disparar e-mails automáticos.</p>
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
      )}

      {/* MODAL: TEST EMAIL */}
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
    </div>
  )
}
