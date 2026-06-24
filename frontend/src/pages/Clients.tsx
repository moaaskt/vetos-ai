import { useEffect, useState, useMemo, type FormEvent } from 'react'
import { RefreshCw, Users, Search, Phone, Mail, Calendar, UserPlus, AlertCircle, ChevronRight, CheckCircle2 } from 'lucide-react'
import { Modal } from '../components/Modal'
import { PageHeader } from '../components/PageHeader'
import { api, type Client } from '../lib/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Skeleton } from '../components/ui/skeleton'
import { EmptyState } from '../components/EmptyState'
import { Input as BaseInput } from '../components/ui/input'

export function Clients() {
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const [selectedClient, setSelectedClient] = useState<Client | null>(null)

  async function loadClients() {
    setIsLoading(true)

    try {
      const response = await api.get<Client[]>('/clients')
      setClients(response.data)
      setError('')
    } catch {
      setError('Não foi possível carregar o diretório de clientes.')
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
          setError('Não foi possível carregar o diretório de clientes.')
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

  const filteredClients = useMemo(() => {
    if (!searchQuery) return clients
    const query = searchQuery.toLowerCase()
    return clients.filter(c => 
      c.name.toLowerCase().includes(query) || 
      c.email?.toLowerCase().includes(query) ||
      c.phone?.toLowerCase().includes(query)
    )
  }, [clients, searchQuery])

  return (
    <div className="space-y-8 animate-in fade-in-0 duration-500">
      <PageHeader
        title="Diretório de Clientes"
        badge="Tutores Responsáveis"
        description="Gerencie os cadastros de clientes e tutores, contatos telefônicos, e-mails verificados e histórico de relacionamento."
        action={
          <Button onClick={() => { setSelectedClient(null); setIsModalOpen(true); }} className="bg-primary text-primary-foreground font-semibold hover:opacity-90 shadow-sm gap-2">
            <UserPlus className="h-4 w-4" />
            Cadastrar Cliente
          </Button>
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
            placeholder="Buscar por nome do cliente, e-mail ou telefone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-background border-border font-medium"
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium self-end sm:self-auto shrink-0">
          <span>Exibindo</span>
          <span className="px-2 py-0.5 rounded bg-secondary text-foreground font-bold">{filteredClients.length}</span>
          <span>de {clients.length} clientes</span>
          <Button onClick={loadClients} variant="ghost" size="icon" title="Atualizar lista" className="ml-1 h-8 w-8 text-muted-foreground hover:text-foreground">
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <Card className="border-border bg-card overflow-hidden">
        <CardHeader className="border-b border-border/60 bg-card py-5 px-6 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Banco de Dados de Tutores
            </CardTitle>
            <CardDescription className="text-xs">Cadastros sincronizados em todas as estações de atendimento</CardDescription>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/10 border border-primary/15 text-xs font-semibold text-primary uppercase tracking-wide">
            <CheckCircle2 className="h-3 w-3" />
            Cadastros Ativos
          </span>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-muted/35 text-[11px] font-bold uppercase tracking-wide text-muted-foreground border-b border-border/80">
                <tr>
                  <th className="px-6 py-3.5 font-bold">Cliente / Tutor</th>
                  <th className="px-6 py-3.5 font-bold">Endereço de E-mail</th>
                  <th className="px-6 py-3.5 font-bold">Telefone de Contato</th>
                  <th className="px-6 py-3.5 font-bold">Data de Cadastro</th>
                  <th className="px-6 py-3.5 text-right font-bold">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredClients.map((client) => (
                  <tr key={client.id} className="group hover:bg-muted/40 transition-colors font-medium">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center font-semibold text-primary text-xs shadow-sm">
                          {client.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {client.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {client.email ? (
                        <div className="flex items-center gap-2 text-muted-foreground font-medium group-hover:text-slate-300 transition-colors">
                          <Mail className="h-3.5 w-3.5 text-primary/65 shrink-0" />
                          <span>{client.email}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground/60 italic text-xs">Não cadastrado</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {client.phone ? (
                        <div className="flex items-center gap-2 text-muted-foreground font-medium group-hover:text-slate-300 transition-colors">
                          <Phone className="h-3.5 w-3.5 text-primary/65 shrink-0" />
                          <span>{client.phone}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground/60 italic text-xs">Não informado</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium">
                        <Calendar className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                        <span>
                          {client.createdAt ? new Date(client.createdAt).toLocaleDateString([], { dateStyle: 'medium' }) : 'Desconhecida'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button onClick={() => { setSelectedClient(client); setIsModalOpen(true); }} variant="ghost" size="sm" className="text-muted-foreground hover:text-primary hover:bg-primary/10 gap-1 rounded-lg text-xs font-medium">
                        <span>Detalhes</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!isLoading && filteredClients.length === 0 && (
            <div className="py-12">
              <EmptyState
                icon={Users}
                title={searchQuery ? "Nenhum cliente encontrado na busca" : "Nenhum cliente cadastrado"}
                description={searchQuery ? "Tente refinar os termos da pesquisa ou limpe o campo de filtro." : "Seu diretório de clientes está vazio. Cadastre o primeiro tutor para iniciar o vínculo de prontuários."}
                actionLabel={searchQuery ? "Limpar Busca" : "Cadastrar Cliente"}
                onAction={() => { if (searchQuery) { setSearchQuery('') } else { setSelectedClient(null); setIsModalOpen(true); } }}
              />
            </div>
          )}

          {isLoading && (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl bg-card" />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {isModalOpen && (
        <ClientModal
          clientToEdit={selectedClient}
          onClose={() => { setIsModalOpen(false); setSelectedClient(null); }}
          onCreated={() => {
            setIsModalOpen(false)
            setSelectedClient(null)
            loadClients()
          }}
        />
      )}
    </div>
  )
}

import axios from 'axios'

function formatCpf(val: string) {
  const nums = val.replace(/\D/g, '').slice(0, 11)
  if (nums.length <= 3) return nums
  if (nums.length <= 6) return `${nums.slice(0, 3)}.${nums.slice(3)}`
  if (nums.length <= 9) return `${nums.slice(0, 3)}.${nums.slice(3, 6)}.${nums.slice(6)}`
  return `${nums.slice(0, 3)}.${nums.slice(3, 6)}.${nums.slice(6, 9)}-${nums.slice(9)}`
}

function formatCep(val: string) {
  const nums = val.replace(/\D/g, '').slice(0, 8)
  if (nums.length <= 5) return nums
  return `${nums.slice(0, 5)}-${nums.slice(5)}`
}

function formatPhone(val: string) {
  const nums = val.replace(/\D/g, '').slice(0, 11)
  if (nums.length <= 2) return nums
  if (nums.length <= 6) return `(${nums.slice(0, 2)}) ${nums.slice(2)}`
  if (nums.length <= 10) return `(${nums.slice(0, 2)}) ${nums.slice(2, 6)}-${nums.slice(6)}`
  return `(${nums.slice(0, 2)}) ${nums.slice(2, 7)}-${nums.slice(7)}`
}

interface ClientModalProps {
  clientToEdit?: Client | null
  onClose: () => void
  onCreated: () => void
}

function ClientModal({ clientToEdit, onClose, onCreated }: ClientModalProps) {
  const [activeTab, setActiveTab] = useState<'basics' | 'contacts' | 'address' | 'emergency'>('basics')
  
  // Dados Básicos
  const [name, setName] = useState(clientToEdit?.name || '')
  const [cpf, setCpf] = useState(clientToEdit?.cpf ? formatCpf(clientToEdit.cpf) : '')
  const [rg, setRg] = useState(clientToEdit?.rg || '')
  const [birthDate, setBirthDate] = useState(clientToEdit?.birthDate ? new Date(clientToEdit.birthDate).toISOString().split('T')[0] : '')

  // Contatos
  const [email, setEmail] = useState(clientToEdit?.email || '')
  const [phone, setPhone] = useState(clientToEdit?.phone ? formatPhone(clientToEdit.phone) : '')
  const [whatsapp, setWhatsapp] = useState(clientToEdit?.whatsapp ? formatPhone(clientToEdit.whatsapp) : '')
  const [emailAlt, setEmailAlt] = useState(clientToEdit?.emailAlt || '')

  // Endereço
  const [postalCode, setPostalCode] = useState(clientToEdit?.postalCode ? formatCep(clientToEdit.postalCode) : '')
  const [street, setStreet] = useState(clientToEdit?.street || '')
  const [number, setNumber] = useState(clientToEdit?.number || '')
  const [complement, setComplement] = useState(clientToEdit?.complement || '')
  const [neighborhood, setNeighborhood] = useState(clientToEdit?.neighborhood || '')
  const [city, setCity] = useState(clientToEdit?.city || '')
  const [state, setState] = useState(clientToEdit?.state || '')

  // Emergência
  const [emergencyName, setEmergencyName] = useState(clientToEdit?.emergencyName || '')
  const [emergencyPhone, setEmergencyPhone] = useState(clientToEdit?.emergencyPhone ? formatPhone(clientToEdit.emergencyPhone) : '')

  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingCep, setIsLoadingCep] = useState(false)

  // Busca de CEP
  useEffect(() => {
    const cleanCep = postalCode.replace(/\D/g, '')
    if (cleanCep.length === 8) {
      setIsLoadingCep(true)
      axios.get(`https://viacep.com.br/ws/${cleanCep}/json/`)
        .then((res) => {
          if (res.data && !res.data.erro) {
            setStreet(res.data.logradouro || '')
            setNeighborhood(res.data.bairro || '')
            setCity(res.data.localidade || '')
            setState(res.data.uf || '')
          }
        })
        .catch(() => {
          // Tratar de forma silenciosa para não travar preenchimento manual
        })
        .finally(() => {
          setIsLoadingCep(false)
        })
    }
  }, [postalCode])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    const payload = {
      name,
      email: email || undefined,
      phone: phone ? phone.replace(/\D/g, '') : undefined,
      cpf: cpf ? cpf.replace(/\D/g, '') : null, // Garante que seja persistido como null e não string inválida
      rg: rg || undefined,
      birthDate: birthDate || undefined,
      whatsapp: whatsapp ? whatsapp.replace(/\D/g, '') : undefined,
      emailAlt: emailAlt || undefined,
      postalCode: postalCode ? postalCode.replace(/\D/g, '') : undefined,
      street: street || undefined,
      number: number || undefined,
      complement: complement || undefined,
      neighborhood: neighborhood || undefined,
      city: city || undefined,
      state: state || undefined,
      emergencyName: emergencyName || undefined,
      emergencyPhone: emergencyPhone ? emergencyPhone.replace(/\D/g, '') : undefined,
    }

    try {
      if (clientToEdit) {
        await api.patch(`/clients/${clientToEdit.id}`, payload)
      } else {
        await api.post('/clients', payload)
      }
      onCreated()
    } catch (err: any) {
      if (err.response?.status === 409) {
        setError('CPF já cadastrado para outro cliente nesta clínica.')
      } else if (err.response?.data?.message === 'CPF inválido.') {
        setError('O CPF informado é inválido.')
      } else {
        setError('Não foi possível salvar o cadastro. Verifique os dados e tente novamente.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal title={clientToEdit ? 'Editar Cliente / Tutor' : 'Cadastrar Cliente / Tutor'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-6 pt-2 max-h-[80vh] overflow-y-auto pr-1">
        {/* Navigation Tabs */}
        <div className="flex border-b border-border text-xs font-semibold gap-1 mb-4 overflow-x-auto whitespace-nowrap">
          <button
            type="button"
            onClick={() => setActiveTab('basics')}
            className={`pb-2 px-3 border-b-2 transition-all ${
              activeTab === 'basics' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'
            }`}
          >
            Dados Básicos
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('contacts')}
            className={`pb-2 px-3 border-b-2 transition-all ${
              activeTab === 'contacts' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'
            }`}
          >
            Contatos
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('address')}
            className={`pb-2 px-3 border-b-2 transition-all ${
              activeTab === 'address' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'
            }`}
          >
            Endereço
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('emergency')}
            className={`pb-2 px-3 border-b-2 transition-all ${
              activeTab === 'emergency' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'
            }`}
          >
            Emergência
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === 'basics' && (
          <div className="space-y-4">
            <Field label="Nome Completo do Tutor" placeholder="Ex: Dr. Roberto Guimarães" value={name} onChange={setName} required />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="CPF" placeholder="Ex: 000.000.000-00" value={cpf} onChange={(val) => setCpf(formatCpf(val))} />
              <Field label="RG" placeholder="Ex: 12.345.678-9" value={rg} onChange={setRg} />
            </div>
            <Field label="Data de Nascimento" type="date" value={birthDate} onChange={setBirthDate} />
          </div>
        )}

        {activeTab === 'contacts' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="E-mail Principal" placeholder="Ex: roberto@email.com" value={email} onChange={setEmail} type="email" />
              <Field label="E-mail Alternativo" placeholder="Ex: roberto.alt@email.com" value={emailAlt} onChange={setEmailAlt} type="email" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="WhatsApp Principal" placeholder="Ex: (11) 98888-0123" value={whatsapp} onChange={(val) => setWhatsapp(formatPhone(val))} type="tel" />
              <Field label="Telefone Fixo / Secundário" placeholder="Ex: (11) 5555-0123" value={phone} onChange={(val) => setPhone(formatPhone(val))} type="tel" />
            </div>
          </div>
        )}

        {activeTab === 'address' && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <Field
                  label={`CEP ${isLoadingCep ? '(Buscando...)' : ''}`}
                  placeholder="Ex: 01001-000"
                  value={postalCode}
                  onChange={(val) => setPostalCode(formatCep(val))}
                />
              </div>
              <Field label="UF" placeholder="Ex: SP" value={state} onChange={(val) => setState(val.toUpperCase().slice(0, 2))} maxLength={2} />
            </div>
            <Field label="Logradouro" placeholder="Ex: Avenida Paulista" value={street} onChange={setStreet} />
            <div className="grid grid-cols-3 gap-4">
              <Field label="Número" placeholder="Ex: 1000" value={number} onChange={setNumber} />
              <div className="col-span-2">
                <Field label="Complemento" placeholder="Ex: Apto 12" value={complement} onChange={setComplement} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Bairro" placeholder="Ex: Bela Vista" value={neighborhood} onChange={setNeighborhood} />
              <Field label="Cidade" placeholder="Ex: São Paulo" value={city} onChange={setCity} />
            </div>
          </div>
        )}

        {activeTab === 'emergency' && (
          <div className="space-y-4">
            <Field label="Nome do Contato de Emergência" placeholder="Ex: Maria Guimarães (Esposa)" value={emergencyName} onChange={setEmergencyName} />
            <Field label="Telefone de Emergência" placeholder="Ex: (11) 98888-0000" value={emergencyPhone} onChange={(val) => setEmergencyPhone(formatPhone(val))} type="tel" />
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 rounded-lg bg-destructive/15 border border-destructive/30 px-4 py-3 text-sm text-destructive font-medium">
            <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />
            <span>{error}</span>
          </div>
        )}

        <div className="pt-4 border-t border-border/60 flex items-center justify-end gap-3 font-semibold">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            className="bg-primary text-primary-foreground font-semibold hover:opacity-90 shadow-sm"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Salvando...' : clientToEdit ? 'Salvar Alterações' : 'Confirmar Cadastro'}
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
  placeholder,
  type = 'text',
  required = false,
  maxLength,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
  required?: boolean
  maxLength?: number
}) {
  return (
    <label className="block space-y-2 font-semibold">
      <span className="block text-sm font-semibold text-foreground">
        {label} {required && <span className="text-primary">*</span>}
      </span>
      <BaseInput
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        maxLength={maxLength}
        className="bg-background border-border focus-visible:ring-primary font-medium h-10"
      />
    </label>
  )
}

