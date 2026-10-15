import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  MessageSquare,
  PawPrint,
  RefreshCw,
  Send,
  Sparkles,
  Users,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ReengagementPreviewModal } from '../../components/reengagement/ReengagementPreviewModal'
import { Button } from '../../components/ui/button'
import { Skeleton } from '../../components/ui/skeleton'
import { Toast, type ToastMessage } from '../../components/ui/toast'
import { aiApi, type ReengagementCandidate } from '../../lib/api'

export function ReengagementPage() {
  const [candidates, setCandidates] = useState<ReengagementCandidate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isTriggering, setIsTriggering] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState<ReengagementCandidate | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [toast, setToast] = useState<ToastMessage | null>(null)

  async function loadCandidates() {
    setIsLoading(true)
    try {
      const data = await aiApi.getReengagementCandidates()
      setCandidates(data)
    } catch (error) {
      console.error('[ReengagementPage] Erro ao carregar candidatos:', error)
      setToast({
        id: String(Date.now()),
        type: 'error',
        message: 'Assistente de IA temporariamente indisponível. Tente novamente em instantes.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadCandidates()
  }, [])

  async function handleTriggerBatch() {
    if (isTriggering) return

    const confirmRun = window.confirm(
      `Deseja iniciar o disparo em lote de mensagens de reengajamento para os tutores inativos elegíveis? As mensagens serão geradas pela IA e enfileiradas via BullMQ.`,
    )
    if (!confirmRun) return

    setIsTriggering(true)
    try {
      const result = await aiApi.triggerReengagementBatch()
      setToast({
        id: String(Date.now()),
        type: 'success',
        message: `Lote processado com sucesso! ${result.enqueuedCount} lembretes enfileirados no BullMQ (${result.skippedQuotaCount} ignorados por cota de envio).`,
      })
      // Recarrega candidatos após disparo
      await loadCandidates()
    } catch (error) {
      console.error('[ReengagementPage] Erro ao disparar lote de reengajamento:', error)
      setToast({
        id: String(Date.now()),
        type: 'error',
        message: 'Assistente de IA temporariamente indisponível. Tente novamente em instantes.',
      })
    } finally {
      setIsTriggering(false)
    }
  }

  // Filtragem e busca
  const filteredCandidates = useMemo(() => {
    if (!searchQuery.trim()) return candidates
    const query = searchQuery.toLowerCase()
    return candidates.filter(
      (c) =>
        c.clientName.toLowerCase().includes(query) ||
        c.petName.toLowerCase().includes(query) ||
        c.species.toLowerCase().includes(query),
    )
  }, [candidates, searchQuery])

  // Métricas
  const totalInactive = candidates.length
  const criticalInactive = candidates.filter((c) => c.daysInactive >= 180).length
  const moderateInactive = candidates.filter((c) => c.daysInactive >= 90 && c.daysInactive < 180).length

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      <Toast toast={toast} onDismiss={() => setToast(null)} />

      {/* Header com breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <Link
              to="/settings/messaging"
              className="hover:text-foreground transition-colors flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="h-3 w-3" />
              Mensageria
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">Reengajamento por IA</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
              <Sparkles className="h-6 w-6 text-primary" />
              Painel de Reengajamento & Retenção
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              Groq LLaMA 3.1
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1.5">
            Identifique tutores sem visitas há mais de 90 dias e recupere o engajamento com mensagens contextuais
            automáticas.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={loadCandidates}
            disabled={isLoading || isTriggering}
            className="cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>

          <Button
            type="button"
            onClick={handleTriggerBatch}
            disabled={isLoading || isTriggering || candidates.length === 0}
            className="cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-xs"
          >
            {isTriggering ? (
              <>
                <RefreshCw className="h-4 w-4 mr-1.5 animate-spin" />
                Disparando via BullMQ...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-1.5" />
                Disparar Lembretes em Lote
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Cards de Métricas (KPIs no topo) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Total Inativos (&gt;90 dias)</span>
            <Users className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">{totalInactive}</span>
            <span className="text-xs text-muted-foreground">tutores</span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">Elegíveis para reengajamento</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Inatividade Moderada (90-180d)</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">{moderateInactive}</span>
            <span className="text-xs text-muted-foreground">tutores</span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">Ideal para lembrete de rotina</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Inatividade Crítica (&gt;180d)</span>
            <AlertCircle className="h-4 w-4 text-rose-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-600 dark:text-rose-400">{criticalInactive}</span>
            <span className="text-xs text-muted-foreground">tutores</span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">Risco elevado de churn</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Disparo Automatizado</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Cron Semanal</span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">Fila BullMQ ativa com cota SaaS</p>
        </div>
      </div>

      {/* Barra de Filtro / Busca */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <input
          type="search"
          placeholder="Buscar tutor ou paciente..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-3.5 py-2 text-xs rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-primary w-full sm:w-80 shadow-xs"
        />

        <div className="text-xs text-muted-foreground self-center">
          Exibindo <strong>{filteredCandidates.length}</strong> de <strong>{candidates.length}</strong> tutores
        </div>
      </div>

      {/* Tabela de Clientes Inativos */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : filteredCandidates.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-foreground">Nenhum cliente inativo encontrado</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              {searchQuery
                ? 'Nenhum resultado corresponde à sua pesquisa.'
                : 'Excelente! Todos os seus clientes visitaram a clínica nos últimos 90 dias.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 text-muted-foreground font-semibold border-b border-border uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-5 py-3.5">Nome do Tutor</th>
                  <th className="px-5 py-3.5">Pet(s)</th>
                  <th className="px-5 py-3.5">Última Visita</th>
                  <th className="px-5 py-3.5">Tempo Inativo</th>
                  <th className="px-5 py-3.5 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredCandidates.map((candidate) => {
                  const isCritical = candidate.daysInactive >= 180
                  const lastVisitFormatted = new Date(candidate.lastVisitDate).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })

                  return (
                    <tr
                      key={candidate.clientId}
                      className="hover:bg-muted/20 transition-colors group"
                    >
                      {/* Tutor */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                            {candidate.clientName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-semibold text-foreground block group-hover:text-primary transition-colors">
                              {candidate.clientName}
                            </span>
                            {(candidate.whatsapp || candidate.phone) && (
                              <span className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                <MessageSquare className="h-3 w-3 text-emerald-600" />
                                {candidate.whatsapp || candidate.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Pet */}
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] bg-muted font-medium text-foreground border border-border/60">
                          <PawPrint className="h-3 w-3 text-primary" />
                          {candidate.petName}
                          <span className="text-[10px] text-muted-foreground">
                            ({candidate.species}{candidate.breed ? ` • ${candidate.breed}` : ''})
                          </span>
                        </span>
                      </td>

                      {/* Última Visita */}
                      <td className="px-5 py-4 text-muted-foreground font-medium">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{lastVisitFormatted}</span>
                        </div>
                      </td>

                      {/* Dias Inativo */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                            isCritical
                              ? 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30'
                              : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30'
                          }`}
                        >
                          <Clock className="h-3 w-3" />
                          {candidate.daysInactive} dias
                        </span>
                      </td>

                      {/* Botão de Ação */}
                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedCandidate(candidate)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary/10 hover:bg-primary/20 text-primary border border-primary/25 shadow-2xs transition-colors cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>Simular Mensagem</span>
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Simulação com interpolação LGPD local */}
      {selectedCandidate && (
        <ReengagementPreviewModal
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
        />
      )}
    </div>
  )
}
