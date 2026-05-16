import { Activity, Users, DollarSign } from 'lucide-react'
import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { Card, CardContent } from '../../components/ui/card'
import { Skeleton } from '../../components/ui/skeleton'

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
    <div className="space-y-8 animate-in fade-in-0 duration-500">
      <section className="rounded-lg border border-border bg-card/40 p-6 shadow-sm">
        <p className="text-sm font-medium text-teal-400">System Overview</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
          Platform Statistics
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
          High-level metrics across all tenant clinics.
        </p>
      </section>

      {error && <p className="mb-5 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>}

      <section className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.label} className="border-border">
            <CardContent className="p-6">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-teal-400/15 text-teal-400">
                <card.icon className="h-6 w-6" />
              </div>
              <p className="text-sm text-muted-foreground">{card.label}</p>
              {isLoading ? (
                <Skeleton className="mt-2 h-10 w-24" />
              ) : (
                <p className="mt-2 text-4xl font-semibold text-foreground">
                  {card.value}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  )
}
