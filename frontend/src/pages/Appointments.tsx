import { CalendarClock, RefreshCw } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { api, type Appointment } from '../lib/api'

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
    <div>
      <PageHeader
        title="Appointments"
        description="Review upcoming visits with patient names, status, and visit reasons."
        action={
          <button
            type="button"
            onClick={loadAppointments}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-white/10 px-4 text-sm font-medium text-slate-200 transition hover:bg-white/10"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        }
      />

      {error && <p className="mb-5 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>}

      <section className="overflow-hidden rounded-lg border border-white/10 bg-slate-900">
        <div className="border-b border-white/10 px-5 py-4">
          <h2 className="font-semibold">Upcoming schedule</h2>
        </div>
        <div className="divide-y divide-white/10">
          {upcomingAppointments.map((appointment) => (
            <article
              key={appointment.id}
              className="flex flex-col gap-4 px-5 py-5 md:flex-row md:items-center md:justify-between"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-teal-400/15 text-teal-300">
                  <CalendarClock className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{appointment.pet?.name ?? 'Pet record'}</h3>
                  <p className="mt-1 text-sm text-slate-400">
                    {appointment.reason ?? 'Routine appointment'}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="rounded-lg bg-white/[0.06] px-3 py-2 text-slate-200">
                  {new Date(appointment.date).toLocaleString()}
                </span>
                <span className="rounded-lg bg-teal-400/15 px-3 py-2 font-medium text-teal-200">
                  {appointment.status}
                </span>
              </div>
            </article>
          ))}
        </div>

        {!isLoading && upcomingAppointments.length === 0 && (
          <p className="px-5 py-8 text-center text-sm text-slate-400">No appointments scheduled.</p>
        )}
        {isLoading && <p className="px-5 py-8 text-center text-sm text-slate-400">Loading appointments...</p>}
      </section>
    </div>
  )
}
