import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  MessageSquare,
  Loader2,
  Lock,
  CheckCircle,
  XCircle,
  RefreshCw,
  ArrowLeft,
  Send,
  Edit2,
  Globe,
  KeyRound,
  ShieldCheck,
} from 'lucide-react'
import { notificationsApi } from '../../api/notifications'
import type { NotificationConfig } from '../../api/notifications'

export function WhatsappSettingsPage() {
  const [config, setConfig] = useState<NotificationConfig | null>(null)
  const [isLoadingConfig, setIsLoadingConfig] = useState(true)
  const [isSavingConfig, setIsSavingConfig] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  // Meta WhatsApp Cloud API Form
  const [metaPhoneNumberId, setMetaPhoneNumberId] = useState('')
  const [metaWabaId, setMetaWabaId] = useState('')
  const [metaAccessToken, setMetaAccessToken] = useState('')
  const [whatsappEnabled, setWhatsappEnabled] = useState(false)

  // Test & Operations States
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [isSendingTest, setIsSendingTest] = useState(false)

  // Test Modal
  const [showTestModal, setShowTestModal] = useState(false)
  const [testDest, setTestDest] = useState('')

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
      setMetaPhoneNumberId(data.metaPhoneNumberId || '')
      setMetaWabaId(data.metaWabaId || '')
      setMetaAccessToken('') // Don't show Access Token
      setWhatsappEnabled(data.whatsappEnabled)
    } catch (err: any) {
      console.error(err)
      showAlert('Falha ao carregar as configurações do WhatsApp.', 'error')
    } finally {
      setIsLoadingConfig(false)
    }
  }

  const handleTestConnection = async () => {
    setIsTestingConnection(true)
    try {
      const result = await notificationsApi.testWhatsappConnection()
      if (result.success) {
        showAlert(result.message || 'Conexão com a Meta Cloud API verificada com sucesso!')
      } else {
        showAlert(result.message || 'Falha ao verificar credenciais com a Graph API da Meta.', 'error')
      }
    } catch (err: any) {
      console.error(err)
      showAlert(err.response?.data?.message || 'Falha na conexão com a Meta Cloud API.', 'error')
    } finally {
      setIsTestingConnection(false)
    }
  }

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingConfig(true)
    try {
      const sanitizedPhoneId = metaPhoneNumberId.trim()
      const sanitizedWabaId = metaWabaId.trim()

      const payload: any = {
        whatsappEnabled,
        whatsappProvider: 'META_CLOUD_API',
        metaPhoneNumberId: sanitizedPhoneId || undefined,
        metaWabaId: sanitizedWabaId || undefined,
      }
      if (metaAccessToken.trim()) {
        payload.metaAccessToken = metaAccessToken.trim()
      }
      const data = await notificationsApi.updateConfig(payload)
      setConfig(data)
      setMetaPhoneNumberId(data.metaPhoneNumberId || '')
      setMetaWabaId(data.metaWabaId || '')
      setMetaAccessToken('')
      setIsEditing(false)
      showAlert('Configurações da Meta WhatsApp Cloud API salvas!')
    } catch (err: any) {
      console.error(err)
      showAlert(err.response?.data?.message || 'Erro ao salvar credenciais.', 'error')
    } finally {
      setIsSavingConfig(false)
    }
  }

  const handleSendTestWhatsapp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!testDest) return
    setIsSendingTest(true)
    try {
      const result = await notificationsApi.sendTestWhatsapp(testDest)
      if (result.success) {
        showAlert(`Mensagem enviada com sucesso para ${testDest}!`)
        setShowTestModal(false)
        setTestDest('')
      } else {
        showAlert(result.message || 'Falha ao enviar WhatsApp de teste.', 'error')
      }
    } catch (err: any) {
      console.error(err)
      showAlert(err.response?.data?.message || 'Falha ao enviar WhatsApp de teste.', 'error')
    } finally {
      setIsSendingTest(false)
    }
  }

  useEffect(() => {
    loadConfig()
  }, [])

  const hasClinicCustomCredentials = !!(config?.metaPhoneNumberId && config?.hasMetaAccessToken)
  const isChannelEnabled = !!config?.whatsappEnabled

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* Alerta Global */}
      {alert && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg flex items-center gap-3 border transition-all animate-in fade-in slide-in-from-top duration-300 ${
            alert.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
              : 'bg-destructive/10 border-destructive/20 text-destructive'
          }`}
        >
          {alert.type === 'success' ? <CheckCircle className="h-5 w-5 animate-bounce" /> : <XCircle className="h-5 w-5 animate-pulse" />}
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
            <span className="text-foreground font-medium">WhatsApp</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
              <MessageSquare className="h-6 w-6 text-emerald-500" />
              Meta WhatsApp Cloud API (Oficial)
            </h1>
            {isChannelEnabled ? (
              <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                Ativo
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-full text-xs font-semibold">
                Modo Simulação (Mock)
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1.5">
            Conexão direta com a Graph API v20.0 da Meta sem risco de banimentos.
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
          <span>Carregando configurações da Meta Cloud API...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Informação sobre Fallback Centralizado */}
          <div className="bg-card rounded-2xl border border-border p-5 space-y-3">
            <div className="flex items-center gap-2.5 font-semibold text-foreground text-sm">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>Hierarquia de Credenciais e Multi-Tenant</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              O VetOS AI opera com <strong>fallback inteligente</strong>: se a sua clínica preencher suas credenciais próprias abaixo (Phone Number ID e Token permanente), todas as mensagens serão enviadas sob o seu número da Meta. Se este formulário for mantido vazio, o sistema utilizará automaticamente as credenciais centrais do provedor VetOS AI.
            </p>
            <div className="flex items-center gap-2 text-xs">
              <span className="font-medium text-foreground">Provedor ativo no momento:</span>
              {hasClinicCustomCredentials ? (
                <span className="bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded font-bold">
                  Número Exclusivo da Clínica
                </span>
              ) : (
                <span className="bg-muted text-muted-foreground border border-border px-2 py-0.5 rounded font-bold">
                  Credencial Central do Sistema (VetOS AI)
                </span>
              )}
            </div>
          </div>

          {/* Configuração de Credenciais */}
          <div className="bg-card rounded-2xl border border-border p-6 shadow-sm space-y-4">
            <div className="flex items-start justify-between gap-4 border-b border-border/50 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-emerald-500/10 border border-emerald-500 flex items-center justify-center font-bold text-xs text-emerald-500">
                  <KeyRound className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
                    Credenciais Meta WhatsApp Cloud API
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Preencha caso sua clínica possua conta Business própria no Meta for Developers.
                  </p>
                </div>
              </div>

              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-3 py-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  Editar Credenciais
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleSaveConfig} className="space-y-4 max-w-2xl animate-in slide-in-from-top-2 duration-300">
                <div className="flex items-center justify-between py-2 bg-muted/20 px-3 rounded-lg border border-border/40">
                  <span className="text-xs font-semibold text-foreground">Habilitar canal real de WhatsApp</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={whatsappEnabled}
                      onChange={(e) => setWhatsappEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Phone Number ID (Meta)</label>
                    <input
                      type="text"
                      value={metaPhoneNumberId}
                      onChange={(e) => setMetaPhoneNumberId(e.target.value)}
                      placeholder="ex: 109876543210987"
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">WhatsApp Business Account ID (WABA ID)</label>
                    <input
                      type="text"
                      value={metaWabaId}
                      onChange={(e) => setMetaWabaId(e.target.value)}
                      placeholder="ex: 987654321098765"
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                    Access Token de Usuário do Sistema (System User Token)
                    {config?.hasMetaAccessToken && (
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded font-bold">Salvo com Criptografia</span>
                    )}
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={metaAccessToken}
                      onChange={(e) => setMetaAccessToken(e.target.value)}
                      placeholder={config?.hasMetaAccessToken ? "•••••••••••• (Inalterado)" : "EAAG... (Token permanente gerado no Meta Business)"}
                      className="w-full rounded-lg border border-border bg-background pl-8 pr-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                    />
                    <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  </div>
                  <span className="text-[10px] text-muted-foreground block">
                    Importante: Utilize um token permanente de <em>System User</em> com permissões <code>whatsapp_business_messaging</code>.
                  </span>
                </div>

                <div className="flex justify-end gap-3 border-t border-border/50 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 text-xs font-bold border border-border hover:bg-muted text-muted-foreground rounded-xl transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingConfig}
                    className="px-5 py-2 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/95 rounded-xl inline-flex items-center gap-1.5 disabled:opacity-50 transition-colors cursor-pointer shadow-sm"
                  >
                    {isSavingConfig && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    Salvar Configurações
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-1">
                <div className="bg-muted/20 p-3 rounded-lg border border-border/30">
                  <span className="text-muted-foreground block font-medium mb-1">Phone Number ID:</span>
                  <span className="font-mono text-foreground font-semibold">
                    {config?.metaPhoneNumberId || <em className="text-muted-foreground font-normal">Padrão Central</em>}
                  </span>
                </div>
                <div className="bg-muted/20 p-3 rounded-lg border border-border/30">
                  <span className="text-muted-foreground block font-medium mb-1">WABA ID:</span>
                  <span className="font-mono text-foreground font-semibold">
                    {config?.metaWabaId || <em className="text-muted-foreground font-normal">Padrão Central</em>}
                  </span>
                </div>
                <div className="bg-muted/20 p-3 rounded-lg border border-border/30">
                  <span className="text-muted-foreground block font-medium mb-1">Status do Canal:</span>
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    {config?.whatsappEnabled ? (
                      <>
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        Habilitado (Envio Real)
                      </>
                    ) : (
                      <>
                        <span className="h-2 w-2 rounded-full bg-amber-500" />
                        Desabilitado (Simulação)
                      </>
                    )}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Testes de Conectividade e Disparo */}
          <div className="bg-card rounded-2xl border border-border p-6 shadow-sm space-y-4">
            <h3 className="font-semibold text-foreground text-sm flex items-center gap-2 border-b border-border/50 pb-3">
              <RefreshCw className="h-4 w-4 text-primary" />
              Diagnóstico e Teste de Mensagem
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Realize uma verificação de status na Graph API v20.0 da Meta ou envie uma mensagem direta de teste para o seu número de celular.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={handleTestConnection}
                disabled={isTestingConnection}
                className="px-4 py-2 text-xs font-bold border border-border bg-card hover:bg-muted rounded-xl inline-flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isTestingConnection ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                Testar Conexão com a Meta
              </button>

              <button
                onClick={() => setShowTestModal(true)}
                className="px-4 py-2 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/95 rounded-xl inline-flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" />
                Disparar WhatsApp de Teste
              </button>
            </div>
          </div>

          {/* Instruções para Webhook da Meta */}
          <div className="bg-card rounded-2xl border border-border p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
              <Globe className="h-4 w-4 text-primary" />
              <span>Configuração do Webhook da Meta</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Para receber os status de entrega (<code>sent</code>, <code>delivered</code>, <code>read</code>, <code>failed</code>) em tempo real, cadastre o webhook público do VetOS AI no painel da Meta for Developers:
            </p>
            <div className="bg-muted/30 border border-border/50 p-3 rounded-xl font-mono text-xs text-foreground select-all break-all">
              {window.location.origin}/api/webhooks/meta-whatsapp
            </div>
            <p className="text-[11px] text-muted-foreground">
              Token de verificação exigido pela Meta: configurado via <code>META_WEBHOOK_VERIFY_TOKEN</code> nas variáveis de ambiente.
            </p>
          </div>
        </div>
      )}

      {/* Modal de Disparo de Teste */}
      {showTestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-200">
          <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm" onClick={() => setShowTestModal(false)} />
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Send className="h-4 w-4 text-emerald-500" />
                Enviar WhatsApp de Teste
              </h3>
              <button
                onClick={() => setShowTestModal(false)}
                className="text-xs font-bold hover:underline text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Fechar
              </button>
            </div>

            <form onSubmit={handleSendTestWhatsapp} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Número de WhatsApp (com DDD)</label>
                <input
                  type="text"
                  value={testDest}
                  onChange={(e) => setTestDest(e.target.value)}
                  placeholder="ex: (11) 99999-9999"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                  required
                />
                <span className="text-[10px] text-muted-foreground block">
                  A mensagem será disparada via Meta Cloud API e gravada no Histórico de Envios.
                </span>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTestModal(false)}
                  className="px-4 py-2 text-xs font-bold border border-border hover:bg-muted text-muted-foreground rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSendingTest}
                  className="px-5 py-2 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/95 rounded-xl inline-flex items-center gap-1.5 disabled:opacity-50 transition-colors cursor-pointer shadow-sm"
                >
                  {isSendingTest && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Enviar Agora
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
