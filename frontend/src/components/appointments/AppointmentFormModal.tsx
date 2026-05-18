import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { format } from 'date-fns'
import type { Client, Pet } from '../../lib/api'
import { api, type AppointmentStatus, type CreateAppointmentPayload } from '../../lib/api'
import { Modal } from '../Modal'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { appointmentStatuses, statusLabels } from './calendar-helpers'

type AppointmentFormModalProps = {
  clients: Client[]
  pets: Pet[]
  selectedDate: Date
  onClose: () => void
  onCreated: () => void
}

export function AppointmentFormModal({
  clients,
  pets,
  selectedDate,
  onClose,
  onCreated,
}: AppointmentFormModalProps) {
  const [petId, setPetId] = useState(pets[0]?.id ?? '')
  const selectedPet = useMemo(() => pets.find((pet) => pet.id === petId), [pets, petId])
  const [clientId, setClientId] = useState(selectedPet?.clientId ?? clients[0]?.id ?? '')
  const [date, setDate] = useState(format(selectedDate, 'yyyy-MM-dd'))
  const [time, setTime] = useState('09:00')
  const [reason, setReason] = useState('')
  const [status, setStatus] = useState<AppointmentStatus>('SCHEDULED')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (selectedPet?.clientId) {
      setClientId(selectedPet.clientId)
    }
  }, [selectedPet])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const payload: CreateAppointmentPayload = {
        petId,
        clientId,
        scheduledAt: new Date(`${date}T${time}`).toISOString(),
        reason: reason || undefined,
        status,
      }

      await api.post('/appointments', payload)
      onCreated()
    } catch {
      setError('Não foi possível criar a consulta. Verifique os dados e tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal title="Nova consulta" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
            {error}
          </div>
        )}

        <Field label="Paciente">
          <select value={petId} onChange={(event) => setPetId(event.target.value)} required className={selectClassName}>
            {pets.map((pet) => (
              <option key={pet.id} value={pet.id}>
                {pet.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Tutor">
          <select value={clientId} onChange={(event) => setClientId(event.target.value)} required className={selectClassName}>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Data">
            <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} required />
          </Field>
          <Field label="Horário">
            <Input type="time" value={time} onChange={(event) => setTime(event.target.value)} required />
          </Field>
        </div>

        <Field label="Motivo">
          <Input value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Ex: Consulta de rotina" />
        </Field>

        <Field label="Status">
          <select value={status} onChange={(event) => setStatus(event.target.value as AppointmentStatus)} className={selectClassName}>
            {appointmentStatuses.map((appointmentStatus) => (
              <option key={appointmentStatus} value={appointmentStatus}>
                {statusLabels[appointmentStatus]}
              </option>
            ))}
          </select>
        </Field>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting || !petId || !clientId}>
            {isSubmitting ? 'Salvando...' : 'Criar consulta'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-foreground">{label}</span>
      {children}
    </label>
  )
}

const selectClassName =
  'h-9 w-full rounded-md border border-input bg-card px-3 text-sm font-medium text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/55'
