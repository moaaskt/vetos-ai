import {
  addDays,
  endOfDay,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  isSameDay,
  parseISO,
  startOfDay,
  startOfWeek,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { Appointment, AppointmentStatus } from '../../lib/api'

export type CalendarMode = 'day' | 'week'
export type AppointmentStatusFilter = AppointmentStatus | 'ALL'

export const appointmentStatuses: AppointmentStatus[] = ['SCHEDULED', 'COMPLETED', 'CANCELLED']

export const statusLabels: Record<AppointmentStatus, string> = {
  SCHEDULED: 'Agendado',
  COMPLETED: 'Concluído',
  CANCELLED: 'Cancelado',
}

export const statusStyles: Record<AppointmentStatus, string> = {
  SCHEDULED: 'border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-200',
  COMPLETED: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200',
  CANCELLED: 'border-rose-500/25 bg-rose-500/10 text-rose-700 dark:text-rose-200',
}

export const fallbackClinicHours = {
  start: 8,
  end: 18,
}

export function normalizeAppointment(appointment: Appointment): Appointment {
  return {
    ...appointment,
    scheduledAt: appointment.scheduledAt ?? appointment.date ?? new Date().toISOString(),
  }
}

export function appointmentDate(appointment: Appointment) {
  return parseISO(appointment.scheduledAt)
}

export function buildWeekDays(anchorDate: Date) {
  const weekStart = startOfWeek(anchorDate, { weekStartsOn: 1 })
  return Array.from({ length: 7 }, (_, index) => addDays(weekStart, index))
}

export function buildTimeSlots() {
  return Array.from(
    { length: fallbackClinicHours.end - fallbackClinicHours.start + 1 },
    (_, index) => fallbackClinicHours.start + index,
  )
}

export function formatDayLabel(date: Date) {
  return format(date, "EEEE, dd 'de' MMMM", { locale: ptBR })
}

export function formatCompactDate(date: Date) {
  return format(date, 'dd MMM', { locale: ptBR })
}

export function formatTime(date: Date) {
  return format(date, 'HH:mm', { locale: ptBR })
}

export function filterAppointments(
  appointments: Appointment[],
  selectedDate: Date,
  mode: CalendarMode,
  statusFilter: AppointmentStatusFilter,
  searchQuery: string,
) {
  const rangeStart = mode === 'day' ? startOfDay(selectedDate) : startOfWeek(selectedDate, { weekStartsOn: 1 })
  const rangeEnd = mode === 'day' ? endOfDay(selectedDate) : endOfWeek(selectedDate, { weekStartsOn: 1 })
  const query = searchQuery.trim().toLowerCase()

  return appointments
    .filter((appointment) => {
      const scheduledAt = appointmentDate(appointment)
      const inRange = !isBefore(scheduledAt, rangeStart) && !isAfter(scheduledAt, rangeEnd)
      const matchesStatus = statusFilter === 'ALL' || appointment.status === statusFilter
      const searchable = [
        appointment.pet?.name,
        appointment.pet?.breed,
        appointment.pet?.client?.name,
        appointment.client?.name,
        appointment.reason,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return inRange && matchesStatus && (!query || searchable.includes(query))
    })
    .sort((left, right) => appointmentDate(left).getTime() - appointmentDate(right).getTime())
}

export function appointmentsForDay(appointments: Appointment[], day: Date) {
  return appointments.filter((appointment) => isSameDay(appointmentDate(appointment), day))
}
