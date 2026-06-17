import React, { useState } from 'react'
import { Modal } from './Modal'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { api } from '../lib/api'

type CreatePrescriptionModalProps = {
  petId: string
  onClose: () => void
  onCreated: () => void
}

export function CreatePrescriptionModal({
  petId,
  onClose,
  onCreated,
}: CreatePrescriptionModalProps) {
  const [medicamento, setMedicamento] = useState('')
  const [dosagem, setDosagem] = useState('')
  const [frequencia, setFrequencia] = useState('')
  const [duracao, setDuracao] = useState('')
  const [viaAdministracao, setViaAdministracao] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!medicamento.trim() || !dosagem.trim() || !frequencia.trim() || !duracao.trim() || !viaAdministracao.trim()) {
      setError('Por favor, preencha todos os campos obrigatórios.')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      await api.post('/prescriptions', {
        medicamento: medicamento.trim(),
        dosagem: dosagem.trim(),
        frequencia: frequencia.trim(),
        duracao: duracao.trim(),
        viaAdministracao: viaAdministracao.trim(),
        observacoes: observacoes.trim() || undefined,
        petId,
      })
      onCreated()
    } catch (err: any) {
      setError('Falha ao salvar a receita. Por favor, tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal title="Nova Receita Médica" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5 col-span-2">
            <label className="text-xs font-bold text-foreground uppercase tracking-wide">Medicamento *</label>
            <Input
              value={medicamento}
              onChange={(e) => setMedicamento(e.target.value)}
              placeholder="Ex: Amoxicilina 250mg"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-wide">Dosagem *</label>
            <Input
              value={dosagem}
              onChange={(e) => setDosagem(e.target.value)}
              placeholder="Ex: 1 comprimido"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-wide">Frequência *</label>
            <Input
              value={frequencia}
              onChange={(e) => setFrequencia(e.target.value)}
              placeholder="Ex: A cada 12 horas"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-wide">Duração *</label>
            <Input
              value={duracao}
              onChange={(e) => setDuracao(e.target.value)}
              placeholder="Ex: 7 dias"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-wide">Via de Adm. *</label>
            <Input
              value={viaAdministracao}
              onChange={(e) => setViaAdministracao(e.target.value)}
              placeholder="Ex: Oral"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground uppercase tracking-wide">Observações Adicionais</label>
          <textarea
            value={observacoes}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setObservacoes(e.target.value)}
            placeholder="Observações ou orientações especiais para o tutor..."
            rows={3}
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-foreground font-medium"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar Emissão
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : 'Salvar Rascunho'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
