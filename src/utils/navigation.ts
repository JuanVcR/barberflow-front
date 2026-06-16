export function getHashPath() {
  return window.location.hash.replace(/^#/, '') || '/'
}

export function getPathSegments() {
  return getHashPath()
    .split('?')[0]
    .split('/')
    .filter(Boolean)
}

export function getQueryParams() {
  const parts = getHashPath().split('?')
  return new URLSearchParams(parts[1] || '')
}

export function navigateTo(path: string) {
  const nextPath = path.startsWith('/') ? path : '/' + path
  window.location.hash = nextPath
}

export function getDashboardPathForRole(role?: string, accountRole?: string) {
  if (accountRole === 'SUPER_ADMIN') return '/admin/super-admin'
  if (accountRole === 'BARBERSHOP_ADMIN') return '/admin/barbershop-dashboard'
  if (accountRole === 'BARBER' || role === 'professional') return '/professional/agenda'
  if (accountRole === 'CLIENT' || role === 'customer') return '/customer/appointments'
  if (role === 'admin') return '/admin/barbershop-dashboard'
  return '/'
}
