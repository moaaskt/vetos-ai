import { addDays, addWeeks, subDays, subWeeks } from 'date-fns'
import { AlertCircle } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { AppointmentCalendarControls } from '../components/appointments/AppointmentCalendarControls'
import { AppointmentDayView } from '../components/appointments/AppointmentDayView'
import { AppointmentFormModal } from '../components/appointments/AppointmentFormModal'
import { AppointmentSummaryBar } from '../components/appointments/AppointmentSummaryBar'
import { AppointmentWeekView } from '../components/appointments/AppointmentWeekView'
import {
  type AppointmentStatusFilter,
  type CalendarMode,
  filterAppointments,
  formatDayLabel,
  normalizeAppointment,
} from '../components/appointments/calendar-helpers'
import { Skeleton } from '../components/ui/skeleton'
import { api, type Appointment, type AppointmentStatus, type Client, type Pet } from '../lib/api'

export function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [pets, setPets] = useState<Pet[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [mode, setMode] = useState<CalendarMode>('day')
  const [statusFilter, setStatusFilter] = useState<AppointmentStatusFilter>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [updatingAppointmentId, setUpdatingAppointmentId] = useState<string>()

  async function loadData() {
    setIsLoading(true)

    try {
      const [appointmentsResponse, clientsResponse, petsResponse] = await Promise.all([
        api.get<Appointment[]>('/appointments'),
        api.get<Client[]>('/clients'),
        api.get<Pet[]>('/pets'),
      ])

      setAppointments(appointmentsResponse.data.map(normalizeAppointment))
      setClients(clientsResponse.data)
      setPets(petsResponse.data)
      setError('')
    } catch {
      setError('Não foi possível carregar a agenda de consultas.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const visibleAppointments = useMemo(
    () => filterAppointments(appointments, selectedDate, mode, statusFilter, searchQuery),
    [appointments, selectedDate, mode, statusFilter, searchQuery],
  )

  function handlePrevious() {
    setSelectedDate((current) => (mode === 'day' ? subDays(current, 1) : subWeeks(current, 1)))
  }

  function handleNext() {
    setSelectedDate((current) => (mode === 'day' ? addDays(current, 1) : addWeeks(current, 1)))
  }

  async function handleStatusChange(appointmentId: string, status: AppointmentStatus) {
    setUpdatingAppointmentId(appointmentId)

    try {
      const response = await api.patch<Appointment>(`/appointments/${appointmentId}`, { status })
      const updatedAppointment = normalizeAppointment(response.data)
      setAppointments((current) =>
        current.map((appointment) => (appointment.id === appointmentId ? updatedAppointment : appointment)),
      )
      setError('')
    } catch {
      setError('Não foi possível atualizar o status da consulta.')
    } finally {
      setUpdatingAppointmentId(undefined)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in-0 duration-500">
      <PageHeader
        title="Agenda de Consultas"
        badge="Calendário Clínico"
        description={`Visão ${mode === 'day' ? 'diária' : 'semanal'} para ${formatDayLabel(selectedDate)}.`}
      />

      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <AppointmentCalendarControls
        mode={mode}
        onModeChange={setMode}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        onPrevious={handlePrevious}
        onToday={() => setSelectedDate(new Date())}
        onNext={handleNext}
        onRefresh={loadData}
        onCreate={() => setIsCreateOpen(true)}
        isLoading={isLoading}
      />

      <AppointmentSummaryBar appointments={visibleAppointments} visibleCount={visibleAppointments.length} />

      {isLoading ? (
        <div className="grid gap-3">
          <Skeleton className="h-28 w-full rounded-lg bg-card" />
          <Skeleton className="h-28 w-full rounded-lg bg-card" />
          <Skeleton className="h-28 w-full rounded-lg bg-card" />
        </div>
      ) : mode === 'day' ? (
        <AppointmentDayView
          selectedDate={selectedDate}
          appointments={visibleAppointments}
          onStatusChange={handleStatusChange}
          updatingAppointmentId={updatingAppointmentId}
        />
      ) : (
        <AppointmentWeekView
          selectedDate={selectedDate}
          appointments={visibleAppointments}
          onStatusChange={handleStatusChange}
          updatingAppointmentId={updatingAppointmentId}
        />
      )}

      {isCreateOpen && (
        <AppointmentFormModal
          clients={clients}
          pets={pets}
          selectedDate={selectedDate}
          onClose={() => setIsCreateOpen(false)}
          onCreated={() => {
            setIsCreateOpen(false)
            loadData()
          }}
        />
      )}
    </div>
  )
}
