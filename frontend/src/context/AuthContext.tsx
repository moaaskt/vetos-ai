/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { api } from '../lib/api'

type User = {
  id?: string
  email: string
  role?: string
  clinicId?: string
}

type Clinic = {
  id?: string
  name: string
}

type AuthContextValue = {
  token: string | null
  user: User | null
  clinic: Clinic | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (clinicName: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const TOKEN_KEY = 'vetos_token'
const USER_KEY = 'vetos_user'
const CLINIC_KEY = 'vetos_clinic'

function decodeUser(token: string): User | null {
  const [, payload] = token.split('.')

  if (!payload) {
    return null
  }

  try {
    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/')
    const decoded = JSON.parse(window.atob(normalizedPayload)) as {
      email?: string
      role?: string
      clinicId?: string
      sub?: string
    }

    if (!decoded.email) {
      return null
    }

    return {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
      clinicId: decoded.clinicId,
    }
  } catch {
    return null
  }
}

function readJson<T>(key: string): T | null {
  const value = localStorage.getItem(key)

  if (!value) {
    return null
  }

  try {
    return JSON.parse(value) as T
  } catch {
    localStorage.removeItem(key)
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = readJson<User>(USER_KEY)
    return storedUser ?? decodeUser(localStorage.getItem(TOKEN_KEY) ?? '')
  })
  const [clinic, setClinic] = useState<Clinic | null>(() => readJson<Clinic>(CLINIC_KEY))

  const persistSession = useCallback(
    (nextToken: string, nextUser: User | null, nextClinic: Clinic | null) => {
      localStorage.setItem(TOKEN_KEY, nextToken)
      setToken(nextToken)

      if (nextUser) {
        localStorage.setItem(USER_KEY, JSON.stringify(nextUser))
        setUser(nextUser)
      }

      if (nextClinic) {
        localStorage.setItem(CLINIC_KEY, JSON.stringify(nextClinic))
        setClinic(nextClinic)
      }
    },
    [],
  )

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await api.post<{ access_token: string }>('/auth/login', {
        email,
        password,
      })
      const nextToken = response.data.access_token
      persistSession(nextToken, decodeUser(nextToken), null)
    },
    [persistSession],
  )

  const register = useCallback(
    async (clinicName: string, email: string, password: string) => {
      const response = await api.post<{
        access_token: string
        user?: User
        clinic?: Clinic
      }>('/auth/register', {
        clinicName,
        email,
        password,
      })
      const nextToken = response.data.access_token
      persistSession(
        nextToken,
        response.data.user ?? decodeUser(nextToken),
        response.data.clinic ?? { name: clinicName },
      )
    },
    [persistSession],
  )

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    localStorage.removeItem(CLINIC_KEY)
    setToken(null)
    setUser(null)
    setClinic(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      clinic,
      isAuthenticated: Boolean(token),
      login,
      register,
      logout,
    }),
    [clinic, login, logout, register, token, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
