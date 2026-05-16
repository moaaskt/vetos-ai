import { useEffect, useState, useMemo } from 'react'
import { api } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import { LogIn, Building2, Search, RefreshCw, Calendar, Sparkles, AlertCircle, ArrowUpRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Skeleton } from '../../components/ui/skeleton'
import { EmptyState } from '../../components/EmptyState'
import { PageHeader } from '../../components/PageHeader'
import { Input as BaseInput } from '../../components/ui/input'

type Clinic = {
  id: string
  name: string
  createdAt: string
}

export function SuperAdminClinics() {
  const [clinics, setClinics] = useState<Clinic[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const { impersonate } = useAuth()

  async function loadClinics() {
    setIsLoading(true)
    try {
      const response = await api.get<Clinic[]>('/clinics')
      setClinics(response.data)
      setError('')
    } catch {
      setError('Não foi possível carregar a lista de clínicas. Verifique a conexão com o servidor.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true
    api.get<Clinic[]>('/clinics')
      .then((response) => {
        if (isMounted) {
          setClinics(response.data)
          setError('')
        }
      })
      .catch(() => {
        if (isMounted) {
          setError('Não foi possível carregar a lista de clínicas. Verifique a conexão com o servidor.')
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })
    return () => { isMounted = false }
  }, [])

  const handleImpersonate = async (clinicId: string) => {
    try {
      await impersonate(clinicId)
    } catch (e) {
      alert('Falha ao iniciar a sessão de acesso à clínica. Verifique os logs de rede ou credenciais.')
      console.error(e)
    }
  }

  const filteredClinics = useMemo(() => {
    if (!searchQuery) return clinics
    const query = searchQuery.toLowerCase()
    return clinics.filter(c => 
      c.name.toLowerCase().includes(query) || 
      c.id.toLowerCase().includes(query)
    )
  }, [clinics, searchQuery])

  return (
    <div className="space-y-8 animate-in fade-in-0 duration-500 max-w-7xl mx-auto font-sans">
      <PageHeader
        title="Ambientes Hospitalares Cadastrados"
        badge="Supervisão Multi-Tenant"
        description="Supervisione as contas das clínicas parceiras, revise as datas de implantação e acesse os ambientes de forma segura para auditoria e suporte técnico."
        action={
          <div className="flex items-center gap-3">
            <Button onClick={loadClinics} variant="outline" className="border-border hover:border-primary/40 gap-2 font-semibold">
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Sincronizar Clínicas
            </Button>
          </div>
        }
      />

      {error && (
        <div className="flex items-center gap-3 rounded-xl bg-destructive/15 border border-destructive/30 px-5 py-4 text-sm font-medium text-destructive shadow-sm">
          <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />
          <span>{error}</span>
        </div>
      )}

      {/* High-Density Search and Supervision Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card/60 border border-border p-4 rounded-xl shadow-sm backdrop-blur-sm">
        <div className="relative w-full sm:w-[420px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <BaseInput
            type="search"
            placeholder="Filtrar por nome da clínica ou identificador UUID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-background border-border h-10 font-medium"
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium self-end sm:self-auto shrink-0">
          <span>Exibindo</span>
          <span className="px-2 py-0.5 rounded bg-secondary text-foreground font-bold">{filteredClinics.length}</span>
          <span>de {clinics.length} clínicas parceiras</span>
        </div>
      </div>

      <Card className="border-border bg-card/60 backdrop-blur-sm overflow-hidden shadow-md">
        <CardHeader className="border-b border-border/60 bg-card/80 py-5 px-6 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2 tracking-tight">
              <Building2 className="h-5 w-5 text-primary" />
              Banco de Dados de Unidades
            </CardTitle>
            <CardDescription className="text-xs">Sessões de suporte e acesso de auditoria monitoradas ativamente</CardDescription>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-primary/10 border border-primary/20 text-xs font-bold uppercase tracking-wider text-primary">
            <Sparkles className="h-3.5 w-3.5 animate-pulse" />
            Cofre Super Admin
          </span>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-muted/40 text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground border-b border-border/80">
                <tr>
                  <th className="px-6 py-3.5 font-bold">Unidade Hospitalar / Clínica</th>
                  <th className="px-6 py-3.5 font-bold">UUID do Tenant</th>
                  <th className="px-6 py-3.5 font-bold">Data de Adesão</th>
                  <th className="px-6 py-3.5 text-right font-bold">Ações de Suporte</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredClinics.map((clinic) => (
                  <tr key={clinic.id} className="group hover:bg-muted/40 transition-colors font-medium">
                    <td className="px-6 py-4.5 font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary text-xs shadow-sm group-hover:scale-105 transition-transform">
                        {clinic.name.charAt(0).toUpperCase()}
                      </div>
                      <span>{clinic.name}</span>
                    </td>
                    <td className="px-6 py-4.5">
                      <span className="font-mono text-xs text-muted-foreground bg-card border border-border px-2 py-1 rounded shadow-sm">
                        {clinic.id}
                      </span>
                    </td>
                    <td className="px-6 py-4.5">
                      <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium">
                        <Calendar className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                        <span>
                          {new Date(clinic.createdAt).toLocaleDateString([], { dateStyle: 'medium' })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4.5 text-right">
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => handleImpersonate(clinic.id)}
                        className="gap-2 border-border hover:border-primary/40 hover:text-primary hover:bg-primary/10 text-xs font-bold transition-all shadow-sm group/btn"
                      >
                        <LogIn className="h-3.5 w-3.5 text-primary group-hover/btn:translate-x-0.5 transition-transform" />
                        <span>Acessar Ambiente</span>
                        <ArrowUpRight className="h-3.5 w-3.5 opacity-60" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!isLoading && filteredClinics.length === 0 && (
            <div className="py-12">
              <EmptyState
                icon={Building2}
                title={searchQuery ? "Nenhuma clínica encontrada na busca" : "Nenhuma clínica cadastrada na plataforma"}
                description={searchQuery ? "Tente refinar a busca do UUID ou limpe o campo de filtro." : "Não há clínicas ou hospitais veterinários cadastrados atualmente no banco de dados."}
                actionLabel={searchQuery ? "Limpar Filtro" : "Sincronizar Clínicas"}
                onAction={() => searchQuery ? setSearchQuery('') : loadClinics()}
              />
            </div>
          )}

          {isLoading && (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl bg-card" />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
