import { CalendarDays, PawPrint, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { api, type DashboardStats } from '../lib/api'

const fallbackStats: DashboardStats = {
  totalClients: 0,
  totalPets: 0,
  totalAppointments: 0,
}

export function Dashboard() {
  const { clinic } = useAuth()
  const [stats, setStats] = useState<DashboardStats>(fallbackStats)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadStats() {
      try {
        const response = await api.get<DashboardStats>('/dashboard/stats')

        if (isMounted) {
          setStats(response.data)
          setError('')
        }
      } catch {
        if (isMounted) {
          setError('Dashboard statistics are unavailable.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadStats()

    return () => {
      isMounted = false
    }
  }, [])

  const cards = [
    { label: 'Total clients', value: stats.totalClients, icon: Users },
    { label: 'Total pets', value: stats.totalPets, icon: PawPrint },
    { label: 'Total appointments', value: stats.totalAppointments, icon: CalendarDays },
  ]

  return (
    <div>
      <section className="mb-8 rounded-lg border border-white/10 bg-white/[0.04] p-6">
        <p className="text-sm font-medium text-teal-300">Welcome back</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
          {clinic?.name ?? 'Your clinic'} command center
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
          Monitor active records, daily workload, and clinic operations from one workspace.
        </p>
      </section>

      {error && <p className="mb-5 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>}

      <section className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <article key={card.label} className="rounded-lg border border-white/10 bg-slate-900 p-5">
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-teal-400/15 text-teal-300">
              <card.icon className="h-6 w-6" />
            </div>
            <p className="text-sm text-slate-400">{card.label}</p>
            <p className="mt-2 text-4xl font-semibold text-white">
              {isLoading ? '...' : card.value.toLocaleString()}
            </p>
          </article>
        ))}
      </section>
    </div>
  )
}
