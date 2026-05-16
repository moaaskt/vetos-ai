import { CalendarClock, CalendarDays, RefreshCw, User, PawPrint, Clock, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { api, type Appointment } from '../lib/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Skeleton } from '../components/ui/skeleton'
import { EmptyState } from '../components/EmptyState'

export function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadAppointments() {
    setIsLoading(true)

    try {
      const response = await api.get<Appointment[]>('/appointments')
      setAppointments(response.data)
      setError('')
    } catch {
      setError('Não foi possível carregar as consultas agendadas.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true

    api
      .get<Appointment[]>('/appointments')
      .then((response) => {
        if (isMounted) {
          setAppointments(response.data)
          setError('')
        }
      })
      .catch(() => {
        if (isMounted) {
          setError('Não foi possível carregar as consultas agendadas.')
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  const upcomingAppointments = useMemo(
    () =>
      [...appointments].sort(
        (left, right) => new Date(left.date).getTime() - new Date(right.date).getTime(),
      ),
    [appointments],
  )

  const getStatusColor = (status?: string) => {
    switch (status?.toUpperCase()) {
      case 'CONFIRMED':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      case 'CANCELLED':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20'
      case 'COMPLETED':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      default:
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    }
  }

  const getStatusText = (status?: string) => {
    switch (status?.toUpperCase()) {
      case 'CONFIRMED':
        return 'CONFIRMADO'
      case 'CANCELLED':
        return 'CANCELADO'
      case 'COMPLETED':
        return 'CONCLUÍDO'
      case 'SCHEDULED':
        return 'AGENDADO'
      default:
        return 'PENDENTE'
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in-0 duration-500">
      <PageHeader
        title="Agenda de Consultas"
        badge="Tempo Real"
        description="Acompanhe as consultas clínicas, exames laboratoriais de rotina e procedimentos cirúrgicos agendados."
        action={
          <Button onClick={loadAppointments} variant="outline" className="border-border hover:border-teal-400/40 gap-2 font-semibold">
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar Agenda
          </Button>
        }
      />

      {error && (
        <div className="flex items-center gap-3 rounded-xl bg-destructive/15 border border-destructive/30 px-5 py-4 text-sm font-medium text-destructive-foreground shadow-sm">
          <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />
          <span>{error}</span>
        </div>
      )}

      {/* Quick Overview Pill Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-card/60 p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-400/10 text-teal-400 font-bold">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total Agendado</p>
              <p className="text-xl font-bold text-foreground">{appointments.length}</p>
            </div>
          </div>
          <span className="flex h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
        </div>
        
        <div className="rounded-xl border border-border bg-card/60 p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-400 font-bold">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Confirmados</p>
              <p className="text-xl font-bold text-emerald-400">
                {appointments.filter(a => a.status?.toUpperCase() === 'CONFIRMED').length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card/60 p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-400/10 text-blue-400 font-bold">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Pendentes</p>
              <p className="text-xl font-bold text-blue-400">
                {appointments.filter(a => !['CONFIRMED', 'CANCELLED'].includes(a.status?.toUpperCase() || '')).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <Card className="border-border bg-card/60 backdrop-blur-sm overflow-hidden shadow-xl">
        <CardHeader className="border-b border-border/60 bg-card/80 py-5 px-6 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-teal-400" />
              Próximos Atendimentos
            </CardTitle>
            <CardDescription className="text-xs">Ordenados cronologicamente pelo horário da consulta</CardDescription>
          </div>
          <span className="text-xs font-bold text-teal-300 px-3 py-1 rounded-md bg-teal-400/10 border border-teal-400/20 uppercase tracking-wide">
            {upcomingAppointments.length} Consultas
          </span>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border/60">
            {upcomingAppointments.map((appointment) => (
              <article
                key={appointment.id}
                className="group flex flex-col gap-4 px-6 py-5 transition-all hover:bg-muted/40 md:flex-row md:items-center md:justify-between relative overflow-hidden font-medium"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-transparent group-hover:bg-teal-400 transition-colors" />
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-card to-secondary border border-border text-teal-400 shadow-md group-hover:scale-105 transition-transform font-bold">
                    <PawPrint className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <h3 className="font-bold text-base text-foreground group-hover:text-teal-300 transition-colors">
                        {appointment.pet?.name ?? 'Paciente Animal'}
                      </h3>
                      {appointment.pet?.breed && (
                        <span className="text-xs px-2 py-0.5 rounded bg-secondary text-muted-foreground border border-border font-bold">
                          {appointment.pet.breed}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground font-normal">
                      {appointment.reason ?? 'Exame clínico de rotina geral'}
                    </p>
                    {appointment.pet?.client && (
                      <p className="text-xs text-slate-400 flex items-center gap-1 pt-1 font-semibold">
                        <User className="h-3.5 w-3.5 text-teal-400 shrink-0" />
                        Tutor: <span className="text-slate-300 font-bold">{appointment.pet.client.name}</span>
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <div className="flex items-center gap-2 rounded-xl bg-card border border-border px-3.5 py-2 shadow-inner text-xs font-bold text-slate-300">
                    <Clock className="h-3.5 w-3.5 text-teal-400" />
                    {new Date(appointment.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  </div>
                  <span className={`rounded-full px-3.5 py-1 text-xs font-extrabold border uppercase tracking-wider shadow-sm ${getStatusColor(appointment.status)}`}>
                    {getStatusText(appointment.status)}
                  </span>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-teal-300 hover:bg-teal-500/10">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </article>
            ))}
          </div>

          {!isLoading && upcomingAppointments.length === 0 && (
            <div className="p-12">
              <EmptyState
                icon={CalendarDays}
                title="Nenhuma consulta agendada"
                description="Quando os tutores marcarem atendimentos ou procedimentos, eles aparecerão aqui na agenda."
                actionLabel="Atualizar Agenda"
                onAction={loadAppointments}
              />
            </div>
          )}
          
          {isLoading && (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full rounded-xl bg-card" />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
