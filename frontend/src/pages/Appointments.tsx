import { CalendarClock, CalendarDays, RefreshCw } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { api, type Appointment } from '../lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
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
      setError('Could not load appointments.')
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
          setError('Could not load appointments.')
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

  return (
    <div className="animate-in fade-in-0 duration-500">
      <PageHeader
        title="Appointments"
        description="Review upcoming visits with patient names, status, and visit reasons."
        action={
          <Button onClick={loadAppointments} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        }
      />

      {error && <p className="mb-5 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>}

      <Card>
        <CardHeader className="border-b border-border bg-card/40">
          <CardTitle className="text-base font-semibold">Upcoming schedule</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {upcomingAppointments.map((appointment) => (
              <article
                key={appointment.id}
                className="flex flex-col gap-4 px-6 py-5 hover:bg-muted/50 transition-colors md:flex-row md:items-center md:justify-between"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-teal-400/15 text-teal-400">
                    <CalendarClock className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{appointment.pet?.name ?? 'Pet record'}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {appointment.reason ?? 'Routine appointment'}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <span className="rounded-lg bg-secondary px-3 py-2 text-secondary-foreground">
                    {new Date(appointment.date).toLocaleString()}
                  </span>
                  <span className="rounded-lg bg-teal-400/15 px-3 py-2 font-medium text-teal-400">
                    {appointment.status}
                  </span>
                </div>
              </article>
            ))}
          </div>

          {!isLoading && upcomingAppointments.length === 0 && (
            <div className="p-6">
              <EmptyState
                icon={CalendarDays}
                title="No appointments scheduled"
                description="When clients book a visit, it will appear here in your schedule."
                actionLabel="Refresh schedule"
                onAction={loadAppointments}
              />
            </div>
          )}
          
          {isLoading && (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
