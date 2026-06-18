import axios from 'axios'

export const api = axios.create({
  baseURL: 'http://localhost:3000',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('vetos_token')

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



