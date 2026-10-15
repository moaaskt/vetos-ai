import { AlertTriangle, CheckCircle, Info, MessageSquare, ShieldAlert, Sparkles } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { aiApi, type NoShowRiskEvaluation } from '../../lib/api'

interface CacheEntry {
  data: NoShowRiskEvaluation
  timestamp: number
}

// Cache em memória de 5 minutos (300.000 ms) para evitar requisições redundantes
const riskCache = new Map<string, CacheEntry>()
const inFlightRequests = new Map<string, Promise<NoShowRiskEvaluation>>()
const STALE_TIME = 5 * 60 * 1000

interface NoShowRiskBadgeProps {
  appointmentId: string
  isFuture?: boolean
  clientName?: string
  clientPhone?: string | null
  petName?: string
  scheduledAt?: string
}

export function NoShowRiskBadge({
  appointmentId,
  isFuture = true,
  clientName,
  clientPhone,
  petName,
  scheduledAt,
}: NoShowRiskBadgeProps) {
  const [risk, setRisk] = useState<NoShowRiskEvaluation | null>(null)
  const [loading, setLoading] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)
  const tooltipRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Apenas avalia consultas futuras
    if (!isFuture || !appointmentId) return

    const cached = riskCache.get(appointmentId)
    if (cached && Date.now() - cached.timestamp < STALE_TIME) {
      setRisk(cached.data)
      return
    }

    let isMounted = true
    setLoading(true)

    // Deduplicação de chamadas concorrentes
    let fetchPromise = inFlightRequests.get(appointmentId)
    if (!fetchPromise) {
      fetchPromise = aiApi.getNoShowRisk(appointmentId)
      inFlightRequests.set(appointmentId, fetchPromise)
    }

    fetchPromise
      .then((data) => {
        riskCache.set(appointmentId, { data, timestamp: Date.now() })
        if (isMounted) {
          setRisk(data)
        }
      })
      .catch((err) => {
        // Silencioso para não quebrar a listagem de agendamentos
        console.warn(`[NoShowRiskBadge] Não foi possível carregar score do agendamento ${appointmentId}:`, err)
      })
      .finally(() => {
        inFlightRequests.delete(appointmentId)
        if (isMounted) {
          setLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [appointmentId, isFuture])

  // Se não for futuro ou não tiver dados e não estiver carregando, não exibe
  if (!isFuture || (!risk && !loading)) {
    return null
  }

  if (loading && !risk) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted/50 text-muted-foreground animate-pulse border border-border">
        <Sparkles className="h-2.5 w-2.5 animate-spin" />
        IA Risco...
      </span>
    )
  }

  if (!risk) return null

  function handleSendWhatsApp(e: React.MouseEvent) {
    e.stopPropagation()
    const rawPhone = clientPhone?.replace(/\D/g, '') || ''
    if (!rawPhone) {
      alert('Tutor não possui telefone ou WhatsApp cadastrado no sistema.')
      return
    }

    const fullPhone = rawPhone.length <= 11 ? `55${rawPhone}` : rawPhone
    const dateFormatted = scheduledAt
      ? new Date(scheduledAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
      : 'sua consulta'

    const message = `Olá ${clientName || 'Tutor'}! Passando para confirmar a consulta de ${petName || 'seu pet'} agendada para ${dateFormatted} na VetOS AI. Por gentileza, confirme se comparecerá respondendo SIM ou NÃO. Muito obrigado!`

    const whatsappUrl = `https://wa.me/${fullPhone}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
  }

  // Estilos semafóricos
  const levelConfig = {
    LOW: {
      label: 'Baixo Risco',
      colorBadge: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25',
      dot: 'bg-emerald-500',
      icon: CheckCircle,
      isPulsing: false,
    },
    MEDIUM: {
      label: 'Risco Médio',
      colorBadge: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/25',
      dot: 'bg-amber-500',
      icon: AlertTriangle,
      isPulsing: false,
    },
    HIGH: {
      label: 'Alto Risco',
      colorBadge: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/40 font-semibold',
      dot: 'bg-rose-500',
      icon: ShieldAlert,
      isPulsing: true,
    },
  }[risk.level]

  const Icon = levelConfig.icon

  return (
    <div
      className="relative inline-flex items-center"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      ref={tooltipRef}
    >
      <div
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border cursor-help transition-all shadow-xs ${
          levelConfig.colorBadge
        } ${levelConfig.isPulsing ? 'animate-pulse' : ''}`}
      >
        <span className="relative flex h-2 w-2">
          {levelConfig.isPulsing && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
          )}
          <span className={`relative inline-flex rounded-full h-2 w-2 ${levelConfig.dot}`} />
        </span>
        <span>{levelConfig.label}</span>
        <span className="text-[10px] opacity-75">({risk.score}%)</span>
      </div>

      {/* Botão de Atalho "Enviar Lembrete WhatsApp" - exclusivo para HIGH */}
      {risk.level === 'HIGH' && (
        <button
          type="button"
          onClick={handleSendWhatsApp}
          title="Tutor com alto risco de ausência. Enviar lembrete direto via WhatsApp."
          className="ml-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors cursor-pointer"
        >
          <MessageSquare className="h-3 w-3" />
          <span>Lembrete WhatsApp</span>
        </button>
      )}

      {/* Tooltip Explicativo com detalhes e recomendação */}
      {showTooltip && (
        <div className="absolute left-0 top-full mt-1.5 z-50 w-72 p-3 rounded-lg border border-border bg-popover/95 text-popover-foreground shadow-xl backdrop-blur-md text-xs animate-in fade-in-0 zoom-in-95 pointer-events-none">
          <div className="flex items-center gap-2 mb-1.5 font-semibold text-foreground border-b border-border/50 pb-1">
            <Icon className="h-3.5 w-3.5 text-primary" />
            <span>Preditor de No-Show (IA)</span>
          </div>

          <div className="space-y-1 text-muted-foreground">
            <div className="flex justify-between items-center">
              <span>Score de Ausência:</span>
              <strong className="text-foreground">{risk.score}%</strong>
            </div>
            <div className="flex justify-between items-center">
              <span>Taxa Histórica:</span>
              <strong className="text-foreground">{risk.stats.absenceRatePercentage}%</strong>
            </div>
            <div className="flex justify-between items-center">
              <span>Faltas anteriores:</span>
              <span className="text-foreground">
                {risk.stats.noShowCount} de {risk.stats.totalPastAppointments} consultas
              </span>
            </div>
          </div>

          <div className="mt-2 pt-1.5 border-t border-border/50">
            <p className="text-[11px] leading-relaxed text-foreground font-medium flex items-start gap-1">
              <Info className="h-3 w-3 text-primary shrink-0 mt-0.5" />
              <span>{risk.recommendation}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
