export interface User {
  id: string
  name: string
  email: string
  phone: string
  role: 'customer' | 'professional' | 'admin'
  accountRole?: 'CLIENT' | 'BARBER' | 'BARBERSHOP_ADMIN' | 'SUPER_ADMIN'
}

export interface Barber {
  id: string
  name: string
  photo?: string
}

export interface Service {
  id: string
  name: string
  description: string
  price: number
  duration: number
  image: string
  barberIds?: string[]
}

export interface Barbershop {
  id: string
  slug: string
  name: string
  description: string
  address: string
  phone: string
  email: string
  image: string
  rating: number
  workingHours: {
    start: string
    end: string
  }
  services: Service[]
  professionals: Barber[]
  barbers: Barber[]
}

export interface Booking {
  id: string
  barbershopId: string
  barbershopName: string
  serviceId: string
  serviceName: string
  services?: Array<{
    id: string
    name: string
    price: number
    duration: number
  }>
  barberId: string
  barberName: string
  clientName?: string
  amountPaid?: number | null
  endTime?: string
  date: string
  time: string
  userId: string
  status: 'pending' | 'confirmed' | 'SCHEDULED' | 'CANCELLED' | 'COMPLETED'
}

export interface ToastMessage {
  id: string
  tone: 'success' | 'error' | 'info' | 'warning' | 'loading'
  title?: string
  text: string
  actionLabel?: string
  actionPath?: string
}

export type AppRoute =
  | { name: 'landing' }
  | { name: 'public-barbershops'; search?: string }
  | { name: 'public-barbershop-details'; slug: string }
  | { name: 'auth-login' }
  | { name: 'auth-register' }
  | { name: 'auth-forgot-password' }
  | { name: 'auth-professional-login' }
  | { name: 'auth-professional-register' }
  | { name: 'auth-barber-invite'; token?: string }
  | { name: 'customer-explore' }
  | { name: 'customer-appointments' }
  | { name: 'customer-booking'; barbershopId: string; serviceId?: string }
  | { name: 'customer-profile' }
  | { name: 'professional-dashboard' }
  | { name: 'professional-schedule' }
  | { name: 'professional-current' }
  | { name: 'professional-services' }
  | { name: 'professional-availability' }
  | { name: 'professional-blocking' }
  | { name: 'professional-agenda' }
  | { name: 'professional-quick-booking' }
  | { name: 'professional-reports' }
  | { name: 'professional-history' }
  | { name: 'professional-availability-new' }
  | { name: 'professional-profile' }
  | { name: 'admin-dashboard' }
  | { name: 'admin-barbershops' }
  | { name: 'admin-services'; barbershopId?: string }
  | { name: 'admin-working-hours'; barbershopId?: string }
  | { name: 'admin-team' }
  | { name: 'admin-reports' }
  | { name: 'admin-settings' }
  | { name: 'admin-super' }
  | { name: 'admin-super-section'; section: 'barbershops' | 'registrations' | 'plans' | 'financial-reports' | 'users' | 'settings' }
  | { name: 'admin-barbershop-dashboard' }
  | { name: 'admin-week-agenda' }
  | { name: 'admin-quick-booking' }
  | { name: 'admin-barber-management' }
  | { name: 'admin-barber-day'; barberId: string; barbershopId: string; barberName?: string }
  | { name: 'admin-barber-history'; barberId: string; barbershopId: string; barberName?: string }
  | { name: 'admin-barber-invites' }
  | { name: 'admin-service-management' }
  | { name: 'admin-barbershop-section'; section: 'appointments' | 'working-hours' | 'customers' | 'settings' | 'reports' }
  | { name: 'booking-detail'; bookingId: string }
  | { name: 'auth-reset-password'; token?: string }
  | { name: 'home' }
  | { name: 'login' }
  | { name: 'register' }
  | { name: 'barbershops' }
  | { name: 'barbershop-details'; slug: string }
  | { name: 'booking'; barbershopId: string; serviceId?: string }
  | { name: 'account' }
  | { name: 'partner-login' }
  | { name: 'partner-create' }
