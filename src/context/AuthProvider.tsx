import {
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { User } from '../types/models'
import {
  buildUserFromLogin,
  buildUserFromRegister,
  loginUser,
  logoutUser,
  registerUser,
} from '../services/backend'
import { clearAuthToken, clearRefreshToken } from '../services/api'
import { AuthContext, type AuthContextValue } from './AuthContext'

const customerUserKey = 'customer-user'
const partnerUserKey = 'partner-user'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem(customerUserKey)
    return storedUser ? (JSON.parse(storedUser) as User) : null
  })
  const [partnerUser, setPartnerUser] = useState<User | null>(() => {
    const storedPartner = localStorage.getItem(partnerUserKey)
    return storedPartner ? (JSON.parse(storedPartner) as User) : null
  })

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      partnerUser,
      isAuthenticated: Boolean(user),
      isPartnerAuthenticated: Boolean(partnerUser),
      login: async (email: string, password: string) => {
        const result = await loginUser({ email, password })
        const storedUser = localStorage.getItem(customerUserKey)
        const previous = storedUser ? (JSON.parse(storedUser) as User) : null
        const nextUser = buildUserFromLogin(email, previous?.name, result.account)
        setUser(nextUser)
        localStorage.setItem(customerUserKey, JSON.stringify(nextUser))
        return nextUser
      },
      register: async (name: string, email: string, phone: string, password: string) => {
        const registered = await registerUser({ name, email, phone, password })
        await loginUser({ email, password })
        const nextUser = buildUserFromRegister(registered)
        setUser(nextUser)
        localStorage.setItem(customerUserKey, JSON.stringify(nextUser))
        return nextUser
      },
      loginPartner: async (email: string, password: string) => {
        const result = await loginUser({ email, password })
        const nextUser = buildUserFromLogin(email, undefined, result.account)
        setPartnerUser(nextUser)
        localStorage.setItem(partnerUserKey, JSON.stringify(nextUser))
        return nextUser
      },
      logout: async () => {
        try {
          await logoutUser()
        } finally {
          setUser(null)
          setPartnerUser(null)
          clearAuthToken()
          clearRefreshToken()
          localStorage.removeItem(customerUserKey)
          localStorage.removeItem(partnerUserKey)
        }
      },
      updateProfile: (payload) => {
        if (!user) return
        const nextUser = { ...user, ...payload }
        setUser(nextUser)
        localStorage.setItem(customerUserKey, JSON.stringify(nextUser))
      },
    }),
    [partnerUser, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
