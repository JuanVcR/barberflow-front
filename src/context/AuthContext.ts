import { createContext } from 'react'
import type { User } from '../types/models'

export interface AuthContextValue {
  user: User | null
  partnerUser: User | null
  isAuthenticated: boolean
  isPartnerAuthenticated: boolean
  login: (email: string, password: string) => Promise<User>
  register: (name: string, email: string, phone: string, password: string) => Promise<User>
  loginPartner: (email: string, password: string) => Promise<User>
  logout: () => Promise<void>
  updateProfile: (payload: Pick<User, 'name' | 'email' | 'phone'>) => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
