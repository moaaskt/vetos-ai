import { useEffect, useState, type FormEvent } from 'react'
import { PawPrint, Plus, RefreshCw } from 'lucide-react'
import { Modal } from '../components/Modal'
import { PageHeader } from '../components/PageHeader'
import { api, type Client, type Pet } from '../lib/api'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import { Skeleton } from '../components/ui/skeleton'
import { EmptyState } from '../components/EmptyState'
import { Input as BaseInput } from '../components/ui/input'

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
    <div className="animate-in fade-in-0 duration-500">
      <PageHeader
        title="Pets"
        description="Track patient details and connect each pet to its owner."
        action={
          <Button onClick={() => setIsModalOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add pet
          </Button>
        }
      />

      {error && <p className="mb-5 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>}

      <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {pets.map((pet) => (
          <Card key={pet.id}>
            <CardContent className="p-5">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">{pet.name}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{ownerName(pet)}</p>
                </div>
                <span className="rounded-lg bg-teal-400/15 px-3 py-1 text-xs font-medium text-teal-400">
                  {pet.species}
                </span>
              </div>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-muted/50 p-3">
                  <dt className="text-muted-foreground">Breed</dt>
                  <dd className="mt-1 text-foreground font-medium">{pet.breed ?? '-'}</dd>
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <dt className="text-muted-foreground">Age</dt>
                  <dd className="mt-1 text-foreground font-medium">{pet.age ?? '-'}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        ))}
        {isLoading && Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-40 w-full" />
        ))}
      </section>

      {!isLoading && pets.length > 0 && (
        <div className="mt-6 flex justify-center">
          <Button onClick={loadData} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      )}

      {!isLoading && pets.length === 0 && (
        <EmptyState
          icon={PawPrint}
          title="No pets registered"
          description="Add your first patient to start managing their records."
          actionLabel="Add pet"
          onAction={() => setIsModalOpen(true)}
        />
      )}

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
          <span className="mb-2 block text-sm font-medium text-foreground">Owner</span>
          <select
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={clientId}
            onChange={(event) => setClientId(event.target.value)}
            required
          >
            {clients.map((client) => (
              <option key={client.id} value={client.id} className="bg-background text-foreground">
                {client.name}
              </option>
            ))}
          </select>
        </label>
        {clients.length === 0 && (
          <p className="rounded-lg bg-amber-500/10 px-3 py-2 text-sm text-amber-500">
            Add a client before registering pets.
          </p>
        )}
        {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
        <div className="pt-2">
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || clients.length === 0}
          >
            {isSubmitting ? 'Saving...' : 'Save pet'}
          </Button>
        </div>
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
      <span className="mb-2 block text-sm font-medium text-foreground">{label}</span>
      <BaseInput
        type={type}
        min={min}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
      />
    </label>
  )
}
