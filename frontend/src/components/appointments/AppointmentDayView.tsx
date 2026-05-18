import { CalendarDays } from 'lucide-react'
import type { Appointment, AppointmentStatus } from '../../lib/api'
import { AppointmentCard } from './AppointmentCard'
import { appointmentDate, appointmentsForDay, buildTimeSlots, formatDayLabel } from './calendar-helpers'

type AppointmentDayViewProps = {
  selectedDate: Date
  appointments: Appointment[]
  onStatusChange: (appointmentId: string, status: AppointmentStatus) => void
  updatingAppointmentId?: string
}

export function AppointmentDayView({
  selectedDate,
  appointments,
  onStatusChange,
  updatingAppointmentId,
}: AppointmentDayViewProps) {
  const dayAppointments = appointmentsForDay(appointments, selectedDate)

  return (
    <section className="rounded-lg border border-border bg-card shadow-sm">
      <header className="flex flex-col gap-1 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold capitalize text-foreground">{formatDayLabel(selectedDate)}</h2>
          <p className="text-xs font-medium text-muted-foreground">Agenda operacional por horário</p>
        </div>
        <span className="text-xs font-bold uppercase text-primary">{dayAppointments.length} consultas</span>
      </header>

      <div className="hidden divide-y divide-border md:block">
        {buildTimeSlots().map((hour) => {
          const appointmentsInSlot = dayAppointments.filter((appointment) => appointmentDate(appointment).getHours() === hour)

          return (
            <div key={hour} className="grid min-h-28 grid-cols-[84px_minmax(0,1fr)]">
              <div className="border-r border-border bg-muted/25 px-4 py-4 text-xs font-bold text-muted-foreground">
                {String(hour).padStart(2, '0')}:00
              </div>
              <div className="grid gap-3 p-4 lg:grid-cols-2">
                {appointmentsInSlot.length > 0 ? (
                  appointmentsInSlot.map((appointment) => (
                    <AppointmentCard
                      key={appointment.id}
                      appointment={appointment}
                      onStatusChange={onStatusChange}
                      isUpdating={updatingAppointmentId === appointment.id}
                    />
                  ))
                ) : (
                  <span className="flex items-center text-xs font-medium text-muted-foreground">Horário livre</span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="space-y-3 p-4 md:hidden">
        {dayAppointments.map((appointment) => (
          <AppointmentCard
            key={appointment.id}
            appointment={appointment}
            onStatusChange={onStatusChange}
            isUpdating={updatingAppointmentId === appointment.id}
          />
        ))}
        {dayAppointments.length === 0 && <EmptyCalendarMessage />}
      </div>
    </section>
  )
}

function EmptyCalendarMessage() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border p-8 text-center">
      <CalendarDays className="h-7 w-7 text-muted-foreground" />
      <p className="text-sm font-semibold text-foreground">Nenhuma consulta neste dia</p>
      <p className="text-xs font-medium text-muted-foreground">Use Nova consulta para preencher este horário.</p>
    </div>
  )
}
