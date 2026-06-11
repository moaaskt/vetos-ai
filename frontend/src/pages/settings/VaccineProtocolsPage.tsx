import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../lib/api'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Card, CardContent } from '../../components/ui/card'
import { Modal } from '../../components/Modal'
import {
  Plus,
  Trash2,
  Syringe,
  ChevronRight,
  Loader2,
  AlertCircle,
} from 'lucide-react'

type ProtocolDose = {
  id?: string
  vaccineName: string
  doseOrder: number
  intervalDays: number
}

type VaccineProtocol = {
  id: string
  name: string
  species: string
  doses: ProtocolDose[]
}

export function VaccineProtocolsPage() {
  const [protocols, setProtocols] = useState<VaccineProtocol[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null)
  const [protocolName, setProtocolName] = useState('')
  const [protocolSpecies, setProtocolSpecies] = useState('DOG')
  const [doses, setDoses] = useState<ProtocolDose[]>([
    { vaccineName: '', doseOrder: 1, intervalDays: 0 }
  ])
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function loadProtocols() {
    setIsLoading(true)
    try {
      const response = await api.get('/vaccines/protocols')
      setProtocols(response.data)
      setError('')
    } catch {
      setError('Falha ao carregar protocolos vacinais.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadProtocols()
  }, [])

  function handleOpenCreate() {
    setEditingId(null)
    setProtocolName('')
    setProtocolSpecies('DOG')
    setDoses([{ vaccineName: '', doseOrder: 1, intervalDays: 0 }])
    setIsModalOpen(true)
  }

  async function handleOpenEdit(protocol: VaccineProtocol) {
    setEditingId(protocol.id)
    setProtocolName(protocol.name)
    setProtocolSpecies(protocol.species)
    setDoses(protocol.doses.map(d => ({
      vaccineName: d.vaccineName,
      doseOrder: d.doseOrder,
      intervalDays: d.intervalDays
    })))
    setIsModalOpen(true)
  }

  function handleAddDoseField() {
    const nextOrder = doses.length + 1
    // A primeira dose normalmente é no dia 0, as próximas sugerem intervalo de 21 dias por padrão
    const defaultInterval = nextOrder === 1 ? 0 : 21
    setDoses([
      ...doses,
      { vaccineName: '', doseOrder: nextOrder, intervalDays: defaultInterval }
    ])
  }

  function handleRemoveDoseField(index: number) {
    if (doses.length === 1) return
    const updated = doses.filter((_, i) => i !== index)
    // Atualiza a ordem de todas após a remoção
    const reordered = updated.map((d, i) => ({
      ...d,
      doseOrder: i + 1
    }))
    setDoses(reordered)
  }

  function handleDoseChange(index: number, field: keyof ProtocolDose, value: any) {
    const updated = [...doses]
    updated[index] = {
      ...updated[index],
      [field]: value
    }
    setDoses(updated)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!protocolName.trim()) return
    
    // Valida doses
    const invalidDose = doses.some(d => !d.vaccineName.trim())
    if (invalidDose) {
      setError('Por favor, preencha o nome de todas as doses.')
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        name: protocolName,
        species: protocolSpecies,
        doses: doses.map((d, i) => ({
          vaccineName: d.vaccineName,
          doseOrder: i + 1,
          intervalDays: Number(d.intervalDays)
        }))
      }

      if (editingId) {
        await api.put(`/vaccines/protocols/${editingId}`, payload)
      } else {
        await api.post('/vaccines/protocols', payload)
      }

      setIsModalOpen(false)
      await loadProtocols()
    } catch {
      setError('Erro ao salvar o protocolo vacinal.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Deseja realmente excluir este protocolo vacinal? Esta ação não afetará registros de vacinas já aplicadas em pacientes.')) return
    try {
      await api.delete(`/vaccines/protocols/${id}`)
      await loadProtocols()
    } catch {
      setError('Falha ao excluir o protocolo.')
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold">
            <Link to="/settings" className="hover:text-foreground transition-colors cursor-pointer">
              Configurações
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground">Protocolos Vacinais</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Syringe className="h-6 w-6 text-primary animate-pulse" />
            Protocolos Vacinais
          </h1>
          <p className="text-sm text-muted-foreground">
            Configure protocolos de imunização recorrentes por espécie para aplicação ágil nos prontuários.
          </p>
        </div>

        <Button onClick={handleOpenCreate} className="bg-primary text-primary-foreground font-bold hover:opacity-90 shadow-sm gap-1.5 h-10 shrink-0">
          <Plus className="h-4.5 w-4.5" />
          Novo Protocolo
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl bg-destructive/15 border border-destructive/30 px-5 py-4 text-sm text-destructive-foreground shadow-sm animate-in fade-in-0 duration-300">
          <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {/* Main Area */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground font-semibold">Carregando protocolos...</p>
        </div>
      ) : protocols.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 bg-card border border-dashed border-border/80 rounded-2xl p-6">
          <Syringe className="h-14 w-14 text-muted-foreground/45" />
          <div className="space-y-1">
            <h3 className="font-bold text-foreground text-lg">Nenhum protocolo configurado</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Crie protocolos padrão de vacinação para automatizar a geração de doses futuras nos cães e gatos de sua clínica.
            </p>
          </div>
          <Button onClick={handleOpenCreate} variant="outline" className="border-primary/20 hover:bg-primary/10 text-primary font-bold">
            Criar Primeiro Protocolo
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {protocols.map((protocol) => (
            <Card key={protocol.id} className="border-border bg-card shadow-sm hover:border-primary/25 transition-all group flex flex-col justify-between">
              <CardContent className="p-6 space-y-5 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-bold text-foreground text-base tracking-tight truncate" title={protocol.name}>
                      {protocol.name}
                    </h3>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border shrink-0 ${
                      protocol.species === 'DOG'
                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                        : protocol.species === 'CAT'
                        ? 'bg-pink-500/10 text-pink-400 border-pink-500/20'
                        : 'bg-muted text-muted-foreground border-border/80'
                    }`}>
                      {protocol.species === 'DOG' ? 'CÃO' : protocol.species === 'CAT' ? 'GATO' : 'OUTRO'}
                    </span>
                  </div>

                  <div className="space-y-1.5 border-t border-border/40 pt-3">
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Etapas de Imunização</p>
                    <div className="flex flex-wrap gap-2 max-h-[120px] overflow-y-auto pr-1">
                      {protocol.doses.map((dose, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-1.5 bg-muted/40 border border-border/60 rounded-lg px-2.5 py-1 text-[11px] font-semibold text-foreground"
                        >
                          <span className="text-primary font-extrabold">#{dose.doseOrder}</span>
                          <span className="truncate max-w-[100px]">{dose.vaccineName}</span>
                          {dose.doseOrder > 1 && (
                            <span className="text-muted-foreground text-[10px]">({dose.intervalDays}d)</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 border-t border-border/30 pt-4 mt-4">
                  <button
                    onClick={() => handleDelete(protocol.id)}
                    className="h-8 w-8 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive flex items-center justify-center transition-all"
                    title="Excluir Protocolo"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <Button
                    onClick={() => handleOpenEdit(protocol)}
                    variant="outline"
                    className="text-xs h-8 font-bold border-border/80 hover:bg-primary/5 hover:text-primary hover:border-primary/20"
                  >
                    Editar Configuração
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal - Cadastro/Edição de Protocolo */}
      {isModalOpen && (
        <Modal
          title={editingId ? 'Editar Protocolo Vacinal' : 'Criar Protocolo Vacinal'}
          onClose={() => setIsModalOpen(false)}
        >
          <form onSubmit={handleSubmit} className="space-y-5 pt-2 max-h-[75vh] overflow-y-auto pr-1">
            <label className="block space-y-2">
              <span className="block text-sm font-semibold text-foreground">Nome do Protocolo</span>
              <Input
                type="text"
                placeholder="Ex: Protocolo Inicial Filhote Canino"
                value={protocolName}
                onChange={(e) => setProtocolName(e.target.value)}
                required
                className="bg-background border-border font-medium h-10 text-foreground"
              />
            </label>

            <label className="block space-y-2">
              <span className="block text-sm font-semibold text-foreground">Espécie Recomendada</span>
              <select
                className="flex h-10 w-full rounded-lg border border-input bg-card px-3 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-foreground font-bold"
                value={protocolSpecies}
                onChange={(e) => setProtocolSpecies(e.target.value)}
                required
              >
                <option value="DOG">Cão (Canina)</option>
                <option value="CAT">Gato (Felina)</option>
                <option value="OTHER">Outros</option>
              </select>
            </label>

            {/* Doses List */}
            <div className="space-y-3 border-t border-border/60 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-foreground">Doses e Intervalos</span>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleAddDoseField}
                  className="text-xs font-bold text-primary hover:bg-primary/10 gap-1 h-8 px-2.5 rounded-lg"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Adicionar Dose
                </Button>
              </div>

              <div className="space-y-3">
                {doses.map((dose, index) => (
                  <div key={index} className="flex items-center gap-3 animate-in slide-in-from-top-1 duration-200">
                    <span className="text-xs font-extrabold text-primary shrink-0 w-6">
                      #{index + 1}
                    </span>

                    <Input
                      type="text"
                      placeholder="Nome da Vacina (Ex: V10, Antirrábica)"
                      value={dose.vaccineName}
                      onChange={(e) => handleDoseChange(index, 'vaccineName', e.target.value)}
                      required
                      className="bg-background border-border font-medium h-9 text-foreground flex-1"
                    />

                    {index > 0 ? (
                      <div className="flex items-center gap-1.5 shrink-0 w-28">
                        <Input
                          type="number"
                          min="1"
                          placeholder="Dias"
                          value={dose.intervalDays}
                          onChange={(e) => handleDoseChange(index, 'intervalDays', e.target.value)}
                          required
                          className="bg-background border-border font-bold h-9 text-center text-foreground w-16"
                        />
                        <span className="text-[10px] text-muted-foreground font-bold">dias</span>
                      </div>
                    ) : (
                      <div className="text-[11px] text-muted-foreground font-semibold shrink-0 w-28 pl-2">
                        Dose Inicial (D0)
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => handleRemoveDoseField(index)}
                      disabled={doses.length === 1}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg flex items-center justify-center transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-5 border-t border-border/60 flex items-center justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="font-semibold h-10">
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary text-primary-foreground font-semibold hover:opacity-90 shadow-sm h-10"
              >
                {isSubmitting ? 'Salvando...' : 'Salvar Protocolo'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
