import { CalendarDays, CheckCircle2, Clock, XCircle } from 'lucide-react'
import type { ComponentType } from 'react'
import type { Appointment } from '../../lib/api'

type AppointmentSummaryBarProps = {
  appointments: Appointment[]
  visibleCount: number
}

export function AppointmentSummaryBar({ appointments, visibleCount }: AppointmentSummaryBarProps) {
  const scheduled = appointments.filter((appointment) => appointment.status === 'SCHEDULED').length
  const completed = appointments.filter((appointment) => appointment.status === 'COMPLETED').length
  const cancelled = appointments.filter((appointment) => appointment.status === 'CANCELLED').length

  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Metric icon={CalendarDays} label="Visíveis" value={visibleCount} tone="text-primary bg-primary/10 border-primary/15" />
      <Metric icon={Clock} label="Agendadas" value={scheduled} tone="text-amber-700 bg-amber-500/10 border-amber-500/20 dark:text-amber-200" />
      <Metric icon={CheckCircle2} label="Concluídas" value={completed} tone="text-emerald-700 bg-emerald-500/10 border-emerald-500/20 dark:text-emerald-200" />
      <Metric icon={XCircle} label="Canceladas" value={cancelled} tone="text-rose-700 bg-rose-500/10 border-rose-500/20 dark:text-rose-200" />
    </section>
  )
}

function Metric({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: ComponentType<{ className?: string }>
  label: string
  value: number
  tone: string
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4 shadow-sm">
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>
      </div>
      <span className={`flex h-10 w-10 items-center justify-center rounded-lg border ${tone}`}>
        <Icon className="h-5 w-5" />
      </span>
    </div>
  )
}
