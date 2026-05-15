import { useEffect, useState, type FormEvent } from 'react'
import { Plus, RefreshCw } from 'lucide-react'
import { Modal } from '../components/Modal'
import { PageHeader } from '../components/PageHeader'
import { api, type Client } from '../lib/api'

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
    <div>
      <PageHeader
        title="Clients"
        description="Manage clinic client records and contact details."
        action={
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-teal-400 px-4 text-sm font-semibold text-slate-950 transition hover:bg-teal-300"
          >
            <Plus className="h-4 w-4" />
            Add client
          </button>
        }
      />

      {error && <p className="mb-5 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>}

      <section className="overflow-hidden rounded-lg border border-white/10 bg-slate-900">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 className="font-semibold">Client directory</h2>
          <button
            type="button"
            onClick={loadClients}
            aria-label="Refresh clients"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-white/[0.03] text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Phone</th>
                <th className="px-5 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {clients.map((client) => (
                <tr key={client.id}>
                  <td className="px-5 py-4 font-medium text-white">{client.name}</td>
                  <td className="px-5 py-4 text-slate-300">{client.email ?? '-'}</td>
                  <td className="px-5 py-4 text-slate-300">{client.phone ?? '-'}</td>
                  <td className="px-5 py-4 text-slate-400">
                    {client.createdAt ? new Date(client.createdAt).toLocaleDateString() : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!isLoading && clients.length === 0 && (
          <p className="px-5 py-8 text-center text-sm text-slate-400">No clients registered yet.</p>
        )}
        {isLoading && <p className="px-5 py-8 text-center text-sm text-slate-400">Loading clients...</p>}
      </section>

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
        {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p>}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-teal-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-teal-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Saving...' : 'Save client'}
        </button>
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
      <span className="mb-2 block text-sm font-medium text-slate-300">{label}</span>
      <input
        className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-3 text-sm outline-none transition focus:border-teal-300"
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
      />
    </label>
  )
}
