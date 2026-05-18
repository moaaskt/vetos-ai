import { Clock, PawPrint, User } from 'lucide-react'
import type { Appointment, AppointmentStatus } from '../../lib/api'
import { Button } from '../ui/button'
import { appointmentDate, formatTime, statusLabels, statusStyles } from './calendar-helpers'

type AppointmentCardProps = {
  appointment: Appointment
  onStatusChange: (appointmentId: string, status: AppointmentStatus) => void
  isUpdating?: boolean
}

export function AppointmentCard({ appointment, onStatusChange, isUpdating }: AppointmentCardProps) {
  const tutorName = appointment.client?.name ?? appointment.pet?.client?.name ?? 'Tutor não informado'

  return (
    <article className="rounded-lg border border-border bg-card p-4 shadow-sm transition-colors hover:border-primary/25">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-2">
          <div className="flex items-center gap-2">
            <PawPrint className="h-4 w-4 shrink-0 text-primary" />
            <h3 className="truncate text-sm font-semibold text-foreground">
              {appointment.pet?.name ?? 'Paciente animal'}
            </h3>
          </div>
          <p className="line-clamp-2 text-xs font-medium text-muted-foreground">
            {appointment.reason || 'Consulta clínica'}
          </p>
        </div>
        <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase ${statusStyles[appointment.status]}`}>
          {statusLabels[appointment.status]}
        </span>
      </div>

      <div className="mt-4 grid gap-2 text-xs font-medium text-muted-foreground">
        <span className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-primary" />
          {formatTime(appointmentDate(appointment))}
        </span>
        <span className="flex items-center gap-2 truncate">
          <User className="h-3.5 w-3.5 text-primary" />
          <span className="truncate">{tutorName}</span>
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {(['SCHEDULED', 'COMPLETED', 'CANCELLED'] as AppointmentStatus[]).map((status) => (
          <Button
            key={status}
            type="button"
            size="sm"
            variant={appointment.status === status ? 'default' : 'outline'}
            disabled={isUpdating || appointment.status === status}
            onClick={() => onStatusChange(appointment.id, status)}
            className="h-7 px-2 text-[11px]"
          >
            {statusLabels[status]}
          </Button>
        ))}
      </div>
    </article>
  )
}
