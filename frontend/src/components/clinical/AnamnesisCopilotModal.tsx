import { useState } from 'react';
import {
  Sparkles,
  Loader2,
  AlertTriangle,
  ClipboardCopy,
  Check,
  Stethoscope,
  Activity,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog';
import { Button } from '../ui/button';
import {
  aiApi,
  type ClinicalCopilotSuggestion,
  type DiagnosticHypothesis,
  type RecommendedExam,
} from '../../lib/api';

interface AnamnesisCopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
  petId: string;
  petName: string;
  currentContent?: string;
  onApplyToRecord: (formattedContent: string) => void;
}

export function AnamnesisCopilotModal({
  isOpen,
  onClose,
  petId,
  petName,
  currentContent = '',
  onApplyToRecord,
}: AnamnesisCopilotModalProps) {
  const [symptoms, setSymptoms] = useState(currentContent);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [suggestion, setSuggestion] =
    useState<ClinicalCopilotSuggestion | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleConsultCopilot() {
    if (!symptoms.trim()) {
      setErrorMsg('Descreva os sintomas ou queixa do paciente para consultar o Copilot.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setCopied(false);

    try {
      const result = await aiApi.suggestCopilot(
        petId,
        symptoms,
        additionalNotes.trim() ? additionalNotes : undefined,
      );
      setSuggestion(result);
    } catch (err: any) {
      setErrorMsg(
        'Assistente de IA temporariamente indisponível. Tente novamente em instantes.',
      );
    } finally {
      setLoading(false);
    }
  }

  function formatFormattedText(sug: ClinicalCopilotSuggestion): string {
    const lines: string[] = [];

    lines.push(`[AVALIAÇÃO DO COPILOT IA - URGÊNCIA: ${sug.urgencyLevel}]`);
    lines.push(`Resumo: ${sug.summary}`);
    lines.push('');

    if (sug.differentialDiagnoses && sug.differentialDiagnoses.length > 0) {
      lines.push('HIPÓTESES DIAGNÓSTICAS (CID-V):');
      sug.differentialDiagnoses.forEach((d) => {
        lines.push(`• ${d.name} (${d.cidV}) [Probabilidade: ${d.probability}]`);
        lines.push(`  Justificativa: ${d.justification}`);
      });
      lines.push('');
    }

    if (sug.recommendedExams && sug.recommendedExams.length > 0) {
      lines.push('EXAMES RECOMENDADOS:');
      sug.recommendedExams.forEach((e) => {
        lines.push(`• [${e.priority}] ${e.name} - Motivo: ${e.reason}`);
      });
      lines.push('');
    }

    if (sug.riskAlerts && sug.riskAlerts.length > 0) {
      lines.push('ALERTAS DE RISCO:');
      sug.riskAlerts.forEach((r) => lines.push(`⚠️ ${r}`));
      lines.push('');
    }

    if (sug.suggestedConduct && sug.suggestedConduct.length > 0) {
      lines.push('CONDUTAS SUGERIDAS:');
      sug.suggestedConduct.forEach((c) => lines.push(`- ${c}`));
    }

    return lines.join('\n');
  }

  function handleApply() {
    if (!suggestion) return;
    const formatted = formatFormattedText(suggestion);
    onApplyToRecord(formatted);
    setCopied(true);
    setTimeout(() => {
      onClose();
    }, 600);
  }

  const urgencyBadgeStyle = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-rose-500/15 text-rose-600 border-rose-500/30 animate-pulse';
      case 'HIGH':
        return 'bg-amber-500/15 text-amber-600 border-amber-500/30';
      case 'MEDIUM':
        return 'bg-blue-500/15 text-blue-600 border-blue-500/30';
      default:
        return 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b border-border/60 pb-3">
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-foreground">
            <span className="p-1.5 rounded-lg bg-gradient-to-br from-purple-500/20 to-indigo-500/20 text-purple-600 border border-purple-500/20 shadow-sm">
              <Sparkles className="h-5 w-5" />
            </span>
            Copilot de Anamnese & Apoio Diagnóstico
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Apoio à decisão clínica para <strong>{petName}</strong> baseado em literatura veterinária e correlação CID-V. Dados sanitizados com conformidade LGPD.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Seção de Entrada de Sintomas */}
          <div className="space-y-3 bg-muted/30 p-4 rounded-xl border border-border/80">
            <label className="block space-y-1.5">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Stethoscope className="h-3.5 w-3.5 text-primary" />
                Sintomas e Queixa Principal
              </span>
              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Ex: Vômito persistente há 24h, apatia, fezes pastosas, recusa de ração..."
                className="w-full min-h-[85px] rounded-lg border border-input bg-card px-3 py-2 text-xs font-medium text-foreground placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-sm"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-semibold text-muted-foreground">
                Observações ou Suspeitas Preliminares (Opcional)
              </span>
              <input
                type="text"
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="Ex: Ingestão de corpo estranho há 2 dias, histórico de atopia..."
                className="w-full h-8 rounded-lg border border-input bg-card px-3 text-xs font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
            </label>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-muted-foreground/80 font-medium">
                Alimentado por Groq Llama 3.1 70B • Timeout 15s • Pseudonimização LGPD ativa
              </span>
              <Button
                type="button"
                onClick={handleConsultCopilot}
                disabled={loading || !symptoms.trim()}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs h-8 px-4 rounded-lg hover:opacity-90 transition-opacity gap-1.5 shadow-sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Analisando caso clínico...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    Gerar Hipóteses & Conduta
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Mensagem de Erro Amigável */}
          {errorMsg && (
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold animate-in fade-in-0 duration-200">
              <XCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Resultado da Sugestão da IA */}
          {suggestion && (
            <div className="space-y-4 animate-in fade-in-0 duration-300">
              {/* Card de Resumo e Urgência */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-card border border-border shadow-sm">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                    Resumo do Quadro Clínico
                  </span>
                  <p className="text-xs font-semibold text-foreground leading-relaxed">
                    {suggestion.summary}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold border uppercase tracking-wider ${urgencyBadgeStyle(
                      suggestion.urgencyLevel,
                    )}`}
                  >
                    Urgência: {suggestion.urgencyLevel}
                  </span>
                  {suggestion.source === 'FALLBACK' && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-muted text-muted-foreground border border-border">
                      Modo Offline
                    </span>
                  )}
                </div>
              </div>

              {/* Grid: Hipóteses Diagnósticas CID-V */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5 text-indigo-500" />
                  Hipóteses Diagnósticas Diferenciais (CID-V)
                </h4>
                <div className="grid gap-2 sm:grid-cols-2">
                  {suggestion.differentialDiagnoses.map(
                    (d: DiagnosticHypothesis, idx: number) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-muted/20 border border-border/80 hover:border-primary/30 transition-all flex flex-col justify-between space-y-2"
                      >
                        <div className="space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-xs font-bold text-foreground leading-snug">
                              {d.name}
                            </span>
                            <span
                              className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border uppercase shrink-0 ${
                                d.probability === 'ALTA'
                                  ? 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                                  : d.probability === 'MEDIA'
                                  ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                                  : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                              }`}
                            >
                              {d.probability}
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground leading-relaxed">
                            {d.justification}
                          </p>
                        </div>
                        <div className="pt-1 border-t border-border/40 flex items-center justify-between text-[10px]">
                          <span className="font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 select-all cursor-pointer">
                            {d.cidV}
                          </span>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>

              {/* Grid: Exames Recomendados */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Stethoscope className="h-3.5 w-3.5 text-purple-500" />
                  Exames Complementares Sugeridos
                </h4>
                <div className="grid gap-2 sm:grid-cols-2">
                  {suggestion.recommendedExams.map(
                    (e: RecommendedExam, idx: number) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-muted/20 border border-border/80 flex items-start justify-between gap-2 text-xs"
                      >
                        <div className="space-y-0.5">
                          <span className="font-bold text-foreground block">
                            {e.name}
                          </span>
                          <span className="text-[11px] text-muted-foreground block">
                            {e.reason}
                          </span>
                        </div>
                        <span
                          className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase shrink-0 border ${
                            e.priority === 'ESSENCIAL'
                              ? 'bg-purple-500/10 text-purple-600 border-purple-500/20'
                              : 'bg-muted text-muted-foreground border-border'
                          }`}
                        >
                          {e.priority}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </div>

              {/* Alertas de Risco */}
              {suggestion.riskAlerts && suggestion.riskAlerts.length > 0 && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                  <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Alertas de Fatores de Risco & Contraindicações
                  </span>
                  <ul className="text-xs text-amber-900/90 dark:text-amber-200/90 space-y-0.5 list-disc list-inside font-medium">
                    {suggestion.riskAlerts.map((alert: string, idx: number) => (
                      <li key={idx}>{alert}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Condutas Sugeridas */}
              {suggestion.suggestedConduct &&
                suggestion.suggestedConduct.length > 0 && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                    <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Condutas Terapêuticas & Suporte Imediato
                    </span>
                    <ul className="text-xs text-emerald-900/90 dark:text-emerald-200/90 space-y-0.5 list-disc list-inside font-medium">
                      {suggestion.suggestedConduct.map(
                        (conduct: string, idx: number) => (
                          <li key={idx}>{conduct}</li>
                        ),
                      )}
                    </ul>
                  </div>
                )}

              {/* Botões de Ação do Modal */}
              <div className="pt-3 border-t border-border flex items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                  className="text-xs font-semibold"
                >
                  Fechar
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleApply}
                  disabled={copied}
                  className="bg-primary text-primary-foreground font-bold text-xs gap-1.5 shadow-sm"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      Copiado para o Prontuário!
                    </>
                  ) : (
                    <>
                      <ClipboardCopy className="h-3.5 w-3.5" />
                      Copiar Hipóteses para o Prontuário
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
