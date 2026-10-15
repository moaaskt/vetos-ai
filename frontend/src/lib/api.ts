import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
})

api.interceptors.request.use((config) => {
  const isTutorRequest = config.url?.startsWith('/tutor');
  const token = isTutorRequest
    ? localStorage.getItem('tutor_access_token')
    : localStorage.getItem('vetos_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export type DashboardStats = {
  totalClients: number
  totalPets: number
  totalAppointments: number
}

export type Client = {
  id: string
  name: string
  email?: string | null
  phone?: string | null
  createdAt?: string

  // Novos campos estruturados
  cpf?: string | null
  rg?: string | null
  birthDate?: string | null
  whatsapp?: string | null
  emailAlt?: string | null
  emergencyName?: string | null
  emergencyPhone?: string | null
  postalCode?: string | null
  street?: string | null
  number?: string | null
  complement?: string | null
  neighborhood?: string | null
  city?: string | null
  state?: string | null
}

export type Allergy = {
  id: string
  name: string
  petId: string
  createdAt?: string
}

export type ClinicalRecordType = 'NOTE' | 'PROCEDURE'

export type ClinicalRecord = {
  id: string
  type: ClinicalRecordType
  title?: string | null
  content: string
  date: string
  petId: string
}

export type WeightRecord = {
  id: string
  weight: number
  date: string
  petId: string
}

export type VaccineProtocolDose = {
  id: string
  protocolId: string
  vaccineName: string
  doseOrder: number
  intervalDays: number
}

export type VaccineRecord = {
  id: string
  name: string
  date: string
  nextDoseDate?: string | null
  status?: 'APPLIED' | 'SCHEDULED'
  lotNumber?: string | null
  manufacturer?: string | null
  appliedById?: string | null
  notes?: string | null
  petId: string
  protocolId?: string | null
  protocolDoseId?: string | null
  protocolDose?: VaccineProtocolDose | null
}

export type Pet = {
  id: string
  name: string
  species: string
  breed?: string | null
  age?: number | null
  clientId: string
  client?: Client
  appointments?: Appointment[]
  allergies?: Allergy[]
  clinicalRecords?: ClinicalRecord[]
  weightRecords?: WeightRecord[]
  vaccineRecords?: VaccineRecord[]
  clinicalAttachments?: ClinicalAttachment[]
  prescriptions?: Prescription[]
  consentTerms?: ConsentTerm[]
}

export type AppointmentStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED'

export type Appointment = {
  id: string
  scheduledAt: string
  date?: string
  reason?: string | null
  status: AppointmentStatus
  petId: string
  clientId: string
  pet?: Pet
  client?: Client
}

export type CreateAppointmentPayload = {
  scheduledAt: string
  petId: string
  clientId: string
  reason?: string
  status?: AppointmentStatus
}

export type DashboardActivity = {
  id: string
  type: 'client' | 'pet' | 'appointment' | 'clinicalRecord' | 'allergy' | 'vaccine' | 'weightRecord'
  text: string
  date: string
}

export type AnalyticsOverview = {
  appointmentsToday: number
  appointmentsThisWeek: number
  appointmentsByStatus: {
    SCHEDULED: number
    COMPLETED: number
    CANCELLED: number
  }
  totalClients: number
  totalPets: number
  upcomingVaccinesNext7Days: number
  inactiveClients90Days: number
  notificationsLast7Days: {
    sent: number
    failed: number
    byChannel: {
      EMAIL: number
      WHATSAPP: number
    }
  }
}

export type AnalyticsTrends = {
  appointmentsTrend: { date: string; count: number }[]
  notificationsTrend: { date: string; sent: number; failed: number }[]
  notificationsByChannel: {
    EMAIL: number
    WHATSAPP: number
  }
  upcomingVaccinesList: (VaccineRecord & {
    pet: Pet & {
      client: Client
    }
  })[]
  inactiveClientsList: {
    id: string
    name: string
    email?: string | null
    phone?: string | null
    lastActiveDate: string
    hasAppointments: boolean
  }[]
}

export type ClinicalAttachment = {
  id: string
  clinicId: string
  petId: string
  clinicalRecordId?: string | null
  originalFileName: string
  storedFileName: string
  mimeType: string
  fileSize: number
  storagePath: string
  uploadedById?: string | null
  notes?: string | null
  createdAt?: string
}

export type DocumentStatus = 'DRAFT' | 'SIGNED'

export type Prescription = {
  id: string
  medicamento: string
  dosagem: string
  frequencia: string
  duracao: string
  viaAdministracao: string
  observacoes?: string | null
  status: DocumentStatus
  documentHash?: string | null
  signedAt?: string | null
  verificationUrl?: string | null
  verificationQrCode?: string | null
  lastSharedAt?: string | null
  petId: string
  clinicId: string
  clinicalRecordId?: string | null
  appointmentId?: string | null
  createdAt?: string
  updatedAt?: string
}

export type ConsentTemplate = {
  id: string
  clinicId: string
  name: string
  procedureType: string
  baseText: string
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

export type ConsentTerm = {
  id: string
  petId: string
  clinicId: string
  appointmentId?: string | null
  consentTemplateId?: string | null
  finalText: string
  status: DocumentStatus
  documentHash?: string | null
  signedAt?: string | null
  verificationUrl?: string | null
  verificationQrCode?: string | null
  lastSharedAt?: string | null
  tutorSigned?: boolean
  tutorSignedAt?: string | null
  tutorSignatureName?: string | null
  tutorSignatureCpf?: string | null
  tutorSignatureIp?: string | null
  tutorSignatureUserAgent?: string | null
  createdAt?: string
  updatedAt?: string
}

export type DiagnosticHypothesis = {
  name: string
  cidV: string
  probability: 'ALTA' | 'MEDIA' | 'BAIXA'
  justification: string
}

export type RecommendedExam = {
  name: string
  priority: 'ESSENCIAL' | 'COMPLEMENTAR'
  reason: string
}

export type ClinicalCopilotSuggestion = {
  success: boolean
  source: 'GROQ_AI' | 'FALLBACK'
  summary: string
  urgencyLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  differentialDiagnoses: DiagnosticHypothesis[]
  recommendedExams: RecommendedExam[]
  riskAlerts: string[]
  suggestedConduct: string[]
}

export type NoShowRiskEvaluation = {
  score: number
  level: 'LOW' | 'MEDIUM' | 'HIGH'
  explanation: string
  recommendation: string
  stats: {
    totalPastAppointments: number
    noShowCount: number
    cancelledCount: number
    completedCount: number
    absenceRatePercentage: number
  }
}

export type ReengagementCandidate = {
  clientId: string
  clientName: string
  phone: string | null
  whatsapp: string | null
  email: string | null
  petId: string
  petName: string
  species: string
  breed: string | null
  daysInactive: number
  lastVisitDate: string
}

export type ReengagementBatchResult = {
  clinicId: string
  processedCount: number
  enqueuedCount: number
  skippedQuotaCount: number
  errors: string[]
}

export const aiApi = {
  async suggestCopilot(
    petId: string,
    symptoms: string,
    additionalNotes?: string,
  ): Promise<ClinicalCopilotSuggestion> {
    const res = await api.post<ClinicalCopilotSuggestion>(
      '/ai/clinical-copilot/suggest',
      {
        petId,
        symptoms,
        additionalNotes,
      },
    )
    return res.data
  },

  async getNoShowRisk(appointmentId: string): Promise<NoShowRiskEvaluation> {
    const res = await api.get<NoShowRiskEvaluation>(
      `/ai/no-show-risk/${appointmentId}`,
    )
    return res.data
  },

  async getReengagementCandidates(
    limit = 20,
  ): Promise<ReengagementCandidate[]> {
    const res = await api.get<ReengagementCandidate[]>(
      '/ai/reengagement/candidates',
      {
        params: { limit },
      },
    )
    return res.data
  },

  async triggerReengagementBatch(
    limit = 10,
  ): Promise<ReengagementBatchResult> {
    const res = await api.post<ReengagementBatchResult>(
      '/ai/reengagement/trigger-batch',
      null,
      {
        params: { limit },
      },
    )
    return res.data
  },
}




