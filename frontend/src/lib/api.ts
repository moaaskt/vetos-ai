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

export type VaccineRecord = {
  id: string
  name: string
  date: string
  nextDoseDate?: string | null
  petId: string
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
