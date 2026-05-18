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

export type Pet = {
  id: string
  name: string
  species: string
  breed?: string | null
  age?: number | null
  clientId: string
  client?: Client
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
