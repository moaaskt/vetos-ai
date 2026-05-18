import { CalendarPlus, ChevronLeft, ChevronRight, RefreshCw, Search } from 'lucide-react'
import type { AppointmentStatusFilter, CalendarMode } from './calendar-helpers'
import { appointmentStatuses, statusLabels } from './calendar-helpers'
import { Button } from '../ui/button'
import { Input } from '../ui/input'

type AppointmentCalendarControlsProps = {
  mode: CalendarMode
  onModeChange: (mode: CalendarMode) => void
  statusFilter: AppointmentStatusFilter
  onStatusFilterChange: (status: AppointmentStatusFilter) => void
  searchQuery: string
  onSearchQueryChange: (query: string) => void
  onPrevious: () => void
  onToday: () => void
  onNext: () => void
  onRefresh: () => void
  onCreate: () => void
  isLoading: boolean
}

export function AppointmentCalendarControls({
  mode,
  onModeChange,
  statusFilter,
  onStatusFilterChange,
  searchQuery,
  onSearchQueryChange,
  onPrevious,
  onToday,
  onNext,
  onRefresh,
  onCreate,
  isLoading,
}: AppointmentCalendarControlsProps) {
  return (
    <section className="space-y-4 rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant={mode === 'day' ? 'default' : 'outline'} onClick={() => onModeChange('day')}>
            Dia
          </Button>
          <Button type="button" variant={mode === 'week' ? 'default' : 'outline'} onClick={() => onModeChange('week')}>
            Semana
          </Button>
          <Button type="button" variant="outline" size="icon" onClick={onPrevious} title="Anterior">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button type="button" variant="outline" onClick={onToday}>
            Hoje
          </Button>
          <Button type="button" variant="outline" size="icon" onClick={onNext} title="Próximo">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" onClick={onRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button type="button" onClick={onCreate}>
            <CalendarPlus className="h-4 w-4" />
            Nova consulta
          </Button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={searchQuery}
            onChange={(event) => onSearchQueryChange(event.target.value)}
            placeholder="Buscar por paciente, tutor ou motivo..."
            className="pl-9"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(event) => onStatusFilterChange(event.target.value as AppointmentStatusFilter)}
          className="h-9 rounded-md border border-input bg-card px-3 text-sm font-medium text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/55"
        >
          <option value="ALL">Todos os status</option>
          {appointmentStatuses.map((status) => (
            <option key={status} value={status}>
              {statusLabels[status]}
            </option>
          ))}
        </select>
      </div>
    </section>
  )
}
