import { useEffect, useState, useMemo, type FormEvent } from 'react'
import { PawPrint, Plus, RefreshCw, Search, User, Cake, Tag, AlertCircle, Heart, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Modal } from '../components/Modal'
import { PageHeader } from '../components/PageHeader'
import { api, type Client, type Pet } from '../lib/api'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import { Skeleton } from '../components/ui/skeleton'
import { EmptyState } from '../components/EmptyState'
import { Input as BaseInput } from '../components/ui/input'

export function getSpeciesLabel(species?: string): string {
  switch (species?.toUpperCase()) {
    case 'DOG':
      return 'Cão'
    case 'CAT':
      return 'Gato'
    case 'OTHER':
      return 'Outro'
    default:
      return species || 'Não especificada'
  }
}

export function normalizeSpecies(species?: string): 'DOG' | 'CAT' | 'OTHER' {
  if (!species) return 'OTHER';
  const clean = species.trim().toLowerCase();
  
  if (
    ['cão', 'cao', 'canina', 'canino', 'dog', 'cachorro', 'cadela', 'cadelas', 'cachorros'].some(
      (term) => clean.includes(term),
    )
  ) {
    return 'DOG';
  }
  
  if (
    ['gato', 'gata', 'felino', 'felina', 'cat', 'gatos', 'gatas'].some((term) =>
      clean.includes(term),
    )
  ) {
    return 'CAT';
  }
  
  return 'OTHER';
}

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
      setError('Não foi possível carregar as fichas dos pacientes.')
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
          setError('Não foi possível carregar as fichas dos pacientes.')
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
    return pet.client?.name ?? clients.find((client) => client.id === pet.clientId)?.name ?? 'Sem Tutor Vinculado'
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
        title="Pacientes Cadastrados"
        badge="Prontuários Médicos"
        description="Pesquise, visualize e cadastre novos pacientes no banco de dados da clínica. Conecte cada animal à ficha de seu tutor responsável."
        action={
          <div className="flex items-center gap-3">
            <Button onClick={() => setIsModalOpen(true)} className="bg-primary text-primary-foreground font-semibold hover:opacity-90 shadow-sm gap-2">
              <Plus className="h-4 w-4" />
              Cadastrar Paciente
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
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card border border-border p-4 rounded-xl shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <BaseInput
            type="search"
            placeholder="Pesquisar por paciente, espécie, raça ou tutor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-background border-border font-medium"
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium self-end sm:self-auto shrink-0">
          <span>Exibindo</span>
          <span className="px-2 py-0.5 rounded bg-secondary text-foreground font-bold">{filteredPets.length}</span>
          <span>de {pets.length} pacientes</span>
          <Button onClick={loadData} variant="ghost" size="icon" title="Atualizar dados" className="ml-1 h-8 w-8 text-muted-foreground hover:text-foreground">
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredPets.map((pet) => (
          <Card key={pet.id} className="group relative overflow-hidden border-border bg-card transition-all duration-300 hover:border-primary/25 flex flex-col justify-between font-medium">
            <CardContent className="p-6 relative z-10 flex-1 flex flex-col justify-between space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/15 text-primary shadow-sm font-bold">
                    <PawPrint className="h-6 w-6" />
                  </div>
                  <div className="space-y-1 overflow-hidden">
                    <h2 className="text-xl font-semibold tracking-tight text-foreground truncate group-hover:text-primary transition-colors flex items-center gap-2">
                      {pet.name}
                      <Heart className="h-4 w-4 text-rose-300/60 fill-rose-300/20 group-hover:fill-rose-300/50 group-hover:text-rose-300 transition-colors" />
                    </h2>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 truncate font-semibold">
                      <User className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="truncate">{ownerName(pet)}</span>
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-primary/10 border border-primary/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary shrink-0 shadow-sm">
                  {getSpeciesLabel(pet.species)}
                </span>
              </div>

              <dl className="grid grid-cols-2 gap-3 pt-2">
                <div className="rounded-xl bg-muted/40 border border-border p-3.5 space-y-1">
                  <dt className="text-xs text-muted-foreground flex items-center gap-1.5 font-semibold">
                    <Tag className="h-3 w-3 text-primary" />
                    <span>Raça / Pelagem</span>
                  </dt>
                  <dd className="text-sm text-foreground font-bold truncate">{pet.breed || 'Não especificada'}</dd>
                </div>
                <div className="rounded-xl bg-muted/40 border border-border p-3.5 space-y-1">
                  <dt className="text-xs text-muted-foreground flex items-center gap-1.5 font-semibold">
                    <Cake className="h-3 w-3 text-primary" />
                    <span>Idade Estimada</span>
                  </dt>
                  <dd className="text-sm text-foreground font-bold truncate">
                    {pet.age !== null && pet.age !== undefined ? `${pet.age} ${pet.age === 1 ? 'ano' : 'anos'}` : 'Desconhecida'}
                  </dd>
                </div>
              </dl>

              <div className="border-t border-border/60 pt-4 flex items-center justify-between text-xs font-semibold text-primary">
                <Link to={`/pets/${pet.id}`} className="flex items-center gap-1.5 hover:underline w-full justify-end group/btn">
                  <span>Acessar Prontuário</span>
                  <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5" />
                </Link>
              </div>
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
            title={searchQuery ? "Nenhum paciente encontrado na busca" : "Nenhum paciente cadastrado"}
            description={searchQuery ? "Tente ajustar os termos da pesquisa ou limpe o filtro." : "Cadastre o primeiro animal para iniciar o registro de prontuários clínicos e agendamentos."}
            actionLabel={searchQuery ? "Limpar Filtro" : "Cadastrar Paciente"}
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
  const [species, setSpecies] = useState('DOG')
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
      setError('Não foi possível cadastrar o paciente. Verifique os dados informados.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal title="Cadastrar Novo Paciente" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-5 pt-2">
        <Input label="Nome do Paciente" placeholder="Ex: Thor, Mel" value={name} onChange={setName} required />
        <label className="block space-y-2">
          <span className="block text-sm font-semibold text-foreground">
            Espécie <span className="text-primary">*</span>
          </span>
          <select
            className="flex h-10 w-full rounded-lg border border-input bg-card px-3 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-foreground font-medium animate-in fade-in-0 duration-200"
            value={species}
            onChange={(event) => setSpecies(event.target.value)}
            required
          >
            <option value="DOG" className="bg-background text-foreground font-medium">Cão</option>
            <option value="CAT" className="bg-background text-foreground font-medium">Gato</option>
            <option value="OTHER" className="bg-background text-foreground font-medium">Outro</option>
          </select>
        </label>
        <Input label="Raça ou Pelagem (Opcional)" placeholder="Ex: Poodle, SRD" value={breed} onChange={setBreed} />
        <Input label="Idade em Anos (Opcional)" placeholder="Ex: 4" value={age} onChange={setAge} type="number" min="0" />
        
        <label className="block space-y-2">
          <span className="block text-sm font-semibold text-foreground">Tutor Responsável</span>
          <select
            className="flex h-10 w-full rounded-lg border border-input bg-card px-3 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-foreground font-medium"
            value={clientId}
            onChange={(event) => setClientId(event.target.value)}
            required
          >
            {clients.map((client) => (
              <option key={client.id} value={client.id} className="bg-background text-foreground font-medium">
                {client.name} ({client.email || 'Sem e-mail'})
              </option>
            ))}
          </select>
        </label>

        {clients.length === 0 && (
          <div className="flex items-center gap-3 rounded-lg bg-amber-500/15 border border-amber-500/30 px-4 py-3 text-sm text-amber-400 font-medium">
            <AlertCircle className="h-5 w-5 shrink-0 text-amber-400" />
            <span>Cadastre ao menos um tutor responsável antes de incluir prontuários de pacientes.</span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 rounded-lg bg-destructive/15 border border-destructive/30 px-4 py-3 text-sm text-destructive font-medium">
            <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />
            <span>{error}</span>
          </div>
        )}

        <div className="pt-4 border-t border-border/60 flex items-center justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose} className="font-semibold">
            Cancelar
          </Button>
          <Button
            type="submit"
            className="bg-primary text-primary-foreground font-semibold hover:opacity-90 shadow-sm"
            disabled={isSubmitting || clients.length === 0}
          >
            {isSubmitting ? 'Salvando ficha...' : 'Confirmar Cadastro'}
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
        {label} {required && <span className="text-primary">*</span>}
      </span>
      <BaseInput
        type={type}
        min={min}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        className="bg-background border-border focus-visible:ring-primary font-medium h-10"
      />
    </label>
  )
}
