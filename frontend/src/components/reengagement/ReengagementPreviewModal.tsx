import { Check, Copy, MessageSquare, Sparkles, X } from 'lucide-react'
import { useState } from 'react'
import type { ReengagementCandidate } from '../../lib/api'

interface ReengagementPreviewModalProps {
  candidate: ReengagementCandidate
  onClose: () => void
}

const TEMPLATE_PRESETS = [
  {
    id: 'preventive',
    label: 'Check-up Preventivo',
    template:
      'Olá {{clientName}}! 🐾 Notamos que já faz {{daysInactive}} dias que o(a) {{petName}} não passa para um check-up preventivo na VetOS. A prevenção contínua é o maior gesto de carinho para garantir longevidade e bem-estar ao seu companheiro. Podemos reservar um horário com nosso veterinário esta semana?',
  },
  {
    id: 'affectionate',
    label: 'Carinho & Acompanhamento',
    template:
      'Oi, {{clientName}}! Estamos com saudades do(a) {{petName}} aqui na clínica! Como ele(a) está passando? Já se passaram {{daysInactive}} dias desde o último atendimento. Se precisar de uma avaliação clínica ou orientações de rotina, nossa equipe está de portas abertas para recebê-los!',
  },
  {
    id: 'health_check',
    label: 'Revisão de Saúde Geral',
    template:
      'Olá {{clientName}}! A saúde do(a) {{petName}} continua sendo nossa prioridade. Para manter o histórico clínico e a proteção sempre em dia (última visita há {{daysInactive}} dias), que tal agendarmos uma consulta de rotina? Responda a esta mensagem para consultar nossa grade de horários disponíveis!',
  },
]

export function ReengagementPreviewModal({ candidate, onClose }: ReengagementPreviewModalProps) {
  const [selectedPresetId, setSelectedPresetId] = useState('preventive')
  const [copied, setCopied] = useState(false)

  const activePreset = TEMPLATE_PRESETS.find((p) => p.id === selectedPresetId) || TEMPLATE_PRESETS[0]
  const primaryPetName = candidate.petName || 'seu pet'
  const contactPhone = candidate.whatsapp || candidate.phone

  // INTERPOLAÇÃO LOCAL ESTRITA NO FRONTEND (LGPD COMPLIANT - ZERO PII EXPOSTO AO LLM NO PREVIEW)
  const interpolatedMessage = activePreset.template
    .replaceAll('{{clientName}}', candidate.clientName)
    .replaceAll('{{petName}}', primaryPetName)
    .replaceAll('{{daysInactive}}', String(candidate.daysInactive))

  function handleCopy() {
    navigator.clipboard.writeText(interpolatedMessage)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleDirectWhatsApp() {
    const rawPhone = contactPhone?.replace(/\D/g, '') || ''
    if (!rawPhone) {
      alert('Tutor não possui telefone/WhatsApp cadastrado para envio direto.')
      return
    }
    const fullPhone = rawPhone.length <= 11 ? `55${rawPhone}` : rawPhone
    const url = `https://wa.me/${fullPhone}?text=${encodeURIComponent(interpolatedMessage)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-in fade-in-0 duration-200">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Simulador de Mensagem de Reengajamento</h3>
              <p className="text-xs text-muted-foreground">Preview com interpolação segura no frontend (LGPD)</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Metadados do Candidato */}
        <div className="mt-4 p-3 rounded-xl bg-muted/30 border border-border/60 text-xs space-y-1.5">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tutor(a):</span>
            <strong className="text-foreground">{candidate.clientName}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Pet(s):</span>
            <span className="text-foreground font-medium">{primaryPetName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Período de Inatividade:</span>
            <span className="text-amber-600 dark:text-amber-400 font-semibold">{candidate.daysInactive} dias sem consulta</span>
          </div>
        </div>

        {/* Seleção do Tipo de Abordagem */}
        <div className="mt-4">
          <label className="text-xs font-semibold text-foreground mb-1.5 block">Tom da Abordagem:</label>
          <div className="grid grid-cols-3 gap-2">
            {TEMPLATE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => setSelectedPresetId(preset.id)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border text-center transition-all cursor-pointer ${
                  selectedPresetId === preset.id
                    ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                    : 'bg-background hover:bg-muted text-muted-foreground border-border'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Preview da Mensagem (Estilo Balão do WhatsApp) */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
              Preview no WhatsApp / Notificação:
            </span>
            <span className="text-[10px] text-muted-foreground">Interpolado localmente</span>
          </div>

          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-foreground text-xs leading-relaxed font-sans shadow-inner">
            {interpolatedMessage}
          </div>
        </div>

        {/* Rodapé com ações */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-end gap-2 pt-4 border-t border-border">
          <button
            type="button"
            onClick={handleCopy}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-border bg-background hover:bg-muted text-foreground transition-colors cursor-pointer"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
            <span>{copied ? 'Copiado!' : 'Copiar Texto'}</span>
          </button>

          {contactPhone && (
            <button
              type="button"
              onClick={handleDirectWhatsApp}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors cursor-pointer"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Abrir no WhatsApp</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}
