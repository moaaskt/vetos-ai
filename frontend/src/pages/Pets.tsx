import { useEffect, useState, type FormEvent } from 'react'
import { Plus, RefreshCw } from 'lucide-react'
import { Modal } from '../components/Modal'
import { PageHeader } from '../components/PageHeader'
import { api, type Client, type Pet } from '../lib/api'

export function Pets() {
  const [pets, setPets] = useState<Pet[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  async function loadData() {
    setIsLoading(true)

    try {
      const [petsResponse, clientsResponse] = await Promise.all([
        api.get<Pet[]>('/pets'),
        api.get<Client[]>('/clients'),
      ])
      setPets(petsResponse.data)
      setClients(clientsResponse.data)
      setError('')
    } catch {
      setError('Could not load pets.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true

    Promise.all([api.get<Pet[]>('/pets'), api.get<Client[]>('/clients')])
      .then(([petsResponse, clientsResponse]) => {
        if (isMounted) {
          setPets(petsResponse.data)
          setClients(clientsResponse.data)
          setError('')
        }
      })
      .catch(() => {
        if (isMounted) {
          setError('Could not load pets.')
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

  function ownerName(pet: Pet) {
    return pet.client?.name ?? clients.find((client) => client.id === pet.clientId)?.name ?? '-'
  }

  return (
    <div>
      <PageHeader
        title="Pets"
        description="Track patient details and connect each pet to its owner."
        action={
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-teal-400 px-4 text-sm font-semibold text-slate-950 transition hover:bg-teal-300"
          >
            <Plus className="h-4 w-4" />
            Add pet
          </button>
        }
      />

      {error && <p className="mb-5 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>}

      <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {pets.map((pet) => (
          <article key={pet.id} className="rounded-lg border border-white/10 bg-slate-900 p-5">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-white">{pet.name}</h2>
                <p className="mt-1 text-sm text-slate-400">{ownerName(pet)}</p>
              </div>
              <span className="rounded-lg bg-teal-400/15 px-3 py-1 text-xs font-medium text-teal-200">
                {pet.species}
              </span>
            </div>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-white/[0.03] p-3">
                <dt className="text-slate-500">Breed</dt>
                <dd className="mt-1 text-slate-200">{pet.breed ?? '-'}</dd>
              </div>
              <div className="rounded-lg bg-white/[0.03] p-3">
                <dt className="text-slate-500">Age</dt>
                <dd className="mt-1 text-slate-200">{pet.age ?? '-'}</dd>
              </div>
            </dl>
          </article>
        ))}
      </section>

      <div className="mt-5 flex justify-center">
        <button
          type="button"
          onClick={loadData}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-white/10 px-4 text-sm text-slate-200 transition hover:bg-white/10"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {!isLoading && pets.length === 0 && (
        <p className="rounded-lg border border-white/10 bg-slate-900 px-5 py-8 text-center text-sm text-slate-400">
          No pets registered yet.
        </p>
      )}
      {isLoading && <p className="text-center text-sm text-slate-400">Loading pets...</p>}

      {isModalOpen && (
        <PetModal
          clients={clients}
          onClose={() => setIsModalOpen(false)}
          onCreated={() => {
            setIsModalOpen(false)
            loadData()
          }}
        />
      )}
    </div>
  )
}

function PetModal({
  clients,
  onClose,
  onCreated,
}: {
  clients: Client[]
  onClose: () => void
  onCreated: () => void
}) {
  const [name, setName] = useState('')
  const [species, setSpecies] = useState('')
  const [breed, setBreed] = useState('')
  const [age, setAge] = useState('')
  const [clientId, setClientId] = useState(clients[0]?.id ?? '')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await api.post('/pets', {
        name,
        species,
        breed: breed || undefined,
        age: age ? Number(age) : undefined,
        clientId,
      })
      onCreated()
    } catch {
      setError('Could not create pet.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal title="Add pet" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Name" value={name} onChange={setName} required />
        <Input label="Species" value={species} onChange={setSpecies} required />
        <Input label="Breed" value={breed} onChange={setBreed} />
        <Input label="Age" value={age} onChange={setAge} type="number" min="0" />
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-300">Owner</span>
          <select
            className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-3 text-sm outline-none transition focus:border-teal-300"
            value={clientId}
            onChange={(event) => setClientId(event.target.value)}
            required
          >
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        </label>
        {clients.length === 0 && (
          <p className="rounded-lg bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
            Add a client before registering pets.
          </p>
        )}
        {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p>}
        <button
          type="submit"
          disabled={isSubmitting || clients.length === 0}
          className="w-full rounded-lg bg-teal-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-teal-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Saving...' : 'Save pet'}
        </button>
      </form>
    </Modal>
  )
}

function Input({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
  min,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  required?: boolean
  min?: string
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-300">{label}</span>
      <input
        className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-3 text-sm outline-none transition focus:border-teal-300"
        type={type}
        min={min}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
      />
    </label>
  )
}
