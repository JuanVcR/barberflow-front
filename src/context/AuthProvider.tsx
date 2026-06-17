import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { User } from '../types/models'
import {
  buildUserFromCurrentAccount,
  buildUserFromLogin,
  buildUserFromRegister,
  fetchCurrentAccount,
  loginUser,
  logoutUser,
  registerUser,
} from '../services/backend'
import { clearAuthToken, clearRefreshToken } from '../services/api'
import { AuthContext, type AuthContextValue } from './AuthContext'

const customerUserKey = 'customer-user'
const partnerUserKey = 'partner-user'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [partnerUser, setPartnerUser] = useState<User | null>(null)
  const [isAuthReady, setIsAuthReady] = useState(false)

  useEffect(() => {
    let isMounted = true

    const clearStoredSession = () => {
      setUser(null)
      setPartnerUser(null)
      clearAuthToken()
      clearRefreshToken()
      localStorage.removeItem(customerUserKey)
      localStorage.removeItem(partnerUserKey)
    }

    const restoreSession = async () => {
      const storedUser = localStorage.getItem(customerUserKey)
      const storedPartner = localStorage.getItem(partnerUserKey)

      if (!storedUser && !storedPartner) {
        setIsAuthReady(true)
        return
      }

      try {
        const previous = storedUser || storedPartner
          ? JSON.parse(storedUser ?? storedPartner ?? '{}') as User
          : null
        const account = await fetchCurrentAccount()
        const restoredUser = buildUserFromCurrentAccount(account, previous?.name)

        if (!isMounted) return

        if (account.role === 'CLIENT') {
          setUser(restoredUser)
          setPartnerUser(null)
          localStorage.setItem(customerUserKey, JSON.stringify(restoredUser))
          localStorage.removeItem(partnerUserKey)
        } else {
          setPartnerUser(restoredUser)
          setUser(null)
          localStorage.setItem(partnerUserKey, JSON.stringify(restoredUser))
          localStorage.removeItem(customerUserKey)
        }
      } catch {
        if (isMounted) clearStoredSession()
      } finally {
        if (isMounted) setIsAuthReady(true)
      }
    }

    const handleAuthExpired = () => {
      clearStoredSession()
      setIsAuthReady(true)
    }

    void restoreSession()
    window.addEventListener('barberflow-auth-expired', handleAuthExpired)

    return () => {
      isMounted = false
      window.removeEventListener('barberflow-auth-expired', handleAuthExpired)
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      partnerUser,
      isAuthReady,
      isAuthenticated: Boolean(user),
      isPartnerAuthenticated: Boolean(partnerUser),
      login: async (email: string, password: string) => {
        const result = await loginUser({ email, password })
        const storedUser = localStorage.getItem(customerUserKey)
        const previous = storedUser ? (JSON.parse(storedUser) as User) : null
        const nextUser = buildUserFromLogin(email, previous?.name, result.account)
        setUser(nextUser)
        setPartnerUser(null)
        localStorage.setItem(customerUserKey, JSON.stringify(nextUser))
        localStorage.removeItem(partnerUserKey)
        return nextUser
      },
      register: async (name: string, email: string, phone: string, password: string) => {
        const registered = await registerUser({ name, email, phone, password })
        await loginUser({ email, password })
        const nextUser = buildUserFromRegister(registered)
        setUser(nextUser)
        setPartnerUser(null)
        localStorage.setItem(customerUserKey, JSON.stringify(nextUser))
        localStorage.removeItem(partnerUserKey)
        return nextUser
      },
      loginPartner: async (email: string, password: string) => {
        const result = await loginUser({ email, password })
        const nextUser = buildUserFromLogin(email, undefined, result.account)
        setPartnerUser(nextUser)
        setUser(null)
        localStorage.setItem(partnerUserKey, JSON.stringify(nextUser))
        localStorage.removeItem(customerUserKey)
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
    [isAuthReady, partnerUser, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
