import { useEffect, useState, useMemo, type FormEvent } from 'react'
import { PawPrint, Plus, RefreshCw, Search, User, Cake, Tag, AlertCircle, Heart } from 'lucide-react'
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
  const [searchQuery, setSearchQuery] = useState('')

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
    return pet.client?.name ?? clients.find((client) => client.id === pet.clientId)?.name ?? 'No Owner Linked'
  }

  const filteredPets = useMemo(() => {
    if (!searchQuery) return pets
    const query = searchQuery.toLowerCase()
    return pets.filter(p => 
      p.name.toLowerCase().includes(query) || 
      p.species.toLowerCase().includes(query) ||
      p.breed?.toLowerCase().includes(query) ||
      ownerName(p).toLowerCase().includes(query)
    )
  }, [pets, clients, searchQuery])

  return (
    <div className="space-y-8 animate-in fade-in-0 duration-500">
      <PageHeader
        title="Patients & Pets"
        badge="Medical Records"
        description="Search, view, and register new animals into the clinic database. Connect each pet to its client owner."
        action={
          <div className="flex items-center gap-3">
            <Button onClick={() => setIsModalOpen(true)} className="bg-gradient-to-r from-teal-400 to-teal-500 text-slate-950 font-bold hover:from-teal-300 hover:to-teal-400 shadow-lg shadow-teal-500/20 gap-2">
              <Plus className="h-4 w-4" />
              Register Patient
            </Button>
          </div>
        }
      />

      {error && (
        <div className="flex items-center gap-3 rounded-xl bg-destructive/15 border border-destructive/30 px-5 py-4 text-sm font-medium text-destructive-foreground shadow-sm">
          <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card/60 border border-border p-4 rounded-xl shadow-sm backdrop-blur-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <BaseInput
            type="search"
            placeholder="Search by pet name, species, breed, or owner..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-background border-border"
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium self-end sm:self-auto shrink-0">
          <span>Showing</span>
          <span className="px-2 py-0.5 rounded bg-secondary text-foreground font-bold">{filteredPets.length}</span>
          <span>of {pets.length} pets</span>
          <Button onClick={loadData} variant="ghost" size="icon" title="Refresh" className="ml-1 h-8 w-8">
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredPets.map((pet) => (
          <Card key={pet.id} className="group relative overflow-hidden border-border bg-card/60 backdrop-blur-sm transition-all duration-300 hover:border-teal-400/40 hover:shadow-xl hover:shadow-teal-500/5 flex flex-col justify-between">
            <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-teal-400/5 blur-2xl group-hover:bg-teal-400/10 transition-colors pointer-events-none" />
            <CardContent className="p-6 relative z-10 flex-1 flex flex-col justify-between space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-card to-secondary border border-border text-teal-400 shadow-md group-hover:scale-105 transition-transform font-bold">
                    <PawPrint className="h-6 w-6" />
                  </div>
                  <div className="space-y-1 overflow-hidden">
                    <h2 className="text-xl font-extrabold tracking-tight text-foreground truncate group-hover:text-teal-300 transition-colors flex items-center gap-2">
                      {pet.name}
                      <Heart className="h-4 w-4 text-rose-500/50 fill-rose-500/20 group-hover:fill-rose-500 group-hover:text-rose-500 transition-colors" />
                    </h2>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 truncate">
                      <User className="h-3.5 w-3.5 text-teal-400 shrink-0" />
                      <span className="truncate">{ownerName(pet)}</span>
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-teal-400/10 border border-teal-400/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-teal-400 shrink-0 shadow-sm">
                  {pet.species}
                </span>
              </div>

              <dl className="grid grid-cols-2 gap-3 pt-2">
                <div className="rounded-xl bg-muted/40 border border-border p-3.5 space-y-1">
                  <dt className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Tag className="h-3 w-3 text-teal-400" />
                    <span>Breed</span>
                  </dt>
                  <dd className="text-sm text-foreground font-bold truncate">{pet.breed || 'Not specified'}</dd>
                </div>
                <div className="rounded-xl bg-muted/40 border border-border p-3.5 space-y-1">
                  <dt className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Cake className="h-3 w-3 text-teal-400" />
                    <span>Age</span>
                  </dt>
                  <dd className="text-sm text-foreground font-bold truncate">
                    {pet.age !== null && pet.age !== undefined ? `${pet.age} ${pet.age === 1 ? 'year' : 'years'}` : 'Unknown'}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        ))}

        {isLoading && Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-56 w-full rounded-2xl bg-card" />
        ))}
      </section>

      {!isLoading && filteredPets.length === 0 && (
        <div className="py-12">
          <EmptyState
            icon={PawPrint}
            title={searchQuery ? "No patients matching query" : "No patients registered"}
            description={searchQuery ? "Try refining your search terms or clearing the filter." : "Add your first animal patient to start recording medical consultations and checkups."}
            actionLabel={searchQuery ? "Clear Search" : "Register Patient"}
            onAction={() => searchQuery ? setSearchQuery('') : setIsModalOpen(true)}
          />
        </div>
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
    <Modal title="Register New Patient Pet" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-5 pt-2">
        <Input label="Pet Name" placeholder="e.g. Bella" value={name} onChange={setName} required />
        <Input label="Species" placeholder="e.g. Dog, Cat, Rabbit" value={species} onChange={setSpecies} required />
        <Input label="Breed (Optional)" placeholder="e.g. Golden Retriever" value={breed} onChange={setBreed} />
        <Input label="Age in Years (Optional)" placeholder="e.g. 3" value={age} onChange={setAge} type="number" min="0" />
        
        <label className="block space-y-2">
          <span className="block text-sm font-semibold text-foreground">Client / Owner</span>
          <select
            className="flex h-10 w-full rounded-lg border border-input bg-card px-3 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-foreground font-medium"
            value={clientId}
            onChange={(event) => setClientId(event.target.value)}
            required
          >
            {clients.map((client) => (
              <option key={client.id} value={client.id} className="bg-background text-foreground font-medium">
                {client.name} ({client.email || 'No email'})
              </option>
            ))}
          </select>
        </label>

        {clients.length === 0 && (
          <div className="flex items-center gap-3 rounded-lg bg-amber-500/15 border border-amber-500/30 px-4 py-3 text-sm text-amber-400 font-medium">
            <AlertCircle className="h-5 w-5 shrink-0 text-amber-400" />
            <span>Please register at least one client before adding pet records.</span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 rounded-lg bg-destructive/15 border border-destructive/30 px-4 py-3 text-sm text-destructive font-medium">
            <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />
            <span>{error}</span>
          </div>
        )}

        <div className="pt-4 border-t border-border/60 flex items-center justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-gradient-to-r from-teal-400 to-teal-500 text-slate-950 font-bold hover:from-teal-300 hover:to-teal-400 shadow-md shadow-teal-500/20"
            disabled={isSubmitting || clients.length === 0}
          >
            {isSubmitting ? 'Registering...' : 'Confirm Registration'}
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
  placeholder,
  type = 'text',
  required = false,
  min,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
  required?: boolean
  min?: string
}) {
  return (
    <label className="block space-y-2">
      <span className="block text-sm font-semibold text-foreground">
        {label} {required && <span className="text-teal-400">*</span>}
      </span>
      <BaseInput
        type={type}
        min={min}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        className="bg-background border-border focus-visible:ring-teal-400 font-medium h-10"
      />
    </label>
  )
}
