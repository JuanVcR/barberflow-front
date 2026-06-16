import type { ReactNode } from 'react'
import type { User } from '../../types/models'

interface ProtectedRouteProps {
  children: ReactNode
  user: User | null
  requiredRole?: 'customer' | 'professional' | 'admin'
  fallback: ReactNode
}

export function ProtectedRoute({
  children,
  user,
  requiredRole,
  fallback,
}: ProtectedRouteProps) {
  if (!user) {
    return <>{fallback}</>
  }

  if (requiredRole && user.role !== requiredRole) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
