import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  MessageSquare,
  Loader2,
  Lock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Trash2,
  QrCode,
  ArrowLeft,
  Send,
  Edit2,
  Check,
  Copy,
} from 'lucide-react'
import { notificationsApi } from '../../api/notifications'
import type { NotificationConfig } from '../../api/notifications'

export function WhatsappSettingsPage() {
  const [config, setConfig] = useState<NotificationConfig | null>(null)
  const [isLoadingConfig, setIsLoadingConfig] = useState(true)
  const [isSavingConfig, setIsSavingConfig] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  // Evolution API Credentials Form
  const [whatsappInstanceUrl, setWhatsappInstanceUrl] = useState('')
  const [whatsappInstanceName, setWhatsappInstanceName] = useState('')
  const [whatsappApiKey, setWhatsappApiKey] = useState('')
  const [whatsappEnabled, setWhatsappEnabled] = useState(false)

  // WhatsApp Operations States
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null)
  const [isLoadingStatus, setIsLoadingStatus] = useState(false)
  const [qrCodeBase64, setQrCodeBase64] = useState<string | null>(null)
  const [pairingCode, setPairingCode] = useState<string | null>(null)
  const [qrCodeText, setQrCodeText] = useState<string | null>(null)
  const [isLoadingQr, setIsLoadingQr] = useState(false)
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [isSendingTest, setIsSendingTest] = useState(false)
  const [isDeletingConfig, setIsDeletingConfig] = useState(false)
  const [isCreatingInstance, setIsCreatingInstance] = useState(false)

  // Test Modal
  const [showTestModal, setShowTestModal] = useState(false)
  const [testDest, setTestDest] = useState('')

  // Global Alert
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const showAlert = (message: string, type: 'success' | 'error' = 'success') => {
    setAlert({ message, type })
    setTimeout(() => setAlert(null), 5000)
  }

  const isBase64Image = (str: string | null): boolean => {
    if (!str) return false
    if (str.startsWith('data:image/')) return true
    if (str.length > 500 && !/\s/.test(str)) return true
    return false
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    showAlert('Código copiado com sucesso!')
  }

  const loadConfig = async (shouldLoadStatus = true) => {
    setIsLoadingConfig(true)
    try {
      const data = await notificationsApi.getConfig()
      setConfig(data)
      setWhatsappInstanceUrl(data.whatsappInstanceUrl || '')
      setWhatsappInstanceName(data.whatsappInstanceName || '')
      setWhatsappApiKey('') // Don't show ApiKey
      setWhatsappEnabled(data.whatsappEnabled)

      // Se possui configuração salva, busca o status atual da instância
      const hasSaved = data.whatsappInstanceUrl && data.whatsappInstanceName && data.hasWhatsappApiKey
      if (hasSaved && shouldLoadStatus) {
        await fetchStatus(data)
      }
    } catch (err: any) {
      console.error(err)
      showAlert('Falha ao carregar as configurações do WhatsApp.', 'error')
    } finally {
      setIsLoadingConfig(false)
    }
  }

  const fetchStatus = async (currentConfig?: NotificationConfig) => {
    const targetConfig = currentConfig || config
    if (!targetConfig?.whatsappInstanceUrl || !targetConfig?.whatsappInstanceName) {
      setConnectionStatus(null)
      return
    }

    setIsLoadingStatus(true)
    try {
      const result = await notificationsApi.getWhatsappStatus()
      if (result.success) {
        setConnectionStatus(result.state)
        // Se a conexão estiver ativa (open), limpamos qualquer QR Code gerado anteriormente
        if (result.state === 'open') {
          setQrCodeBase64(null)
          setPairingCode(null)
          setQrCodeText(null)
        }
      } else {
        setConnectionStatus('unknown')
      }
    } catch (err) {
      console.error(err)
      setConnectionStatus('error')
    } finally {
      setIsLoadingStatus(false)
    }
  }

  const handleCreateInstanceOnAPI = async () => {
    setIsCreatingInstance(true)
    try {
      const result = await notificationsApi.createWhatsappInstance()
      if (result.success) {
        showAlert('Instância criada na Evolution API com sucesso! Agora você pode gerar o QR Code.')
        await fetchStatus()
      } else {
        showAlert(result.message || 'Falha ao criar instância na API.', 'error')
      }
    } catch (err: any) {
      console.error(err)
      showAlert(err.response?.data?.message || 'Falha ao processar criação da instância.', 'error')
    } finally {
      setIsCreatingInstance(false)
    }
  }

  const handleGetQrCode = async () => {
    setIsLoadingQr(true)
    setQrCodeBase64(null)
    setPairingCode(null)
    setQrCodeText(null)
    try {
      const result = await notificationsApi.getWhatsappQr()
      if (result.success) {
        if (result.base64 && isBase64Image(result.base64)) {
          const formatted = result.base64.startsWith('data:')
            ? result.base64
            : `data:image/png;base64,${result.base64}`
          setQrCodeBase64(formatted)
        } else if (result.base64) {
          setQrCodeText(result.base64)
        }

        if (result.code && !isBase64Image(result.code)) {
          setQrCodeText(result.code)
        }

        if (result.pairingCode) {
          setPairingCode(result.pairingCode)
        }

        showAlert('QR Code / código obtido com sucesso! Escaneie ou insira o código no seu celular.')
      } else {
        showAlert(result.message || 'Falha ao obter QR code. Verifique se a instância está criada e ativa.', 'error')
      }
    } catch (err: any) {
      console.error(err)
      showAlert(err.response?.data?.message || 'Falha ao obter QR code da instância.', 'error')
    } finally {
      setIsLoadingQr(false)
    }
  }

  const handleTestConnection = async () => {
    setIsTestingConnection(true)
    try {
      const result = await notificationsApi.testWhatsappConnection()
      if (result.success) {
        showAlert('Conexão ativa e integrada com sucesso!')
        setConnectionStatus('open')
        setQrCodeBase64(null)
        setPairingCode(null)
        setQrCodeText(null)
      } else {
        showAlert(result.message || 'Falha de conexão. O status da instância não está ativo.', 'error')
        await fetchStatus()
      }
    } catch (err: any) {
      console.error(err)
      showAlert(err.response?.data?.message || 'Falha na conexão do WhatsApp.', 'error')
    } finally {
      setIsTestingConnection(false)
    }
  }

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingConfig(true)
    try {
      const payload: any = {
        whatsappEnabled,
        whatsappInstanceUrl,
        whatsappInstanceName,
      }
      if (whatsappApiKey) {
        payload.whatsappApiKey = whatsappApiKey
      }
      const data = await notificationsApi.updateConfig(payload)
      setConfig(data)
      setWhatsappApiKey('') // Clear input
      setIsEditing(false)
      showAlert('Configurações do WhatsApp salvas localmente!')
      await fetchStatus(data)
    } catch (err: any) {
      console.error(err)
      showAlert(err.response?.data?.message || 'Erro ao salvar credenciais.', 'error')
    } finally {
      setIsSavingConfig(false)
    }
  }

  const handleDeleteConfig = async () => {
    if (!window.confirm('Tem certeza que deseja remover esta instância e apagar todas as configurações de WhatsApp da clínica?')) {
      return
    }

    setIsDeletingConfig(true)
    try {
      const result = await notificationsApi.deleteWhatsappConfig()
      if (result.success) {
        setConnectionStatus(null)
        setQrCodeBase64(null)
        setPairingCode(null)
        setQrCodeText(null)
        showAlert('Configuração e instância removidas com sucesso!')
        await loadConfig(false)
      } else {
        showAlert(result.message || 'Falha ao remover configurações.', 'error')
      }
    } catch (err) {
      console.error(err)
      showAlert('Erro ao remover integração de WhatsApp.', 'error')
    } finally {
      setIsDeletingConfig(false)
    }
  }

  const handleSendTestWhatsapp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!testDest) return
    setIsSendingTest(true)
    try {
      const result = await notificationsApi.sendTestWhatsapp(testDest)
      if (result.success) {
        showAlert(`Mensagem de teste enviada com sucesso para ${testDest}!`)
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

  const hasSavedConfig = !!(config?.whatsappInstanceUrl && config?.whatsappInstanceName && config?.hasWhatsappApiKey)

  // Determinar o status visual geral
  const getStatusBadge = () => {
    if (isLoadingConfig || isLoadingStatus) {
      return (
        <span className="inline-flex items-center gap-1.5 bg-muted text-muted-foreground px-3 py-1 rounded-full text-xs font-semibold">
          <Loader2 className="h-3 w-3 animate-spin" />
          Verificando...
        </span>
      )
    }

    if (!hasSavedConfig) {
      return (
        <span className="inline-flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 px-3 py-1 rounded-full text-xs font-semibold">
          Desconectado
        </span>
      )
    }

    if (connectionStatus === 'open') {
      return (
        <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-semibold">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
          Conectado
        </span>
      )
    }

    if (connectionStatus === 'close' || connectionStatus === 'disconnected') {
      if (qrCodeBase64 || pairingCode || qrCodeText) {
        return (
          <span className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-full text-xs font-semibold">
            Aguardando QR
          </span>
        )
      }
      return (
        <span className="inline-flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 px-3 py-1 rounded-full text-xs font-semibold">
          Desconectado
        </span>
      )
    }

    if (connectionStatus === 'connecting') {
      return (
        <span className="inline-flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full text-xs font-semibold">
          <Loader2 className="h-3 w-3 animate-spin" />
          Conectando
        </span>
      )
    }

    return (
      <span className="inline-flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 px-3 py-1 rounded-full text-xs font-semibold">
        Erro
      </span>
    )
  }

  // Determinar o status lógico das 4 etapas
  const step1Completed = hasSavedConfig
  const step2Completed = hasSavedConfig && connectionStatus !== null && connectionStatus !== 'error' && connectionStatus !== 'unknown'
  const step3Completed = connectionStatus === 'open' || !!(qrCodeBase64 || pairingCode || qrCodeText)
  const step4Completed = connectionStatus === 'open'

  // Aviso de Sandbox
  const showMockWarning = !config?.whatsappEnabled || !hasSavedConfig

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
            <span className="text-foreground font-medium">WhatsApp</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
              <MessageSquare className="h-6 w-6 text-emerald-500" />
              WhatsApp (Evolution API)
            </h1>
            {getStatusBadge()}
          </div>
          <p className="text-sm text-muted-foreground mt-1.5">
            Integração avançada passo a passo para disparo de notificações via WhatsApp.
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
          <span>Carregando configurações do WhatsApp...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Mock Warning Banner */}
          {showMockWarning && (
            <div className="bg-amber-500/10 border border-amber-500/15 text-amber-600 dark:text-amber-400 rounded-2xl p-5 space-y-2.5">
              <div className="flex items-center gap-2 font-bold text-sm">
                <AlertTriangle className="h-4 w-4" />
                <span>Modo Simulação (Mock) Ativo</span>
              </div>
              <p className="text-xs leading-relaxed">
                A integração do WhatsApp está inativa ou incompleta no momento. O VetOS AI enviará todas as notificações de WhatsApp usando o <strong>provedor simulado (Mock Provider)</strong>. As mensagens serão salvas no Histórico de Envios para testes, mas não serão entregues a telefones reais.
              </p>
            </div>
          )}

          {/* Stepper Onboarding Container */}
          <div className="space-y-4">
            {/* ETAPA 1: Configurar Credenciais */}
            <div className={`bg-card rounded-2xl border ${step1Completed ? 'border-emerald-500/35' : 'border-border'} p-6 shadow-sm transition-all duration-300`}>
              <div className="flex items-start justify-between gap-4 border-b border-border/50 pb-4">
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs ${
                    step1Completed ? 'bg-emerald-500/10 border border-emerald-500 text-emerald-500' : 'bg-primary/10 border border-primary text-primary'
                  }`}>
                    {step1Completed ? <Check className="h-4 w-4" /> : '1'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
                      Passo 1: Credenciais de Integração
                      {step1Completed && (
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded font-bold uppercase">Configurado</span>
                      )}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Insira a URL base, nome da instância e a chave de API da Evolution.</p>
                  </div>
                </div>

                {step1Completed && !isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-3 py-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    Editar Credenciais
                  </button>
                )}
              </div>

              {(!step1Completed || isEditing) ? (
                <form onSubmit={handleSaveConfig} className="mt-5 space-y-4 max-w-2xl animate-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center justify-between py-1 bg-muted/20 px-3 rounded-lg border border-border/40">
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
                      <label className="text-xs font-semibold text-muted-foreground">URL da Instância (Base URL)</label>
                      <input
                        type="text"
                        value={whatsappInstanceUrl}
                        onChange={(e) => setWhatsappInstanceUrl(e.target.value)}
                        placeholder="ex: https://api.evolution.com.br"
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground">Nome da Instância</label>
                      <input
                        type="text"
                        value={whatsappInstanceName}
                        onChange={(e) => setWhatsappInstanceName(e.target.value)}
                        placeholder="ex: clinica_vetos"
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                      Chave de API (ApiKey)
                      {config?.hasWhatsappApiKey && (
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded font-bold">Salva no Banco</span>
                      )}
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        value={whatsappApiKey}
                        onChange={(e) => setWhatsappApiKey(e.target.value)}
                        placeholder={config?.hasWhatsappApiKey ? "•••••••••••• (Inalterado)" : "Insira a apikey fornecida pela Evolution API"}
                        className="w-full rounded-lg border border-border bg-background pl-8 pr-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        required={!config?.hasWhatsappApiKey}
                      />
                      <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 border-t border-border/50 pt-4">
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 text-xs font-bold border border-border hover:bg-muted text-muted-foreground rounded-xl transition-colors cursor-pointer"
                      >
                        Cancelar
                      </button>
                    )}
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
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="bg-muted/20 p-3 rounded-lg border border-border/30">
                    <span className="text-muted-foreground block font-medium mb-1">URL da Instância:</span>
                    <span className="font-mono text-foreground break-all">{config?.whatsappInstanceUrl}</span>
                  </div>
                  <div className="bg-muted/20 p-3 rounded-lg border border-border/30">
                    <span className="text-muted-foreground block font-medium mb-1">Nome da Instância:</span>
                    <span className="font-mono text-foreground">{config?.whatsappInstanceName}</span>
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

            {/* ETAPA 2: Criar / Registrar Instância na API */}
            <div className={`bg-card rounded-2xl border ${
              step2Completed ? 'border-emerald-500/35' : !step1Completed ? 'opacity-60' : 'border-border'
            } p-6 shadow-sm transition-all duration-300`}>
              <div className="flex items-center gap-3 border-b border-border/50 pb-4">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs ${
                  step2Completed
                    ? 'bg-emerald-500/10 border border-emerald-500 text-emerald-500'
                    : !step1Completed
                    ? 'bg-muted border border-border text-muted-foreground'
                    : 'bg-primary/10 border border-primary text-primary'
                }`}>
                  {!step1Completed ? <Lock className="h-3.5 w-3.5" /> : step2Completed ? <Check className="h-4 w-4" /> : '2'}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
                    Passo 2: Registrar Instância na Evolution API
                    {step2Completed && (
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded font-bold uppercase">Registrada</span>
                    )}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Registre o contêiner de pareamento na API da Evolution.</p>
                </div>
              </div>

              {!step1Completed ? (
                <p className="text-xs text-muted-foreground mt-4 italic">Por favor, salve as credenciais no Passo 1 primeiro para liberar esta etapa.</p>
              ) : (
                <div className="mt-5 space-y-4">
                  {step2Completed ? (
                    <div className="bg-emerald-500/5 border border-emerald-500/15 p-4 rounded-xl text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2.5">
                      <CheckCircle className="h-4 w-4 shrink-0 text-emerald-500" />
                      <span>Instância devidamente registrada e comunicável na Evolution API. Você já pode prosseguir para gerar o QR code.</span>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
                        A instância com o nome <strong>{config?.whatsappInstanceName}</strong> precisa ser criada na Evolution API. Esse procedimento configura o ambiente necessário para a conexão do WhatsApp Baileys.
                      </p>
                      <button
                        onClick={handleCreateInstanceOnAPI}
                        disabled={isCreatingInstance}
                        className="px-5 py-2.5 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/95 rounded-xl inline-flex items-center gap-1.5 disabled:opacity-50 transition-colors cursor-pointer shadow-sm"
                      >
                        {isCreatingInstance && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                        Criar Instância na Evolution API
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ETAPA 3: Gerar QR Code & Pareamento */}
            <div className={`bg-card rounded-2xl border ${
              step3Completed ? 'border-emerald-500/35' : !step2Completed ? 'opacity-60' : 'border-border'
            } p-6 shadow-sm transition-all duration-300`}>
              <div className="flex items-center justify-between border-b border-border/50 pb-4">
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs ${
                    step3Completed
                      ? 'bg-emerald-500/10 border border-emerald-500 text-emerald-500'
                      : !step2Completed
                      ? 'bg-muted border border-border text-muted-foreground'
                      : 'bg-primary/10 border border-primary text-primary'
                  }`}>
                    {!step2Completed ? <Lock className="h-3.5 w-3.5" /> : step3Completed ? <Check className="h-4 w-4" /> : '3'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
                      Passo 3: Parear WhatsApp (QR Code / Pareamento)
                      {step4Completed && (
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded font-bold uppercase">Pareado</span>
                      )}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Escaneie o QR Code ou insira o código gerado no seu celular.</p>
                  </div>
                </div>

                {step2Completed && (
                  <button
                    onClick={() => fetchStatus()}
                    disabled={isLoadingStatus}
                    className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                    title="Atualizar status"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isLoadingStatus ? 'animate-spin' : ''}`} />
                    Atualizar Status
                  </button>
                )}
              </div>

              {!step2Completed ? (
                <p className="text-xs text-muted-foreground mt-4 italic">Registre a instância no Passo 2 para liberar o pareamento.</p>
              ) : (
                <div className="mt-5 space-y-4">
                  {step4Completed ? (
                    <div className="bg-emerald-500/5 border border-emerald-500/15 p-4 rounded-xl text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2.5">
                      <CheckCircle className="h-4 w-4 shrink-0 text-emerald-500" />
                      <span>WhatsApp já pareado e conectado com sucesso a este dispositivo. O QR Code não é mais necessário.</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Abra o WhatsApp em seu celular, vá em <strong>Aparelhos Conectados &gt; Conectar um Aparelho</strong> e escaneie o código ao lado.
                        </p>
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={handleGetQrCode}
                            disabled={isLoadingQr}
                            className="w-full py-2.5 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/95 rounded-xl inline-flex items-center justify-center gap-1.5 disabled:opacity-50 transition-colors cursor-pointer"
                          >
                            {isLoadingQr ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <QrCode className="h-3.5 w-3.5" />}
                            {qrCodeBase64 || pairingCode || qrCodeText ? 'Gerar Novo Código' : 'Gerar QR Code / Pareamento'}
                          </button>
                        </div>
                      </div>

                      {/* Display QR / Pairing */}
                      <div className="flex flex-col items-center justify-center p-5 bg-muted/30 border border-border/80 rounded-2xl min-h-[220px]">
                        {qrCodeBase64 ? (
                          <div className="flex flex-col items-center justify-center space-y-3 bg-white p-3 rounded-xl border border-border shadow-inner">
                            <img src={qrCodeBase64} alt="Evolution QR Code" className="w-44 h-44 border border-slate-100" />
                            <span className="text-[10px] text-slate-500 font-bold tracking-wide uppercase">Aponte a Câmera</span>
                          </div>
                        ) : pairingCode ? (
                          <div className="text-center space-y-3 w-full max-w-[280px]">
                            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Código de Pareamento</span>
                            <div className="bg-background border border-border rounded-xl px-4 py-3 flex items-center justify-between font-mono text-lg font-bold text-primary select-all">
                              <span>{pairingCode}</span>
                              <button
                                onClick={() => copyToClipboard(pairingCode)}
                                className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                title="Copiar código"
                              >
                                <Copy className="h-4 w-4" />
                              </button>
                            </div>
                            <p className="text-[10px] text-muted-foreground leading-normal">
                              Digite este código na seção "Conectar com código" do WhatsApp no seu telefone.
                            </p>
                          </div>
                        ) : qrCodeText ? (
                          <div className="text-center space-y-3 w-full max-w-[280px]">
                            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Código do QR Code</span>
                            <div className="bg-background border border-border rounded-xl px-3 py-2 flex items-center justify-between font-mono text-xs text-foreground break-all max-h-[120px] overflow-y-auto">
                              <span>{qrCodeText}</span>
                              <button
                                onClick={() => copyToClipboard(qrCodeText)}
                                className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer ml-2 self-start shrink-0"
                                title="Copiar código"
                              >
                                <Copy className="h-4 w-4" />
                              </button>
                            </div>
                            <p className="text-[10px] text-muted-foreground leading-normal">
                              Código bruto do QR code. Use em leitores compatíveis se a imagem não renderizar.
                            </p>
                          </div>
                        ) : (
                          <div className="text-center space-y-2 text-muted-foreground p-6">
                            <QrCode className="h-10 w-10 mx-auto text-muted-foreground/50" />
                            <span className="text-xs font-semibold block">Sem código gerado</span>
                            <span className="text-[10px] block">Clique em "Gerar QR Code / Pareamento" acima.</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ETAPA 4: Conectado & Testes */}
            <div className={`bg-card rounded-2xl border ${
              step4Completed ? 'border-emerald-500/35' : !step3Completed ? 'opacity-60' : 'border-border'
            } p-6 shadow-sm transition-all duration-300`}>
              <div className="flex items-center gap-3 border-b border-border/50 pb-4">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs ${
                  step4Completed
                    ? 'bg-emerald-500/10 border border-emerald-500 text-emerald-500'
                    : !step3Completed
                    ? 'bg-muted border border-border text-muted-foreground'
                    : 'bg-primary/10 border border-primary text-primary'
                }`}>
                  {!step3Completed ? <Lock className="h-3.5 w-3.5" /> : step4Completed ? <Check className="h-4 w-4" /> : '4'}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
                    Passo 4: Integração Ativa & Testes
                    {step4Completed && (
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded font-bold uppercase animate-pulse">Ativo</span>
                    )}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Envie mensagens de teste para validar o correto funcionamento.</p>
                </div>
              </div>

              {!step4Completed ? (
                <p className="text-xs text-muted-foreground mt-4 italic">Conclua o pareamento do WhatsApp na Etapa 3 para liberar os testes.</p>
              ) : (
                <div className="mt-5 space-y-6">
                  <div className="p-4 bg-emerald-500/5 border border-emerald-500/15 rounded-xl flex gap-3 text-xs text-emerald-600 dark:text-emerald-400">
                    <Check className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
                    <p className="leading-relaxed">
                      <strong>Conexão ativa e integrada com sucesso!</strong><br />
                      Sua clínica está conectada ao WhatsApp e pronta. As notificações automáticas de consultas, lembretes e avisos serão disparadas em tempo real conforme as configurações de modelos.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border/50 pt-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        onClick={handleTestConnection}
                        disabled={isTestingConnection}
                        className="px-4 py-2 text-xs font-bold border border-border hover:bg-muted/80 rounded-xl text-foreground inline-flex items-center gap-1.5 disabled:opacity-50 transition-colors cursor-pointer"
                      >
                        {isTestingConnection && <Loader2 className="h-3 w-3 animate-spin" />}
                        Testar Conexão
                      </button>
                      <button
                        onClick={() => setShowTestModal(true)}
                        className="px-4 py-2 text-xs font-bold border border-border hover:bg-muted/80 rounded-xl text-foreground inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Send className="h-3.5 w-3.5" />
                        Enviar WhatsApp de Teste
                      </button>
                    </div>

                    <button
                      onClick={handleDeleteConfig}
                      disabled={isDeletingConfig}
                      className="px-4 py-2 text-xs font-bold border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-xl inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {isDeletingConfig ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                      Excluir Instância & Credenciais
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Como Funciona & Instruções Rápidas */}
          <div className="bg-card rounded-2xl border border-border p-6 shadow-sm space-y-3">
            <h3 className="font-semibold text-xs text-foreground uppercase tracking-wider">Instruções Importantes</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              1. A Evolution API é um serviço de gateway independente para conectar o WhatsApp via Baileys Web socket.<br />
              2. Caso a instância sofra desconexão manual no celular, você pode simplesmente clicar em <strong>"Gerar QR Code / Pareamento"</strong> e escanear novamente.<br />
              3. O botão de <strong>"Excluir Instância &amp; Credenciais"</strong> remove o pareamento físico na Evolution API externa e zera as credenciais no VetOS local com segurança.
            </p>
          </div>
        </div>
      )}

      {/* MODAL: SEND TEST WHATSAPP */}
      {showTestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-200">
          <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm" onClick={() => setShowTestModal(false)} />
          <form onSubmit={handleSendTestWhatsapp} className="bg-card border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-foreground">Enviar WhatsApp de Teste</h3>
            <p className="text-xs text-muted-foreground mt-1.5">
              Insira o número de destino completo (DDI + DDD + número) para validar o pareamento da instância.
            </p>
            <div className="mt-4 space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Telefone do Destinatário</label>
              <input
                type="text"
                value={testDest}
                onChange={(e) => setTestDest(e.target.value)}
                placeholder="ex: 5511999999999"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
              <span className="text-[10px] text-muted-foreground block mt-0.5">Use o DDI do país (ex: 55 para o Brasil).</span>
            </div>
            <div className="mt-6 flex justify-end gap-3 border-t border-border/50 pt-4">
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
                {isSendingTest && <Loader2 className="h-3 w-3 animate-spin" />}
                Enviar Mensagem
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
