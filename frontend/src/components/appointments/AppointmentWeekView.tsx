import { CalendarDays } from 'lucide-react'
import type { Appointment, AppointmentStatus } from '../../lib/api'
import { AppointmentCard } from './AppointmentCard'
import { appointmentsForDay, buildWeekDays, formatCompactDate } from './calendar-helpers'

type AppointmentWeekViewProps = {
  selectedDate: Date
  appointments: Appointment[]
  onStatusChange: (appointmentId: string, status: AppointmentStatus) => void
  updatingAppointmentId?: string
}

export function AppointmentWeekView({
  selectedDate,
  appointments,
  onStatusChange,
  updatingAppointmentId,
}: AppointmentWeekViewProps) {
  const days = buildWeekDays(selectedDate)

  return (
    <section className="grid gap-3 xl:grid-cols-7">
      {days.map((day) => {
        const dayAppointments = appointmentsForDay(appointments, day)

        return (
          <div key={day.toISOString()} className="min-h-56 rounded-lg border border-border bg-card shadow-sm">
            <header className="border-b border-border px-4 py-3">
              <p className="text-sm font-semibold capitalize text-foreground">{formatCompactDate(day)}</p>
              <p className="text-xs font-bold uppercase text-muted-foreground">{dayAppointments.length} consultas</p>
            </header>
            <div className="space-y-3 p-3">
              {dayAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  onStatusChange={onStatusChange}
                  isUpdating={updatingAppointmentId === appointment.id}
                />
              ))}
              {dayAppointments.length === 0 && (
                <div className="flex min-h-28 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border p-4 text-center">
                  <CalendarDays className="h-5 w-5 text-muted-foreground" />
                  <p className="text-xs font-medium text-muted-foreground">Sem consultas</p>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </section>
  )
}
