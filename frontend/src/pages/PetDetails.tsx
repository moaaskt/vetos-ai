import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  PawPrint,
  User,
  Mail,
  Phone,
  Cake,
  Tag,
  AlertCircle,
  Plus,
  Trash2,
  Calendar,
  FileText,
  Activity,
  ArrowLeft,
  RefreshCw,
  ClipboardList,
  Scale,
  Syringe,
  Image as ImageIcon,
  UploadCloud,
  Download,
  Loader2,
  X,
  Pill,
  FileSignature,
  Lock,
  Printer,
} from 'lucide-react'
import { api, type Pet, type VaccineRecord, type ClinicalAttachment } from '../lib/api'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import { Skeleton } from '../components/ui/skeleton'
import { Modal } from '../components/Modal'
import { CreatePrescriptionModal } from '../components/CreatePrescriptionModal'
import { CreateConsentTermModal } from '../components/CreateConsentTermModal'
import { PrintPreviewModal } from '../components/PrintPreviewModal'
import { Input } from '../components/ui/input'
import { getSpeciesLabel } from './Pets'

type TimelineItem = {
  id: string
  date: string
  type: 'APPOINTMENT' | 'NOTE' | 'PROCEDURE' | 'PRESCRIPTION' | 'CONSENT_TERM'
  title: string
  content: string
  status?: string
  original: any
}

function AttachmentThumbnail({ att }: { att: ClinicalAttachment }) {
  const [thumbUrl, setThumbUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    let active = true
    let createdUrl: string | null = null
    const isImage = att.mimeType.startsWith('image/')

    if (!isImage) return

    async function fetchThumbnail() {
      setLoading(true)
      setError(false)
      try {
        const response = await api.get(`/attachments/${att.id}/download`, {
          responseType: 'blob',
        })
        if (!active) return
        const blob = new Blob([response.data], { type: att.mimeType })
        createdUrl = window.URL.createObjectURL(blob)
        setThumbUrl(createdUrl)
      } catch (err) {
        if (active) {
          setError(true)
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    fetchThumbnail()

    return () => {
      active = false
      if (createdUrl) {
        window.URL.revokeObjectURL(createdUrl)
      }
    }
  }, [att.id, att.mimeType])

  const isImage = att.mimeType.startsWith('image/')

  if (!isImage) {
    return (
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500/15 to-rose-500/5 border border-rose-500/20 text-rose-500 shadow-sm transition-all group-hover/card:scale-105 duration-200">
        <FileText className="h-6.5 w-6.5" />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-muted animate-pulse border border-border shadow-sm">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground/60" />
      </div>
    )
  }

  if (error || !thumbUrl) {
    return (
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/5 border border-primary/10 text-primary shadow-sm">
        <ImageIcon className="h-6 w-6" />
      </div>
    )
  }

  return (
    <img
      src={thumbUrl}
      alt={att.originalFileName}
      className="h-14 w-14 shrink-0 rounded-xl object-cover border border-border/80 shadow-sm transition-all group-hover/card:scale-105 duration-200"
    />
  )
}

export function PetDetails() {
  const { id } = useParams<{ id: string }>()
  const [pet, setPet] = useState<Pet | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Abas
  const [activeTab, setActiveTab] = useState<'timeline' | 'attachments'>('timeline')

  // Modais de Receitas, Termos e Impressão (Fase 16B)
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false)
  const [isConsentTermModalOpen, setIsConsentTermModalOpen] = useState(false)
  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState(false)
  const [isPrintDropdownOpen, setIsPrintDropdownOpen] = useState(false)
  const [selectedDocForPrint, setSelectedDocForPrint] = useState<any>(null)
  const [printDocType, setPrintDocType] = useState<'prescription' | 'consentTerm' | 'prontuario'>('prontuario')

  // Anexos Clínicos
  const [attachments, setAttachments] = useState<ClinicalAttachment[]>([])
  const [attachmentsLoading, setAttachmentsLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)
  const [lightboxName, setLightboxName] = useState<string>('')

  // Anexo temporário para novas evoluções
  const [selectedFileForRecord, setSelectedFileForRecord] = useState<File | null>(null)

  async function loadAttachments() {
    if (!id) return
    setAttachmentsLoading(true)
    try {
      const response = await api.get<ClinicalAttachment[]>(`/pets/${id}/attachments`)
      setAttachments(response.data)
    } catch {
      setError('Falha ao carregar exames e anexos.')
    } finally {
      setAttachmentsLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      loadAttachments()
    }
  }, [id])

  async function handleUploadFiles(files: FileList) {
    if (!id || files.length === 0) return
    const file = files[0]

    // Validações no frontend
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setError('Formato de arquivo inválido. Apenas PDF, JPEG, PNG e WEBP são permitidos.')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Arquivo muito pesado. O limite máximo é de 10 MB.')
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    setUploadProgress(10)
    try {
      await api.post(`/pets/${id}/attachments`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            setUploadProgress(percent)
          }
        },
      })
      setUploadProgress(100)
      setTimeout(() => setUploadProgress(null), 1000)
      await loadAttachments()
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Falha ao enviar arquivo.'
      setError(msg)
      setUploadProgress(null)
    }
  }

  async function handleDownloadAttachment(att: ClinicalAttachment) {
    try {
      const response = await api.get(`/attachments/${att.id}/download`, {
        responseType: 'blob',
      })
      const blob = new Blob([response.data], { type: att.mimeType })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', att.originalFileName)
      document.body.appendChild(link)
      link.click()
      link.parentNode?.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch {
      setError('Falha ao baixar o arquivo.')
    }
  }

  async function handleOpenPreview(att: ClinicalAttachment) {
    if (!att.mimeType.startsWith('image/')) return
    try {
      const response = await api.get(`/attachments/${att.id}/download`, {
        responseType: 'blob',
      })
      const blob = new Blob([response.data], { type: att.mimeType })
      const url = window.URL.createObjectURL(blob)
      setLightboxUrl(url)
      setLightboxName(att.originalFileName)
    } catch {
      setError('Falha ao carregar preview da imagem.')
    }
  }

  async function handleDeleteAttachment(attId: string, name: string) {
    if (!confirm(`Tem certeza que deseja remover permanentemente o anexo "${name}"? Esta ação não pode ser desfeita.`)) return
    try {
      await api.delete(`/attachments/${attId}`)
      await loadAttachments()
    } catch {
      setError('Falha ao remover anexo.')
    }
  }

  // Modais
  const [isAllergyModalOpen, setIsAllergyModalOpen] = useState(false)
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false)
  const [isVaccineModalOpen, setIsVaccineModalOpen] = useState(false)
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false)

  // Form states
  const [allergyName, setAllergyName] = useState('')
  const [recordType, setRecordType] = useState<'NOTE' | 'PROCEDURE'>('NOTE')
  const [recordTitle, setRecordTitle] = useState('')
  const [recordContent, setRecordContent] = useState('')

  // Form states Wave 2
  const [vaccineName, setVaccineName] = useState('')
  const [vaccineDate, setVaccineDate] = useState(new Date().toISOString().split('T')[0])
  const [vaccineNextDoseDate, setVaccineNextDoseDate] = useState('')
  const [isExporting, setIsExporting] = useState(false)

  const [weightValue, setWeightValue] = useState('')
  const [weightDate, setWeightDate] = useState(new Date().toISOString().split('T')[0])

  // --- Estados de Protocolos (Fase 14B.2) ---
  const [isApplyProtocolModalOpen, setIsApplyProtocolModalOpen] = useState(false)
  const [protocols, setProtocols] = useState<any[]>([])
  const [selectedProtocolId, setSelectedProtocolId] = useState('')
  const [protocolStartDate, setProtocolStartDate] = useState(new Date().toISOString().split('T')[0])
  const [protocolPreview, setProtocolPreview] = useState<any[]>([])

  // --- Estados para Aplicação de Dose Agendada (Fase 14B.2) ---
  const [isConfirmApplyModalOpen, setIsConfirmApplyModalOpen] = useState(false)
  const [confirmingVaccineId, setConfirmingVaccineId] = useState('')
  const [confirmingVaccineName, setConfirmingVaccineName] = useState('')
  const [applyDate, setApplyDate] = useState(new Date().toISOString().split('T')[0])
  const [lotNumber, setLotNumber] = useState('')
  const [manufacturer, setManufacturer] = useState('')
  const [notes, setNotes] = useState('')
  const [recalculateSubsequent, setRecalculateSubsequent] = useState(true)

  async function loadProtocolsForApply() {
    try {
      const response = await api.get('/vaccines/protocols')
      const petSpeciesUpper = pet?.species?.toUpperCase() || ''
      const filtered = response.data.filter((p: any) => p.species.toUpperCase() === petSpeciesUpper || p.species === 'OTHER')
      setProtocols(filtered)
      if (filtered.length > 0) {
        setSelectedProtocolId(filtered[0].id)
      }
    } catch {
      setError('Falha ao carregar protocolos disponíveis.')
    }
  }

  useEffect(() => {
    if (!selectedProtocolId || !protocolStartDate) {
      setProtocolPreview([])
      return
    }

    const selected = protocols.find(p => p.id === selectedProtocolId)
    if (!selected || !selected.doses) {
      setProtocolPreview([])
      return
    }

    const preview = []
    let current = new Date(protocolStartDate)
    for (const dose of selected.doses) {
      if (dose.doseOrder > 1) {
        const next = new Date(current.getTime())
        next.setDate(next.getDate() + dose.intervalDays)
        current = next
      } else {
        if (dose.intervalDays > 0) {
          const next = new Date(current.getTime())
          next.setDate(next.getDate() + dose.intervalDays)
          current = next
        }
      }
      preview.push({
        name: dose.vaccineName,
        date: current.toLocaleDateString('pt-BR'),
        intervalDays: dose.intervalDays,
        doseOrder: dose.doseOrder
      })
    }
    setProtocolPreview(preview)
  }, [selectedProtocolId, protocolStartDate, protocols])

  async function handleApplyProtocol(e: React.FormEvent) {
    e.preventDefault()
    if (!id || !selectedProtocolId || !protocolStartDate) return
    setIsSubmitting(true)
    try {
      await api.post('/vaccines/apply-protocol', {
        petId: id,
        protocolId: selectedProtocolId,
        startDate: protocolStartDate
      })
      setIsApplyProtocolModalOpen(false)
      await loadPetData()
    } catch (err: any) {
      const serverMessage = err.response?.data?.message
      setError(serverMessage || 'Falha ao aplicar protocolo vacinal.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleConfirmApplyDose(e: React.FormEvent) {
    e.preventDefault()
    if (!confirmingVaccineId || !applyDate) return
    setIsSubmitting(true)
    try {
      await api.post(`/vaccines/${confirmingVaccineId}/apply`, {
        date: applyDate,
        lotNumber: lotNumber.trim() || undefined,
        manufacturer: manufacturer.trim() || undefined,
        notes: notes.trim() || undefined,
        recalculateSubsequent
      })
      setIsConfirmApplyModalOpen(false)
      setLotNumber('')
      setManufacturer('')
      setNotes('')
      await loadPetData()
    } catch (err: any) {
      const serverMessage = err.response?.data?.message
      setError(serverMessage || 'Falha ao registrar aplicação da vacina.')
    } finally {
      setIsSubmitting(false)
    }
  }

  function openApplyDoseModal(vaccineId: string, name: string) {
    setConfirmingVaccineId(vaccineId)
    setConfirmingVaccineName(name)
    setApplyDate(new Date().toISOString().split('T')[0])
    setIsConfirmApplyModalOpen(true)
  }

  function isDoseAvailable(vac: VaccineRecord, vaccineRecords: VaccineRecord[]): boolean {
    if (!vac.protocolId || !vac.protocolDoseId || !vac.protocolDose) {
      return true
    }

    const currentOrder = vac.protocolDose.doseOrder

    const siblings = vaccineRecords.filter(
      (r) => r.protocolId === vac.protocolId && r.id !== vac.id
    )

    const hasPendingPrevious = siblings.some((sibling) => {
      if (!sibling.protocolDose) return false
      return sibling.protocolDose.doseOrder < currentOrder && sibling.status === 'SCHEDULED'
    })

    return !hasPendingPrevious
  }

  async function loadPetData() {
    if (!id) return
    setIsLoading(true)
    try {
      const response = await api.get<Pet>(`/pets/${id}`)
      setPet(response.data)
      setError('')
    } catch {
      setError('Não foi possível carregar o prontuário deste paciente.')
    } finally {
      setIsLoading(false)
    }
  }

  async function refreshPetDataSilently() {
    if (!id) return
    try {
      const response = await api.get<Pet>(`/pets/${id}`)
      setPet(response.data)
    } catch {
      // Falha silenciosa: dados da timeline serão atualizados na próxima navegação
    }
  }

  useEffect(() => {
    loadPetData()
  }, [id])

  async function handleAddAllergy(e: React.FormEvent) {
    e.preventDefault()
    if (!id || !allergyName.trim()) return
    setIsSubmitting(true)
    try {
      await api.post('/allergies', {
        name: allergyName,
        petId: id,
      })
      setAllergyName('')
      setIsAllergyModalOpen(false)
      await loadPetData()
    } catch {
      setError('Falha ao adicionar alergia.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDeleteAllergy(allergyId: string) {
    if (!confirm('Deseja realmente remover esta alergia do prontuário?')) return
    try {
      await api.delete(`/allergies/${allergyId}`)
      await loadPetData()
    } catch {
      setError('Falha ao remover alergia.')
    }
  }

  async function handleAddRecord(e: React.FormEvent) {
    e.preventDefault()
    if (!id || !recordContent.trim()) return
    setIsSubmitting(true)
    try {
      const response = await api.post('/clinical-records', {
        type: recordType,
        title: recordTitle.trim() || undefined,
        content: recordContent,
        petId: id,
      })

      if (selectedFileForRecord) {
        const formData = new FormData()
        formData.append('file', selectedFileForRecord)
        formData.append('clinicalRecordId', response.data.id)

        await api.post(`/pets/${id}/attachments`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
      }

      setRecordTitle('')
      setRecordContent('')
      setSelectedFileForRecord(null)
      setIsRecordModalOpen(false)
      await loadPetData()
    } catch {
      setError('Falha ao registrar evolução clínica.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDeleteRecord(recordId: string) {
    if (!confirm('Deseja realmente excluir este registro clínico? A exclusão é permanente.')) return
    try {
      await api.delete(`/clinical-records/${recordId}`)
      await loadPetData()
    } catch {
      setError('Falha ao excluir registro clínico.')
    }
  }

  async function handleDeletePrescription(prescriptionId: string) {
    if (!confirm('Tem certeza de que deseja remover permanentemente este rascunho de receita?')) return
    try {
      await api.delete(`/prescriptions/${prescriptionId}`)
      await loadPetData()
    } catch {
      setError('Falha ao remover rascunho de receita.')
    }
  }

  async function handleDeleteConsentTerm(termId: string) {
    if (!confirm('Tem certeza de que deseja remover permanentemente este rascunho de termo?')) return
    try {
      await api.delete(`/consent-terms/${termId}`)
      await loadPetData()
    } catch {
      setError('Falha ao remover rascunho de termo.')
    }
  }

  function handleOpenPrintPreview(doc: any, type: 'prescription' | 'consentTerm' | 'prontuario') {
    setSelectedDocForPrint(doc)
    setPrintDocType(type)
    setIsPrintPreviewOpen(true)
  }

  // Wave 2 Actions
  async function handleAddVaccine(e: React.FormEvent) {
    e.preventDefault()
    if (!id || !vaccineName.trim() || !vaccineDate) return
    setIsSubmitting(true)
    try {
      await api.post('/vaccines', {
        name: vaccineName,
        date: vaccineDate,
        nextDoseDate: vaccineNextDoseDate.trim() || undefined,
        petId: id,
      })
      setVaccineName('')
      setVaccineDate(new Date().toISOString().split('T')[0])
      setVaccineNextDoseDate('')
      setIsVaccineModalOpen(false)
      await loadPetData()
    } catch {
      setError('Falha ao registrar vacinação.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDeleteVaccine(vaccineId: string) {
    if (!confirm('Deseja realmente remover esta vacinação?')) return
    try {
      await api.delete(`/vaccines/${vaccineId}`)
      await loadPetData()
    } catch {
      setError('Falha ao remover vacinação.')
    }
  }

  async function handleExportCertificate() {
    if (!id) return
    setIsExporting(true)
    try {
      const response = await api.get(`/vaccines/pet/${id}/certificate`, {
        responseType: 'blob',
      })
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      window.open(url, '_blank')
      setTimeout(() => window.URL.revokeObjectURL(url), 100)
    } catch {
      setError('Falha ao exportar certificado de vacinação.')
    } finally {
      setIsExporting(false)
    }
  }

  async function handleAddWeight(e: React.FormEvent) {
    e.preventDefault()
    if (!id || !weightValue || !weightDate) return
    setIsSubmitting(true)
    try {
      await api.post('/weight-records', {
        weight: Number(weightValue),
        date: weightDate,
        petId: id,
      })
      setWeightValue('')
      setWeightDate(new Date().toISOString().split('T')[0])
      setIsWeightModalOpen(false)
      await loadPetData()
    } catch {
      setError('Falha ao registrar peso.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDeleteWeight(weightId: string) {
    if (!confirm('Deseja realmente remover esta medição de peso?')) return
    try {
      await api.delete(`/weight-records/${weightId}`)
      await loadPetData()
    } catch {
      setError('Falha ao remover medição de peso.')
    }
  }

  // Combina consultas, registros clínicos, receitas e termos em ordem cronológica reversa
  const timelineItems: TimelineItem[] = []
  if (pet) {
    if (pet.appointments) {
      pet.appointments.forEach((app) => {
        timelineItems.push({
          id: app.id,
          date: app.date || app.scheduledAt,
          type: 'APPOINTMENT',
          title: `Consulta Agendada`,
          content: app.reason || 'Nenhum motivo fornecido.',
          status: app.status,
          original: app,
        })
      })
    }

    if (pet.clinicalRecords) {
      pet.clinicalRecords.forEach((rec) => {
        timelineItems.push({
          id: rec.id,
          date: rec.date,
          type: rec.type,
          title: rec.title || (rec.type === 'NOTE' ? 'Evolução Clínica' : 'Procedimento Realizado'),
          content: rec.content,
          original: rec,
        })
      })
    }

    if (pet.prescriptions) {
      pet.prescriptions.forEach((presc) => {
        timelineItems.push({
          id: presc.id,
          date: presc.createdAt || '',
          type: 'PRESCRIPTION',
          title: 'Receita Médica',
          content: `${presc.medicamento} - ${presc.dosagem} (${presc.frequencia})`,
          status: presc.status,
          original: presc,
        })
      })
    }

    if (pet.consentTerms) {
      pet.consentTerms.forEach((term) => {
        timelineItems.push({
          id: term.id,
          date: term.createdAt || '',
          type: 'CONSENT_TERM',
          title: 'Termo de Consentimento',
          content: term.finalText,
          status: term.status,
          original: term,
        })
      })
    }
  }

  timelineItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  function formatDisplayDate(dateString: string, includeTime = true) {
    try {
      const date = new Date(dateString)
      const options: Intl.DateTimeFormatOptions = includeTime 
        ? { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }
        : { day: '2-digit', month: '2-digit', year: 'numeric' }
      return date.toLocaleDateString('pt-BR', options)
    } catch {
      return dateString
    }
  }

  function getStatusLabel(status?: string) {
    switch (status) {
      case 'SCHEDULED':
        return { text: 'Agendada', class: 'bg-blue-500/10 text-blue-400 border-blue-500/20' }
      case 'COMPLETED':
        return { text: 'Realizada', class: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' }
      case 'CANCELLED':
        return { text: 'Cancelada', class: 'bg-rose-500/10 text-rose-400 border-rose-500/20' }
      default:
        return { text: 'Pendente', class: 'bg-slate-500/10 text-slate-400 border-slate-500/20' }
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-32 bg-card" />
        <Skeleton className="h-44 w-full rounded-2xl bg-card" />
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-96 md:col-span-2 rounded-2xl bg-card" />
          <Skeleton className="h-96 rounded-2xl bg-card" />
        </div>
      </div>
    )
  }

  if (!pet) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <AlertCircle className="h-14 w-14 text-rose-500" />
        <h2 className="text-xl font-bold text-foreground">Paciente não localizado</h2>
        <p className="text-muted-foreground text-sm">O prontuário pode ter sido removido ou pertence a outro tenant.</p>
        <Link to="/pets">
          <Button className="bg-primary text-primary-foreground font-semibold">Voltar para Pacientes</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in-0 duration-500 text-foreground font-medium">
      {/* Botão de Voltar */}
      <div className="flex items-center justify-between">
        <Link to="/pets" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground font-bold transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Voltar para Pacientes
        </Link>
        <div className="flex items-center gap-2">
          {/* Dropdown de Impressão Centralizado */}
          <div className="relative">
            <Button
              onClick={() => setIsPrintDropdownOpen(!isPrintDropdownOpen)}
              variant="outline"
              size="sm"
              className="font-bold gap-1.5 text-xs h-8 border-border bg-card"
            >
              <Printer className="h-3.5 w-3.5 text-primary" />
              Imprimir
            </Button>
            {isPrintDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-56 rounded-lg border border-border bg-card p-1 shadow-lg z-50 animate-in fade-in-0 slide-in-from-top-1 duration-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsPrintDropdownOpen(false)
                    handleOpenPrintPreview(pet, 'prontuario')
                  }}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-muted text-xs font-semibold flex items-center gap-2 text-foreground"
                >
                  <ClipboardList className="h-3.5 w-3.5 text-primary" />
                  Prontuário Completo
                </button>
                
                <div className="h-px bg-border/60 my-1" />
                <div className="px-3 py-1 text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Receitas</div>
                {(!pet?.prescriptions || pet.prescriptions.length === 0) ? (
                  <div className="px-3 py-1.5 text-[11px] text-muted-foreground italic">Nenhuma receita emitida</div>
                ) : (
                  pet.prescriptions.map((presc) => (
                    <button
                      type="button"
                      key={presc.id}
                      onClick={() => {
                        setIsPrintDropdownOpen(false)
                        handleOpenPrintPreview(presc, 'prescription')
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-md hover:bg-muted text-[11px] font-medium truncate flex items-center gap-1.5 text-foreground"
                    >
                      <span className="text-xs">💊</span>
                      <span className="truncate">{presc.medicamento} ({presc.status === 'SIGNED' ? 'Assinada' : 'Rascunho'})</span>
                    </button>
                  ))
                )}

                <div className="h-px bg-border/60 my-1" />
                <div className="px-3 py-1 text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Termos</div>
                {(!pet?.consentTerms || pet.consentTerms.length === 0) ? (
                  <div className="px-3 py-1.5 text-[11px] text-muted-foreground italic">Nenhum termo assinado</div>
                ) : (
                  pet.consentTerms.map((term) => (
                    <button
                      type="button"
                      key={term.id}
                      onClick={() => {
                        setIsPrintDropdownOpen(false)
                        handleOpenPrintPreview(term, 'consentTerm')
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-md hover:bg-muted text-[11px] font-medium truncate flex items-center gap-1.5 text-foreground"
                    >
                      <span className="text-xs">📄</span>
                      <span className="truncate">{term.finalText.substring(0, 25)}... ({term.status === 'SIGNED' ? 'Assinado' : 'Rascunho'})</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <Button onClick={loadPetData} variant="ghost" size="icon" title="Atualizar dados" className="h-8 w-8 text-muted-foreground hover:text-foreground">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl bg-destructive/15 border border-destructive/30 px-5 py-4 text-sm text-destructive-foreground shadow-sm">
          <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />
          <span>{error}</span>
        </div>
      )}

      {/* Premium Patient Profile Header */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        {/* Decorative Top Gradient bar */}
        <div className="h-2 w-full bg-gradient-to-r from-primary via-indigo-500 to-primary/80" />
        
        <div className="p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
          {/* Avatar Premium */}
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-indigo-500/10 border border-primary/20 text-primary shadow-sm font-bold">
            <PawPrint className="h-10 w-10 text-primary" />
          </div>

          {/* Dados do Paciente */}
          <div className="flex-1 text-center md:text-left space-y-4">
            <div className="space-y-1">
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex flex-col md:flex-row md:items-center justify-center md:justify-start gap-2 md:gap-3">
                {pet.name}
                <span className="inline-flex items-center justify-center rounded-full bg-primary/10 border border-primary/20 px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-primary self-center">
                  {getSpeciesLabel(pet.species)}
                </span>
              </h1>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-1.5 text-sm text-muted-foreground font-semibold">
                <span className="flex items-center gap-1.5">
                  <Tag className="h-4 w-4 text-primary shrink-0" />
                  Raça: <strong className="text-foreground">{pet.breed || 'Não especificada'}</strong>
                </span>
                <span className="flex items-center gap-1.5">
                  <Cake className="h-4 w-4 text-primary shrink-0" />
                  Idade: <strong className="text-foreground">{pet.age !== null && pet.age !== undefined ? `${pet.age} ${pet.age === 1 ? 'ano' : 'anos'}` : 'Desconhecida'}</strong>
                </span>
                {pet.weightRecords && pet.weightRecords.length > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Scale className="h-4 w-4 text-primary shrink-0" />
                    Peso Atual: <strong className="text-foreground">{pet.weightRecords[0].weight} kg</strong>
                  </span>
                )}
              </div>
            </div>

            {/* Ficha de Tutor */}
            {pet.client && (
              <div className="inline-flex flex-col md:flex-row md:items-center gap-4 bg-muted/30 border border-border/60 rounded-xl px-5 py-4 w-full max-w-2xl text-left">
                <div className="flex items-center gap-2.5 text-xs text-muted-foreground uppercase tracking-wider font-bold border-b md:border-b-0 md:border-r border-border/80 pb-2 md:pb-0 md:pr-4">
                  <User className="h-4 w-4 text-primary" />
                  Tutor Responsável
                </div>
                <div className="space-y-1 flex-1">
                  <p className="text-sm font-bold text-foreground">{pet.client.name}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground font-semibold">
                    {pet.client.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
                        {pet.client.email}
                      </span>
                    )}
                    {pet.client.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
                        {pet.client.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grid Principal */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Coluna da Linha do Tempo (2/3) */}
        <div className="md:col-span-2 space-y-6">
          {/* Navegação de Abas */}
          <div className="flex border-b border-border/80">
            <button
              onClick={() => setActiveTab('timeline')}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'timeline'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <ClipboardList className="h-4 w-4" />
              Histórico Clínico
            </button>
            <button
              onClick={() => setActiveTab('attachments')}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'attachments'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <FileText className="h-4 w-4" />
              Exames e Anexos
            </button>
          </div>

          {activeTab === 'timeline' ? (
            <Card className="border-border bg-card">
              <CardContent className="p-6 space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
                  <div className="space-y-1">
                    <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
                      <ClipboardList className="h-5 w-5 text-primary" />
                      Histórico Clínico Unificado
                    </h2>
                    <p className="text-xs text-muted-foreground font-medium">Linha do tempo integrada de consultas, anotações de evolução e procedimentos cirúrgicos ou ambulatoriais.</p>
                  </div>
                  
                  {/* Botões de Ação Rápida */}
                  <div className="flex items-center gap-2.5">
                    <Button onClick={() => setIsRecordModalOpen(true)} className="bg-primary text-primary-foreground font-bold hover:opacity-90 shadow-sm gap-1.5 text-xs h-9">
                      <Plus className="h-4 w-4" />
                      Registrar Evolução
                    </Button>
                    <Button onClick={() => setIsPrescriptionModalOpen(true)} variant="outline" className="font-bold gap-1.5 text-xs h-9 border-border bg-card">
                      <Plus className="h-4 w-4 text-primary" />
                      Nova Receita
                    </Button>
                    <Button onClick={() => setIsConsentTermModalOpen(true)} variant="outline" className="font-bold gap-1.5 text-xs h-9 border-border bg-card">
                      <Plus className="h-4 w-4 text-primary" />
                      Novo Termo
                    </Button>
                  </div>
                </div>

                {/* Linha do Tempo Visual */}
                {timelineItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
                    <ClipboardList className="h-12 w-12 text-muted-foreground/50" />
                    <p className="text-sm font-semibold text-muted-foreground max-w-sm">Nenhum evento clínico registrado ainda para este paciente.</p>
                  </div>
                ) : (
                  <div className="relative border-l border-border pl-6 ml-3.5 space-y-8">
                    {timelineItems.map((item) => {
                      const isApp = item.type === 'APPOINTMENT'
                      const isNote = item.type === 'NOTE'
                      const isPresc = item.type === 'PRESCRIPTION'
                      const isTerm = item.type === 'CONSENT_TERM'
                      
                      return (
                        <div key={item.id} className="relative group/item animate-in fade-in-0 duration-300">
                          {/* Indicador na Linha do Tempo */}
                          <span className={`absolute -left-[35px] top-1.5 flex h-6.5 w-6.5 items-center justify-center rounded-full border shadow-sm transition-all duration-300 ${
                            isApp
                              ? 'bg-blue-500/10 border-blue-500/20 text-blue-400 group-hover/item:bg-blue-500 group-hover/item:text-white'
                              : isNote
                              ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400 group-hover/item:bg-indigo-500 group-hover/item:text-white'
                              : isPresc
                              ? 'bg-purple-500/10 border-purple-500/20 text-purple-400 group-hover/item:bg-purple-500 group-hover/item:text-white'
                              : isTerm
                              ? 'bg-amber-500/10 border-amber-500/20 text-amber-400 group-hover/item:bg-amber-500 group-hover/item:text-white'
                              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 group-hover/item:bg-emerald-500 group-hover/item:text-white'
                          }`}>
                            {isApp ? (
                              <Calendar className="h-3.5 w-3.5" />
                            ) : isNote ? (
                              <FileText className="h-3.5 w-3.5" />
                            ) : isPresc ? (
                              <Pill className="h-3.5 w-3.5" />
                            ) : isTerm ? (
                              <FileSignature className="h-3.5 w-3.5" />
                            ) : (
                              <Activity className="h-3.5 w-3.5" />
                            )}
                          </span>

                          {/* Conteúdo do Evento */}
                          <div className="bg-muted/40 border border-border/80 rounded-xl p-5 space-y-3 transition-all duration-200 hover:border-primary/20 hover:bg-card">
                            <div className="flex items-start justify-between gap-4">
                              <div className="space-y-1">
                                <span className="text-[10px] text-muted-foreground font-bold tracking-wider uppercase block">
                                  {formatDisplayDate(item.date)}
                                </span>
                                <h3 className="text-base font-bold text-foreground flex items-center gap-2.5">
                                  {item.title}
                                  {isApp && (
                                    <span className={`inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${getStatusLabel(item.status).class}`}>
                                      {getStatusLabel(item.status).text}
                                    </span>
                                  )}
                                  {(isPresc || isTerm) && (
                                    <span className={`inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                                      item.status === 'SIGNED'
                                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                                        : 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400'
                                    }`}>
                                      {item.status === 'SIGNED' ? (
                                        <span className="flex items-center gap-0.5">
                                          Assinado <Lock className="h-2.5 w-2.5" />
                                        </span>
                                      ) : 'Rascunho'}
                                    </span>
                                  )}
                                </h3>
                              </div>

                              {/* Ações para itens criados */}
                              {!isApp && (() => {
                                const isSigned = item.status === 'SIGNED'
                                if (isSigned) return null;

                                return (
                                  <button
                                    onClick={() => {
                                      if (isPresc) {
                                        handleDeletePrescription(item.id)
                                      } else if (isTerm) {
                                        handleDeleteConsentTerm(item.id)
                                      } else {
                                        handleDeleteRecord(item.id)
                                      }
                                    }}
                                    className="opacity-0 group-hover/item:opacity-100 h-8 w-8 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive flex items-center justify-center transition-all shadow-sm"
                                    title="Excluir Rascunho"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                )
                              })()}
                            </div>

                            {/* Detalhes específicos por tipo */}
                            {isPresc && (
                              <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2 bg-purple-500/5 border border-purple-500/10 rounded-lg p-3 text-sm text-foreground/90 font-medium max-w-md">
                                  <span>💊</span>
                                  <div>
                                    <div className="font-bold">{item.content}</div>
                                    <div className="text-xs text-muted-foreground mt-0.5">
                                      Via: {item.original.viaAdministracao} | Duração: {item.original.duracao}
                                    </div>
                                  </div>
                                </div>
                                {item.original.observacoes && (
                                  <p className="text-xs text-muted-foreground italic pl-1">
                                    Obs: {item.original.observacoes}
                                  </p>
                                )}
                                <div className="flex items-center gap-3 mt-1.5">
                                  <Button
                                    onClick={() => handleOpenPrintPreview(item.original, 'prescription')}
                                    variant="outline"
                                    size="sm"
                                    className="h-8 text-xs font-bold gap-1 border-border bg-card"
                                  >
                                    Visualizar Impressão
                                  </Button>
                                  {item.status === 'SIGNED' && item.original.documentHash && (
                                    <span className="text-[10px] text-muted-foreground font-mono bg-muted px-2 py-1 rounded truncate max-w-[280px]" title={item.original.documentHash}>
                                      Hash: {item.original.documentHash}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}

                            {isTerm && (
                              <div className="flex flex-col gap-2">
                                <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap font-medium line-clamp-3">
                                  {item.content}
                                </p>
                                <div className="flex items-center gap-3 mt-1">
                                  <Button
                                    onClick={() => handleOpenPrintPreview(item.original, 'consentTerm')}
                                    variant="outline"
                                    size="sm"
                                    className="h-8 text-xs font-bold gap-1 border-border bg-card"
                                  >
                                    Visualizar Impressão
                                  </Button>
                                  {item.status === 'SIGNED' && item.original.documentHash && (
                                    <span className="text-[10px] text-muted-foreground font-mono bg-muted px-2 py-1 rounded truncate max-w-[280px]" title={item.original.documentHash}>
                                      Hash: {item.original.documentHash}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}

                            {!isPresc && !isTerm && (
                              <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap font-medium">
                                {item.content}
                              </p>
                            )}

                            {isApp && (
                              <div className="flex items-center gap-1 text-[10px] text-amber-500/80 font-bold uppercase tracking-wider bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded w-fit">
                                Histórico de Consulta (Apenas Leitura)
                              </div>
                            )}

                            {!isApp && !isPresc && !isTerm && (() => {
                              const itemAttachments = attachments.filter(
                                (att) => att.clinicalRecordId === item.id
                              );
                              if (itemAttachments.length === 0) return null;

                              return (
                                <div className="mt-3 pt-3 border-t border-border/40 space-y-2">
                                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-muted border border-border/60 text-foreground/85 select-none">
                                    <span>📎</span>
                                    <span>
                                      {itemAttachments.length}{' '}
                                      {itemAttachments.length === 1 ? 'anexo' : 'anexos'}
                                    </span>
                                  </div>
                                  
                                  {itemAttachments.length <= 3 && (
                                    <ul className="space-y-1.5 text-xs text-muted-foreground font-medium pl-1">
                                      {itemAttachments.map((att) => (
                                        <li key={att.id} className="flex items-center gap-1.5 truncate">
                                          <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/35 shrink-0" />
                                          <span className="truncate max-w-[320px]" title={att.originalFileName}>
                                            {att.originalFileName}
                                          </span>
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6 animate-in fade-in-0 duration-300">
              {/* Dropzone de Upload */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  if (e.dataTransfer.files) {
                    handleUploadFiles(e.dataTransfer.files);
                  }
                }}
                onClick={() => document.getElementById('file-upload-input')?.click()}
                className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
                  isDragging
                    ? 'border-primary bg-primary/5 scale-[1.01]'
                    : 'border-border bg-muted/20 hover:border-primary/50 hover:bg-muted/40'
                }`}
              >
                <input
                  id="file-upload-input"
                  type="file"
                  accept=".pdf,image/jpeg,image/png,image/webp"
                  onChange={(e) => {
                    if (e.target.files) {
                      handleUploadFiles(e.target.files);
                    }
                  }}
                  className="hidden"
                />
                
                <UploadCloud className={`h-12 w-12 text-primary transition-transform duration-300 ${isDragging ? 'scale-110 -translate-y-1' : ''}`} />
                <h3 className="mt-4 text-base font-bold text-foreground">
                  Arraste e solte arquivos aqui, ou clique para fazer upload
                </h3>
                <p className="mt-1.5 text-xs text-muted-foreground font-semibold">
                  Apenas arquivos PDF, PNG, JPG/JPEG e WEBP até 10 MB são aceitos.
                </p>

                {uploadProgress !== null && (
                  <div className="absolute inset-x-0 bottom-0 p-4 bg-background/90 rounded-b-2xl flex flex-col space-y-2 border-t border-border animate-in slide-in-from-bottom duration-300">
                    <div className="flex justify-between items-center text-xs font-bold text-foreground">
                      <span className="flex items-center gap-1.5">
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                        Fazendo upload do arquivo...
                      </span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-primary h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Lista de Anexos */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Arquivos Anexados
                </h3>

                {attachmentsLoading ? (
                  <div className="flex flex-col gap-4">
                    <Skeleton className="h-16 w-full rounded-xl bg-card" />
                    <Skeleton className="h-16 w-full rounded-xl bg-card" />
                  </div>
                ) : attachments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center bg-muted/20 border border-dashed border-border rounded-2xl p-6">
                    <FileText className="h-10 w-10 text-muted-foreground/45 mb-2" />
                    <h4 className="text-sm font-bold text-foreground">Nenhum exame ou anexo localizado</h4>
                    <p className="text-xs text-muted-foreground max-w-sm mt-1">
                      Arraste e solte seus arquivos PDF ou de imagem aqui, ou clique para fazer upload do primeiro anexo deste pet.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {attachments.map((att) => {
                      const isImage = att.mimeType.startsWith('image/');
                      const sizeInMB = (att.fileSize / (1024 * 1024)).toFixed(2);
                      const displaySize = att.fileSize > 1024 * 1024 
                        ? `${sizeInMB} MB` 
                        : `${(att.fileSize / 1024).toFixed(1)} KB`;

                      return (
                        <div
                          key={att.id}
                          className="group/card flex flex-col justify-between bg-card border border-border/80 hover:border-primary/20 hover:shadow-md rounded-2xl p-4 transition-all duration-200"
                        >
                          <div className="flex items-start gap-4">
                            {/* Thumbnail do Anexo */}
                            <div 
                              className={isImage ? "cursor-pointer" : ""}
                              onClick={() => isImage && handleOpenPreview(att)}
                            >
                              <AttachmentThumbnail att={att} />
                            </div>

                            {/* Detalhes do Anexo */}
                            <div className="flex-1 min-w-0 space-y-1.5">
                              <div className="flex flex-col gap-0.5">
                                <h4
                                  onClick={() => isImage && handleOpenPreview(att)}
                                  className={`text-sm font-bold text-foreground truncate select-none leading-snug ${
                                    isImage ? 'cursor-pointer hover:text-primary hover:underline' : ''
                                  }`}
                                  title={att.originalFileName}
                                >
                                  {att.originalFileName}
                                </h4>
                                {att.notes && (
                                  <p className="text-xs text-muted-foreground/80 font-medium italic line-clamp-2 leading-relaxed">
                                    {att.notes}
                                  </p>
                                )}
                              </div>

                              {/* Badges de Metadados */}
                              <div className="flex flex-wrap gap-1.5">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold tracking-wider uppercase border ${
                                  att.mimeType === 'application/pdf'
                                    ? 'bg-rose-500/5 text-rose-600 border-rose-500/10'
                                    : 'bg-indigo-500/5 text-indigo-600 border-indigo-500/10'
                                }`}>
                                  {att.mimeType === 'application/pdf' ? 'Documento PDF' : 'IMAGEM'}
                                </span>

                                {att.clinicalRecordId && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold tracking-wider uppercase bg-emerald-500/5 text-emerald-600 border border-emerald-500/10">
                                    Vínculo Clínico
                                  </span>
                                )}
                              </div>

                              {/* Tamanho e Data */}
                              <div className="flex items-center gap-2.5 text-[10px] text-muted-foreground/85 font-semibold">
                                <span className="flex items-center gap-1">
                                  {displaySize}
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  {att.createdAt ? formatDisplayDate(att.createdAt, false) : ''}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Ações */}
                          <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between">
                            <div className="text-[10px] text-muted-foreground/60 font-semibold select-none">
                              {att.mimeType.split('/')[1]?.toUpperCase()}
                            </div>
                            <div className="flex items-center gap-2">
                              {isImage && (
                                <Button
                                  onClick={() => handleOpenPreview(att)}
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 text-xs font-bold text-primary hover:bg-primary/10 hover:text-primary px-3 rounded-lg flex items-center gap-1"
                                >
                                  Visualizar
                                </Button>
                              )}
                              <Button
                                onClick={() => handleDownloadAttachment(att)}
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg"
                                title="Baixar arquivo"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button
                                onClick={() => handleDeleteAttachment(att.id, att.originalFileName)}
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                                title="Remover anexo"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Coluna Lateral (1/3) */}
        <div className="space-y-6">
          {/* Card 1: Alergias */}
          <Card className="border-border bg-card">
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-border/60 pb-4">
                <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-rose-500" />
                  Alergias / Alertas
                </h2>
                <Button
                  onClick={() => setIsAllergyModalOpen(true)}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-primary hover:bg-primary/10 rounded-lg animate-pulse"
                  title="Adicionar Alergia"
                >
                  <Plus className="h-4.5 w-4.5" />
                </Button>
              </div>

              {!pet.allergies || pet.allergies.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center space-y-2 bg-muted/20 border border-dashed border-border rounded-xl p-4">
                  <AlertCircle className="h-8 w-8 text-muted-foreground/45" />
                  <p className="text-xs font-semibold text-muted-foreground">Nenhuma alergia ou contraindicação registrada.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {pet.allergies.map((allergy) => (
                    <div
                      key={allergy.id}
                      className="group/allergy flex items-center justify-between gap-3 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/15 rounded-xl px-4 py-2.5 transition-colors"
                    >
                      <span className="text-sm font-bold text-rose-600 dark:text-rose-400 truncate">
                        {allergy.name}
                      </span>
                      <button
                        onClick={() => handleDeleteAllergy(allergy.id)}
                        className="opacity-0 group-hover/allergy:opacity-100 h-7 w-7 rounded-lg hover:bg-rose-500/20 text-rose-500 flex items-center justify-center transition-all"
                        title="Remover Alergia"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card 2: Vacinas (Wave 2 & Fase 14B.2) */}
          <Card className="border-border bg-card">
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-border/60 pb-4">
                <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                  <Syringe className="h-5 w-5 text-indigo-500" />
                  Vacinas
                </h2>
                <div className="flex items-center gap-1">
                  <Button
                    onClick={handleExportCertificate}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-primary hover:bg-primary/10 rounded-lg"
                    title="Exportar Certificado"
                    disabled={isExporting}
                  >
                    <FileText className="h-4.5 w-4.5" />
                  </Button>
                  <Button
                    onClick={() => {
                      loadProtocolsForApply()
                      setIsApplyProtocolModalOpen(true)
                    }}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-primary hover:bg-primary/10 rounded-lg animate-pulse"
                    title="Aplicar Protocolo"
                  >
                    <ClipboardList className="h-4.5 w-4.5" />
                  </Button>
                  <Button
                    onClick={() => setIsVaccineModalOpen(true)}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-primary hover:bg-primary/10 rounded-lg"
                    title="Adicionar Vacina"
                  >
                    <Plus className="h-4.5 w-4.5" />
                  </Button>
                </div>
              </div>

              {(() => {
                const vaccineRecords = pet.vaccineRecords || []
                const applied = vaccineRecords.filter(vac => vac.status === 'APPLIED' || !vac.status)
                const scheduled = vaccineRecords.filter(vac => vac.status === 'SCHEDULED')

                if (vaccineRecords.length === 0) {
                  return (
                    <div className="flex flex-col items-center justify-center py-6 text-center space-y-2 bg-muted/20 border border-dashed border-border rounded-xl p-4">
                      <Syringe className="h-8 w-8 text-muted-foreground/45" />
                      <p className="text-xs font-semibold text-muted-foreground">Nenhum registro de vacinação cadastrado.</p>
                    </div>
                  )
                }

                return (
                  <div className="space-y-6">
                    {/* Vacinas Agendadas */}
                    {scheduled.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-[10px] text-amber-500 font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping" />
                          Próximas Doses (Agendadas)
                        </h4>
                        <div className="flex flex-col gap-3">
                          {scheduled.map((vac) => {
                            const isAvailable = isDoseAvailable(vac, vaccineRecords)

                            return (
                              <div
                                key={vac.id}
                                className={`group/vaccine flex flex-col justify-between rounded-xl px-4 py-3 space-y-2 transition-all ${
                                  isAvailable
                                    ? 'bg-amber-500/5 border border-amber-500/15 hover:bg-card hover:border-amber-500/25'
                                    : 'bg-muted/30 border border-border/50 opacity-80'
                                }`}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-sm font-bold text-foreground truncate">{vac.name}</span>
                                  <div className="flex items-center gap-1 opacity-0 group-hover/vaccine:opacity-100 transition-all">
                                    <button
                                      disabled={!isAvailable}
                                      onClick={() => isAvailable && openApplyDoseModal(vac.id, vac.name)}
                                      className={`h-6 w-6 rounded-md flex items-center justify-center transition-all ${
                                        isAvailable
                                          ? 'hover:bg-primary/10 text-primary cursor-pointer'
                                          : 'text-muted-foreground/30 cursor-not-allowed'
                                      }`}
                                      title={isAvailable ? "Registrar Aplicação" : "Esta dose não pode ser aplicada ainda. Existem etapas anteriores pendentes."}
                                    >
                                      <Plus className="h-4 w-4" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteVaccine(vac.id)}
                                      className="h-6 w-6 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive flex items-center justify-center transition-all cursor-pointer"
                                      title="Remover Agendamento"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </div>
                                
                                <div className="flex flex-col text-[10px] text-muted-foreground font-semibold space-y-1">
                                  <span>Previsão: <strong className="text-amber-500 font-extrabold">{formatDisplayDate(vac.date, false)}</strong></span>
                                  {isAvailable ? (
                                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-extrabold">
                                      🟢 Disponível para aplicação
                                    </span>
                                  ) : (
                                    <span className="flex items-center gap-1 text-amber-600 dark:text-amber-500/80 font-extrabold">
                                      🔒 Aguardando etapas anteriores
                                    </span>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Vacinas Aplicadas */}
                    {applied.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-[10px] text-emerald-500 font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Histórico de Aplicações
                        </h4>
                        <div className="flex flex-col gap-3">
                          {applied.map((vac) => (
                            <div
                              key={vac.id}
                              className="group/vaccine flex flex-col justify-between bg-muted/30 border border-border/80 rounded-xl px-4 py-3 space-y-2 transition-all hover:bg-card hover:border-primary/25"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-sm font-bold text-foreground truncate">{vac.name}</span>
                                <button
                                  onClick={() => handleDeleteVaccine(vac.id)}
                                  className="opacity-0 group-hover/vaccine:opacity-100 h-6 w-6 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive flex items-center justify-center transition-all cursor-pointer"
                                  title="Remover Registro"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                              
                              <div className="flex flex-col text-[10px] text-muted-foreground font-semibold space-y-0.5">
                                <span>Aplicação: <strong className="text-foreground">{formatDisplayDate(vac.date, false)}</strong></span>
                                {vac.nextDoseDate && (
                                  <span className="text-indigo-500 font-bold">
                                    Próxima Dose: {formatDisplayDate(vac.nextDoseDate, false)}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })()}
            </CardContent>
          </Card>

          {/* Card 3: Histórico de Peso (Wave 2) */}
          <Card className="border-border bg-card">
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-border/60 pb-4">
                <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                  <Scale className="h-5 w-5 text-emerald-500" />
                  Histórico de Peso
                </h2>
                <Button
                  onClick={() => setIsWeightModalOpen(true)}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-primary hover:bg-primary/10 rounded-lg"
                  title="Adicionar Peso"
                >
                  <Plus className="h-4.5 w-4.5" />
                </Button>
              </div>

              {!pet.weightRecords || pet.weightRecords.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center space-y-2 bg-muted/20 border border-dashed border-border rounded-xl p-4">
                  <Scale className="h-8 w-8 text-muted-foreground/45" />
                  <p className="text-xs font-semibold text-muted-foreground">Nenhuma medição de peso registrada.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
                  {pet.weightRecords.map((w) => (
                    <div
                      key={w.id}
                      className="group/weight flex items-center justify-between gap-3 bg-muted/30 border border-border/80 rounded-xl px-4 py-2.5 transition-all hover:bg-card hover:border-primary/25"
                    >
                      <div className="flex items-baseline gap-1">
                        <span className="text-sm font-extrabold text-foreground">{w.weight}</span>
                        <span className="text-[10px] text-muted-foreground font-semibold">kg</span>
                      </div>
                      
                      <div className="flex items-center gap-2.5">
                        <span className="text-[10px] text-muted-foreground font-semibold">
                          {formatDisplayDate(w.date, false)}
                        </span>
                        <button
                          onClick={() => handleDeleteWeight(w.id)}
                          className="opacity-0 group-hover/weight:opacity-100 h-6 w-6 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive flex items-center justify-center transition-all"
                          title="Remover Medição"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal - Cadastrar Alergia */}
      {isAllergyModalOpen && (
        <Modal title="Adicionar Alergia ou Alerta" onClose={() => setIsAllergyModalOpen(false)}>
          <form onSubmit={handleAddAllergy} className="space-y-5 pt-2">
            <label className="block space-y-2">
              <span className="block text-sm font-semibold text-foreground">Nome da Alergia / Alerta</span>
              <Input
                type="text"
                placeholder="Ex: Alergia a Penicilina, Diabético"
                value={allergyName}
                onChange={(e) => setAllergyName(e.target.value)}
                required
                className="bg-background border-border font-medium h-10"
              />
            </label>

            <div className="pt-4 border-t border-border/60 flex items-center justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => setIsAllergyModalOpen(false)} className="font-semibold">
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary text-primary-foreground font-semibold hover:opacity-90 shadow-sm"
              >
                {isSubmitting ? 'Salvando...' : 'Adicionar Alerta'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal - Registrar Evolução Clínica / Procedimento */}
      {isRecordModalOpen && (
        <Modal title="Registrar Evolução Clínica" onClose={() => setIsRecordModalOpen(false)}>
          <form onSubmit={handleAddRecord} className="space-y-5 pt-2">
            <label className="block space-y-2">
              <span className="block text-sm font-semibold text-foreground">Tipo de Registro</span>
              <select
                className="flex h-10 w-full rounded-lg border border-input bg-card px-3 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-foreground font-bold"
                value={recordType}
                onChange={(e) => setRecordType(e.target.value as 'NOTE' | 'PROCEDURE')}
                required
              >
                <option value="NOTE">Evolução Clínica / Anotação Geral</option>
                <option value="PROCEDURE">Procedimento Ambulatorial / Cirúrgico</option>
              </select>
            </label>

            <label className="block space-y-2">
              <span className="block text-sm font-semibold text-foreground">Título (Opcional)</span>
              <Input
                type="text"
                placeholder="Ex: Retirada de Pontos, Evolução Pós-Operatória"
                value={recordTitle}
                onChange={(e) => setRecordTitle(e.target.value)}
                className="bg-background border-border font-medium h-10"
              />
            </label>

            <label className="block space-y-2">
              <span className="block text-sm font-semibold text-foreground">Descrição Clínica</span>
              <textarea
                className="flex min-h-[140px] w-full rounded-lg border border-input bg-card px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-foreground font-medium"
                placeholder="Descreva detalhadamente a evolução clínica do paciente, medicamentos aplicados, ou o procedimento executado..."
                value={recordContent}
                onChange={(e) => setRecordContent(e.target.value)}
                required
              />
            </label>

            <div className="space-y-2">
              <span className="block text-sm font-semibold text-foreground">Anexo Opcional (PDF, Imagem - Máx 10MB)</span>
              {!selectedFileForRecord ? (
                <div className="border border-dashed border-border/80 hover:border-primary/50 transition-colors rounded-lg p-4 text-center cursor-pointer relative bg-background/50">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
                      if (!allowedTypes.includes(file.type)) {
                        setError('Apenas arquivos PDF, JPEG, PNG e WEBP são permitidos.')
                        e.target.value = ''
                        return
                      }
                      if (file.size > 10 * 1024 * 1024) {
                        setError('O tamanho do arquivo não pode exceder 10MB.')
                        e.target.value = ''
                        return
                      }
                      setError('')
                      setSelectedFileForRecord(file)
                    }}
                  />
                  <div className="flex flex-col items-center justify-center gap-1.5 text-muted-foreground">
                    <UploadCloud className="h-5 w-5 text-muted-foreground/85" />
                    <span className="text-xs font-semibold text-foreground/80">Clique para selecionar um arquivo</span>
                    <span className="text-[10px] text-muted-foreground/60">PDF, JPEG, PNG ou WEBP até 10MB</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-lg text-sm">
                  <div className="flex items-center gap-2 text-foreground font-medium truncate">
                    {selectedFileForRecord.type.startsWith('image/') ? (
                      <ImageIcon className="h-4 w-4 text-indigo-500 shrink-0" />
                    ) : (
                      <FileText className="h-4 w-4 text-indigo-500 shrink-0" />
                    )}
                    <span className="truncate max-w-[240px] text-xs font-semibold">{selectedFileForRecord.name}</span>
                    <span className="text-[10px] text-muted-foreground/80 font-normal">
                      ({(selectedFileForRecord.size / (1024 * 1024)).toFixed(2)} MB)
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
                    onClick={() => setSelectedFileForRecord(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-border/60 flex items-center justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => setIsRecordModalOpen(false)} className="font-semibold">
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary text-primary-foreground font-semibold hover:opacity-90 shadow-sm"
              >
                {isSubmitting ? 'Salvando...' : 'Salvar Registro'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal - Cadastrar Vacina (Wave 2) */}
      {isVaccineModalOpen && (
        <Modal title="Registrar Aplicação de Vacina" onClose={() => setIsVaccineModalOpen(false)}>
          <form onSubmit={handleAddVaccine} className="space-y-5 pt-2">
            <label className="block space-y-2">
              <span className="block text-sm font-semibold text-foreground">Nome da Vacina</span>
              <Input
                type="text"
                placeholder="Ex: Vacina V10, Antirrábica"
                value={vaccineName}
                onChange={(e) => setVaccineName(e.target.value)}
                required
                className="bg-background border-border font-medium h-10"
              />
            </label>

            <label className="block space-y-2">
              <span className="block text-sm font-semibold text-foreground">Data de Aplicação</span>
              <Input
                type="date"
                value={vaccineDate}
                onChange={(e) => setVaccineDate(e.target.value)}
                required
                className="bg-background border-border font-medium h-10"
              />
            </label>

            <label className="block space-y-2">
              <span className="block text-sm font-semibold text-foreground">Próxima Dose (Opcional)</span>
              <Input
                type="date"
                value={vaccineNextDoseDate}
                onChange={(e) => setVaccineNextDoseDate(e.target.value)}
                className="bg-background border-border font-medium h-10"
              />
            </label>

            <div className="pt-4 border-t border-border/60 flex items-center justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => setIsVaccineModalOpen(false)} className="font-semibold">
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary text-primary-foreground font-semibold hover:opacity-90 shadow-sm"
              >
                {isSubmitting ? 'Salvando...' : 'Registrar Vacina'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal - Cadastrar Medição de Peso (Wave 2) */}
      {isWeightModalOpen && (
        <Modal title="Registrar Medição de Peso" onClose={() => setIsWeightModalOpen(false)}>
          <form onSubmit={handleAddWeight} className="space-y-5 pt-2">
            <label className="block space-y-2">
              <span className="block text-sm font-semibold text-foreground">Peso (kg)</span>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="Ex: 12.45"
                value={weightValue}
                onChange={(e) => setWeightValue(e.target.value)}
                required
                className="bg-background border-border font-medium h-10"
              />
            </label>

            <label className="block space-y-2">
              <span className="block text-sm font-semibold text-foreground">Data da Medição</span>
              <Input
                type="date"
                value={weightDate}
                onChange={(e) => setWeightDate(e.target.value)}
                required
                className="bg-background border-border font-medium h-10"
              />
            </label>

            <div className="pt-4 border-t border-border/60 flex items-center justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => setIsWeightModalOpen(false)} className="font-semibold">
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary text-primary-foreground font-semibold hover:opacity-90 shadow-sm"
              >
                {isSubmitting ? 'Salvando...' : 'Registrar Peso'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal - Aplicar Protocolo Vacinal */}
      {isApplyProtocolModalOpen && (
        <Modal title="Aplicar Protocolo Vacinal" onClose={() => setIsApplyProtocolModalOpen(false)}>
          <form onSubmit={handleApplyProtocol} className="space-y-5 pt-2 max-h-[75vh] overflow-y-auto pr-1">
            <label className="block space-y-2">
              <span className="block text-sm font-semibold text-foreground">Escolher Protocolo</span>
              {protocols.length === 0 ? (
                <div className="text-xs text-amber-500 font-semibold p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  Nenhum protocolo compatível com a espécie "{pet.species}" encontrado. Configure novos protocolos nas Configurações da Clínica.
                </div>
              ) : (
                <select
                  className="flex h-10 w-full rounded-lg border border-input bg-card px-3 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-foreground font-bold"
                  value={selectedProtocolId}
                  onChange={(e) => setSelectedProtocolId(e.target.value)}
                  required
                >
                  {protocols.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              )}
            </label>

            <label className="block space-y-2">
              <span className="block text-sm font-semibold text-foreground">Data de Início do Protocolo</span>
              <Input
                type="date"
                value={protocolStartDate}
                onChange={(e) => setProtocolStartDate(e.target.value)}
                required
                className="bg-background border-border font-medium h-10 text-foreground"
              />
            </label>

            {/* Preview of doses */}
            {protocolPreview.length > 0 && (
              <div className="space-y-2.5 border-t border-border/60 pt-4">
                <span className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Pré-visualização das Doses Geradas</span>
                <div className="space-y-2 bg-muted/20 border border-border/60 rounded-xl p-3.5 max-h-[200px] overflow-y-auto">
                  {protocolPreview.map((d, index) => (
                    <div key={index} className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-foreground">
                        <strong className="text-primary font-extrabold mr-1.5">#{d.doseOrder}</strong>
                        {d.name}
                      </span>
                      <span className="text-muted-foreground">
                        {d.date}
                        {d.doseOrder > 1 && ` (+${d.intervalDays}d)`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-border/60 flex items-center justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => setIsApplyProtocolModalOpen(false)} className="font-semibold">
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || protocols.length === 0}
                className="bg-primary text-primary-foreground font-semibold hover:opacity-90 shadow-sm"
              >
                {isSubmitting ? 'Aplicando...' : 'Aplicar Protocolo'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal - Confirmar Aplicação de Dose Agendada */}
      {isConfirmApplyModalOpen && (
        <Modal title={`Aplicar Vacina: ${confirmingVaccineName}`} onClose={() => setIsConfirmApplyModalOpen(false)}>
          <form onSubmit={handleConfirmApplyDose} className="space-y-5 pt-2">
            <label className="block space-y-2">
              <span className="block text-sm font-semibold text-foreground">Data de Aplicação</span>
              <Input
                type="date"
                value={applyDate}
                onChange={(e) => setApplyDate(e.target.value)}
                required
                className="bg-background border-border font-medium h-10 text-foreground"
              />
            </label>

            <div className="grid grid-cols-2 gap-4">
              <label className="block space-y-2">
                <span className="block text-sm font-semibold text-foreground">Lote (Opcional)</span>
                <Input
                  type="text"
                  placeholder="Ex: ABC1234"
                  value={lotNumber}
                  onChange={(e) => setLotNumber(e.target.value)}
                  className="bg-background border-border font-medium h-10 text-foreground"
                />
              </label>

              <label className="block space-y-2">
                <span className="block text-sm font-semibold text-foreground">Fabricante (Opcional)</span>
                <Input
                  type="text"
                  placeholder="Ex: Zoetis, Boehringer"
                  value={manufacturer}
                  onChange={(e) => setManufacturer(e.target.value)}
                  className="bg-background border-border font-medium h-10 text-foreground"
                />
              </label>
            </div>

            <label className="block space-y-2">
              <span className="block text-sm font-semibold text-foreground">Observações Clínicas (Opcional)</span>
              <textarea
                className="flex min-h-[90px] w-full rounded-lg border border-input bg-card px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-foreground font-medium"
                placeholder="Insira detalhes adicionais sobre a aplicação (membro aplicado, reações rápidas, etc)..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </label>

            <div className="flex items-center space-x-2 bg-indigo-500/5 border border-indigo-500/10 rounded-xl px-4 py-3">
              <input
                type="checkbox"
                id="recalculate"
                checked={recalculateSubsequent}
                onChange={(e) => setRecalculateSubsequent(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 bg-background"
              />
              <label htmlFor="recalculate" className="text-xs font-semibold text-foreground cursor-pointer select-none">
                Recalcular automaticamente as datas das próximas doses deste protocolo
              </label>
            </div>

            <div className="pt-4 border-t border-border/60 flex items-center justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => setIsConfirmApplyModalOpen(false)} className="font-semibold">
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary text-primary-foreground font-semibold hover:opacity-90 shadow-sm"
              >
                {isSubmitting ? 'Registrando...' : 'Confirmar Aplicação'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Lightbox para Preview de Imagens */}
      {lightboxUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-sm transition-all duration-200">
          <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
            <span className="text-xs font-semibold text-foreground/80 bg-background/50 backdrop-blur px-3 py-1.5 rounded-full border border-border/40 select-none">
              {lightboxName}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 text-foreground/80 hover:text-foreground hover:bg-background/40 backdrop-blur rounded-full border border-border/40"
              onClick={() => {
                window.URL.revokeObjectURL(lightboxUrl)
                setLightboxUrl(null)
                setLightboxName('')
              }}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="max-w-[90vw] max-h-[85vh] p-2 relative flex items-center justify-center">
            <img
              src={lightboxUrl}
              alt={lightboxName}
              className="max-w-full max-h-[80vh] rounded-lg shadow-2xl object-contain border border-border/30 bg-card/50"
            />
          </div>
        </div>
      )}

      {/* Modais da Wave 3 e 4 (Fase 16B) */}
      {isPrescriptionModalOpen && (
        <CreatePrescriptionModal
          petId={pet.id}
          onClose={() => setIsPrescriptionModalOpen(false)}
          onCreated={async () => {
            setIsPrescriptionModalOpen(false)
            await loadPetData()
          }}
        />
      )}

      {isConsentTermModalOpen && (
        <CreateConsentTermModal
          pet={pet}
          onClose={() => setIsConsentTermModalOpen(false)}
          onCreated={async () => {
            setIsConsentTermModalOpen(false)
            await loadPetData()
          }}
        />
      )}

      {isPrintPreviewOpen && (
        <PrintPreviewModal
          document={selectedDocForPrint}
          type={printDocType}
          onClose={() => {
            setIsPrintPreviewOpen(false)
            setSelectedDocForPrint(null)
          }}
          onSigned={(signedDoc) => {
            setSelectedDocForPrint(signedDoc)
            refreshPetDataSilently()
          }}
        />
      )}
    </div>
  )
}
