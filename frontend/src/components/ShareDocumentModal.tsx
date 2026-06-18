import { useState } from 'react'
import { api } from '../lib/api'

type ShareDocumentModalProps = {
  isOpen: boolean
  onClose: () => void
  documentId: string
  documentType: 'prescription' | 'consent-term'
  tutorName: string
  tutorEmail?: string | null
  tutorPhone?: string | null
  petName: string
  onShareSuccess?: () => void
}

export function ShareDocumentModal({
  isOpen,
  onClose,
  documentId,
  documentType,
  tutorName,
  tutorEmail,
  tutorPhone,
  petName,
  onShareSuccess,
}: ShareDocumentModalProps) {
  const [emailChecked, setEmailChecked] = useState(Boolean(tutorEmail))
  const [whatsappChecked, setWhatsappChecked] = useState(Boolean(tutorPhone))
  const [sharing, setSharing] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  if (!isOpen) return null

  const hasEmail = Boolean(tutorEmail)
  const hasPhone = Boolean(tutorPhone)

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!emailChecked && !whatsappChecked) {
      setFeedback({ type: 'error', message: 'Selecione pelo menos um canal para compartilhamento.' })
      return
    }

    try {
      setSharing(true)
      setFeedback(null)

      const channels: ('EMAIL' | 'WHATSAPP')[] = []
      if (emailChecked && hasEmail) channels.push('EMAIL')
      if (whatsappChecked && hasPhone) channels.push('WHATSAPP')

      const endpoint =
        documentType === 'prescription'
          ? `/prescriptions/${documentId}/share`
          : `/consent-terms/${documentId}/share`

      await api.post(endpoint, { channels })

      setFeedback({
        type: 'success',
        message: 'Documento enfileirado para compartilhamento com sucesso!',
      })

      if (onShareSuccess) {
        onShareSuccess()
      }

      // Fecha o modal após um pequeno delay para o usuário ver o feedback de sucesso
      setTimeout(() => {
        onClose()
        setFeedback(null)
      }, 1500)
    } catch (err: any) {
      console.error(err)
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Falha ao compartilhar o documento. Tente novamente.',
      })
    } finally {
      setSharing(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full border border-slate-100 shadow-xl overflow-hidden flex flex-col animate-scale-up">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-base font-bold text-slate-800">Enviar ao Tutor</h3>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
              Compartilhar documento do(a) {petName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center font-bold"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleShare} className="p-6 space-y-6">
          {feedback && (
            <div
              className={`p-4 rounded-xl text-xs font-semibold leading-relaxed border ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-100'
                  : 'bg-rose-50 text-rose-800 border-rose-100'
              }`}
            >
              {feedback.type === 'success' ? '✓ ' : '⚠ '}
              {feedback.message}
            </div>
          )}

          <div className="space-y-4">
            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
              Selecione os canais de envio para o tutor <strong className="text-slate-700">{tutorName}</strong>:
            </p>

            {/* Opção Email */}
            <label
              className={`flex items-start gap-4 p-4 rounded-xl border transition-all select-none ${
                !hasEmail
                  ? 'bg-slate-50 border-slate-150 cursor-not-allowed opacity-60'
                  : emailChecked
                  ? 'border-emerald-500 bg-emerald-50/10 cursor-pointer'
                  : 'border-slate-200 hover:border-slate-350 cursor-pointer bg-white'
              }`}
            >
              <input
                type="checkbox"
                disabled={!hasEmail || sharing}
                checked={emailChecked}
                onChange={(e) => setEmailChecked(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer disabled:cursor-not-allowed"
              />
              <div className="space-y-1 min-w-0">
                <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  📧 Enviar por E-mail
                </p>
                {hasEmail ? (
                  <p className="text-xs text-slate-500 font-medium truncate select-all">{tutorEmail}</p>
                ) : (
                  <p className="text-[11px] text-rose-500 font-semibold flex items-center gap-1">
                    ⚠ E-mail não cadastrado no tutor
                  </p>
                )}
              </div>
            </label>

            {/* Opção WhatsApp */}
            <label
              className={`flex items-start gap-4 p-4 rounded-xl border transition-all select-none ${
                !hasPhone
                  ? 'bg-slate-50 border-slate-150 cursor-not-allowed opacity-60'
                  : whatsappChecked
                  ? 'border-emerald-500 bg-emerald-50/10 cursor-pointer'
                  : 'border-slate-200 hover:border-slate-350 cursor-pointer bg-white'
              }`}
            >
              <input
                type="checkbox"
                disabled={!hasPhone || sharing}
                checked={whatsappChecked}
                onChange={(e) => setWhatsappChecked(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer disabled:cursor-not-allowed"
              />
              <div className="space-y-1 min-w-0">
                <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  💬 Enviar por WhatsApp
                </p>
                {hasPhone ? (
                  <p className="text-xs text-slate-500 font-medium truncate select-all">{tutorPhone}</p>
                ) : (
                  <p className="text-[11px] text-rose-500 font-semibold flex items-center gap-1">
                    ⚠ Telefone não cadastrado no tutor
                  </p>
                )}
              </div>
            </label>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={sharing}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={sharing || (!emailChecked && !whatsappChecked)}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50 disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              {sharing ? (
                <>
                  <span className="inline-block animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full mr-1"></span>
                  Enviando...
                </>
              ) : (
                'Compartilhar'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
