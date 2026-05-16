import { Activity, Users, DollarSign } from 'lucide-react'
import { useEffect, useState } from 'react'
import { api } from '../../lib/api'

type SuperAdminMetrics = {
  totalClinics: number
  totalAppointments: number
  mrr: number
  activeClinicsToday: number
}

const fallbackMetrics: SuperAdminMetrics = {
  totalClinics: 0,
  totalAppointments: 0,
  mrr: 0,
  activeClinicsToday: 0
}

export function SuperAdminDashboard() {
  const [metrics, setMetrics] = useState<SuperAdminMetrics>(fallbackMetrics)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadMetrics() {
      try {
        const response = await api.get<SuperAdminMetrics>('/dashboard/super-admin/metrics')

        if (isMounted) {
          setMetrics(response.data)
          setError('')
        }
      } catch {
        if (isMounted) {
          setError('Unable to load global metrics. Please try refreshing or check server logs.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadMetrics()

    return () => {
      isMounted = false
    }
  }, [])

  const cards = [
    { label: 'Total Clinics', value: metrics.totalClinics, icon: Users },
    { label: 'Active Today', value: metrics.activeClinicsToday, icon: Activity },
    { label: 'Estimated MRR', value: `$${metrics.mrr.toLocaleString()}`, icon: DollarSign },
  ]

  return (
    <div>
      <section className="mb-8 rounded-lg border border-white/10 bg-white/[0.04] p-6">
        <p className="text-sm font-medium text-teal-300">System Overview</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
          Platform Statistics
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
          High-level metrics across all tenant clinics.
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
              {isLoading ? '...' : card.value}
            </p>
          </article>
        ))}
      </section>
    </div>
  )
}
