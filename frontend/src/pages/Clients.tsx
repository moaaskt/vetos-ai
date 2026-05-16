import { useEffect, useState, useMemo, type FormEvent } from 'react'
import { RefreshCw, Users, Search, Phone, Mail, Calendar, UserPlus, AlertCircle, ChevronRight, Sparkles } from 'lucide-react'
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
        title="Client Directory"
        badge="Pet Owners"
        description="Manage registered pet owners, their verified email addresses, telephone numbers, and enrollment dates."
        action={
          <Button onClick={() => setIsModalOpen(true)} className="bg-gradient-to-r from-teal-400 to-teal-500 text-slate-950 font-bold hover:from-teal-300 hover:to-teal-400 shadow-lg shadow-teal-500/20 gap-2">
            <UserPlus className="h-4 w-4" />
            Register Client
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
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card/60 border border-border p-4 rounded-xl shadow-sm backdrop-blur-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <BaseInput
            type="search"
            placeholder="Search clients by name, email, or telephone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-background border-border"
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium self-end sm:self-auto shrink-0">
          <span>Showing</span>
          <span className="px-2 py-0.5 rounded bg-secondary text-foreground font-bold">{filteredClients.length}</span>
          <span>of {clients.length} clients</span>
          <Button onClick={loadClients} variant="ghost" size="icon" title="Refresh list" className="ml-1 h-8 w-8 text-muted-foreground hover:text-foreground">
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <Card className="border-border bg-card/60 backdrop-blur-sm overflow-hidden shadow-xl">
        <CardHeader className="border-b border-border/60 bg-card/80 py-5 px-6 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
              <Users className="h-5 w-5 text-teal-400" />
              Registered Client Database
            </CardTitle>
            <CardDescription className="text-xs">Secure records available across clinic workstations</CardDescription>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-teal-400/10 border border-teal-400/20 text-xs font-semibold text-teal-300">
            <Sparkles className="h-3 w-3 animate-pulse" />
            Verified Records
          </span>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-muted/40 text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/80">
                <tr>
                  <th className="px-6 py-3.5 font-bold">Client Owner</th>
                  <th className="px-6 py-3.5 font-bold">Email Address</th>
                  <th className="px-6 py-3.5 font-bold">Telephone Contact</th>
                  <th className="px-6 py-3.5 font-bold">Registered Date</th>
                  <th className="px-6 py-3.5 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredClients.map((client) => (
                  <tr key={client.id} className="group hover:bg-muted/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-teal-500/10 to-teal-500/30 border border-teal-500/40 flex items-center justify-center font-bold text-teal-400 text-xs shadow-sm group-hover:scale-105 transition-transform">
                          {client.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-foreground group-hover:text-teal-300 transition-colors">
                          {client.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {client.email ? (
                        <div className="flex items-center gap-2 text-muted-foreground font-medium group-hover:text-slate-300 transition-colors">
                          <Mail className="h-3.5 w-3.5 text-teal-400/70 shrink-0" />
                          <span>{client.email}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground/60 italic text-xs">Unregistered</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {client.phone ? (
                        <div className="flex items-center gap-2 text-muted-foreground font-medium group-hover:text-slate-300 transition-colors">
                          <Phone className="h-3.5 w-3.5 text-teal-400/70 shrink-0" />
                          <span>{client.phone}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground/60 italic text-xs">Unregistered</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium">
                        <Calendar className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                        <span>
                          {client.createdAt ? new Date(client.createdAt).toLocaleDateString([], { dateStyle: 'medium' }) : 'Unknown'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-teal-300 hover:bg-teal-500/10 gap-1 rounded-lg text-xs font-semibold">
                        <span>Details</span>
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
                title={searchQuery ? "No clients matching query" : "No clients found in database"}
                description={searchQuery ? "Try refining your search keywords or clearing the filter input." : "Your clinic client directory is currently empty. Add your first client to connect pet medical records."}
                actionLabel={searchQuery ? "Clear Search" : "Register Client"}
                onAction={() => searchQuery ? setSearchQuery('') : setIsModalOpen(true)}
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
      setError('Could not create client. Please verify your details.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal title="Register New Client / Pet Owner" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-5 pt-2">
        <Field label="Full Legal Name" placeholder="e.g. Dr. Robert Vance" value={name} onChange={setName} required />
        <Field label="Email Address (Optional)" placeholder="e.g. robert@example.com" value={email} onChange={setEmail} type="email" />
        <Field label="Telephone Number (Optional)" placeholder="e.g. +1 (555) 019-2834" value={phone} onChange={setPhone} type="tel" />
        
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
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Registering...' : 'Confirm Registration'}
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
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
  required?: boolean
}) {
  return (
    <label className="block space-y-2">
      <span className="block text-sm font-semibold text-foreground">
        {label} {required && <span className="text-teal-400">*</span>}
      </span>
      <BaseInput
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        className="bg-background border-border focus-visible:ring-teal-400 font-medium h-10"
      />
    </label>
  )
}
