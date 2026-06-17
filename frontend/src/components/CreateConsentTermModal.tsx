import React, { useState, useEffect } from 'react'
import { Modal } from './Modal'
import { Button } from './ui/button'
import { api, type ConsentTemplate } from '../lib/api'

type CreateConsentTermModalProps = {
  pet: any
  onClose: () => void
  onCreated: () => void
}

export function CreateConsentTermModal({
  pet,
  onClose,
  onCreated,
}: CreateConsentTermModalProps) {
  const [templates, setTemplates] = useState<ConsentTemplate[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState('')
  const [finalText, setFinalText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadTemplates() {
      setIsLoading(true)
      try {
        const response = await api.get<ConsentTemplate[]>('/consent-terms/templates')
        setTemplates(response.data)
      } catch (err) {
        setError('Não foi possível carregar os templates de termos.')
      } finally {
        setIsLoading(false)
      }
    }
    loadTemplates()
  }, [])

  function handleTemplateChange(templateId: string) {
    setSelectedTemplateId(templateId)
    const tpl = templates.find((t) => t.id === templateId)
    if (tpl) {
      // Interpolação local no frontend para visualização em tempo real pelo usuário
      const tutorName = pet.client?.name || 'Tutor'
      const clinicName = pet.clinic?.name || 'Clínica Veterinária'
      const petName = pet.name || 'Paciente'

      const text = tpl.baseText
        .replace(/{pet_name}/g, petName)
        .replace(/{tutor_name}/g, tutorName)
        .replace(/{clinic_name}/g, clinicName)

      setFinalText(text)
    } else {
      setFinalText('')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!finalText.trim()) {
      setError('O texto do termo de consentimento não pode estar vazio.')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      await api.post('/consent-terms', {
        petId: pet.id,
        finalText: finalText.trim(),
        consentTemplateId: selectedTemplateId || undefined,
      })
      onCreated()
    } catch (err) {
      setError('Falha ao salvar o termo de consentimento. Por favor, tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal title="Novo Termo de Consentimento" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground uppercase tracking-wide">Selecionar Modelo</label>
          {isLoading ? (
            <div className="text-sm text-muted-foreground animate-pulse">Carregando modelos de termos...</div>
          ) : (
            <select
              value={selectedTemplateId}
              onChange={(e) => handleTemplateChange(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-foreground font-semibold"
            >
              <option value="">-- Selecione um Modelo de Termo --</option>
              {templates.map((tpl) => (
                <option key={tpl.id} value={tpl.id}>
                  {tpl.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {selectedTemplateId && (
          <div className="space-y-1.5 animate-in fade-in-0 duration-300">
            <label className="text-xs font-bold text-foreground uppercase tracking-wide">Texto Final do Termo (Edição Livre)</label>
            <textarea
              value={finalText}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFinalText(e.target.value)}
              placeholder="Texto do termo de consentimento..."
              rows={8}
              required
              className="flex min-h-[160px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-foreground font-medium"
            />
            <p className="text-xs text-muted-foreground">
              Você pode editar livremente o texto acima antes de salvar o rascunho do termo.
            </p>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar Emissão
          </Button>
          <Button type="submit" disabled={isSubmitting || !selectedTemplateId}>
            {isSubmitting ? 'Salvando...' : 'Salvar Rascunho'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
