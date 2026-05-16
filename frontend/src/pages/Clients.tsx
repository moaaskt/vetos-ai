import { useEffect, useState, type FormEvent } from 'react'
import { Plus, RefreshCw, Users } from 'lucide-react'
import { Modal } from '../components/Modal'
import { PageHeader } from '../components/PageHeader'
import { api, type Client } from '../lib/api'
import { Card, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Skeleton } from '../components/ui/skeleton'
import { EmptyState } from '../components/EmptyState'
import { Input } from '../components/ui/input'

export function Clients() {
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  async function loadClients() {
    setIsLoading(true)

    try {
      const response = await api.get<Client[]>('/clients')
      setClients(response.data)
      setError('')
    } catch {
      setError('Could not load clients.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true

    api
      .get<Client[]>('/clients')
      .then((response) => {
        if (isMounted) {
          setClients(response.data)
          setError('')
        }
      })
      .catch(() => {
        if (isMounted) {
          setError('Could not load clients.')
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

  return (
    <div className="animate-in fade-in-0 duration-500">
      <PageHeader
        title="Clients"
        description="Manage clinic client records and contact details."
        action={
          <Button onClick={() => setIsModalOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add client
          </Button>
        }
      />

      {error && <p className="mb-5 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>}

      <Card>
        <div className="flex items-center justify-between border-b border-border bg-card/40 px-6 py-4">
          <h2 className="text-base font-semibold text-foreground">Client directory</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={loadClients}
            aria-label="Refresh clients"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-6 py-3 font-medium">Email</th>
                  <th className="px-6 py-3 font-medium">Phone</th>
                  <th className="px-6 py-3 font-medium">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {clients.map((client) => (
                  <tr key={client.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">{client.name}</td>
                    <td className="px-6 py-4 text-muted-foreground">{client.email ?? '-'}</td>
                    <td className="px-6 py-4 text-muted-foreground">{client.phone ?? '-'}</td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {client.createdAt ? new Date(client.createdAt).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!isLoading && clients.length === 0 && (
            <div className="p-6">
              <EmptyState
                icon={Users}
                title="No clients found"
                description="Your client directory is currently empty. Add a client to get started."
                actionLabel="Add client"
                onAction={() => setIsModalOpen(true)}
              />
            </div>
          )}
          {isLoading && (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {isModalOpen && (
        <ClientModal
          onClose={() => setIsModalOpen(false)}
          onCreated={() => {
            setIsModalOpen(false)
            loadClients()
          }}
        />
      )}
    </div>
  )
}

function ClientModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await api.post('/clients', {
        name,
        email: email || undefined,
        phone: phone || undefined,
      })
      onCreated()
    } catch {
      setError('Could not create client.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal title="Add client" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Name" value={name} onChange={setName} required />
        <Field label="Email" value={email} onChange={setEmail} type="email" />
        <Field label="Phone" value={phone} onChange={setPhone} />
        {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
        <div className="pt-2">
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save client'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  required?: boolean
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-foreground">{label}</span>
      <Input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
      />
    </label>
  )
}
